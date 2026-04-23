jest.mock("../src/config/db", () => ({
  getDbPool: jest.fn()
}));

const { getDbPool } = require("../src/config/db");
const blockRepository = require("../src/repositories/blockRepository");
const commentRepository = require("../src/repositories/commentRepository");
const followRepository = require("../src/repositories/followRepository");
const likeRepository = require("../src/repositories/likeRepository");
const tweetRepository = require("../src/repositories/tweetRepository");
const userRepository = require("../src/repositories/userRepository");

describe("repository helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("userRepository maps a user row by username", async () => {
    const query = jest.fn().mockResolvedValue([[
      {
        id: 1,
        username: "alice",
        email: "alice@example.com",
        name: "Alice",
        bio: "bio",
        profile_picture: "pic.png",
        password_hash: "hash",
        created_at: "2026-04-23T00:00:00.000Z"
      }
    ]]);
    getDbPool.mockReturnValue({ query });

    const user = await userRepository.findUserByUsername("alice");

    expect(query).toHaveBeenCalledTimes(1);
    expect(user).toEqual({
      id: 1,
      username: "alice",
      email: "alice@example.com",
      name: "Alice",
      bio: "bio",
      profilePicture: "pic.png",
      passwordHash: "hash",
      createdAt: "2026-04-23T00:00:00.000Z"
    });
  });

  test("userRepository creates and updates users", async () => {
    const query = jest.fn()
      .mockResolvedValueOnce([{ insertId: 5 }])
      .mockResolvedValueOnce([[
        {
          id: 5,
          username: "alice",
          email: "alice@example.com",
          name: "Alice",
          bio: null,
          profile_picture: null,
          password_hash: "hash",
          created_at: "2026-04-23T00:00:00.000Z"
        }
      ]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[
        {
          id: 5,
          username: "alice",
          email: "alice@example.com",
          name: "Alice Updated",
          bio: "bio",
          profile_picture: "pic.png",
          password_hash: "hash",
          created_at: "2026-04-23T00:00:00.000Z"
        }
      ]]);
    getDbPool.mockReturnValue({ query });

    const createdUser = await userRepository.createUser({
      username: "alice",
      email: "alice@example.com",
      passwordHash: "hash",
      name: "Alice"
    });
    const updatedUser = await userRepository.updateUserProfile(5, {
      name: "Alice Updated",
      bio: "bio",
      profilePicture: "pic.png"
    });

    expect(createdUser.id).toBe(5);
    expect(updatedUser.name).toBe("Alice Updated");
  });

  test("tweetRepository maps tweets and feed items with original tweet data", async () => {
    const row = {
      id: 10,
      text: null,
      image_url: null,
      created_at: "2026-04-23T00:00:00.000Z",
      retweeted_from: 3,
      user_id: 1,
      username: "retweeter",
      name: "Retweeter",
      profile_picture: null,
      original_tweet_id: 3,
      original_text: "original",
      original_image_url: null,
      original_created_at: "2026-04-22T00:00:00.000Z",
      original_user_id: 2,
      original_username: "author",
      original_name: "Author",
      original_profile_picture: null
    };
    const query = jest.fn()
      .mockResolvedValueOnce([[row]])
      .mockResolvedValueOnce([[row]])
      .mockResolvedValueOnce([[row]]);
    getDbPool.mockReturnValue({ query });

    const tweet = await tweetRepository.findTweetById(10);
    const retweet = await tweetRepository.findRetweetByUserAndOriginalTweet(1, 3);
    const feed = await tweetRepository.listFeedTweets(1, 20, 0);

    expect(tweet.originalTweet.id).toBe(3);
    expect(retweet.originalTweet.author.username).toBe("author");
    expect(feed).toHaveLength(1);
  });

  test("tweetRepository write helpers issue queries", async () => {
    const query = jest.fn()
      .mockResolvedValueOnce([{ insertId: 11 }])
      .mockResolvedValueOnce([[
        {
          id: 11,
          text: "hello",
          image_url: null,
          created_at: "2026-04-23T00:00:00.000Z",
          retweeted_from: null,
          user_id: 1,
          username: "alice",
          name: "Alice",
          profile_picture: null,
          original_tweet_id: null,
          original_text: null,
          original_image_url: null,
          original_created_at: null,
          original_user_id: null,
          original_username: null,
          original_name: null,
          original_profile_picture: null
        }
      ]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[
        {
          id: 12,
          text: "tweet",
          image_url: null,
          created_at: "2026-04-23T00:00:00.000Z",
          retweeted_from: null,
          user_id: 1,
          username: "alice",
          name: "Alice",
          profile_picture: null,
          original_tweet_id: null,
          original_text: null,
          original_image_url: null,
          original_created_at: null,
          original_user_id: null,
          original_username: null,
          original_name: null,
          original_profile_picture: null
        }
      ]]);
    getDbPool.mockReturnValue({ query });

    const createdTweet = await tweetRepository.createTweet({
      userId: 1,
      text: "hello",
      imageUrl: null,
      retweetedFrom: null
    });
    await tweetRepository.deleteRetweetsByOriginalTweetId(11);
    await tweetRepository.deleteRetweetByUserAndOriginalTweet(1, 11);
    await tweetRepository.deleteTweetById(11);

    expect(createdTweet.id).toBe(11);
  });

  test("follow, like, block, and comment repositories issue expected queries", async () => {
    const query = jest.fn()
      .mockResolvedValueOnce([[{ 1: 1 }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[{ 1: 1 }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([[{ 1: 1 }]])
      .mockResolvedValueOnce([[{ 1: 1 }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{ insertId: 9 }])
      .mockResolvedValueOnce([[
        {
          id: 9,
          contents: "hi",
          created_at: "2026-04-23T00:00:00.000Z",
          tweet_id: 7,
          user_id: 1,
          username: "alice",
          name: "Alice",
          profile_picture: null
        }
      ]])
      .mockResolvedValueOnce([[
        {
          id: 9,
          contents: "hi",
          created_at: "2026-04-23T00:00:00.000Z",
          tweet_id: 7,
          user_id: 1,
          username: "alice",
          name: "Alice",
          profile_picture: null
        }
      ]]);
    getDbPool.mockReturnValue({ query });

    expect(await followRepository.existsFollow(1, 2)).toBe(true);
    await followRepository.createFollow(1, 2);
    await followRepository.deleteFollowRelationshipsBetweenUsers(1, 2);
    expect(await likeRepository.existsLike(1, 2)).toBe(true);
    await likeRepository.createLike(1, 2);
    await likeRepository.deleteLike(1, 2);
    expect(await blockRepository.existsBlock(1, 2)).toBe(true);
    expect(await blockRepository.usersAreBlocked(1, 2)).toBe(true);
    await blockRepository.createBlock(1, 2);
    await blockRepository.deleteBlock(1, 2);

    const createdComment = await commentRepository.createComment({
      userId: 1,
      tweetId: 7,
      contents: "hi"
    });
    const comments = await commentRepository.listCommentsForTweet(1, 7);

    expect(createdComment.author.username).toBe("alice");
    expect(comments).toHaveLength(1);
  });
});
