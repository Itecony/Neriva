const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PostLike = sequelize.define('PostLike', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  post_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'post_likes',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['post_id', 'user_id'] // Prevent duplicate likes
    }
  ]
});

module.exports = PostLike;
