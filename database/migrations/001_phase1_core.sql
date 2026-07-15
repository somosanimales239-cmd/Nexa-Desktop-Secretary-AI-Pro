CREATE TABLE IF NOT EXISTS app_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS permissions (permission TEXT PRIMARY KEY, enabled INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS company_profile (id INTEGER PRIMARY KEY CHECK (id = 1), business_name TEXT, description TEXT, hours TEXT, signature TEXT, language TEXT, tone TEXT);
CREATE TABLE IF NOT EXISTS activity_log (id INTEGER PRIMARY KEY, event_type TEXT NOT NULL, status TEXT NOT NULL, safe_details TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS error_log (id INTEGER PRIMARY KEY, module TEXT NOT NULL, operation TEXT NOT NULL, safe_message TEXT NOT NULL, created_at TEXT NOT NULL);