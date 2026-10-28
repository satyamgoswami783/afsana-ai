import mysql from 'mysql2/promise';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' });

async function updateLogsSchemaAndData() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'afsana-backup-12-aug'
    });

    console.log('Connected to DB');

    // Add zip, isp, address columns if they do not exist
    const [columns] = await connection.execute('DESCRIBE user_login_logs');
    const colNames = columns.map(c => c.Field);

    if (!colNames.includes('zip')) {
      await connection.execute('ALTER TABLE user_login_logs ADD COLUMN zip VARCHAR(50) DEFAULT NULL AFTER region');
      console.log('Added zip column');
    }
    if (!colNames.includes('isp')) {
      await connection.execute('ALTER TABLE user_login_logs ADD COLUMN isp VARCHAR(255) DEFAULT NULL AFTER zip');
      console.log('Added isp column');
    }
    if (!colNames.includes('address')) {
      await connection.execute('ALTER TABLE user_login_logs ADD COLUMN address VARCHAR(500) DEFAULT NULL AFTER isp');
      console.log('Added address column');
    }

    // Get current detailed GeoIP info
    const geoRes = await axios.get('http://ip-api.com/json/', { timeout: 5000 });
    if (geoRes.data && geoRes.data.status === 'success') {
      const publicIp = geoRes.data.query;
      const country = geoRes.data.country || 'India';
      const city = geoRes.data.city || 'Indore';
      const region = geoRes.data.regionName || 'Madhya Pradesh';
      const timezone = geoRes.data.timezone || 'Asia/Kolkata';
      const zip = geoRes.data.zip || '';
      const isp = geoRes.data.isp || '';
      const fullAddress = `${city}, ${region}${zip ? ' ' + zip : ''}, ${country}${isp ? ' (ISP: ' + isp + ')' : ''}`;

      console.log('Updating existing log records with full address:', fullAddress);

      const [result] = await connection.execute(
        `UPDATE user_login_logs 
         SET ip_address = ?, country = ?, city = ?, region = ?, timezone = ?, zip = ?, isp = ?, address = ?`,
        [publicIp, country, city, region, timezone, zip, isp, fullAddress]
      );

      console.log(`Updated ${result.affectedRows} log records successfully with full address and ISP details.`);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

updateLogsSchemaAndData();
