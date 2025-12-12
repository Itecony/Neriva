const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Resource = sequelize.define('Resource', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  mentor_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [5, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [100, 5000]
    }
  },
  resource_type: {
    type: DataTypes.ENUM(
      'article', 'video', 'pdf', 'code_repo',
      'documentation', 'external_course', 'challenge', 'tool'
    ),
    allowNull: false
  },
  url: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  file_path: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 0,
      max: 52428800 // 50MB
    }
  },
  domain: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      isIn: [[
        'Web Development', 'Mobile Development', 'Data Science',
        'Machine Learning', 'UI/UX Design', 'DevOps', 'Cybersecurity',
        'Game Development', 'Blockchain', 'Cloud Computing', 'IoT', 'AR/VR'
      ]]
    }
  },
  difficulty_level: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: false
  },
  estimated_time_minutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10080
    }
  },
  prerequisites: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  learning_outcomes: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [20, 1000]
    }
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
    validate: {
      isValidTags(value) {
        if (!Array.isArray(value)) {
          throw new Error('tags must be an array');
        }
        if (value.length < 3 || value.length > 10) {
          throw new Error('Must have 3-10 tags');
        }
      }
    }
  },
  view_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 }
  },
  bookmark_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 }
  },
  completion_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 }
  },
  average_rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  total_ratings: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 }
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  featured_at: {
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
  tableName: 'resources',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['mentor_id'] },
    { fields: ['domain'] },
    { fields: ['difficulty_level'] },
    { fields: ['resource_type'] },
    { fields: ['is_featured'] },
    { fields: ['average_rating'] },
    { fields: ['created_at'] },
    { type: 'GIN', fields: ['tags'] }
  ],
  validate: {
    hasUrlOrFile() {
      if (!this.url && !this.file_path) {
        throw new Error('Resource must have either URL or file path');
      }
    },
    pdfSizeLimit() {
      if (this.resource_type === 'pdf' && this.file_size && this.file_size > 52428800) {
        throw new Error('PDF files must be 50MB or less');
      }
    },
    videoMustBeLink() {
      if (this.resource_type === 'video' && !this.url) {
        throw new Error('Video resources must be links');
      }
      if (this.resource_type === 'video' && this.file_path) {
        throw new Error('Video resources cannot be uploaded files');
      }
    }
  }
});

module.exports = Resource;