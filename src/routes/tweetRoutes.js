const express = require("express");

const requireAuth = require("../middleware/requireAuth");
const commentService = require("../services/commentService");
const likeService = require("../services/likeService");
const retweetService = require("../services/retweetService");
const tweetService = require("../services/tweetService");
const { sendSuccess } = require("../utils/response");

const router = express.Router();

router.use(requireAuth);

router.post("/", async (req, res, next) => {
  try {
    const tweet = await tweetService.createTweet(req.session.userId, req.body);
    sendSuccess(res, { tweet }, 201);
  } catch (error) {
    next(error);
  }
});

router.get("/:tweetId", async (req, res, next) => {
  try {
    const tweet = await tweetService.getTweetByIdForViewer(req.session.userId, Number(req.params.tweetId));
    sendSuccess(res, { tweet });
  } catch (error) {
    next(error);
  }
});

router.delete("/:tweetId", async (req, res, next) => {
  try {
    await tweetService.deleteTweet(req.session.userId, Number(req.params.tweetId));
    sendSuccess(res, {
      message: "Tweet deleted successfully."
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:tweetId/like", async (req, res, next) => {
  try {
    const tweet = await likeService.likeTweet(req.session.userId, Number(req.params.tweetId));
    sendSuccess(res, { tweet }, 201);
  } catch (error) {
    next(error);
  }
});

router.delete("/:tweetId/like", async (req, res, next) => {
  try {
    const tweet = await likeService.unlikeTweet(req.session.userId, Number(req.params.tweetId));
    sendSuccess(res, { tweet });
  } catch (error) {
    next(error);
  }
});

router.post("/:tweetId/comments", async (req, res, next) => {
  try {
    const comment = await commentService.createComment(req.session.userId, Number(req.params.tweetId), req.body);
    sendSuccess(res, { comment }, 201);
  } catch (error) {
    next(error);
  }
});

router.get("/:tweetId/comments", async (req, res, next) => {
  try {
    const comments = await commentService.listComments(req.session.userId, Number(req.params.tweetId));
    sendSuccess(res, { comments });
  } catch (error) {
    next(error);
  }
});

router.post("/:tweetId/retweet", async (req, res, next) => {
  try {
    const tweet = await retweetService.retweet(req.session.userId, Number(req.params.tweetId));
    sendSuccess(res, { tweet }, 201);
  } catch (error) {
    next(error);
  }
});

router.delete("/:tweetId/retweet", async (req, res, next) => {
  try {
    const tweet = await retweetService.unretweet(req.session.userId, Number(req.params.tweetId));
    sendSuccess(res, { tweet });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
