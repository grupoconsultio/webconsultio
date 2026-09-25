import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'consuldatio-bbddencuestapapa-9zupcr',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'mysql',
  password: process.env.DB_PASSWORD || 'msodtssapus5soxz',
  database: process.env.DB_NAME || 'mysql',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  connectTimeout: 8000
});

// Función para testear la conexión
export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return { ok: true, message: 'Conexión a MySQL exitosa' };
  } catch (error) {
    console.error('[MySQL Error]', error.message);
    return { ok: false, error: error.message };
  }
}

export default pool;
