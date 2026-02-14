import { createConnection } from 'mysql2/promise';
import bcrypt from 'bcrypt';
import readline from 'readline';
import { config } from 'dotenv';

config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  let connection;
  
  try {
    // Connect to database
    connection = await createConnection(process.env.DB_URL);
    console.log('✅ Connected to database\n');
    
    // Get username
    const username = await question('Enter admin username (default: admin): ') || 'admin';
    
    // Check if user exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if (existing.length > 0) {
      const overwrite = await question(`⚠️  User '${username}' already exists. Update password? (y/n): `);
      if (overwrite.toLowerCase() !== 'y') {
        console.log('❌ Cancelled');
        rl.close();
        await connection.end();
        return;
      }
    }
    
    // Get password (Note: this is visible, for dev only)
    const password = await question('Enter password: ');
    
    if (!password || password.length < 6) {
      console.log('❌ Password must be at least 6 characters');
      rl.close();
      await connection.end();
      return;
    }
    
    // Hash password
    console.log('\n🔐 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert or update user
    if (existing.length > 0) {
      await connection.execute(
        'UPDATE users SET password_hash = ?, role = ? WHERE username = ?',
        [passwordHash, 'admin', username]
      );
      console.log(`\n✅ Admin user '${username}' updated successfully!`);
    } else {
      await connection.execute(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        [username, passwordHash, 'admin']
      );
      console.log(`\n✅ Admin user '${username}' created successfully!`);
    }
    
    console.log('\n📋 Login credentials:');
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log('\n💡 Use these to login at http://localhost:3000/api/auth/login');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
    if (connection) await connection.end();
  }
}

createAdmin();
