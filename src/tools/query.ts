import { db } from '../db.js';

export interface QueryInput {
  sql: string;
  params?: (string | number | null)[];
}

export function query(input: QueryInput): string {
  const { sql, params = [] } = input;

  // Basic validation: only allow SELECT statements
  const trimmed = sql.trim().toUpperCase();
  if (!trimmed.startsWith('SELECT')) {
    throw new Error('query tool only supports SELECT statements');
  }

  try {
    // sql.js doesn't have prepared statements, but we can execute directly
    // For parameterized queries, we'd need to manually build the SQL
    // For now, we'll execute the SQL directly (not ideal for injection but simple for learning)
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const rows: Record<string, unknown>[] = [];

    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();

    return JSON.stringify(rows, null, 2);
  } catch (error) {
    throw new Error(`Query failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
