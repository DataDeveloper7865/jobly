"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  jobarray
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
        title: "pooper scooper to end all scoopers",
        salary: 1000000,
        equity: ".01",
        companyHandle: "c3"
    };

  test("ok for admins", async function () {
    console.log(jobarray[0].id, "sdfk")
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {...newJob, equity: "0.01", id: expect.any(Number)},
    });
  });

  test("fail for non-admins", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          title: "scoop da poop"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          ...newJob,
          salary: "1000000",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /jobs */

describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
        jobs:
        [{
            id: expect.any(Number),
            title: "pooper scooper 3000",
            salary: 600000,
            equity: "0.01",
            companyHandle: "c1"
        },
        {
            id: expect.any(Number),
            title: "pooper scooper 4000",
            salary: 800000,
            equity: "0.01",
            companyHandle: "c1"
        },
        {
            id: expect.any(Number),
            title: "pooper scooper 5000",
            salary: 900000,
            equity: "0.0001",
            companyHandle: "c2"
        }]
        });
    });
  });
  test("with filter data", async ()=> {
    const resp = await request(app).get('/jobs')
      .query({minSalary: 700000})
    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
        jobs:
        [{
            id: expect.any(Number),
            title: "pooper scooper 4000",
            salary: 800000,
            equity: "0.01",
            companyHandle: "c1"
        },
        {
            id: expect.any(Number),
            title: "pooper scooper 5000",
            salary: 900000,
            equity: "0.0001",
            companyHandle: "c2"
        }]
      });
    });
  test("incorrect filter data", async ()=> {
    const resp = await request(app).get('/jobs')
      .query({ttitle: 'p'});
    expect(resp.statusCode).toEqual(400);
    expect(resp.body).toEqual({
      "error": {
        "message": [
          "instance is not allowed to have the additional property \"ttitle\""
        ],
        "status": 400
      }
    });
  });

  test("fails: test next() idr", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-idr works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(500);
  });

/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/${jobarray[0].id}`);
    expect(resp.body).toEqual({
      job: {
        id: jobarray[0].id,
        title: "pooper scooper 3000",
        salary: 600000,
        equity: "0.01",
        companyHandle: "c1"
        }
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobarray[0].id}`)
        .send({
          title: "no more scoopy poop",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
        job: {
            id: jobarray[0].id,
          title: "no more scoopy poop",
          salary: 600000,
          equity: "0.01",
          companyHandle: "c1"
          }
      });
    });

  test("fails for non-admins", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobarray[0].id}`)
        .send({
          title: "C1-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobarray[0].id}`)
        .send({
          title: "C1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
        .patch(`/jobs/nope`)
        .send({
          title: "new nope",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on id change attempt", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobarray[0].id}`)
        .send({
          id: "c1-new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/jobs/${jobarray[0].id}`)
        .send({
          ttitle: "not-a-url",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
        .delete(`/jobs/${jobarray[0].id}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: `${jobarray[0].id}` });
  });

  test("unauth for non-admins", async function () {
    const resp = await request(app)
        .delete(`/jobs/${jobarray[0].id}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/jobs/${jobarray[0].id}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
        .delete(`/jobs/nope`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
