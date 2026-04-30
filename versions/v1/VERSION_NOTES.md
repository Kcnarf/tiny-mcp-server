# Version 1 - Snapshot

This is a backup of the tiny-mcp-server 

## What's in This Version

**Focus**: Learning MCP fundamentals with minimal complexity

| Aspect | Details |
|--------|---------|
| **Database** | SQLite (sql.js) - in-process, no external server |
| **Tools** | 2 tools: `query` (SELECT), `listTables` (schema) |
| **Operations** | Read-only (SELECT queries only) |
| **Schema Validation** | Zod schemas |
| **Transport** | stdio only (Claude Desktop subprocess) |
| **Data** | 20 hotel reviews across 5 French cities |
| **Use Case** | Analytics queries on hotel reviews |

### Usage
Ready to be used in an MCP Host, e.g. Claude Dektop.

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
