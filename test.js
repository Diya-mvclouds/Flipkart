// test.js
const mysql = require('mysql2/promise');

async function testDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'Admin@123',
      database: process.env.DB_NAME || 'flipkart',
    });

    const [rows] = await connection.query('SELECT 1+1 AS result');
    console.log('Test query result:', rows[0].result);

    if (rows[0].result === 2) {
      console.log('Database connection successful!');
      process.exit(0);
    } else {
      console.log('Database test failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
}

testDB();