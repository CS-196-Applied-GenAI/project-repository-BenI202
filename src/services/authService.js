const bcrypt = require("bcryptjs");

const userRepository = require("../repositories/userRepository");
const { ConflictError, NotFoundError, UnauthorizedError, ValidationError } = require("../utils/errors");

function toPublicUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    bio: user.bio,
    profilePicture: user.profilePicture,
    createdAt: user.createdAt
  };
}

function validatePassword(password) {
  if (typeof password !== "string" || password.length < 8) {
    throw new ValidationError("Password must be at least 8 characters long.");
  }

  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    throw new ValidationError("Password must include at least one letter and one number.");
  }
}

function validateEmail(email) {
  if (typeof email !== "string" || !email.includes("@")) {
    throw new ValidationError("A valid email is required.");
  }
}

function validateUsername(username) {
  if (typeof username !== "string" || username.trim().length < 3) {
    throw new ValidationError("Username must be at least 3 characters long.");
  }
}

async function signup({ username, email, password, name }) {
  validateUsername(username);
  validateEmail(email);
  validatePassword(password);

  const normalizedUsername = username.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const existingUsername = await userRepository.findUserByUsername(normalizedUsername);

  if (existingUsername) {
    throw new ConflictError("Username is already taken.");
  }

  const existingEmail = await userRepository.findUserByEmail(normalizedEmail);

  if (existingEmail) {
    throw new ConflictError("Email is already in use.");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userRepository.createUser({
    username: normalizedUsername,
    email: normalizedEmail,
    passwordHash,
    name: typeof name === "string" && name.trim() ? name.trim() : null
  });

  return toPublicUser(user);
}

async function login({ username, password }) {
  validateUsername(username);

  if (typeof password !== "string" || !password) {
    throw new ValidationError("Password is required.");
  }

  const user = await userRepository.findUserByUsername(username.trim());

  if (!user) {
    throw new UnauthorizedError("Invalid username or password.");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    throw new UnauthorizedError("Invalid username or password.");
  }

  return toPublicUser(user);
}

async function getCurrentUser(userId) {
  const user = await userRepository.findUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  return toPublicUser(user);
}

module.exports = {
  signup,
  login,
  getCurrentUser,
  toPublicUser
};
