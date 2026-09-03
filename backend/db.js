const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.sqlite'));

db.pragma('journal_mode = WAL');

const initDb = () => {
    // Products table
    db.exec(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            stock INTEGER NOT NULL,
            image TEXT,
            description TEXT,
            category TEXT,
            rating REAL,
            reviews INTEGER
        )
    `);

    // Sessions table
    db.exec(`
        CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            status TEXT DEFAULT 'active',
            cart_total REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Agent Logs table
    db.exec(`
        CREATE TABLE IF NOT EXISTS agent_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            trigger_event TEXT NOT NULL,
            context TEXT NOT NULL,
            reasoning TEXT NOT NULL,
            action_type TEXT NOT NULL,
            action_payload TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Config table for guardrails
    db.exec(`
        CREATE TABLE IF NOT EXISTS config (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    `);
    
    // Insert default config if empty
    const stmt = db.prepare('SELECT COUNT(*) as count FROM config');
    const { count } = stmt.get();
    if (count === 0) {
        db.prepare('INSERT INTO config (key, value) VALUES (?, ?)').run('max_discount_percentage', '20');
        db.prepare('INSERT INTO config (key, value) VALUES (?, ?)').run('agent_tone', 'urgent but friendly');
        db.prepare('INSERT INTO config (key, value) VALUES (?, ?)').run('enabled_for_abandonment', 'true');
    }
};

initDb();

module.exports = db;
