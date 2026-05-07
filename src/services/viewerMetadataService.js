const blockRepository = require("../repositories/blockRepository");
const followRepository = require("../repositories/followRepository");
const likeRepository = require("../repositories/likeRepository");
const tweetRepository = require("../repositories/tweetRepository");

async function decorateUserForViewer(viewerId, user) {
  if (!user) {
    return user;
  }

  if (!viewerId || viewerId === user.id) {
    return {
      ...user,
      viewerIsFollowing: false,
      viewerHasBlocked: false
    };
  }

  const [viewerIsFollowing, viewerHasBlocked] = await Promise.all([
    followRepository.existsFollow(viewerId, user.id),
    blockRepository.existsBlock(viewerId, user.id)
  ]);

  return {
    ...user,
    viewerIsFollowing,
    viewerHasBlocked
  };
}

function getOriginalTweetId(tweet) {
  if (tweet?.originalTweet?.id) {
    return tweet.originalTweet.id;
  }

  return tweet?.id || null;
}

async function decorateTweetForViewer(viewerId, tweet) {
  if (!tweet || !viewerId) {
    return {
      ...tweet,
      viewerHasLiked: false,
      viewerHasRetweeted: false
    };
  }

  const originalTweetId = getOriginalTweetId(tweet);
  const [viewerHasLiked, existingRetweet] = await Promise.all([
    likeRepository.existsLike(viewerId, tweet.id),
    originalTweetId
      ? tweetRepository.findRetweetByUserAndOriginalTweet(viewerId, originalTweetId)
      : Promise.resolve(null)
  ]);

  return {
    ...tweet,
    viewerHasLiked,
    viewerHasRetweeted: Boolean(existingRetweet)
  };
}

async function decorateTweetsForViewer(viewerId, tweets) {
  return Promise.all((tweets || []).map((tweet) => decorateTweetForViewer(viewerId, tweet)));
}

module.exports = {
  decorateUserForViewer,
  decorateTweetForViewer,
  decorateTweetsForViewer
};
