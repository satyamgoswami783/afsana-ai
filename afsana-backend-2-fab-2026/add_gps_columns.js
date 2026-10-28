import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' });

async function addGpsColumns() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'afsana-backup-12-aug'
    });

    console.log('Connected to DB');

    const [columns] = await connection.execute('DESCRIBE user_login_logs');
    const colNames = columns.map(c => c.Field);

    if (!colNames.includes('latitude')) {
      await connection.execute('ALTER TABLE user_login_logs ADD COLUMN latitude DECIMAL(10, 8) DEFAULT NULL AFTER address');
      console.log('Added latitude column');
    }
    if (!colNames.includes('longitude')) {
      await connection.execute('ALTER TABLE user_login_logs ADD COLUMN longitude DECIMAL(11, 8) DEFAULT NULL AFTER latitude');
      console.log('Added longitude column');
    }
    if (!colNames.includes('accuracy')) {
      await connection.execute('ALTER TABLE user_login_logs ADD COLUMN accuracy DECIMAL(10, 2) DEFAULT NULL AFTER longitude');
      console.log('Added accuracy column');
    }

    console.log('GPS Columns verified successfully.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

addGpsColumns();
