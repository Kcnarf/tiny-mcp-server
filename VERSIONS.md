# Version Overview

Quick comparison of Tiny MCP Server versions.

## v1 - Initial Release (Current)

**Focus**: Learning MCP fundamentals with minimal complexity

| Aspect | Details |
|--------|---------|
| **Database** | SQLite (sql.js) - in-process, no external server |
| **Tools** | 2 tools: `query` (SELECT), `listTables` (schema) |
| **Operations** | Read-only (SELECT queries only) |
| **Schema Validation** | Zod schemas |
| **Transport** | stdio (with Claude Desktop) |
| **Data** | 20 hotel reviews across 5 French cities |
| **Use Case** | Analytics queries on hotel reviews |

**See**: `/src` and root `README.md`

---

## Why Future Versions

### Business Intelligence Tools
- Add aggregation tools (AVG, COUNT, NPS score calculation)
- Computed metrics directly from tools
- More sophisticated database queries

### Remote MCP Server
- Replace stdio with WebSockets or HTTP
- Enable distributed/remote MCP server deployments
- Multi-host scenarios

### Multi-Database Support
- Support PostgreSQL and MariaDB in addition to SQLite
- Configuration-driven database selection
- Production-ready connection pooling

---

## Comparing Versions

To see what changed between versions:
```bash
git diff v1.0.0 v2.0.0 -- versions/v1 versions/v2
```

Or compare specific files:
```bash
diff -r versions/v1/src versions/v2/src
```

See `ARCHITECTURE_EVOLUTION.md` for architectural decisions and rationale.
