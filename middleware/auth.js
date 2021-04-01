"use strict";

/** Convenience middleware to handle common auth cases in routes. */

const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const { UnauthorizedError } = require("../expressError");
const User = require("../models/user");


/** Middleware: Authenticate user.
 *
 * If a token was provided, verify it, and, if valid, store the token payload
 * on res.locals (this will include the username and isAdmin field.)
 *
 * It's not an error if no token was provided or if the token is not valid.
 */

function authenticateJWT(req, res, next) {
  try {
    //returns either the left hand side or the left hand side depending on whether first is truthy
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** TODO: Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureAdmin(req, res, next) {
  try {
    if (!res.locals.user || !res.locals.user.isAdmin) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

function ensureAdminOrCurr(req, res, next) {
  try {
    // check if username exists, return 404 if not
    if (!res.locals.user || (!res.locals.user.isAdmin 
          && res.locals.user.username !== req.params.username)) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

async function ifNotFound404(req, res, next) {
  try {
    const user = await User.get(req.params.username);
    res.locals.accessedUser = user;
    return next();
  } catch(e){
    return next(e);
  }
}

//!! how can we get more messages from the error server?

module.exports = {
  ifNotFound404,
  ensureAdminOrCurr,
  authenticateJWT,
  ensureLoggedIn,
  ensureAdmin
};
