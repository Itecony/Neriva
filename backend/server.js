// Install dependencies:
// npm install express bcryptjs jsonwebtoken dotenv passport passport-google-oauth20 express-session cors connect-pg-simple

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const passport = require('passport');
const cors = require('cors');

// Import configurations
const { sequelize, connectDB } = require('./src/config/database');
const configurePassport = require('./src/config/passport');

// Import models to establish relationships
require('./src/models');

// Import routes
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const postRoutes = require('./src/routes/post.routes');
const projectRoutes = require('./src/routes/project.routes');
const notificationRoutes = require('./src/routes/notification.routes');
const messageRoutes = require('./src/routes/message.routes');
const onboardingRoutes = require('./src/routes/onboarding.routes');

// Initialize app
const app = express();
const HOST = '0.0.0.0';
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Configure passport
configurePassport();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Session configuration
app.use(session({
  store: new pgSession({
    pool: sequelize.connectionManager.pool,
    tableName: 'session'
  }),
  secret: process.env.SESSION_SECRET || 'session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Health check route
app.get('/api/health', async (req, res) => {
  let dbStatus = 'Disconnected';
  try {
    await sequelize.authenticate();
    dbStatus = 'Connected';
  } catch (error) {
    dbStatus = 'Disconnected';
  }
  
  res.json({ 
    status: 'Server is running',
    database: dbStatus,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', postRoutes);
app.use('/api', projectRoutes);
app.use('/api', notificationRoutes);
app.use('/api', messageRoutes);
app.use('/api', onboardingRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    availableRoutes: [
      '-- Auth & User --',
      'POST /api/signup',
      'POST /api/login',
      'GET /api/auth/google',
      'GET /api/profile (protected)',
      'PUT /api/profile (protected)',
      'GET /api/users (protected)',
      '',
      '-- Onboarding --',
      'GET /api/onboarding/options',
      'POST /api/onboarding/submit (protected)',
      '',
      '-- Posts & Feed --',
      'GET /api/posts',
      'GET /api/posts/top',
      'GET /api/posts/:id',
      'POST /api/posts (protected)',
      'PUT /api/posts/:id (protected)',
      'DELETE /api/posts/:id (protected)',
      'POST /api/posts/:id/like (protected)',
      'POST /api/posts/:id/view',
      'POST /api/posts/:id/comment (protected)',
      'GET /api/posts/:id/comments',
      '',
      '-- Projects --',
      'GET /api/projects',
      'POST /api/projects (protected)',
      'PUT /api/projects/:id (protected)',
      'DELETE /api/projects/:id (protected)',
      '',
      '-- Notifications --',
      'GET /api/notifications (protected)',
      'POST /api/notifications/mark-read (protected)',
      '',
      '-- Messages --',
      'GET /api/conversations (protected)',
      'POST /api/conversations/direct (protected)',      // NEW
      'POST /api/conversations/group (protected)',       // NEW
      'GET /api/messages/:conversationId (protected)',
      'POST /api/messages (protected)',
      '',
      '-- Health --',
      'GET /api/health'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n📍 Available endpoints:`);
  console.log(`\n   ✅ Auth & User`);
  console.log(`   POST /api/signup - Register with firstName, lastName, email, password`);
  console.log(`   POST /api/login - Login with email/password`);
  console.log(`   GET  /api/auth/google - Sign in with Google`);
  console.log(`   GET  /api/profile - Get user profile (protected)`);
  console.log(`   PUT  /api/profile - Update profile (protected)`);
  console.log(`   GET  /api/users - Get all users (protected)`);
  console.log(`\n   📋 Onboarding`);
  console.log(`   GET  /api/onboarding/options - Get onboarding options`);
  console.log(`   POST /api/onboarding/submit - Submit onboarding data (protected)`);
  console.log(`\n   📝 Posts & Feed`);
  console.log(`   GET  /api/posts - Get all posts`);
  console.log(`   GET  /api/posts/top - Get top posts`);
  console.log(`   GET  /api/posts/:id - Get single post`);
  console.log(`   POST /api/posts - Create post (protected)`);
  console.log(`   PUT  /api/posts/:id - Update post (protected)`);
  console.log(`   DEL  /api/posts/:id - Delete post (protected)`);
  console.log(`   POST /api/posts/:id/like - Like post (protected)`);
  console.log(`   POST /api/posts/:id/view - Increment view count`);
  console.log(`   POST /api/posts/:id/comment - Add comment (protected)`);
  console.log(`   GET  /api/posts/:id/comments - Get post comments`);
  console.log(`\n   🚀 Projects`);
  console.log(`   GET  /api/projects - Get all projects`);
  console.log(`   POST /api/projects - Create project (protected)`);
  console.log(`   PUT  /api/projects/:id - Update project (protected)`);
  console.log(`   DEL  /api/projects/:id - Delete project (protected)`);
  console.log(`\n   🔔 Notifications`);
  console.log(`   GET  /api/notifications - Get user notifications (protected)`);
  console.log(`   POST /api/notifications/mark-read - Mark as read (protected)`);
  console.log(`\n   💬 Messages`);
  console.log(`   GET  /api/conversations - Get all conversations (protected)`);
  console.log(`   POST /api/conversations/direct - Create/get direct conversation (protected)`);
  console.log(`   POST /api/conversations/group - Create group conversation (protected)`);
  console.log(`   GET  /api/messages/:conversationId - Get messages (protected)`);
  console.log(`   POST /api/messages - Send message (protected)`);
    console.log(`\n   🏥 Health`);
  console.log(`   GET  /api/health - Health check`);
});

module.exports = app;