// Script to check admin_users table structure
import { query } from '../src/lib/db.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

async function checkTable() {
  try {
    console.log('\n🔍 Checking admin_users table structure...\n');
    
    // Show table structure
    const [columns] = await query('DESCRIBE admin_users');
    
    console.log('📋 Table Columns:');
    console.log('─'.repeat(60));
    columns.forEach(col => {
      console.log(`  ${col.Field.padEnd(20)} | ${col.Type.padEnd(20)} | ${col.Null} | ${col.Key}`);
    });
    console.log('─'.repeat(60));
    
    // Show existing users
    console.log('\n👥 Existing Users:');
    const [users] = await query('SELECT * FROM admin_users LIMIT 5');
    
    if (users.length === 0) {
      console.log('  No users found');
    } else {
      console.log('─'.repeat(60));
      users.forEach(user => {
        const cols = Object.keys(user).join(', ');
        console.log(`\n  User ID: ${user.id || user.user_id || 'N/A'}`);
        console.log(`  Available columns: ${cols}`);
        console.log(`  Data:`, user);
      });
      console.log('─'.repeat(60));
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

checkTable();
