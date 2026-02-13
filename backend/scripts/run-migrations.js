#!/usr/bin/env node
/**
 * Migration runner for Kelsey's Cats database
 * Uses mysql2 package (no mysql CLI required)
 * Usage: node backend/scripts/run-migrations.js
 */

import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

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

// Migration files to run in order
const MIGRATIONS = [
  'create_vfv_cats_table.sql',
  'add_featured_to_view.sql'
];

async function runMigrations() {
  log('\n=========================================', 'yellow');
  log('Kelsey\'s Cats - Database Migration Runner', 'yellow');
  log('=========================================\n', 'yellow');

  // Get database connection string from environment
  const dbUrl = process.env.DB_URL || 'mysql://root:root@localhost:3306/kelseys_cats';
  
  log(`Database: ${dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`, 'yellow');
  log('Migrations directory: backend/migrations\n', 'yellow');

  let connection;

  try {
    // Connect to database
    log('Testing database connection...', 'yellow');
    connection = await mysql.createConnection(dbUrl);
    log('✓ Connected successfully\n', 'green');

    log('Running migrations...\n', 'yellow');

    // Run each migration
    for (const migrationFile of MIGRATIONS) {
      const filePath = join(__dirname, '..', 'migrations', migrationFile);
      
      try {
        log(`→ Applying: ${migrationFile}`, 'yellow');
        
        // Read migration file
        const sql = readFileSync(filePath, 'utf8');
        
        // Split by semicolons and filter out empty statements
        const statements = sql
          .split(';')
          .map(s => s.trim())
          .filter(s => s.length > 0 && !s.startsWith('--'));
        
        // Execute each statement
        for (const statement of statements) {
          if (statement) {
            await connection.query(statement);
          }
        }
        
        log(`✓ Successfully applied: ${migrationFile}\n`, 'green');
      } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERR' || error.message.includes('already exists')) {
          log(`⚠ Already applied: ${migrationFile}\n`, 'yellow');
        } else {
          log(`✗ Failed to apply: ${migrationFile}`, 'red');
          log(`  Error: ${error.message}\n`, 'red');
        }
      }
    }

    log('=========================================', 'green');
    log('Migration process complete!', 'green');
    log('=========================================\n', 'green');

    // Verify the view exists
    log('Verifying all_available_cats view...', 'yellow');
    try {
      await connection.query('DESCRIBE all_available_cats');
      log('✓ all_available_cats view exists\n', 'green');
      
      // Show view statistics
      log('View statistics:', 'yellow');
      const [rows] = await connection.query(
        'SELECT source, COUNT(*) as count FROM all_available_cats GROUP BY source'
      );
      
      console.table(rows);
      console.log('');
      
    } catch (error) {
      log('✗ all_available_cats view not found\n', 'red');
      log(`  Error: ${error.message}\n`, 'red');
    }

    log('Next steps:', 'yellow');
    log('  1. Restart your backend server: npm run dev', 'green');
    log('  2. Visit homepage: http://localhost:5173', 'green');
    log('  3. Check featured cats are displayed\n', 'green');

  } catch (error) {
    log('\n✗ Error:', 'red');
    
    if (error.code === 'ECONNREFUSED') {
      log('  Database connection refused. Make sure:', 'red');
      log('  - MySQL is running', 'red');
      log('  - DB_URL in .env is correct', 'red');
      log(`  - Format: mysql://user:password@host:port/database\n`, 'red');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      log('  Access denied. Check your database credentials in .env\n', 'red');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      log('  Database does not exist. Create it first:', 'red');
      log('  mysql -u root -p -e "CREATE DATABASE kelseys_cats"\n', 'red');
    } else {
      log(`  ${error.message}\n`, 'red');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      log('Database connection closed\n', 'yellow');
    }
  }
}

runMigrations();
