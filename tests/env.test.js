describe("env configuration", () => {
  afterEach(() => {
    delete process.env.NODE_ENV;
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_NAME;
    delete process.env.TEST_DB_HOST;
    delete process.env.TEST_DB_PORT;
    delete process.env.TEST_DB_USER;
    delete process.env.TEST_DB_PASSWORD;
    delete process.env.TEST_DB_NAME;
    delete process.env.SESSION_NAME;
    delete process.env.SESSION_SECRET;
    jest.resetModules();
  });

  test("uses development database defaults when NODE_ENV is not test", () => {
    process.env.NODE_ENV = "development";
    process.env.DB_HOST = "db.local";
    process.env.DB_PORT = "3310";
    process.env.DB_USER = "chirper_user";
    process.env.DB_PASSWORD = "secret";
    process.env.DB_NAME = "chirper_dev";
    process.env.SESSION_NAME = "chirper.dev.sid";
    process.env.SESSION_SECRET = "dev-secret";

    const { env } = require("../src/config/env");

    expect(env.database).toEqual({
      host: "db.local",
      port: 3310,
      user: "chirper_user",
      password: "secret",
      database: "chirper_dev",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    expect(env.session).toEqual({
      name: "chirper.dev.sid",
      secret: "dev-secret",
      secureCookies: false
    });
  });

  test("switches to test database settings when NODE_ENV is test", () => {
    process.env.NODE_ENV = "test";
    process.env.TEST_DB_HOST = "test.db.local";
    process.env.TEST_DB_PORT = "4406";
    process.env.TEST_DB_USER = "chirper_test_user";
    process.env.TEST_DB_PASSWORD = "test-secret";
    process.env.TEST_DB_NAME = "chirper_test_db";

    const { env } = require("../src/config/env");

    expect(env.database).toEqual({
      host: "test.db.local",
      port: 4406,
      user: "chirper_test_user",
      password: "test-secret",
      database: "chirper_test_db",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  });
});
