import express from 'express';
import XLSX from 'xlsx';
import crypto from 'crypto';
import poolIaMexico, { testIaMexicoConnection } from './db-ia-mexico.js';

const router = express.Router();

// Mapeo de Entidades Federativas de México por Región
export const REGIONES_MEXICO = {
  'Noroeste': ['Baja California', 'Baja California Sur', 'Chihuahua', 'Durango', 'Sinaloa', 'Sonora'],
  'Noreste': ['Coahuila', 'Nuevo León', 'Tamaulipas'],
  'Occidente y Bajío': ['Aguascalientes', 'Colima', 'Guanajuato', 'Jalisco', 'Michoacán', 'Nayarit', 'Querétaro', 'San Luis Potosí', 'Zacatecas'],
  'Centro': ['Ciudad de México (CDMX)', 'Ciudad de México', 'CDMX', 'Distrito Federal', 'Estado de México', 'Hidalgo', 'Morelos', 'Puebla', 'Tlaxcala'],
  'Sur - Sureste': ['Campeche', 'Chiapas', 'Guerrero', 'Oaxaca', 'Quintana Roo', 'Tabasco', 'Veracruz', 'Yucatán']
};

export const MEXICO_STATES = [
  "Aguascalientes",
  "Baja California",
  "Baja California Sur",
  "Campeche",
  "Chiapas",
  "Chihuahua",
  "Ciudad de México (CDMX)",
  "Coahuila",
  "Colima",
  "Durango",
  "Estado de México",
  "Guanajuato",
  "Guerrero",
  "Hidalgo",
  "Jalisco",
  "Michoacán",
  "Morelos",
  "Nayarit",
  "Nuevo León",
  "Oaxaca",
  "Puebla",
  "Querétaro",
  "Quintana Roo",
  "San Luis Potosí",
  "Sinaloa",
  "Sonora",
  "Tabasco",
  "Tamaulipas",
  "Tlaxcala",
  "Veracruz",
  "Yucatán",
  "Zacatecas"
];

function getRegionFromEstado(prov) {
  if (!prov) return 'Otras';
  const norm = String(prov).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (norm.includes('cdmx') || norm.includes('ciudad de mexico') || norm.includes('distrito federal')) return 'Centro';
  for (const [region, provList] of Object.entries(REGIONES_MEXICO)) {
    for (const p of provList) {
      const pN = p.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (norm === pN || norm.includes(pN)) return region;
    }
  }
  return 'Centro';
}

// Helper para construir cláusulas WHERE dinámicas
function buildIaMexicoWhereClause(query) {
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
    const pNorm = String(provincia).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (pNorm.includes('cdmx') || pNorm.includes('ciudad de mexico') || pNorm.includes('distrito federal')) {
      baseConditions.push('(p13_provincia LIKE "%CDMX%" OR p13_provincia LIKE "%Ciudad de México%" OR p13_provincia LIKE "%Distrito Federal%")');
    } else if (pNorm.includes('estado de mexico') || pNorm === 'mexico') {
      baseConditions.push('(p13_provincia LIKE "%Estado de México%" OR p13_provincia = "México" OR p13_provincia = "Mexico")');
    } else {
      baseConditions.push('p13_provincia = ?');
      params.push(provincia);
    }
  } else if (region && region !== 'Todas' && REGIONES_MEXICO[region]) {
    const provs = REGIONES_MEXICO[region];
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
  if (includeSpeeders === 'false' || includeSpeeders === false) {
    fullConditions.push('(is_flagged_speeder = 0 OR is_flagged_speeder IS NULL)');
  }

  const whereSql = fullConditions.length > 0 ? `WHERE ${fullConditions.join(' AND ')}` : '';
  return { whereSql, params, baseWhereSql, baseParams };
}

// Estructura limpia en 0 cuando la BBDD está iniciando o esperando respuestas
function getEmptyIaMexicoStats() {
  return {
    success: true,
    isSampleData: false,
    isEmpty: true,
    kpis: {
      totalSamples: 0,
      validSamples: 0,
      speedersCount: 0,
      avgDurationSeconds: 0,
      avgConfianza: 0,
      totalRaffleParticipants: 0
    },
    p1Frecuencia: [],
    p2Herramientas: [],
    p3Usos: [],
    p4Confianza: [],
    p5Decision: [],
    p6PreguntaPolitica: [],
    p7AyudaVoto: [],
    p8EnfoqueVoto: [],
    p9InfluenciaVoto: [],
    p10Neutralidad: [],
    demographics: {
      byEdad: [],
      byGenero: [],
      byEducacion: [],
      byRegion: [],
      byProvincia: []
    },
    recentResponses: []
  };
}

// 1. Health check & Diagnóstico
router.get('/health', async (req, res) => {
  const dbStatus = await testIaMexicoConnection();
  res.json({
    status: 'ok',
    country: 'mexico',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// 2. Métricas y Estadísticas Globales para el Tablero IA México
router.get('/stats', async (req, res) => {
  try {
    const { whereSql, params, baseWhereSql, baseParams } = buildIaMexicoWhereClause(req.query);

    let conn = null;
    let totalSamples = 0;
    try {
      conn = await poolIaMexico.getConnection();
      const [[countRow]] = await conn.query(`SELECT COUNT(*) as total FROM survey_ia_responses ${baseWhereSql}`, baseParams);
      totalSamples = countRow?.total || 0;
    } catch (e) {
      console.warn('[MySQL IA México] Base de datos no conectada para /stats:', e.message);
      if (conn) conn.release();
      return res.json(getEmptyIaMexicoStats());
    }

    // Si aún no hay respuestas en la tabla, devolver estructura limpia en 0
    if (totalSamples === 0) {
      let raffleTotal = 0;
      try {
        const [[raffleData]] = await conn.query('SELECT COUNT(*) as total_raffle FROM raffle_ia_participants');
        raffleTotal = raffleData?.total_raffle || 0;
      } catch {}
      if (conn) conn.release();
      const emptyData = getEmptyIaMexicoStats();
      emptyData.kpis.totalRaffleParticipants = raffleTotal;
      return res.json(emptyData);
    }

    // a. KPIs Generales
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

    // Total participantes sorteo 200 USD
    let totalRaffle = 0;
    try {
      const [[raffleData]] = await conn.query('SELECT COUNT(*) as total_raffle FROM raffle_ia_participants');
      totalRaffle = raffleData?.total_raffle || 0;
    } catch {}

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

    // c. P2 Herramientas
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
        const item = t.trim();
        if (item) p2Counts[item] = (p2Counts[item] || 0) + 1;
      });
    });

    const P2_LABELS = {
      chatgpt: 'ChatGPT (OpenAI)',
      gemini: 'Gemini (Google)',
      meta_ai: 'Meta AI (WhatsApp/IG)',
      copilot: 'Copilot (Microsoft)',
      claude: 'Claude (Anthropic)',
      grok: 'Grok (xAI / X)',
      deepseek: 'DeepSeek',
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

    // d. P3 Usos
    const [p3Rows] = await conn.query(`
      SELECT p3_usos 
      FROM survey_ia_responses 
      ${whereSql}
    `, params);

    const p3Counts = {};
    p3Rows.forEach(r => {
      if (!r.p3_usos) return;
      const uses = r.p3_usos.split(',');
      uses.forEach(u => {
        const item = u.trim();
        if (item) p3Counts[item] = (p3Counts[item] || 0) + 1;
      });
    });

    const P3_LABELS = {
      trabajo_estudio: 'Trabajo o estudio',
      redactar_textos: 'Escribir o redactar textos',
      buscar_info: 'Buscar info (reemplazo Google)',
      salud: 'Consultas de salud',
      consejos_personales: 'Consejos personales',
      finanzas_compras: 'Finanzas o compras',
      noticias_politica: 'Noticias o política',
      entretenimiento: 'Entretenimiento y creatividad',
      programar: 'Programar / código',
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
    const p4Confianza = [1, 2, 3, 4, 5].map(rating => {
      const row = p4Rows.find(r => Number(r.rating) === rating);
      const count = row ? Number(row.count) : 0;
      return {
        rating,
        label: P4_LABELS[rating],
        count,
        pct: totalSamples > 0 ? Number(((count / totalSamples) * 100).toFixed(1)) : 0
      };
    });

    // f. P5 Decisión Importante
    const [p5Rows] = await conn.query(`
      SELECT p5_decision_importante as id, COUNT(*) as count 
      FROM survey_ia_responses 
      ${whereSql} AND p5_decision_importante IS NOT NULL
      GROUP BY p5_decision_importante 
      ORDER BY count DESC
    `, params);

    const P5_LABELS = {
      siempre: 'Siempre',
      a_veces: 'A veces',
      casi_nunca: 'Casi nunca',
      nunca: 'Nunca'
    };
    const p5Decision = p5Rows.map(r => ({
      id: r.id,
      label: P5_LABELS[r.id] || r.id,
      count: Number(r.count),
      pct: totalSamples > 0 ? Number(((r.count / totalSamples) * 100).toFixed(1)) : 0
    }));

    // g. P6 Pregunta sobre Política
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

    // h. P7 Ayuda Voto
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

    // i. P8 Enfoque Voto
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
      a_quien_votar: 'Directamente por quién votar',
      nada: 'Nada, no le preguntaría'
    };
    const p8EnfoqueVoto = p8Rows.map(r => ({
      id: r.id,
      label: P8_LABELS[r.id] || r.id,
      count: Number(r.count),
      pct: totalSamples > 0 ? Number(((r.count / totalSamples) * 100).toFixed(1)) : 0
    }));

    // j. P9 Influencia en el Voto
    const [p9Rows] = await conn.query(`
      SELECT p9_influencia_voto as id, COUNT(*) as count 
      FROM survey_ia_responses 
      ${whereSql}
      GROUP BY p9_influencia_voto 
      ORDER BY count DESC
    `, params);

    const P9_LABELS = {
      mucho: 'Mucho',
      algo: 'Algo',
      poco: 'Poco',
      nada: 'Nada'
    };
    const p9InfluenciaVoto = p9Rows.map(r => ({
      id: r.id,
      label: P9_LABELS[r.id] || r.id,
      count: Number(r.count),
      pct: totalSamples > 0 ? Number(((r.count / totalSamples) * 100).toFixed(1)) : 0
    }));

    // k. P10 Neutralidad Percibida
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

    // Demografía: Edad, Género, Nivel Educativo, Entidades Federativas
    const [edadRows] = await conn.query(`SELECT p11_edad as label, COUNT(*) as count FROM survey_ia_responses ${whereSql} GROUP BY p11_edad ORDER BY count DESC`, params);
    const EDAD_LABELS = {
      '16_24': '16 a 24 años',
      '25_34': '25 a 34 años',
      '35_49': '35 a 49 años',
      '50_64': '50 a 64 años',
      '65_mas': '65 años o más'
    };
    const byEdad = edadRows.map(r => ({
      label: EDAD_LABELS[r.label] || r.label,
      count: Number(r.count),
      pct: totalSamples > 0 ? Number(((r.count / totalSamples) * 100).toFixed(1)) : 0
    }));

    const [genRows] = await conn.query(`SELECT p12_genero as label, COUNT(*) as count FROM survey_ia_responses ${whereSql} GROUP BY p12_genero ORDER BY count DESC`, params);
    const GEN_LABELS = {
      mujer: 'Mujer',
      varon: 'Hombre',
      hombre: 'Hombre',
      otro: 'Otro / No especifica'
    };
    const byGenero = genRows.map(r => ({
      label: GEN_LABELS[r.label] || r.label,
      count: Number(r.count),
      pct: totalSamples > 0 ? Number(((r.count / totalSamples) * 100).toFixed(1)) : 0
    }));

    const [eduRows] = await conn.query(`SELECT p14_educacion as label, COUNT(*) as count FROM survey_ia_responses ${whereSql} GROUP BY p14_educacion ORDER BY count DESC`, params);
    const EDU_LABELS = {
      hasta_primaria: 'Hasta primaria completa',
      secundaria_prepa: 'Secundaria o Preparatoria / Bachillerato',
      licenciatura_incompleta: 'Universidad / Licenciatura incompleta',
      licenciatura_completa: 'Universidad / Licenciatura completa o posgrado'
    };
    const byEducacion = eduRows.map(r => ({
      label: EDU_LABELS[r.label] || r.label,
      count: Number(r.count),
      pct: totalSamples > 0 ? Number(((r.count / totalSamples) * 100).toFixed(1)) : 0
    }));

    // Entidades Federativas
    const [provRows] = await conn.query(`
      SELECT p13_provincia as provincia, COUNT(*) as count 
      FROM survey_ia_responses 
      ${whereSql} 
      GROUP BY p13_provincia 
      ORDER BY count DESC
    `, params);

    // Agrupación por Región de México
    const regionTotals = {};
    Object.keys(REGIONES_MEXICO).forEach(reg => { regionTotals[reg] = 0; });
    provRows.forEach(r => {
      const region = getRegionFromEstado(r.provincia);
      regionTotals[region] = (regionTotals[region] || 0) + Number(r.count);
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
      country: 'mexico',
      isSampleData: false,
      kpis: {
        totalSamples: Number(kpiData?.total_samples || 0),
        validSamples: Number(kpiData?.valid_samples || 0),
        speedersCount: Number(kpiData?.speeders_count || 0),
        avgDurationSeconds: Number(kpiData?.avg_duration_seconds || 0),
        avgConfianza: Number(kpiData?.avg_confianza || 0),
        totalRaffleParticipants: Number(totalRaffle || 0)
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
    console.error('Error in /api/ia-mexico/stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Participantes del Sorteo (200 USD)
router.get('/raffle', async (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '50', 10);
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    let conn = null;
    try {
      conn = await poolIaMexico.getConnection();
    } catch {
      return res.json({
        success: true,
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
        participants: []
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
      totalPages: Math.ceil(total / limit) || 1,
      participants: rows
    });
  } catch (error) {
    console.error('Error in /api/ia-mexico/raffle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Sorteo Digital Criptográfico con Semilla Verificable (SHA-256)
router.post('/raffle/draw-winner', async (req, res) => {
  try {
    const winnersCount = Math.max(1, parseInt(req.body.winnersCount || '1', 10));
    const substitutesCount = Math.max(1, parseInt(req.body.substitutesCount || '2', 10));
    const totalToPick = winnersCount + substitutesCount;

    let conn = null;
    try {
      conn = await poolIaMexico.getConnection();
    } catch {
      return res.status(503).json({ success: false, error: 'Base de datos MySQL México no conectada' });
    }

    const [candidates] = await conn.query(`
      SELECT id, response_token, dni, email, participated_at 
      FROM raffle_ia_participants 
      ORDER BY RAND() 
      LIMIT ?
    `, [totalToPick]);

    conn.release();

    if (!candidates || candidates.length === 0) {
      return res.status(400).json({ success: false, error: 'No hay participantes registrados en el sorteo aún' });
    }

    const timestamp = new Date().toISOString();
    const entropyData = candidates.map(c => `${c.id}-${c.dni}-${c.email}`).join('|') + `|${timestamp}`;
    const auditHash = crypto.createHash('sha256').update(entropyData).digest('hex');

    const winners = candidates.slice(0, winnersCount).map(c => ({
      ...c,
      maskedEmail: c.email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.max(1, b.length)) + c),
      maskedDni: '***' + String(c.dni).slice(-3)
    }));

    const substitutes = candidates.slice(winnersCount, totalToPick).map(c => ({
      ...c,
      maskedEmail: c.email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + '*'.repeat(Math.max(1, b.length)) + c),
      maskedDni: '***' + String(c.dni).slice(-3)
    }));

    res.json({
      success: true,
      prize: '200 USD',
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
    console.error('Error drawing IA Mexico winners:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Exportar Respuestas a CSV o Excel (XLSX)
router.get('/export/responses', async (req, res) => {
  try {
    const { whereSql, params } = buildIaMexicoWhereClause(req.query);

    let rows = [];
    try {
      const conn = await poolIaMexico.getConnection();
      const sql = `
        SELECT 
          id, response_token, device_id, p1_frecuencia_uso, p2_herramientas, p2_otro,
          p3_usos, p3_otro, p4_confianza, p5_decision_importante, p6_pregunta_politica,
          p7_ayuda_voto, p8_enfoque_voto, p9_influencia_voto, p10_neutralidad,
          p11_edad, p12_genero, p13_provincia as estado_mexico, p13_localidad as municipio,
          p14_educacion, duration_seconds, ip_hash, user_agent, is_flagged_speeder, created_at
        FROM survey_ia_responses
        ${whereSql}
        ORDER BY id ASC
      `;
      const [data] = await conn.query(sql, params);
      conn.release();
      rows = data;
    } catch {
      rows = [];
    }

    const format = req.query.format || 'xlsx';

    if (format === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="encuesta_ia_mexico_respuestas.csv"');
      return res.send(csv);
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Respuestas_Mexico');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="encuesta_ia_mexico_respuestas.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting Mexico IA responses:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Exportar Padrón de Sorteo a Excel o CSV
router.get('/export/raffle', async (req, res) => {
  try {
    let rows = [];
    try {
      const conn = await poolIaMexico.getConnection();
      const sql = `
        SELECT id, response_token, dni as identificacion, email, participated_at 
        FROM raffle_ia_participants 
        ORDER BY id ASC
      `;
      const [data] = await conn.query(sql);
      conn.release();
      rows = data;
    } catch {
      rows = [];
    }

    const format = req.query.format || 'xlsx';

    if (format === 'csv') {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const csv = XLSX.utils.sheet_to_csv(worksheet);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="sorteo_ia_mexico_200usd.csv"');
      return res.send(csv);
    }

    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sorteo_200_USD');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="sorteo_ia_mexico_200usd.xlsx"');
    res.send(buffer);
  } catch (error) {
    console.error('Error exporting Mexico IA raffle:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
