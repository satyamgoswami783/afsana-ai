-- Migration: User Status & Login Logs setup

-- 1. Add status column to users table
ALTER TABLE users ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'active';

-- 2. Create user_login_logs table
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
);
