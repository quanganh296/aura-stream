const mysql = require('mysql2/promise');
require('dotenv').config();

// Priority 1: Use MYSQL_URL if available
let poolConfig = process.env.MYSQL_URL || process.env.DATABASE_URL || process.env.MYSQLURL;

// Priority 2: Use Railway-provided env vars (or fall back to local defaults)
if (!poolConfig) {
  poolConfig = {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
    user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASS || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'vibemusic_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
  };
}

const pool = mysql.createPool(poolConfig);

module.exports = pool;
