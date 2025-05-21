const path = require('path')
const mysql = require('mysql');


const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'MRD*goCaps4',
    database: 'swimmers'
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL");
  }

  console.log("Connected to mySQL");
});

  
module.exports = connection;