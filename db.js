import mysql from "mysql";
const db = mysql.createConnection({
    host:"sql12.freemysqlhosting.net",
    user : "sql12709634",
    password: "ttjXRKaRii",
    database: "sql12709634"
})
db.connect((error)=>{
    if(error) throw error
    console.log('database connected succesfully')
})

export { db };
