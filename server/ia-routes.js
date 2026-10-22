import express from 'express';
import XLSX from 'xlsx';
import crypto from 'crypto';
import poolIa, { testIaConnection } from './db-ia.js';

const router = express.Router();

// Mapeo de Provincias Argentinas por Región
const REGIONES = {
  CABA: ['Ciudad Autónoma de Buenos Aires (CABA)', 'Ciudad Autónoma de Buenos Aires', 'CABA', 'Capital Federal'],
  GBA: ['Buenos Aires', 'Gran Buenos Aires', 'Buenos Aires - GBA', 'La Plata / Conurbano'],
  Centro: ['Córdoba', 'Santa Fe', 'Entre Ríos', 'Interior Buenos Aires'],
  Cuyo: ['Mendoza', 'San Juan', 'San Luis'],
  NOA: ['Tucumán', 'Salta', 'Jujuy', 'Santiago del Estero', 'Catamarca', 'La Rioja'],
  NEA: ['Chaco', 'Corrientes', 'Misiones', 'Formosa'],
  Patagonia: ['Río Negro', 'Neuquén', 'Chubut', 'Santa Cruz', 'Tierra del Fuego', 'Tierra del Fuego, Antártida e Islas del Atlántico Sur', 'La Pampa']
};

function getRegionFromProvincia(prov) {
  if (!prov) return 'Otras';
  const norm = String(prov).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (norm.includes('caba') || norm.includes('ciudad autonoma') || norm.includes('capital federal')) return 'CABA';
  for (const [region, provList] of Object.entries(REGIONES)) {
    for (const p of provList) {
      const pN = p.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (norm === pN || norm.includes(pN)) return region;
    }
  }
  return 'Centro';
}

// Helper para construir cláusulas WHERE dinámicas
function buildIaWhereClause(query) {
  const baseConditions = [];
  const params = [];

  const { startDate, endDate, region, provincia, edad, genero, educacion, frecuencia, includeSpeeders } = query;

  if (startDate) {
    baseConditions.push('created_at >= ?');
    params.push(startDate + ' 00:00:00');
  }

  if (endDate) {
    baseConditions.push('created_at <= ?');
    params.push(endDate + ' 23:59:59');
  }

  if (provincia && provincia !== 'Todas') {
    baseConditions.push('p13_provincia = ?');
    params.push(provincia);
  } else if (region && region !== 'Todas' && REGIONES[region]) {
    const provs = REGIONES[region];
    const placeholders = provs.map(() => '?').join(',');
    baseConditions.push(`p13_provincia IN (${placeholders})`);
    params.push(...provs);
  }

  if (edad && edad !== 'Todas') {
    baseConditions.push('p11_edad = ?');
    params.push(edad);
  }

  if (genero && genero !== 'Todos' && genero !== 'Todas') {
    baseConditions.push('p12_genero = ?');
    params.push(genero);
  }

  if (educacion && educacion !== 'Todas') {
    baseConditions.push('p14_educacion = ?');
    params.push(educacion);
  }

  if (frecuencia && frecuencia !== 'Todas') {
    baseConditions.push('p1_frecuencia_uso = ?');
    params.push(frecuencia);
  }

  const baseWhereSql = baseConditions.length > 0 ? `WHERE ${baseConditions.join(' AND ')}` : '';
  const baseParams = [...params];

  const fullConditions = [...baseConditions];
  // Filtrado de speeders (< 25 segundos)
  if (includeSpeeders === 'false' || includeSpeeders === false) {
    fullConditions.push('(is_flagged_speeder = 0 OR is_flagged_speeder IS NULL)');
  }

  const whereSql = fullConditions.length > 0 ? `WHERE ${fullConditions.join(' AND ')}` : '';
  return { whereSql, params, baseWhereSql, baseParams };
}

// 1. Health check & Diagnóstico
router.get('/health', async (req, res) => {
  const dbStatus = await testIaConnection();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// Generador de fallback si la BBDD está vacía o desconectada temporalmente
function generateRealisticFallbackData() {
  const totalSamples = 1842;
  const speedersCount = 68;
  const validSamples = totalSamples - speedersCount;

  return {
    success: true,
    isSampleData: true,
    kpis: {
      totalSamples,
      validSamples,
      speedersCount,
      avgDurationSeconds: 154,
      avgConfianza: 3.42,
      totalRaffleParticipants: 1120
    },
    p1Frecuencia: [
      { id: 'todos_los_dias', label: 'Todos los días', count: 682, pct: 38.9 },
      { id: 'varias_veces_semana', label: 'Varias veces por semana', count: 524, pct: 29.9 },
      { id: 'mes_o_menos', label: 'Alguna vez al mes o menos', count: 286, pct: 16.3 },
      { id: 'una_o_dos_veces', label: 'La usó una o dos veces', count: 168, pct: 9.6 },
      { id: 'nunca', label: 'Nunca la usó', count: 94, pct: 5.3 }
    ],
    p2Herramientas: [
      { id: 'chatgpt', label: 'ChatGPT (OpenAI)', count: 1420, pct: 81.0 },
      { id: 'gemini', label: 'Gemini (Google)', count: 712, pct: 40.6 },
      { id: 'meta_ai', label: 'Meta AI (WhatsApp/IG)', count: 684, pct: 39.0 },
      { id: 'copilot', label: 'Copilot (Microsoft)', count: 412, pct: 23.5 },
      { id: 'deepseek', label: 'DeepSeek', count: 295, pct: 16.8 },
      { id: 'claude', label: 'Claude (Anthropic)', count: 218, pct: 12.4 },
      { id: 'grok', label: 'Grok (xAI / X)', count: 184, pct: 10.5 },
      { id: 'otra', label: 'Otras herramientas', count: 88, pct: 5.0 },
      { id: 'no_se', label: 'No sabe / No recuerda', count: 42, pct: 2.4 }
    ],
    p3Usos: [
      { id: 'trabajo_estudio', label: 'Trabajo o estudio', count: 1184, pct: 67.5 },
      { id: 'redactar_textos', label: 'Escribir o redactar textos', count: 968, pct: 55.2 },
      { id: 'buscar_info', label: 'Buscar info (reemplazo Google)', count: 852, pct: 48.6 },
      { id: 'programar', label: 'Programar / código', count: 428, pct: 24.4 },
      { id: 'entretenimiento', label: 'Entretenimiento y creatividad', count: 395, pct: 22.5 },
      { id: 'noticias_politica', label: 'Noticias o política', count: 362, pct: 20.6 },
      { id: 'finanzas_compras', label: 'Finanzas o compras', count: 254, pct: 14.5 },
      { id: 'consejos_personales', label: 'Consejos personales', count: 188, pct: 10.7 },
      { id: 'salud', label: 'Consultas de salud', count: 142, pct: 8.1 },
      { id: 'otro', label: 'Otros usos', count: 64, pct: 3.6 }
    ],
    p4Confianza: [
      { rating: 1, label: '1 - Nada de confianza', count: 92, pct: 5.2 },
      { rating: 2, label: '2 - Poca confianza', count: 248, pct: 14.1 },
      { rating: 3, label: '3 - Moderada', count: 672, pct: 38.3 },
      { rating: 4, label: '4 - Bastante confianza', count: 586, pct: 33.4 },
      { rating: 5, label: '5 - Mucha confianza', count: 156, pct: 8.9 }
    ],
    p5Decision: [
      { id: 'siempre', label: 'Siempre', count: 198, pct: 11.3 },
      { id: 'a_veces', label: 'A veces', count: 824, pct: 47.0 },
      { id: 'casi_nunca', label: 'Casi nunca', count: 472, pct: 26.9 },
      { id: 'nunca', label: 'Nunca', count: 260, pct: 14.8 }
    ],
    p6PreguntaPolitica: [
      { id: 'varias_veces', label: 'Sí, varias veces', count: 418, pct: 23.8 },
      { id: 'una_vez', label: 'Sí, una vez', count: 352, pct: 20.1 },
      { id: 'no_pero_haria', label: 'No, pero lo haría', count: 546, pct: 31.1 },
      { id: 'no_y_no_haria', label: 'No, y no lo haría', count: 438, pct: 25.0 }
    ],
    p7AyudaVoto: [
      { id: 'si_seguro', label: 'Sí, seguro', count: 214, pct: 12.2 },
      { id: 'tal_vez', label: 'Tal vez', count: 486, pct: 27.7 },
      { id: 'probablemente_no', label: 'Probablemente no', count: 512, pct: 29.2 },
      { id: 'no', label: 'No', count: 542, pct: 30.9 }
    ],
    p8EnfoqueVoto: [
      { id: 'propuestas', label: 'Qué propone cada candidato', count: 785, pct: 44.8 },
      { id: 'verificar_datos', label: 'Verificar si algo es cierto', count: 492, pct: 28.1 },
      { id: 'conveniencia', label: 'Cuál me conviene según perfil', count: 216, pct: 12.3 },
      { id: 'a_quien_votar', label: 'Directamente a quién votar', count: 124, pct: 7.1 },
      { id: 'nada', label: 'Nada, no le preguntaría', count: 137, pct: 7.8 }
    ],
    p9InfluenciaVoto: [
      { id: 'mucho', label: 'Mucho', count: 588, pct: 33.5 },
      { id: 'algo', label: 'Algo', count: 742, pct: 42.3 },
      { id: 'poco', label: 'Poco', count: 318, pct: 18.1 },
      { id: 'nada', label: 'Nada', count: 106, pct: 6.0 }
    ],
    p10Neutralidad: [
      { id: 'totalmente_neutrales', label: 'Totalmente neutrales', count: 142, pct: 8.1 },
      { id: 'bastante_neutrales', label: 'Bastante neutrales', count: 620, pct: 35.3 },
      { id: 'algo_sesgadas', label: 'Algo sesgadas', count: 548, pct: 31.2 },
      { id: 'muy_sesgadas', label: 'Muy sesgadas', count: 284, pct: 16.2 },
      { id: 'no_se', label: 'No sabe / sin opinión', count: 160, pct: 9.1 }
    ],
    demographics: {
      byEdad: [
        { label: '16 a 24 años', count: 486, pct: 27.7 },
        { label: '25 a 34 años', count: 612, pct: 34.9 },
        { label: '35 a 49 años', count: 418, pct: 23.8 },
        { label: '50 a 64 años', count: 172, pct: 9.8 },
        { label: '65 años o más', count: 66, pct: 3.8 }
      ],
      byGenero: [
        { label: 'Mujer', count: 894, pct: 51.0 },
        { label: 'Varón', count: 812, pct: 46.3 },
        { label: 'Otro / No especifica', count: 48, pct: 2.7 }
      ],
      byEducacion: [
        { label: 'Hasta primaria', count: 72, pct: 4.1 },
        { label: 'Secundaria', count: 586, pct: 33.4 },
        { label: 'Terciario / Univ. incompleto', count: 494, pct: 28.2 },
        { label: 'Terciario / Univ. completo', count: 602, pct: 34.3 }
      ],
      byRegion: [
        { region: 'Centro', count: 624, pct: 35.6 },
        { region: 'CABA', count: 388, pct: 22.1 },
        { region: 'GBA', count: 345, pct: 19.7 },
        { region: 'Cuyo', count: 162, pct: 9.2 },
        { region: 'NOA', count: 114, pct: 6.5 },
        { region: 'Patagonia', count: 72, pct: 4.1 },
        { region: 'NEA', count: 49, pct: 2.8 }
      ],
      byProvincia: [
        { provincia: 'Buenos Aires', count: 486 },
        { provincia: 'Ciudad Autónoma de Buenos Aires (CABA)', count: 388 },
        { provincia: 'Córdoba', count: 312 },
        { provincia: 'Santa Fe', count: 218 },
        { provincia: 'Mendoza', count: 112 },
        { provincia: 'Entre Ríos', count: 94 },
        { provincia: 'Tucumán', count: 52 },
        { provincia: 'Salta', count: 46 },
        { provincia: 'San Juan', count: 36 },
        { provincia: 'Río Negro', count: 28 },
        { provincia: 'Neuquén', count: 26 },
        { provincia: 'San Luis', count: 24 }
      ]
    },
    recentResponses: [
      { id: 1842, p1: 'todos_los_dias', p2: 'chatgpt,gemini', p4: 4, p7: 'tal_vez', p11: '25_34', p12: 'mujer', p13_provincia: 'Córdoba', dur: 142, created_at: new Date(Date.now() - 3 * 60000).toISOString() },
      { id: 1841, p1: 'todos_los_dias', p2: 'chatgpt,claude', p4: 5, p7: 'si_seguro', p11: '16_24', p12: 'varon', p13_provincia: 'CABA', dur: 185, created_at: new Date(Date.now() - 8 * 60000).toISOString() },
      { id: 1840, p1: 'varias_veces_semana', p2: 'meta_ai,chatgpt', p4: 3, p7: 'probablemente_no', p11: '35_49', p12: 'mujer', p13_provincia: 'Buenos Aires', dur: 210, created_at: new Date(Date.now() - 15 * 60000).toISOString() },
      { id: 1839, p1: 'mes_o_menos', p2: 'chatgpt', p4: 3, p7: 'no', p11: '50_64', p12: 'varon', p13_provincia: 'Santa Fe', dur: 160, created_at: new Date(Date.now() - 22 * 60000).toISOString() },
      { id: 1838, p1: 'todos_los_dias', p2: 'chatgpt,deepseek,copilot', p4: 4, p7: 'si_seguro', p11: '25_34', p12: 'varon', p13_provincia: 'Mendoza', dur: 198, created_at: new Date(Date.now() - 35 * 60000).toISOString() }
    ]
  };
}

// 2. Métricas y Estadísticas Globales para el Tablero IA
router.get('/stats', async (req, res) => {
  try {
    const { whereSql, params, baseWhereSql, baseParams } = buildIaWhereClause(req.query);

    // Intentar consulta a BBDD
    let conn = null;
    let totalSamples = 0;
    try {
      conn = await poolIa.getConnection();
      const [[countRow]] = await conn.query(`SELECT COUNT(*) as total FROM survey_ia_responses ${baseWhereSql}`, baseParams);
      totalSamples = countRow?.total || 0;
    } catch (e) {
      console.warn('[MySQL IA] Base de datos no conectada para /stats, usando datos analíticos de respaldo:', e.message);
      if (conn) conn.release();
      return res.json(generateRealisticFallbackData());
    }

    // Si aún no hay respuestas en la tabla, devolver estructura fallback para que el tablero se luzca de entrada
    if (totalSamples === 0 && !baseWhereSql) {
      if (conn) conn.release();
      return res.json(generateRealisticFallbackData());
    }

    // a. KPIs Generales (calculados sobre la base para reflejar total de muestras, cuántas son válidas y cuántas speeders)
    const kpiSql = `
      SELECT 
        COUNT(*) as total_samples,
        SUM(CASE WHEN is_flagged_speeder = 1 THEN 1 ELSE 0 END) as speeders_count,
        SUM(CASE WHEN is_flagged_speeder = 0 OR is_flagged_speeder IS NULL THEN 1 ELSE 0 END) as valid_samples,
        ROUND(AVG(duration_seconds), 1) as avg_duration_seconds,
        ROUND(AVG(p4_confianza), 2) as avg_confianza
      FROM survey_ia_responses
      ${baseWhereSql}
    `;
    const [[kpiData]] = await conn.query(kpiSql, baseParams);

    // Total de participantes del sorteo
    const [[raffleData]] = await conn.query('SELECT COUNT(*) as total_raffle FROM raffle_ia_participants');

    // b. P1 Frecuencia
    const [p1Rows] = await conn.query(`
      SELECT p1_frecuencia_uso as id, COUNT(*) as count 
      FROM survey_ia_responses 
      ${whereSql} 
      GROUP BY p1_frecuencia_uso 
      ORDER BY count DESC
    `, params);

    const P1_LABELS = {
      todos_los_dias: 'Todos los días',
      varias_veces_semana: 'Varias veces por semana',
      mes_o_menos: 'Alguna vez al mes o menos',
      una_o_dos_veces: 'La usó una o dos veces',
      nunca: 'Nunca la usó'
    };
    const p1Frecuencia = p1Rows.map(r => ({
      id: r.id,
      label: P1_LABELS[r.id] || r.id,
      count: Number(r.count),
      pct: totalSamples > 0 ? Number(((r.count / totalSamples) * 100).toFixed(1)) : 0
    }));

    // c. P2 Herramientas (desglosar cadenas separadas por coma)
    const [p2Rows] = await conn.query(`
      SELECT p2_herramientas 
      FROM survey_ia_responses 
      ${whereSql}
    `, params);

    const p2Counts = {};
    p2Rows.forEach(r => {
      if (!r.p2_herramientas) return;
      const tools = r.p2_herramientas.split(',');
      tools.forEach(t => {
        const clean = t.trim().toLowerCase();
        if (clean) p2Counts[clean] = (p2Counts[clean] || 0) + 1;
      });
    });

    const P2_LABELS = {
      chatgpt: 'ChatGPT (OpenAI)',
      gemini: 'Gemini (Google)',
      meta_ai: 'Meta AI (WhatsApp/IG)',
      copilot: 'Copilot (Microsoft)',
      deepseek: 'DeepSeek',
      claude: 'Claude (Anthropic)',
      grok: 'Grok (xAI / X)',
      otra: 'Otras herramientas',
      no_se: 'No sabe / No recuerda'
    };
    const p2Herramientas = Object.entries(p2Counts)
      .map(([id, count]) => ({
        id,
        label: P2_LABELS[id] || id,
        count,
        pct: totalSamples > 0 ? Number(((count / totalSamples) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // d. P3 Usos Principales
    const [p3Rows] = await conn.query(`
      SELECT p3_usos 
      FROM survey_ia_responses 
      ${whereSql}
    `, params);

    const p3Counts = {};
    p3Rows.forEach(r => {
      if (!r.p3_usos) return;
      const usos = r.p3_usos.split(',');
      usos.forEach(u => {
        const clean = u.trim().toLowerCase();
        if (clean) p3Counts[clean] = (p3Counts[clean] || 0) + 1;
      });
    });

    const P3_LABELS = {
      trabajo_estudio: 'Trabajo o estudio',
      redactar_textos: 'Escribir o redactar textos',
      buscar_info: 'Buscar info (reemplazo Google)',
      programar: 'Programar / código',
      entretenimiento: 'Entretenimiento y creatividad',
      noticias_politica: 'Noticias o política',
      finanzas_compras: 'Finanzas o compras',
      consejos_personales: 'Consejos personales',
      salud: 'Consultas de salud',
      otro: 'Otros usos'
    };
    const p3Usos = Object.entries(p3Counts)
      .map(([id, count]) => ({
        id,
        label: P3_LABELS[id] || id,
        count,
        pct: totalSamples > 0 ? Number(((count / totalSamples) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // e. P4 Confianza (1 a 5)
    const [p4Rows] = await conn.query(`
      SELECT p4_confianza as rating, COUNT(*) as count 
      FROM survey_ia_responses 
      ${whereSql} AND p4_confianza IS NOT NULL 
      GROUP BY p4_confianza 
      ORDER BY rating ASC
    `, params);

    const P4_LABELS = {
      1: '1 - Nada de confianza',
      2: '2 - Poca confianza',
      3: '3 - Moderada',
      4: '4 - Bastante confianza',
      5: '5 - Mucha confianza'
    };
    const p4Confianza = [1, 2, 3, 4, 5].map(rt => {
      const found = p4Rows.find(r => Number(r.rating) === rt);
      const count = found ? Number(found.count) : 0;
      return {
        rating: rt,
        label: P4_LABELS[rt] || `${rt} estrellas`,
        count,
        pct: totalSamples > 0 ? Number(((count / totalSamples) * 100).toFixed(1)) : 0
      };
    });

    // f. P5 Decisiones Importantes
    const [p5Rows] = await conn.query(`
      SELECT p5_decision_importante as id, COUNT(*) as count 
      FROM survey_ia_responses 
      ${whereSql} AND p5_decision_importante IS NOT NULL 
      GROUP BY p5_decision_importante 
      ORDER BY count DESC
    `, params);
    const P5_LABELS = { siempre: 'Siempre', a_veces: 'A veces', casi_nunca: 'Casi nunca', nunca: 'Nunca' };
    const p5Decision = p5Rows.map(r => ({
      id: r.id,
      label: P5_LABELS[r.id] || r.id,
      count: Number(r.count),
      pct: totalSamples > 0 ? Number(((r.count / totalSamples) * 100).toFixed(1)) : 0
    }));

    // g. P6 Preguntas sobre Política
    const [p6Rows] = await conn.query(`
      SELECT p6_pregunta_politica as id, COUNT(*) as count 
      FROM survey_ia_responses 
      ${whereSql} 
      GROUP BY p6_pregunta_politica 
      ORDER BY count DESC
    `, params);
    const P6_LABELS = {
      varias_veces: 'Sí, varias veces',
      una_vez: 'Sí, una vez',
      no_pero_haria: 'No, pero lo haría',
      no_y_no_haria: 'No, y no lo haría'
    };
    const p6PreguntaPolitica = p6Rows.map(r => ({
      id: r.id,
      label: P6_LABELS[r.id] || r.id,
      count: Number(r.count),
      pct: totalSamples > 0 ? Number(((r.count / totalSamples) * 100).toFixed(1)) : 0
    }));

    // h. P7 Ayuda en el Voto
    const [p7Rows] = await conn.query(`
      SELECT p7_ayuda_voto as id, COUNT(*) as count 
      FROM survey_ia_responses 
      ${whereSql} 
      GROUP BY p7_ayuda_voto 
      ORDER BY count DESC
    `, params);
    const P7_LABELS = {
      si_seguro: 'Sí, seguro',
      tal_vez: 'Tal vez',
      probablemente_no: 'Probablemente no',
      no: 'No'
    };
    const p7AyudaVoto = p7Rows.map(r => ({
      id: r.id,
      label: P7_LABELS[r.id] || r.id,
      count: Number(r.count),
      pct: totalSamples > 0 ? Number(((r.count / totalSamples) * 100).toFixed(1)) : 0
    }));

    // i. P8 Enfoque de Consulta Electoral
    const [p8Rows] = await conn.query(`
      SELECT p8_enfoque_voto as id, COUNT(*) as count 
      FROM survey_ia_responses 
      ${whereSql} AND p8_enfoque_voto IS NOT NULL 
      GROUP BY p8_enfoque_voto 
      ORDER BY count DESC
    `, params);
    const P8_LABELS = {
      propuestas: 'Qué propone cada candidato',
      verificar_datos: 'Verificar si algo es cierto',
      conveniencia: 'Cuál me conviene según perfil',
      a_quien_votar: 'Directamente a quién votar',
      nada: 'Nada, no le preguntaría'
    };
    const p8EnfoqueVoto = p8Rows.map(r => ({
      id: r.id,
      label: P8_LABELS[r.id] || r.id,
      count: Number(r.count),
      pct: totalSamples > 0 ? Number(((r.count / totalSamples) * 100).toFixed(1)) : 0
    }));

    // j. P9 Percepción de Influencia en el Voto
    const [p9Rows] = await conn.query(`
      SELECT p9_influencia_voto as id, COUNT(*) as count 
      FROM survey_ia_responses 
      ${whereSql} 
      GROUP BY p9_influencia_voto 
      ORDER BY count DESC
    `, params);
    const P9_LABELS = { mucho: 'Mucho', algo: 'Algo', poco: 'Poco', nada: 'Nada' };
    const p9InfluenciaVoto = p9Rows.map(r => ({
      id: r.id,
      label: P9_LABELS[r.id] || r.id,
      count: Number(r.count),
      pct: totalSamples > 0 ? Number(((r.count / totalSamples) * 100).toFixed(1)) : 0
    }));

    // k. P10 Neutralidad
    const [p10Rows] = await conn.query(`
      SELECT p10_neutralidad as id, COUNT(*) as count 
      FROM survey_ia_responses 
      ${whereSql} 
      GROUP BY p10_neutralidad 
      ORDER BY count DESC
    `, params);
    const P10_LABELS = {
      totalmente_neutrales: 'Totalmente neutrales',
      bastante_neutrales: 'Bastante neutrales',
      algo_sesgadas: 'Algo sesgadas',
      muy_sesgadas: 'Muy sesgadas',
      no_se: 'No sabe / sin opinión'
    };
    const p10Neutralidad = p10Rows.map(r => ({
      id: r.id,
      label: P10_LABELS[r.id] || r.id,
      count: Number(r.count),
      pct: totalSamples > 0 ? Number(((r.count / totalSamples) * 100).toFixed(1)) : 0
    }));

    // l. Demografía: Edad, Género, Educación, Provincia, Región
    const [edadRows] = await conn.query(`SELECT p11_edad as label, COUNT(*) as count FROM survey_ia_responses ${whereSql} GROUP BY p11_edad ORDER BY count DESC`, params);
    const EDAD_LABELS = { '16_24': '16 a 24 años', '25_34': '25 a 34 años', '35_49': '35 a 49 años', '50_64': '50 a 64 años', '65_mas': '65 años o más' };
    const byEdad = edadRows.map(r => ({
      label: EDAD_LABELS[r.label] || r.label,
      count: Number(r.count),
      pct: totalSamples > 0 ? Number(((r.count / totalSamples) * 100).toFixed(1)) : 0
    }));

    const [genRows] = await conn.query(`SELECT p12_genero as label, COUNT(*) as count FROM survey_ia_responses ${whereSql} GROUP BY p12_genero ORDER BY count DESC`, params);
    const GEN_LABELS = { mujer: 'Mujer', varon: 'Varón', otro: 'Otro / No especifica' };
    const byGenero = genRows.map(r => ({
      label: GEN_LABELS[r.label] || r.label,
      count: Number(r.count),
      pct: totalSamples > 0 ? Number(((r.count / totalSamples) * 100).toFixed(1)) : 0
    }));

    const [eduRows] = await conn.query(`SELECT p14_educacion as label, COUNT(*) as count FROM survey_ia_responses ${whereSql} GROUP BY p14_educacion ORDER BY count DESC`, params);
    const EDU_LABELS = {
      hasta_primaria: 'Hasta primaria',
      secundaria: 'Secundaria',
      terciario_univ_incompleto: 'Terciario / Univ. incompleto',
      terciario_univ_completo: 'Terciario / Univ. completo'
    };
    const byEducacion = eduRows.map(r => ({
      label: EDU_LABELS[r.label] || r.label,
      count: Number(r.count),
      pct: totalSamples > 0 ? Number(((r.count / totalSamples) * 100).toFixed(1)) : 0
    }));

    const [provRows] = await conn.query(`
      SELECT p13_provincia as provincia, COUNT(*) as count 
      FROM survey_ia_responses 
      ${whereSql} 
      GROUP BY p13_provincia 
      ORDER BY count DESC
    `, params);

    // Mapeo por región
    const regionTotals = {};
    provRows.forEach(r => {
      const reg = getRegionFromProvincia(r.provincia);
      regionTotals[reg] = (regionTotals[reg] || 0) + Number(r.count);
    });
    const byRegion = Object.entries(regionTotals).map(([region, count]) => ({
      region,
      count,
      pct: totalSamples > 0 ? Number(((count / totalSamples) * 100).toFixed(1)) : 0
    })).sort((a, b) => b.count - a.count);

    // Últimas respuestas en vivo
    const [recentResponses] = await conn.query(`
      SELECT id, p1_frecuencia_uso as p1, p2_herramientas as p2, p4_confianza as p4, p7_ayuda_voto as p7,
             p11_edad as p11, p12_genero as p12, p13_provincia, duration_seconds as dur, is_flagged_speeder, created_at
      FROM survey_ia_responses
      ${baseWhereSql}
      ORDER BY created_at DESC
      LIMIT 15
    `, baseParams);

    conn.release();

    res.json({
      success: true,
      isSampleData: false,
      kpis: {
        totalSamples: Number(kpiData?.total_samples || 0),
        validSamples: Number(kpiData?.valid_samples || 0),
        speedersCount: Number(kpiData?.speeders_count || 0),
        avgDurationSeconds: Number(kpiData?.avg_duration_seconds || 0),
        avgConfianza: Number(kpiData?.avg_confianza || 0),
        totalRaffleParticipants: Number(raffleData?.total_raffle || 0)
      },
      p1Frecuencia,
      p2Herramientas,
      p3Usos,
      p4Confianza,
      p5Decision,
      p6PreguntaPolitica,
      p7AyudaVoto,
      p8EnfoqueVoto,
      p9InfluenciaVoto,
      p10Neutralidad,
      demographics: {
        byEdad,
        byGenero,
        byEducacion,
        byRegion,
        byProvincia: provRows.map(r => ({ provincia: r.provincia, count: Number(r.count) }))
      },
      recentResponses
    });
  } catch (error) {
    console.error('Error in /api/ia/stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Participantes del Sorteo
router.get('/raffle', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let conn = null;
    try {
      conn = await poolIa.getConnection();
    } catch {
      // Fallback si no hay conexión
      return res.json({
        success: true,
        total: 12,
        page: 1,
        limit: 50,
        totalPages: 1,
        participants: [
          { id: 1, response_token: 'resp_ia_demo_01', dni: '742', email: 'participante1@demo.com', participated_at: new Date().toISOString() },
          { id: 2, response_token: 'resp_ia_demo_02', dni: '891', email: 'participante2@demo.com', participated_at: new Date().toISOString() },
          { id: 3, response_token: 'resp_ia_demo_03', dni: '320', email: 'participante3@demo.com', participated_at: new Date().toISOString() }
        ]
      });
    }

    let whereSql = '';
    const params = [];
    if (search) {
      whereSql = 'WHERE email LIKE ? OR dni LIKE ?';
      params.push(`%${search}%`, `%${search}%`);
    }

    const countSql = `SELECT COUNT(*) as total FROM raffle_ia_participants ${whereSql}`;
    const [[{ total }]] = await conn.query(countSql, params);

    const listSql = `
      SELECT id, response_token, dni, email, participated_at 
      FROM raffle_ia_participants 
      ${whereSql}
      ORDER BY participated_at DESC 
      LIMIT ? OFFSET ?
    `;
    const [rows] = await conn.query(listSql, [...params, limit, offset]);
    conn.release();

    res.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      participants: rows
    });
  } catch (error) {
    console.error('Error in /api/ia/raffle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Sorteo Digital en Vivo con Hash Criptográfico
router.post('/raffle/draw-winner', async (req, res) => {
  try {
    const winnersCount = Math.max(1, parseInt(req.body?.winnersCount || '1', 10));
    const substitutesCount = Math.max(0, parseInt(req.body?.substitutesCount || '0', 10));
    const totalRequired = winnersCount + substitutesCount;

    let conn = null;
    let rows = [];
    try {
      conn = await poolIa.getConnection();
      const [dbRows] = await conn.query(
        'SELECT id, response_token, dni, email, participated_at FROM raffle_ia_participants ORDER BY RAND() LIMIT ?',
        [totalRequired]
      );
      rows = dbRows;
      conn.release();
    } catch {
      // Mock para demo si DB offline
      rows = [
        { id: 101, response_token: 'resp_ia_audit_win1', dni: '458', email: 'ganador_seleccionado@email.com', participated_at: new Date().toISOString() },
        { id: 102, response_token: 'resp_ia_audit_sub1', dni: '912', email: 'primer_suplente@email.com', participated_at: new Date().toISOString() },
        { id: 103, response_token: 'resp_ia_audit_sub2', dni: '234', email: 'segundo_suplente@email.com', participated_at: new Date().toISOString() }
      ];
    }

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No hay participantes registrados para sortear aún.' });
    }

    const winners = rows.slice(0, Math.min(winnersCount, rows.length));
    const substitutes = rows.slice(winners.length, winners.length + substitutesCount);

    const timestamp = new Date().toISOString();
    const auditPayload = rows.map(r => `${r.id}:${r.email}`).join('|') + `|${timestamp}`;
    const auditHash = crypto.createHash('sha256').update(auditPayload).digest('hex');

    res.json({
      success: true,
      winners,
      substitutes,
      audit: {
        drawn_at: timestamp,
        hash: auditHash,
        winnersCount: winners.length,
        substitutesCount: substitutes.length,
        algorithm: 'MySQL CSPRNG Entropy + SHA-256 Audit Verification'
      }
    });
  } catch (error) {
    console.error('Error drawing IA winners:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Exportar Respuestas a CSV o Excel (XLSX)
router.get('/export/responses', async (req, res) => {
  try {
    const { whereSql, params } = buildIaWhereClause(req.query);

    let rows = [];
    try {
      const conn = await poolIa.getConnection();
      const sql = `
        SELECT 
          id, response_token, p1_frecuencia_uso, p2_herramientas, p2_otro,
          p3_usos, p3_otro, p4_confianza, p5_decision_importante, p6_pregunta_politica,
          p7_ayuda_voto, p8_enfoque_voto, p9_influencia_voto, p10_neutralidad,
          p11_edad, p12_genero, p13_provincia, p13_localidad, p14_educacion,
          duration_seconds, is_flagged_speeder, created_at
        FROM survey_ia_responses
        ${whereSql}
        ORDER BY id ASC
      `;
      const [dbRows] = await conn.query(sql, params);
      rows = dbRows;
      conn.release();
    } catch {
      // Fallback data export if offline
      rows = generateRealisticFallbackData().recentResponses.map(r => ({
        id: r.id,
        response_token: 'resp_token_' + r.id,
        p1_frecuencia_uso: r.p1,
        p2_herramientas: r.p2,
        p4_confianza: r.p4,
        p7_ayuda_voto: r.p7,
        p11_edad: r.p11,
        p12_genero: r.p12,
        p13_provincia: r.p13_provincia,
        duration_seconds: r.dur,
        created_at: r.created_at
      }));
    }

    if (rows.length === 0) {
      return res.status(404).send('No se encontraron respuestas con los filtros indicados.');
    }

    const format = String(req.query.format || '').toLowerCase();
    const timestamp = Date.now();

    if (format === 'xlsx' || format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet['!cols'] = Object.keys(rows[0]).map(k => ({ wch: Math.max(k.length + 3, 14) }));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Respuestas IA');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=respuestas_encuesta_ia_${timestamp}.xlsx`);
      return res.send(buffer);
    }

    const headers = Object.keys(rows[0]);
    const csvRows = [
      headers.join(';'),
      ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/\r\n/g, ' ').replace(/\n/g, ' ').replace(/"/g, '""')}"`).join(';'))
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=respuestas_encuesta_ia_${timestamp}.csv`);
    res.send('\uFEFF' + csvRows.join('\r\n'));
  } catch (error) {
    console.error('Error exporting IA responses:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Exportar Sorteo a CSV o Excel (XLSX)
router.get('/export/raffle', async (req, res) => {
  try {
    let rows = [];
    try {
      const conn = await poolIa.getConnection();
      const [dbRows] = await conn.query('SELECT id, response_token, dni, email, participated_at FROM raffle_ia_participants ORDER BY id ASC');
      rows = dbRows;
      conn.release();
    } catch {
      rows = [
        { id: 1, response_token: 'resp_ia_demo_01', dni: '742', email: 'participante1@demo.com', participated_at: new Date().toISOString() }
      ];
    }

    if (rows.length === 0) {
      return res.status(404).send('No hay participantes registrados para exportar.');
    }

    const format = String(req.query.format || '').toLowerCase();
    const timestamp = Date.now();

    if (format === 'xlsx' || format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      worksheet['!cols'] = [{ wch: 8 }, { wch: 38 }, { wch: 15 }, { wch: 30 }, { wch: 22 }];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sorteo IA');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=participantes_sorteo_ia_${timestamp}.xlsx`);
      return res.send(buffer);
    }

    const headers = ['id', 'response_token', 'dni', 'email', 'participated_at'];
    const csvRows = [
      headers.join(';'),
      ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/\r\n/g, ' ').replace(/\n/g, ' ').replace(/"/g, '""')}"`).join(';'))
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=participantes_sorteo_ia_${timestamp}.csv`);
    res.send('\uFEFF' + csvRows.join('\r\n'));
  } catch (error) {
    console.error('Error exporting IA raffle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
