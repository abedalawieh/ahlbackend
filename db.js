import mysql from "mysql";
const db = mysql.createConnection({
    host:"localhost",
    user : "root",
    password: "",
    database: "senior"
})
db.connect((error)=>{
    if(error) throw error
    console.log('database connected succesfully')
})

export { db };
