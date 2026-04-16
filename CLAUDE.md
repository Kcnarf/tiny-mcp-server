# CLAUDE.md

Guidance for Claude Code when modifying this MCP server codebase.

## ⚠️ CRITICAL: Version Structure

**This repository uses a versioning structure. READ THIS CAREFULLY:**

```
tiny-mcp-server/
├── src/                    ← CURRENT VERSION - WORK HERE ONLY
├── versions/
│   ├── v1/                 ← ARCHIVED (previous iteration)
│   ├── v2/                 ← ARCHIVED (if it exists)
│   └── ...
├── VERSIONS.md             ← Overview of all versions
└── ARCHITECTURE_EVOLUTION.md ← Why versions changed
```

### Rules for Claude Code:
1. **ALWAYS work in `/src`** - This is the current version
2. **NEVER read from `/versions/`** unless explicitly asked to compare versions
3. **NEVER modify anything in `/versions/`** - These are archived and frozen
4. **When asked "show me the code"** - Reference `/src`, not `/versions/`
5. **When asked "what's new"** - Check VERSIONS.md and ARCHITECTURE_EVOLUTION.md

### When to Reference `/versions/`:
- ✅ User explicitly asks: "Compare v1 and v2"
- ✅ User asks: "What changed between versions?"
- ❌ Don't: Accidentally include old version info in answers
- ❌ Don't: Copy patterns from old versions without noting the version change

## Quick Context

- **Project**: Tiny MCP Server - a learning project for building MCP servers (currently v1)
- **Tech**: TypeScript, Node.js 24+, SQLite (sql.js), Zod, McpServer SDK
- **Purpose**: Expose read-only database query tools to Claude Desktop
- **Use Case**: Hotel review analytics across 5 French cities
- **Current Version**: v1 (in `/src`)

See README.md for full project overview, setup, and usage.

## Code Patterns & Conventions

### Adding a New Tool

1. **Create tool implementation** in `src/tools/myTool.ts`:
   ```typescript
   export interface MyToolInput {
     param1: string;
     param2?: number;
   }

   export function myTool(input: MyToolInput): string {
     // Implementation
     return JSON.stringify(result);
   }
   ```

2. **Register in `src/index.ts`** with Zod schema:
   ```typescript
   import { z } from 'zod';
   
   const myToolSchema = z.object({
     param1: z.string().describe('Description'),
     param2: z.number().optional().describe('Optional param')
   });

   server.registerTool(
     'myTool',
     {
       description: 'What this tool does',
       inputSchema: myToolSchema
     },
     async (args: any) => {
       const result = myTool(args as MyToolInput);
       return {
         content: [{ type: 'text', text: result }]
       };
     }
   );
   ```

### Tool Response Format

Always return this structure:
```typescript
{
  content: [{
    type: 'text',
    text: resultString  // Must be string (JSON-stringify objects)
  }]
}
```

### Database Queries

- Query results come from `db.exec()` which returns arrays
- Always wrap results in `JSON.stringify()` for string responses
- Example: `db.exec("SELECT * FROM reviews")[0].values`

## Architecture Decisions & Constraints

### Why SQLite (sql.js)?
- ✅ No external server needed
- ✅ Perfect for learning/development
- ❌ Not production-ready for high concurrency
- **Don't**: Replace with PostgreSQL/MySQL without discussion (affects architecture)

### Why Zod (not JSON Schema)?
- McpServer SDK **requires** Zod schemas for validation
- ❌ Don't: Pass plain JSON Schema objects - McpServer will reject them
- ✅ Do: Define schemas inline with `.describe()` for parameter descriptions

### Why Read-Only Tools?
- Current tools only execute SELECT queries
- **Don't**: Add INSERT/UPDATE/DELETE operations without strong reason
- This keeps the server safe and focused on analytics

### Tool Registration Pattern
- Tools are registered in `src/index.ts` directly (not dynamically loaded)
- Each tool needs a Zod schema AND a handler function
- ❌ Don't: Dynamically load tools from files (not how McpServer works)
- ✅ Do: Explicitly register each tool in index.ts

## Common Pitfalls

1. **Forgetting to rebuild** before testing
   - Change → `yarn build` → `yarn inspect` (or restart Claude Desktop)

2. **Using plain objects for schemas**
   - ❌ `{ properties: {...}, required: [...] }` (JSON Schema)
   - ✅ `z.object({ ... })` (Zod schema)

3. **Forgetting `.describe()` on schema fields**
   - Claude won't understand what parameters do without descriptions

4. **Returning objects directly from tools**
   - ❌ `return { data: result }`
   - ✅ `return { content: [{ type: 'text', text: JSON.stringify(result) }] }`

5. **Using npm instead of yarn**
   - Repository is configured for yarn - use `yarn` not `npm run`

6. **Trying to start server manually**
   - Server is started by Claude Desktop (via claude_desktop_config.json)
   - Only use `yarn inspect` for local debugging, `yarn dev` for development

## Implementation Checklist

When adding a new tool:
- [ ] Create tool function in `src/tools/newTool.ts`
- [ ] Define Zod schema with `.describe()` on all fields
- [ ] Register tool in `src/index.ts` with correct response format
- [ ] Test with `yarn build && yarn inspect`
- [ ] Verify schema shows correctly in Inspector web UI
- [ ] Test tool calls with sample parameters in Inspector

When modifying existing code:
- [ ] Rebuild: `yarn build`
- [ ] Test locally: `yarn inspect` (for tools) or `yarn dev` (for server)
- [ ] Don't commit without testing in MCP Inspector first
- [ ] Ensure changes don't break other tools

## File Ownership (Current Version in `/src`)

**Current version files (always in `/src/`):**
- `src/index.ts` — Tool registration (central point for all tools)
- `src/tools/*.ts` — Individual tool implementations
- `src/db.ts` — Database initialization (don't modify unless needed)
- `src/scripts/seed.ts` — Sample data (modify to change hotel reviews)
- `dist/` — Compiled output (generated, never edit directly)

**Version control files:**
- `VERSIONS.md` — Document changes between versions (update when creating v2, v3, etc.)
- `ARCHITECTURE_EVOLUTION.md` — Explain architectural decisions and changes
- `versions/v1/` — Frozen copy of v1 (never modify)
- `versions/v2/` — Frozen copy of v2 when it exists (never modify)

## Before Asking for Help

1. Run `yarn build && yarn inspect` and check for schema errors
2. Verify tool appears in Inspector with correct parameters
3. Test the tool call in Inspector to see actual error message
4. Check that Zod schemas have `.describe()` on all fields
5. Ensure response format is `{ content: [{ type: 'text', text: ... }] }`
