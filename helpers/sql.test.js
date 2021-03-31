const { BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("./sql");

describe("SQL for partial update", ()=>{
    test('successfully generates text', ()=>{
        let dataToUpdate = {firstName: 'Aliya', age: 32}
        let jsToSql = {
            firstName: "first_name",
            lastName: "last_name",
            isAdmin: "is_admin",
          };
        const {setCols, values} = sqlForPartialUpdate(dataToUpdate, jsToSql);
        expect(setCols).toEqual('"first_name"=$1, "age"=$2');
        expect(values).toEqual(['Aliya', 32]);
    });
    test('Bad Request Error when no data passed', ()=>{
        expect( () => {
            sqlForPartialUpdate({},{});
        }).toThrow(BadRequestError);
    });
});

