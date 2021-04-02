"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const { ensureLoggedIn, ensureAdmin, ensureAdminOrCurr, ifNotFound404 } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");

const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");
const jobApplicationNew = require("../schemas/jobApplicationNew.json");


const router = express.Router();


// Add new users, requires admin token

router.post("/", ensureAdmin, async function (req, res, next) { 
  const validator = jsonschema.validate(req.body, userNewSchema);
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const user = await User.register(req.body);
  const token = createToken(user);
  return res.status(201).json({ user, token });
});


// Get all users, requires admin token

router.get("/", ensureAdmin, async function (req, res, next) {
  const users = await User.findAll();
  return res.json({ users });
});


// GET a user, must be admin or the user

router.get("/:username", ifNotFound404, ensureAdminOrCurr, async function (req, res, next) {
  return res.json({ user: res.locals.accessedUser });
});


// PATCH a user, must be admin or the user

router.patch("/:username", ifNotFound404, ensureAdminOrCurr, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, userUpdateSchema);
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const user = await User.update(req.params.username, req.body);
  return res.json({ user });
});


// DELETE a user, must be admin or the user

router.delete("/:username", ifNotFound404, ensureAdminOrCurr, async function (req, res, next) {
  await User.remove(req.params.username);
  return res.json({ deleted: req.params.username });
});


// ROUTE to post to a job
router.post("/:username/jobs/:jobId", ensureAdminOrCurr, async function (req, res, next) {
  // const validator = jsonschema.validate(req.body, jobApplicationNew);
  // if (!validator.valid) {
  //   const errs = validator.errors.map(e => e.stack);
  //   throw new BadRequestError(errs);
  // }

  const jobAppId = await User.addAJobApp(req.params.username, req.params.jobId);
  return res.json({ jobAppId });
});


module.exports = router;
