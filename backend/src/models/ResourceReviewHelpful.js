const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ResourceReviewHelpful = sequelize.define('ResourceReviewHelpful', {
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
  review_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'resource_reviews',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'resource_review_helpful',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { unique: true, fields: ['user_id', 'review_id'] },
    { fields: ['review_id'] }
  ]
});

module.exports = ResourceReviewHelpful;