const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MentorApplication = sequelize.define('MentorApplication', {
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
  essay: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [100, 5000]
    }
  },
  selected_projects: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
    validate: {
      isValidProjectArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('selected_projects must be an array');
        }
        if (value.length < 3) {
          throw new Error('Must select at least 3 projects');
        }
      }
    }
  },
  domains: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: [],
    validate: {
      isValidDomainArray(value) {
        if (!Array.isArray(value)) {
          throw new Error('domains must be an array');
        }
        if (value.length < 1) {
          throw new Error('Must select at least one domain');
        }
        const validDomains = [
          'Web Development',
          'Mobile Development',
          'Data Science',
          'Machine Learning',
          'UI/UX Design',
          'DevOps',
          'Cybersecurity',
          'Game Development',
          'Blockchain',
          'Cloud Computing',
          'IoT',
          'AR/VR'
        ];
        const invalidDomains = value.filter(d => !validDomains.includes(d));
        if (invalidDomains.length > 0) {
          throw new Error(`Invalid domains: ${invalidDomains.join(', ')}`);
        }
      }
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending'
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reviewed_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewed_at: {
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
  tableName: 'mentor_applications',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['reviewed_by'] }
  ]
});

module.exports = MentorApplication;