#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  listTables,
  describeTable,
  createTable,
  insertData,
  queryTable,
  addPrimaryKey,
  addForeignKey,
  dropTable,
  showForeignKeys,
  executeCustomQuery,
  countRecords,
} from './mysql-helpers';
import { closeMysqlConnection } from './mysql-client';

const server = new McpServer({
  name: 'mysql-mcp-server',
  version: '0.1.0',
});

// Herramienta para listar todas las tablas
server.tool('list-tables', 'Get a list of all MySQL tables', {}, async () => {
  try {
    console.error('# list-tables tool has been called');
    const tables = await listTables();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(tables, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Error occurred: ${error.message}`,
        },
      ],
    };
  }
});

// Herramienta para describir una tabla
server.tool(
  'describe-table',
  'Get detailed structure information about a MySQL table',
  {
    tableName: z.string().describe('Name of the table to describe'),
  },
  async ({ tableName }) => {
    try {
      const tableInfo = await describeTable(tableName);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(tableInfo, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error occurred: ${error.message}`,
          },
        ],
      };
    }
  }
);

// Herramienta para crear una tabla
server.tool(
  'create-table',
  'Create a new MySQL table with specified columns',
  {
    tableName: z.string().describe('Name of the table to create'),
    columns: z.string().describe('Column definitions (e.g., "id INT AUTO_INCREMENT, name VARCHAR(100), email VARCHAR(100)")'),
  },
  async ({ tableName, columns }) => {
    try {
      const result = await createTable(tableName, columns);
      return {
        content: [
          {
            type: 'text',
            text: `Table "${tableName}" created successfully. Result: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error occurred: ${error.message}`,
          },
        ],
      };
    }
  }
);

// Herramienta para insertar datos
server.tool(
  'insert-data',
  'Insert data into a MySQL table',
  {
    tableName: z.string().describe('Name of the table to insert data into'),
    columns: z.array(z.string()).describe('Array of column names'),
    values: z.array(z.array(z.any())).describe('Array of arrays with values to insert'),
  },
  async ({ tableName, columns, values }) => {
    try {
      const result = await insertData(tableName, columns, values);
      return {
        content: [
          {
            type: 'text',
            text: `Data inserted successfully into "${tableName}". Result: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error occurred: ${error.message}`,
          },
        ],
      };
    }
  }
);

// Herramienta para consultar datos
server.tool(
  'query-table',
  'Query data from a MySQL table',
  {
    tableName: z.string().describe('Name of the table to query'),
    whereClause: z.string().optional().describe('WHERE clause condition (optional)'),
    limit: z.number().optional().describe('Maximum number of records to return (optional)'),
  },
  async ({ tableName, whereClause, limit }) => {
    try {
      const data = await queryTable(tableName, whereClause, limit);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error occurred: ${error.message}`,
          },
        ],
      };
    }
  }
);

// Herramienta para agregar clave primaria
server.tool(
  'add-primary-key',
  'Add a primary key to a MySQL table',
  {
    tableName: z.string().describe('Name of the table'),
    columns: z.array(z.string()).describe('Array of column names for the primary key'),
  },
  async ({ tableName, columns }) => {
    try {
      const result = await addPrimaryKey(tableName, columns);
      return {
        content: [
          {
            type: 'text',
            text: `Primary key added successfully to "${tableName}" on columns: ${columns.join(', ')}. Result: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error occurred: ${error.message}`,
          },
        ],
      };
    }
  }
);

// Herramienta para agregar clave foránea
server.tool(
  'add-foreign-key',
  'Add a foreign key constraint to a MySQL table',
  {
    tableName: z.string().describe('Name of the table to add foreign key to'),
    columnName: z.string().describe('Name of the column to make foreign key'),
    referencedTable: z.string().describe('Name of the referenced table'),
    referencedColumn: z.string().describe('Name of the referenced column'),
    constraintName: z.string().optional().describe('Custom constraint name (optional)'),
  },
  async ({ tableName, columnName, referencedTable, referencedColumn, constraintName }) => {
    try {
      const result = await addForeignKey(tableName, columnName, referencedTable, referencedColumn, constraintName);
      return {
        content: [
          {
            type: 'text',
            text: `Foreign key added successfully to "${tableName}.${columnName}" referencing "${referencedTable}.${referencedColumn}". Result: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error occurred: ${error.message}`,
          },
        ],
      };
    }
  }
);

// Herramienta para mostrar claves foráneas
server.tool(
  'show-foreign-keys',
  'Show all foreign key constraints for a MySQL table',
  {
    tableName: z.string().describe('Name of the table to show foreign keys for'),
  },
  async ({ tableName }) => {
    try {
      const foreignKeys = await showForeignKeys(tableName);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(foreignKeys, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error occurred: ${error.message}`,
          },
        ],
      };
    }
  }
);

// Herramienta para eliminar tabla
server.tool(
  'drop-table',
  'Drop a MySQL table',
  {
    tableName: z.string().describe('Name of the table to drop'),
  },
  async ({ tableName }) => {
    try {
      const result = await dropTable(tableName);
      return {
        content: [
          {
            type: 'text',
            text: `Table "${tableName}" dropped successfully. Result: ${JSON.stringify(result, null, 2)}`,
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error occurred: ${error.message}`,
          },
        ],
      };
    }
  }
);

// Herramienta para ejecutar consultas SQL personalizadas
server.tool(
  'execute-sql',
  'Execute a custom SQL query',
  {
    query: z.string().describe('SQL query to execute'),
  },
  async ({ query }) => {
    try {
      const result = await executeCustomQuery(query);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error occurred: ${error.message}`,
          },
        ],
      };
    }
  }
);

// Herramienta para contar registros
server.tool(
  'count-records',
  'Count records in a MySQL table',
  {
    tableName: z.string().describe('Name of the table to count records in'),
    whereClause: z.string().optional().describe('WHERE clause condition (optional)'),
  },
  async ({ tableName, whereClause }) => {
    try {
      const count = await countRecords(tableName, whereClause);
      return {
        content: [
          {
            type: 'text',
            text: `Table "${tableName}" has ${count} records.`,
          },
        ],
      };
    } catch (error: any) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: `Error occurred: ${error.message}`,
          },
        ],
      };
    }
  }
);

// Recurso para información de las tablas
server.resource('mysql-tables-info', 'MySQL tables information', async () => {
  try {
    const tables = await listTables();
    const tablesInfo = await Promise.all(
      (tables as any[]).map(async (tableRow: any) => {
        try {
          const tableName = Object.values(tableRow)[0] as string;
          const structure = await describeTable(tableName);
          const foreignKeys = await showForeignKeys(tableName);
          return {
            tableName,
            structure,
            foreignKeys,
          };
        } catch (error) {
          return { 
            tableName: Object.values(tableRow)[0], 
            error: 'Could not get table information.' 
          };
        }
      })
    );

    return {
      contents: [
        {
          uri: 'mysql://tables-info',
          text: JSON.stringify(tablesInfo, null, 2),
          mimeType: 'application/json',
        },
      ],
    };
  } catch (error: any) {
    return {
      contents: [
        {
          uri: 'mysql://tables-info',
          text: JSON.stringify({ error: error.message }, null, 2),
          mimeType: 'application/json',
        },
      ],
    };
  }
});

// Prompt de ayuda para MySQL
server.prompt(
  'mysql-query-help',
  'Help prompt for writing MySQL queries',
  {
    tableName: z.string().optional().describe('Name of the table (optional)'),
    queryType: z.string().optional().describe('Type of query help needed'),
  },
  async ({ tableName, queryType = 'basic' }) => {
    let helpContent = '';

    if (tableName) {
      try {
        const tableInfo = await describeTable(tableName);
        const foreignKeys = await showForeignKeys(tableName);

        helpContent = `
# MySQL Query Help for table: ${tableName}

## Table Structure:
${JSON.stringify(tableInfo, null, 2)}

## Foreign Keys:
${JSON.stringify(foreignKeys, null, 2)}

## Basic Query Examples:

1. **Select all data:**
   \`SELECT * FROM \`${tableName}\`;\`

2. **Select with condition:**
   \`SELECT * FROM \`${tableName}\` WHERE column_name = 'value';\`

3. **Insert data:**
   \`INSERT INTO \`${tableName}\` (column1, column2) VALUES ('value1', 'value2');\`

4. **Update data:**
   \`UPDATE \`${tableName}\` SET column1 = 'new_value' WHERE condition;\`

5. **Delete data:**
   \`DELETE FROM \`${tableName}\` WHERE condition;\`

## Available MCP Tools:
- \`query-table\`: Query data from the table
- \`insert-data\`: Insert new records
- \`count-records\`: Count records
- \`execute-sql\`: Run custom SQL queries
        `;
      } catch (error: any) {
        helpContent = `Error getting information for table "${tableName}": ${error.message}`;
      }
    } else {
      helpContent = `
# MySQL MCP Server Help

## Available Tools:
1. **list-tables**: Get all tables in the database
2. **describe-table**: Get table structure
3. **create-table**: Create a new table
4. **insert-data**: Insert data into a table
5. **query-table**: Query data from a table
6. **add-primary-key**: Add primary key to a table
7. **add-foreign-key**: Add foreign key constraint
8. **show-foreign-keys**: Show foreign keys for a table
9. **drop-table**: Delete a table
10. **execute-sql**: Execute custom SQL queries
11. **count-records**: Count records in a table

## Basic Usage Examples:
- "Show me all tables in the database"
- "Create a users table with id, name and email columns"
- "Insert a new user with name John and email john@example.com"
- "Show me all users from the users table"
- "Add a foreign key from orders table to users table"

First run \`list-tables\` to see available tables, then use \`describe-table\` to understand their structure.
      `;
    }

    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: helpContent,
          },
        },
      ],
    };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('# MySQL MCP server is running...');

  // Cleanup on exit
  process.on('SIGINT', async () => {
    console.error('# Shutting down MySQL MCP server...');
    await closeMysqlConnection();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.error('# Shutting down MySQL MCP server...');
    await closeMysqlConnection();
    process.exit(0);
  });
}

main().catch(async (error) => {
  console.error('# Server execution error:', error);
  await closeMysqlConnection();
  process.exit(1);
});