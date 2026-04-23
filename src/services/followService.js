const blockRepository = require("../repositories/blockRepository");
const followRepository = require("../repositories/followRepository");
const userRepository = require("../repositories/userRepository");
const { ConflictError, NotFoundError, ValidationError } = require("../utils/errors");

async function resolveTargetUser(username) {
  const user = await userRepository.findUserByUsername(username);

  if (!user) {
    throw new NotFoundError("User not found.");
  }

  return user;
}

async function followUser(followerId, username) {
  const targetUser = await resolveTargetUser(username);

  if (targetUser.id === followerId) {
    throw new ValidationError("You cannot follow yourself.");
  }

  const blocked = await blockRepository.usersAreBlocked(followerId, targetUser.id);

  if (blocked) {
    throw new ValidationError("Blocked users cannot follow each other.");
  }

  const alreadyFollowing = await followRepository.existsFollow(followerId, targetUser.id);

  if (alreadyFollowing) {
    throw new ConflictError("You are already following this user.");
  }

  await followRepository.createFollow(followerId, targetUser.id);

  return targetUser;
}

async function unfollowUser(followerId, username) {
  const targetUser = await resolveTargetUser(username);

  if (targetUser.id === followerId) {
    throw new ValidationError("You cannot unfollow yourself.");
  }

  await followRepository.deleteFollow(followerId, targetUser.id);

  return targetUser;
}

module.exports = {
  followUser,
  unfollowUser
};
