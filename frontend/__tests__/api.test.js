import * as api from "../lib/api";

describe("api client", () => {
  afterEach(() => {
    global.fetch = undefined;
  });

  test("sends credentials and returns data payload", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          user: {
            username: "alice"
          }
        }
      })
    });

    const data = await api.login({
      username: "alice",
      password: "password1"
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/auth/login",
      expect.objectContaining({
        credentials: "include",
        method: "POST"
      })
    );
    expect(data.user.username).toBe("alice");
  });

  test("throws a useful message when the API returns an error", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({
        error: {
          message: "No session"
        }
      })
    });

    await expect(api.getCurrentUser()).rejects.toThrow("No session");
  });

  test("supports retweet and block endpoints", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          message: "ok"
        }
      })
    });

    await api.retweetTweet(4);
    await api.blockUser("alice");

    expect(global.fetch).toHaveBeenNthCalledWith(
      1,
      "http://localhost:3000/tweets/4/retweet",
      expect.objectContaining({
        credentials: "include",
        method: "POST"
      })
    );
    expect(global.fetch).toHaveBeenNthCalledWith(
      2,
      "http://localhost:3000/users/alice/block",
      expect.objectContaining({
        credentials: "include",
        method: "POST"
      })
    );
  });

  test("supports the suggested users endpoint", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          users: [{ id: 1, username: "alice" }]
        }
      })
    });

    const data = await api.getSuggestedUsers({ limit: 4 });

    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:3000/users/suggestions?limit=4",
      expect.objectContaining({
        credentials: "include"
      })
    );
    expect(data.users).toHaveLength(1);
  });
});
