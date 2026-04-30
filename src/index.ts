import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { z } from 'zod';

import { query, type QueryInput } from './tools/query.js';
import { listTables } from './tools/listTables.js';

// Define query schema using Zod
const querySchema = z.object({
  sql: z.string().describe('A SELECT SQL statement'),
  params: z.array(z.union([z.string(), z.number(), z.null()])).optional().describe('Optional query parameters for prepared statements'),
});

// Define listTables schema using Zod
const listTablesSchema = z.object({});

function createServer() {
  const server = new McpServer({
    name: 'tiny-mcp-server',
    version: '2.0.0',
  });

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

  return server;
}

// Start the server
async function main() {
  const isRemote = process.argv.includes('--remote') || process.env.MCP_TRANSPORT === 'http';

  if (isRemote) {
    const PORT = Number(process.env.PORT) || 5000;
    const HOST = process.env.HOST || '0.0.0.0';
    const app = express();
    app.use(express.json());

    app.get('/', (_req, res) => {
      res.type('text/plain').send(
        'tiny-mcp-server (HTTP Streamable transport)\n' +
        'POST JSON-RPC requests to /mcp\n'
      );
    });

    // Stateless mode: create a fresh MCP server + transport per request so
    // sequential calls (initialize -> notifications/initialized -> tools/list -> tools/call)
    // each work correctly without sharing transport state across requests.
    app.all('/mcp', async (req, res) => {
      const server = createServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });

      res.on('close', () => {
        transport.close();
        server.close();
      });

      try {
        await server.connect(transport);
        await transport.handleRequest(req, res, req.body);
      } catch (err) {
        console.error('MCP request error:', err);
        if (!res.headersSent) {
          res.status(500).json({
            jsonrpc: '2.0',
            error: { code: -32603, message: 'Internal server error' },
            id: (req.body && (req.body as any).id) ?? null,
          });
        }
      }
    });

    app.listen(PORT, HOST, () => {
      console.error(`MCP HTTP Server started on http://${HOST}:${PORT}/mcp`);
    });
  } else {
    const server = createServer();
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
