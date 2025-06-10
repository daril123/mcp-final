import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// Solo cargar .env si existe en el directorio actual (desarrollo local)
try {
  dotenv.config();
} catch (error) {
  console.error('# .env file not found, using environment variables from system');
}

const requiredEnvVars = ['MYSQL_HOST', 'MYSQL_USER', 'MYSQL_PASSWORD'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Required environment variable ${envVar} is not set. When using NPX, make sure to set these in your environment.`);
  }
}

console.error('# Starting MySQL client configuration');

let pool: mysql.Pool | null = null;

export const getMysqlConnection = async (): Promise<mysql.PoolConnection> => {
  if (!pool) {
    console.error('# Creating new MySQL connection pool with config:', {
      host: process.env.MYSQL_HOST,
      port: process.env.MYSQL_PORT,
      user: process.env.MYSQL_USER,
      database: process.env.MYSQL_DATABASE || 'information_schema',
      // No mostrar password por seguridad
    });

    const sslConfig = process.env.MYSQL_SSL === 'true' ? {
      rejectUnauthorized: false
    } : undefined;

    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE || 'information_schema',
      charset: 'utf8mb4',
      connectionLimit: 10,
      ssl: sslConfig,
    });

    console.error('# MySQL connection pool created successfully');
  }
  
  return pool.getConnection();
};

export const closeMysqlConnection = async (): Promise<void> => {
  if (pool) {
    await pool.end();
    pool = null;
    console.error('# MySQL connection pool closed');
  }
};

// Función auxiliar para ejecutar consultas con manejo automático de conexiones
export const executeQuery = async <T = any>(
  query: string, 
  params?: any[]
): Promise<[T, mysql.FieldPacket[]]> => {
  const connection = await getMysqlConnection();
  try {
    const result = await connection.execute(query, params) as [T, mysql.FieldPacket[]];
    return result;
  } finally {
    connection.release();
  }
};

console.error('# MySQL client configuration completed:', {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || '3306',
  user: process.env.MYSQL_USER ? 'set' : 'not set',
  password: process.env.MYSQL_PASSWORD ? 'set' : 'not set',
  database: process.env.MYSQL_DATABASE || 'information_schema (default)',
  ssl: process.env.MYSQL_SSL === 'true' ? 'enabled' : 'disabled',
});