const { executeQuery } = require('./mysql-client');

// Listar todas las bases de datos
async function listDatabases() {
  console.error('# Starting listDatabases function');
  try {
    const query = 'SHOW DATABASES';
    console.error('# Executing query:', query);
    const [rows] = await executeQuery(query);
    console.error('# Databases retrieved:', rows);
    return rows;
  } catch (error) {
    console.error('# ERROR en listDatabases:', error);
    throw new Error(`MySQL Error en listDatabases: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Listar todas las tablas de una base de datos
async function listTables(database) {
  console.error('# Starting listTables function for database:', database);
  try {
    const query = 'SHOW TABLES FROM ??';
    console.error('# Executing query:', query, 'with database:', database);
    const [rows] = await executeQuery(query, [database]);
    console.error('# Tables retrieved:', rows);
    return rows;
  } catch (error) {
    console.error('# ERROR en listTables:', error);
    throw new Error(`MySQL Error en listTables: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Describir la estructura de una tabla
async function describeTable(database, tableName) {
  console.error('# Starting describeTable function for:', `${database}.${tableName}`);
  try {
    const query = 'DESCRIBE ??.??';
    console.error('# Executing query:', query);
    const [rows] = await executeQuery(query, [database, tableName]);
    console.error('# Table structure retrieved:', rows);
    return rows;
  } catch (error) {
    console.error('# ERROR en describeTable:', error);
    throw new Error(`MySQL Error en describeTable: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Obtener información detallada de una tabla
async function getTableInfo(database, tableName) {
  console.error('# Starting getTableInfo function for:', `${database}.${tableName}`);
  try {
    const query = `
      SELECT 
        TABLE_NAME,
        ENGINE,
        VERSION,
        ROW_FORMAT,
        TABLE_ROWS,
        AVG_ROW_LENGTH,
        DATA_LENGTH,
        MAX_DATA_LENGTH,
        INDEX_LENGTH,
        DATA_FREE,
        AUTO_INCREMENT,
        CREATE_TIME,
        UPDATE_TIME,
        TABLE_COLLATION,
        TABLE_COMMENT
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
    `;
    console.error('# Executing query:', query);
    const [rows] = await executeQuery(query, [database, tableName]);
    console.error('# Table info retrieved:', rows);
    return rows[0] || null;
  } catch (error) {
    console.error('# ERROR en getTableInfo:', error);
    throw new Error(`MySQL Error en getTableInfo: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Seleccionar datos de una tabla con límite y condiciones
async function selectFromTable(database, tableName, limit = 100, whereClause, columns) {
  console.error('# Starting selectFromTable function for:', `${database}.${tableName}`);
  try {
    const selectColumns = columns || '*';
    let query = `SELECT ${selectColumns} FROM ??.??`;
    const params = [database, tableName];
    
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }
    
    query += ` LIMIT ?`;
    params.push(limit);
    
    console.error('# Executing query:', query, 'with params:', params);
    const [rows] = await executeQuery(query, params);
    console.error('# Rows retrieved:', Array.isArray(rows) ? rows.length : 'Unknown');
    return rows;
  } catch (error) {
    console.error('# ERROR en selectFromTable:', error);
    throw new Error(`MySQL Error en selectFromTable: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Contar filas en una tabla
async function countRows(database, tableName, whereClause) {
  console.error('# Starting countRows function for:', `${database}.${tableName}`);
  try {
    let query = 'SELECT COUNT(*) as count FROM ??.??';
    const params = [database, tableName];
    
    if (whereClause) {
      query += ` WHERE ${whereClause}`;
    }
    
    console.error('# Executing query:', query, 'with params:', params);
    const [rows] = await executeQuery(query, params);
    const count = Array.isArray(rows) && rows.length > 0 ? rows[0].count : 0;
    console.error('# Count result:', count);
    return count;
  } catch (error) {
    console.error('# ERROR en countRows:', error);
    throw new Error(`MySQL Error en countRows: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Obtener índices de una tabla
async function getTableIndexes(database, tableName) {
  console.error('# Starting getTableIndexes function for:', `${database}.${tableName}`);
  try {
    const query = 'SHOW INDEX FROM ??.??';
    console.error('# Executing query:', query);
    const [rows] = await executeQuery(query, [database, tableName]);
    console.error('# Indexes retrieved:', rows);
    return rows;
  } catch (error) {
    console.error('# ERROR en getTableIndexes:', error);
    throw new Error(`MySQL Error en getTableIndexes: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

// Ejecutar una consulta personalizada (solo SELECT para seguridad)
async function executeCustomQuery(query, params) {
  console.error('# Starting executeCustomQuery function');
  try {
    // Validar que solo sean consultas SELECT
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery.startsWith('select') && !trimmedQuery.startsWith('show') && !trimmedQuery.startsWith('describe')) {
      throw new Error('Solo se permiten consultas SELECT, SHOW y DESCRIBE por seguridad');
    }
    
    console.error('# Executing custom query:', query, 'with params:', params);
    const [rows] = await executeQuery(query, params);
    console.error('# Custom query results:', Array.isArray(rows) ? rows.length : 'Unknown');
    return rows;
  } catch (error) {
    console.error('# ERROR en executeCustomQuery:', error);
    throw new Error(`MySQL Error en executeCustomQuery: ${error.code || 'UNKNOWN'} - ${error.message || 'Sin mensaje'}`);
  }
}

module.exports = {
  listDatabases,
  listTables,
  describeTable,
  getTableInfo,
  selectFromTable,
  countRows,
  getTableIndexes,
  executeCustomQuery
};