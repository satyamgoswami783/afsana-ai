import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' });

async function checkTableSchema() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'afsana-backup-12-aug'
    });

    const [columns] = await connection.execute('DESCRIBE user_login_logs');
    console.log('Columns in user_login_logs:', columns.map(c => c.Field));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkTableSchema();
