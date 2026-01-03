const { User } = require('../models');

// Get onboarding options (interests, roles, etc.)
const getOptions = async (req, res) => {
  try {
    const options = {
      roles: ['student', 'professional', 'hobbyist', 'educator', 'entrepreneur'],
      interests: [
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
      ]
    };

    res.status(200).json({ options });
  } catch (error) {
    console.error('Get onboarding options error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit onboarding data
const submitOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;
    const { role, interests, bio } = req.body;

    const user = await User.findByPk(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user profile with onboarding data
    await user.update({
      role: role || user.role,
      interests: interests || user.interests,
      bio: bio || user.bio
    });

    res.status(200).json({ 
      message: 'Onboarding completed successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        interests: user.interests,
        bio: user.bio
      }
    });
  } catch (error) {
    console.error('Submit onboarding error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getOptions,
  submitOnboarding
};