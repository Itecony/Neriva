const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: function() {
      return !!this.googleId;
    },
    validate: {
      notEmpty: {
        msg: 'First name cannot be empty'
      }
    }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: function() {
      return !!this.googleId;
    },
    validate: {
      notEmpty: {
        msg: 'Last name cannot be empty'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: 'Email address already in use'
    },
    validate: {
      isEmail: {
        msg: 'Must be a valid email address'
      }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: function() {
      return !!this.googleId;
    }
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: true,
    defaultValue: 'user'
  },
  avatar: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  interests: {
    type: DataTypes.ARRAY(DataTypes.TEXT),
    defaultValue: []
  },
  googleId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true
  },
  profilePicture: {
    type: DataTypes.STRING,
    allowNull: true
  },
  authProvider: {
    type: DataTypes.ENUM('local', 'google'),
    defaultValue: 'local',
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: true,
      fields: ['google_id']
    }
  ]
});

// Virtual field for full name
User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Instance method to return user without password
User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  return values;
};

module.exports = User;