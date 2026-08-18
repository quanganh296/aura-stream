const mysql = require('mysql2/promise');
require('dotenv').config();

const dbUri = process.env.MYSQL_URL || process.env.DATABASE_URL || process.env.MYSQLURL;

const poolConfig = dbUri ? dbUri : {
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '123456',
  database: process.env.DB_NAME || 'vibemusic_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

const pool = mysql.createPool(poolConfig);

module.exports = pool;
