const { Message, Conversation, ConversationParticipant, User } = require('../models');
const { Op } = require('sequelize');

// Get or create direct conversation
const getOrCreateDirectConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user.id;

    // Find existing direct conversation
    let conversation = await Conversation.findOne({
      where: { type: 'direct' },
      include: [{
        model: User,
        as: 'participants',
        where: { id: [userId, recipientId] },
        through: { attributes: [] }
      }]
    });

    if (conversation && conversation.participants.length === 2) {
      return res.status(200).json({ conversation });
    }

    // Create new conversation
    conversation = await Conversation.create({ type: 'direct' });
    
    await ConversationParticipant.bulkCreate([
      { conversation_id: conversation.id, user_id: userId },
      { conversation_id: conversation.id, user_id: recipientId }
    ]);

    res.status(201).json({ conversation });
  } catch (error) {
    console.error('Get/create conversation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create group conversation
const createGroupConversation = async (req, res) => {
  try {
    const { participantIds, groupName } = req.body;
    const creatorId = req.user.id;

    const conversation = await Conversation.create({
      type: 'group',
      name: groupName
    });

    const participants = [creatorId, ...participantIds];
    await ConversationParticipant.bulkCreate(
      participants.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId
      }))
    );

    res.status(201).json({ conversation });
  } catch (error) {
    console.error('Create group conversation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's conversations
const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.findAll({
      include: [
        {
          model: User,
          as: 'participants',
          attributes: ['id', 'firstName', 'lastName', 'avatar'],
          through: { attributes: [] }
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['created_at', 'DESC']],
          include: [{
            model: User,
            as: 'sender',
            attributes: ['id', 'firstName', 'lastName']
          }]
        }
      ],
      where: {
        id: {
          [Op.in]: await ConversationParticipant.findAll({
            where: { user_id: userId },
            attributes: ['conversation_id']
          }).then(records => records.map(r => r.conversation_id))
        }
      },
      order: [['updated_at', 'DESC']]
    });

    res.status(200).json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get messages in a conversation
const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    // Verify user is participant
    const participant = await ConversationParticipant.findOne({
      where: {
        conversation_id: conversationId,
        user_id: userId
      }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const messages = await Message.findAll({
      where: { conversation_id: conversationId },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'firstName', 'lastName', 'avatar']
      }],
      order: [['created_at', 'ASC']]
    });

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Send message
const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user.id;

    // Verify sender is participant
    const participant = await ConversationParticipant.findOne({
      where: {
        conversation_id: conversationId,
        user_id: senderId
      }
    });

    if (!participant) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const message = await Message.create({
      conversation_id: conversationId,
      sender_id: senderId,
      content
    });

    // Update conversation timestamp
    await Conversation.update(
      { updated_at: new Date() },
      { where: { id: conversationId } }
    );

    res.status(201).json({ message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getOrCreateDirectConversation,
  createGroupConversation,
  getConversations,
  getMessages,
  sendMessage
};