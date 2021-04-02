const { BadRequestError } = require("../expressError");

// Writes SQL for partial update of a row of data
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
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

function filterUndefined(filterObj) {
  for (let key in filterObj) {
    if (filterObj[key] === undefined ||
      (key === "hasEquity" && filterObj[key] !== "true")) {
      delete(filterObj[key]);

    }
  }
  return filterObj;
}

function filterBuilder(filterParams){
    //filter body where no input received
    let params = filterUndefined(filterParams);

    let myValArray = [];
    let queryFor = [];

    //puts the keys and values into arrays
    for (let key in params) {
      myValArray.push(params[key])
      queryFor.push(key)
    }
    //makes individual query conditions for each filter parameter
    for (let i = 0; i < queryFor.length; i++) {
      if (queryFor[i] === 'name') {
        myValArray[i] =  "%" + myValArray[i] + "%"
        queryFor[i] = `name LIKE $${i+1}`;
      }
      else if (queryFor[i] === 'minEmployees') {
        queryFor[i] = `num_employees >= $${i+1}`;
      }
      else if (queryFor[i] === 'maxEmployees') {
        queryFor[i] = `num_employees <= $${i+1}`;
      }
      else if (queryFor[i] === 'title') {
        myValArray[i] =  "%" + myValArray[i] + "%"
        queryFor[i] = `title ILIKE $${i+1}`;
      }
      else if (queryFor[i] === 'minSalary') {
        queryFor[i] = `salary >= $${i+1}`;
      }
      //dis a bih
      else if (queryFor[i] === 'hasEquity') {
        queryFor[i] = `equity > ${i+1}`;
        myValArray[i] = '0.000000';
      }
    }
    console.log(queryFor, myValArray)
    // joins individual conditions into one WHERE statement
    let finalQuery = "";
    if (queryFor.length > 0) {
      finalQuery += "WHERE " + queryFor.join(" AND ");
    }
    console.log(finalQuery, "HEREEE")
    return {finalQuery, myValArray};
  }

module.exports = { sqlForPartialUpdate, filterBuilder };
