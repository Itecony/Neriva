const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Project = require('./Project');
const Notification = require('./Notification');
const Message = require('./Message');

// Define relationships

// User -> Posts (One to Many)
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// User -> Comments (One to Many)
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// Post -> Comments (One to Many)
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// User -> Projects (One to Many)
User.hasMany(Project, { foreignKey: 'user_id', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

// User -> Notifications (One to Many)
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User -> Messages (One to Many - as sender)
User.hasMany(Message, { foreignKey: 'sender_id', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'sender_id', as: 'sender' });

// User -> Messages (One to Many - as receiver)
User.hasMany(Message, { foreignKey: 'receiver_id', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'receiver_id', as: 'receiver' });

module.exports = {
  User,
  Post,
  Comment,
  Project,
  Notification,
  Message
};