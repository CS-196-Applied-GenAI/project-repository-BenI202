const request = require("supertest");
const app = require("../src/app");

describe("GET /health", () => {
  test("returns API health status", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        status: "ok"
      }
    });
  });
});

describe("unknown routes", () => {
  test("returns a consistent 404 error payload", async () => {
    const response = await request(app).get("/does-not-exist");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Route not found."
      }
    });
  });
});
