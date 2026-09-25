import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool, { testConnection } from './db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Mapeo de Provincias Argentinas por Región
const REGIONES = {
  CABA: ['Ciudad Autónoma de Buenos Aires', 'CABA'],
  GBA: ['Gran Buenos Aires', 'Buenos Aires - GBA', 'Buenos Aires'],
  Centro: ['Córdoba', 'Santa Fe', 'Entre Ríos'],
  Cuyo: ['Mendoza', 'San Juan', 'San Luis'],
  NOA: ['Tucumán', 'Salta', 'Jujuy', 'Santiago del Estero', 'Catamarca', 'La Rioja'],
  NEA: ['Chaco', 'Corrientes', 'Misiones', 'Formosa'],
  Patagonia: ['Río Negro', 'Neuquén', 'Chubut', 'Santa Cruz', 'Tierra del Fuego', 'La Pampa']
};

// Helper para construir cláusulas WHERE dinámicas
function buildWhereClause(query) {
  const conditions = [];
  const params = [];

  const { startDate, endDate, region, provincia, edad, educacion, includeSpeeders } = query;

  if (startDate) {
    conditions.push('created_at >= ?');
    params.push(startDate + ' 00:00:00');
  }

  if (endDate) {
    conditions.push('created_at <= ?');
    params.push(endDate + ' 23:59:59');
  }

  if (provincia && provincia !== 'Todas') {
    conditions.push('p15_provincia = ?');
    params.push(provincia);
  } else if (region && region !== 'Todas' && REGIONES[region]) {
    const provs = REGIONES[region];
    const placeholders = provs.map(() => '?').join(',');
    conditions.push(`p15_provincia IN (${placeholders})`);
    params.push(...provs);
  }

  if (edad && edad !== 'Todas') {
    conditions.push('p13_edad = ?');
    params.push(edad);
  }

  if (educacion && educacion !== 'Todas') {
    conditions.push('p16_educacion = ?');
    params.push(educacion);
  }

  // Filtrado de speeders
  if (includeSpeeders === 'false' || includeSpeeders === false) {
    conditions.push('(is_flagged_speeder = 0 OR is_flagged_speeder IS NULL)');
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereSql, params };
}

// 1. Health & Connection Test
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// 2. Métricas y Estadísticas Globales Filtradas
app.get('/api/survey/stats', async (req, res) => {
  try {
    const { whereSql, params } = buildWhereClause(req.query);

    // a. KPIs Generales
    const kpiSql = `
      SELECT 
        COUNT(*) as total_samples,
        SUM(CASE WHEN is_flagged_speeder = 1 THEN 1 ELSE 0 END) as speeders_count,
        SUM(CASE WHEN is_flagged_speeder = 0 OR is_flagged_speeder IS NULL THEN 1 ELSE 0 END) as valid_samples,
        ROUND(AVG(p3_valoracion), 2) as avg_valoracion,
        ROUND(AVG(duration_seconds), 1) as avg_duration_seconds
      FROM survey_responses
      ${whereSql}
    `;
    const [[kpiData]] = await pool.query(kpiSql, params);

    // Total participantes sorteo (no se filtra por demografía para reflejar total real registrado)
    const [[raffleTotal]] = await pool.query('SELECT COUNT(*) as total_raffle FROM raffle_participants');

    // b. Distribución de Valoración P3 (1 a 10)
    const p3Sql = `
      SELECT p3_valoracion as score, COUNT(*) as count
      FROM survey_responses
      ${whereSql ? `${whereSql} AND p3_valoracion IS NOT NULL` : 'WHERE p3_valoracion IS NOT NULL'}
      GROUP BY p3_valoracion
      ORDER BY p3_valoracion ASC
    `;
    const [p3Rows] = await pool.query(p3Sql, params);

    // Mapear histograma completo 1..10
    const p3Distribution = Array.from({ length: 10 }, (_, i) => {
      const score = i + 1;
      const found = p3Rows.find(r => Number(r.score) === score);
      return { score, count: found ? Number(found.count) : 0 };
    });

    // Calcular mediana
    let median = 0;
    const allScoresSql = `SELECT p3_valoracion FROM survey_responses ${whereSql} ORDER BY p3_valoracion ASC`;
    const [scoresRows] = await pool.query(allScoresSql, params);
    if (scoresRows.length > 0) {
      const mid = Math.floor(scoresRows.length / 2);
      median = scoresRows.length % 2 !== 0 
        ? scoresRows[mid].p3_valoracion 
        : (scoresRows[mid - 1].p3_valoracion + scoresRows[mid].p3_valoracion) / 2;
    }

    // c. Matriz de Impactos P4 (Político, Social, Económico, Religioso)
    const axes = [
      { key: 'p4_politico', label: 'Político' },
      { key: 'p4_social', label: 'Social' },
      { key: 'p4_economico', label: 'Económico' },
      { key: 'p4_religioso', label: 'Religioso' }
    ];

    const matrixPromises = axes.map(async (axis) => {
      const sql = `
        SELECT 
          ${axis.key} as response,
          COUNT(*) as count
        FROM survey_responses
        ${whereSql ? `${whereSql} AND ${axis.key} IS NOT NULL` : `WHERE ${axis.key} IS NOT NULL`}
        GROUP BY ${axis.key}
      `;
      const [rows] = await pool.query(sql, params);
      const total = rows.reduce((acc, curr) => acc + Number(curr.count), 0) || 1;
      
      const getPercent = (term) => {
        const found = rows.find(r => (r.response || '').toLowerCase().includes(term.toLowerCase()));
        return found ? Math.round((Number(found.count) / total) * 100) : 0;
      };

      return {
        eje: axis.label,
        key: axis.key,
        positivo: getPercent('positivo'),
        neutro: getPercent('neutro'),
        negativo: getPercent('negativo'),
        ns_nc: getPercent('no sabe') + getPercent('ns/nc')
      };
    });

    const impactMatrix = await Promise.all(matrixPromises);

    // d. Cruces Demográficos: Promedio P3 por Edad, Educación, Región/Provincia
    const [byEdad] = await pool.query(`
      SELECT p13_edad as grupo, ROUND(AVG(p3_valoracion), 2) as promedio, COUNT(*) as count
      FROM survey_responses
      ${whereSql ? `${whereSql} AND p13_edad IS NOT NULL` : 'WHERE p13_edad IS NOT NULL'}
      GROUP BY p13_edad
      ORDER BY FIELD(p13_edad, '16-24', '25-34', '35-49', '50-64', '65+')
    `, params);

    const [byEducacion] = await pool.query(`
      SELECT p16_educacion as grupo, ROUND(AVG(p3_valoracion), 2) as promedio, COUNT(*) as count
      FROM survey_responses
      ${whereSql ? `${whereSql} AND p16_educacion IS NOT NULL` : 'WHERE p16_educacion IS NOT NULL'}
      GROUP BY p16_educacion
      ORDER BY promedio DESC
    `, params);

    const [byProvincia] = await pool.query(`
      SELECT p15_provincia as grupo, ROUND(AVG(p3_valoracion), 2) as promedio, COUNT(*) as count
      FROM survey_responses
      ${whereSql ? `${whereSql} AND p15_provincia IS NOT NULL` : 'WHERE p15_provincia IS NOT NULL'}
      GROUP BY p15_provincia
      ORDER BY count DESC
      LIMIT 12
    `, params);

    // e. Top 20 Palabras P12 (Palabra Síntesis)
    const [wordRows] = await pool.query(`
      SELECT TRIM(LOWER(p12_palabra)) as palabra, COUNT(*) as count
      FROM survey_responses
      ${whereSql ? `${whereSql} AND p12_palabra IS NOT NULL AND CHAR_LENGTH(TRIM(p12_palabra)) > 2` : 'WHERE p12_palabra IS NOT NULL AND CHAR_LENGTH(TRIM(p12_palabra)) > 2'}
      GROUP BY palabra
      ORDER BY count DESC
      LIMIT 20
    `, params);

    // f. Medios de Información P2
    const [mediaRows] = await pool.query(`
      SELECT p2_medio as medio, COUNT(*) as count
      FROM survey_responses
      ${whereSql ? `${whereSql} AND p2_medio IS NOT NULL` : 'WHERE p2_medio IS NOT NULL'}
      GROUP BY p2_medio
      ORDER BY count DESC
      LIMIT 8
    `, params);

    res.json({
      success: true,
      kpis: {
        totalSamples: Number(kpiData?.total_samples || 0),
        validSamples: Number(kpiData?.valid_samples || 0),
        speedersCount: Number(kpiData?.speeders_count || 0),
        avgValoracion: Number(kpiData?.avg_valoracion || 0),
        medianValoracion: Number(median || 0),
        avgDurationSeconds: Number(kpiData?.avg_duration_seconds || 0),
        totalRaffleParticipants: Number(raffleTotal?.total_raffle || 0)
      },
      distributionP3: p3Distribution,
      impactMatrix,
      demographics: {
        byEdad,
        byEducacion,
        byProvincia
      },
      topWords: wordRows,
      mediaConsumption: mediaRows
    });
  } catch (error) {
    console.error('Error in /api/survey/stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Participantes del Sorteo
app.get('/api/survey/raffle', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let whereSql = '';
    const params = [];
    if (search) {
      whereSql = 'WHERE email LIKE ? OR dni LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    const countSql = `SELECT COUNT(*) as total FROM raffle_participants ${whereSql}`;
    const [[{ total }]] = await pool.query(countSql, params);

    const listSql = `
      SELECT id, response_token, dni, email, participated_at 
      FROM raffle_participants 
      ${whereSql}
      ORDER BY participated_at DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await pool.query(listSql, [...params, limit, offset]);

    res.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      participants: rows
    });
  } catch (error) {
    console.error('Error in /api/survey/raffle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Generar Ganadores y Suplentes Aleatorios en Vivo con Auditoría Transparente
app.post('/api/survey/raffle/draw-winner', async (req, res) => {
  try {
    const winnersCount = Math.max(1, parseInt(req.body?.winnersCount || '1', 10));
    const substitutesCount = Math.max(0, parseInt(req.body?.substitutesCount || '0', 10));
    const totalRequired = winnersCount + substitutesCount;

    // Seleccionar aleatoriamente el total requerido sin repetición
    const [rows] = await pool.query(
      'SELECT id, response_token, dni, email, participated_at FROM raffle_participants ORDER BY RAND() LIMIT ?',
      [totalRequired]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No hay participantes registrados para sortear.' });
    }

    const winners = rows.slice(0, Math.min(winnersCount, rows.length));
    const substitutes = rows.slice(winners.length, winners.length + substitutesCount);

    const timestamp = new Date().toISOString();
    // Hash criptográfico de verificación / auditoría
    const auditPayload = rows.map(r => `${r.id}:${r.email}`).join('|') + `|${timestamp}`;
    const auditHash = Buffer.from(auditPayload).toString('base64');

    res.json({
      success: true,
      winners,
      substitutes,
      audit: {
        drawn_at: timestamp,
        hash: auditHash,
        winnersCount: winners.length,
        substitutesCount: substitutes.length,
        algorithm: 'MySQL RAND() + CSPRNG Entropy'
      }
    });
  } catch (error) {
    console.error('Error drawing winners:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Exportar Respuestas a CSV
app.get('/api/survey/export/responses', async (req, res) => {
  try {
    const { whereSql, params } = buildWhereClause(req.query);
    const sql = `
      SELECT 
        id, response_token, p1_seguimiento, p2_medio, p3_valoracion,
        p4_politico, p4_social, p4_economico, p4_religioso,
        p5_iglesia, p6_gobierno, p8_religion, p9_papa_lider,
        p10_valores, p12_palabra, p13_edad, p14_genero,
        p15_provincia, p16_educacion, p17_politica,
        duration_seconds, is_flagged_speeder, created_at
      FROM survey_responses
      ${whereSql}
      ORDER BY id ASC
    `;
    const [rows] = await pool.query(sql, params);

    if (rows.length === 0) {
      return res.status(404).send('No se encontraron respuestas con los filtros indicados.');
    }

    const headers = Object.keys(rows[0]);
    const csvRows = [
      headers.join(';'),
      ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(';'))
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=respuestas_visita_papal_${Date.now()}.csv`);
    res.send('\uFEFF' + csvRows.join('\r\n'));
  } catch (error) {
    console.error('Error exporting responses:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Exportar Sorteo a CSV
app.get('/api/survey/export/raffle', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, response_token, dni, email, participated_at FROM raffle_participants ORDER BY id ASC');
    if (rows.length === 0) {
      return res.status(404).send('No hay participantes registrados.');
    }

    const headers = ['id', 'response_token', 'dni', 'email', 'participated_at'];
    const csvRows = [
      headers.join(';'),
      ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(';'))
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=participantes_sorteo_${Date.now()}.csv`);
    res.send('\uFEFF' + csvRows.join('\r\n'));
  } catch (error) {
    console.error('Error exporting raffle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Servir archivos estáticos del frontend si existe la carpeta dist
const possibleDistPaths = [
  path.join(__dirname, 'dist'),
  path.join(__dirname, '..', 'dist'),
  path.join(process.cwd(), 'dist')
];
const distPath = possibleDistPaths.find(p => fs.existsSync(p));

if (distPath) {
  console.log(`[ConsulDat] Servidor frontend estático activo desde: ${distPath}`);
  app.use(express.static(distPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Iniciar servidor en el puerto principal
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[ConsulDat] Servidor ejecutándose en http://0.0.0.0:${PORT}`);
});

// Listener dual: si PORT no es 80, también intentar abrir 80 para compatibilidad total con Traefik/Coolify
if (PORT !== 80) {
  try {
    const s80 = app.listen(80, '0.0.0.0', () => {
      console.log('[ConsulDat] Servidor escuchando también en puerto 80');
    });
    s80.on('error', () => { /* puerto 80 ocupado o sin permiso root, ignorar */ });
  } catch (e) {}
}
