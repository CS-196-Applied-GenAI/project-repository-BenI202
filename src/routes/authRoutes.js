const express = require("express");

const requireAuth = require("../middleware/requireAuth");
const authService = require("../services/authService");
const { sendSuccess } = require("../utils/response");

const router = express.Router();

router.post("/signup", async (req, res, next) => {
  try {
    const user = await authService.signup(req.body);
    req.session.userId = user.id;
    sendSuccess(res, { user }, 201);
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const user = await authService.login(req.body);
    req.session.userId = user.id;
    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", requireAuth, async (req, res, next) => {
  req.session.destroy((error) => {
    if (error) {
      next(error);
      return;
    }

    res.clearCookie("chirper.sid");
    sendSuccess(res, {
      message: "Logged out successfully."
    });
  });
});

router.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.session.userId);
    sendSuccess(res, { user });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
