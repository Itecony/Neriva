// Existing Models
const User = require('./User');
const Post = require('./Post');
const Comment = require('./Comment');
const Project = require('./Project');
const Notification = require('./Notification');
const Message = require('./Message');
const Conversation = require('./Conversation');
const ConversationParticipant = require('./ConversationParticipant');
const PostImage = require('./PostImage');
const PostLike = require('./PostLike');
const Follow = require('./Follow');

// New Mentor & Resource Models
const MentorApplication = require('./MentorApplication');
const MentorProfile = require('./MentorProfile');
const Resource = require('./Resource');
const ResourceBookmark = require('./ResourceBookmark');
const ResourceReview = require('./ResourceReview');
const ResourceReviewHelpful = require('./ResourceReviewHelpful');
const ResourceCompletion = require('./ResourceCompletion');
const ResourceComment = require('./ResourceComment');

// ==================== EXISTING RELATIONSHIPS ====================

// User <-> Posts
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// User <-> Comments
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'author' });

// Post <-> Comments
Post.hasMany(Comment, { foreignKey: 'post_id', as: 'comments' });
Comment.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// Post <-> PostImages
Post.hasMany(PostImage, { foreignKey: 'post_id', as: 'images' });
PostImage.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// Post <-> PostLikes
Post.hasMany(PostLike, { foreignKey: 'post_id', as: 'likeRecords', onDelete: 'CASCADE' });
PostLike.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });

// User <-> PostLikes
User.hasMany(PostLike, { foreignKey: 'user_id', as: 'likedPosts', onDelete: 'CASCADE' });
PostLike.belongsTo(User, { foreignKey: 'user_id', as: 'liker' });

// User <-> Projects
User.hasMany(Project, { foreignKey: 'user_id', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'user_id', as: 'owner' });

// User <-> Notifications
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User <-> Follow relationships
// User.followers = users who follow this user
// User.following = users this user follows
User.hasMany(Follow, { foreignKey: 'following_id', as: 'followers' });
Follow.belongsTo(User, { foreignKey: 'following_id', as: 'followingUser' });

User.hasMany(Follow, { foreignKey: 'follower_id', as: 'following' });
Follow.belongsTo(User, { foreignKey: 'follower_id', as: 'followerUser' });

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


// Conversation <-> ConversationParticipant (One to Many)
Conversation.hasMany(ConversationParticipant, {
  foreignKey: 'conversation_id',
  as: 'conversationParticipants'
});
ConversationParticipant.belongsTo(Conversation, {
  foreignKey: 'conversation_id',
  as: 'conversation'
});

// User <-> ConversationParticipant (One to Many)
User.hasMany(ConversationParticipant, {
  foreignKey: 'user_id',
  as: 'conversationParticipants'
});
ConversationParticipant.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
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

// ==================== NEW MENTOR & RESOURCE RELATIONSHIPS ====================

// User -> MentorApplication (applicant)
User.hasMany(MentorApplication, { 
  foreignKey: 'user_id', 
  as: 'mentorApplications', 
  onDelete: 'CASCADE' 
});
MentorApplication.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'applicant' 
});

// User -> MentorApplication (reviewer)
User.hasMany(MentorApplication, { 
  foreignKey: 'reviewed_by', 
  as: 'reviewedApplications', 
  onDelete: 'SET NULL' 
});
MentorApplication.belongsTo(User, { 
  foreignKey: 'reviewed_by', 
  as: 'reviewer' 
});

// User -> MentorProfile (One to One)
User.hasOne(MentorProfile, { 
  foreignKey: 'user_id', 
  as: 'mentorProfile', 
  onDelete: 'CASCADE' 
});
MentorProfile.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});

// User (Mentor) -> Resources
User.hasMany(Resource, { 
  foreignKey: 'mentor_id', 
  as: 'createdResources', 
  onDelete: 'CASCADE' 
});
Resource.belongsTo(User, { 
  foreignKey: 'mentor_id', 
  as: 'mentor' 
});

// User -> ResourceBookmarks
User.hasMany(ResourceBookmark, { 
  foreignKey: 'user_id', 
  as: 'resourceBookmarks', 
  onDelete: 'CASCADE' 
});
ResourceBookmark.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});

// Resource -> ResourceBookmarks
Resource.hasMany(ResourceBookmark, { 
  foreignKey: 'resource_id', 
  as: 'bookmarks', 
  onDelete: 'CASCADE' 
});
ResourceBookmark.belongsTo(Resource, { 
  foreignKey: 'resource_id', 
  as: 'resource' 
});

// User -> ResourceReviews
User.hasMany(ResourceReview, { 
  foreignKey: 'user_id', 
  as: 'resourceReviews', 
  onDelete: 'CASCADE' 
});
ResourceReview.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'reviewer' 
});

// Resource -> ResourceReviews
Resource.hasMany(ResourceReview, { 
  foreignKey: 'resource_id', 
  as: 'reviews', 
  onDelete: 'CASCADE' 
});
ResourceReview.belongsTo(Resource, { 
  foreignKey: 'resource_id', 
  as: 'resource' 
});

// User -> ResourceReviewHelpful
User.hasMany(ResourceReviewHelpful, { 
  foreignKey: 'user_id', 
  as: 'helpfulMarks', 
  onDelete: 'CASCADE' 
});
ResourceReviewHelpful.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});

// ResourceReview -> ResourceReviewHelpful
ResourceReview.hasMany(ResourceReviewHelpful, { 
  foreignKey: 'review_id', 
  as: 'helpfulMarks', 
  onDelete: 'CASCADE' 
});
ResourceReviewHelpful.belongsTo(ResourceReview, { 
  foreignKey: 'review_id', 
  as: 'review' 
});

// User -> ResourceCompletions
User.hasMany(ResourceCompletion, { 
  foreignKey: 'user_id', 
  as: 'resourceCompletions', 
  onDelete: 'CASCADE' 
});
ResourceCompletion.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'user' 
});

// Resource -> ResourceCompletions
Resource.hasMany(ResourceCompletion, { 
  foreignKey: 'resource_id', 
  as: 'completions', 
  onDelete: 'CASCADE' 
});
ResourceCompletion.belongsTo(Resource, { 
  foreignKey: 'resource_id', 
  as: 'resource' 
});

// User -> ResourceComments
User.hasMany(ResourceComment, { 
  foreignKey: 'user_id', 
  as: 'resourceComments', 
  onDelete: 'CASCADE' 
});
ResourceComment.belongsTo(User, { 
  foreignKey: 'user_id', 
  as: 'commenter' 
});

// Resource -> ResourceComments
Resource.hasMany(ResourceComment, { 
  foreignKey: 'resource_id', 
  as: 'comments', 
  onDelete: 'CASCADE' 
});
ResourceComment.belongsTo(Resource, { 
  foreignKey: 'resource_id', 
  as: 'resource' 
});

// ResourceComment -> ResourceComment (self-referencing for threaded replies)
ResourceComment.hasMany(ResourceComment, { 
  foreignKey: 'parent_comment_id', 
  as: 'replies', 
  onDelete: 'CASCADE' 
});
ResourceComment.belongsTo(ResourceComment, { 
  foreignKey: 'parent_comment_id', 
  as: 'parentComment' 
});

module.exports = {
  // Existing Models
  User,
  Post,
  Comment,
  Project,
  Notification,
  Message,
  Conversation,
  ConversationParticipant,
  PostImage,
  PostLike,
  Follow,
  
  // New Mentor & Resource Models
  MentorApplication,
  MentorProfile,
  Resource,
  ResourceBookmark,
  ResourceReview,
  ResourceReviewHelpful,
  ResourceCompletion,
  ResourceComment
};