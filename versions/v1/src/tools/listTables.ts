import { db } from '../db.js';

export function listTables(): string {
  try {
    const query = `
      SELECT
        name,
        sql
      FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `;

    const stmt = db.prepare(query);
    const tables: Array<{ name: string; sql: string | null }> = [];

    while (stmt.step()) {
      const row = stmt.getAsObject();
      tables.push({
        name: row.name as string,
        sql: (row.sql as string | null) || null,
      });
    }
    stmt.free();

    const result = tables.map((table) => ({
      name: table.name,
      createSql: table.sql,
    }));

    return JSON.stringify(result, null, 2);
  } catch (error) {
    throw new Error(`Failed to list tables: ${error instanceof Error ? error.message : String(error)}`);
  }
}
