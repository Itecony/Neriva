const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('direct', 'group'),
    allowNull: false,
    defaultValue: 'direct'
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'conversations',
  timestamps: true,
  underscored: true
});

module.exports = Conversation;