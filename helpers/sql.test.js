"use strict";

const { sqlForPartialUpdate } = require("./sql.js");

/************************************** helper function test */

describe("SQL for partial update", function () {
    test("works: sql gen function", function () {
        let data =  {"firstName": 'Aliya', "age": 32};
        let jsToSql = { firstName: "first_name" }
        const { setCols, values } = sqlForPartialUpdate(data, jsToSql);
        expect (setCols).toEqual(`"first_name"=$1, "age"=$2`)
        expect(values).toEqual(['Aliya', 32]);
    });
});