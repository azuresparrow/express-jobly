"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws BadRequestError if job already in database.
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const result = await db.query(
          `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING title, salary, equity, company_handle AS "companyHandle"`,
        [
          title,
          salary,
          equity,
          companyHandle
        ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs.
   *
   * Returns [ { id, title, salary, equity, companyHandle }, ...]
   * 
   * Able to filter by the job title case-insensitive
   * 
   * Able to filter by a minimum salary
   * 
   * Can filter by if the job offers equity
   * */

  static async findAll(filters = {}) {
    let query = `SELECT id,
                        title,
                        salary,
                        equity,
                        company_handle AS "companyHandle"
                  FROM jobs `;

    let conditionals = [];
    let values = [];
    let {title, minSalary, hasEquity} = filters;
    

    if(title !== undefined ) {
      values.push(`%${title}%`);
      conditionals.push(`title ILIKE $${values.length}`);
    }
    if(minSalary !== undefined ) {
      values.push(minSalary)
      conditionals.push(`salary >= $${values.length}`);
    }
    if(hasEquity !== undefined && hasEquity){
      conditionals.push(`equity > 0`);
    }
    //any conditional
    if(conditionals.length > 0) {
      query += ' WHERE ' + conditionals.join(' AND ');
    } 
    query += ' ORDER BY title';
    const companiesRes = await db.query(query, values);
    return companiesRes.rows;
  }

  /** Given a job id, return data about it.
   *
   * Returns { id, title, salary, equity, companyHandle }
   * 
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
          `SELECT id,
          title,
          salary,
          equity,
          company_handle AS "companyHandle"
          FROM jobs
          WHERE id = $1`,
        [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {title, salary, equity}
   * 
   * The associated company and id cannot be altered
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity
                                company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM companies
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Job;
