const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ConversationParticipant = sequelize.define('ConversationParticipant', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  conversation_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false
  },
  joined_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  last_read_at: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'conversation_participants',
  timestamps: false,
  underscored: true
});

module.exports = ConversationParticipant;