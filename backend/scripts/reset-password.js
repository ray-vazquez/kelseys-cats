// Script to reset an admin user's password
// Usage: node scripts/reset-password.js <username> <new-password>

import bcrypt from 'bcrypt';
import { query } from '../src/lib/db.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from backend/.env
dotenv.config({ path: join(__dirname, '../.env') });

async function resetPassword(username, newPassword) {
  try {
    console.log('\n🔄 Resetting password for user:', username);

    // Check if user exists
    const [users] = await query('SELECT * FROM admin_users WHERE username = ?', [username]);
    
    if (users.length === 0) {
      console.log('❌ Error: User not found with username:', username);
      console.log('\n📋 Available users:');
      const [allUsers] = await query('SELECT id, username, role FROM admin_users');
      allUsers.forEach(user => {
        console.log(`   - ${user.username} (${user.role})`);
      });
      process.exit(1);
    }

    const user = users[0];
    console.log('✓ User found:', user.username, `(ID: ${user.id}, Role: ${user.role})`);

    // Hash the new password
    console.log('🔐 Hashing new password...');
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Update the password
    await query(
      'UPDATE admin_users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [password_hash, user.id]
    );

    console.log('✅ Password reset successfully!');
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 Login Credentials:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${newPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🌐 Login at: http://localhost:5173/admin/login');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting password:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('');
  console.log('Usage: node scripts/reset-password.js <username> <new-password>');
  console.log('');
  console.log('Example:');
  console.log('  node scripts/reset-password.js admin NewPassword123!');
  console.log('');
  process.exit(1);
}

const [username, newPassword] = args;

if (username.length < 3) {
  console.log('❌ Error: Username must be at least 3 characters');
  process.exit(1);
}

if (newPassword.length < 6) {
  console.log('❌ Error: Password must be at least 6 characters');
  process.exit(1);
}

resetPassword(username, newPassword);
