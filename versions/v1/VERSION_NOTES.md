# Version 1 - Snapshot

This is a backup of the tiny-mcp-server at the point where **dual-mode transport support** was added.

## What's in This Version

- **Database**: SQLite (sql.js) - in-process, no external server
- **Tools**: 2 tools (`query` for SELECT, `listTables` for schema listing)
- **Operations**: Read-only (SELECT queries only)
- **Transport Modes**: 
  - **Stdio** (default) - for local MCP clients like Claude Desktop
  - **HTTP** (with `--remote` flag) - standalone HTTP server on localhost:3000
- **Schema Validation**: Zod schemas
- **Data**: 20 hotel reviews across 5 French cities (French cities dataset)

## Key Features Added in This Version

### Dual-Mode Transport Support
- Added `express` and `@types/express` dependencies
- Implemented `StreamableHTTPServerTransport` from MCP SDK for HTTP mode
- CLI flag `--remote` switches between modes
- Default behavior (stdio) unchanged for backward compatibility

### Usage

**Stdio mode** (default, used by Claude Desktop):
```bash
node dist/index.js
```

**HTTP remote mode** (standalone server on localhost:3000):
```bash
node dist/index.js --remote
```

## Files Structure

```
src/
├── index.ts           # Server setup with dual-mode transport logic
├── db.ts             # SQLite database initialization
└── tools/
    ├── query.ts      # SQL SELECT query execution
    └── listTables.ts # Database schema listing
scripts/
└── seed.ts           # Data seeding script
```

## Notable Implementation Details

- Uses `StreamableHTTPServerTransport` in stateless mode for HTTP transport
- Single `/mcp` endpoint handles POST (messages), GET (SSE), DELETE (session)
- Graceful shutdown handling via SIGINT
- Error handling through Zod schemas and try-catch blocks

## Build & Test

```bash
yarn install        # Install dependencies (includes express)
yarn build          # Compile TypeScript
yarn inspect        # Test stdio mode with MCP Inspector
yarn inspect:remote # Test HTTP mode
```

---

**Snapshot Date**: 2026-04-21  
**Git Commit**: Latest on main branch  
**Status**: Stable, ready for production use or as a base for v2+
