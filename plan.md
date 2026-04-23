# Backend Development Plan

This plan is derived from [spec.md](/Users/benjaminisaac/CS%20196/project-repository-BenI202/spec.md). The goal is to turn the spec into a build order that is safe, incremental, and testable at every step.

## 1. Planning Approach

The project should not be built as one large implementation pass. The safest approach is:

1. establish the app skeleton and test harness
2. build authentication first
3. add one resource or behavior at a time
4. attach tests immediately to each feature
5. delay the hardest cross-cutting rules, especially blocking, until the simpler feature paths already work
6. finish by hardening validation, coverage, and prompt documentation

This plan intentionally favors small vertical slices over large subsystem rewrites.

## 2. Recommended Repository Shape

The exact file names can vary, but a simple layout like this will keep the code readable:

```text
project-repository-BenI202/
  src/
    app.js
    server.js
    config/
      env.js
      db.js
      session.js
    middleware/
      requireAuth.js
      errorHandler.js
    routes/
      authRoutes.js
      userRoutes.js
      tweetRoutes.js
      feedRoutes.js
    services/
      authService.js
      userService.js
      tweetService.js
      followService.js
      likeService.js
      commentService.js
      retweetService.js
      blockService.js
      feedService.js
    repositories/
      userRepository.js
      tweetRepository.js
      followRepository.js
      likeRepository.js
      commentRepository.js
      blockRepository.js
    utils/
      validators.js
      errors.js
      response.js
  tests/
    helpers/
      db.js
      auth.js
    auth.test.js
    users.test.js
    tweets.test.js
    feed.test.js
    follows.test.js
    likes.test.js
    comments.test.js
    retweets.test.js
    blocks.test.js
  sql/
    schema.sql
    test-seed.sql
  prompt-logs/
    phase-01.md
    phase-02.md
```

The key design choice is simple separation:

- routes handle HTTP
- services hold business rules
- repositories hold SQL access
- middleware enforces auth and shared behavior
- tests verify behavior through the API, not by calling internal functions directly

## 3. First-Pass Milestones

A first draft of the project naturally breaks into these major chunks:

1. setup and infrastructure
2. authentication
3. users and profiles
4. tweets
5. feed
6. follows
7. likes
8. comments
9. retweets
10. blocks
11. hardening and documentation

This is still too coarse. Several of these chunks are large enough to hide multiple failure modes.

## 4. Second-Pass Breakdown

Breaking the coarse milestones into smaller implementation chunks:

### 4.1 Setup and Infrastructure

- initialize Node/Express project
- add dependencies and scripts
- add app entry point
- add database connection utility
- add environment configuration
- add session middleware
- add shared error format
- add Jest + Supertest harness
- add test database reset helpers

### 4.2 Authentication

- add signup validation
- add signup endpoint
- add login endpoint
- add logout endpoint
- add current-user endpoint
- add auth-required middleware

### 4.3 Users and Profiles

- add profile read endpoint
- add profile update endpoint
- add user-posts listing endpoint

### 4.4 Tweets

- add create-tweet endpoint
- add read-tweet endpoint
- add delete-tweet endpoint

### 4.5 Feed

- add feed query for own tweets plus followed users' original tweets
- add pagination validation
- add reverse-chronological ordering

### 4.6 Social Actions

- add follow
- add unfollow
- add like
- add unlike
- add comment
- add list comments
- add retweet
- add unretweet
- add retweet feed integration

### 4.7 Blocking and Enforcement

- add block endpoint
- add unblock endpoint
- remove follow edges on block
- enforce block rules on reads
- enforce block rules on interactions
- enforce block rules in feed queries

### 4.8 Hardening

- normalize error responses
- close validation gaps
- improve test coverage
- document prompt history and architecture tradeoffs

This is closer, but some chunks are still a little large. The feed, blocking, and setup areas still need finer boundaries.

## 5. Final Right-Sized Implementation Steps

These are the steps I would actually use for implementation. Each step should end with passing tests and a repo state that is safe to build on.

### Step 1: Project Bootstrap

Goal:
- create `package.json`
- install core runtime and dev dependencies
- add scripts for `dev`, `start`, `test`, and coverage

Implementation:
- initialize Node project
- install `express`, `express-session`, `mysql2`, `bcryptjs`, `dotenv`
- install `jest`, `supertest`, `nodemon`

Tests:
- none beyond confirming the test command runs

Done when:
- project installs cleanly
- `npm test` executes without framework errors

Prompt log worth saving:
- prompt used to choose the dependency set and script names

### Step 2: App Skeleton and Health Route

Goal:
- create the Express app with JSON parsing and a minimal route

Implementation:
- add `src/app.js`
- add `src/server.js`
- add `GET /health`

Tests:
- `GET /health` returns `200`

Done when:
- app boots locally
- Supertest can hit the app without starting a real server process

### Step 3: Environment and Database Wiring

Goal:
- centralize env loading and DB connection setup

Implementation:
- add env config module
- add MySQL connection pool helper
- decide whether to use raw SQL or a minimal repository layer
- document required env vars

Tests:
- simple DB connectivity check in test setup or a lightweight integration smoke test

Done when:
- app can connect to development DB
- tests can target a separate test DB

### Step 4: Session Configuration

Goal:
- add server-side session support before auth endpoints exist

Implementation:
- configure `express-session`
- add secure cookie defaults appropriate for local development and tests
- ensure sessions are attached to the app

Tests:
- none yet beyond app boot stability

Done when:
- request handlers can read and write `req.session`

### Step 5: Shared Error and Response Utilities

Goal:
- standardize success and error payloads early

Implementation:
- add response helpers
- add custom error utilities
- add centralized Express error middleware

Tests:
- one small route or unit-level middleware test verifying consistent error JSON

Done when:
- controllers can throw known errors and produce uniform API responses

### Step 6: Test Database Reset Helpers

Goal:
- make integration tests deterministic before implementing real features

Implementation:
- add helpers to clear tables in dependency-safe order
- add helpers to seed users or sessions later
- wire Jest setup/teardown

Tests:
- test helper itself indirectly by running a basic request test with clean state

Done when:
- each test file can start from a known DB state

### Step 7: Auth Guard Middleware

Goal:
- implement the `401` gate that protects most routes

Implementation:
- add `requireAuth` middleware
- leave `signup`, `login`, and `health` unprotected

Tests:
- unauthenticated request to a protected test route returns `401`
- authenticated request can pass through

Done when:
- access control works before business endpoints are added

### Step 8: Signup Endpoint

Goal:
- support account creation with password hashing and username uniqueness

Implementation:
- add signup validation
- hash password with bcryptjs
- create user row
- decide whether signup also creates a session immediately

Tests:
- successful signup
- duplicate username rejected
- weak password rejected
- missing required field rejected

Done when:
- new users are persisted with hashed passwords

### Step 9: Login Endpoint

Goal:
- support session-based login

Implementation:
- verify username/password
- create session with current user ID

Tests:
- valid credentials login succeeds
- bad password returns `401`
- unknown username returns `401`
- session persists across requests with Supertest agent

Done when:
- authenticated tests can reliably log in

### Step 10: Logout and Current-User Endpoint

Goal:
- complete the auth lifecycle

Implementation:
- add `POST /auth/logout`
- add `GET /auth/me`

Tests:
- logged-in user can fetch current profile summary
- logout destroys session
- protected route fails after logout

Done when:
- full signup/login/logout flow is working

### Step 11: Read User Profile

Goal:
- allow authenticated users to view another user's profile

Implementation:
- add `GET /users/:username`
- return public profile fields only

Tests:
- existing user profile returns `200`
- missing user returns `404`
- unauthenticated request returns `401`

Done when:
- user lookup behavior is stable

### Step 12: Update Own Profile

Goal:
- support profile edits without allowing username changes

Implementation:
- add `PATCH /users/me`
- allow `name`, `bio`, `profile_picture`
- reject `username` updates

Tests:
- profile update success
- invalid field rejected
- username update rejected

Done when:
- editable profile fields work and username remains immutable

### Step 13: Create Tweet

Goal:
- support original tweet creation

Implementation:
- add `POST /tweets`
- validate text presence and 240-character limit
- store as non-retweet tweet

Tests:
- create tweet success
- empty content rejected
- over-limit content rejected
- unauthenticated create rejected

Done when:
- authenticated users can publish tweets

### Step 14: Read Single Tweet

Goal:
- support fetching a single tweet record

Implementation:
- add `GET /tweets/:tweetId`
- join author summary if useful

Tests:
- existing tweet returns `200`
- missing tweet returns `404`

Done when:
- single-tweet reads work independently of feed

### Step 15: Delete Tweet

Goal:
- support author-only deletion

Implementation:
- add `DELETE /tweets/:tweetId`
- verify ownership before deletion

Tests:
- author can delete tweet
- non-author gets `403`
- missing tweet returns `404`

Done when:
- tweet ownership enforcement works

### Step 16: List a User's Tweets

Goal:
- support `GET /users/:username/tweets`

Implementation:
- add reverse-chronological listing for one user's tweets
- add `limit` and `offset` handling

Tests:
- tweets are newest first
- pagination works
- missing user returns `404`

Done when:
- the same pagination approach needed for feed has already been proven on a simpler query

### Step 17: Follow a User

Goal:
- create follow relationships

Implementation:
- add `POST /users/:username/follow`
- reject self-follow
- choose duplicate follow behavior

Tests:
- follow success
- self-follow rejected
- duplicate follow handled consistently
- missing target user returns `404`

Done when:
- following works and is constrained correctly

### Step 18: Unfollow a User

Goal:
- remove follow relationships

Implementation:
- add `DELETE /users/:username/follow`

Tests:
- unfollow success
- unfollow non-followed user behaves consistently

Done when:
- follow lifecycle is complete

### Step 19: Feed v1 for Own Posts and Followed Users' Posts

Goal:
- implement the simplest correct timeline first

Implementation:
- add `GET /feed`
- include own tweets plus original tweets from followed users
- support `limit`, `offset`, default `20`, max `50`

Tests:
- own tweets appear
- followed users' tweets appear
- unfollowed users' tweets do not appear
- ordering is newest first
- pagination is enforced

Done when:
- a useful baseline feed exists before retweets and blocks complicate the query

### Step 20: Like a Tweet

Goal:
- support likes

Implementation:
- add `POST /tweets/:tweetId/like`
- enforce one like per user per tweet

Tests:
- like success
- duplicate like handled consistently
- missing tweet returns `404`

Done when:
- interaction table pattern is established

### Step 21: Unlike a Tweet

Goal:
- remove likes

Implementation:
- add `DELETE /tweets/:tweetId/like`

Tests:
- unlike success
- unlike non-liked post behaves consistently

Done when:
- like lifecycle is complete

### Step 22: Comment on a Tweet

Goal:
- support comments using the `comments` table

Implementation:
- add `POST /tweets/:tweetId/comments`
- create a row in `comments` with `tweet_id`

Tests:
- comment success
- missing parent tweet returns `404`
- over-limit comment rejected

Done when:
- comments are persisted independently from tweets

### Step 23: List Comments for a Tweet

Goal:
- expose the comments under a parent tweet

Implementation:
- add `GET /tweets/:tweetId/comments`

Tests:
- comments returned in expected order
- missing parent tweet handled consistently

Done when:
- comment creation can be validated through an API read path

### Step 24: Retweet a Post

Goal:
- support simple repost behavior

Implementation:
- add `POST /tweets/:tweetId/retweet`
- create a tweet row with `retweeted_from`

Tests:
- retweet success
- duplicate retweet handled consistently
- missing tweet returns `404`

Done when:
- retweet behavior is stored using the `tweets` table as defined by the schema

### Step 25: Unretweet a Post

Goal:
- remove retweets

Implementation:
- add `DELETE /tweets/:tweetId/retweet`

Tests:
- unretweet success
- unretweet non-retweeted post behaves consistently

Done when:
- retweet lifecycle is complete

### Step 26: Feed v2 with Retweets

Goal:
- upgrade the feed to include retweet events

Implementation:
- merge original posts and retweet items into one reverse-chronological feed
- order retweet items by retweet creation time
- include enough metadata for the client to distinguish original tweet vs retweet item

Tests:
- followed user's retweet appears even if original author is not followed
- retweet item is ordered by retweet time
- user's own posts still appear correctly

Done when:
- feed behavior matches the spec before block enforcement is layered in

### Step 27: Block a User

Goal:
- create block relationships and remove follow edges

Implementation:
- add `POST /users/:username/block`
- reject self-block
- remove follow rows in both directions in the same logical operation

Tests:
- block success
- self-block rejected
- follows removed both directions

Done when:
- data mutation side effects from blocking are correct

### Step 28: Unblock a User

Goal:
- remove block relationships

Implementation:
- add `DELETE /users/:username/block`

Tests:
- unblock success
- unblock non-blocked user behaves consistently

Done when:
- block lifecycle is complete

### Step 29: Enforce Block Rules on Profile and Post Reads

Goal:
- prevent blocked users from reading each other's profile and tweet data

Implementation:
- add block checks to `GET /users/:username`
- add block checks to `GET /users/:username/tweets`
- add block checks to `GET /tweets/:tweetId`
- add block checks to `GET /tweets/:tweetId/comments`

Tests:
- blocker cannot view blocked user's profile or tweets
- blocked user cannot view blocker's profile or tweets

Done when:
- read visibility matches the spec

### Step 30: Enforce Block Rules on Interactions

Goal:
- prevent blocked users from following, liking, commenting, and retweeting across block boundaries

Implementation:
- add block checks to follow
- add block checks to like/unlike where relevant
- add block checks to comment
- add block checks to retweet/unretweet where relevant

Tests:
- blocked relationships prevent follow
- blocked relationships prevent like
- blocked relationships prevent comment
- blocked relationships prevent retweet

Done when:
- mutation endpoints respect blocking consistently

### Step 31: Enforce Block Rules in Feed

Goal:
- exclude blocked users' content from the timeline query

Implementation:
- update feed SQL to remove:
  - content from users the viewer has blocked
  - content from users who have blocked the viewer
  - retweet events that would expose blocked content

Tests:
- blocked users' original posts disappear from feed
- blocked users' retweets disappear from feed
- users do not see content from accounts that blocked them

Done when:
- feed visibility is consistent with the global block policy

### Step 32: Cascade Delete Verification

Goal:
- confirm delete behavior cleans up dependent rows

Implementation:
- either rely on DB foreign-key cascade or explicit service logic
- make the chosen approach visible in tests

Tests:
- deleting a tweet removes its likes
- deleting a tweet removes its retweets
- deleting a tweet removes its comments

Done when:
- tweet deletion leaves no dangling relational data

### Step 33: Validation and Error Pass

Goal:
- normalize edge-case behavior across the API

Implementation:
- review all endpoints for status-code consistency
- review all validation messages
- review duplicate-action handling
- review pagination parsing and limits

Tests:
- add focused regression tests for any inconsistent error cases found

Done when:
- API behavior feels uniform rather than endpoint-by-endpoint improvised

### Step 34: Coverage and Documentation Pass

Goal:
- get the project submission-ready

Implementation:
- run coverage
- add missing tests
- record prompt history by phase
- capture architecture decision notes while they are still fresh

Tests:
- no new feature tests required beyond gap-filling coverage

Done when:
- coverage is acceptable for the assignment
- prompt logs and architecture notes are ready to reuse in the final write-up

## 6. Why These Steps Are Right-Sized

The steps above are intentionally narrow:

- each step introduces one endpoint or one cross-cutting rule
- each step can usually be implemented in one focused work session
- each step has a clear test target
- difficult concerns like feed composition and block enforcement are delayed until the simpler CRUD and auth behavior is already stable

The steps are also large enough to matter:

- each step adds visible functionality
- each step leaves behind reusable helpers or infrastructure
- the plan avoids wasting time on abstractions before there is enough behavior to justify them

## 7. Suggested Prompt Logging Strategy

Because the assignment cares about AI collaboration, save prompt history by phase rather than trying to reconstruct everything at the end.

Recommended log buckets:

1. setup and project structure prompts
2. auth and session prompts
3. tweet and feed query prompts
4. interaction feature prompts for follows, likes, comments, retweets
5. blocking-rule and edge-case prompts
6. testing and coverage prompts
7. architecture tradeoff prompts

For each saved prompt, note:

- what you asked the AI to do
- what file(s) or feature the prompt affected
- whether the result was used directly, adapted, or rejected
- what you changed manually afterward

## 8. Execution Advice

When you start implementation, do not jump ahead across multiple steps. Stay disciplined:

1. implement one step
2. write or update its tests
3. run tests
4. clean up naming and error handling
5. commit or checkpoint
6. move to the next step

That will keep the project understandable, easier to debug, and much easier to explain in the assignment write-up.
