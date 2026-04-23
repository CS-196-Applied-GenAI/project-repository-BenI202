const tweetRepository = require("../repositories/tweetRepository");
const { ConflictError, NotFoundError } = require("../utils/errors");
const accessService = require("./accessService");

async function resolveOriginalTweet(tweetId) {
  const tweet = await tweetRepository.findTweetById(tweetId);

  if (!tweet) {
    throw new NotFoundError("Tweet not found.");
  }

  if (tweet.originalTweet) {
    return tweet.originalTweet.id;
  }

  return tweet.id;
}

async function retweet(userId, tweetId) {
  const sourceTweet = await tweetRepository.findTweetById(tweetId);

  if (!sourceTweet) {
    throw new NotFoundError("Tweet not found.");
  }

  await accessService.assertCanAccessTweet(userId, sourceTweet);

  const originalTweetId = await resolveOriginalTweet(tweetId);
  const existingRetweet = await tweetRepository.findRetweetByUserAndOriginalTweet(userId, originalTweetId);

  if (existingRetweet) {
    throw new ConflictError("Tweet is already retweeted.");
  }

  return tweetRepository.createTweet({
    userId,
    text: null,
    imageUrl: null,
    retweetedFrom: originalTweetId
  });
}

async function unretweet(userId, tweetId) {
  const sourceTweet = await tweetRepository.findTweetById(tweetId);

  if (!sourceTweet) {
    throw new NotFoundError("Tweet not found.");
  }

  await accessService.assertCanAccessTweet(userId, sourceTweet);

  const originalTweetId = await resolveOriginalTweet(tweetId);
  await tweetRepository.deleteRetweetByUserAndOriginalTweet(userId, originalTweetId);

  return sourceTweet;
}

module.exports = {
  retweet,
  unretweet
};
