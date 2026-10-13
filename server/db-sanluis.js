import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import net from 'net';

const { Pool } = pg;

dotenv.config();

const port = parseInt(process.env.DB_SANLUIS_PORT || '5432', 10);
const user = process.env.DB_SANLUIS_USER || 'postgres';
const password = process.env.DB_SANLUIS_PASSWORD || 'pfrtz0mbjictzozf';
const database = process.env.DB_SANLUIS_NAME || 'postgres';

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

function getHostCandidates() {
  const list = [];
  const envHost = process.env.DB_SANLUIS_HOST;
  if (envHost && !list.includes(envHost)) {
    list.push(envHost);
  }

  const gw = getLinuxGatewayIp();
  if (gw && !list.includes(gw)) {
    list.push(gw);
  }

  const fallbacks = [
    'consuldatio-bbddsanluis-hshlgz',
    'localhost',
    '127.0.0.1',
    'host.docker.internal',
    '172.17.0.1',
    '172.18.0.1',
    '172.19.0.1',
    '2.25.114.103'
  ];

  for (const f of fallbacks) {
    if (!list.includes(f)) list.push(f);
  }

  return list;
}

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
  return new Pool({
    host,
    port,
    user,
    password,
    database,
    max: 15,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000
  });
}

async function ensureTables(p) {
  try {
    await p.query(`
      CREATE TABLE IF NOT EXISTS survey_responses_sanluis (
        id SERIAL PRIMARY KEY,
        sid VARCHAR(64) UNIQUE,
        version VARCHAR(32),
        ts_inicio TIMESTAMPTZ,
        ts_fin TIMESTAMPTZ,
        dur_s INTEGER,
        p1 VARCHAR(64),
        p2 VARCHAR(128),
        p2_otro TEXT,
        p3 VARCHAR(64),
        p4 VARCHAR(64),
        p5_poggi VARCHAR(64),
        p5_alberto VARCHAR(64),
        p5_adolfo VARCHAR(64),
        p5_frontera VARCHAR(64),
        p5_abdala VARCHAR(64),
        p6 VARCHAR(128),
        p6_otro TEXT,
        p7 VARCHAR(128),
        p8 VARCHAR(128),
        p9 VARCHAR(64),
        p10 VARCHAR(64),
        p11 VARCHAR(128),
        p12 VARCHAR(128),
        p12_otro TEXT,
        genero VARCHAR(32),
        edad VARCHAR(32),
        localidad VARCHAR(128),
        departamento VARCHAR(128),
        localidad_libre VARCHAR(128),
        laboral VARCHAR(128),
        is_flagged_speeder BOOLEAN DEFAULT FALSE,
        utm_source VARCHAR(128),
        utm_medium VARCHAR(128),
        utm_campaign VARCHAR(128),
        utm_content VARCHAR(128),
        utm_term VARCHAR(128),
        fbclid VARCHAR(32),
        referrer TEXT,
        movil SMALLINT DEFAULT 0,
        tiempos JSONB,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS raffle_participants_sanluis (
        id SERIAL PRIMARY KEY,
        contacto VARCHAR(128) NOT NULL UNIQUE,
        tipo VARCHAR(32) NOT NULL,
        fecha VARCHAR(32),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[PostgreSQL San Luis] Tablas verificadas exitosamente');
  } catch (err) {
    console.warn('[PostgreSQL San Luis] Advertencia al verificar tablas:', err.message);
  }
}

export async function getActiveSanLuisPool() {
  if (activePool) return activePool;
  if (poolPromise) return poolPromise;

  poolPromise = (async () => {
    const candidates = getHostCandidates();
    console.log('[PostgreSQL San Luis Discovery] Evaluando candidatos:', candidates);

    const probes = await Promise.all(candidates.map(h => probeTcp(h, port, 1500)));
    lastProbeResults = probes;

    const reachableCandidates = probes.filter(p => p.reachable).map(p => p.host);
    console.log('[PostgreSQL San Luis Discovery] Hosts con puerto ' + port + ' accesible:', reachableCandidates);

    const orderToTry = reachableCandidates.length > 0 ? reachableCandidates : candidates.slice(0, 3);

    for (const host of orderToTry) {
      try {
        console.log(`[PostgreSQL San Luis Discovery] Probando autenticación en ${host}:${port}...`);
        const candidatePool = createSinglePool(host);
        const client = await candidatePool.connect();
        await client.query('SELECT 1');
        client.release();

        console.log(`[PostgreSQL San Luis Discovery] ✓ Conectado exitosamente en host: ${host}`);
        activePool = candidatePool;
        activeHost = host;
        await ensureTables(activePool);
        return activePool;
      } catch (err) {
        console.warn(`[PostgreSQL San Luis Discovery] Falló conexión en ${host}:`, err.message);
      }
    }

    const defaultHost = candidates[0] || 'consuldatio-bbddsanluis-hshlgz';
    console.warn(`[PostgreSQL San Luis Discovery] Creando pool de fallback en ${defaultHost}`);
    activePool = createSinglePool(defaultHost);
    activeHost = defaultHost;
    return activePool;
  })();

  return poolPromise;
}

getActiveSanLuisPool().catch(() => {});

export async function testSanLuisConnection() {
  try {
    const p = await getActiveSanLuisPool();
    const client = await p.connect();
    const res = await client.query('SELECT COUNT(*) as count FROM survey_responses_sanluis');
    client.release();
    return {
      ok: true,
      host: activeHost,
      port,
      totalResponses: parseInt(res.rows[0]?.count || 0, 10),
      message: 'Conexión a PostgreSQL San Luis exitosa'
    };
  } catch (error) {
    console.error('[PostgreSQL San Luis Error]', error.message);
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
    const p = await getActiveSanLuisPool();
    return p.query(...args);
  },
  async getClient() {
    const p = await getActiveSanLuisPool();
    return p.connect();
  }
};

export default poolProxy;
