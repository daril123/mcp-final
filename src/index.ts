#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { listDatabases } from './mysql-helpers';
import { closeMysqlConnection } from './mysql-client';

const server = new McpServer({
  name: 'mysql-database-list-server',
  version: '1.0.0',
});

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
  } catch (error: any) {
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
  console.error('# MySQL Database List MCP server is running...');
}

main().catch((error) => {
  console.error('# Server execution error:', error);
  process.exit(1);
});