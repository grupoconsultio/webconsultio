import express from 'express';
import XLSX from 'xlsx';
import crypto from 'crypto';
import dbSanLuis, { testSanLuisConnection } from './db-sanluis.js';

const router = express.Router();

function buildSanLuisWhere(query) {
  const conditions = [];
  const params = [];

  const { startDate, endDate, departamento, localidad, genero, edad, laboral, includeSpeeders } = query;

  if (startDate) {
    params.push(startDate + ' 00:00:00');
    conditions.push(`created_at >= $${params.length}`);
  }

  if (endDate) {
    params.push(endDate + ' 23:59:59');
    conditions.push(`created_at <= $${params.length}`);
  }

  if (departamento && departamento !== 'Todos' && departamento !== 'Todas') {
    params.push(departamento);
    conditions.push(`departamento = $${params.length}`);
  }

  if (localidad && localidad !== 'Todas' && localidad !== 'Todos') {
    params.push(localidad);
    conditions.push(`localidad = $${params.length}`);
  }

  if (genero && genero !== 'Todos' && genero !== 'Todas') {
    params.push(genero);
    conditions.push(`genero = $${params.length}`);
  }

  if (edad && edad !== 'Todas' && edad !== 'Todos') {
    params.push(edad);
    conditions.push(`edad = $${params.length}`);
  }

  if (laboral && laboral !== 'Todas' && laboral !== 'Todos') {
    params.push(laboral);
    conditions.push(`laboral = $${params.length}`);
  }

  if (includeSpeeders === 'false' || includeSpeeders === false) {
    conditions.push('(is_flagged_speeder = FALSE OR is_flagged_speeder IS NULL)');
  }

  const whereSql = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { whereSql, params };
}

// 1. Health check
router.get('/health', async (req, res) => {
  const dbStatus = await testSanLuisConnection();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbStatus
  });
});

// 2. Estadísticas y métricas completas para el Dashboard
router.get('/stats', async (req, res) => {
  try {
    const { whereSql, params } = buildSanLuisWhere(req.query);

    // a. KPIs
    const kpiSql = `
      SELECT 
        COUNT(*) as total_samples,
        SUM(CASE WHEN is_flagged_speeder = TRUE THEN 1 ELSE 0 END) as speeders_count,
        SUM(CASE WHEN is_flagged_speeder = FALSE OR is_flagged_speeder IS NULL THEN 1 ELSE 0 END) as valid_samples,
        ROUND(AVG(dur_s), 1) as avg_duration_seconds
      FROM survey_responses_sanluis
      ${whereSql}
    `;
    const kpiRes = await dbSanLuis.query(kpiSql, params);
    const kpiData = kpiRes.rows[0] || {};

    let totalRaffle = 0;
    try {
      const raffleRes = await dbSanLuis.query('SELECT COUNT(*) as total_raffle FROM raffle_participants_sanluis');
      totalRaffle = parseInt(raffleRes.rows[0]?.total_raffle || 0, 10);
    } catch {
      // ignore
    }

    // Helper genérico para distribuciones categóricas
    const getDistribution = async (col, labelMap = {}) => {
      const sql = `
        SELECT ${col} as val, COUNT(*) as count
        FROM survey_responses_sanluis
        ${whereSql ? `${whereSql} AND ${col} IS NOT NULL AND ${col} != ''` : `WHERE ${col} IS NOT NULL AND ${col} != ''`}
        GROUP BY ${col}
        ORDER BY count DESC
      `;
      const result = await dbSanLuis.query(sql, params);
      const total = result.rows.reduce((acc, curr) => acc + parseInt(curr.count, 10), 0) || 1;
      return result.rows.map(r => ({
        key: r.val,
        label: labelMap[r.val] || r.val,
        count: parseInt(r.count, 10),
        pct: Math.round((parseInt(r.count, 10) / total) * 100)
      }));
    };

    // P1: Rumbo
    const p1Rumbo = await getDistribution('p1');

    // P2: Problema principal
    const p2Problema = await getDistribution('p2');

    // P3: Situación económica
    const p3Economia = await getDistribution('p3');

    // P4: Gestión Poggi
    const p4GestionPoggi = await getDistribution('p4');

    // P5: Imagen de Dirigentes
    const dirigentes = [
      { key: 'p5_poggi', name: 'Claudio Poggi', cargo: 'Gobernador de San Luis' },
      { key: 'p5_alberto', name: 'Alberto Rodríguez Saá', cargo: 'Ex Gobernador' },
      { key: 'p5_adolfo', name: 'Adolfo Rodríguez Saá', cargo: 'Ex Gobernador' },
      { key: 'p5_frontera', name: 'Maximiliano Frontera', cargo: 'Intendente Villa Mercedes' },
      { key: 'p5_abdala', name: 'Bartolomé Abdala', cargo: 'Presidente Provisional Senado' }
    ];

    const imagenDirigentes = await Promise.all(dirigentes.map(async (d) => {
      const sql = `
        SELECT ${d.key} as opinion, COUNT(*) as count
        FROM survey_responses_sanluis
        ${whereSql ? `${whereSql} AND ${d.key} IS NOT NULL AND ${d.key} != ''` : `WHERE ${d.key} IS NOT NULL AND ${d.key} != ''`}
        GROUP BY ${d.key}
      `;
      const resOpinion = await dbSanLuis.query(sql, params);
      const total = resOpinion.rows.reduce((acc, curr) => acc + parseInt(curr.count, 10), 0) || 1;

      const getPct = (val) => {
        const found = resOpinion.rows.find(r => r.opinion === val);
        return found ? Math.round((parseInt(found.count, 10) / total) * 100) : 0;
      };

      const positiva = getPct('Positiva');
      const negativa = getPct('Negativa');
      const regular = getPct('Lo conozco pero no tengo opinión');
      const noConoce = getPct('No lo conozco');
      const neto = positiva - negativa;

      return {
        key: d.key,
        name: d.name,
        cargo: d.cargo,
        positiva,
        negativa,
        regular,
        noConoce,
        neto,
        totalEvaluaciones: total
      };
    }));

    // P6: Intención de voto gobernador
    const p6Voto = await getDistribution('p6');

    // P7: Preferencia próximo gobierno
    const p7Rumbo = await getDistribution('p7');

    // P8: Ciclo Rodríguez Saá vs Mirar adelante
    const p8Frase = await getDistribution('p8');

    // P9: Gestión Milei
    const p9GestionMilei = await getDistribution('p9');

    // P10: Escenario Poggi + Frontera
    const p10Formula = await getDistribution('p10');

    // P11: Cualidad gobernador
    const p11Cualidad = await getDistribution('p11');

    // P12: Prioridad local
    const p12Prioridad = await getDistribution('p12');

    // Demografía
    const byGenero = await getDistribution('genero');
    const byEdad = await getDistribution('edad');
    const byLaboral = await getDistribution('laboral');
    const byDepartamento = await getDistribution('departamento');
    const byLocalidad = await getDistribution('localidad');

    res.json({
      success: true,
      kpis: {
        totalSamples: parseInt(kpiData.total_samples || 0, 10),
        validSamples: parseInt(kpiData.valid_samples || 0, 10),
        speedersCount: parseInt(kpiData.speeders_count || 0, 10),
        avgDurationSeconds: parseFloat(kpiData.avg_duration_seconds || 0),
        totalRaffleParticipants: totalRaffle
      },
      p1Rumbo,
      p2Problema,
      p3Economia,
      p4GestionPoggi,
      imagenDirigentes,
      p6Voto,
      p7Rumbo,
      p8Frase,
      p9GestionMilei,
      p10Formula,
      p11Cualidad,
      p12Prioridad,
      demographics: {
        byGenero,
        byEdad,
        byLaboral,
        byDepartamento,
        byLocalidad: byLocalidad.slice(0, 15)
      }
    });
  } catch (error) {
    console.error('[San Luis Stats Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Participantes del Sorteo
router.get('/raffle', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '50', 10)));
    const offset = (page - 1) * limit;
    const search = req.query.search ? `%${req.query.search.trim()}%` : null;

    let countSql = 'SELECT COUNT(*) as total FROM raffle_participants_sanluis';
    let dataSql = 'SELECT id, contacto, tipo, fecha, created_at FROM raffle_participants_sanluis';
    const params = [];

    if (search) {
      params.push(search);
      countSql += ' WHERE contacto ILIKE $1';
      dataSql += ' WHERE contacto ILIKE $1';
    }

    dataSql += ` ORDER BY id DESC LIMIT ${limit} OFFSET ${offset}`;

    const countRes = await dbSanLuis.query(countSql, search ? [search] : []);
    const total = parseInt(countRes.rows[0]?.total || 0, 10);

    const dataRes = await dbSanLuis.query(dataSql, params);

    res.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      participants: dataRes.rows
    });
  } catch (error) {
    console.error('[San Luis Raffle Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Sorteo en Vivo (Generar ganador y suplentes con auditoría)
router.post('/raffle/draw-winner', async (req, res) => {
  try {
    const winnersCount = Math.max(1, parseInt(req.body.winnersCount || 1, 10));
    const substitutesCount = Math.max(0, parseInt(req.body.substitutesCount || 2, 10));
    const totalNeeded = winnersCount + substitutesCount;

    const countRes = await dbSanLuis.query('SELECT COUNT(*) as total FROM raffle_participants_sanluis');
    const total = parseInt(countRes.rows[0]?.total || 0, 10);

    if (total === 0) {
      return res.status(400).json({ success: false, error: 'No hay participantes registrados para sortear.' });
    }

    const selectSql = `
      SELECT id, contacto, tipo, fecha, created_at
      FROM raffle_participants_sanluis
      ORDER BY RANDOM()
      LIMIT $1
    `;
    const drawRes = await dbSanLuis.query(selectSql, [totalNeeded]);
    const selected = drawRes.rows;

    const winners = selected.slice(0, winnersCount);
    const substitutes = selected.slice(winnersCount);

    const auditSeed = crypto.randomBytes(16).toString('hex');
    const timestamp = new Date().toISOString();
    const auditPayload = `${auditSeed}:${timestamp}:${selected.map(s => s.id).join('-')}`;
    const auditHash = crypto.createHash('sha256').update(auditPayload).digest('hex');

    res.json({
      success: true,
      totalPool: total,
      winners,
      substitutes,
      audit: {
        timestamp,
        seed: auditSeed,
        hash: auditHash
      }
    });
  } catch (error) {
    console.error('[San Luis Draw Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 5. Exportar Respuestas (Excel o CSV)
router.get('/export/responses', async (req, res) => {
  try {
    const { whereSql, params } = buildSanLuisWhere(req.query);
    const sql = `SELECT * FROM survey_responses_sanluis ${whereSql} ORDER BY id ASC`;
    const result = await dbSanLuis.query(sql, params);
    const rows = result.rows;

    if (rows.length === 0) {
      return res.status(404).send('No se encontraron respuestas con los filtros seleccionados.');
    }

    const format = String(req.query.format || '').toLowerCase();
    const timestamp = Date.now();

    if (format === 'xlsx' || format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Respuestas_San_Luis');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=respuestas_san_luis_${timestamp}.xlsx`);
      return res.send(buffer);
    }

    // CSV estándar
    const headers = Object.keys(rows[0]);
    const csvRows = [
      headers.join(';'),
      ...rows.map(r => headers.map(h => {
        let val = r[h];
        if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
        return `"${String(val ?? '').replace(/\r\n/g, ' ').replace(/\n/g, ' ').replace(/"/g, '""')}"`;
      }).join(';'))
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=respuestas_san_luis_${timestamp}.csv`);
    res.send('\uFEFF' + csvRows.join('\r\n'));
  } catch (error) {
    console.error('[San Luis Export Responses Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 6. Exportar Sorteo (Excel o CSV)
router.get('/export/raffle', async (req, res) => {
  try {
    const result = await dbSanLuis.query('SELECT id, contacto, tipo, fecha, created_at FROM raffle_participants_sanluis ORDER BY id ASC');
    const rows = result.rows;

    if (rows.length === 0) {
      return res.status(404).send('No hay participantes registrados en el sorteo.');
    }

    const format = String(req.query.format || '').toLowerCase();
    const timestamp = Date.now();

    if (format === 'xlsx' || format === 'excel') {
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sorteo_San_Luis');
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=participantes_sorteo_san_luis_${timestamp}.xlsx`);
      return res.send(buffer);
    }

    const headers = ['id', 'contacto', 'tipo', 'fecha', 'created_at'];
    const csvRows = [
      headers.join(';'),
      ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(';'))
    ];

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=participantes_sorteo_san_luis_${timestamp}.csv`);
    res.send('\uFEFF' + csvRows.join('\r\n'));
  } catch (error) {
    console.error('[San Luis Export Raffle Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 7. Recepción de Respuestas desde la Encuesta Virtual / Webhook
router.post('/submit', async (req, res) => {
  try {
    const b = req.body;

    // Caso A: Registro en Sorteo
    if (b.type === 'sorteo' || b.contacto) {
      const contacto = String(b.contacto || '').trim().slice(0, 120);
      const tipo = b.tipo || (contacto.includes('@') ? 'mail' : 'celular');
      const fecha = b.fecha || new Date().toISOString().slice(0, 10);

      if (!contacto) {
        return res.status(400).json({ success: false, error: 'Contacto requerido' });
      }

      await dbSanLuis.query(
        'INSERT INTO raffle_participants_sanluis (contacto, tipo, fecha) VALUES ($1, $2, $3) ON CONFLICT (contacto) DO NOTHING',
        [contacto, tipo, fecha]
      );
      return res.json({ success: true, message: 'Inscripción en sorteo registrada con éxito' });
    }

    // Caso B: Respuesta de la encuesta
    const dur_s = parseInt(b.dur_s || 0, 10);
    const isSpeeder = dur_s > 0 && dur_s < 20;

    const insertSql = `
      INSERT INTO survey_responses_sanluis (
        sid, version, ts_inicio, ts_fin, dur_s,
        p1, p2, p2_otro, p3, p4,
        p5_poggi, p5_alberto, p5_adolfo, p5_frontera, p5_abdala,
        p6, p6_otro, p7, p8, p9, p10,
        p11, p12, p12_otro,
        genero, edad, localidad, departamento, localidad_libre, laboral,
        is_flagged_speeder,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term, fbclid, referrer, movil, tiempos
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21,
        $22, $23, $24,
        $25, $26, $27, $28, $29, $30,
        $31,
        $32, $33, $34, $35, $36, $37, $38, $39, $40
      )
      ON CONFLICT (sid) DO NOTHING
    `;

    const values = [
      b.sid || ('sl_' + Date.now()),
      b.version || 'SL-2026-10-v1',
      b.ts_inicio || null,
      b.ts_fin || new Date().toISOString(),
      dur_s,
      b.p1 || null,
      b.p2 || null,
      b.p2_otro || null,
      b.p3 || null,
      b.p4 || null,
      b.p5_poggi || null,
      b.p5_alberto || null,
      b.p5_adolfo || null,
      b.p5_frontera || null,
      b.p5_abdala || null,
      b.p6 || null,
      b.p6_otro || null,
      b.p7 || null,
      b.p8 || null,
      b.p9 || null,
      b.p10 || null,
      b.p11 || null,
      b.p12 || null,
      b.p12_otro || null,
      b.genero || null,
      b.edad || null,
      b.localidad || null,
      b.departamento || null,
      b.localidad_libre || null,
      b.laboral || null,
      isSpeeder,
      b.utm_source || null,
      b.utm_medium || null,
      b.utm_campaign || null,
      b.utm_content || null,
      b.utm_term || null,
      b.fbclid || null,
      b.referrer || null,
      parseInt(b.movil || 0, 10),
      b.tiempos ? JSON.stringify(b.tiempos) : null
    ];

    await dbSanLuis.query(insertSql, values);
    res.json({ success: true, message: 'Respuesta guardada exitosamente en PostgreSQL San Luis' });
  } catch (error) {
    console.error('[San Luis Submit Error]', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
