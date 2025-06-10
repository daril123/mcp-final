import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Solo cargar .env si existe en el directorio actual (desarrollo local)
try {
  dotenv.config();
} catch (error) {
  console.error('# .env file not found, using environment variables from system');
}

const requiredEnvVars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD', 'MYSQL_DATABASE'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is not set. When using NPX, make sure to set these in Claude Desktop config.`);
  }
}

console.error('# Starting MySQL client configuration');

let connection: mysql.Connection | null = null;

export const getMysqlConnection = async (): Promise<mysql.Connection> => {
  if (!connection) {
    console.error('# Creating new MySQL connection with config:', {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      database: process.env.MYSQL_DATABASE,
      // No mostrar password por seguridad
    });

    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      charset: 'utf8mb4',
    });

    console.error('# MySQL connection established successfully');
  }
  return connection;
};

export const closeMysqlConnection = async (): Promise<void> => {
  if (connection) {
    await connection.end();
    connection = null;
    console.error('# MySQL connection closed');
  }
};

console.error('# MySQL client configuration completed:', {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || '3306',
  user: process.env.MYSQL_USER ? 'set' : 'not set',
  password: process.env.MYSQL_PASSWORD ? 'set' : 'not set',
  database: process.env.MYSQL_DATABASE || 'not set',
});