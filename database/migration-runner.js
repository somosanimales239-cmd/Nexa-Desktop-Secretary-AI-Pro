'use strict';

const fs = require('fs');
const path = require('path');

class MigrationRunner {
  constructor({ db, directory = path.join(__dirname, 'migrations') }) {
    this.db = db;
    this.directory = directory;
  }

  run() {
    this.db.exec('CREATE TABLE IF NOT EXISTS migrations (version TEXT PRIMARY KEY, applied_at TEXT NOT NULL)');
    const applied = new Set(this.db.prepare('SELECT version FROM migrations').all().map(row => row.version));
    const files = fs.readdirSync(this.directory).filter(file => /^\d{3}_.+\.sql$/.test(file)).sort();
    for (const file of files) {
      const version = file.replace(/\.sql$/, '');
      if (applied.has(version)) continue;
      const sql = fs.readFileSync(path.join(this.directory, file), 'utf8');
      const transaction = this.db.transaction(() => {
        this.db.exec(sql);
        this.db.prepare('INSERT INTO migrations(version, applied_at) VALUES (?, ?)').run(version, new Date().toISOString());
      });
      transaction();
    }
    return this.db.prepare('SELECT version FROM migrations ORDER BY version').all().map(row => row.version);
  }
}

module.exports = { MigrationRunner };
