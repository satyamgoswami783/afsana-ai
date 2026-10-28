import mysql from 'mysql2/promise';

const LIVE_DB_CONFIG = {
  host: 'hopper.proxy.rlwy.net',
  user: 'root',
  password: 'KOCaXsSbXTjTbeacEiaIBlokLAANcete',
  database: 'railway',
  port: 16146,
  ssl: { rejectUnauthorized: false }
};

async function checkTables() {
  let connection;
  try {
    connection = await mysql.createConnection(LIVE_DB_CONFIG);
    console.log('✅ Connected to Live Railway DB!\n');

    const [tables] = await connection.execute('SHOW TABLES');
    console.log('📋 All tables in Live DB:');
    tables.forEach((t, i) => {
      const name = Object.values(t)[0];
      console.log(`  ${i + 1}. ${name}`);
    });
    console.log(`\nTotal tables: ${tables.length}`);

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    if (connection) await connection.end();
  }
}

checkTables();
