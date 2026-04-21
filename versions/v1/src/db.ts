import initSqlJs, { type Database } from 'sql.js';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { dirname, resolve } from 'path';

const dbPath = resolve(process.env.DB_PATH || './data/mcp.db');
const dir = dirname(dbPath);

// Initialize sql.js and load or create database
const SQL = await initSqlJs();

let data: Uint8Array | undefined;
try {
  data = await readFile(dbPath);
} catch {
  // File doesn't exist yet
}

export const db = new SQL.Database(data);

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Auto-save function (called after each write operation)
export async function saveDb() {
  await mkdir(dir, { recursive: true });
  const data = db.export();
  const buffer = Buffer.from(data);
  await writeFile(dbPath, buffer);
}
