import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' });

async function check() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'afsana-backup-12-aug',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
  });

  try {
    const [usersCols] = await connection.query("DESCRIBE users");
    console.log("users table status/active columns:");
    console.log(usersCols.filter(c => c.Field.toLowerCase().includes('status') || c.Field.toLowerCase().includes('active') || c.Field.toLowerCase().includes('avail') || c.Field.toLowerCase().includes('state')));

    const [staffCols] = await connection.query("DESCRIBE staff");
    console.log("staff table status/active columns:");
    console.log(staffCols.filter(c => c.Field.toLowerCase().includes('status') || c.Field.toLowerCase().includes('active') || c.Field.toLowerCase().includes('avail') || c.Field.toLowerCase().includes('state')));

    const [counselorCols] = await connection.query("DESCRIBE counselors");
    console.log("counselors table status/active columns:");
    console.log(counselorCols.filter(c => c.Field.toLowerCase().includes('status') || c.Field.toLowerCase().includes('active') || c.Field.toLowerCase().includes('avail') || c.Field.toLowerCase().includes('state')));

  } catch (err) {
    console.error(err);
  } finally {
    await connection.end();
  }
}
check();
