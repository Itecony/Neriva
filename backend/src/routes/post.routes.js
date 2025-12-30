const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { authenticateToken } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max file size
  }
});

// Public routes
router.get('/posts', postController.getPosts);
router.get('/posts/top', postController.getTopPosts);
router.get('/posts/:id', postController.getPostById);
router.get('/posts/:id/comments', postController.getPostComments);

// Authenticated routes (require authentication)
router.post('/posts', authenticateToken, postController.createPost);
router.put('/posts/:id', authenticateToken, postController.updatePost);
router.delete('/posts/:id', authenticateToken, postController.deletePost);
router.post('/posts/:id/like', authenticateToken, postController.likePost);
router.delete('/posts/:id/like', authenticateToken, postController.unlikePost);
router.post('/posts/:id/view', postController.viewPost);
router.post('/posts/:id/comment', authenticateToken, postController.addComment);

// NEW: Image management routes
// POST /posts/upload-image requires: multipart form data with 'image' file + 'postId' in body
router.post('/posts/upload-image', authenticateToken, upload.single('image'), postController.uploadImage);
router.get('/posts/:postId/images', postController.getPostImages);
router.delete('/posts/:postId/images/:imageId', authenticateToken, postController.deleteImage);

module.exports = router;