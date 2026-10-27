import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_DIR = process.cwd();
const DB_PATH = path.join(DB_DIR, 'campusevent.db');

let dbInstance: DatabaseSync | null = null;
let isSeeded = false;

export function getDatabase(): DatabaseSync {
  if (!dbInstance) {
    dbInstance = new DatabaseSync(DB_PATH);
    dbInstance.exec(`
      PRAGMA foreign_keys = ON;
      PRAGMA journal_mode = WAL;
    `);
    initSchema(dbInstance);
  }
  if (!isSeeded) {
    isSeeded = true;
    try {
      const userCount = dbInstance.prepare('SELECT count(*) as count FROM users').get() as { count: number };
      if (userCount && userCount.count === 0) {
        // Auto-seed initial events and demo users asynchronously if empty
        import('./seed').then((m) => m.seedDatabase()).catch(() => {});
      }
    } catch {
      // Fallback if table query fails during schema init
    }
  }
  return dbInstance;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL COLLATE NOCASE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      department TEXT DEFAULT 'Computer Science',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      venue TEXT NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 100,
      registered_count INTEGER NOT NULL DEFAULT 0,
      banner_url TEXT,
      organizer TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'Upcoming',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      ticket_code TEXT UNIQUE NOT NULL,
      status TEXT NOT NULL DEFAULT 'confirmed',
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, event_id)
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      category TEXT NOT NULL,
      keywords TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
    CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
    CREATE INDEX IF NOT EXISTS idx_reg_user ON registrations(user_id);
    CREATE INDEX IF NOT EXISTS idx_reg_event ON registrations(event_id);
  `);
}

// Database helper utilities
export const db = {
  get<T = any>(sql: string, params: any[] = []): T | undefined {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    return stmt.get(...params) as T | undefined;
  },

  all<T = any>(sql: string, params: any[] = []): T[] {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    return stmt.all(...params) as T[];
  },

  run(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number } {
    const database = getDatabase();
    const stmt = database.prepare(sql);
    const result = stmt.run(...params);
    return {
      changes: Number(result.changes),
      lastInsertRowid: Number(result.lastInsertRowid),
    };
  },

  exec(sql: string): void {
    const database = getDatabase();
    database.exec(sql);
  }
};
