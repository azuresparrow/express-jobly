const { BadRequestError } = require("../expressError");

//Handles converting the javascript key to the SQL key for the SQL table values where it's different
//formats the columns for the db.query function
//then returns the columns and values for the update.
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  //Throw error if the data is empty
  if (keys.length === 0) throw new BadRequestError("No data");

  // formats the column titles and their matching value position for the db.query function
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  //returns the values and columns formatted for the SQL query
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
