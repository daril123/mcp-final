import { executeQuery, executeTransaction } from './mysql-client';

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