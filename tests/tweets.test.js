jest.mock("../src/repositories/userRepository", () => ({
  findUserByUsername: jest.fn(),
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  createUser: jest.fn(),
  updateUserProfile: jest.fn()
}));

jest.mock("../src/repositories/tweetRepository", () => ({
  createTweet: jest.fn(),
  findTweetById: jest.fn(),
  deleteRetweetsByOriginalTweetId: jest.fn(),
  deleteTweetById: jest.fn(),
  listTweetsByUsername: jest.fn(),
  findRetweetByUserAndOriginalTweet: jest.fn(),
  deleteRetweetByUserAndOriginalTweet: jest.fn(),
  listFeedTweets: jest.fn()
}));

jest.mock("../src/repositories/blockRepository", () => ({
  existsBlock: jest.fn(),
  usersAreBlocked: jest.fn(),
  createBlock: jest.fn(),
  deleteBlock: jest.fn()
}));

jest.mock("../src/repositories/likeRepository", () => ({
  existsLike: jest.fn(),
  createLike: jest.fn(),
  deleteLike: jest.fn()
}));

jest.mock("../src/repositories/commentRepository", () => ({
  createComment: jest.fn(),
  findCommentById: jest.fn(),
  listCommentsForTweet: jest.fn()
}));

const bcrypt = require("bcryptjs");
const request = require("supertest");

const blockRepository = require("../src/repositories/blockRepository");
const commentRepository = require("../src/repositories/commentRepository");
const likeRepository = require("../src/repositories/likeRepository");
const tweetRepository = require("../src/repositories/tweetRepository");
const userRepository = require("../src/repositories/userRepository");
const app = require("../src/app");

describe("tweet routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function loginAgent(agent, user) {
    const passwordHash = await bcrypt.hash("password1", 10);

    userRepository.findUserByUsername.mockResolvedValueOnce({
      ...user,
      passwordHash
    });

    await agent.post("/auth/login").send({
      username: user.username,
      password: "password1"
    });
  }

  test("creates a tweet", async () => {
    const agent = request.agent(app);

    await loginAgent(agent, {
      id: 20,
      username: "alice",
      email: "alice@example.com",
      name: "Alice",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });

    tweetRepository.createTweet.mockResolvedValue({
      id: 1,
      text: "hello chirper",
      imageUrl: null,
      createdAt: "2026-04-23T00:00:00.000Z",
      retweetedFrom: null,
      author: {
        id: 20,
        username: "alice",
        name: "Alice",
        profilePicture: null
      }
    });

    const response = await agent.post("/tweets").send({
      text: "hello chirper"
    });

    expect(response.status).toBe(201);
    expect(response.body.data.tweet.text).toBe("hello chirper");
    expect(tweetRepository.createTweet).toHaveBeenCalledWith({
      userId: 20,
      text: "hello chirper",
      imageUrl: null
    });
  });

  test("rejects empty tweet text", async () => {
    const agent = request.agent(app);

    await loginAgent(agent, {
      id: 21,
      username: "alice",
      email: "alice@example.com",
      name: "Alice",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });

    const response = await agent.post("/tweets").send({
      text: "   "
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("gets a tweet by id", async () => {
    const agent = request.agent(app);

    await loginAgent(agent, {
      id: 22,
      username: "viewer",
      email: "viewer@example.com",
      name: "Viewer",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });

    tweetRepository.findTweetById.mockResolvedValue({
      id: 3,
      text: "read me",
      imageUrl: null,
      createdAt: "2026-04-23T00:00:00.000Z",
      retweetedFrom: null,
      author: {
        id: 22,
        username: "viewer",
        name: "Viewer",
      profilePicture: null
      }
    });
    blockRepository.usersAreBlocked.mockResolvedValue(false);

    const response = await agent.get("/tweets/3");

    expect(response.status).toBe(200);
    expect(response.body.data.tweet.id).toBe(3);
  });

  test("deletes a tweet when requested by its author", async () => {
    const agent = request.agent(app);

    await loginAgent(agent, {
      id: 23,
      username: "alice",
      email: "alice@example.com",
      name: "Alice",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });

    tweetRepository.findTweetById.mockResolvedValue({
      id: 4,
      text: "delete me",
      imageUrl: null,
      createdAt: "2026-04-23T00:00:00.000Z",
      retweetedFrom: null,
      author: {
        id: 23,
        username: "alice",
        name: "Alice",
        profilePicture: null
      }
    });

    const response = await agent.delete("/tweets/4");

    expect(response.status).toBe(200);
    expect(tweetRepository.deleteRetweetsByOriginalTweetId).toHaveBeenCalledWith(4);
    expect(tweetRepository.deleteTweetById).toHaveBeenCalledWith(4);
  });

  test("prevents non-authors from deleting tweets", async () => {
    const agent = request.agent(app);

    await loginAgent(agent, {
      id: 24,
      username: "viewer",
      email: "viewer@example.com",
      name: "Viewer",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });

    tweetRepository.findTweetById.mockResolvedValue({
      id: 5,
      text: "not yours",
      imageUrl: null,
      createdAt: "2026-04-23T00:00:00.000Z",
      retweetedFrom: null,
      author: {
        id: 999,
        username: "owner",
        name: "Owner",
        profilePicture: null
      }
    });

    const response = await agent.delete("/tweets/5");

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  test("likes and unlikes a tweet", async () => {
    const agent = request.agent(app);

    await loginAgent(agent, {
      id: 25,
      username: "alice",
      email: "alice@example.com",
      name: "Alice",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });

    tweetRepository.findTweetById.mockResolvedValue({
      id: 6,
      text: "like me",
      imageUrl: null,
      createdAt: "2026-04-23T00:00:00.000Z",
      retweetedFrom: null,
      originalTweet: null,
      author: {
        id: 50,
        username: "author",
        name: "Author",
        profilePicture: null
      }
    });
    blockRepository.usersAreBlocked.mockResolvedValue(false);
    likeRepository.existsLike.mockResolvedValue(false);

    const likeResponse = await agent.post("/tweets/6/like");
    const unlikeResponse = await agent.delete("/tweets/6/like");

    expect(likeResponse.status).toBe(201);
    expect(unlikeResponse.status).toBe(200);
    expect(likeRepository.createLike).toHaveBeenCalledWith(25, 6);
    expect(likeRepository.deleteLike).toHaveBeenCalledWith(25, 6);
  });

  test("creates and lists comments", async () => {
    const agent = request.agent(app);

    await loginAgent(agent, {
      id: 26,
      username: "alice",
      email: "alice@example.com",
      name: "Alice",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });

    tweetRepository.findTweetById.mockResolvedValue({
      id: 7,
      text: "commentable",
      imageUrl: null,
      createdAt: "2026-04-23T00:00:00.000Z",
      retweetedFrom: null,
      originalTweet: null,
      author: {
        id: 51,
        username: "author",
        name: "Author",
        profilePicture: null
      }
    });
    blockRepository.usersAreBlocked.mockResolvedValue(false);
    commentRepository.createComment.mockResolvedValue({
      id: 1,
      contents: "first!",
      createdAt: "2026-04-23T00:00:00.000Z",
      tweetId: 7,
      author: {
        id: 26,
        username: "alice",
        name: "Alice",
        profilePicture: null
      }
    });
    commentRepository.listCommentsForTweet.mockResolvedValue([
      {
        id: 1,
        contents: "first!",
        createdAt: "2026-04-23T00:00:00.000Z",
        tweetId: 7,
        author: {
          id: 26,
          username: "alice",
          name: "Alice",
          profilePicture: null
        }
      }
    ]);

    const createResponse = await agent.post("/tweets/7/comments").send({
      contents: "first!"
    });
    const listResponse = await agent.get("/tweets/7/comments");

    expect(createResponse.status).toBe(201);
    expect(listResponse.status).toBe(200);
    expect(commentRepository.createComment).toHaveBeenCalledWith({
      userId: 26,
      tweetId: 7,
      contents: "first!"
    });
  });

  test("retweets and unretweets a tweet", async () => {
    const agent = request.agent(app);

    await loginAgent(agent, {
      id: 27,
      username: "alice",
      email: "alice@example.com",
      name: "Alice",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });

    tweetRepository.findTweetById.mockResolvedValue({
      id: 8,
      text: "retweet me",
      imageUrl: null,
      createdAt: "2026-04-23T00:00:00.000Z",
      retweetedFrom: null,
      originalTweet: null,
      author: {
        id: 60,
        username: "author",
        name: "Author",
        profilePicture: null
      }
    });
    blockRepository.usersAreBlocked.mockResolvedValue(false);
    tweetRepository.findRetweetByUserAndOriginalTweet.mockResolvedValue(null);
    tweetRepository.createTweet.mockResolvedValue({
      id: 80,
      text: null,
      imageUrl: null,
      createdAt: "2026-04-23T00:00:00.000Z",
      retweetedFrom: 8,
      originalTweet: {
        id: 8,
        text: "retweet me",
        imageUrl: null,
        createdAt: "2026-04-23T00:00:00.000Z",
        author: {
          id: 60,
          username: "author",
          name: "Author",
          profilePicture: null
        }
      },
      author: {
        id: 27,
        username: "alice",
        name: "Alice",
        profilePicture: null
      }
    });

    const retweetResponse = await agent.post("/tweets/8/retweet");
    const unretweetResponse = await agent.delete("/tweets/8/retweet");

    expect(retweetResponse.status).toBe(201);
    expect(unretweetResponse.status).toBe(200);
    expect(tweetRepository.deleteRetweetByUserAndOriginalTweet).toHaveBeenCalledWith(27, 8);
  });

  test("prevents reading a blocked tweet", async () => {
    const agent = request.agent(app);

    await loginAgent(agent, {
      id: 28,
      username: "viewer",
      email: "viewer@example.com",
      name: "Viewer",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });

    tweetRepository.findTweetById.mockResolvedValue({
      id: 9,
      text: "secret",
      imageUrl: null,
      createdAt: "2026-04-23T00:00:00.000Z",
      retweetedFrom: null,
      originalTweet: null,
      author: {
        id: 61,
        username: "blocked",
        name: "Blocked",
        profilePicture: null
      }
    });
    blockRepository.usersAreBlocked.mockResolvedValue(true);

    const response = await agent.get("/tweets/9");

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});
