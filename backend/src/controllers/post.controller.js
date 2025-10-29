const { Post, User, Comment } = require('../models');
const PostImage = require('../models/PostImage');
const path = require('path');
const fs = require('fs');

// Get all posts (UPDATED - include images)
const getPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'avatar']
        },
        {
          model: PostImage,
          as: 'images',
          attributes: ['id', 'image_url', 'position'],
          order: [['position', 'ASC']]
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

// Get top posts (UPDATED - include images)
const getTopPosts = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'avatar']
        },
        {
          model: PostImage,
          as: 'images',
          attributes: ['id', 'image_url', 'position'],
          order: [['position', 'ASC']]
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

// Get single post (UPDATED - include images)
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
          model: PostImage,
          as: 'images',
          attributes: ['id', 'image_url', 'position', 'created_at'],
          order: [['position', 'ASC']]
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

// Create post (UPDATED - support multiple images and code snippets)
const createPost = async (req, res) => {
  try {
    const { title, content, tags, images = [], code_snippets = [] } = req.body;
    const userId = req.user.id || req.user.userId;

    console.log('User from token:', req.user);
    console.log('User ID:', userId);

    if (!userId) {
      return res.status(401).json({ message: 'User ID not found in token' });
    }

    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }

    // Validate images array
    if (images.length > 5) {
      return res.status(400).json({ 
        message: 'Maximum 5 images allowed per post' 
      });
    }

    // Create post
    const post = await Post.create({
      user_id: userId,
      title,
      content,
      tags: tags || [],
      code_snippets: code_snippets || []
    });

    // Create post images if provided
    if (images.length > 0) {
      const imageRecords = images.map((imageUrl, index) => ({
        post_id: post.id,
        image_url: imageUrl,
        position: index
      }));

      await PostImage.bulkCreate(imageRecords);
    }

    // Fetch complete post with images and author
    const postWithAuthor = await Post.findByPk(post.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'avatar']
        },
        {
          model: PostImage,
          as: 'images',
          attributes: ['id', 'image_url', 'position', 'created_at'],
          order: [['position', 'ASC']]
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

// Update post (UPDATED - support updating images and code snippets)
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, tags, images, code_snippets } = req.body;
    const userId = req.user.id || req.user.userId;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to update this post' });
    }

    // Validate images if provided
    if (images && images.length > 5) {
      return res.status(400).json({ 
        message: 'Maximum 5 images allowed per post' 
      });
    }

    // Update post fields
    await post.update({
      title: title || post.title,
      content: content || post.content,
      tags: tags || post.tags,
      code_snippets: code_snippets !== undefined ? code_snippets : post.code_snippets
    });

    // Update images if provided
    if (images !== undefined) {
      // Delete old images
      await PostImage.destroy({
        where: { post_id: id }
      });

      // Create new images
      if (images.length > 0) {
        const imageRecords = images.map((imageUrl, index) => ({
          post_id: id,
          image_url: imageUrl,
          position: index
        }));

        await PostImage.bulkCreate(imageRecords);
      }
    }

    // Fetch updated post with images
    const updatedPost = await Post.findByPk(id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'firstName', 'lastName', 'profilePicture', 'avatar']
        },
        {
          model: PostImage,
          as: 'images',
          attributes: ['id', 'image_url', 'position', 'created_at'],
          order: [['position', 'ASC']]
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

// Delete post (existing - CASCADE will delete images automatically)
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

// Like post (unchanged)
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

// View post (unchanged)
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

// Add comment to post (unchanged)
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

// Get post comments (unchanged)
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

// NEW: Upload single image
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Return the file path/URL
    const imageUrl = `uploads/${req.file.filename}`;
    
    res.status(200).json({
      message: 'Image uploaded successfully',
      image_url: imageUrl
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ 
      message: 'Failed to upload image',
      error: error.message 
    });
  }
};

// NEW: Delete single image from post
const deleteImage = async (req, res) => {
  try {
    const { postId, imageId } = req.params;
    const userId = req.user.id || req.user.userId;

    // Check if post exists and belongs to user
    const post = await Post.findOne({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user_id !== userId) {
      return res.status(403).json({ message: 'Not authorized to delete this image' });
    }

    // Find and delete the image
    const image = await PostImage.findOne({
      where: { 
        id: imageId,
        post_id: postId 
      }
    });

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete from database
    await image.destroy();

    // Optional: Delete actual file from storage
    const imagePath = path.join(__dirname, '../../', image.image_url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Get remaining images count
    const remainingImages = await PostImage.count({
      where: { post_id: postId }
    });

    // Reorder remaining images
    const images = await PostImage.findAll({
      where: { post_id: postId },
      order: [['position', 'ASC']]
    });

    for (let i = 0; i < images.length; i++) {
      await images[i].update({ position: i });
    }

    res.status(200).json({ 
      message: 'Image deleted successfully',
      remaining_images: remainingImages
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ 
      message: 'Failed to delete image',
      error: error.message 
    });
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
  getPostComments,
  uploadImage,      // NEW
  deleteImage       // NEW
};