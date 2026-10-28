/**
 * ✅ LIVE RAILWAY DB - COMPLETE MIGRATION SCRIPT
 * 
 * user_login_logs table live DB mein exist nahi karta.
 * Yeh script:
 * 1. Table CREATE karega (agar nahi hai toh)
 * 2. Agar table hai toh GPS columns ADD karega safely
 * 
 * Run: node migrate_live_db_v2.js
 */

import mysql from 'mysql2/promise';

const LIVE_DB_CONFIG = {
  host: 'hopper.proxy.rlwy.net',
  user: 'root',
  password: 'KOCaXsSbXTjTbeacEiaIBlokLAANcete',
  database: 'railway',
  port: 16146,
  connectTimeout: 30000,
  // SSL without strict verification for Railway
  ssl: {
    rejectUnauthorized: false,
    minVersion: 'TLSv1'
  }
};

async function migrateLiveDB() {
  let connection;

  console.log('\n=========================================');
  console.log('🚀 LIVE RAILWAY DB MIGRATION V2');
  console.log('=========================================\n');

  try {
    connection = await mysql.createConnection(LIVE_DB_CONFIG);
    console.log('✅ Live Railway DB se connect ho gaya!\n');

    // ── Step 1: Check if table exists ──
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = 'railway' AND TABLE_NAME = 'user_login_logs'`
    );

    if (tables.length === 0) {
      // Table nahi hai - CREATE karo
      console.log('⚠️  user_login_logs table nahi hai - CREATE kar rahe hain...\n');

      await connection.execute(`
        CREATE TABLE user_login_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT DEFAULT NULL,
          name VARCHAR(255) DEFAULT NULL,
          email VARCHAR(255) DEFAULT NULL,
          role VARCHAR(100) DEFAULT NULL,
          ip_address VARCHAR(100) DEFAULT NULL,
          country VARCHAR(100) DEFAULT NULL,
          city VARCHAR(100) DEFAULT NULL,
          region VARCHAR(100) DEFAULT NULL,
          timezone VARCHAR(100) DEFAULT NULL,
          zip VARCHAR(50) DEFAULT NULL,
          isp VARCHAR(255) DEFAULT NULL,
          address VARCHAR(500) DEFAULT NULL,
          latitude DECIMAL(10, 8) DEFAULT NULL,
          longitude DECIMAL(11, 8) DEFAULT NULL,
          accuracy DECIMAL(10, 2) DEFAULT NULL,
          login_time DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      console.log('✅ user_login_logs table successfully CREATE ho gayi!\n');

    } else {
      // Table exist karta hai - sirf columns add karo
      console.log('✅ user_login_logs table already exists - columns check kar rahe hain...\n');

      const [columns] = await connection.execute('DESCRIBE user_login_logs');
      const colNames = columns.map(c => c.Field);
      console.log('Current columns:', colNames.join(', '), '\n');

      const newColumns = [
        { name: 'zip',       sql: "ALTER TABLE user_login_logs ADD COLUMN zip VARCHAR(50) DEFAULT NULL AFTER region" },
        { name: 'isp',       sql: "ALTER TABLE user_login_logs ADD COLUMN isp VARCHAR(255) DEFAULT NULL AFTER zip" },
        { name: 'address',   sql: "ALTER TABLE user_login_logs ADD COLUMN address VARCHAR(500) DEFAULT NULL AFTER isp" },
        { name: 'latitude',  sql: "ALTER TABLE user_login_logs ADD COLUMN latitude DECIMAL(10, 8) DEFAULT NULL AFTER address" },
        { name: 'longitude', sql: "ALTER TABLE user_login_logs ADD COLUMN longitude DECIMAL(11, 8) DEFAULT NULL AFTER latitude" },
        { name: 'accuracy',  sql: "ALTER TABLE user_login_logs ADD COLUMN accuracy DECIMAL(10, 2) DEFAULT NULL AFTER longitude" },
      ];

      for (const col of newColumns) {
        if (colNames.includes(col.name)) {
          console.log(`⏭️  SKIP: '${col.name}' already exists`);
        } else {
          await connection.execute(col.sql);
          console.log(`✅ ADDED: '${col.name}' column`);
        }
      }
    }

    // ── Step 2: Final verify ──
    const [finalCols] = await connection.execute('DESCRIBE user_login_logs');
    console.log('\n📋 Final table structure:');
    finalCols.forEach(col => {
      console.log(`   ✔ ${col.Field.padEnd(15)} ${col.Type}`);
    });

    console.log('\n=========================================');
    console.log('🎉 MIGRATION COMPLETE! Live data SAFE hai.');
    console.log('=========================================\n');

  } catch (err) {
    console.error('\n❌ Migration Error:', err.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 DB Connection closed.');
    }
  }
}

migrateLiveDB();
