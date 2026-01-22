// Save this as test-models.js in your project root
// Run with: node test-models.js

console.log('Testing model imports...\n');

try {
  console.log('1. Loading User model...');
  const User = require('./src/models/User');
  console.log('   ✅ User loaded');

  console.log('2. Loading Post model...');
  const Post = require('./src/models/Post');
  console.log('   ✅ Post loaded');

  console.log('3. Loading Comment model...');
  const Comment = require('./src/models/Comment');
  console.log('   ✅ Comment loaded');

  console.log('4. Loading Project model...');
  const Project = require('./src/models/Project');
  console.log('   ✅ Project loaded');

  console.log('5. Loading Notification model...');
  const Notification = require('./src/models/Notification');
  console.log('   ✅ Notification loaded');

  console.log('6. Loading Message model...');
  const Message = require('./src/models/Message');
  console.log('   ✅ Message loaded');

  console.log('7. Loading models/index.js...');
  const models = require('./src/models');
  console.log('   ✅ models/index loaded');
  console.log('   Available models:', Object.keys(models));

  console.log('\n8. Loading post.controller.js...');
  const postController = require('./src/controllers/post.controller');
  console.log('   ✅ post.controller loaded');
  console.log('   Exported functions:', Object.keys(postController));

  console.log('\n✅ ALL TESTS PASSED!\n');

} catch (error) {
  console.error('\n❌ ERROR:', error.message);
  console.error('\nFull error:', error);
}