#!/usr/bin/env node
/**
 * Script to update admin user password
 * Usage: node backend/scripts/update-admin-password.js <email> <password>
 * Example: node backend/scripts/update-admin-password.js kelsey@example.org MySecurePassword123
 */

import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function updateAdminPassword() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.error('❌ Usage: node backend/scripts/update-admin-password.js <email> <password>');
    console.error('   Example: node backend/scripts/update-admin-password.js kelsey@example.org MySecurePassword123');
    process.exit(1);
  }

  const [email, password] = args;

  // Validate inputs
  if (!email || !email.includes('@')) {
    console.error('❌ Invalid email address');
    process.exit(1);
  }

  if (!password || password.length < 8) {
    console.error('❌ Password must be at least 8 characters long');
    process.exit(1);
  }

  let connection;

  try {
    console.log('🔐 Generating password hash...');
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('✅ Password hash generated');

    console.log('\n📡 Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'kelseys_cats',
      port: process.env.DB_PORT || 3306
    });
    console.log('✅ Connected to database');

    // Check if user exists
    console.log(`\n🔍 Looking for user: ${email}`);
    const [users] = await connection.execute(
      'SELECT id, email, role FROM admin_users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.error(`❌ User with email ${email} not found`);
      console.log('\n💡 To create a new admin user, run:');
      console.log(`   INSERT INTO admin_users (email, password_hash, role) VALUES ('${email}', '${passwordHash}', 'admin');`);
      process.exit(1);
    }

    const user = users[0];
    console.log(`✅ Found user: ${user.email} (Role: ${user.role})`);

    // Update password hash
    console.log('\n🔄 Updating password hash...');
    const [result] = await connection.execute(
      'UPDATE admin_users SET password_hash = ? WHERE email = ?',
      [passwordHash, email]
    );

    if (result.affectedRows === 0) {
      console.error('❌ Failed to update password');
      process.exit(1);
    }

    console.log('✅ Password updated successfully!');
    console.log('\n✨ Admin user is now ready to log in');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('\n⚠️  Make sure to store this password securely!');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Database connection refused. Make sure:');
      console.error('   - MySQL is running');
      console.error('   - .env file has correct DB_HOST, DB_USER, DB_PASSWORD, DB_NAME');
    }
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n👋 Database connection closed');
    }
  }
}

updateAdminPassword();
