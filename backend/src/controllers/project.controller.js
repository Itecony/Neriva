const { Project, User } = require('../models');

// Get all projects
const getProjects = async (req, res) => {
  try {
    const projects = await Project.findAll({
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create project
const createProject = async (req, res) => {
  try {
    const { title, description, status, tags } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const project = await Project.create({
      user_id: userId,
      title,
      description: description || null,
      status: status || 'ongoing',
      tags: tags || []
    });

    const projectWithOwner = await Project.findByPk(project.id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

    res.status(201).json({ 
      message: 'Project created successfully', 
      project: projectWithOwner 
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update project
const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, tags } = req.body;
    const userId = req.user.id;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user owns the project
    if (project.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    await project.update({
      title: title || project.title,
      description: description !== undefined ? description : project.description,
      status: status || project.status,
      tags: tags || project.tags
    });

    const updatedProject = await Project.findByPk(id, {
      include: [
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

    res.status(200).json({ 
      message: 'Project updated successfully', 
      project: updatedProject 
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete project
const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const project = await Project.findByPk(id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check if user owns the project
    if (project.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    await project.destroy();

    res.status(200).json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getProjects,
  createProject,
  updateProject,
  deleteProject
};