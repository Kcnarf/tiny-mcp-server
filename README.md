# Tiny MCP Server

A minimal exploration of building an **Model Context Protocol (MCP) Server** with Node.js, SQLite, and Claude Desktop integration.

> **Current Version**: v2 (code in `/src`)  
> See [VERSIONS.md](VERSIONS.md) for all versions | [ARCHITECTURE_EVOLUTION.md](ARCHITECTURE_EVOLUTION.md) for design decisions

## Server Modes

This MCP server supports **two communication modes**:

1. **Local Stdio Mode** (default)
   - MCP Host (e.g., Claude Desktop) starts the server as a subprocess
   - Communication via stdin/stdout
   - Best for local development and Claude Desktop integration
   - Usage: `node dist/index.js` (no flags)

2. **Remote HTTP-Streamable Mode**
   - Standalone HTTP server accepting JSON-RPC over HTTP
   - Each request gets a fresh, isolated MCP server instance (stateless)
   - Suitable for cloud deployment (e.g., Replit)
   - Usage: `node dist/index.js --remote` or `MCP_TRANSPORT=http`
   - Default port: 5000 (configurable via `PORT` env var)

## Objective

This project serves as a learning experiment to understand:
- How to build an MCP server from scratch
- How MCP servers expose tools to the MCP Host (e.g. Claude Desktop)
- How to use agentic workflows with the MCP Host via MCP tool calls
- How to debug MCP servers using MCP Inspector

## Use Case

**Customer Reviews Analytics for French Hotels**

A hotel review database containing customer ratings and feedback across 5 major French cities (Paris, Lyon, Marseille, Bordeaux, Lille). Each review includes:
- Review text
- Score (1-10 scale)
- Date
- Hotel location

**Example User Questions**

Once integrated with Claude Desktop, you can ask:

- **"What is the average score of Paris hotels?"**
- **"Which town has the highest average score?"**
- **"Visualize the average score of each town as a bar chart in SVG format"** *(available only if the LLM model and the MCP Host can produce and present SVG code; e.g. Claude Desktop and Sonnet can)*
- **"Show me all reviews with scores below 5"**
- **"What's the trend in review scores over time?"**

The MCP Host will use the `query` tool to fetch data and can generate visualizations or perform analysis.

## MCP Tools Exposed

1. **`query`** - Execute SELECT queries against the database
   - Input: `sql` (string, required), `params` (array, optional)
   - Output: Query results as JSON

2. **`listTables`** - List all tables and their schemas
   - Input: (none)
   - Output: Table schemas as text

## Architecture

### Components

```
tiny-mcp-server/
├── src/
│   ├── index.ts              # MCP Server entry point
│   ├── db.ts                 # SQLite database setup
│   ├── scripts/
│   │   └── seed.ts           # Database initialization with sample data
│   └── tools/
│       ├── query.ts          # SELECT query tool
│       └── listTables.ts     # Schema inspection tool
├── dist/                     # Compiled JavaScript
├── data/
│   └── mcp.db               # SQLite database file
└── package.json
```

## Technical Stack

- **Runtime**: Node.js 24 LTS
- **Database**: SQLite (via `sql.js`)
- **MCP SDK**: `@modelcontextprotocol/sdk`
- **Schema Validation**: Zod
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 24+ 
- yarn

### Installation & Setup

```bash
# Install dependencies
yarn install

# Initialize database with sample data
yarn run seed

# Build TypeScript
yarn run build
```

### Running the Server

**Local Stdio Mode** (for Claude Desktop):
```bash
node dist/index.js
```

**Remote HTTP Mode** (for cloud deployment):
```bash
# Using --remote flag
node dist/index.js --remote

# Or using environment variable
MCP_TRANSPORT=http PORT=3000 HOST=0.0.0.0 node dist/index.js
```

**Note**: In local stdio mode, the MCP server is started by the MCP Host (e.g., Claude Desktop) as a subprocess, not directly. See [Claude Desktop Integration](#claude-desktop-integration) below.

### Database Schema

The `source/scripts/seed.ts` creates and populates the SQLite database. See script for more details.

## Debugging with MCP Inspector

MCP Inspector provides a web UI to test tools before deploying to MCP Host.

### Rebuild MCP Server and Start Inspector

```bash
yarn run build
yarn run inspect
```

It will automatically opens an URL (typically `http://localhost:5173`), where you can:
- See the tools your server exposes
- Test tool calls with different parameters
- View request/response logs
- Debug schema issues

### Typical Debugging Workflow
yarn
1. Make changes in `src/index.ts`
2. Rebuild: `yarn run build`
3. Restart inspector: `yarn run inspect`
4. Test tools in the inspector web UI
5. Once working, rebuild and restart Claude Desktop (which starts the server as a subprocess)

## Development

### Scripts

- `yarn build` - Compile TypeScript to JavaScript using **`tsc`** (required before using with MCP Host)
- `yarn seed` - Initialize/reset database with sample data (using **`tsx`** for direct execution)
- `yarn inspect` - Start MCP Inspector for debugging tools locally
- `yarn dev` - Run with auto-reload during development (using **`tsx watch`**, not for production)

#### Understanding `tsc` vs `tsx`

- **`tsc` (TypeScript Compiler)**: Compiles `.ts` files to `.js` and writes to disk (`dist/` folder)
  - Used in `yarn build` - creates the production files Claude Desktop executes
  - Slower but produces optimized output
  
- **`tsx` (TypeScript eXecute)**: Compiles and runs TypeScript directly in memory, without writing files
  - Used in `yarn dev` and `yarn seed` - fast development/testing
  - `tsx watch` mode auto-reruns when files change
  - Ideal for development because it's instant feedback

### Adding New Tools

1. Create tool implementation in `src/tools/myTool.ts`
2. Define Zod schema in `src/index.ts`
3. Register with `server.registerTool()` in `src/index.ts`
4. Rebuild and test with inspector

## Claude Desktop Integration

Claude Desktop automatically starts the MCP server as a subprocess based on the configuration below. You do **not** manually start the server.

### Configure Claude Desktop for local stdio-based MCP Server

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "local tiny-mcp-server (stdio)": {
      "command": "node",
      "args": ["/path/to/tiny-mcp-server/dist/index.js"],
      "env": {
        "DB_PATH": "/path/to/tiny-mcp-server/data/mcp.db"
      }
    }
  }
}
```

### Configure Claude Desktop for remote HTTP-Streamble MCP Server

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "remote tiny-mcp-server (HTTP Streamable)": {
      "command": "npx",
      "args": [
        "mcp-remote",
        "https://8cf40eb2-f246-4e9f-b3f3-96bcb45db89d-00-z7uripd5th2g.kirk.replit.dev/mcp"
      ]
    }
  }
}
```
Note 1: Claude Desktop requires a non-self-signed HTTPS certificate for remote servers. I choose to deploy the remote HTTP Streamable MCP Server using Replit (more on this later in this doc).

Note 2: in the context of this experimentation, I choose to NOT \`publish\` a long living server. So I use an so-called \`developement url\`, available only when the Replit project is active (i.e. under development/usage). The developement url changes everytime the Replit project restarts. The url in the above code sample is here just for the sake of example.

### Usage in Claude Desktop

1. Restart Claude Desktop
2. Check that `tiny-mcp-server` appears in the MCP servers list
3. Ask Claude questions about hotel reviews:
   - Claude will automatically use the `query` tool to fetch data
   - You can request data analysis, aggregations, or visualizations
   - Claude can generate SVG charts from SQL results

### Example Interaction

**You**: "What's the average review score for each French city?"

**Claude** (via MCP):
- Uses `query` tool: `SELECT l.town, AVG(r.score) FROM reviews r JOIN locations l ON r.location = l.id GROUP BY l.town`
- Receives results
- Presents analysis and can create visualizations

## Deploying to Replit

Claude Desktop requires a valid (non-self-signed) HTTPS certificate for remote servers. **Replit solves this automatically** by providing HTTPS at the edge via a reverse proxy.

### How It Works

```
Claude Desktop (HTTPS request)
    ↓
Replit Edge (HTTPS reverse proxy)
    ↓ (forwards as HTTP internally)
Your MCP Server (plain HTTP on port 5000)
```

Replit handles:
- ✅ Public HTTPS URL with valid certificate
- ✅ Reverse proxy forwarding to your internal HTTP server
- ✅ SSL/TLS termination

### Deployment Steps

1. **Push code to GitHub** (Replit imports from GitHub)
2. **Create Replit project** from your GitHub repository
3. **Configure `package.json`** with start command:
   ```json
   "start": "yarn build && node dist/index.js --remote"
   ```
4. **Run on Replit** — the provided public HTTPS URL is your MCP server URL
5. **Configure Claude Desktop** with that URL (see [Claude Desktop Integration](#claude-desktop-integration))


## Key Learning Points

### MCP Protocol Fundamentals
- **MCP Protocol**: Tools are exposed via JSON-RPC (default: stdio, alternative: HTTP-Streamable)
- **Schema Validation**: Zod is used to validate tool parameters; schemas must be Zod objects, not raw JSON Schema
- **Debugging**: MCP Inspector is invaluable for testing tools locally before deployment

### How MCP Bridges Remote LLM and Local/Remote Tools

The architecture elegantly combines **multiple communication layers**:

1. **User → Claude Desktop** (UI, local)
2. **Claude Desktop ↔ Remote LLM** (HTTPS, e.g., Claude Sonnet)
3. **Claude Desktop ↔ Local/Remote MCP Server** (stdio or HTTPS)
4. **MCP Server → External Data** (HTTP/SQL/APIs)

**Example Flow** (local stdio mode):
1. User asks Claude Desktop: *"What's the average review score for Paris hotels?"*
2. Claude Desktop sends question to remote LLM via HTTPS
3. Remote LLM analyzes, identifies missing data, requests `query` tool call via MCP protocol
4. Claude Desktop calls local MCP Server via stdio (subprocess)
5. MCP Server executes SQL query against local SQLite database, returns results
6. Claude Desktop sends results back to remote LLM via HTTPS
7. Remote LLM formulates final response, sends to Claude Desktop via HTTPS
8. Claude Desktop displays response to user

**With Remote Server** (Replit + HTTP-Streamable):
- Steps 1-2 unchanged
- Step 4: Claude Desktop calls **remote** HTTP MCP Server via HTTPS (Replit provides TLS)
- Steps 5-8 unchanged

**Key Insight**: MCP decouples **tool location** from **LLM location**. Tools can be local (stdio, fast) or remote (HTTP, distributed).

### Stateless Server Architecture for HTTP Transport

The **HTTP-Streamable transport is fundamentally stateless** — each HTTP request must be a **complete, independent MCP protocol session**.

**❌ Problem with Shared Instance:**

Even a **single MCP Host** making sequential HTTP requests fails with a shared server instance:

```
Request 1: initialize
  └─ Server state updated
  
Request 2: tools/list
  └─ Transport expects fresh state
  └─ But transport remembers state from Request 1
  └─ ERROR: Protocol violation
```

The `StreamableHTTPServerTransport` is designed for **one-request-equals-one-session semantics**. Sharing the transport instance across HTTP requests causes the transport to inherit leftover state from the previous request, violating the MCP protocol's expected flow.

**✅ Solution: Per-Request Instance:**

Create a fresh MCP server + transport for **each HTTP request**, ensuring complete isolation:

```
Request 1: initialize
  - Fresh server + transport created
  - Protocol executes and completes
  - State is destroyed with response
  
Request 2: tools/list (pristine)
  - Fresh server + transport created  
  - Protocol executes cleanly
  - No leftover state from Request 1
```

**Implementation**: In `src/index.ts`, the `/mcp` route handler:
1. Creates a fresh `createServer()` instance per request
2. Instantiates new `StreamableHTTPServerTransport` per request
3. Registers `res.on('close', cleanup)` to free resources immediately when response ends

Each HTTP request is a **completely independent MCP session with zero state carryover** from previous requests.

## References

- [MCP Specification](https://modelcontextprotocol.org)
- [Anthropic MCP SDK](https://github.com/anthropics/mcp-sdk-js)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [Zod Documentation](https://zod.dev)

## Next Steps for Experimentation

1. **Add more tools**:
   - Implement tools for aggregations (AVG, COUNT, etc.)
   - Implement Business Tools: extend tools to fulfill business needs reacting to specific wording (e.g., "NPS score")
   - Implement DataViz Tools: extend tools to generate charts/graphs

2. **Add MCP Resources and MCP Prompts**: Extend the server with resource lists and custom prompts

3. **Multi-table queries**: Create tools that join complex data across tables

4. **Authentication**: Add API key or token-based authentication for remote server deployments

---

Built for learning how to create MCP servers and agentic workflows with Claude.
