const { getDbPool } = require("../config/db");

async function existsBlock(blockerId, blockedId) {
  const pool = getDbPool();
  const [rows] = await pool.query(
    "SELECT 1 FROM blocks WHERE blocker_id = ? AND blocked_id = ? LIMIT 1",
    [blockerId, blockedId]
  );

  return rows.length > 0;
}

async function usersAreBlocked(userAId, userBId) {
  const pool = getDbPool();
  const [rows] = await pool.query(
    `SELECT 1
     FROM blocks
     WHERE (blocker_id = ? AND blocked_id = ?)
        OR (blocker_id = ? AND blocked_id = ?)
     LIMIT 1`,
    [userAId, userBId, userBId, userAId]
  );

  return rows.length > 0;
}

async function createBlock(blockerId, blockedId) {
  const pool = getDbPool();
  await pool.query(
    "INSERT INTO blocks (blocker_id, blocked_id) VALUES (?, ?)",
    [blockerId, blockedId]
  );
}

async function deleteBlock(blockerId, blockedId) {
  const pool = getDbPool();
  await pool.query(
    "DELETE FROM blocks WHERE blocker_id = ? AND blocked_id = ?",
    [blockerId, blockedId]
  );
}

module.exports = {
  existsBlock,
  usersAreBlocked,
  createBlock,
  deleteBlock
};
