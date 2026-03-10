const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function updatePassword() {
  let connection;
  
  try {
    // Parse DATABASE_URL from .env
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL not found');
    }
    
    // Extract connection details from URL
    const match = dbUrl.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
    if (!match) {
      throw new Error('Invalid DATABASE_URL format');
    }
    
    const [, user, password, host, port, database] = match;
    
    console.log('Connecting to MySQL...');
    connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password,
      database,
      connectTimeout: 5000
    });
    
    console.log('✅ Connected');
    
    const email = 'admin@rafiki.com';
    const newPassword = 'Tehama@2025';
    
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    console.log('Updating user...');
    const [result] = await connection.execute(
      'UPDATE User SET hashedPassword = ? WHERE email = ?',
      [hashedPassword, email]
    );
    
    console.log('✅ Password updated successfully!');
    console.log('Rows affected:', result.affectedRows);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
    process.exit(0);
  }
}

updatePassword();
