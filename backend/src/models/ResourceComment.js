const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ResourceComment = sequelize.define('ResourceComment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  resource_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'resources',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  comment_text: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 2000]
    }
  },
  parent_comment_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'resource_comments',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'resource_comments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['resource_id'] },
    { fields: ['user_id'] },
    { fields: ['parent_comment_id'] },
    { fields: ['created_at'] }
  ]
});

module.exports = ResourceComment;