const { getDbPool } = require("../config/db");

function mapTweetRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    text: row.text,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    retweetedFrom: row.retweeted_from,
    author: row.user_id
      ? {
          id: row.user_id,
          username: row.username,
          name: row.name,
          profilePicture: row.profile_picture
        }
      : null,
    originalTweet: row.original_tweet_id
      ? {
          id: row.original_tweet_id,
          text: row.original_text,
          imageUrl: row.original_image_url,
          createdAt: row.original_created_at,
          author: row.original_user_id
            ? {
                id: row.original_user_id,
                username: row.original_username,
                name: row.original_name,
                profilePicture: row.original_profile_picture
              }
            : null
        }
      : null
  };
}

async function createTweet({ userId, text, imageUrl = null, retweetedFrom = null }) {
  const pool = getDbPool();
  const [result] = await pool.query(
    `INSERT INTO tweets (user_id, text, image_url, retweeted_from)
     VALUES (?, ?, ?, ?)`,
    [userId, text, imageUrl, retweetedFrom]
  );

  return findTweetById(result.insertId);
}

async function findTweetById(tweetId) {
  const pool = getDbPool();
  const [rows] = await pool.query(
    `SELECT t.id, t.text, t.image_url, t.created_at, t.retweeted_from,
            u.id AS user_id, u.username, u.name, u.profile_picture,
            ot.id AS original_tweet_id, ot.text AS original_text,
            ot.image_url AS original_image_url, ot.created_at AS original_created_at,
            ou.id AS original_user_id, ou.username AS original_username,
            ou.name AS original_name, ou.profile_picture AS original_profile_picture
     FROM tweets t
     JOIN users u ON u.id = t.user_id
     LEFT JOIN tweets ot ON ot.id = t.retweeted_from
     LEFT JOIN users ou ON ou.id = ot.user_id
     WHERE t.id = ?`,
    [tweetId]
  );

  return mapTweetRow(rows[0]);
}

async function deleteRetweetsByOriginalTweetId(tweetId) {
  const pool = getDbPool();
  await pool.query("DELETE FROM tweets WHERE retweeted_from = ?", [tweetId]);
}

async function deleteTweetById(tweetId) {
  const pool = getDbPool();
  await pool.query("DELETE FROM tweets WHERE id = ?", [tweetId]);
}

async function listTweetsByUsername(username, limit, offset) {
  const pool = getDbPool();
  const [rows] = await pool.query(
    `SELECT t.id, t.text, t.image_url, t.created_at, t.retweeted_from,
            u.id AS user_id, u.username, u.name, u.profile_picture,
            ot.id AS original_tweet_id, ot.text AS original_text,
            ot.image_url AS original_image_url, ot.created_at AS original_created_at,
            ou.id AS original_user_id, ou.username AS original_username,
            ou.name AS original_name, ou.profile_picture AS original_profile_picture
     FROM tweets t
     JOIN users u ON u.id = t.user_id
     LEFT JOIN tweets ot ON ot.id = t.retweeted_from
     LEFT JOIN users ou ON ou.id = ot.user_id
     WHERE u.username = ?
     ORDER BY t.created_at DESC, t.id DESC
     LIMIT ? OFFSET ?`,
    [username, limit, offset]
  );

  return rows.map(mapTweetRow);
}

async function findRetweetByUserAndOriginalTweet(userId, originalTweetId) {
  const pool = getDbPool();
  const [rows] = await pool.query(
    `SELECT t.id, t.text, t.image_url, t.created_at, t.retweeted_from,
            u.id AS user_id, u.username, u.name, u.profile_picture,
            ot.id AS original_tweet_id, ot.text AS original_text,
            ot.image_url AS original_image_url, ot.created_at AS original_created_at,
            ou.id AS original_user_id, ou.username AS original_username,
            ou.name AS original_name, ou.profile_picture AS original_profile_picture
     FROM tweets t
     JOIN users u ON u.id = t.user_id
     LEFT JOIN tweets ot ON ot.id = t.retweeted_from
     LEFT JOIN users ou ON ou.id = ot.user_id
     WHERE t.user_id = ? AND t.retweeted_from = ?
     LIMIT 1`,
    [userId, originalTweetId]
  );

  return mapTweetRow(rows[0]);
}

async function deleteRetweetByUserAndOriginalTweet(userId, originalTweetId) {
  const pool = getDbPool();
  await pool.query(
    "DELETE FROM tweets WHERE user_id = ? AND retweeted_from = ?",
    [userId, originalTweetId]
  );
}

async function listFeedTweets(viewerId, limit, offset) {
  const pool = getDbPool();
  const [rows] = await pool.query(
    `SELECT t.id, t.text, t.image_url, t.created_at, t.retweeted_from,
            u.id AS user_id, u.username, u.name, u.profile_picture,
            ot.id AS original_tweet_id, ot.text AS original_text,
            ot.image_url AS original_image_url, ot.created_at AS original_created_at,
            ou.id AS original_user_id, ou.username AS original_username,
            ou.name AS original_name, ou.profile_picture AS original_profile_picture
     FROM tweets t
     JOIN users u ON u.id = t.user_id
     LEFT JOIN tweets ot ON ot.id = t.retweeted_from
     LEFT JOIN users ou ON ou.id = ot.user_id
     WHERE (
       t.user_id = ?
       OR EXISTS (
         SELECT 1
         FROM follows f
         WHERE f.follower_id = ?
           AND f.followee_id = t.user_id
       )
     )
       AND NOT EXISTS (
         SELECT 1
         FROM blocks b
         WHERE (b.blocker_id = ? AND b.blocked_id = u.id)
            OR (b.blocker_id = u.id AND b.blocked_id = ?)
       )
       AND (
         t.retweeted_from IS NULL
         OR NOT EXISTS (
           SELECT 1
           FROM blocks b2
           WHERE (b2.blocker_id = ? AND b2.blocked_id = ou.id)
              OR (b2.blocker_id = ou.id AND b2.blocked_id = ?)
         )
       )
     ORDER BY t.created_at DESC, t.id DESC
     LIMIT ? OFFSET ?`,
    [viewerId, viewerId, viewerId, viewerId, viewerId, viewerId, limit, offset]
  );

  return rows.map(mapTweetRow);
}

module.exports = {
  createTweet,
  findTweetById,
  deleteRetweetsByOriginalTweetId,
  deleteTweetById,
  listTweetsByUsername,
  findRetweetByUserAndOriginalTweet,
  deleteRetweetByUserAndOriginalTweet,
  listFeedTweets
};
