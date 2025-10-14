const express = require('express');
const router = express.Router();
const {
  getProjects,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/project.controller');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/projects', getProjects);

// authenticateTokened routes
router.post('/projects', authenticateToken, createProject);
router.put('/projects/:id', authenticateToken, updateProject);
router.delete('/projects/:id', authenticateToken, deleteProject);

module.exports = router;