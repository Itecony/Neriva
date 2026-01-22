# Neriva API Documentation

## Base URL
```
http://localhost:5000/api
```

---

## Authentication
Most endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## RESOURCE ENDPOINTS

### Create Resource
**POST** `/resources`
- **Authentication**: Required (Mentor only)
- **Middleware**: `authenticateToken`, `isMentor`, `checkResourceLimit`
- **Description**: Create a new learning resource (max 10 per mentor)

**Request Body**:
```json
{
  "title": "React Hooks Tutorial",
  "description": "Comprehensive guide to using React Hooks in modern web applications...",
  "resource_type": "article|video|pdf|code_repo|documentation|external_course|challenge|tool",
  "url": "https://example.com/resource",
  "file_path": "/uploads/resource.pdf",
  "file_size": 1024000,
  "domain": "Web Development",
  "difficulty_level": "beginner|intermediate|advanced",
  "estimated_time_minutes": 60,
  "prerequisites": "Basic JavaScript knowledge",
  "learning_outcomes": "Students will learn...",
  "tags": ["react", "hooks", "javascript", "frontend"]
}
```

**Validation Rules**:
- `title`: 5-255 characters (required)
- `description`: 100-5000 characters (required)
- `tags`: 3-10 tags (required)
- Videos must have URL only (no file upload)
- PDFs max 50MB
- Either URL or file_path required

**Response** (201):
```json
{
  "success": true,
  "message": "Resource created successfully",
  "resource": {
    "id": "uuid",
    "mentor_id": "uuid",
    "title": "React Hooks Tutorial",
    "created_at": "2025-12-23T10:30:00Z"
  }
}
```

---

### Get All Resources
**GET** `/resources`
- **Authentication**: Not required
- **Description**: Get all resources with optional filtering

**Query Parameters**:
```
?domain=Web Development&difficulty_level=beginner&resource_type=article&page=1&limit=10
```

**Response** (200):
```json
{
  "success": true,
  "resources": [
    {
      "id": "uuid",
      "title": "React Hooks Tutorial",
      "description": "...",
      "resource_type": "article",
      "domain": "Web Development",
      "difficulty_level": "beginner",
      "mentor_id": "uuid",
      "mentor": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe"
      },
      "rating": 4.5,
      "bookmarks_count": 25,
      "completions_count": 40,
      "views_count": 150,
      "created_at": "2025-12-23T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

---

### Search Resources
**GET** `/resources/search`
- **Authentication**: Not required
- **Description**: Full-text search across resources

**Query Parameters**:
```
?q=react&domain=Web Development&difficulty_level=beginner
```

**Response** (200): Same as Get All Resources

---

### Get Featured Resources
**GET** `/resources/featured`
- **Authentication**: Not required
- **Description**: Get curated featured resources

**Response** (200): Same as Get All Resources (limited set)

---

### Get Trending Resources
**GET** `/resources/trending`
- **Authentication**: Not required
- **Description**: Get most viewed/bookmarked resources

**Query Parameters**:
```
?days=7&limit=10
```

**Response** (200): Same as Get All Resources

---

### Get Resource by ID
**GET** `/resources/:id`
- **Authentication**: Not required
- **Description**: Get detailed information about a specific resource

**Response** (200):
```json
{
  "success": true,
  "resource": {
    "id": "uuid",
    "title": "React Hooks Tutorial",
    "description": "...",
    "resource_type": "article",
    "url": "https://example.com",
    "file_path": null,
    "domain": "Web Development",
    "difficulty_level": "beginner",
    "estimated_time_minutes": 60,
    "prerequisites": "Basic JavaScript",
    "learning_outcomes": "...",
    "tags": ["react", "hooks"],
    "mentor_id": "uuid",
    "mentor": {
      "id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "url"
    },
    "rating": 4.5,
    "reviews_count": 12,
    "bookmarks_count": 25,
    "completions_count": 40,
    "views_count": 150,
    "created_at": "2025-12-23T10:30:00Z",
    "updated_at": "2025-12-23T10:30:00Z"
  }
}
```

---

### Update Resource
**PUT** `/resources/:id`
- **Authentication**: Required (Resource owner only)
- **Middleware**: `authenticateToken`, `isResourceOwner`
- **Description**: Update an existing resource

**Request Body**: (Same as Create, optional fields)
```json
{
  "title": "Updated Title",
  "difficulty_level": "intermediate"
}
```

**Response** (200): Updated resource object

---

### Delete Resource
**DELETE** `/resources/:id`
- **Authentication**: Required (Resource owner only)
- **Middleware**: `authenticateToken`, `isResourceOwner`
- **Description**: Delete a resource permanently

**Response** (200):
```json
{
  "success": true,
  "message": "Resource deleted successfully"
}
```

---

## RESOURCE INTERACTION ENDPOINTS

### Bookmark Resource
**POST** `/resources/:id/bookmark`
- **Authentication**: Required
- **Description**: Add resource to user's bookmarks

**Request Body**:
```json
{
  "status": "bookmarked"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Resource bookmarked",
  "bookmark": {
    "id": "uuid",
    "user_id": "uuid",
    "resource_id": "uuid",
    "created_at": "2025-12-23T10:30:00Z"
  }
}
```

---

### Update Bookmark Status
**PUT** `/resources/:id/bookmark`
- **Authentication**: Required
- **Description**: Update bookmark status (archived, removed, etc.)

**Request Body**:
```json
{
  "status": "archived"
}
```

**Response** (200): Updated bookmark object

---

### Remove Bookmark
**DELETE** `/resources/:id/bookmark`
- **Authentication**: Required
- **Description**: Remove resource from bookmarks

**Response** (200):
```json
{
  "success": true,
  "message": "Bookmark removed"
}
```

---

### Mark Resource as Completed
**POST** `/resources/:id/complete`
- **Authentication**: Required
- **Description**: Mark resource as completed

**Request Body**:
```json
{
  "completion_date": "2025-12-23T10:30:00Z"
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Resource marked as completed",
  "completion": {
    "id": "uuid",
    "user_id": "uuid",
    "resource_id": "uuid",
    "completed_at": "2025-12-23T10:30:00Z"
  }
}
```

---

### Create/Update Resource Review
**POST** `/resources/:id/review`
- **Authentication**: Required
- **Description**: Create or update a review for a resource

**Request Body**:
```json
{
  "rating": 5,
  "review_text": "Excellent resource! Very comprehensive and well-structured.",
  "would_recommend": true
}
```

**Validation**:
- `rating`: 1-5 (required)
- `review_text`: 10-1000 characters (required)
- `would_recommend`: boolean (required)

**Response** (201):
```json
{
  "success": true,
  "message": "Review created",
  "review": {
    "id": "uuid",
    "user_id": "uuid",
    "resource_id": "uuid",
    "rating": 5,
    "review_text": "...",
    "would_recommend": true,
    "helpful_count": 0,
    "created_at": "2025-12-23T10:30:00Z"
  }
}
```

---

### Update Review
**PUT** `/resources/:id/review`
- **Authentication**: Required (Review author only)
- **Description**: Update an existing review

**Request Body**: (Same as Create, optional fields)

**Response** (200): Updated review object

---

### Delete Review
**DELETE** `/resources/:id/review`
- **Authentication**: Required (Review author only)
- **Description**: Delete a review

**Response** (200):
```json
{
  "success": true,
  "message": "Review deleted"
}
```

---

### Add Comment to Resource
**POST** `/resources/:id/comments`
- **Authentication**: Required
- **Description**: Add a comment to a resource

**Request Body**:
```json
{
  "comment_text": "Great resource! One question about..."
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Comment added",
  "comment": {
    "id": "uuid",
    "user_id": "uuid",
    "resource_id": "uuid",
    "comment_text": "...",
    "created_at": "2025-12-23T10:30:00Z"
  }
}
```

---

### Get Resource Comments
**GET** `/resources/:id/comments`
- **Authentication**: Not required
- **Description**: Get all comments for a resource

**Query Parameters**:
```
?page=1&limit=20&sort=newest
```

**Response** (200):
```json
{
  "success": true,
  "comments": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "avatar": "url"
      },
      "comment_text": "Great resource!",
      "created_at": "2025-12-23T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

---

### Mark Review as Helpful
**POST** `/reviews/:id/helpful`
- **Authentication**: Required
- **Description**: Mark a review as helpful

**Response** (200):
```json
{
  "success": true,
  "message": "Review marked as helpful",
  "helpful_count": 15
}
```

---

### Get Resource Analytics
**GET** `/resources/:id/analytics`
- **Authentication**: Required (Mentor only, owner of resource)
- **Description**: Get analytics for a mentor's resource

**Response** (200):
```json
{
  "success": true,
  "analytics": {
    "resource_id": "uuid",
    "title": "React Hooks Tutorial",
    "views_count": 150,
    "bookmarks_count": 25,
    "completions_count": 40,
    "reviews_count": 12,
    "average_rating": 4.5,
    "bookmarks_trend": [10, 12, 15, 25],
    "completions_trend": [5, 10, 20, 40],
    "views_trend": [20, 50, 100, 150],
    "top_comments": [],
    "created_at": "2025-12-23T10:30:00Z"
  }
}
```

---

## MENTOR PROFILE ENDPOINTS

### Get All Mentors
**GET** `/mentors`
- **Authentication**: Not required
- **Description**: Get list of all verified mentors with filters

**Query Parameters**:
```
?domain=Web Development&page=1&limit=10&sort=rating
```

**Response** (200):
```json
{
  "success": true,
  "mentors": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "url",
      "bio": "Experienced React developer...",
      "expertise_domains": ["Web Development", "React"],
      "teaching_style": "Hands-on, project-based",
      "open_to_mentorship": true,
      "mentorship_description": "I offer 1-on-1 mentorship...",
      "total_resources_created": 8,
      "average_resource_rating": 4.5,
      "total_bookmarks_received": 120,
      "total_completions_received": 85,
      "total_views_received": 450,
      "verified_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

---

### Update My Mentor Profile
**PUT** `/mentors/profile`
- **Authentication**: Required (Mentor only)
- **Description**: Update own mentor profile information

**Request Body**:
```json
{
  "bio": "Updated bio...",
  "expertise_domains": ["Web Development", "React", "Node.js"],
  "teaching_style": "Project-based learning",
  "open_to_mentorship": true,
  "mentorship_description": "Available for 1-on-1 sessions..."
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Mentor profile updated",
  "profile": {
    "id": "uuid",
    "user_id": "uuid",
    "bio": "...",
    "expertise_domains": [...],
    "teaching_style": "...",
    "open_to_mentorship": true,
    "mentorship_description": "...",
    "updated_at": "2025-12-23T10:30:00Z"
  }
}
```

---

### Get My Mentor Analytics
**GET** `/mentors/analytics`
- **Authentication**: Required (Mentor only)
- **Description**: Get comprehensive analytics for own mentoring

**Response** (200):
```json
{
  "success": true,
  "analytics": {
    "total_resources_created": 8,
    "total_views": 450,
    "total_bookmarks": 120,
    "total_completions": 85,
    "average_rating": 4.5,
    "student_count": 60,
    "resources": [
      {
        "id": "uuid",
        "title": "React Hooks Tutorial",
        "views": 150,
        "bookmarks": 25,
        "completions": 40,
        "rating": 4.5
      }
    ],
    "growth_trends": {
      "views_last_30_days": [...],
      "bookmarks_last_30_days": [...],
      "completions_last_30_days": [...]
    }
  }
}
```

---

### Get Mentor's Resources
**GET** `/mentors/:id/resources`
- **Authentication**: Not required
- **Description**: Get all resources created by a specific mentor

**Query Parameters**:
```
?domain=Web Development&page=1&limit=10&sort=newest
```

**Response** (200):
```json
{
  "success": true,
  "mentor": {
    "id": "uuid",
    "firstName": "John",
    "lastName": "Doe"
  },
  "resources": [
    {
      "id": "uuid",
      "title": "React Hooks Tutorial",
      "description": "...",
      "resource_type": "article",
      "domain": "Web Development",
      "difficulty_level": "beginner",
      "rating": 4.5,
      "bookmarks_count": 25,
      "completions_count": 40,
      "created_at": "2025-12-23T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8
  }
}
```

---

### Get Mentor Statistics
**GET** `/mentors/:id/stats`
- **Authentication**: Not required
- **Description**: Get public statistics for a mentor

**Response** (200):
```json
{
  "success": true,
  "stats": {
    "mentor_id": "uuid",
    "mentor_name": "John Doe",
    "total_resources": 8,
    "average_resource_rating": 4.5,
    "total_bookmarks_received": 120,
    "total_completions_received": 85,
    "total_views_received": 450,
    "expertise_domains": ["Web Development", "React"],
    "teaching_style": "Project-based",
    "member_since": "2024-01-15T00:00:00Z"
  }
}
```

---

### Get Mentor Profile
**GET** `/mentors/:id`
- **Authentication**: Not required
- **Description**: Get detailed mentor profile information

**Response** (200):
```json
{
  "success": true,
  "mentor": {
    "id": "uuid",
    "user_id": "uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "avatar": "url",
    "bio": "Experienced React developer...",
    "expertise_domains": ["Web Development", "React"],
    "teaching_style": "Hands-on, project-based",
    "open_to_mentorship": true,
    "mentorship_description": "I offer 1-on-1 mentorship...",
    "total_resources_created": 8,
    "average_resource_rating": 4.5,
    "total_bookmarks_received": 120,
    "total_completions_received": 85,
    "total_views_received": 450,
    "verified_at": "2025-01-01T00:00:00Z",
    "resources": [
      {
        "id": "uuid",
        "title": "React Hooks Tutorial"
      }
    ]
  }
}
```

---

## MENTOR APPLICATION ENDPOINTS

### Apply for Mentor
**POST** `/mentors/apply`
- **Authentication**: Required
- **Middleware**: `canApplyForMentor`
- **Description**: Submit application to become a mentor

**Request Body**:
```json
{
  "expertise_domains": ["Web Development", "React"],
  "teaching_style": "Project-based learning with hands-on exercises",
  "why_mentor": "I want to share my 5 years of experience...",
  "mentorship_goals": "Help junior developers master React..."
}
```

**Response** (201):
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "application": {
    "id": "uuid",
    "user_id": "uuid",
    "status": "pending",
    "expertise_domains": [...],
    "teaching_style": "...",
    "created_at": "2025-12-23T10:30:00Z"
  }
}
```

---

### Get My Application
**GET** `/mentors/application/:id`
- **Authentication**: Required
- **Description**: Get own mentor application details

**Response** (200):
```json
{
  "success": true,
  "application": {
    "id": "uuid",
    "user_id": "uuid",
    "status": "pending|approved|rejected",
    "expertise_domains": [...],
    "teaching_style": "...",
    "why_mentor": "...",
    "mentorship_goals": "...",
    "feedback": null,
    "created_at": "2025-12-23T10:30:00Z",
    "reviewed_at": null,
    "reviewed_by": null
  }
}
```

---

### Update Application
**PUT** `/mentors/application/:id`
- **Authentication**: Required (Application owner only)
- **Description**: Update pending application

**Request Body**: (Same as Apply, optional fields)

**Response** (200): Updated application object

---

### Withdraw Application
**DELETE** `/mentors/application/:id`
- **Authentication**: Required (Application owner only)
- **Description**: Withdraw a pending application

**Response** (200):
```json
{
  "success": true,
  "message": "Application withdrawn"
}
```

---

### Get All Applications (Admin)
**GET** `/admin/mentor-applications`
- **Authentication**: Required (Admin only)
- **Description**: Get all mentor applications (with filters)

**Query Parameters**:
```
?status=pending&page=1&limit=20&sort=newest
```

**Response** (200):
```json
{
  "success": true,
  "applications": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "user": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "status": "pending",
      "expertise_domains": [...],
      "teaching_style": "...",
      "created_at": "2025-12-23T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45
  }
}
```

---

### Review Application (Admin)
**PUT** `/admin/mentor-applications/:id/review`
- **Authentication**: Required (Admin only)
- **Description**: Approve or reject a mentor application

**Request Body**:
```json
{
  "status": "approved|rejected",
  "feedback": "Your application has been approved! Welcome to the mentor community."
}
```

**Response** (200):
```json
{
  "success": true,
  "message": "Application reviewed",
  "application": {
    "id": "uuid",
    "status": "approved",
    "feedback": "...",
    "reviewed_at": "2025-12-23T10:30:00Z",
    "reviewed_by": "admin_id"
  }
}
```

---

## LEARNING DASHBOARD ENDPOINTS

### Get Learning Dashboard
**GET** `/users/learning-dashboard`
- **Authentication**: Required
- **Description**: Get user's personalized learning dashboard

**Response** (200):
```json
{
  "success": true,
  "dashboard": {
    "user_id": "uuid",
    "profile": {
      "firstName": "Jane",
      "lastName": "Smith",
      "avatar": "url"
    },
    "learning_stats": {
      "total_resources_viewed": 42,
      "total_bookmarks": 15,
      "total_completed": 8,
      "completion_rate": 53.3,
      "average_rating_given": 4.2
    },
    "recommended_resources": [...],
    "recent_activity": [...],
    "learning_goals": [...]
  }
}
```

---

### Get User's Bookmarks
**GET** `/users/bookmarks`
- **Authentication**: Required
- **Description**: Get all bookmarked resources

**Query Parameters**:
```
?page=1&limit=10&status=bookmarked&sort=newest
```

**Response** (200):
```json
{
  "success": true,
  "bookmarks": [
    {
      "id": "uuid",
      "resource": {
        "id": "uuid",
        "title": "React Hooks Tutorial",
        "mentor": { "firstName": "John", "lastName": "Doe" },
        "rating": 4.5
      },
      "status": "bookmarked",
      "created_at": "2025-12-23T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15
  }
}
```

---

### Get Completed Resources
**GET** `/users/completed`
- **Authentication**: Required
- **Description**: Get all completed resources

**Query Parameters**:
```
?page=1&limit=10&sort=newest
```

**Response** (200):
```json
{
  "success": true,
  "completed_resources": [
    {
      "id": "uuid",
      "resource": {
        "id": "uuid",
        "title": "React Hooks Tutorial",
        "mentor": { "firstName": "John", "lastName": "Doe" },
        "rating": 4.5
      },
      "completed_at": "2025-12-23T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8
  }
}
```

---

### Get User's Reviews
**GET** `/users/reviews`
- **Authentication**: Required
- **Description**: Get all reviews written by user

**Query Parameters**:
```
?page=1&limit=10&sort=newest
```

**Response** (200):
```json
{
  "success": true,
  "reviews": [
    {
      "id": "uuid",
      "resource": {
        "id": "uuid",
        "title": "React Hooks Tutorial"
      },
      "rating": 5,
      "review_text": "Excellent resource!",
      "would_recommend": true,
      "helpful_count": 8,
      "created_at": "2025-12-23T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 12
  }
}
```

---

## ERROR RESPONSES

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

### Common HTTP Status Codes

| Code | Meaning | Example |
|------|---------|---------|
| 200 | OK | Successful GET/PUT |
| 201 | Created | Successful POST |
| 400 | Bad Request | Missing/invalid fields |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Database/server issues |

---

## PAGINATION

All list endpoints support pagination:
```
?page=1&limit=10
```

Response includes:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
```

---

## SORTING

Most list endpoints support sorting:
```
?sort=newest|oldest|rating|popular|trending
```

---

## RATE LIMITING

API requests are rate limited to prevent abuse:
- **Default**: 100 requests per 15 minutes per IP
- **Authenticated**: 1000 requests per 15 minutes per user

Exceeding limits returns `429 Too Many Requests`.
