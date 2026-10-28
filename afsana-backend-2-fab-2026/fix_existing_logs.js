import mysql from 'mysql2/promise';
import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' });

async function fixExistingLogs() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'afsana-backup-12-aug'
    });

    console.log('Connected to DB');

    // Get current public IP and location
    const geoRes = await axios.get('http://ip-api.com/json/', { timeout: 5000 });
    if (geoRes.data && geoRes.data.status === 'success') {
      const publicIp = geoRes.data.query;
      const country = geoRes.data.country || 'India';
      const city = geoRes.data.city || 'Indore';
      const region = geoRes.data.regionName || 'Madhya Pradesh';
      const timezone = geoRes.data.timezone || 'Asia/Kolkata';

      console.log(`Updating local/::1 logs to: IP=${publicIp}, Country=${country}, City=${city}, Region=${region}, Timezone=${timezone}`);

      const [result] = await connection.execute(
        `UPDATE user_login_logs 
         SET ip_address = ?, country = ?, city = ?, region = ?, timezone = ? 
         WHERE ip_address = '::1' OR ip_address = '127.0.0.1' OR country = 'Localhost'`,
        [publicIp, country, city, region, timezone]
      );

      console.log(`Updated ${result.affectedRows} log records successfully.`);
    } else {
      console.log('Failed to fetch public IP location info');
    }
  } catch (err) {
    console.error('Error updating existing logs:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

fixExistingLogs();
