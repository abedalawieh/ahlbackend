import mysql from "mysql";
const db = mysql.createConnection({
    host:"sql6.freemysqlhosting.net",
    user : "sql6640921",
    password: "PQTyEQShDy",
    database: "sql6640921"
})
db.connect((error)=>{
    if(error) throw error
    console.log('database connected succesfully')
})

export { db };
