// Install dependencies:
// npm install express bcryptjs jsonwebtoken dotenv passport passport-google-oauth20 express-session cors connect-pg-simple socket.io

require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
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

// NEW: Import mentorship & resource routes
const mentorRoutes = require('./src/routes/mentor.routes');
const resourceRoutes = require('./src/routes/resource.routes');
const followRoutes = require('./src/routes/follow.routes');

// Initialize app
const app = express();
const HOST = '0.0.0.0';
const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
    allowEIO3: true
  },
  transports: ['websocket', 'polling'],
  allowUpgrades: true,
  pingInterval: 25000,
  pingTimeout: 60000
});

// Make io accessible to routes
app.set('io', io);

// Connect to database
connectDB();

// Configure passport
configurePassport();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup CORS with proper origin handling
const corsOptions = {
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

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

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  // User joins their personal room (for notifications, etc.)
  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`✅ User ${userId} joined personal room`);
  });

  // User joins a conversation room
  socket.on('join_conversation', (conversationId) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`✅ Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // User leaves a conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`👋 Socket ${socket.id} left conversation ${conversationId}`);
  });

  // Typing indicator
  socket.on('typing', ({ conversationId, userId, userName }) => {
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId,
      userName
    });
  });

  // Stop typing indicator
  socket.on('stop_typing', ({ conversationId, userId }) => {
    socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
      userId
    });
  });
  
  socket.on('message', (data) => {
    // Save to database
    // Emit to recipient
    socket.broadcast.emit('message', data);
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

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
    websocket: 'Connected',
    timestamp: new Date().toISOString()
  });
});

// Serve uploaded images as static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', postRoutes);
app.use('/api', projectRoutes);
app.use('/api', notificationRoutes);
app.use('/api', messageRoutes);
app.use('/api', onboardingRoutes);

// NEW: Mentorship & Resources routes
app.use('/api', mentorRoutes);
app.use('/api', resourceRoutes);
app.use('/api', followRoutes);

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
      'GET /api/posts (supports ?userId=:userId&page=:page&limit=:limit)',
      'GET /api/posts/top',
      'GET /api/posts/:id',
      'POST /api/posts (protected)',
      'PUT /api/posts/:id (protected)',
      'DELETE /api/posts/:id (protected)',
      'POST /api/posts/:id/like (protected)',
      'POST /api/posts/:id/view',
      'POST /api/posts/:id/comment (protected)',
      'GET /api/posts/:id/comments',
      'POST /api/posts/upload-image (protected, multipart form with postId in body)',
      'GET /api/posts/:postId/images',
      'DELETE /api/posts/:postId/images/:imageId (protected)',
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
      'GET /api/admin/notifications/mentor-applications (admin)',
      '',
      '-- Follow & Social --',
      'POST /api/users/:userId/follow (protected)',
      'DELETE /api/users/:userId/follow (protected)',
      'GET /api/users/:userId/is-following (Protected)',
      'GET /api/users/:userId/followers',
      'GET /api/users/:userId/following',
      'GET /api/users/:userId/follower-count',
      '',
      '-- Messages (WebSocket enabled) --',
      'GET /api/conversations (protected)',
      'POST /api/conversations/direct (protected)',
      'POST /api/conversations/group (protected)',
      'GET /api/messages/:conversationId (protected)',
      'POST /api/messages (protected)',
      '',
      '-- Mentor Applications --',
      'POST /api/mentors/apply (protected)',
      'GET /api/mentors/application/:id (protected)',
      'PUT /api/mentors/application/:id (protected)',
      'DELETE /api/mentors/application/:id (protected)',
      'GET /api/admin/mentor-applications (admin)',
      'PUT /api/admin/mentor-applications/:id/review (admin)',
      '',
      '-- Mentors --',
      'GET /api/mentors',
      'GET /api/mentors/:id',
      'PUT /api/mentors/profile (protected, mentor only)',
      'GET /api/mentors/:id/resources',
      'GET /api/mentors/:id/stats',
      'GET /api/mentors/analytics (protected, mentor only)',
      '',
      '-- Resources --',
      'POST /api/resources (protected, mentor only)',
      'GET /api/resources',
      'GET /api/resources/:id',
      'PUT /api/resources/:id (protected, owner only)',
      'DELETE /api/resources/:id (protected, owner only)',
      'GET /api/resources/search',
      'GET /api/resources/featured',
      'GET /api/resources/trending',
      '',
      '-- Resource Interactions --',
      'POST /api/resources/:id/bookmark (protected)',
      'PUT /api/resources/:id/bookmark (protected)',
      'DELETE /api/resources/:id/bookmark (protected)',
      'POST /api/resources/:id/complete (protected)',
      'POST /api/resources/:id/review (protected)',
      'PUT /api/resources/:id/review (protected)',
      'DELETE /api/resources/:id/review (protected)',
      'POST /api/resources/:id/comments (protected)',
      'GET /api/resources/:id/comments',
      'POST /api/reviews/:id/helpful (protected)',
      'GET /api/resources/:id/analytics (protected, mentor only)',
      '',
      '-- Learning Dashboard --',
      'GET /api/users/learning-dashboard (protected)',
      'GET /api/users/bookmarks (protected)',
      'GET /api/users/completed (protected)',
      'GET /api/users/reviews (protected)',
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

// Start server (use server.listen instead of app.listen)
server.listen(PORT, HOST, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 WebSocket server ready`);
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
  console.log(`   POST /api/posts/upload-image - Upload image file (protected, multipart with postId in body)`);
  console.log(`   GET  /api/posts/:postId/images - Get all images for post`);
  console.log(`   DEL  /api/posts/:postId/images/:imageId - Delete image (protected)`);
  console.log(`\n   🚀 Projects`);
  console.log(`   GET  /api/projects - Get all projects`);
  console.log(`   POST /api/projects - Create project (protected)`);
  console.log(`   PUT  /api/projects/:id - Update project (protected)`);
  console.log(`   DEL  /api/projects/:id - Delete project (protected)`);
  console.log(`\n   🔔 Notifications`);
  console.log(`   GET  /api/notifications - Get user notifications (protected)`);
  console.log(`   POST /api/notifications/mark-read - Mark as read (protected)`);
  console.log(`\n   💬 Messages (WebSocket Real-Time)`);
  console.log(`   GET  /api/conversations - Get all conversations (protected)`);
  console.log(`   POST /api/conversations/direct - Create/get direct conversation (protected)`);
  console.log(`   POST /api/conversations/group - Create group conversation (protected)`);
  console.log(`   GET  /api/messages/:conversationId - Get messages (protected)`);
  console.log(`   POST /api/messages - Send message (protected)`);
  console.log(`   🔌  WebSocket events: join_conversation, new_message, typing`);
  console.log(`\n   🎓 Mentor Applications`);
  console.log(`   POST /api/mentors/apply - Submit mentor application (protected)`);
  console.log(`   GET  /api/mentors/application/:id - View application (protected)`);
  console.log(`   PUT  /api/mentors/application/:id - Update application (protected)`);
  console.log(`   DEL  /api/mentors/application/:id - Withdraw application (protected)`);
  console.log(`   GET  /api/admin/mentor-applications - List applications (admin)`);
  console.log(`   PUT  /api/admin/mentor-applications/:id/review - Review application (admin)`);
  console.log(`\n   👨‍🏫 Mentors`);
  console.log(`   GET  /api/mentors - Browse all mentors`);
  console.log(`   GET  /api/mentors/:id - View mentor profile`);
  console.log(`   PUT  /api/mentors/profile - Update mentor profile (mentor only)`);
  console.log(`   GET  /api/mentors/:id/resources - Get mentor's resources`);
  console.log(`   GET  /api/mentors/:id/stats - Get mentor statistics`);
  console.log(`   GET  /api/mentors/analytics - Get mentor analytics (mentor only)`);
  console.log(`\n   📚 Resources`);
  console.log(`   POST /api/resources - Create resource (mentor only)`);
  console.log(`   GET  /api/resources - Browse all resources`);
  console.log(`   GET  /api/resources/:id - View resource`);
  console.log(`   PUT  /api/resources/:id - Update resource (owner only)`);
  console.log(`   DEL  /api/resources/:id - Delete resource (owner only)`);
  console.log(`   GET  /api/resources/search - Search resources`);
  console.log(`   GET  /api/resources/featured - Get featured resources`);
  console.log(`   GET  /api/resources/trending - Get trending resources`);
  console.log(`\n   🔖 Resource Interactions`);
  console.log(`   POST /api/resources/:id/bookmark - Bookmark resource (protected)`);
  console.log(`   PUT  /api/resources/:id/bookmark - Update bookmark status (protected)`);
  console.log(`   DEL  /api/resources/:id/bookmark - Remove bookmark (protected)`);
  console.log(`   POST /api/resources/:id/complete - Mark complete (protected)`);
  console.log(`   POST /api/resources/:id/review - Add review (protected)`);
  console.log(`   PUT  /api/resources/:id/review - Update review (protected)`);
  console.log(`   DEL  /api/resources/:id/review - Delete review (protected)`);
  console.log(`   POST /api/resources/:id/comments - Add comment (protected)`);
  console.log(`   GET  /api/resources/:id/comments - Get comments`);
  console.log(`   POST /api/reviews/:id/helpful - Mark review helpful (protected)`);
  console.log(`   GET  /api/resources/:id/analytics - Get resource analytics (mentor only)`);
  console.log(`\n   📊 Learning Dashboard`);
  console.log(`   GET  /api/users/learning-dashboard - Get dashboard (protected)`);
  console.log(`   GET  /api/users/bookmarks - Get bookmarked resources (protected)`);
  console.log(`   GET  /api/users/completed - Get completed resources (protected)`);
  console.log(`   GET  /api/users/reviews - Get user reviews (protected)`);
  console.log(`\n   🏥 Health`);
  console.log(`   GET  /api/health - Health check`);
});

module.exports = { app, server, io };