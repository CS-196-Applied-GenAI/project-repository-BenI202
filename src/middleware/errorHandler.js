function errorHandler(error, req, res, next) {
  const status = error.statusCode || 500;
  const code = error.code || "INTERNAL_SERVER_ERROR";
  const message = error.message || "Something went wrong.";

  res.status(status).json({
    error: {
      code,
      message
    }
  });
}

module.exports = errorHandler;
