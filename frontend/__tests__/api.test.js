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
});
