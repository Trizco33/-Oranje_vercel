import mysql from 'mysql2/promise';

const pool = mysql.createPool(process.env.DATABASE_URL);
const conn = await pool.getConnection();

const [rows] = await conn.execute('SELECT id, email, role FROM users WHERE role = ? LIMIT 5', ['admin']);
console.log('Admin users:', rows);

await conn.release();
process.exit(0);
