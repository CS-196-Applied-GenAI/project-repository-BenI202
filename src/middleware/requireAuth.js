const { UnauthorizedError } = require("../utils/errors");

function requireAuth(req, res, next) {
  if (!req.session || !req.session.userId) {
    next(new UnauthorizedError());
    return;
  }

  next();
}

module.exports = requireAuth;
