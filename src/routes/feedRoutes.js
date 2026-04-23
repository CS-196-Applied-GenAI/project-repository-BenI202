const express = require("express");

const requireAuth = require("../middleware/requireAuth");
const feedService = require("../services/feedService");
const { sendSuccess } = require("../utils/response");

const router = express.Router();

router.use(requireAuth);

router.get("/", async (req, res, next) => {
  try {
    const result = await feedService.getFeed(req.session.userId, req.query);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
