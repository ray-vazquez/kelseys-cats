import { createConnection } from 'mysql2/promise';
import { env } from '../src/config/env.js';

async function verifyAndCreateTables() {
  let connection;
  
  try {
    console.log('🔌 Connecting to database...');
    console.log('   DB_URL:', env.DB_URL.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@'));
    
    connection = await createConnection(env.DB_URL);
    console.log('✅ Connected to database\n');
    
    // Check current database
    const [dbResult] = await connection.execute('SELECT DATABASE() as db');
    console.log('📊 Current database:', dbResult[0].db);
    
    // Check if users table exists
    console.log('\n🔍 Checking for users table...');
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'users'"
    );
    
    if (tables.length === 0) {
      console.log('❌ Users table does NOT exist');
      console.log('\n📝 Creating users table...');
      
      await connection.execute(`
        CREATE TABLE users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(50) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          role ENUM('admin', 'viewer') DEFAULT 'viewer',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Users table created successfully!');
    } else {
      console.log('✅ Users table already exists');
    }
    
    // Check if cats table exists
    console.log('\n🔍 Checking for cats table...');
    const [catTables] = await connection.execute(
      "SHOW TABLES LIKE 'cats'"
    );
    
    if (catTables.length === 0) {
      console.log('❌ Cats table does NOT exist');
      console.log('\n📝 Creating cats table...');
      
      await connection.execute(`
        CREATE TABLE cats (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          age VARCHAR(50),
          gender ENUM('Male', 'Female', 'Unknown'),
          breed VARCHAR(100),
          color VARCHAR(100),
          size ENUM('Small', 'Medium', 'Large'),
          description TEXT,
          main_image_url TEXT,
          additional_images JSON,
          good_with_kids BOOLEAN DEFAULT FALSE,
          good_with_cats BOOLEAN DEFAULT FALSE,
          good_with_dogs BOOLEAN DEFAULT FALSE,
          medical_notes TEXT,
          adoption_fee DECIMAL(10, 2),
          status ENUM('available', 'pending', 'adopted') DEFAULT 'available',
          featured BOOLEAN DEFAULT FALSE,
          intake_date DATE,
          adoption_date DATE,
          source VARCHAR(50) DEFAULT 'manual',
          external_id VARCHAR(100),
          adoptapet_url TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Cats table created successfully!');
    } else {
      console.log('✅ Cats table already exists');
    }
    
    // Check if tags table exists
    console.log('\n🔍 Checking for tags table...');
    const [tagTables] = await connection.execute(
      "SHOW TABLES LIKE 'tags'"
    );
    
    if (tagTables.length === 0) {
      console.log('📝 Creating tags table...');
      await connection.execute(`
        CREATE TABLE tags (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(50) UNIQUE NOT NULL,
          category VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ Tags table created');
    } else {
      console.log('✅ Tags table already exists');
    }
    
    // Check if cat_tags table exists
    console.log('\n🔍 Checking for cat_tags table...');
    const [catTagTables] = await connection.execute(
      "SHOW TABLES LIKE 'cat_tags'"
    );
    
    if (catTagTables.length === 0) {
      console.log('📝 Creating cat_tags table...');
      await connection.execute(`
        CREATE TABLE cat_tags (
          cat_id INT NOT NULL,
          tag_id INT NOT NULL,
          PRIMARY KEY (cat_id, tag_id),
          FOREIGN KEY (cat_id) REFERENCES cats(id) ON DELETE CASCADE,
          FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
        )
      `);
      console.log('✅ Cat_tags table created');
    } else {
      console.log('✅ Cat_tags table already exists');
    }
    
    // List all tables
    console.log('\n📋 All tables in database:');
    const [allTables] = await connection.execute('SHOW TABLES');
    allTables.forEach(row => {
      const tableName = Object.values(row)[0];
      console.log('   -', tableName);
    });
    
    console.log('\n✅ Database verification complete!');
    console.log('\n💡 Next step: Run create-admin script');
    console.log('   node scripts/create-admin.js\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nFull error:', error);
  } finally {
    if (connection) await connection.end();
  }
}

verifyAndCreateTables();
