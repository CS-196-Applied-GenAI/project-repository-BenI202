const { getDbPool } = require("../config/db");

function mapUserRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    username: row.username,
    email: row.email,
    name: row.name,
    bio: row.bio,
    profilePicture: row.profile_picture,
    passwordHash: row.password_hash,
    createdAt: row.created_at
  };
}

async function findUserByUsername(username) {
  const pool = getDbPool();
  const [rows] = await pool.query(
    `SELECT id, username, email, name, bio, profile_picture, password_hash, created_at
     FROM users
     WHERE username = ?`,
    [username]
  );

  return mapUserRow(rows[0]);
}

async function findUserByEmail(email) {
  const pool = getDbPool();
  const [rows] = await pool.query(
    `SELECT id, username, email, name, bio, profile_picture, password_hash, created_at
     FROM users
     WHERE email = ?`,
    [email]
  );

  return mapUserRow(rows[0]);
}

async function findUserById(id) {
  const pool = getDbPool();
  const [rows] = await pool.query(
    `SELECT id, username, email, name, bio, profile_picture, password_hash, created_at
     FROM users
     WHERE id = ?`,
    [id]
  );

  return mapUserRow(rows[0]);
}

async function createUser({ username, email, passwordHash, name }) {
  const pool = getDbPool();
  const [result] = await pool.query(
    `INSERT INTO users (username, email, password_hash, name)
     VALUES (?, ?, ?, ?)`,
    [username, email, passwordHash, name || null]
  );

  return findUserById(result.insertId);
}

async function updateUserProfile(userId, updates) {
  const pool = getDbPool();
  const fields = [];
  const values = [];

  if (Object.prototype.hasOwnProperty.call(updates, "name")) {
    fields.push("name = ?");
    values.push(updates.name);
  }

  if (Object.prototype.hasOwnProperty.call(updates, "bio")) {
    fields.push("bio = ?");
    values.push(updates.bio);
  }

  if (Object.prototype.hasOwnProperty.call(updates, "profilePicture")) {
    fields.push("profile_picture = ?");
    values.push(updates.profilePicture);
  }

  if (fields.length > 0) {
    values.push(userId);
    await pool.query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
  }

  return findUserById(userId);
}

module.exports = {
  findUserByUsername,
  findUserByEmail,
  findUserById,
  createUser,
  updateUserProfile
};
