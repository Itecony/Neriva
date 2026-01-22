
const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/posts', postController.getPosts);
router.get('/posts/top', postController.getTopPosts);
router.get('/posts/:id', postController.getPostById);
router.get('/posts/:id/comments', postController.getPostComments);

// authenticateTokened routes (require authentication)
router.post('/posts', authenticateToken, postController.createPost);
router.put('/posts/:id', authenticateToken, postController.updatePost);
router.delete('/posts/:id', authenticateToken, postController.deletePost);
router.post('/posts/:id/like', authenticateToken, postController.likePost);
router.post('/posts/:id/view', postController.viewPost);
router.post('/posts/:id/comment', authenticateToken, postController.addComment);

module.exports = router;