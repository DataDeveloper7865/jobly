const { BadRequestError } = require("../expressError");

// Writes SQL for partial update of a row of data
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  // !! how do we know the indices in keys and values 
  // will correspond if objects unordered?
  //pulls keys of dataToUpdate into an array
  const keys = Object.keys(dataToUpdate);
  //if no data passed, throw error
  if (keys.length === 0) throw new BadRequestError("No data");

  // maps the keys to a section of SQL text that will set the key to its
  // appropriate index in the array of values using $1 notation
  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  //returns the block of SQL text for the SET and the array of values to replace
  // the $ variables
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
