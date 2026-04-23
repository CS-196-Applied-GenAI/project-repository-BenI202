const blockRepository = require("../repositories/blockRepository");
const tweetRepository = require("../repositories/tweetRepository");
const { ForbiddenError } = require("../utils/errors");

async function assertUsersNotBlocked(viewerId, otherUserId) {
  if (!viewerId || !otherUserId || viewerId === otherUserId) {
    return;
  }

  const blocked = await blockRepository.usersAreBlocked(viewerId, otherUserId);

  if (blocked) {
    throw new ForbiddenError("Blocked users cannot access each other's content.");
  }
}

async function assertCanAccessTweet(viewerId, tweet) {
  if (tweet.author) {
    await assertUsersNotBlocked(viewerId, tweet.author.id);
  }

  if (tweet.originalTweet && tweet.originalTweet.author) {
    await assertUsersNotBlocked(viewerId, tweet.originalTweet.author.id);
  } else if (tweet.retweetedFrom && !tweet.originalTweet) {
    const originalTweet = await tweetRepository.findTweetById(tweet.retweetedFrom);

    if (originalTweet && originalTweet.author) {
      await assertUsersNotBlocked(viewerId, originalTweet.author.id);
    }
  }
}

module.exports = {
  assertUsersNotBlocked,
  assertCanAccessTweet
};
