const commentRepository = require("../repositories/commentRepository");
const tweetRepository = require("../repositories/tweetRepository");
const { NotFoundError, ValidationError } = require("../utils/errors");
const accessService = require("./accessService");

function normalizeCommentContents(contents) {
  if (typeof contents !== "string") {
    throw new ValidationError("Comment contents are required.");
  }

  const normalized = contents.trim();

  if (!normalized) {
    throw new ValidationError("Comment contents are required.");
  }

  if (normalized.length > 240) {
    throw new ValidationError("Comment contents must be 240 characters or fewer.");
  }

  return normalized;
}

async function createComment(userId, tweetId, payload) {
  const tweet = await tweetRepository.findTweetById(tweetId);

  if (!tweet) {
    throw new NotFoundError("Tweet not found.");
  }

  await accessService.assertCanAccessTweet(userId, tweet);

  return commentRepository.createComment({
    userId,
    tweetId,
    contents: normalizeCommentContents(payload.contents)
  });
}

async function listComments(userId, tweetId) {
  const tweet = await tweetRepository.findTweetById(tweetId);

  if (!tweet) {
    throw new NotFoundError("Tweet not found.");
  }

  await accessService.assertCanAccessTweet(userId, tweet);

  return commentRepository.listCommentsForTweet(userId, tweetId);
}

module.exports = {
  createComment,
  listComments
};
