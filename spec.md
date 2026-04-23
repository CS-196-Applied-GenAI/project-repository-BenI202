# Simplified Twitter/X Backend Specification

## 1. Project Overview

This project is a backend-only, class-sized implementation of a simplified Twitter/X-style application. The backend will be built as a JSON REST API using Node.js, Express, MySQL/MariaDB, and server-side sessions with an HTTP-only session cookie.

The goal is not to recreate the full modern Twitter/X product. The goal is to implement a smaller, well-scoped social posting backend with clear requirements, persistent relational data, test coverage, and straightforward architecture.

## 2. Core Scope

The backend must support the following required functionality:

1. Create an account
2. Log in
3. Log out
4. Update profile
5. Create a post
6. Delete a post
7. View a feed of recent posts
8. Refresh the feed by calling the feed endpoint again
9. Follow a user
10. Unfollow a user
11. Block a user
12. Unblock a user
13. Like a post
14. Unlike a post
15. Reply to a post
16. Retweet a post
17. Unretweet a post
18. View user profiles and a user's post history

## 3. Explicit Assumptions

- All content and account functionality requires authentication.
- Users should not be able to view feed data, profiles, or post content unless logged in.
- The API returns JSON only. No server-rendered pages are required.
- Username must be unique.
- Username will be treated as immutable after account creation, even though the assignment text mentions username updates.
- Passwords must be securely hashed.
- Server-side sessions with an HTTP-only session cookie will be used instead of JWT.
- The relational database will be MySQL or MariaDB, using the provided course schema where applicable.
- Posts are ordered reverse-chronologically.
- Feed and post-list endpoints use `limit` and `offset` pagination.
- Default feed size is `20`.
- Maximum allowed `limit` is `50`.
- Posts have a maximum length of `280` characters.
- Post editing is out of scope.
- Retweets are simple reposts of an existing post with no added commentary.
- Replies are stored in the same posts table using a parent-post reference.
- Real-time updates, websockets, and polling infrastructure are out of scope.

## 4. Technology Requirements

- Runtime: Node.js
- Framework: Express
- Database: MySQL or MariaDB
- Authentication: Express sessions with HTTP-only cookie
- Password hashing: bcrypt or bcryptjs
- Testing: Jest + Supertest
- Test database: separate database instance/schema from development

## 5. High-Level Data Model

The implementation should stay close to the provided relational schema, but the backend logic should support at least the following conceptual entities.

### 5.1 Users

Represents application accounts.

Suggested fields:

- `id`
- `username` (unique, required)
- `password_hash` (required)
- `display_name` (required or defaulted from username)
- `bio` (nullable)
- `profile_image_url` (nullable)
- `created_at`
- `updated_at`

### 5.2 Posts

Represents original posts and replies.

Suggested fields:

- `id`
- `author_id`
- `content`
- `parent_post_id` (nullable, used for replies)
- `created_at`

Rules:

- `content` is required
- `content.length <= 280`
- Original posts have `parent_post_id = NULL`
- Replies reference another post in `parent_post_id`

### 5.3 Follows

Represents follower relationships.

Suggested fields:

- `follower_id`
- `followed_id`
- `created_at`

Rules:

- A user cannot follow themself
- Duplicate follow rows should not be allowed

### 5.4 Blocks

Represents user blocking relationships.

Suggested fields:

- `blocker_id`
- `blocked_id`
- `created_at`

Rules:

- A user cannot block themself
- Duplicate block rows should not be allowed
- Creating a block automatically removes any follow relationship in either direction

### 5.5 Likes

Represents a user's like on a post.

Suggested fields:

- `user_id`
- `post_id`
- `created_at`

Rules:

- A user can like a given post at most once

### 5.6 Retweets

Represents a simple retweet of an existing post.

Suggested fields:

- `user_id`
- `post_id`
- `created_at`

Rules:

- A user can retweet a given post at most once
- Retweets do not store extra text

### 5.7 Sessions

Represents authenticated server-side session state.

Suggested fields depend on the session store, but the API must support:

- login creating a session
- logout destroying the session
- protected endpoints requiring a valid session

## 6. Authentication and Session Behavior

### 6.1 Signup

Users can create an account with:

- `username`
- `password`
- optionally `display_name`

Validation requirements:

- username required
- username unique
- password required
- password must satisfy basic restrictions

Recommended password rules:

- minimum 8 characters
- at least one letter
- at least one number

### 6.2 Login

Users log in with username and password.

On successful login:

- server creates a session
- session cookie is sent as HTTP-only
- response returns authenticated user summary

On failed login:

- return `401 Unauthorized`

### 6.3 Logout

On logout:

- session is destroyed
- session cookie is invalidated

After logout:

- protected endpoints should reject access until the user logs in again

### 6.4 Protected API Rule

Unless an endpoint is explicitly public, all API endpoints in this project are protected. For this assignment, assume the core application API is authenticated-only.

Unauthenticated requests should generally return:

- `401 Unauthorized`

## 7. API Resource Requirements

The exact route names may vary slightly during implementation, but the backend should support the following endpoint groups.

### 7.1 Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

Expected behavior:

- signup creates account and may optionally log the user in immediately
- login creates session
- logout destroys session
- `GET /auth/me` returns the current authenticated user

### 7.2 Users and Profiles

- `GET /users/:username`
- `PATCH /users/me`
- `GET /users/:username/posts`

Profile rules:

- authenticated users can view another user's profile unless blocked
- authenticated users can view another user's posts unless blocked
- only the current user can update their own profile
- editable fields: `display_name`, `bio`, `profile_image_url`
- `username` is not editable in this project version

### 7.3 Posts

- `POST /posts`
- `GET /posts/:postId`
- `DELETE /posts/:postId`
- `GET /posts/:postId/replies`

Rules:

- only the author may delete a post
- deleting a post cascades to dependent likes, retweets, and replies
- a blocked relationship should prevent reading content where applicable

### 7.4 Feed

- `GET /feed`

Query parameters:

- `limit` default `20`
- `offset` default `0`
- maximum `limit = 50`

Feed behavior:

- return reverse-chronological feed items
- include the authenticated user's own posts
- include original posts from users the authenticated user follows
- include retweets made by users the authenticated user follows
- when a followed user retweets a post, that retweet appears as a separate feed item ordered by the retweet time
- retweeted content may originate from a user the viewer does not follow
- blocked-user rules must always be enforced
- refreshing the feed means calling `GET /feed` again

### 7.5 Follow System

- `POST /users/:username/follow`
- `DELETE /users/:username/follow`

Rules:

- user cannot follow themself
- cannot follow a user when either side has blocked the other
- duplicate follows should not be created

### 7.6 Block System

- `POST /users/:username/block`
- `DELETE /users/:username/block`

Rules:

- user cannot block themself
- blocking removes follows in both directions
- once blocked, neither user should see the other's content
- once blocked, neither user should interact with the other's content

### 7.7 Likes

- `POST /posts/:postId/like`
- `DELETE /posts/:postId/like`

Rules:

- duplicate likes should not be created
- user cannot like content they are not allowed to access due to blocking

### 7.8 Replies

- `POST /posts/:postId/replies`

Rules:

- replies are stored in the posts table
- reply row should store `parent_post_id`
- reply creation should fail if the parent post does not exist
- reply creation should fail if block rules prevent interaction

### 7.9 Retweets

- `POST /posts/:postId/retweet`
- `DELETE /posts/:postId/retweet`

Rules:

- duplicate retweets should not be created
- retweets are separate actions, not edited post copies
- retweet creation should fail if block rules prevent interaction

## 8. Response Shape Requirements

The API should return consistent JSON responses.

Recommended success pattern:

```json
{
  "data": {}
}
```

Recommended error pattern:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Content must be 280 characters or fewer."
  }
}
```

Exact JSON shape may vary, but it must be consistent across the project.

## 9. Business Rules

### 9.1 Blocking Rules

If user A blocks user B:

- A cannot see B's content
- B cannot see A's content
- A cannot follow B
- B cannot follow A
- A cannot like, reply to, or retweet B's posts
- B cannot like, reply to, or retweet A's posts
- existing follow relationships between A and B are deleted both directions
- blocked content should not appear in feed results

### 9.2 Feed Rules

The authenticated timeline includes:

- the user's own original posts
- original posts from followed users
- retweets by followed users

The timeline excludes:

- content from blocked users
- content from users who have blocked the viewer
- items outside the requested pagination window

Ordering:

- newest first
- original posts ordered by post creation time
- retweet feed items ordered by retweet creation time

### 9.3 Deletion Rules

When a post is deleted:

- only the author may perform the deletion
- dependent likes are deleted
- dependent retweets are deleted
- dependent replies are deleted

### 9.4 Duplicate Action Rules

The backend should prevent duplicates for:

- follows
- blocks
- likes
- retweets

Implementation may either:

- return success without creating a second row, or
- return a validation/conflict response

The chosen behavior should be consistent and documented in implementation.

## 10. Validation Requirements

The backend should validate at least the following:

- required fields on signup, login, profile update, and post creation
- username uniqueness
- password restrictions
- post content length
- valid numeric pagination values
- `limit <= 50`
- referenced user exists
- referenced post exists
- self-follow not allowed
- self-block not allowed
- delete-post only by author
- protected routes require authentication

## 11. Error Handling Requirements

The backend should use standard HTTP status codes.

Recommended usage:

- `200 OK` for successful reads and deletes
- `201 Created` for successful creates
- `400 Bad Request` for malformed input
- `401 Unauthorized` for missing or invalid session
- `403 Forbidden` for authenticated but disallowed actions
- `404 Not Found` for missing users/posts
- `409 Conflict` for uniqueness or duplicate-action conflicts
- `500 Internal Server Error` for unexpected server errors

## 12. Testing Requirements

The project must include automated tests using Jest and Supertest against a separate test database.

Tests should cover at least:

- signup success and failure cases
- login success and failure cases
- logout behavior
- protected-route enforcement
- profile update behavior
- create post success and validation failure
- delete post success and non-author failure
- feed ordering and pagination
- follow and unfollow behavior
- block and unblock behavior
- automatic follow removal on block
- like and unlike behavior
- reply creation behavior
- retweet and unretweet behavior
- block-rule enforcement across reads and interactions
- cascade deletion of likes, replies, and retweets after post deletion

Tests should emphasize:

- API behavior
- session/auth flows
- validation
- permissions
- relational edge cases

## 13. Out of Scope

The following are intentionally out of scope for this project version:

- quote-retweets
- post editing
- hashtags, mentions, and search
- media upload/storage
- notifications
- direct messages
- OAuth or third-party login
- email verification
- password reset
- admin roles
- real-time updates or websockets
- recommendation algorithms
- public unauthenticated browsing

## 14. Recommended Build Order

Implementation should proceed incrementally in this order:

1. Project setup, database connection, session setup, and test infrastructure
2. Accounts: signup, login, logout, auth guard, current-user endpoint
3. Profiles: profile read and update
4. Posts: create, read, delete
5. Feed: authenticated reverse-chronological feed with pagination
6. Follows: follow and unfollow
7. Likes: like and unlike
8. Replies: create replies and list replies
9. Retweets: retweet and unretweet, feed integration
10. Blocks: block, unblock, remove follow edges, enforce visibility and interaction rules everywhere
11. Final cleanup: validation hardening, error consistency, test coverage, prompt logs, and documentation

## 15. Architecture Notes for Later Documentation

These decisions should later be explained in the architecture document:

- Why Express was chosen for a simple REST backend
- Why MySQL/MariaDB was chosen to match the provided schema
- Why server-side sessions were chosen over JWT
- Why replies use the same posts table instead of a separate comments table
- Why retweets are simple reposts rather than quote-retweets
- Why reverse-chronological feed with limit/offset was chosen over cursor-based pagination
- Why blocking removes follow relationships in both directions
- Why username immutability was chosen even though the assignment text mentions profile updates
- Why the project uses a smaller MVP scope instead of a full Twitter clone
