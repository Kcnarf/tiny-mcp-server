# Architecture Evolution

How and why the Tiny MCP Server architecture evolved across versions.

## v1: Foundation - "Keep It Simple"

**Key Decisions:**
- **SQLite via sql.js**: In-process database, no external server needed
  - ✅ Perfect for learning (no setup complexity)
  - ✅ Easy to distribute (single `.db` file)
  - ❌ Not production-ready for high concurrency
  - **Decision**: Learning project, so simplicity > scalability

- **Zod for validation**: McpServer SDK requires it
  - ✅ Type-safe schema definitions
  - ✅ Runtime validation built-in
  - **Decision**: Required by SDK, no alternatives

- **stdio transport**: Standard MCP protocol
  - ✅ Works with Claude Desktop out of the box
  - ✅ Simple bidirectional communication
  - ❌ Can't run on separate machines
  - **Decision**: v1 is local development-focused

- **Read-only tools**: Only SELECT queries
  - ✅ Safe for learning (no data corruption risk)
  - ✅ Focuses on data retrieval patterns
  - **Decision**: Add mutations in v2 if needed

- **Minimal tools**: Just `query` and `listTables`
  - ✅ Core MCP functionality without clutter
  - **Decision**: Add business logic tools in v2 if needed

---

## Why Future Versions Matter

### Exploring Business Intelligence Tools
**Problem**: Only basic CRUD operations; can't do analytics
- Add pre-built aggregation tools (NPS score, averages, etc.)
- Shift from "raw data access" to "computed insights"
- Claude gets smarter queries without writing SQL

### Exploring Remote MCP Server  
**Problem**: Server must run locally on same machine as Claude Desktop
- Move from stdio to WebSockets/HTTP
- Enable distributed architectures
- Share one MCP server across multiple Claude Desktop instances

### Exploring Multi-Database Support
**Problem**: Locked into SQLite; no way to query production databases
- Support PostgreSQL, MariaDB with same tool interface
- Configuration-driven database selection
- Connection pooling for production use

---

## Design Principles (Consistent Across Versions)

1. **Tool-First**: Database access is exposed as explicit tools, not raw SQL
2. **Schema-Validated**: All inputs validated with Zod, all outputs typed
3. **Read-Safe**: Focus on SELECT/read operations; avoid mutations early
4. **Learning-Focused**: Simple enough to understand, complex enough to be real
5. **Educational**: Code should teach MCP patterns, not be production-ready

---

## Backward Compatibility

Each version is **independent** and **frozen**. No backward compatibility required:
- v1 code stays in `versions/v1/`
- v2 starts fresh in `src/` (or moves to `versions/v2/` when v3 begins)
- Different versions can have different tech stacks, patterns, dependencies

This allows maximum freedom to refactor and improve without worrying about breaking old code.
