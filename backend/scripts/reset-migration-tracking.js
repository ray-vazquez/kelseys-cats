#!/usr/bin/env node
import { createConnection } from 'mysql2/promise';
import { env } from '../src/config/env.js';

async function resetMigration() {
  const migrationName = process.argv[2] || '01_create_base_schema.sql';
  
  let connection;
  try {
    connection = await createConnection(env.DB_URL);
    console.log('\u2705 Connected to database\n');
    
    // Remove the failed migration
    const [result] = await connection.execute(
      'DELETE FROM schema_migrations WHERE migration_name = ?',
      [migrationName]
    );
    
    if (result.affectedRows > 0) {
      console.log(`\u2705 Removed ${migrationName} from tracking`);
      console.log('\nYou can now run migrations again:\n');
      console.log('   node scripts/run-migrations-safe.js\n');
    } else {
      console.log(`⚠️  ${migrationName} was not found in tracking table`);
      console.log('\nIt may have already been removed or never applied.\n');
    }
    
  } catch (error) {
    console.error('\u274c Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

resetMigration();
