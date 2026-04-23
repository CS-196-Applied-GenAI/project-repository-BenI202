const express = require("express");

const { sessionMiddleware } = require("./config/session");
const authRoutes = require("./routes/authRoutes");
const feedRoutes = require("./routes/feedRoutes");
const tweetRoutes = require("./routes/tweetRoutes");
const userRoutes = require("./routes/userRoutes");
const { NotFoundError } = require("./utils/errors");
const { sendSuccess } = require("./utils/response");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());
app.use(sessionMiddleware);

app.get("/health", (req, res) => {
  sendSuccess(res, {
    status: "ok"
  });
});

app.use("/auth", authRoutes);
app.use("/feed", feedRoutes);
app.use("/users", userRoutes);
app.use("/tweets", tweetRoutes);

app.use((req, res, next) => {
  next(new NotFoundError("Route not found."));
});

app.use(errorHandler);

module.exports = app;
