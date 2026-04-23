# Chirper Backend Specification

## 1. Project Overview

This project is a backend-only, class-sized implementation of a simplified Twitter/X-style application called Chirper. The backend will be built as a JSON REST API using Node.js, Express, MySQL/MariaDB, and server-side sessions with an HTTP-only session cookie.

The goal is not to recreate the full modern Twitter/X product. The goal is to implement a smaller, well-scoped social posting backend with clear requirements, persistent relational data, test coverage, and straightforward architecture.

This specification follows the provided database schema. Where product decisions and schema details could have conflicted, the schema has priority.

## 2. Core Scope

The backend must support the following required functionality:

1. Create an account
2. Log in
3. Log out
4. Update profile
5. Create a tweet
6. Delete a tweet
7. View a feed of recent tweets
8. Refresh the feed by calling the feed endpoint again
9. Follow a user
10. Unfollow a user
11. Block a user
12. Unblock a user
13. Like a tweet
14. Unlike a tweet
15. Comment on a tweet
16. Retweet a tweet
17. Unretweet a tweet
18. View user profiles and a user's tweet history

## 3. Explicit Assumptions

- All core application functionality requires authentication except signup, login, and health-check endpoints.
- Users should not be able to view feed data, profiles, or tweet content unless logged in.
- The API returns JSON only. No server-rendered pages are required.
- Server-side sessions with an HTTP-only session cookie will be used instead of JWT.
- The relational database will be MySQL or MariaDB, using the provided Chirper schema.
- Tweets are ordered reverse-chronologically.
- Feed and tweet-list endpoints use `limit` and `offset` pagination.
- Default feed size is `20`.
- Maximum allowed `limit` is `50`.
- Tweets have a maximum length of `240` characters because the schema uses `VARCHAR(240)` for `tweets.text`.
- Comments have a maximum length of `240` characters because the schema uses `VARCHAR(240)` for `comments.contents`.
- Tweet editing is out of scope.
- Username must be unique and immutable after account creation.
- Email must be unique.
- Profile updates will support `name`, `bio`, and `profile_picture`.
- Retweets are simple reposts of an existing tweet with no added commentary.
- Retweets are represented as rows in the `tweets` table using `retweeted_from`.
- Comments are stored in the `comments` table, not the `tweets` table.
- Real-time updates, websockets, and polling infrastructure are out of scope.
- The `blacklisted_tokens` table exists in the schema but will not be used in the session-based MVP.

## 4. Technology Requirements

- Runtime: Node.js
- Framework: Express
- Database: MySQL or MariaDB
- Authentication: Express sessions with HTTP-only cookie
- Password hashing: bcrypt or bcryptjs
- Testing: Jest + Supertest
- Test database: separate database instance/schema from development

## 5. Database-Aligned Data Model

The implementation should follow the provided schema directly.

### 5.1 `users`

Represents application accounts.

Fields:

- `id`
- `username` (`VARCHAR(50)`, unique, required)
- `password_hash` (`TEXT`, required)
- `created_at`
- `email` (`VARCHAR(255)`, unique, required)
- `bio` (`TEXT`, nullable)
- `profile_picture` (`VARCHAR(255)`, nullable)
- `name` (`VARCHAR(100)`, nullable)

Business rules:

- username must be unique
- email must be unique
- username is not editable in this project version
- password is stored only as a secure hash

### 5.2 `tweets`

Represents original tweets and retweets.

Fields:

- `id`
- `user_id`
- `text` (`VARCHAR(240)`, nullable in schema)
- `image_url` (`VARCHAR(255)`, nullable)
- `created_at`
- `retweeted_from` (nullable foreign key to `tweets.id`)

Business rules:

- original tweets must include non-empty `text`
- `text.length <= 240`
- simple retweets create a new row with `retweeted_from` pointing to the original tweet
- retweets do not include added commentary in this project version

### 5.3 `comments`

Represents comments on tweets.

Fields:

- `id`
- `user_id`
- `tweet_id`
- `contents` (`VARCHAR(240)`)
- `created_at`

Business rules:

- comments belong to a tweet
- `contents` is required
- `contents.length <= 240`

### 5.4 `likes`

Represents a user's like on a tweet.

Fields:

- `tweet_id`
- `user_id`
- `created_at`

Business rules:

- a user can like a given tweet at most once

### 5.5 `follows`

Represents follower relationships.

Fields:

- `follower_id`
- `followee_id`
- `created_at`

Business rules:

- a user cannot follow themself
- duplicate follows are not allowed

### 5.6 `blocks`

Represents user blocking relationships.

Fields:

- `blocker_id`
- `blocked_id`
- `created_at`

Business rules:

- a user cannot block themself
- duplicate blocks are not allowed
- creating a block automatically removes follow relationships in either direction

### 5.7 `blacklisted_tokens`

Exists in the schema with:

- `token`
- `expiration_time`
- `created_at`

Project decision:

- this table is not used in the session-based implementation
- it will remain unused unless the auth design changes to token-based auth later

## 6. Authentication and Session Behavior

### 6.1 Signup

Users can create an account with:

- `username`
- `email`
- `password`
- optionally `name`

Validation requirements:

- username required
- username unique
- email required
- email unique
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

- protected endpoints reject access until the user logs in again

### 6.4 Protected API Rule

For this assignment, assume the core application API is authenticated-only after login.

Unauthenticated requests should generally return:

- `401 Unauthorized`

## 7. API Resource Requirements

The route names below are recommended because they align with the schema and assignment language.

### 7.1 Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

Expected behavior:

- signup creates an account
- signup may optionally create a session immediately, but this should be documented if used
- login creates a session
- logout destroys the session
- `GET /auth/me` returns the current authenticated user

### 7.2 Users and Profiles

- `GET /users/:username`
- `PATCH /users/me`
- `GET /users/:username/tweets`

Profile rules:

- authenticated users can view another user's profile unless blocked
- authenticated users can view another user's tweets unless blocked
- only the current user can update their own profile
- editable fields: `name`, `bio`, `profile_picture`
- `username` is not editable
- `email` should remain immutable in the MVP

### 7.3 Tweets

- `POST /tweets`
- `GET /tweets/:tweetId`
- `DELETE /tweets/:tweetId`

Rules:

- only the author may delete a tweet
- deleting a tweet should also remove dependent likes and comments
- deleting an original tweet should also remove retweet rows created from that tweet at the application layer
- block relationships should prevent reading tweet content where applicable

Implementation note:

- the schema uses `ON DELETE SET NULL` on `tweets.retweeted_from`
- to preserve clean product behavior, the application should explicitly delete retweet rows before deleting the original tweet

### 7.4 Feed

- `GET /feed`

Query parameters:

- `limit` default `20`
- `offset` default `0`
- maximum `limit = 50`

Feed behavior:

- return reverse-chronological feed items
- include the authenticated user's own tweets
- include original tweets from users the authenticated user follows
- include retweets made by users the authenticated user follows
- when a followed user retweets a tweet, that retweet appears as a separate feed item ordered by the retweet time
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

- `POST /tweets/:tweetId/like`
- `DELETE /tweets/:tweetId/like`

Rules:

- duplicate likes should not be created
- user cannot like content they are not allowed to access due to blocking

### 7.8 Comments

- `POST /tweets/:tweetId/comments`
- `GET /tweets/:tweetId/comments`

Rules:

- comment creation should fail if the parent tweet does not exist
- comment creation should fail if block rules prevent interaction
- comment listing should respect block visibility rules

### 7.9 Retweets

- `POST /tweets/:tweetId/retweet`
- `DELETE /tweets/:tweetId/retweet`

Rules:

- duplicate retweets should not be created
- retweets create tweet rows instead of rows in a separate retweets table
- retweet creation should fail if block rules prevent interaction
- unretweet deletes the current user's retweet row for that original tweet

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
    "message": "Tweet text must be 240 characters or fewer."
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
- A cannot like, comment on, or retweet B's tweets
- B cannot like, comment on, or retweet A's tweets
- existing follow relationships between A and B are deleted both directions
- blocked content should not appear in feed results

### 9.2 Feed Rules

The authenticated timeline includes:

- the user's own original tweets
- original tweets from followed users
- retweets by followed users

The timeline excludes:

- content from blocked users
- content from users who have blocked the viewer
- items outside the requested pagination window

Ordering:

- newest first
- original tweets ordered by tweet creation time
- retweet feed items ordered by retweet creation time

### 9.3 Deletion Rules

When a tweet is deleted:

- only the author may perform the deletion
- dependent likes are deleted
- dependent comments are deleted
- dependent retweet rows should also be deleted by the application

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

- required fields on signup, login, profile update, and tweet creation
- username uniqueness
- email uniqueness
- password restrictions
- tweet text length
- comment text length
- valid numeric pagination values
- `limit <= 50`
- referenced user exists
- referenced tweet exists
- self-follow not allowed
- self-block not allowed
- delete-tweet only by author
- protected routes require authentication

## 11. Error Handling Requirements

The backend should use standard HTTP status codes.

Recommended usage:

- `200 OK` for successful reads, updates, and deletes
- `201 Created` for successful creates
- `400 Bad Request` for malformed input
- `401 Unauthorized` for missing or invalid session
- `403 Forbidden` for authenticated but disallowed actions
- `404 Not Found` for missing users or tweets
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
- create tweet success and validation failure
- delete tweet success and non-author failure
- feed ordering and pagination
- follow and unfollow behavior
- block and unblock behavior
- automatic follow removal on block
- like and unlike behavior
- comment creation and listing behavior
- retweet and unretweet behavior
- block-rule enforcement across reads and interactions
- deletion cleanup for likes, comments, and retweets

Tests should emphasize:

- API behavior
- session/auth flows
- validation
- permissions
- relational edge cases

## 13. Out of Scope

The following are intentionally out of scope for this project version:

- quote-retweets
- tweet editing
- hashtags, mentions, and search
- media upload/storage beyond storing an `image_url` string
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
4. Tweets: create, read, delete
5. Feed: authenticated reverse-chronological feed with pagination
6. Follows: follow and unfollow
7. Likes: like and unlike
8. Comments: create comments and list comments
9. Retweets: retweet and unretweet, feed integration
10. Blocks: block, unblock, remove follow edges, enforce visibility and interaction rules everywhere
11. Final cleanup: validation hardening, error consistency, test coverage, prompt logs, and documentation

## 15. Architecture Notes for Later Documentation

These decisions should later be explained in the architecture document:

- Why Express was chosen for a simple REST backend
- Why MySQL/MariaDB was chosen to match the provided schema
- Why server-side sessions were chosen over JWT even though the schema includes `blacklisted_tokens`
- Why the implementation follows the provided schema directly
- Why comments use the separate `comments` table instead of forcing replies into `tweets`
- Why retweets are represented with `tweets.retweeted_from`
- Why reverse-chronological feed with limit/offset was chosen over cursor-based pagination
- Why blocking removes follow relationships in both directions
- Why username immutability was chosen even though the assignment text mentions profile updates
- Why the project uses a smaller MVP scope instead of a full Twitter clone
