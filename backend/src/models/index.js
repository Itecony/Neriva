const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Project = require('./Project');
const Notification = require('./Notification');
const Message = require('./Message');
const Conversation = require('./Conversation');
const ConversationParticipant = require('./ConversationParticipant');
const PostImage = require('./PostImage');

// User <-> Posts
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// User <-> Comments
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// Post <-> Comments
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// Post <-> PostImages (NEW)
Post.hasMany(PostImage, { foreignKey: 'post_id', as: 'images' });
PostImage.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// User <-> Projects
User.hasMany(Project, { foreignKey: 'user_id', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

// User <-> Notifications
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Messaging relationships (Conversation-based)
User.belongsToMany(Conversation, {
  through: ConversationParticipant,
  foreignKey: 'user_id',
  otherKey: 'conversation_id',
  as: 'conversations'
});

Conversation.belongsToMany(User, {
  through: ConversationParticipant,
  foreignKey: 'conversation_id',
  otherKey: 'user_id',
  as: 'participants'
});

Conversation.hasMany(Message, {
  foreignKey: 'conversation_id',
  as: 'messages'
});

Message.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'conversation'
});

User.hasMany(Message, {
  foreignKey: 'sender_id',
  as: 'sentMessages'
});

Message.belongsTo(User, {
  foreignKey: 'sender_id',
  as: 'sender'
});

module.exports = {
  User,
  Post,
  Comment,
  Project,
  Notification,
  Message,
  Conversation,
  ConversationParticipant,
  PostImage
};