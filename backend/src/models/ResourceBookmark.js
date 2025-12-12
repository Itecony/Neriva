const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ResourceBookmark = sequelize.define('ResourceBookmark', {
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
  status: {
    type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
    allowNull: false,
    defaultValue: 'not_started'
  },
  bookmarked_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  started_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: true
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
  tableName: 'resource_bookmarks',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['user_id', 'resource_id'] },
    { fields: ['user_id'] },
    { fields: ['resource_id'] },
    { fields: ['status'] }
  ]
});

module.exports = ResourceBookmark;