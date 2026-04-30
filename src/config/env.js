const dotenv = require("dotenv");

dotenv.config();

function parseNumber(value, fallback) {
  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : fallback;
}

function readString(value, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function getNodeEnv() {
  return readString(process.env.NODE_ENV, "development");
}

function getDatabaseConfig() {
  const nodeEnv = getNodeEnv();
  const prefix = nodeEnv === "test" ? "TEST_DB_" : "DB_";

  return {
    host: readString(process.env[`${prefix}HOST`], "127.0.0.1"),
    port: parseNumber(process.env[`${prefix}PORT`], 3306),
    user: readString(process.env[`${prefix}USER`], "root"),
    password: readString(process.env[`${prefix}PASSWORD`], ""),
    database: readString(process.env[`${prefix}NAME`], nodeEnv === "test" ? "chirper_test" : "chirper"),
    waitForConnections: true,
    connectionLimit: parseNumber(process.env.DB_CONNECTION_LIMIT, 10),
    queueLimit: 0
  };
}

function getSessionConfig() {
  const nodeEnv = getNodeEnv();

  return {
    name: readString(process.env.SESSION_NAME, "chirper.sid"),
    secret: readString(process.env.SESSION_SECRET, "development-session-secret"),
    secureCookies: nodeEnv === "production"
  };
}

function getFrontendOrigin() {
  return readString(process.env.FRONTEND_ORIGIN, "http://localhost:3001");
}

module.exports = {
  env: {
    nodeEnv: getNodeEnv(),
    port: parseNumber(process.env.PORT, 3000),
    database: getDatabaseConfig(),
    session: getSessionConfig(),
    frontendOrigin: getFrontendOrigin()
  },
  getDatabaseConfig,
  getFrontendOrigin,
  getNodeEnv
};
