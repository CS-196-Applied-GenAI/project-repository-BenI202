# Chirper Backend

Simplified Twitter/X-style backend built with Node.js, Express, and MySQL/MariaDB.

## Overview

This project implements the backend for a small social-media application called Chirper. It supports:

- account creation
- login and logout with server-side sessions
- profile viewing and updating
- creating, viewing, and deleting tweets
- viewing a reverse-chronological feed
- following and unfollowing users
- blocking and unblocking users
- liking and unliking tweets
- commenting on tweets
- retweeting and unretweeting tweets

The API is JSON-only and is designed for a separate frontend/client.

## Tech Stack

- Node.js
- Express
- MySQL/MariaDB
- express-session
- Jest
- Supertest

## Project Structure

```text
project-repository-BenI202/
  src/
    config/
    middleware/
    repositories/
    routes/
    services/
    utils/
  tests/
  sql/
  spec.md
  plan.md
  prompt-log.md
```

## Installation

From the project root:

```bash
npm install
```

## Environment Setup

Copy the example environment file and fill in your local database credentials:

```bash
cp .env.example .env
```

The important variables are:

- `PORT`
- `SESSION_SECRET`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `TEST_DB_HOST`
- `TEST_DB_PORT`
- `TEST_DB_USER`
- `TEST_DB_PASSWORD`
- `TEST_DB_NAME`

## Database Setup

Create two databases locally:

- `chirper`
- `chirper_test`

Then load the schema file into both databases:

```bash
mysql -u root -p chirper < sql/schema.sql
mysql -u root -p chirper_test < sql/schema.sql
```

If your username or host is different, adjust the commands accordingly.

## Running the App

Start the development server:

```bash
npm run dev
```

Start without nodemon:

```bash
npm start
```

The app will run on the port defined in `.env`, or `3000` by default.

## Running Tests

Run the full test suite with coverage:

```bash
npm test
```

Coverage output appears:

- in the terminal summary
- in `coverage/coverage-final.json`
- in `coverage/clover.xml`
- in `coverage/lcov-report/index.html`

## API Summary

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

### Users

- `GET /users/:username`
- `PATCH /users/me`
- `GET /users/:username/tweets`
- `POST /users/:username/follow`
- `DELETE /users/:username/follow`
- `POST /users/:username/block`
- `DELETE /users/:username/block`

### Tweets

- `POST /tweets`
- `GET /tweets/:tweetId`
- `DELETE /tweets/:tweetId`
- `POST /tweets/:tweetId/like`
- `DELETE /tweets/:tweetId/like`
- `POST /tweets/:tweetId/comments`
- `GET /tweets/:tweetId/comments`
- `POST /tweets/:tweetId/retweet`
- `DELETE /tweets/:tweetId/retweet`

### Feed

- `GET /feed`

## Important Notes

- Authentication uses server-side sessions, not JWT.
- All meaningful application routes require login.
- Tweet text and comment text are limited to 240 characters.
- Blocked users cannot view or interact with each other's content.
- Retweets are modeled as tweet rows referencing an original tweet.

## Project Documents

- [spec.md](/Users/benjaminisaac/CS%20196/project-repository-BenI202/spec.md)
- [plan.md](/Users/benjaminisaac/CS%20196/project-repository-BenI202/plan.md)
- [prompt-log.md](/Users/benjaminisaac/CS%20196/project-repository-BenI202/prompt-log.md)

## Submission Notes

The backend code and tests are included in the repository. The architecture decisions write-up was intentionally prepared outside the repo so it can be pasted separately if needed.
