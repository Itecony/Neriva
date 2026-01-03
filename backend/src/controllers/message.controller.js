const { sequelize } = require('../config/database');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const ConversationParticipant = require('../models/ConversationParticipant');
const User = require('../models/User');
const { Op } = require('sequelize');

// Get or create direct conversation
const getOrCreateDirectConversation = async (req, res) => {
  try {
    const { recipientId } = req.body;
    const userId = req.user.id;

    // Validate
    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    if (userId === recipientId) {
      return res.status(400).json({ message: 'Cannot create conversation with yourself' });
    }

    // Find existing direct conversation between these 2 users
    // Get all conversations where current user is a participant
    const userConversations = await ConversationParticipant.findAll({
      where: { user_id: userId },
      attributes: ['conversation_id']
    });

    const conversationIds = userConversations.map(c => c.conversation_id);

    if (conversationIds.length > 0) {
      // Find direct conversation that includes the recipient
      const existingConversation = await Conversation.findOne({
        where: {
          id: conversationIds,
          type: 'direct'
        },
        include: [{
          model: ConversationParticipant,
          as: 'conversationParticipants',
          where: { user_id: recipientId },
          required: true
        }]
      });

      if (existingConversation) {
        // Verify it's only these 2 users
        const participantCount = await ConversationParticipant.count({
          where: { conversation_id: existingConversation.id }
        });

        if (participantCount === 2) {
          return res.status(200).json({ conversation: existingConversation });
        }
      }
    }

    // Create new conversation
    const conversation = await Conversation.create({ type: 'direct' });
    
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

    // Validate
    if (!groupName || !groupName.trim()) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    if (!participantIds || participantIds.length === 0) {
      return res.status(400).json({ message: 'At least one participant is required' });
    }

    const conversation = await Conversation.create({
      type: 'group',
      name: groupName.trim()
    });

    const participants = [creatorId, ...participantIds];
    await ConversationParticipant.bulkCreate(
      participants.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId
      }))
    );

    // Notify all participants via WebSocket
    const io = req.app.get('io');
    participants.forEach(participantId => {
      io.to(`user_${participantId}`).emit('new_conversation', {
        conversation
      });
    });

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
    console.log('Getting conversations for user:', userId);

    // First get conversation IDs
    const participantRecords = await ConversationParticipant.findAll({
      where: { user_id: userId },
      attributes: ['conversation_id']
    });
    
    console.log('Participant records:', participantRecords);
    const conversationIds = participantRecords.map(r => r.conversation_id);
    console.log('Conversation IDs:', conversationIds);

    const conversations = await Conversation.findAll({
      where: {
        id: conversationIds
      },
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
    const { limit = 50, before } = req.query; // Pagination support

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

    // Build query conditions
    const whereConditions = { conversation_id: conversationId };
    
    // If 'before' timestamp provided, get messages before that time (for pagination)
    if (before) {
      whereConditions.created_at = {
        [Op.lt]: new Date(before)
      };
    }

    const messages = await Message.findAll({
      where: whereConditions,
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'firstName', 'lastName', 'avatar']
      }],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit)
    });

    // Reverse to get chronological order
    const chronologicalMessages = messages.reverse();

    res.status(200).json({ 
      messages: chronologicalMessages,
      hasMore: messages.length === parseInt(limit)
    });
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

    console.log('=== SEND MESSAGE DEBUG ===');
    console.log('conversationId:', conversationId, 'Type:', typeof conversationId);
    console.log('senderId:', senderId, 'Type:', typeof senderId);
    console.log('content:', content);

    // Validate input
    if (!conversationId) {
      return res.status(400).json({ message: 'conversationId is required' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'content is required' });
    }

    console.log('About to check participant...');
    
    // Verify sender is participant
    const participant = await ConversationParticipant.findOne({
      where: {
        conversation_id: conversationId,
        user_id: senderId
      }
    });

    console.log('Participant found:', participant);

    if (!participant) {
      return res.status(403).json({ message: 'Not authorized to send messages in this conversation' });
    }

    console.log('Creating message...');
    
    // Create message
    const message = await Message.create({
      conversation_id: conversationId,
      sender_id: senderId,
      content: content.trim()
    });

    console.log('Message created:', message.id);

    // Get full message with sender details
    const fullMessage = await Message.findByPk(message.id, {
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'firstName', 'lastName', 'avatar']
      }]
    });

    // Update conversation timestamp
    await Conversation.update(
      { updated_at: new Date() },
      { where: { id: conversationId } }
    );

    // Broadcast message via WebSocket to all participants in the conversation
    const io = req.app.get('io');
    io.to(`conversation_${conversationId}`).emit('new_message', {
      message: fullMessage
    });

    console.log(`📤 Message broadcast to conversation_${conversationId}`);

    res.status(201).json({ message: fullMessage });
  } catch (error) {
    console.error('Send message error:', error);
    console.error('Error stack:', error.stack);
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