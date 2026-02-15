// Script to reset an admin user's password
// Usage: node scripts/reset-password.js <username> <new-password>
// Run from backend directory: cd backend && node scripts/reset-password.js admin newpass123

import bcrypt from 'bcrypt';
import { query } from '../src/lib/db.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from backend directory
dotenv.config({ path: path.join(__dirname, '../.env') });

async function resetPassword(username, newPassword) {
  try {
    console.log('🔄 Resetting password for user:', username);

    // Check if user exists
    const [existing] = await query('SELECT * FROM admin_users WHERE username = ?', [username]);
    
    if (!existing || existing.length === 0) {
      console.log('❌ Error: User not found with username:', username);
      console.log('');
      console.log('Available users:');
      const [allUsers] = await query('SELECT id, username, role FROM admin_users');
      allUsers.forEach(user => {
        console.log(`  - ${user.username} (ID: ${user.id}, Role: ${user.role})`);
      });
      process.exit(1);
    }

    const user = existing[0];
    console.log('✓ User found:', user.username, '(ID:', user.id + ')');

    // Hash the new password
    console.log('🔐 Hashing new password...');
    const password_hash = await bcrypt.hash(newPassword, 10);
    console.log('✓ Password hashed successfully');

    // Update the user's password
    const [result] = await query(
      'UPDATE admin_users SET password_hash = ?, updated_at = NOW() WHERE username = ?',
      [password_hash, username]
    );

    if (result.affectedRows === 0) {
      console.log('❌ Error: Failed to update password');
      process.exit(1);
    }

    console.log('');
    console.log('✅ Password reset successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username:', username);
    console.log('Role:', user.role);
    console.log('New Password:', newPassword);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('You can now login at: http://localhost:5173/admin/login');
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
  console.log('Examples:');
  console.log('  node scripts/reset-password.js admin NewPassword123');
  console.log('  node scripts/reset-password.js kelseys MySecurePass456');
  console.log('');
  console.log('Note: Run this from the backend directory');
  console.log('  cd backend && node scripts/reset-password.js admin newpass');
  console.log('');
  process.exit(1);
}

const [username, newPassword] = args;

if (!username || username.trim().length === 0) {
  console.log('❌ Error: Username cannot be empty');
  process.exit(1);
}

if (newPassword.length < 6) {
  console.log('❌ Error: Password must be at least 6 characters');
  process.exit(1);
}

resetPassword(username, newPassword);
