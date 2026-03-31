import mysql from 'mysql2/promise';
import { hashPassword } from './server/_core/password.ts';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
  process.exit(1);
}

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  console.error('ADMIN_PASSWORD must be set with at least 8 characters');
  process.exit(1);
}

const pool = mysql.createPool(DATABASE_URL);
const conn = await pool.getConnection();

try {
  // Check if admin user exists
  const [existing] = await conn.execute(
    'SELECT id, email, role FROM users WHERE email = ? OR openId = ?',
    ['admin@oranjeapp.com.br', 'admin-owner']
  );

  if (existing.length > 0) {
    console.log('Admin user already exists:', existing[0]);
    const passwordHash = await hashPassword(ADMIN_PASSWORD);
    await conn.execute(
      `INSERT INTO admin_credentials (userId, passwordHash, passwordUpdatedAt)
       VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE passwordHash = VALUES(passwordHash), passwordUpdatedAt = VALUES(passwordUpdatedAt)`,
      [existing[0].id, passwordHash]
    );
    console.log('✅ Admin password updated successfully!');
  } else {
    // Create admin user
    await conn.execute(
      'INSERT INTO users (openId, email, name, role, lastSignedIn) VALUES (?, ?, ?, ?, NOW())',
      ['admin-owner', 'admin@oranjeapp.com.br', 'Admin Oranje', 'admin']
    );
    const [createdUsers] = await conn.execute(
      'SELECT id FROM users WHERE email = ? OR openId = ? LIMIT 1',
      ['admin@oranjeapp.com.br', 'admin-owner']
    );
    const createdUser = createdUsers[0];
    if (!createdUser?.id) {
      throw new Error('Admin user created but id could not be loaded');
    }
    const passwordHash = await hashPassword(ADMIN_PASSWORD);
    await conn.execute(
      'INSERT INTO admin_credentials (userId, passwordHash, passwordUpdatedAt) VALUES (?, ?, NOW())',
      [createdUser.id, passwordHash]
    );
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@oranjeapp.com.br');
    console.log('Password: configured via ADMIN_PASSWORD');
  }

  // Show all admin users
  const [admins] = await conn.execute('SELECT id, email, name, role FROM users WHERE role = ?', ['admin']);
  console.log('\nAll admin users:');
  console.table(admins);
} catch (error) {
  console.error('Error:', error);
} finally {
  await conn.release();
  await pool.end();
}
