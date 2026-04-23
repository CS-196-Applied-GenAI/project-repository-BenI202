jest.mock("../src/repositories/userRepository", () => ({
  findUserByUsername: jest.fn(),
  findUserByEmail: jest.fn(),
  findUserById: jest.fn(),
  createUser: jest.fn(),
  updateUserProfile: jest.fn()
}));

const bcrypt = require("bcryptjs");
const request = require("supertest");

const userRepository = require("../src/repositories/userRepository");
const app = require("../src/app");

describe("auth routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("signup creates a user and logs them in", async () => {
    userRepository.findUserByUsername.mockResolvedValue(null);
    userRepository.findUserByEmail.mockResolvedValue(null);
    userRepository.createUser.mockResolvedValue({
      id: 1,
      username: "alice",
      email: "alice@example.com",
      name: "Alice",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });
    userRepository.findUserById.mockResolvedValue({
      id: 1,
      username: "alice",
      email: "alice@example.com",
      name: "Alice",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });

    const agent = request.agent(app);
    const response = await agent.post("/auth/signup").send({
      username: "alice",
      email: "alice@example.com",
      password: "password1",
      name: "Alice"
    });

    expect(response.status).toBe(201);
    expect(response.body.data.user.username).toBe("alice");

    const meResponse = await agent.get("/auth/me");

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.data.user.email).toBe("alice@example.com");
  });

  test("signup rejects duplicate usernames", async () => {
    userRepository.findUserByUsername.mockResolvedValue({
      id: 1
    });

    const response = await request(app).post("/auth/signup").send({
      username: "alice",
      email: "alice@example.com",
      password: "password1"
    });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("CONFLICT");
  });

  test("login creates a session for valid credentials", async () => {
    const passwordHash = await bcrypt.hash("password1", 10);

    userRepository.findUserByUsername.mockResolvedValue({
      id: 2,
      username: "bob",
      email: "bob@example.com",
      name: "Bob",
      bio: null,
      profilePicture: null,
      passwordHash,
      createdAt: "2026-04-23T00:00:00.000Z"
    });
    userRepository.findUserById.mockResolvedValue({
      id: 2,
      username: "bob",
      email: "bob@example.com",
      name: "Bob",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });

    const agent = request.agent(app);
    const response = await agent.post("/auth/login").send({
      username: "bob",
      password: "password1"
    });

    expect(response.status).toBe(200);
    expect(response.body.data.user.username).toBe("bob");

    const meResponse = await agent.get("/auth/me");

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.data.user.username).toBe("bob");
  });

  test("logout destroys the session", async () => {
    const passwordHash = await bcrypt.hash("password1", 10);

    userRepository.findUserByUsername.mockResolvedValue({
      id: 3,
      username: "carol",
      email: "carol@example.com",
      name: "Carol",
      bio: null,
      profilePicture: null,
      passwordHash,
      createdAt: "2026-04-23T00:00:00.000Z"
    });
    userRepository.findUserById.mockResolvedValue({
      id: 3,
      username: "carol",
      email: "carol@example.com",
      name: "Carol",
      bio: null,
      profilePicture: null,
      createdAt: "2026-04-23T00:00:00.000Z"
    });

    const agent = request.agent(app);

    await agent.post("/auth/login").send({
      username: "carol",
      password: "password1"
    });

    const logoutResponse = await agent.post("/auth/logout");

    expect(logoutResponse.status).toBe(200);

    const meResponse = await agent.get("/auth/me");

    expect(meResponse.status).toBe(401);
  });

  test("protected auth route rejects unauthenticated requests", async () => {
    const response = await request(app).get("/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("UNAUTHORIZED");
  });
});
