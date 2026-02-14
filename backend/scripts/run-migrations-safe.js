#!/usr/bin/env node
/**
 * SAFE Migration runner with tracking
 * Prevents running migrations multiple times
 * Usage: node backend/scripts/run-migrations-safe.js
 */

import mysql from 'mysql2/promise';
import { readdirSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runMigrations() {
  log('\n=========================================', 'blue');
  log('Kelsey\'s Cats - SAFE Migration Runner', 'blue');
  log('=========================================\n', 'blue');

  const dbUrl = process.env.DB_URL || 'mysql://root:root@localhost:3306/kelseys_cats';
  log(`Database: ${dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`, 'yellow');

  let connection;

  try {
    connection = await mysql.createConnection({
      uri: dbUrl,
      multipleStatements: true
    });
    log('\u2705 Connected to database\n', 'green');

    // Step 1: Create migrations tracking table
    log('📝 Creating migration tracking table...', 'yellow');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    log('✅ Migration tracking ready\n', 'green');

    // Step 2: Get list of applied migrations
    const [appliedRows] = await connection.query(
      'SELECT migration_name FROM schema_migrations'
    );
    const appliedMigrations = new Set(appliedRows.map(r => r.migration_name));

    if (appliedMigrations.size > 0) {
      log('📊 Previously applied migrations:', 'blue');
      appliedMigrations.forEach(m => log(`   - ${m}`, 'blue'));
      console.log('');
    }

    // Step 3: Get all migration files
    const migrationsDir = join(__dirname, '..', 'migrations');
    const allFiles = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .filter(f => !f.includes('TEMPLATE'))
      .sort();

    log('📂 Available migration files:', 'yellow');
    allFiles.forEach(f => {
      const status = appliedMigrations.has(f) ? '✅ Applied' : '⏳ Pending';
      log(`   ${status} - ${f}`, appliedMigrations.has(f) ? 'green' : 'yellow');
    });
    console.log('');

    // Step 4: Run pending migrations
    const pendingMigrations = allFiles.filter(f => !appliedMigrations.has(f));

    if (pendingMigrations.length === 0) {
      log('✅ All migrations up to date!\n', 'green');
    } else {
      log(`🚀 Running ${pendingMigrations.length} pending migration(s)...\n`, 'blue');

      for (const migrationFile of pendingMigrations) {
        const filePath = join(migrationsDir, migrationFile);
        
        try {
          log(`➡️  Applying: ${migrationFile}`, 'yellow');
          
          // Read and clean SQL
          let sql = readFileSync(filePath, 'utf8');
          sql = sql
            .split('\n')
            .filter(line => !line.trim().startsWith('--'))
            .join('\n');
          
          if (sql.trim()) {
            await connection.query(sql);
          }
          
          // Mark as applied
          await connection.query(
            'INSERT INTO schema_migrations (migration_name) VALUES (?)',
            [migrationFile]
          );
          
          log(`✅ Successfully applied: ${migrationFile}\n`, 'green');
        } catch (error) {
          log(`❌ Failed to apply: ${migrationFile}`, 'red');
          log(`   Error: ${error.message}\n`, 'red');
          
          // Ask user if they want to continue
          log('🚨 Migration failed! This might cause issues.', 'red');
          log('   You can:', 'yellow');
          log('   1. Fix the migration file and run again', 'yellow');
          log('   2. Skip this migration (risky)\n', 'yellow');
          
          // For now, stop on error
          process.exit(1);
        }
      }
    }

    // Step 5: Verify database state
    log('\n🔍 Verifying database state...', 'blue');
    
    // Check tables
    const [tables] = await connection.query('SHOW TABLES');
    log(`\n📋 Tables: ${tables.length}`, 'yellow');
    tables.forEach(row => {
      const tableName = Object.values(row)[0];
      log(`   - ${tableName}`, 'green');
    });

    // Check views
    const [views] = await connection.query(
      "SHOW FULL TABLES WHERE Table_type = 'VIEW'"
    );
    if (views.length > 0) {
      log(`\n👁️  Views: ${views.length}`, 'yellow');
      views.forEach(row => {
        const viewName = Object.values(row)[0];
        log(`   - ${viewName}`, 'green');
      });
    }

    log('\n=========================================', 'green');
    log('✅ Migration complete!', 'green');
    log('=========================================\n', 'green');

  } catch (error) {
    log('\n❌ Migration Error:', 'red');
    log(`   ${error.message}\n`, 'red');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigrations();
