const tweetRepository = require("../repositories/tweetRepository");
const { ForbiddenError, NotFoundError, ValidationError } = require("../utils/errors");
const accessService = require("./accessService");

function normalizeTweetText(text) {
  if (typeof text !== "string") {
    throw new ValidationError("Tweet text is required.");
  }

  const normalized = text.trim();

  if (!normalized) {
    throw new ValidationError("Tweet text is required.");
  }

  if (normalized.length > 240) {
    throw new ValidationError("Tweet text must be 240 characters or fewer.");
  }

  return normalized;
}

async function createTweet(userId, payload) {
  const text = normalizeTweetText(payload.text);
  const imageUrl = typeof payload.imageUrl === "string" && payload.imageUrl.trim()
    ? payload.imageUrl.trim()
    : null;

  return tweetRepository.createTweet({
    userId,
    text,
    imageUrl
  });
}

async function getTweetById(tweetId) {
  const tweet = await tweetRepository.findTweetById(tweetId);

  if (!tweet) {
    throw new NotFoundError("Tweet not found.");
  }

  return tweet;
}

async function getTweetByIdForViewer(userId, tweetId) {
  const tweet = await getTweetById(tweetId);
  await accessService.assertCanAccessTweet(userId, tweet);

  return tweet;
}

async function deleteTweet(userId, tweetId) {
  const tweet = await tweetRepository.findTweetById(tweetId);

  if (!tweet) {
    throw new NotFoundError("Tweet not found.");
  }

  if (!tweet.author || tweet.author.id !== userId) {
    throw new ForbiddenError("Only the author can delete this tweet.");
  }

  await tweetRepository.deleteRetweetsByOriginalTweetId(tweetId);
  await tweetRepository.deleteTweetById(tweetId);
}

module.exports = {
  createTweet,
  getTweetById,
  getTweetByIdForViewer,
  deleteTweet
};
