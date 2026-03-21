import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL not set');
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
  } else {
    // Create admin user
    await conn.execute(
      'INSERT INTO users (openId, email, name, role, lastSignedIn) VALUES (?, ?, ?, ?, NOW())',
      ['admin-owner', 'admin@oranjeapp.com.br', 'Admin Oranje', 'admin']
    );
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@oranjeapp.com.br');
    console.log('Password: ANY (temporary - accepts any password)');
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
