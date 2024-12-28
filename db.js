const mysql = require('mysql2')
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
})

// Connect to the MySQL database

connection.connect((err) => {
    if (err) {
        console.log('error in connecting sql' + err.stack)
        return
    }
    console.log('Connect to mysql as id' + connection.threadId)
})

module.exports = connection