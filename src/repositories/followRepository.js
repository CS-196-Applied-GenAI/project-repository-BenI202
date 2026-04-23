const { getDbPool } = require("../config/db");

async function existsFollow(followerId, followeeId) {
  const pool = getDbPool();
  const [rows] = await pool.query(
    "SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ? LIMIT 1",
    [followerId, followeeId]
  );

  return rows.length > 0;
}

async function createFollow(followerId, followeeId) {
  const pool = getDbPool();
  await pool.query(
    "INSERT INTO follows (follower_id, followee_id) VALUES (?, ?)",
    [followerId, followeeId]
  );
}

async function deleteFollow(followerId, followeeId) {
  const pool = getDbPool();
  await pool.query(
    "DELETE FROM follows WHERE follower_id = ? AND followee_id = ?",
    [followerId, followeeId]
  );
}

async function deleteFollowRelationshipsBetweenUsers(userAId, userBId) {
  const pool = getDbPool();
  await pool.query(
    `DELETE FROM follows
     WHERE (follower_id = ? AND followee_id = ?)
        OR (follower_id = ? AND followee_id = ?)`,
    [userAId, userBId, userBId, userAId]
  );
}

module.exports = {
  existsFollow,
  createFollow,
  deleteFollow,
  deleteFollowRelationshipsBetweenUsers
};
