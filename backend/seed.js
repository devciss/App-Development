// backend/seed.js
require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function seed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    // 1. Ensure table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(191) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('Manager', 'Cashier') NOT NULL DEFAULT 'Cashier',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Hash password with bcryptjs
    const hashedPassword = await bcrypt.hash('password123', 10);

    // 3. Insert or update users
    await pool.query(`
      INSERT INTO users (name, email, password, role) 
      VALUES 
        ('Alice Manager', 'manager@example.com', ?, 'Manager'),
        ('Bob Cashier', 'cashier@example.com', ?, 'Cashier')
      ON DUPLICATE KEY UPDATE 
        password = VALUES(password),
        role = VALUES(role)
    `, [hashedPassword, hashedPassword]);

    console.log('Test users successfully created/updated:');
    console.log(' - manager@example.com / password123 (Manager)');
    console.log(' - cashier@example.com / password123 (Cashier)');
  } catch (error) {
    console.error('Seed error:', error.message);
  } finally {
    await pool.end();
  }
}

seed();