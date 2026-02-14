#!/usr/bin/env node
import { createConnection } from 'mysql2/promise';
import { env } from '../src/config/env.js';

async function listUsers() {
  let connection;
  try {
    connection = await createConnection(env.DB_URL);
    console.log('\n👥 Users in database:\n');
    
    const [users] = await connection.execute(
      'SELECT id, username, role, created_at FROM users ORDER BY id'
    );
    
    if (users.length === 0) {
      console.log('⚠️  No users found!');
      console.log('\nCreate an admin user with:');
      console.log('   node scripts/create-admin.js\n');
    } else {
      console.table(users);
      console.log('');
    }
    
  } catch (error) {
    console.error('\u274c Error:', error.message);
  } finally {
    if (connection) await connection.end();
  }
}

listUsers();
