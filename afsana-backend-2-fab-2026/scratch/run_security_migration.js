import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' });

async function run() {
  console.log("Connecting to database:", process.env.DB_NAME || 'afsana-backup-12-aug');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'afsana-backup-12-aug',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
  });

  try {
    console.log("Running migration...");

    // Check if status column already exists
    const [columns] = await connection.query("DESCRIBE users");
    const statusExists = columns.some(c => c.Field === 'status');
    if (!statusExists) {
      await connection.query("ALTER TABLE users ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'active'");
      console.log("✅ Column 'status' added to 'users' table.");
    } else {
      console.log("ℹ️ Column 'status' already exists in 'users' table.");
    }

    // Create user_login_logs table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS user_login_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        email VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        ip_address VARCHAR(100) DEFAULT NULL,
        country VARCHAR(100) DEFAULT NULL,
        city VARCHAR(100) DEFAULT NULL,
        region VARCHAR(100) DEFAULT NULL,
        timezone VARCHAR(100) DEFAULT NULL,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'user_login_logs' created or verified.");
    console.log("🎉 Migration run successfully!");

  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await connection.end();
  }
}
run();
