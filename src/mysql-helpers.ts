import { executeQuery, executeTransaction } from './mysql-client';

// ========================
// FUNCIONES BÁSICAS DE MYSQL
// ========================

// Listar todas las tablas
export async function listTables() {
  console.error('# Starting listTables function');
  try {
    const query = 'SHOW TABLES';
    console.error('# Executing query:', query);
    const [rows] = await executeQuery(query);
    console.error('# Tables retrieved:', rows);
    return rows;
  } catch (error: any) {
    console.error('# ERROR en listTables:', error);
    throw new Error(`MySQL Error en listTables: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Describir estructura de una tabla
export async function describeTable(tableName: string) {
  console.error('# Starting describeTable function:', tableName);
  try {
    const query = `DESCRIBE \`${tableName}\``;
    console.error('# Executing query:', query);
    const [rows] = await executeQuery(query);
    console.error('# Table structure retrieved:', rows);
    return rows;
  } catch (error: any) {
    console.error('# ERROR en describeTable:', error);
    throw new Error(`MySQL Error en describeTable: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Crear tabla
export async function createTable(tableName: string, columns: string) {
  console.error('# Starting createTable function:', { tableName, columns });
  try {
    const query = `CREATE TABLE \`${tableName}\` (${columns})`;
    console.error('# Executing query:', query);
    const [result] = await executeQuery(query);
    console.error('# Table created successfully:', result);
    return result;
  } catch (error: any) {
    console.error('# ERROR en createTable:', error);
    throw new Error(`MySQL Error en createTable: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Insertar datos
export async function insertData(tableName: string, columns: string[], values: any[][]) {
  console.error('# Starting insertData function:', { tableName, columns, values });
  try {
    const columnNames = columns.map(col => `\`${col}\``).join(', ');
    const placeholders = values.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');
    const query = `INSERT INTO \`${tableName}\` (${columnNames}) VALUES ${placeholders}`;
    
    // Aplanar el array de valores
    const flatValues = values.flat();
    
    console.error('# Executing query:', query, 'with values:', flatValues);
    const [result] = await executeQuery(query, flatValues);
    console.error('# Data inserted successfully:', result);
    return result;
  } catch (error: any) {
    console.error('# ERROR en insertData:', error);
    throw new Error(`MySQL Error en insertData: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Consultar datos de una tabla
export async function queryTable(tableName: string, whereClause?: string, limit?: number) {
  console.error('# Starting queryTable function:', { tableName, whereClause, limit });
  try {
    let query = `SELECT * FROM \`${tableName}\``;
    
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }
    
    if (limit) {
      query += ` LIMIT ${limit}`;
    }
    
    console.error('# Executing query:', query);
    const [rows] = await executeQuery(query);
    console.error('# Data retrieved:', rows);
    return rows;
  } catch (error: any) {
    console.error('# ERROR en queryTable:', error);
    throw new Error(`MySQL Error en queryTable: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Agregar clave primaria
export async function addPrimaryKey(tableName: string, columns: string[]) {
  console.error('# Starting addPrimaryKey function:', { tableName, columns });
  try {
    const columnNames = columns.map(col => `\`${col}\``).join(', ');
    const query = `ALTER TABLE \`${tableName}\` ADD PRIMARY KEY (${columnNames})`;
    console.error('# Executing query:', query);
    const [result] = await executeQuery(query);
    console.error('# Primary key added successfully:', result);
    return result;
  } catch (error: any) {
    console.error('# ERROR en addPrimaryKey:', error);
    throw new Error(`MySQL Error en addPrimaryKey: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
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
  console.error('# Starting addForeignKey function:', { tableName, columnName, referencedTable, referencedColumn, constraintName });
  try {
    const constraintNameFinal = constraintName || `fk_${tableName}_${columnName}`;
    const query = `ALTER TABLE \`${tableName}\` ADD CONSTRAINT \`${constraintNameFinal}\` FOREIGN KEY (\`${columnName}\`) REFERENCES \`${referencedTable}\`(\`${referencedColumn}\`)`;
    console.error('# Executing query:', query);
    const [result] = await executeQuery(query);
    console.error('# Foreign key added successfully:', result);
    return result;
  } catch (error: any) {
    console.error('# ERROR en addForeignKey:', error);
    throw new Error(`MySQL Error en addForeignKey: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Mostrar claves foráneas
export async function showForeignKeys(tableName: string) {
  console.error('# Starting showForeignKeys function:', tableName);
  try {
    const query = `
      SELECT 
        CONSTRAINT_NAME,
        COLUMN_NAME,
        REFERENCED_TABLE_NAME,
        REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = ? 
        AND REFERENCED_TABLE_NAME IS NOT NULL
    `;
    console.error('# Executing query:', query);
    const [rows] = await executeQuery(query, [tableName]);
    console.error('# Foreign keys retrieved:', rows);
    return rows;
  } catch (error: any) {
    console.error('# ERROR en showForeignKeys:', error);
    throw new Error(`MySQL Error en showForeignKeys: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Eliminar tabla
export async function dropTable(tableName: string) {
  console.error('# Starting dropTable function:', tableName);
  try {
    const query = `DROP TABLE \`${tableName}\``;
    console.error('# Executing query:', query);
    const [result] = await executeQuery(query);
    console.error('# Table dropped successfully:', result);
    return result;
  } catch (error: any) {
    console.error('# ERROR en dropTable:', error);
    throw new Error(`MySQL Error en dropTable: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Ejecutar consulta SQL personalizada
export async function executeCustomQuery(query: string) {
  console.error('# Starting executeCustomQuery function:', query);
  try {
    console.error('# Executing custom query:', query);
    const [result] = await executeQuery(query);
    console.error('# Custom query executed successfully:', result);
    return result;
  } catch (error: any) {
    console.error('# ERROR en executeCustomQuery:', error);
    throw new Error(`MySQL Error en executeCustomQuery: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Contar registros
export async function countRecords(tableName: string, whereClause?: string) {
  console.error('# Starting countRecords function:', { tableName, whereClause });
  try {
    let query = `SELECT COUNT(*) as count FROM \`${tableName}\``;
    
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }
    
    console.error('# Executing query:', query);
    const [rows] = await executeQuery(query);
    const count = Array.isArray(rows) && rows.length > 0 ? (rows[0] as any).count : 0;
    console.error('# Record count retrieved:', count);
    return count;
  } catch (error: any) {
    console.error('# ERROR en countRecords:', error);
    throw new Error(`MySQL Error en countRecords: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// ========================
// GESTIÓN DE ÍNDICES
// ========================

// Mostrar índices de una tabla
export async function showIndexes(tableName: string) {
  console.error('# Starting showIndexes function:', tableName);
  try {
    const query = `SHOW INDEXES FROM \`${tableName}\``;
    console.error('# Executing query:', query);
    const [rows] = await executeQuery(query);
    console.error('# Indexes retrieved:', rows);
    return rows;
  } catch (error: any) {
    console.error('# ERROR en showIndexes:', error);
    throw new Error(`MySQL Error en showIndexes: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Crear índice
export async function createIndex(tableName: string, indexName: string, columns: string[], isUnique = false) {
  console.error('# Starting createIndex function:', { tableName, indexName, columns, isUnique });
  try {
    const uniqueKeyword = isUnique ? 'UNIQUE' : '';
    const columnNames = columns.map(col => `\`${col}\``).join(', ');
    const query = `CREATE ${uniqueKeyword} INDEX \`${indexName}\` ON \`${tableName}\` (${columnNames})`;
    console.error('# Executing query:', query);
    const [result] = await executeQuery(query);
    console.error('# Index created successfully:', result);
    return result;
  } catch (error: any) {
    console.error('# ERROR en createIndex:', error);
    throw new Error(`MySQL Error en createIndex: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Eliminar índice
export async function dropIndex(tableName: string, indexName: string) {
  console.error('# Starting dropIndex function:', { tableName, indexName });
  try {
    const query = `DROP INDEX \`${indexName}\` ON \`${tableName}\``;
    console.error('# Executing query:', query);
    const [result] = await executeQuery(query);
    console.error('# Index dropped successfully:', result);
    return result;
  } catch (error: any) {
    console.error('# ERROR en dropIndex:', error);
    throw new Error(`MySQL Error en dropIndex: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// ========================
// GESTIÓN DE VISTAS
// ========================

// Listar vistas
export async function listViews() {
  console.error('# Starting listViews function');
  try {
    const query = `
      SELECT TABLE_NAME as view_name, VIEW_DEFINITION as definition 
      FROM INFORMATION_SCHEMA.VIEWS 
      WHERE TABLE_SCHEMA = DATABASE()
    `;
    console.error('# Executing query:', query);
    const [rows] = await executeQuery(query);
    console.error('# Views retrieved:', rows);
    return rows;
  } catch (error: any) {
    console.error('# ERROR en listViews:', error);
    throw new Error(`MySQL Error en listViews: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Crear vista
export async function createView(viewName: string, selectQuery: string) {
  console.error('# Starting createView function:', { viewName, selectQuery });
  try {
    const query = `CREATE VIEW \`${viewName}\` AS ${selectQuery}`;
    console.error('# Executing query:', query);
    const [result] = await executeQuery(query);
    console.error('# View created successfully:', result);
    return result;
  } catch (error: any) {
    console.error('# ERROR en createView:', error);
    throw new Error(`MySQL Error en createView: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Eliminar vista
export async function dropView(viewName: string) {
  console.error('# Starting dropView function:', viewName);
  try {
    const query = `DROP VIEW \`${viewName}\``;
    console.error('# Executing query:', query);
    const [result] = await executeQuery(query);
    console.error('# View dropped successfully:', result);
    return result;
  } catch (error: any) {
    console.error('# ERROR en dropView:', error);
    throw new Error(`MySQL Error en dropView: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// ========================
// ESTADÍSTICAS Y ANÁLISIS
// ========================

// Obtener tamaño de tablas
export async function getTableSizes() {
  console.error('# Starting getTableSizes function');
  try {
    const query = `
      SELECT 
        TABLE_NAME as table_name,
        ROUND(((DATA_LENGTH + INDEX_LENGTH) / 1024 / 1024), 2) as size_mb,
        TABLE_ROWS as row_count,
        ROUND((DATA_LENGTH / 1024 / 1024), 2) as data_size_mb,
        ROUND((INDEX_LENGTH / 1024 / 1024), 2) as index_size_mb
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY (DATA_LENGTH + INDEX_LENGTH) DESC
    `;
    console.error('# Executing query:', query);
    const [rows] = await executeQuery(query);
    console.error('# Table sizes retrieved:', rows);
    return rows;
  } catch (error: any) {
    console.error('# ERROR en getTableSizes:', error);
    throw new Error(`MySQL Error en getTableSizes: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Obtener información de la base de datos
export async function getDatabaseInfo() {
  console.error('# Starting getDatabaseInfo function');
  try {
    const queries = {
      version: 'SELECT VERSION() as version',
      database: 'SELECT DATABASE() as current_database',
      charset: 'SELECT @@character_set_database as charset, @@collation_database as collation',
      uptime: 'SHOW STATUS LIKE "Uptime"',
      connections: 'SHOW STATUS LIKE "Connections"'
    };

    const results: any = {};
    
    for (const [key, query] of Object.entries(queries)) {
      const [rows] = await executeQuery(query);
      results[key] = rows;
    }

    console.error('# Database info retrieved:', results);
    return results;
  } catch (error: any) {
    console.error('# ERROR en getDatabaseInfo:', error);
    throw new Error(`MySQL Error en getDatabaseInfo: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// ========================
// OPERACIONES AVANZADAS
// ========================

// Actualizar datos
export async function updateData(
  tableName: string, 
  updates: Record<string, any>, 
  whereClause: string
) {
  console.error('# Starting updateData function:', { tableName, updates, whereClause });
  try {
    const setClause = Object.keys(updates)
      .map(col => `\`${col}\` = ?`)
      .join(', ');
    
    const query = `UPDATE \`${tableName}\` SET ${setClause} WHERE ${whereClause}`;
    const values = Object.values(updates);
    
    console.error('# Executing query:', query, 'with values:', values);
    const [result] = await executeQuery(query, values);
    console.error('# Data updated successfully:', result);
    return result;
  } catch (error: any) {
    console.error('# ERROR en updateData:', error);
    throw new Error(`MySQL Error en updateData: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Eliminar datos
export async function deleteData(tableName: string, whereClause: string) {
  console.error('# Starting deleteData function:', { tableName, whereClause });
  try {
    const query = `DELETE FROM \`${tableName}\` WHERE ${whereClause}`;
    console.error('# Executing query:', query);
    const [result] = await executeQuery(query);
    console.error('# Data deleted successfully:', result);
    return result;
  } catch (error: any) {
    console.error('# ERROR en deleteData:', error);
    throw new Error(`MySQL Error en deleteData: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Backup de tabla (exportar como INSERT statements)
export async function backupTable(tableName: string, includeStructure = true) {
  console.error('# Starting backupTable function:', { tableName, includeStructure });
  try {
    const results: string[] = [];
    
    if (includeStructure) {
      const [createResult] = await executeQuery(`SHOW CREATE TABLE \`${tableName}\``);
      if (Array.isArray(createResult) && createResult.length > 0) {
        const createStatement = (createResult[0] as any)['Create Table'];
        results.push(`-- Estructura de la tabla ${tableName}`);
        results.push(`DROP TABLE IF EXISTS \`${tableName}\`;`);
        results.push(createStatement + ';');
        results.push('');
      }
    }
    
    // Obtener datos
    const [data] = await executeQuery(`SELECT * FROM \`${tableName}\``);
    if (Array.isArray(data) && data.length > 0) {
      results.push(`-- Datos de la tabla ${tableName}`);
      
      // Obtener nombres de columnas
      const columns = Object.keys(data[0]);
      const columnNames = columns.map(col => `\`${col}\``).join(', ');
      
      for (const row of data) {
        const values = columns.map(col => {
          const value = (row as any)[col];
          if (value === null) return 'NULL';
          if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
          if (value instanceof Date) return `'${value.toISOString().slice(0, 19).replace('T', ' ')}'`;
          return value;
        }).join(', ');
        
        results.push(`INSERT INTO \`${tableName}\` (${columnNames}) VALUES (${values});`);
      }
    }
    
    const backup = results.join('\n');
    console.error('# Backup created successfully');
    return backup;
  } catch (error: any) {
    console.error('# ERROR en backupTable:', error);
    throw new Error(`MySQL Error en backupTable: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}