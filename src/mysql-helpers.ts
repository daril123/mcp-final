import { executeQuery } from './mysql-client';

// Listar todas las bases de datos
export async function listDatabases() {
  console.error('# Starting listDatabases function');
  try {
    const query = 'SHOW DATABASES';
    console.error('# Executing query:', query);
    const [rows] = await executeQuery(query);
    console.error('# Databases retrieved:', rows);
    return rows;
  } catch (error: any) {
    console.error('# ERROR en listDatabases:', error);
    throw new Error(`MySQL Error en listDatabases: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}