// Script to create an admin user
// Usage: node backend/scripts/create-admin.js <username> <password>

import bcrypt from 'bcrypt';
import { query } from '../src/lib/db.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './backend/.env' });

async function createAdmin(username, password) {
  try {
    console.log('Creating admin user...');
    console.log('Username:', username);

    // Check if user already exists
    const [existing] = await query('SELECT * FROM admin_users WHERE username = ?', [username]);
    if (existing.length > 0) {
      console.log('❌ Error: User already exists with that username');
      process.exit(1);
    }

    // Hash the password
    const password_hash = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');

    // Insert the user
    const [result] = await query(
      'INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)',
      [username, password_hash, 'admin']
    );

    console.log('✅ Admin user created successfully!');
    console.log('User ID:', result.insertId);
    console.log('Username:', username);
    console.log('Role: admin');
    console.log('');
    console.log('You can now login at http://localhost:5173/admin/login');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log('Usage: node backend/scripts/create-admin.js <username> <password>');
  console.log('Example: node backend/scripts/create-admin.js admin mypassword123');
  process.exit(1);
}

const [username, password] = args;

if (username.length < 3) {
  console.log('❌ Error: Username must be at least 3 characters');
  process.exit(1);
}

if (password.length < 6) {
  console.log('❌ Error: Password must be at least 6 characters');
  process.exit(1);
}

createAdmin(username, password);
