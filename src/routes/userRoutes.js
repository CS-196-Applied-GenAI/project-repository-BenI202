const express = require("express");

const requireAuth = require("../middleware/requireAuth");
const blockService = require("../services/blockService");
const followService = require("../services/followService");
const userService = require("../services/userService");
const { sendSuccess } = require("../utils/response");

const router = express.Router();

router.use(requireAuth);

router.patch("/me", async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.session.userId, req.body);
    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
});

router.post("/:username/follow", async (req, res, next) => {
  try {
    const user = await followService.followUser(req.session.userId, req.params.username);
    sendSuccess(res, { user }, 201);
  } catch (error) {
    next(error);
  }
});

router.delete("/:username/follow", async (req, res, next) => {
  try {
    const user = await followService.unfollowUser(req.session.userId, req.params.username);
    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
});

router.post("/:username/block", async (req, res, next) => {
  try {
    const user = await blockService.blockUser(req.session.userId, req.params.username);
    sendSuccess(res, { user }, 201);
  } catch (error) {
    next(error);
  }
});

router.delete("/:username/block", async (req, res, next) => {
  try {
    const user = await blockService.unblockUser(req.session.userId, req.params.username);
    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
});

router.get("/:username", async (req, res, next) => {
  try {
    const user = await userService.getProfileByUsername(req.session.userId, req.params.username);
    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
});

router.get("/:username/tweets", async (req, res, next) => {
  try {
    const result = await userService.getTweetsByUsername(req.session.userId, req.params.username, req.query);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
