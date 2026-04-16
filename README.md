# Tiny MCP Server

A minimal exploration of building an **Model Context Protocol (MCP) Server** with Node.js, SQLite, and Claude Desktop integration.

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

**Note**: The MCP server is started by the MCP Host (e.g., Claude Desktop) as a subprocess, not directly. See [Claude Desktop Integration](#claude-desktop-integration) below.

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

### Configure Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "tiny-mcp-server": {
      "command": "node",
      "args": ["/path/to/tiny-mcp-server/dist/index.js"],
      "env": {
        "DB_PATH": "/path/to/tiny-mcp-server/data/mcp.db"
      }
    }
  }
}
```

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

## Key Learning Points

- **MCP Protocol**: Tools are exposed via JSON-RPC over stdio
- **Schema Validation**: Zod is used to validate tool parameters; schemas must be Zod objects
- **Debugging**: MCP Inspector is invaluable for testing before Claude Desktop integration
- **How MCP Bridges Remote LLM and Local Tools**: The architecture combines remote HTTP communication (user ↔ LLM) with local stdio communication (MCP Host ↔ MCP Server):
   1. User asks a question to Claude Desktop
   2. Claude Desktop sends the question to the **remote** LLM (e.g., Claude Sonnet) via HTTP
   3. The LLM analyzes the question, identifies missing data, and requests an MCP tool call
   4. Claude Desktop receives the tool request and calls the **local** MCP Server via stdio
   5. The local MCP Server processes the request and returns data via stdio
   6. Claude Desktop sends the data back to the remote LLM via HTTP
   7. The remote LLM computes its final response and sends it to Claude Desktop via HTTP
   8. Claude Desktop presents the final response to the user
   
   **Note**: At step 5, when the local MCP Server processes the request, it may fetch cloud-based data using HTTP (e.g., retrieve Trip Advisor reviews). The tool's HTTP calls are independent of the MCP Host's HTTP communication with the remote LLM.

## References

- [MCP Specification](https://modelcontextprotocol.org)
- [Anthropic MCP SDK](https://github.com/anthropics/mcp-sdk-js)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [Zod Documentation](https://zod.dev)

## Next Steps for Experimentation

1. **Add more tools**:
  - Implement Tools for aggregations (AVG, COUNT, etc.)
  - Implement Business Tools : extend tools to fulfill business needs reacting to specific wording (e.g. "NPS score", which is percentage of promoters - percentage of detractor)
  - Implement DataViz Tools: extend tools to generate charts/graphs
2. **Add MCP Resources and MCP Prompts**
3. **Remote MCP Server**: Replace stdio with WebSockets or HTTP or dual SSE (dual/bidirectionnal Server Sent Event) to enable the MCP Host to communicate with a **remote** MCP Server (e.g., running on a different machine). This enables cloud-based tool access and distributed architectures.
4. **Multi-table queries**: Create tools that join complex data

---

Built for learning how to create MCP servers and agentic workflows with Claude.
