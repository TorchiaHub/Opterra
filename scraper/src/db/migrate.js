import { getDb } from './database.js'

const MIGRATIONS = [
  {
    version: 1,
    name: 'initial_schema',
    sql: `
      CREATE TABLE IF NOT EXISTS scraping_sources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        source_type TEXT NOT NULL CHECK(source_type IN ('consip', 'datigovit', 'mepa', 'gazzetta', 'ted', 'custom')),
        base_url TEXT NOT NULL,
        config_json TEXT,
        is_active INTEGER NOT NULL DEFAULT 1,
        last_run_at TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS scraping_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_id INTEGER NOT NULL REFERENCES scraping_sources(id) ON DELETE CASCADE,
        status TEXT NOT NULL DEFAULT 'queued' CHECK(status IN ('queued', 'running', 'completed', 'failed')),
        started_at TEXT,
        finished_at TEXT,
        items_found INTEGER NOT NULL DEFAULT 0,
        items_new INTEGER NOT NULL DEFAULT 0,
        error_message TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS scraped_tenders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_id INTEGER NOT NULL REFERENCES scraping_sources(id) ON DELETE CASCADE,
        external_id TEXT NOT NULL,
        title TEXT NOT NULL,
        issuer TEXT,
        summary TEXT,
        source_url TEXT,
        publication_date TEXT,
        deadline_at TEXT,
        estimated_value REAL,
        category TEXT,
        region TEXT,
        raw_payload_json TEXT,
        ai_relevance_score REAL,
        ai_tags_json TEXT,
        ai_summary TEXT,
        ai_analysis_json TEXT,
        status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'saved', 'dismissed')),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(source_id, external_id)
      );

      CREATE INDEX IF NOT EXISTS idx_scraped_tenders_status ON scraped_tenders(status, ai_relevance_score DESC);
      CREATE INDEX IF NOT EXISTS idx_scraped_tenders_source ON scraped_tenders(source_id);
      CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
    `,
  },
]

export function runMigrations() {
  const db = getDb()

  db.exec(`CREATE TABLE IF NOT EXISTS _migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL DEFAULT (datetime('now'))
  )`)

  const applied = db.prepare('SELECT version FROM _migrations').all().map(r => r.version)

  for (const migration of MIGRATIONS) {
    if (applied.includes(migration.version)) continue
    db.exec(migration.sql)
    db.prepare('INSERT INTO _migrations (version, name) VALUES (?, ?)').run(migration.version, migration.name)
  }
}

if (process.argv[1] && process.argv[1].includes('migrate.js')) {
  runMigrations()
  console.log('Migrations completed.')
  process.exit(0)
}