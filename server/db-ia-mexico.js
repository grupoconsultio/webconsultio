import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import net from 'net';

dotenv.config();

let dbUrlConfig = null;
if (process.env.DATABASE_IA_MEXICO_URL) {
  try {
    const parsed = new URL(process.env.DATABASE_IA_MEXICO_URL);
    dbUrlConfig = {
      host: parsed.hostname,
      port: parseInt(parsed.port || '3306', 10),
      user: decodeURIComponent(parsed.username || 'mysql'),
      password: decodeURIComponent(parsed.password || '0w7dfhh4by89qx2v'),
      database: parsed.pathname.replace(/^\//, '') || 'mysql'
    };
  } catch (e) {
    console.warn('[MySQL IA México] Advertencia al parsear DATABASE_IA_MEXICO_URL:', e.message);
  }
}

const port = dbUrlConfig?.port || parseInt(process.env.DB_IA_MEXICO_PORT || '3306', 10);
const user = dbUrlConfig?.user || process.env.DB_IA_MEXICO_USER || 'mysql';
const password = dbUrlConfig?.password || process.env.DB_IA_MEXICO_PASSWORD || '0w7dfhh4by89qx2v';
const database = dbUrlConfig?.database || process.env.DB_IA_MEXICO_NAME || 'mysql';

// Función para extraer la IP del gateway en contenedores Linux
function getLinuxGatewayIp() {
  try {
    if (fs.existsSync('/proc/net/route')) {
      const routeContent = fs.readFileSync('/proc/net/route', 'utf8');
      const lines = routeContent.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts[1] === '00000000' && parts[2]) {
          const hex = parts[2];
          const o1 = parseInt(hex.substr(6, 2), 16);
          const o2 = parseInt(hex.substr(4, 2), 16);
          const o3 = parseInt(hex.substr(2, 2), 16);
          const o4 = parseInt(hex.substr(0, 2), 16);
          return `${o1}.${o2}.${o3}.${o4}`;
        }
      }
    }
  } catch {
    // ignore
  }
  return null;
}

// Obtener candidatos de host ordenados por probabilidad
function getHostCandidates() {
  const list = [];

  if (dbUrlConfig?.host && !list.includes(dbUrlConfig.host)) {
    list.push(dbUrlConfig.host);
  }

  const envHost = process.env.DB_IA_MEXICO_HOST;
  if (envHost && !list.includes(envHost)) {
    list.push(envHost);
  }

  const defaultNamedHost = 'bbddconsuldat-bbddiamexico-suhms1';
  if (!list.includes(defaultNamedHost)) {
    list.push(defaultNamedHost);
  }

  const gw = getLinuxGatewayIp();
  if (gw && !list.includes(gw)) {
    list.push(gw);
  }

  const fallbacks = [
    'host.docker.internal',
    '172.17.0.1',
    '172.18.0.1',
    '172.19.0.1',
    '172.20.0.1',
    '2.25.114.103',
    '127.0.0.1',
    'localhost'
  ];

  for (const f of fallbacks) {
    if (!list.includes(f)) list.push(f);
  }

  return list;
}

// Sondeo TCP con timeout acotado
function probeTcp(host, targetPort, timeoutMs = 1200) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({ host, reachable: true });
      }
    });

    socket.on('timeout', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({ host, reachable: false, error: 'ETIMEDOUT' });
      }
    });

    socket.on('error', (err) => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({ host, reachable: false, error: err.code || err.message });
      }
    });

    try {
      socket.connect(targetPort, host);
    } catch (err) {
      if (!settled) {
        settled = true;
        resolve({ host, reachable: false, error: err.message });
      }
    }
  });
}

let activePool = null;
let activeHost = null;
let poolPromise = null;
let lastProbeResults = [];

function createSinglePool(host) {
  return mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 15,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: 5000
  });
}

async function ensureTables(p) {
  try {
    const conn = await p.getConnection();
    await conn.query(`
      CREATE TABLE IF NOT EXISTS survey_ia_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        response_token VARCHAR(64) NOT NULL UNIQUE,
        device_id VARCHAR(64) NULL,
        p1_frecuencia_uso VARCHAR(50) NOT NULL,
        p2_herramientas TEXT NULL,
        p2_otro TEXT NULL,
        p3_usos TEXT NULL,
        p3_otro TEXT NULL,
        p4_confianza TINYINT NULL,
        p5_decision_importante VARCHAR(50) NULL,
        p6_pregunta_politica VARCHAR(50) NOT NULL,
        p7_ayuda_voto VARCHAR(50) NOT NULL,
        p8_enfoque_voto VARCHAR(100) NULL,
        p9_influencia_voto VARCHAR(50) NOT NULL,
        p10_neutralidad VARCHAR(50) NOT NULL,
        p11_edad VARCHAR(50) NOT NULL,
        p12_genero VARCHAR(50) NOT NULL,
        p13_provincia VARCHAR(100) NOT NULL,
        p13_localidad VARCHAR(150) NOT NULL,
        p14_educacion VARCHAR(100) NOT NULL,
        duration_seconds INT DEFAULT 0,
        ip_hash VARCHAR(64) NULL,
        user_agent VARCHAR(255) NULL,
        is_flagged_speeder BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_device (device_id),
        INDEX idx_provincia (p13_provincia),
        INDEX idx_frecuencia (p1_frecuencia_uso),
        INDEX idx_edad (p11_edad),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS raffle_ia_participants (
        id INT AUTO_INCREMENT PRIMARY KEY,
        response_token VARCHAR(64) NOT NULL UNIQUE,
        dni VARCHAR(10) NOT NULL,
        email VARCHAR(191) NOT NULL,
        participated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uq_email (email),
        INDEX idx_dni (dni),
        INDEX idx_created (participated_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    conn.release();
    console.log('[MySQL IA México] Tablas verificadas exitosamente');
  } catch (err) {
    console.warn('[MySQL IA México] Advertencia al verificar tablas:', err.message);
  }
}

// Descubre el primer host funcional y cachea el pool
export async function getActiveIaMexicoPool() {
  if (activePool) return activePool;
  if (poolPromise) return poolPromise;

  poolPromise = (async () => {
    const candidates = getHostCandidates();
    console.log('[MySQL IA México Discovery] Evaluando candidatos de red:', candidates);

    const probes = await Promise.all(candidates.map(h => probeTcp(h, port, 1500)));
    lastProbeResults = probes;

    const reachableCandidates = probes.filter(p => p.reachable).map(p => p.host);
    console.log('[MySQL IA México Discovery] Hosts con puerto ' + port + ' accesible:', reachableCandidates);

    const orderToTry = reachableCandidates.length > 0 ? reachableCandidates : candidates.slice(0, 3);

    for (const host of orderToTry) {
      try {
        console.log(`[MySQL IA México Discovery] Probando autenticación en ${host}:${port}...`);
        const candidatePool = createSinglePool(host);
        const conn = await candidatePool.getConnection();
        await conn.ping();
        conn.release();

        console.log(`[MySQL IA México Discovery] ✓ Conectado exitosamente a MySQL IA México en host: ${host}`);
        activePool = candidatePool;
        activeHost = host;
        await ensureTables(activePool);
        return activePool;
      } catch (err) {
        console.warn(`[MySQL IA México Discovery] Falló conexión en ${host}:`, err.message);
      }
    }

    const defaultHost = candidates[0] || 'bbddconsuldat-bbddiamexico-suhms1';
    console.warn(`[MySQL IA México Discovery] Creando pool de fallback en ${defaultHost}`);
    activePool = createSinglePool(defaultHost);
    activeHost = defaultHost;
    return activePool;
  })();

  return poolPromise;
}

getActiveIaMexicoPool().catch(() => {});

// Test de conexión
export async function testIaMexicoConnection() {
  try {
    const p = await getActiveIaMexicoPool();
    const conn = await p.getConnection();
    await conn.ping();
    const [[countRow]] = await conn.query('SELECT COUNT(*) as count FROM survey_ia_responses');
    conn.release();
    return {
      ok: true,
      host: activeHost,
      port,
      totalResponses: countRow?.count ?? 0,
      message: 'Conexión a MySQL IA México exitosa'
    };
  } catch (error) {
    console.error('[MySQL IA México Error]', error.message);
    return {
      ok: false,
      host: activeHost,
      port,
      probes: lastProbeResults,
      error: error.message
    };
  }
}

const poolProxy = {
  async query(...args) {
    const p = await getActiveIaMexicoPool();
    return p.query(...args);
  },
  async execute(...args) {
    const p = await getActiveIaMexicoPool();
    return p.execute(...args);
  },
  async getConnection() {
    const p = await getActiveIaMexicoPool();
    return p.getConnection();
  }
};

export default poolProxy;
