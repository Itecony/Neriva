const { Message, User } = require('../models');
const { Op } = require('sequelize');

// Get all conversations for a user
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get unique conversation IDs where user is involved
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { sender_id: userId },
          { receiver_id: userId }
        ]
      },
      attributes: ['conversation_id'],
      group: ['conversation_id'],
      raw: true
    });

    const conversationIds = [...new Set(messages.map(m => m.conversation_id))];

    // Get last message for each conversation
    const conversations = await Promise.all(
      conversationIds.map(async (convId) => {
        const lastMessage = await Message.findOne({
          where: { conversation_id: convId },
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'avatar']
            },
            {
              model: User,
              as: 'receiver',
              attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'avatar']
            }
          ],
          order: [['created_at', 'DESC']]
        });

        return {
          conversation_id: convId,
          lastMessage,
          otherUser: lastMessage.sender_id === userId 
            ? lastMessage.receiver 
            : lastMessage.sender
        };
      })
    );

    res.status(200).json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get messages in a specific conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const messages = await Message.findAll({
      where: { conversation_id: conversationId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'avatar']
        }
      ],
      order: [['created_at', 'ASC']]
    });

    // Verify user is part of this conversation
    if (messages.length > 0) {
      const firstMessage = messages[0];
      if (firstMessage.sender_id !== userId && firstMessage.receiver_id !== userId) {
        return res.status(403).json({ message: 'Not authorized to view this conversation' });
      }
    }

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    const senderId = req.user.id;

    if (!receiver_id || !content) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }

    if (receiver_id === senderId) {
      return res.status(400).json({ message: 'Cannot send message to yourself' });
    }

    // Check if receiver exists
    const receiver = await User.findByPk(receiver_id);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    // Create conversation ID (consistent for both users)
    const conversationId = [senderId, receiver_id].sort().join('-');

    const message = await Message.create({
      sender_id: senderId,
      receiver_id,
      conversation_id: conversationId,
      content
    });

    const messageWithUsers = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'avatar']
        }
      ]
    });

    res.status(201).json({ 
      message: 'Message sent successfully', 
      data: messageWithUsers 
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getConversations,
  getMessages,
  sendMessage
};