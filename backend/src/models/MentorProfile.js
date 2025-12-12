const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MentorProfile = sequelize.define('MentorProfile', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  verified_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 1000]
    }
  },
  expertise_domains: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
    validate: {
      isArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('expertise_domains must be an array');
        }
      }
    }
  },
  teaching_style: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  open_to_mentorship: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  mentorship_description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: [0, 500]
    }
  },
  total_resources_created: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 10
    }
  },
  average_resource_rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    defaultValue: null,
    validate: {
      min: 0,
      max: 5
    }
  },
  total_bookmarks_received: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  total_completions_received: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  total_views_received: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
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
  tableName: 'mentor_profiles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { unique: true, fields: ['user_id'] },
    { fields: ['open_to_mentorship'] },
    { fields: ['average_resource_rating'] }
  ]
});

module.exports = MentorProfile;