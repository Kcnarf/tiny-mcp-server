# Version Overview

Quick comparison of Tiny MCP Server versions.

## v1 - Initial Release

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

**Archived in**: `versions/v1/`

---

## v2 - Dual-Mode Support (Current)

**Focus**: Enable both local and remote deployment patterns

| Aspect | Details |
|--------|---------|
| **Database** | SQLite (sql.js) - in-process, no external server |
| **Tools** | 2 tools: `query` (SELECT), `listTables` (schema) |
| **Operations** | Read-only (SELECT queries only) |
| **Schema Validation** | Zod schemas |
| **Transport** | **Dual-mode**: stdio (local), or HTTP-Streamable (remote) |
| **Data** | 20 hotel reviews across 5 French cities |
| **Use Case** | Analytics queries on hotel reviews |
| **Deployment** | Claude Desktop (local) or Replit/cloud (remote) |
| **Architecture** | Stateless per-request MCP instances for HTTP |

**Key Improvements from v1**:
- ✅ **Remote HTTP-Streamable transport** for cloud deployment
- ✅ **Stateless per-request architecture** (one request = one complete MCP session)
- ✅ **Environment variable configuration** (PORT, HOST, MCP_TRANSPORT)
- ✅ **Replit deployment ready** (HTTPS wrapping via reverse proxy)
- ✅ **Backward compatible** with v1 stdio mode

**See**: `/src` and root `README.md`

---

## Why Future Versions

### Business Intelligence Tools
- Add aggregation tools (AVG, COUNT, NPS score calculation)
- Computed metrics directly from tools
- More sophisticated database queries
- Real-time aggregation and statistical analysis

### Multi-Database Support
- Support PostgreSQL and MariaDB in addition to SQLite
- Configuration-driven database selection
- Production-ready connection pooling
- Database abstraction layer

### Advanced Features
- **MCP Resources**: Expose data structures as MCP resources (not just tools)
- **MCP Prompts**: Custom prompt templates for domain-specific queries
- **Authentication**: API key / JWT support for remote deployments
- **Caching**: Response caching for common queries
- **WebSocket Transport**: Bidirectional streaming for real-time updates

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
