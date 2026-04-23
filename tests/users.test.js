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

const bcrypt = require("bcryptjs");
const request = require("supertest");

const blockRepository = require("../src/repositories/blockRepository");
const tweetRepository = require("../src/repositories/tweetRepository");
const userRepository = require("../src/repositories/userRepository");
const app = require("../src/app");

describe("user routes", () => {
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

  test("gets a user profile", async () => {
    const agent = request.agent(app);

    await loginAgent(agent, {
      id: 10,
      username: "viewer",
      email: "viewer@example.com",
      name: "Viewer",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });
    blockRepository.usersAreBlocked.mockResolvedValue(false);

    userRepository.findUserByUsername.mockResolvedValueOnce({
      id: 11,
      username: "alice",
      email: "alice@example.com",
      name: "Alice",
      bio: "hello",
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });

    const response = await agent.get("/users/alice");

    expect(response.status).toBe(200);
    expect(response.body.data.user.username).toBe("alice");
  });

  test("updates the authenticated user's profile", async () => {
    const agent = request.agent(app);

    await loginAgent(agent, {
      id: 12,
      username: "alice",
      email: "alice@example.com",
      name: "Alice",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });

    userRepository.updateUserProfile.mockResolvedValue({
      id: 12,
      username: "alice",
      email: "alice@example.com",
      name: "Alice Updated",
      bio: "new bio",
      profilePicture: "https://example.com/pic.png",
      createdAt: "2026-04-23T00:00:00.000Z"
    });

    const response = await agent.patch("/users/me").send({
      name: "Alice Updated",
      bio: "new bio",
      profilePicture: "https://example.com/pic.png"
    });

    expect(response.status).toBe(200);
    expect(response.body.data.user.name).toBe("Alice Updated");
    expect(userRepository.updateUserProfile).toHaveBeenCalledWith(12, {
      name: "Alice Updated",
      bio: "new bio",
      profilePicture: "https://example.com/pic.png"
    });
  });

  test("rejects username changes", async () => {
    const agent = request.agent(app);

    await loginAgent(agent, {
      id: 13,
      username: "alice",
      email: "alice@example.com",
      name: "Alice",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });

    const response = await agent.patch("/users/me").send({
      username: "newalice"
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });

  test("lists a user's tweets with pagination", async () => {
    const agent = request.agent(app);

    await loginAgent(agent, {
      id: 14,
      username: "viewer",
      email: "viewer@example.com",
      name: "Viewer",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });
    blockRepository.usersAreBlocked.mockResolvedValue(false);

    userRepository.findUserByUsername.mockResolvedValueOnce({
      id: 15,
      username: "alice",
      email: "alice@example.com",
      name: "Alice",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });
    tweetRepository.listTweetsByUsername.mockResolvedValue([
      {
        id: 100,
        text: "hello world"
      }
    ]);

    const response = await agent.get("/users/alice/tweets?limit=10&offset=5");

    expect(response.status).toBe(200);
    expect(tweetRepository.listTweetsByUsername).toHaveBeenCalledWith("alice", 10, 5);
    expect(response.body.data.pagination).toEqual({
      limit: 10,
      offset: 5
    });
  });

  test("prevents viewing a blocked user's profile", async () => {
    const agent = request.agent(app);

    await loginAgent(agent, {
      id: 16,
      username: "viewer",
      email: "viewer@example.com",
      name: "Viewer",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });

    userRepository.findUserByUsername.mockResolvedValueOnce({
      id: 17,
      username: "blocked",
      email: "blocked@example.com",
      name: "Blocked",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });
    blockRepository.usersAreBlocked.mockResolvedValue(true);

    const response = await agent.get("/users/blocked");

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });
});
