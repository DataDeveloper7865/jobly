"use strict";

const db = require("../db.js");
const User = require("../models/user");
const Company = require("../models/company");
const { createToken } = require("../helpers/tokens");
const Job = require("../models/job.js");
let jobarray = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  await db.query("DELETE FROM jobs");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");

  await Company.create(
      {
        handle: "c1",
        name: "C1",
        numEmployees: 1,
        description: "Desc1",
        logoUrl: "http://c1.img",
      });
  await Company.create(
      {
        handle: "c2",
        name: "C2",
        numEmployees: 2,
        description: "Desc2",
        logoUrl: "http://c2.img",
      });
  await Company.create(
      {
        handle: "c3",
        name: "C3",
        numEmployees: 3,
        description: "Desc3",
        logoUrl: "http://c3.img",
      });

  await User.register({
    username: "u1",
    firstName: "U1F",
    lastName: "U1L",
    email: "user1@user.com",
    password: "password1",
    isAdmin: false,
  });
  await User.register({
    username: "u2",
    firstName: "U2F",
    lastName: "U2L",
    email: "user2@user.com",
    password: "password2",
    isAdmin: false,
  });
  await User.register({
    username: "u3",
    firstName: "U3F",
    lastName: "U3L",
    email: "user3@user.com",
    password: "password3",
    isAdmin: false,
  });
  await User.register({
    username: "u4",
    firstName: "U4F",
    lastName: "U4L",
    email: "user4@user.com",
    password: "password4",
    isAdmin: true,
  });

  let j1 = await Job.create(
    {
      title: "pooper scooper 3000",
      salary: 600000,
      equity: ".01",
      companyHandle: "c1"
    });
  let j2 = await Job.create(
    {
      title: "pooper scooper 4000",
      salary: 800000,
      equity: ".01",
      companyHandle: "c1"
    });
  let j3 = await Job.create(
    {
      title: "pooper scooper 5000",
      salary: 900000,
      equity: ".0001",
      companyHandle: "c2"
    });
  jobarray.push(j1)
}


async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


const u1Token = createToken({ username: "u1", isAdmin: false });
const u2Token = createToken({ username: "u2", isAdmin: false });
const adminToken = createToken({ username: "u4", isAdmin: true });



module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  u2Token,
  jobarray
};
