const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ResourceCompletion = sequelize.define('ResourceCompletion', {
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
  proof_link: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  proof_type: {
    type: DataTypes.ENUM('github', 'deployed_url', 'neriva_project', 'none'),
    allowNull: false,
    defaultValue: 'none'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  completed_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'resource_completions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    { fields: ['user_id', 'resource_id'] },
    { fields: ['user_id'] },
    { fields: ['resource_id'] },
    { fields: ['completed_at'] }
  ],
  validate: {
    proofLinkRequired() {
      if (this.proof_type !== 'none' && !this.proof_link) {
        throw new Error('Proof link required when proof type is specified');
      }
    }
  }
});

module.exports = ResourceCompletion;