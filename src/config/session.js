const session = require("express-session");

const { env } = require("./env");

const sessionMiddleware = session({
  name: env.session.name,
  secret: env.session.secret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: env.session.secureCookies
  }
});

module.exports = {
  sessionMiddleware
};
