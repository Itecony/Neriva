const { Post, User, Comment } = require('../models');

// Get all posts
const getPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ posts });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get top posts (by likes or views)
const getTopPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'avatar']
        }
      ],
      order: [['likes', 'DESC'], ['views', 'DESC']],
      limit: 10
    });

    res.status(200).json({ posts });
  } catch (error) {
    console.error('Get top posts error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single post
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'avatar', 'bio']
        },
        {
          model: Comment,
          as: 'comments',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'avatar']
            }
          ]
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create post
const createPost = async (req, res) => {
  try {
    const { title, content, tags, image } = req.body;
    // Handle both req.user.id and req.user.userId
    const userId = req.user.id || req.user.userId;

    console.log('User from token:', req.user); // Debug log
    console.log('User ID:', userId); // Debug log

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    const post = await Post.create({
      user_id: userId,
      title,
      content,
      tags: tags || [],
      image: image || null
    });

    const postWithAuthor = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'avatar']
        }
      ]
    });

    res.status(201).json({ 
      message: 'Post created successfully', 
      post: postWithAuthor 
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags, image } = req.body;
    const userId = req.user.id || req.user.userId;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    await post.update({
      title: title || post.title,
      content: content || post.content,
      tags: tags || post.tags,
      image: image !== undefined ? image : post.image
    });

    const updatedPost = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'avatar']
        }
      ]
    });

    res.status(200).json({ 
      message: 'Post updated successfully', 
      post: updatedPost 
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user.userId;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this post' });
    }

    await post.destroy();

    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Like post
const likePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.increment('likes');
    await post.reload();

    res.status(200).json({ 
      message: 'Post liked', 
      likes: post.likes 
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// View post
const viewPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.increment('views');
    await post.reload();

    res.status(200).json({ 
      message: 'Post viewed', 
      views: post.views 
    });
  } catch (error) {
    console.error('View post error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add comment to post
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id || req.user.userId;

    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = await Comment.create({
      post_id: id,
      user_id: userId,
      content
    });

    const commentWithAuthor = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'avatar']
        }
      ]
    });

    res.status(201).json({ 
      message: 'Comment added', 
      comment: commentWithAuthor 
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get post comments
const getPostComments = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comments = await Comment.findAll({
      where: { post_id: id },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({ comments });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getPosts,
  getTopPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  likePost,
  viewPost,
  addComment,
  getPostComments
};