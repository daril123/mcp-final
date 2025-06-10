import { getMysqlConnection } from './mysql-client';

// Listar todas las tablas
export async function listTables() {
  console.error('# Starting listTables function');
  try {
    const connection = await getMysqlConnection();
    console.error('# Connection obtained successfully');
    const [rows] = await connection.execute('SHOW TABLES');
    console.error('# Tables retrieved successfully:', rows);
    return rows;
  } catch (error: any) {
    console.error('# ERROR COMPLETO en listTables:');
    console.error('# Error type:', typeof error);
    console.error('# Error code:', error.code);
    console.error('# Error message:', error.message);
    console.error('# Error errno:', error.errno);
    console.error('# SQL State:', error.sqlState);
    console.error('# Error stack:', error.stack);
    console.error('# Error completo object:', JSON.stringify(error, null, 2));
    
    // Retornar error más descriptivo
    const errorMessage = `MySQL Error en listTables: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'} - SQLState: ${error.sqlState || 'N/A'}`;
    throw new Error(errorMessage);
  }
}

// Describir estructura de una tabla
export async function describeTable(tableName: string) {
  console.error('# Starting describeTable function:', tableName);
  try {
    const connection = await getMysqlConnection();
    console.error('# Connection obtained for describeTable');
    const [rows] = await connection.execute(`DESCRIBE \`${tableName}\``);
    console.error('# Table description retrieved:', rows);
    return rows;
  } catch (error: any) {
    console.error('# ERROR COMPLETO en describeTable:');
    console.error('# Error code:', error.code);
    console.error('# Error message:', error.message);
    console.error('# SQL State:', error.sqlState);
    console.error('# Error stack:', error.stack);
    
    const errorMessage = `MySQL Error en describeTable: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`;
    throw new Error(errorMessage);
  }
}

// Crear una tabla
export async function createTable(tableName: string, columns: string) {
  console.error('# Starting createTable function:', { tableName, columns });
  try {
    const connection = await getMysqlConnection();
    const query = `CREATE TABLE \`${tableName}\` (${columns})`;
    console.error('# Executing query:', query);
    const [result] = await connection.execute(query);
    console.error('# Table created successfully:', result);
    return result;
  } catch (error: any) {
    console.error('# ERROR COMPLETO en createTable:');
    console.error('# Error code:', error.code);
    console.error('# Error message:', error.message);
    console.error('# SQL State:', error.sqlState);
    console.error('# Error stack:', error.stack);
    
    const errorMessage = `MySQL Error en createTable: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`;
    throw new Error(errorMessage);
  }
}

// Insertar datos en una tabla
export async function insertData(tableName: string, columns: string[], values: any[][]) {
  console.error('# Starting insertData function:', { tableName, columns, values });
  try {
    const connection = await getMysqlConnection();
    const placeholders = columns.map(() => '?').join(', ');
    const columnNames = columns.map(col => `\`${col}\``).join(', ');
    const query = `INSERT INTO \`${tableName}\` (${columnNames}) VALUES (${placeholders})`;
    
    console.error('# Executing insert query:', query);
    
    const results = [];
    for (const valueRow of values) {
      const [result] = await connection.execute(query, valueRow);
      results.push(result);
    }
    
    console.error('# Data inserted successfully:', results);
    return results;
  } catch (error: any) {
    console.error('# ERROR COMPLETO en insertData:');
    console.error('# Error code:', error.code);
    console.error('# Error message:', error.message);
    console.error('# SQL State:', error.sqlState);
    console.error('# Error stack:', error.stack);
    
    const errorMessage = `MySQL Error en insertData: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`;
    throw new Error(errorMessage);
  }
}

// Consultar datos de una tabla
export async function queryTable(tableName: string, whereClause?: string, limit?: number) {
  console.error('# Starting queryTable function:', { tableName, whereClause, limit });
  try {
    const connection = await getMysqlConnection();
    let query = `SELECT * FROM \`${tableName}\``;
    
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }
    
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    
    console.error('# Executing query:', query);
    const [rows] = await connection.execute(query);
    console.error('# Query executed successfully, rows found:', Array.isArray(rows) ? rows.length : 'unknown');
    return rows;
  } catch (error: any) {
    console.error('# ERROR COMPLETO en queryTable:');
    console.error('# Error code:', error.code);
    console.error('# Error message:', error.message);
    console.error('# SQL State:', error.sqlState);
    console.error('# Error stack:', error.stack);
    
    const errorMessage = `MySQL Error en queryTable: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`;
    throw new Error(errorMessage);
  }
}

// Agregar clave primaria
export async function addPrimaryKey(tableName: string, columns: string[]) {
  console.error('# Starting addPrimaryKey function:', { tableName, columns });
  try {
    const connection = await getMysqlConnection();
    const columnNames = columns.map(col => `\`${col}\``).join(', ');
    const query = `ALTER TABLE \`${tableName}\` ADD PRIMARY KEY (${columnNames})`;
    console.error('# Executing query:', query);
    const [result] = await connection.execute(query);
    console.error('# Primary key added successfully:', result);
    return result;
  } catch (error: any) {
    console.error('# ERROR COMPLETO en addPrimaryKey:');
    console.error('# Error code:', error.code);
    console.error('# Error message:', error.message);
    console.error('# SQL State:', error.sqlState);
    console.error('# Error stack:', error.stack);
    
    const errorMessage = `MySQL Error en addPrimaryKey: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`;
    throw new Error(errorMessage);
  }
}

// Agregar clave foránea
export async function addForeignKey(
  tableName: string, 
  columnName: string, 
  referencedTable: string, 
  referencedColumn: string,
  constraintName?: string
) {
  console.error('# Starting addForeignKey function:', { 
    tableName, columnName, referencedTable, referencedColumn, constraintName 
  });
  try {
    const connection = await getMysqlConnection();
    const constraint = constraintName || `fk_${tableName}_${columnName}`;
    const query = `ALTER TABLE \`${tableName}\` ADD CONSTRAINT \`${constraint}\` 
                   FOREIGN KEY (\`${columnName}\`) REFERENCES \`${referencedTable}\`(\`${referencedColumn}\`)`;
    console.error('# Executing query:', query);
    const [result] = await connection.execute(query);
    console.error('# Foreign key added successfully:', result);
    return result;
  } catch (error: any) {
    console.error('# ERROR COMPLETO en addForeignKey:');
    console.error('# Error code:', error.code);
    console.error('# Error message:', error.message);
    console.error('# SQL State:', error.sqlState);
    console.error('# Error stack:', error.stack);
    
    const errorMessage = `MySQL Error en addForeignKey: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`;
    throw new Error(errorMessage);
  }
}

// Eliminar tabla
export async function dropTable(tableName: string) {
  console.error('# Starting dropTable function:', tableName);
  try {
    const connection = await getMysqlConnection();
    const query = `DROP TABLE \`${tableName}\``;
    console.error('# Executing query:', query);
    const [result] = await connection.execute(query);
    console.error('# Table dropped successfully:', result);
    return result;
  } catch (error: any) {
    console.error('# ERROR COMPLETO en dropTable:');
    console.error('# Error code:', error.code);
    console.error('# Error message:', error.message);
    console.error('# SQL State:', error.sqlState);
    console.error('# Error stack:', error.stack);
    
    const errorMessage = `MySQL Error en dropTable: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`;
    throw new Error(errorMessage);
  }
}

// Mostrar claves foráneas de una tabla
export async function showForeignKeys(tableName: string) {
  console.error('# Starting showForeignKeys function:', tableName);
  try {
    const connection = await getMysqlConnection();
    const query = `
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM 
        INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE 
        REFERENCED_TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `;
    console.error('# Executing query:', query);
    const [rows] = await connection.execute(query, [tableName]);
    console.error('# Foreign keys retrieved:', rows);
    return rows;
  } catch (error: any) {
    console.error('# ERROR COMPLETO en showForeignKeys:');
    console.error('# Error code:', error.code);
    console.error('# Error message:', error.message);
    console.error('# SQL State:', error.sqlState);
    console.error('# Error stack:', error.stack);
    
    const errorMessage = `MySQL Error en showForeignKeys: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`;
    throw new Error(errorMessage);
  }
}

// Ejecutar consulta SQL personalizada
export async function executeCustomQuery(query: string) {
  console.error('# Starting executeCustomQuery function:', query);
  try {
    const connection = await getMysqlConnection();
    console.error('# Executing custom query:', query);
    const [rows] = await connection.execute(query);
    console.error('# Custom query executed successfully');
    return rows;
  } catch (error: any) {
    console.error('# ERROR COMPLETO en executeCustomQuery:');
    console.error('# Error code:', error.code);
    console.error('# Error message:', error.message);
    console.error('# SQL State:', error.sqlState);
    console.error('# Error stack:', error.stack);
    
    const errorMessage = `MySQL Error en executeCustomQuery: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`;
    throw new Error(errorMessage);
  }
}

// Contar registros en una tabla
export async function countRecords(tableName: string, whereClause?: string) {
  console.error('# Starting countRecords function:', { tableName, whereClause });
  try {
    const connection = await getMysqlConnection();
    let query = `SELECT COUNT(*) as count FROM \`${tableName}\``;
    
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }
    
    console.error('# Executing count query:', query);
    const [rows]: any = await connection.execute(query);
    const count = rows[0]?.count || 0;
    console.error('# Count result:', count);
    return count;
  } catch (error: any) {
    console.error('# ERROR COMPLETO en countRecords:');
    console.error('# Error code:', error.code);
    console.error('# Error message:', error.message);
    console.error('# SQL State:', error.sqlState);
    console.error('# Error stack:', error.stack);
    
    const errorMessage = `MySQL Error en countRecords: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`;
    throw new Error(errorMessage);
  }
}