import mysql from "mysql";
const db = mysql.createConnection({
    host:"127.0.0.1",
    user : "root",
    password: "",
    database: "senior"
})
db.connect((error)=>{
    if(error) throw error
    console.log('database connected succesfully')
})

export { db };
