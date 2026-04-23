const { getDbPool } = require("../config/db");

function mapCommentRow(row) {
  return {
    id: row.id,
    contents: row.contents,
    createdAt: row.created_at,
    author: {
      id: row.user_id,
      username: row.username,
      name: row.name,
      profilePicture: row.profile_picture
    },
    tweetId: row.tweet_id
  };
}

async function createComment({ userId, tweetId, contents }) {
  const pool = getDbPool();
  const [result] = await pool.query(
    `INSERT INTO comments (user_id, tweet_id, contents)
     VALUES (?, ?, ?)`,
    [userId, tweetId, contents]
  );

  return findCommentById(result.insertId);
}

async function findCommentById(commentId) {
  const pool = getDbPool();
  const [rows] = await pool.query(
    `SELECT c.id, c.contents, c.created_at, c.tweet_id,
            u.id AS user_id, u.username, u.name, u.profile_picture
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.id = ?`,
    [commentId]
  );

  return rows[0] ? mapCommentRow(rows[0]) : null;
}

async function listCommentsForTweet(viewerId, tweetId) {
  const pool = getDbPool();
  const [rows] = await pool.query(
    `SELECT c.id, c.contents, c.created_at, c.tweet_id,
            u.id AS user_id, u.username, u.name, u.profile_picture
     FROM comments c
     JOIN users u ON u.id = c.user_id
     WHERE c.tweet_id = ?
       AND NOT EXISTS (
         SELECT 1
         FROM blocks b
         WHERE (b.blocker_id = ? AND b.blocked_id = u.id)
            OR (b.blocker_id = u.id AND b.blocked_id = ?)
       )
     ORDER BY c.created_at ASC, c.id ASC`,
    [tweetId, viewerId, viewerId]
  );

  return rows.map(mapCommentRow);
}

module.exports = {
  createComment,
  findCommentById,
  listCommentsForTweet
};
