# Post Like Limit Implementation

## Changes Made

### 1. Created PostLike Model
**File:** `src/models/PostLike.js`

New junction table to track individual likes:
- `post_id` (references Post)
- `user_id` (references User)
- **Unique constraint** on `(post_id, user_id)` pair

This prevents duplicate likes from the same user on the same post at the database level.

### 2. Updated Models
**File:** `src/models/index.js`

Added relationships:
- `Post.hasMany(PostLike)` - A post can have many likes
- `User.hasMany(PostLike)` - A user can like many posts
- Bi-directional associations with proper cascade delete

### 3. Updated Post Controller
**File:** `src/controllers/post.controller.js`

**Modified `likePost()` function:**
- Checks if user already liked the post
- Returns 400 error if duplicate like attempted
- Only increments `post.likes` if new like is created
- Requires authenticated user

**Added `unlikePost()` function:**
- Allows user to remove their like
- Decrements `post.likes` count
- Returns 400 error if user hasn't liked the post

### 4. Updated Post Routes
**File:** `src/routes/post.routes.js`

Added new endpoint:
- `DELETE /posts/:id/like` - Remove like from post

Both like endpoints require authentication.

## Database Migration Needed

Run this SQL to create the `post_likes` table:

```sql
CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(post_id, user_id)
);

CREATE INDEX idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);
```

Or let Sequelize auto-sync if you have `DB_SYNC=true` set.

## API Usage

### Like a Post
```bash
POST /api/posts/:postId/like
Authorization: Bearer {token}
```

Response on success:
```json
{
  "message": "Post liked",
  "likes": 42
}
```

Error if already liked:
```json
{
  "message": "You already liked this post"
}
```

### Unlike a Post
```bash
DELETE /api/posts/:postId/like
Authorization: Bearer {token}
```

Response on success:
```json
{
  "message": "Post unliked",
  "likes": 41
}
```

Error if not liked:
```json
{
  "message": "You have not liked this post"
}
```

## What This Prevents

✅ User can only like a post once
✅ Duplicate likes are impossible at DB level (unique constraint)
✅ Each like is tracked individually (who liked what)
✅ Easy to count total likes per post
✅ Easy to check if specific user liked a post
✅ Future: Can easily add "who liked" list feature

## Future Enhancements

1. **Check if user liked post** - Add endpoint to check like status:
   ```
   GET /api/posts/:postId/liked
   ```

2. **Get who liked a post** - Add endpoint to list users who liked:
   ```
   GET /api/posts/:postId/likers
   ```

3. **Remove duplicate likes** - If migration is needed, could run cleanup script

## Testing

```javascript
// Test duplicate like prevention
const user1Id = 'user-123';
const postId = 42;

// First like - should succeed
POST /api/posts/42/like
// Response: { message: "Post liked", likes: 1 }

// Second like attempt - should fail
POST /api/posts/42/like
// Response: { message: "You already liked this post" } (400)

// Unlike - should succeed
DELETE /api/posts/42/like
// Response: { message: "Post unliked", likes: 0 }

// Unlike again - should fail
DELETE /api/posts/42/like
// Response: { message: "You have not liked this post" } (400)
```
