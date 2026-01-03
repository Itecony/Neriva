const bcrypt = require('bcryptjs');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/signup
// @access  Public
const signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ 
        message: 'First name, last name, email, and password are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      authProvider: 'local'
    });

    // Generate token
    const token = generateToken(newUser);

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        authProvider: newUser.authProvider
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // Handle Sequelize validation errors
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        message: error.errors[0].message 
      });
    }

    res.status(500).json({ message: 'Server error during signup' });
  }
};

// @desc    Login user
// @route   POST /api/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Check if user registered with Google
    if (user.authProvider === 'google') {
      return res.status(400).json({ 
        message: 'Please sign in with Google' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user);

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        authProvider: user.authProvider
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Google OAuth callback
// @route   GET /api/auth/google/callback
// @access  Public
const googleCallback = (req, res) => {
  const token = generateToken(req.user);

  // Send success page with token
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Authentication Successful</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: #f5f5f5;
        }
        .container {
          text-align: center;
          background: white;
          padding: 40px;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .success { color: #4CAF50; font-size: 48px; }
        .token {
          margin: 20px 0;
          padding: 15px;
          background: #f0f0f0;
          border-radius: 5px;
          word-break: break-all;
          font-family: monospace;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="success">✅</div>
        <h1>Google Authentication Successful!</h1>
        <p><strong>Welcome, ${req.user.firstName} ${req.user.lastName}!</strong></p>
        <p>Email: ${req.user.email}</p>
        <div class="token">
          <strong>Your Token:</strong><br>
          ${token}
        </div>
        <p>Copy this token to use in Postman with Authorization header:</p>
        <code>Bearer ${token}</code>
        <br><br>
        <button onclick="window.close()">Close Window</button>
      </div>
    </body>
    </html>
  `);
};

module.exports = {
  signup,
  login,
  googleCallback
};