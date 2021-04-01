"use strict";

/** Routes for companies. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
// const jobUpdateSchema = require("../schemas/jobUpdate.json");
// const jobFilterSchema = require("../schemas/jobFilter.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: login
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  const validator = jsonschema.validate(req.body, jobNewSchema);
  if (!validator.valid) {
    const errs = validator.errors.map(e => e.stack);
    throw new BadRequestError(errs);
  }

  const job = await Job.create(req.body);
  return res.status(201).json({ job });
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */

// !! How does the client (in a normal situation) know when to send the token?

// router.get("/", async function (req, res, next) {
//   //check for incorrect filters
//   const validator = jsonschema.validate(req.query, companyFilterSchema);
//   if(!validator.valid){
//     const errs = validator.errors.map(e => e.stack);
//     return next(new BadRequestError(errs));
//   }
//   const {minEmployees, maxEmployees} = req.query;
//   if((minEmployees && maxEmployees) && (minEmployees > maxEmployees)){
//     //need to test this
//     return next(new BadRequestError('min employees greater than max employees'))
//   }
//   const companies = await Company.findAll(req.query);
//   return res.json({ companies });
// });

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */

// router.get("/:handle", async function (req, res, next) {
//   const company = await Company.get(req.params.handle);
//   return res.json({ company });
// });

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: login
 */

// router.patch("/:handle", ensureAdmin, async function (req, res, next) {
//   const validator = jsonschema.validate(req.body, companyUpdateSchema);
//   if (!validator.valid) {
//     const errs = validator.errors.map(e => e.stack);
//     throw new BadRequestError(errs);
//   }

//   const company = await Company.update(req.params.handle, req.body);
//   return res.json({ company });
// });

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: login
 */

// router.delete("/:handle", ensureAdmin, async function (req, res, next) {
//   await Company.remove(req.params.handle);
//   return res.json({ deleted: req.params.handle });
// });


module.exports = router;