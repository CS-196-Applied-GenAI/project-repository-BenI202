const likeRepository = require("../repositories/likeRepository");
const tweetRepository = require("../repositories/tweetRepository");
const { ConflictError, NotFoundError } = require("../utils/errors");
const accessService = require("./accessService");

async function likeTweet(userId, tweetId) {
  const tweet = await tweetRepository.findTweetById(tweetId);

  if (!tweet) {
    throw new NotFoundError("Tweet not found.");
  }

  await accessService.assertCanAccessTweet(userId, tweet);

  const alreadyLiked = await likeRepository.existsLike(userId, tweetId);

  if (alreadyLiked) {
    throw new ConflictError("Tweet is already liked.");
  }

  await likeRepository.createLike(userId, tweetId);

  return tweet;
}

async function unlikeTweet(userId, tweetId) {
  const tweet = await tweetRepository.findTweetById(tweetId);

  if (!tweet) {
    throw new NotFoundError("Tweet not found.");
  }

  await accessService.assertCanAccessTweet(userId, tweet);
  await likeRepository.deleteLike(userId, tweetId);

  return tweet;
}

module.exports = {
  likeTweet,
  unlikeTweet
};
