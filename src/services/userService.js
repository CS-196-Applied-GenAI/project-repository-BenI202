const tweetRepository = require("../repositories/tweetRepository");
const userRepository = require("../repositories/userRepository");
const { NotFoundError, ValidationError } = require("../utils/errors");
const accessService = require("./accessService");
const { toPublicUser } = require("./authService");
const { decorateTweetsForViewer, decorateUserForViewer } = require("./viewerMetadataService");

function parsePagination(limitValue, offsetValue) {
  const limit = limitValue === undefined ? 20 : Number(limitValue);
  const offset = offsetValue === undefined ? 0 : Number(offsetValue);

  if (!Number.isInteger(limit) || limit < 1 || limit > 50) {
    throw new ValidationError("Limit must be an integer between 1 and 50.");
  }

  if (!Number.isInteger(offset) || offset < 0) {
    throw new ValidationError("Offset must be a non-negative integer.");
  }

  return {
    limit,
    offset
  };
}

async function getProfileByUsername(viewerId, username) {
  const user = await userRepository.findUserByUsername(username);

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  await accessService.assertUsersNotBlocked(viewerId, user.id);

  return decorateUserForViewer(viewerId, toPublicUser(user));
}

async function updateProfile(userId, updates) {
  const allowedKeys = ["name", "bio", "profilePicture"];
  const payload = {};

  if (Object.prototype.hasOwnProperty.call(updates, "username")) {
    throw new ValidationError("Username cannot be updated.");
  }

  if (Object.prototype.hasOwnProperty.call(updates, "email")) {
    throw new ValidationError("Email cannot be updated.");
  }

  for (const key of allowedKeys) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      payload[key] = updates[key];
    }
  }

  if (Object.keys(payload).length === 0) {
    throw new ValidationError("At least one profile field must be provided.");
  }

  const updatedUser = await userRepository.updateUserProfile(userId, payload);

  return toPublicUser(updatedUser);
}

async function getTweetsByUsername(viewerId, username, pagination) {
  const user = await userRepository.findUserByUsername(username);

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  await accessService.assertUsersNotBlocked(viewerId, user.id);

  const { limit, offset } = parsePagination(pagination.limit, pagination.offset);
  const tweets = await decorateTweetsForViewer(
    viewerId,
    await tweetRepository.listTweetsByUsername(user.username, limit, offset)
  );

  return {
    user: await decorateUserForViewer(viewerId, toPublicUser(user)),
    tweets,
    pagination: {
      limit,
      offset
    }
  };
}

async function getSuggestedUsers(viewerId, query) {
  const limitValue = query?.limit === undefined ? 5 : Number(query.limit);

  if (!Number.isInteger(limitValue) || limitValue < 1 || limitValue > 20) {
    throw new ValidationError("Limit must be an integer between 1 and 20.");
  }

  const users = await userRepository.listSuggestedUsers(viewerId, limitValue);
  const suggestions = await Promise.all(
    users.map((user) => decorateUserForViewer(viewerId, toPublicUser(user)))
  );

  return {
    users: suggestions
  };
}

module.exports = {
  parsePagination,
  getProfileByUsername,
  updateProfile,
  getTweetsByUsername,
  getSuggestedUsers
};
