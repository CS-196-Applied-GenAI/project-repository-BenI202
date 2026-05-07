const tweetRepository = require("../repositories/tweetRepository");
const { parsePagination } = require("./userService");
const { decorateTweetsForViewer } = require("./viewerMetadataService");

async function getFeed(userId, pagination) {
  const { limit, offset } = parsePagination(pagination.limit, pagination.offset);
  const feedTweets = await tweetRepository.listFeedTweets(userId, limit, offset);
  const items = await decorateTweetsForViewer(userId, feedTweets);

  return {
    items,
    pagination: {
      limit,
      offset
    }
  };
}

module.exports = {
  getFeed
};
