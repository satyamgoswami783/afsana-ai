/**
 * ✅ LIVE RAILWAY DB - SAFE MIGRATION SCRIPT
 * 
 * Yeh script Railway Live DB mein sirf naye columns ADD karega.
 * - Existing data SAFE rahega (koi DELETE/DROP nahi)
 * - Column pehle se hai toh skip karega (IF NOT EXISTS check)
 * - Sirf ALTER TABLE ADD COLUMN commands chalega
 * 
 * Run: node migrate_live_db.js
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

// ✅ Railway Live DB Credentials
const LIVE_DB_CONFIG = {
  host: 'hopper.proxy.rlwy.net',
  user: 'root',
  password: 'KOCaXsSbXTjTbeacEiaIBlokLAANcete',
  database: 'railway',
  port: 16146,
  ssl: { rejectUnauthorized: false }
};

async function migrateLiveDB() {
  let connection;

  console.log('');
  console.log('=========================================');
  console.log('🚀 LIVE RAILWAY DB MIGRATION STARTING...');
  console.log('=========================================');
  console.log('⚠️  Host:', LIVE_DB_CONFIG.host);
  console.log('⚠️  Database:', LIVE_DB_CONFIG.database);
  console.log('');

  try {
    connection = await mysql.createConnection(LIVE_DB_CONFIG);
    console.log('✅ Live Railway DB se connect ho gaya!\n');

    // ── Step 1: Check current columns in user_login_logs ──
    const [columns] = await connection.execute('DESCRIBE user_login_logs');
    const colNames = columns.map(c => c.Field);

    console.log('📋 Current columns in user_login_logs:');
    console.log(colNames.join(', '));
    console.log('');

    // ── Step 2: Add missing columns SAFELY ──
    const migrations = [
      {
        name: 'zip',
        sql: "ALTER TABLE user_login_logs ADD COLUMN zip VARCHAR(50) DEFAULT NULL AFTER region",
        after: 'region'
      },
      {
        name: 'isp',
        sql: "ALTER TABLE user_login_logs ADD COLUMN isp VARCHAR(255) DEFAULT NULL AFTER zip",
        after: 'zip'
      },
      {
        name: 'address',
        sql: "ALTER TABLE user_login_logs ADD COLUMN address VARCHAR(500) DEFAULT NULL AFTER isp",
        after: 'isp'
      },
      {
        name: 'latitude',
        sql: "ALTER TABLE user_login_logs ADD COLUMN latitude DECIMAL(10, 8) DEFAULT NULL AFTER address",
        after: 'address'
      },
      {
        name: 'longitude',
        sql: "ALTER TABLE user_login_logs ADD COLUMN longitude DECIMAL(11, 8) DEFAULT NULL AFTER latitude",
        after: 'latitude'
      },
      {
        name: 'accuracy',
        sql: "ALTER TABLE user_login_logs ADD COLUMN accuracy DECIMAL(10, 2) DEFAULT NULL AFTER longitude",
        after: 'longitude'
      }
    ];

    let addedCount = 0;
    let skippedCount = 0;

    for (const migration of migrations) {
      if (colNames.includes(migration.name)) {
        console.log(`⏭️  SKIP: '${migration.name}' column already exists`);
        skippedCount++;
      } else {
        await connection.execute(migration.sql);
        console.log(`✅ ADDED: '${migration.name}' column successfully`);
        addedCount++;
      }
    }

    console.log('');
    console.log('=========================================');
    console.log(`✅ Migration Complete!`);
    console.log(`   Added  : ${addedCount} new columns`);
    console.log(`   Skipped: ${skippedCount} (already existed)`);
    console.log('=========================================');

    // ── Step 3: Verify final schema ──
    const [newColumns] = await connection.execute('DESCRIBE user_login_logs');
    console.log('\n📋 Final columns in user_login_logs:');
    newColumns.forEach(col => {
      console.log(`   ${col.Field} (${col.Type}) - Default: ${col.Default ?? 'NULL'}`);
    });

    // ── Step 4: Row count check ──
    const [[{ total }]] = await connection.execute('SELECT COUNT(*) as total FROM user_login_logs');
    console.log(`\n📊 Total existing rows (data safe): ${total}`);
    console.log('\n🎉 Live DB data bilkul SAFE hai! Koi data delete nahi hua.');

  } catch (err) {
    console.error('\n❌ Migration Error:', err.message);
    console.error('Full error:', err);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 DB Connection closed.');
    }
  }
}

migrateLiveDB();
