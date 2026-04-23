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

const bcrypt = require("bcryptjs");
const request = require("supertest");

const tweetRepository = require("../src/repositories/tweetRepository");
const userRepository = require("../src/repositories/userRepository");
const app = require("../src/app");

describe("feed routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  async function loginAgent(agent) {
    const passwordHash = await bcrypt.hash("password1", 10);

    userRepository.findUserByUsername.mockResolvedValueOnce({
      id: 40,
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

  test("returns the authenticated feed with pagination", async () => {
    const agent = request.agent(app);

    await loginAgent(agent);

    tweetRepository.listFeedTweets.mockResolvedValue([
      {
        id: 1,
        text: "latest tweet"
      }
    ]);

    const response = await agent.get("/feed?limit=10&offset=5");

    expect(response.status).toBe(200);
    expect(response.body.data.pagination).toEqual({
      limit: 10,
      offset: 5
    });
    expect(tweetRepository.listFeedTweets).toHaveBeenCalledWith(40, 10, 5);
  });

  test("requires authentication", async () => {
    const response = await request(app).get("/feed");

    expect(response.status).toBe(401);
  });
});
