const { closeDbPool, getDbPool } = require("../../src/config/db");

const TABLES_IN_RESET_ORDER = [
  "likes",
  "comments",
  "blocks",
  "follows",
  "tweets",
  "users",
  "blacklisted_tokens"
];

async function resetTestDatabase() {
  const pool = getDbPool();

  await pool.query("SET FOREIGN_KEY_CHECKS = 0");

  try {
    for (const tableName of TABLES_IN_RESET_ORDER) {
      await pool.query(`TRUNCATE TABLE ${tableName}`);
    }
  } finally {
    await pool.query("SET FOREIGN_KEY_CHECKS = 1");
  }
}

async function closeTestDatabase() {
  await closeDbPool();
}

module.exports = {
  resetTestDatabase,
  closeTestDatabase
};
