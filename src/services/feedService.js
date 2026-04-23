const tweetRepository = require("../repositories/tweetRepository");
const { parsePagination } = require("./userService");

async function getFeed(userId, pagination) {
  const { limit, offset } = parsePagination(pagination.limit, pagination.offset);
  const items = await tweetRepository.listFeedTweets(userId, limit, offset);

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
