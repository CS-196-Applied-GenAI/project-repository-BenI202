const mysql = require("mysql2/promise");

const { env } = require("./env");

let pool;

function getDbPool() {
  if (!pool) {
    pool = mysql.createPool(env.database);
  }

  return pool;
}

async function checkDatabaseConnection() {
  const dbPool = getDbPool();
  const connection = await dbPool.getConnection();

  try {
    await connection.ping();
  } finally {
    connection.release();
  }
}

async function closeDbPool() {
  if (pool) {
    await pool.end();
    pool = undefined;
  }
}

module.exports = {
  getDbPool,
  checkDatabaseConnection,
  closeDbPool
};
