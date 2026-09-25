import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import net from 'net';

dotenv.config();

const port = parseInt(process.env.DB_PAPA_PORT || process.env.DB_PORT || '3306', 10);
const user = process.env.DB_PAPA_USER || process.env.DB_USER || 'mysql';
const password = process.env.DB_PAPA_PASSWORD || process.env.DB_PASSWORD || 'msodtssapus5soxz';
const database = process.env.DB_PAPA_NAME || process.env.DB_NAME || 'mysql';

// Función para extraer la IP de la puerta de enlace en Linux (/proc/net/route)
function getLinuxGatewayIp() {
  try {
    if (fs.existsSync('/proc/net/route')) {
      const routeContent = fs.readFileSync('/proc/net/route', 'utf8');
      const lines = routeContent.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        // Destination == 00000000 es la ruta por defecto
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
    // No en Linux o sin permisos
  }
  return null;
}

// Obtener candidatos de host ordenados por prioridad
function getHostCandidates() {
  const list = [];

  // 1. Host explícito si el usuario lo configuró
  const envHost = process.env.DB_PAPA_HOST || process.env.DB_HOST;
  if (envHost && !list.includes(envHost)) {
    list.push(envHost);
  }

  // 2. Gateway del contenedor Docker en Linux (apunta directamente al host)
  const gw = getLinuxGatewayIp();
  if (gw && !list.includes(gw)) {
    list.push(gw);
  }

  // 3. Puertas de enlace típicas de Docker y aliases conocidos
  const fallbacks = [
    '172.17.0.1',
    'host.docker.internal',
    '172.18.0.1',
    '172.19.0.1',
    '172.20.0.1',
    '2.25.114.103',
    'mysql',
    '127.0.0.1',
    'localhost'
  ];

  for (const f of fallbacks) {
    if (!list.includes(f)) list.push(f);
  }

  return list;
}

// Sondear TCP rápido en un host:puerto
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

// Descubre el primer host con MySQL funcional y cachea el pool
export async function getActivePool() {
  if (activePool) return activePool;
  if (poolPromise) return poolPromise;

  poolPromise = (async () => {
    const candidates = getHostCandidates();
    console.log('[MySQL Discovery] Evaluando candidatos de red:', candidates);

    // Sondeo TCP en paralelo con timeout acotado
    const probes = await Promise.all(candidates.map(h => probeTcp(h, port, 1500)));
    lastProbeResults = probes;

    const reachableCandidates = probes.filter(p => p.reachable).map(p => p.host);
    console.log('[MySQL Discovery] Hosts con puerto ' + port + ' accesible:', reachableCandidates);

    // Si ninguno respondió en TCP, intentar con el primero disponible
    const orderToTry = reachableCandidates.length > 0 ? reachableCandidates : candidates.slice(0, 3);

    for (const host of orderToTry) {
      try {
        console.log(`[MySQL Discovery] Probando autenticación en ${host}:${port}...`);
        const candidatePool = createSinglePool(host);
        const conn = await candidatePool.getConnection();
        await conn.ping();
        conn.release();

        console.log(`[MySQL Discovery] ✓ Conectado exitosamente a MySQL en host: ${host}`);
        activePool = candidatePool;
        activeHost = host;
        return activePool;
      } catch (err) {
        console.warn(`[MySQL Discovery] Falló conexión en ${host}:`, err.message);
      }
    }

    // Si todos fallan, crear con el host configurado por defecto
    const defaultHost = candidates[0] || '2.25.114.103';
    console.error(`[MySQL Discovery] Ningún candidato conectó. Usando host por defecto ${defaultHost}`);
    activePool = createSinglePool(defaultHost);
    activeHost = defaultHost;
    return activePool;
  })();

  return poolPromise;
}

// Iniciar descubrimiento en segundo plano al arrancar
getActivePool().catch(() => {});

// Función para testear la conexión desde /api/health
export async function testConnection() {
  try {
    const p = await getActivePool();
    const conn = await p.getConnection();
    await conn.ping();
    const [[countRow]] = await conn.query('SELECT COUNT(*) as count FROM survey_responses');
    conn.release();
    return {
      ok: true,
      host: activeHost,
      port,
      totalResponses: countRow?.count ?? 0,
      message: 'Conexión a MySQL exitosa'
    };
  } catch (error) {
    console.error('[MySQL Error]', error.message);
    return {
      ok: false,
      host: activeHost,
      port,
      probes: lastProbeResults,
      error: error.message
    };
  }
}

// Pool transparente que delega al pool activo descubierto
const poolProxy = {
  async query(...args) {
    const p = await getActivePool();
    return p.query(...args);
  },
  async execute(...args) {
    const p = await getActivePool();
    return p.execute(...args);
  },
  async getConnection() {
    const p = await getActivePool();
    return p.getConnection();
  }
};

export default poolProxy;
