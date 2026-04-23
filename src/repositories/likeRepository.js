const { getDbPool } = require("../config/db");

async function existsLike(userId, tweetId) {
  const pool = getDbPool();
  const [rows] = await pool.query(
    "SELECT 1 FROM likes WHERE user_id = ? AND tweet_id = ? LIMIT 1",
    [userId, tweetId]
  );

  return rows.length > 0;
}

async function createLike(userId, tweetId) {
  const pool = getDbPool();
  await pool.query(
    "INSERT INTO likes (tweet_id, user_id) VALUES (?, ?)",
    [tweetId, userId]
  );
}

async function deleteLike(userId, tweetId) {
  const pool = getDbPool();
  await pool.query(
    "DELETE FROM likes WHERE user_id = ? AND tweet_id = ?",
    [userId, tweetId]
  );
}

module.exports = {
  existsLike,
  createLike,
  deleteLike
};
