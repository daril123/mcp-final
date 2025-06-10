#!/usr/bin/env node
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const {
  listDatabases,
  listTables,
  describeTable,
  getTableInfo,
  selectFromTable,
  countRows,
  getTableIndexes,
  executeCustomQuery
} = require('./mysql-helpers');
const { closeMysqlConnection } = require('./mysql-client');

const server = new McpServer({
  name: 'mysql-database-server',
  version: '1.0.0',
});

// Tool: Listar todas las bases de datos
server.tool('list-databases', 'Get a list of all MySQL databases', {}, async () => {
  try {
    console.error('# list-databases tool has been called');
    const databases = await listDatabases();
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(databases, null, 2),
        },
      ],
    };
  } catch (error) {
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

// Tool: Listar tablas de una base de datos
server.tool(
  'list-tables',
  'Get a list of all tables in a MySQL database',
  {
    database: z.string().describe('Name of the database to list tables from'),
  },
  async ({ database }) => {
    try {
      console.error('# list-tables tool has been called for database:', database);
      const tables = await listTables(database);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(tables, null, 2),
          },
        ],
      };
    } catch (error) {
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

// Tool: Describir estructura de una tabla
server.tool(
  'describe-table',
  'Get the structure and schema of a MySQL table',
  {
    database: z.string().describe('Name of the database'),
    tableName: z.string().describe('Name of the table to describe'),
  },
  async ({ database, tableName }) => {
    try {
      console.error('# describe-table tool has been called for:', `${database}.${tableName}`);
      const structure = await describeTable(database, tableName);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(structure, null, 2),
          },
        ],
      };
    } catch (error) {
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

// Tool: Seleccionar datos de una tabla
server.tool(
  'select-from-table',
  'Select data from a MySQL table with optional conditions',
  {
    database: z.string().describe('Name of the database'),
    tableName: z.string().describe('Name of the table'),
    limit: z.number().optional().describe('Maximum number of rows to return (default: 100)'),
    whereClause: z.string().optional().describe('WHERE clause conditions'),
    columns: z.string().optional().describe('Columns to select (default: "*")'),
  },
  async ({ database, tableName, limit = 100, whereClause, columns }) => {
    try {
      console.error('# select-from-table tool has been called for:', `${database}.${tableName}`);
      const rows = await selectFromTable(database, tableName, limit, whereClause, columns);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(rows, null, 2),
          },
        ],
      };
    } catch (error) {
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

// Tool: Ejecutar consulta personalizada
server.tool(
  'execute-query',
  'Execute a custom SELECT query (read-only for security)',
  {
    query: z.string().describe('SQL query to execute (SELECT, SHOW, DESCRIBE only)'),
    params: z.array(z.any()).optional().describe('Parameters for the query (optional)'),
  },
  async ({ query, params }) => {
    try {
      console.error('# execute-query tool has been called with query:', query);
      const results = await executeCustomQuery(query, params);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(results, null, 2),
          },
        ],
      };
    } catch (error) {
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

// Resource: Información de bases de datos
server.resource('mysql-databases-info', 'MySQL databases information', async () => {
  try {
    const databases = await listDatabases();
    return {
      contents: [
        {
          uri: 'mysql://databases-info',
          text: JSON.stringify(databases, null, 2),
          mimeType: 'application/json',
        },
      ],
    };
  } catch (error) {
    return {
      contents: [
        {
          uri: 'mysql://databases-info',
          text: JSON.stringify({ error: error.message }, null, 2),
          mimeType: 'application/json',
        },
      ],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('# MySQL Database MCP server is running...');
}

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.error('# Received SIGINT, closing MySQL connections...');
  await closeMysqlConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.error('# Received SIGTERM, closing MySQL connections...');
  await closeMysqlConnection();
  process.exit(0);
});

main().catch(async (error) => {
  console.error('# Server execution error:', error);
  await closeMysqlConnection();
  process.exit(1);
});