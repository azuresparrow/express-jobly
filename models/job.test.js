"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  jobIds
} = require("./_testCommon.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newJob = {
    companyHandle: "c1",
    title: "test job",
    salary: 42,
    equity: "0.2",
  };

  test("works", async function () {
    const result = await Job.create(newJob);
    expect(result).toEqual(
      {
        ...newJob,
        id: expect.any(Number),
      },
    );
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: "JobA",
        salary: 1000,
        equity: "0.1",
        companyHandle: "c1"
      },
      {
        id: jobIds[1],
        title: "JobB",
        salary: 100,
        equity: "0.2",
        companyHandle: "c1"
      },
      {
        id: jobIds[2],
        title: "JobC",
        salary: 1200,
        equity: "0",
        companyHandle: "c1"
      }
    ]);
  });
  test("works: min salary", async function () {
    let jobs = await Job.findAll({minSalary: 1000});
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: "JobA",
        salary: 1000,
        equity: "0.1",
        companyHandle: "c1"
      },
      {
        id: jobIds[2],
        title: "JobC",
        salary: 1200,
        equity: "0",
        companyHandle: "c1"
      },
    ]);
  });
  test("works: hasEquity", async function () {
    let jobs = await Job.findAll({hasEquity: true});
    expect(jobs).toEqual([
      {
        id: jobIds[0],
        title: "JobA",
        salary: 1000,
        equity: "0.1",
        companyHandle: "c1"
      },
      {
        id: jobIds[1],
        title: "JobB",
        salary: 100,
        equity: "0.2",
        companyHandle: "c1"
      }
    ]);
  });
  

  test("works: equity & min", async function() {
    let companies = await Job.findAll({minSalary: 1000, hasEquity:true});
    expect(companies).toEqual([
      {
        id: jobIds[0],
        title: "JobA",
        salary: 1000,
        equity: "0.1",
        companyHandle: "c1"
      }
    ]);
  });

  test("works: name filter", async function() { 
    let jobs = await Job.findAll({title: "c"});
    expect(jobs).toEqual([{
      id: jobIds[2],
      title: "JobC",
      salary: 1200,
      equity: "0",
      companyHandle: "c1"
    }]);
  });
  test("works: filter that finds nothing", async function(){
    let jobs = await Job.findAll({title:"2304"});
    expect(jobs).toEqual([])
  });
}); 

/************************************** get */


describe("get", function () {
  test("works", async function () {
    let job = await Job.get(jobIds[2]);
    expect(job).toEqual({
      id: jobIds[2],
      title: "JobC",
      salary: 1200,
      equity: "0",
      companyHandle: "c1"
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(12300);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "New",
    salary: 1001
  };

  test("works", async function () {
    let job = await Job.update(jobIds[0], updateData);
    expect(job).toEqual({
      id: jobIds[0],
      title: "New",
      salary: 1001,
      equity: "0.1",
      companyHandle: "c1"
    });
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "New",
      salary: null,
      equity: null,
    };

    let job = await Job.update(jobIds[0], updateDataSetNulls);
    expect(job).toEqual({
      id: jobIds[0],
      title: "New",
      salary: null,
      equity: null,
      companyHandle: "c1"
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.update(124345, updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(jobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(jobIds[0]);
    const res = await db.query(
        "SELECT id FROM jobs WHERE id=$1", [jobIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(100000);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});