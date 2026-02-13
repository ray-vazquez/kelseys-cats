#!/usr/bin/env node
/**
 * Script to update admin user password
 * Usage: node scripts/update-admin-password.js <email> <password>
 * Example: node scripts/update-admin-password.js kelsey@example.org MySecurePassword123
 * 
 * Note: Make sure to set DB_URL environment variable or it will use default:
 * DB_URL=mysql://root:root@localhost:3306/kelseys_cats
 */

import bcrypt from 'bcrypt';
import mysql from 'mysql2/promise';

async function updateAdminPassword() {
  const args = process.argv.slice(2);
  
  if (args.length !== 2) {
    console.error('❌ Usage: node scripts/update-admin-password.js <email> <password>');
    console.error('   Example: node scripts/update-admin-password.js kelsey@example.org MySecurePassword123');
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
    
    // Use DB_URL from environment or default
    const dbUrl = process.env.DB_URL || 'mysql://root:root@localhost:3306/kelseys_cats';
    console.log(`   Connection: ${dbUrl.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    
    connection = await mysql.createConnection(dbUrl);
    console.log('✅ Connected to database');

    // Check if user exists
    console.log(`\n🔍 Looking for user: ${email}`);
    const [users] = await connection.execute(
      'SELECT id, email, role FROM admin_users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      console.error(`❌ User with email ${email} not found`);
      console.log('\n💡 To create a new admin user, run this SQL:');
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
    console.log('\n🔄 Restart your backend server to apply changes');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Database connection refused. Make sure:');
      console.error('   - MySQL is running');
      console.error('   - DB_URL environment variable is set correctly');
      console.error('   - Format: mysql://user:password@host:port/database');
      console.error(`   - Example: mysql://root:root@localhost:3306/kelseys_cats`);
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Access denied. Check your database credentials');
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
