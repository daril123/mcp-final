const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

const requiredEnvVars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is not set.`);
  }
}

console.error('# Starting MySQL client configuration');

let pool = null;

const getMysqlConnection = async () => {
  if (!pool) {
    console.error('# Creating new MySQL connection pool');

    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE || 'information_schema',
      charset: 'utf8mb4',
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
    });

    console.error('# MySQL connection pool created successfully');
  }
  
  return pool.getConnection();
};

const closeMysqlConnection = async () => {
  if (pool) {
    console.error('# Closing MySQL connection pool...');
    await pool.end();
    pool = null;
    console.error('# MySQL connection pool closed');
  }
};

const executeQuery = async (query, params) => {
  let connection = null;
  try {
    connection = await getMysqlConnection();
    console.error(`# Executing query: ${query.substring(0, 100)}${query.length > 100 ? '...' : ''}`);
    
    const result = await connection.execute(query, params);
    console.error(`# Query executed successfully`);
    
    return result;
  } catch (error) {
    console.error('# Query execution error:', error.message);
    throw error;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const testConnection = async () => {
  try {
    const [result] = await executeQuery('SELECT 1 as test');
    console.error('# MySQL connection test successful');
    return true;
  } catch (error) {
    console.error('# MySQL connection test failed:', error.message);
    return false;
  }
};

console.error('# MySQL client configuration completed');

module.exports = {
  getMysqlConnection,
  closeMysqlConnection,
  executeQuery,
  testConnection
};