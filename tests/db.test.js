jest.mock("mysql2/promise", () => ({
  createPool: jest.fn()
}));

describe("database config helpers", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test("creates a pool lazily and reuses it", () => {
    const mysql = require("mysql2/promise");
    const fakePool = { end: jest.fn() };

    mysql.createPool.mockReset();
    mysql.createPool.mockReturnValue(fakePool);

    const { getDbPool } = require("../src/config/db");

    const firstPool = getDbPool();
    const secondPool = getDbPool();

    expect(firstPool).toBe(fakePool);
    expect(secondPool).toBe(fakePool);
    expect(mysql.createPool).toHaveBeenCalledTimes(1);
  });

  test("checks the database connection using ping", async () => {
    const mysql = require("mysql2/promise");
    const release = jest.fn();
    const ping = jest.fn();
    const fakePool = {
      getConnection: jest.fn().mockResolvedValue({
        ping,
        release
      }),
      end: jest.fn()
    };

    mysql.createPool.mockReset();
    mysql.createPool.mockReturnValue(fakePool);

    const { checkDatabaseConnection } = require("../src/config/db");

    await checkDatabaseConnection();

    expect(fakePool.getConnection).toHaveBeenCalledTimes(1);
    expect(ping).toHaveBeenCalledTimes(1);
    expect(release).toHaveBeenCalledTimes(1);
  });

  test("closes the pool and clears cached state", async () => {
    const mysql = require("mysql2/promise");
    const fakePool = {
      end: jest.fn().mockResolvedValue(undefined)
    };

    mysql.createPool.mockReset();
    mysql.createPool.mockReturnValue(fakePool);

    const { closeDbPool, getDbPool } = require("../src/config/db");

    getDbPool();
    await closeDbPool();
    getDbPool();

    expect(fakePool.end).toHaveBeenCalledTimes(1);
    expect(mysql.createPool).toHaveBeenCalledTimes(2);
  });
});
