// Tipos para operaciones de base de datos
export interface TableInfo {
  Field: string;
  Type: string;
  Null: 'YES' | 'NO';
  Key: 'PRI' | 'UNI' | 'MUL' | '';
  Default: string | null;
  Extra: string;
}

export interface ForeignKeyInfo {
  CONSTRAINT_NAME: string;
  COLUMN_NAME: string;
  REFERENCED_TABLE_NAME: string;
  REFERENCED_COLUMN_NAME: string;
}

export interface IndexInfo {
  Table: string;
  Non_unique: 0 | 1;
  Key_name: string;
  Seq_in_index: number;
  Column_name: string;
  Collation: 'A' | 'D' | null;
  Cardinality: number;
  Sub_part: number | null;
  Packed: null;
  Null: 'YES' | '';
  Index_type: 'BTREE' | 'HASH' | 'RTREE' | 'FULLTEXT';
  Comment: string;
  Index_comment: string;
}

export interface ViewInfo {
  view_name: string;
  definition: string;
}

export interface TableSizeInfo {
  table_name: string;
  size_mb: number;
  row_count: number;
  data_size_mb: number;
  index_size_mb: number;
}

export interface DatabaseInfo {
  version: Array<{ version: string }>;
  database: Array<{ current_database: string }>;
  charset: Array<{ charset: string; collation: string }>;
  uptime: Array<{ Variable_name: string; Value: string }>;
  connections: Array<{ Variable_name: string; Value: string }>;
}

// Tipos para configuración
export interface MySQLConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  charset?: string;
  ssl?: boolean | object;
}

// Tipos para resultados de operaciones
export interface OperationResult {
  fieldCount: number;
  affectedRows: number;
  insertId: number;
  serverStatus: number;
  warningCount: number;
  message: string;
  protocol41: boolean;
  changedRows: number;
}

// Tipos para respuestas del MCP
export interface MCPResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
  isError?: boolean;
}

export interface MCPResourceResponse {
  contents: Array<{
    uri: string;
    text: string;
    mimeType: string;
  }>;
}

export interface MCPPromptResponse {
  messages: Array<{
    role: 'user' | 'assistant';
    content: {
      type: 'text';
      text: string;
    };
  }>;
}

// Tipos para herramientas específicas
export interface CreateTableParams {
  tableName: string;
  columns: string;
}

export interface InsertDataParams {
  tableName: string;
  columns: string[];
  values: any[][];
}

export interface QueryTableParams {
  tableName: string;
  whereClause?: string;
  limit?: number;
}

export interface AddPrimaryKeyParams {
  tableName: string;
  columns: string[];
}

export interface AddForeignKeyParams {
  tableName: string;
  columnName: string;
  referencedTable: string;
  referencedColumn: string;
  constraintName?: string;
}

export interface CreateIndexParams {
  tableName: string;
  indexName: string;
  columns: string[];
  isUnique?: boolean;
}

export interface UpdateDataParams {
  tableName: string;
  updates: Record<string, any>;
  whereClause: string;
}

export interface DeleteDataParams {
  tableName: string;
  whereClause: string;
}

export interface BackupTableParams {
  tableName: string;
  includeStructure?: boolean;
}

export interface CountRecordsParams {
  tableName: string;
  whereClause?: string;
}

// Tipos de error personalizado
export class MySQLMCPError extends Error {
  public readonly code: string;
  public readonly errno?: number;
  public readonly sqlState?: string;
  public readonly sqlMessage?: string;

  constructor(
    message: string,
    code: string = 'UNKNOWN',
    errno?: number,
    sqlState?: string,
    sqlMessage?: string
  ) {
    super(message);
    this.name = 'MySQLMCPError';
    this.code = code;
    this.errno = errno;
    this.sqlState = sqlState;
    this.sqlMessage = sqlMessage;
  }

  static fromMySQLError(error: any): MySQLMCPError {
    return new MySQLMCPError(
      error.message || 'Error desconocido de MySQL',
      error.code || 'UNKNOWN',
      error.errno,
      error.sqlState,
      error.sqlMessage
    );
  }
}

// Constantes útiles
export const MYSQL_DATA_TYPES = [
  'TINYINT', 'SMALLINT', 'MEDIUMINT', 'INT', 'INTEGER', 'BIGINT',
  'DECIMAL', 'NUMERIC', 'FLOAT', 'DOUBLE', 'REAL',
  'BIT', 'BOOLEAN', 'SERIAL',
  'DATE', 'DATETIME', 'TIMESTAMP', 'TIME', 'YEAR',
  'CHAR', 'VARCHAR', 'BINARY', 'VARBINARY',
  'TINYBLOB', 'BLOB', 'MEDIUMBLOB', 'LONGBLOB',
  'TINYTEXT', 'TEXT', 'MEDIUMTEXT', 'LONGTEXT',
  'ENUM', 'SET', 'JSON'
] as const;

export type MySQLDataType = typeof MYSQL_DATA_TYPES[number];

export const MYSQL_INDEX_TYPES = ['BTREE', 'HASH', 'RTREE', 'FULLTEXT'] as const;
export type MySQLIndexType = typeof MYSQL_INDEX_TYPES[number];