import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { z } from 'zod';

import { query, type QueryInput } from './tools/query.js';
import { listTables } from './tools/listTables.js';

const server = new McpServer({
  name: 'tiny-mcp-server',
  version: '1.0.0',
});

// Define query schema using Zod
const querySchema = z.object({
  sql: z.string().describe('A SELECT SQL statement'),
  params: z.array(z.union([z.string(), z.number(), z.null()])).optional().describe('Optional query parameters for prepared statements'),
});

// Define listTables schema using Zod
const listTablesSchema = z.object({});

// Register query tool
server.registerTool(
  'query',
  {
    description: 'Execute a SQL SELECT query against the database and return results as JSON',
    inputSchema: querySchema,
  },
  async (args: any) => {
    try {
      const result = query(args as QueryInput);
      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
);

// Register listTables tool
server.registerTool(
  'listTables',
  {
    description: 'List all tables in the database',
    inputSchema: listTablesSchema
  },
  async () => {
    try {
      const result = listTables();
      return {
        content: [
          {
            type: 'text',
            text: result,
          },
        ],
      };
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
);

// Start the server
async function main() {
  const isRemote = process.argv.includes('--remote');

  if (isRemote) {
    const PORT = 3001;
    const app = express();
    app.use(express.json());

    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    await server.connect(transport);

    app.all('/mcp', async (req, res) => {
      await transport.handleRequest(req, res, req.body);
    });

    app.listen(PORT, 'localhost', () => {
      console.error(`MCP HTTP Server started on http://localhost:${PORT}/mcp`);
    });
  } else {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('MCP Server started (stdio)');
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down');
  process.exit(0);
});

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
