require('dotenv').config();
const mariadb = require('mariadb');

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME,
  connectionLimit: 5
});

pool.getConnection()
  .then(conn => {
    console.log("Connected to MariaDB!");
    conn.end();
  })
  .catch(err => {
    console.error("Error connecting to MariaDB:", err);
  });

module.exports = pool;