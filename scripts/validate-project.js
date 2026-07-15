'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const required = [
  'package.json',
  'nexa.project.json',
  'main.js',
  'preload.js',
  'src/index.html',
  'src/app.js',
  'src/app.css',
  'core/emergency-stop.js',
  'core/permissions.js'
];

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
}

const failures = [];
for (const file of required) {
  if (!fs.existsSync(path.join(root, file))) failures.push(`Missing required file: ${file}`);
}

if (failures.length === 0) {
  const pkg = readJson('package.json');
  const project = readJson('nexa.project.json');
  if (pkg.main !== 'main.js') failures.push('package.json main must remain main.js');
  if (pkg.version !== '0.1.0') failures.push('package.json must remain the Phase 1 baseline version 0.1.0');
  if (project.version !== '0.1.0') failures.push('nexa.project.json must match Phase 1 version 0.1.0');
  if (!Array.isArray(pkg.build?.files) || !pkg.build.files.includes('core/**/*')) {
    failures.push('Electron build.files must include core/**/*');
  }
  const index = fs.readFileSync(path.join(root, 'src/index.html'), 'utf8');
  for (const marker of ['data-testid="nav-dashboard"', 'data-testid="nav-assistant"', 'data-testid="nav-whatsapp"', 'data-testid="emergency-stop"']) {
    if (!index.includes(marker)) failures.push(`Missing stable UI contract: ${marker}`);
  }
}

const result = { valid: failures.length === 0, failures, checkedAt: new Date().toISOString() };
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
