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

jest.mock("../src/repositories/followRepository", () => ({
  existsFollow: jest.fn(),
  createFollow: jest.fn(),
  deleteFollow: jest.fn(),
  deleteFollowRelationshipsBetweenUsers: jest.fn()
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
const followRepository = require("../src/repositories/followRepository");
const userRepository = require("../src/repositories/userRepository");
const app = require("../src/app");

describe("follow and block routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function loginAgent(agent) {
    const passwordHash = await bcrypt.hash("password1", 10);

    userRepository.findUserByUsername.mockResolvedValueOnce({
      id: 70,
      username: "viewer",
      email: "viewer@example.com",
      name: "Viewer",
      bio: null,
      profilePicture: null,
      passwordHash,
      createdAt: "2026-04-23T00:00:00.000Z"
    });

    await agent.post("/auth/login").send({
      username: "viewer",
      password: "password1"
    });
  }

  test("follows and unfollows a user", async () => {
    const agent = request.agent(app);

    await loginAgent(agent);

    userRepository.findUserByUsername.mockResolvedValue({
      id: 71,
      username: "alice",
      email: "alice@example.com",
      name: "Alice",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });
    blockRepository.usersAreBlocked.mockResolvedValue(false);
    followRepository.existsFollow.mockResolvedValue(false);

    const followResponse = await agent.post("/users/alice/follow");
    const unfollowResponse = await agent.delete("/users/alice/follow");

    expect(followResponse.status).toBe(201);
    expect(unfollowResponse.status).toBe(200);
    expect(followRepository.createFollow).toHaveBeenCalledWith(70, 71);
    expect(followRepository.deleteFollow).toHaveBeenCalledWith(70, 71);
  });

  test("blocks and unblocks a user", async () => {
    const agent = request.agent(app);

    await loginAgent(agent);

    userRepository.findUserByUsername.mockResolvedValue({
      id: 72,
      username: "bob",
      email: "bob@example.com",
      name: "Bob",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });
    blockRepository.existsBlock.mockResolvedValue(false);

    const blockResponse = await agent.post("/users/bob/block");
    const unblockResponse = await agent.delete("/users/bob/block");

    expect(blockResponse.status).toBe(201);
    expect(unblockResponse.status).toBe(200);
    expect(blockRepository.createBlock).toHaveBeenCalledWith(70, 72);
    expect(followRepository.deleteFollowRelationshipsBetweenUsers).toHaveBeenCalledWith(70, 72);
    expect(blockRepository.deleteBlock).toHaveBeenCalledWith(70, 72);
  });

  test("rejects following a blocked user", async () => {
    const agent = request.agent(app);

    await loginAgent(agent);

    userRepository.findUserByUsername.mockResolvedValue({
      id: 73,
      username: "blocked",
      email: "blocked@example.com",
      name: "Blocked",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });
    blockRepository.usersAreBlocked.mockResolvedValue(true);

    const response = await agent.post("/users/blocked/follow");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
