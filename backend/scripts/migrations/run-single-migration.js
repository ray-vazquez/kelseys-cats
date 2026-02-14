#!/usr/bin/env node
/**
 * Single migration runner for Kelsey's Cats database
 * Usage: node backend/scripts/migrations/run-single-migration.js <migration-file.sql>
 */

import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colors for terminal output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runSingleMigration(migrationFile) {
  log(`\n=== Running Migration: ${migrationFile} ===\n`, 'yellow');

  const dbUrl = process.env.DB_URL || 'mysql://root:root@localhost:3306/kelseys_cats';
  log(`Database: ${dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}\n`, 'yellow');

  let connection;

  try {
    log('Connecting to database...', 'yellow');
    connection = await mysql.createConnection({
      uri: dbUrl,
      multipleStatements: true
    });
    log('✓ Connected successfully\n', 'green');

    const filePath = join(__dirname, '..', '..', 'migrations', migrationFile);
    
    log(`→ Applying: ${migrationFile}`, 'yellow');
    
    let sql = readFileSync(filePath, 'utf8');
    sql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');
    
    if (sql.trim()) {
      await connection.query(sql);
    }
    
    log(`✓ Successfully applied: ${migrationFile}\n`, 'green');
    log('=== Migration Complete ===\n', 'green');

  } catch (error) {
    log(`\n✗ Error:`, 'red');
    log(`  ${error.message}\n`, 'red');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Get migration file from command line argument
const migrationFile = process.argv[2];

if (!migrationFile) {
  log('\n✗ Error: No migration file specified', 'red');
  log('Usage: node run-single-migration.js <migration-file.sql>\n', 'yellow');
  process.exit(1);
}

runSingleMigration(migrationFile);
