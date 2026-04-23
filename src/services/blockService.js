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

async function blockUser(blockerId, username) {
  const targetUser = await resolveTargetUser(username);

  if (targetUser.id === blockerId) {
    throw new ValidationError("You cannot block yourself.");
  }

  const alreadyBlocked = await blockRepository.existsBlock(blockerId, targetUser.id);

  if (alreadyBlocked) {
    throw new ConflictError("User is already blocked.");
  }

  await blockRepository.createBlock(blockerId, targetUser.id);
  await followRepository.deleteFollowRelationshipsBetweenUsers(blockerId, targetUser.id);

  return targetUser;
}

async function unblockUser(blockerId, username) {
  const targetUser = await resolveTargetUser(username);

  if (targetUser.id === blockerId) {
    throw new ValidationError("You cannot unblock yourself.");
  }

  await blockRepository.deleteBlock(blockerId, targetUser.id);

  return targetUser;
}

module.exports = {
  blockUser,
  unblockUser
};
