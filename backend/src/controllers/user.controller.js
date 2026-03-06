const { User, Post, Project, MentorApplication } = require('../models');
const fs = require('fs');
const path = require('path');

// Helper to delete file
const deleteFile = (filePath) => {
  if (!filePath) return;
  const absolutePath = path.resolve(filePath);
  fs.unlink(absolutePath, (err) => {
    if (err) console.error('Error deleting file:', err.message);
  });
};

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        {
          model: MentorApplication,
          as: 'mentorApplications',
          limit: 1,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      bio: user.bio,
      role: user.role,
      interests: user.interests,
      avatar: user.avatar,
      profilePicture: user.profilePicture,
      avatar: user.avatar,
      profilePicture: user.profilePicture,
      title: user.title,
      company: user.company,
      location: user.location,
      authProvider: user.authProvider,
      createdAt: user.createdAt,
      mentorApplications: user.mentorApplications
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, bio, title, company, location } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    // Allow empty strings for these fields to clear them
    if (bio !== undefined) user.bio = bio;
    if (title !== undefined) user.title = title;
    if (company !== undefined) user.company = company;
    if (location !== undefined) user.location = location;

    // Handle avatar removal
    if (req.body.avatar === null && user.avatar) {
      deleteFile(user.avatar);
      user.avatar = null;
      user.profilePicture = null;
    } else if (req.body.avatar !== undefined) {
      user.avatar = req.body.avatar;
    }

    if (req.body.profilePicture !== undefined && req.body.profilePicture !== null) {
      user.profilePicture = req.body.profilePicture;
    }

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        bio: user.bio,
        role: user.role,
        interests: user.interests,
        avatar: user.avatar,
        profilePicture: user.profilePicture,
        title: user.title,
        company: user.company,
        location: user.location,
        authProvider: user.authProvider,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      count: users.length,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get current user info with relations
// @route   GET /api/users/profile
// @access  Private
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [
        { model: Post, as: 'posts' },
        { model: Project, as: 'projects' }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user by id
// @route   GET /api/users/:id
// @access  Private
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'User id is required' });
    }

    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user by id error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Upload profile image
// @route   POST /api/users/upload-image
// @access  Private
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete old avatar if it exists
    if (user.avatar) {
      deleteFile(user.avatar);
    }

    // Update both fields for compatibility
    user.avatar = req.file.path; // Store relative path
    user.profilePicture = req.file.path; // legacy support
    await user.save();

    res.json({
      message: 'Image uploaded successfully',
      image_url: req.file.path,
      user: {
        ...user.toJSON(),
        avatar: user.avatar,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Image upload failed' });
  }
};
module.exports = {
  getProfile,
  updateProfile,
  getAllUsers,
  getCurrentUser,
  getUserById,
  uploadImage
};
