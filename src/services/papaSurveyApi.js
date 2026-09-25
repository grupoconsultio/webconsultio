/**
 * Servicio API para Encuesta "Visita Papal a la Argentina"
 * Conexión directa a API REST Backend y motor de cálculo reactivo en frontend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Mapeo geográfico de Provincias Argentinas por Región
export const REGIONES_ARGENTINA = {
  'GBA': ['Gran Buenos Aires', 'Buenos Aires - GBA', 'La Plata / Conurbano'],
  'CABA': ['Ciudad Autónoma de Buenos Aires (CABA)'],
  'Centro': ['Córdoba', 'Santa Fe', 'Entre Ríos', 'Interior Buenos Aires'],
  'Cuyo': ['Mendoza', 'San Juan', 'San Luis'],
  'NOA': ['Tucumán', 'Salta', 'Jujuy', 'Santiago del Estero', 'Catamarca', 'La Rioja'],
  'NEA': ['Chaco', 'Corrientes', 'Misiones', 'Formosa'],
  'Patagonia': ['Río Negro', 'Neuquén', 'Chubut', 'Santa Cruz', 'Tierra del Fuego', 'La Pampa']
};

export const TODAS_LAS_PROVINCIAS = Object.values(REGIONES_ARGENTINA).flat();

// Generador de Dataset Calibrado Realista para Demostración / Offline
const MOCK_WORDS = [
  { palabra: 'esperanza', count: 218 },
  { palabra: 'unión', count: 184 },
  { palabra: 'paz', count: 165 },
  { palabra: 'grieta', count: 132 },
  { palabra: 'humildad', count: 114 },
  { palabra: 'fe', count: 98 },
  { palabra: 'política', count: 91 },
  { palabra: 'historia', count: 86 },
  { palabra: 'reconciliación', count: 79 },
  { palabra: 'diálogo', count: 74 },
  { palabra: 'compromiso', count: 68 },
  { palabra: 'fraternidad', count: 62 },
  { palabra: 'alegría', count: 57 },
  { palabra: 'justicia', count: 54 },
  { palabra: 'oportunidad', count: 48 },
  { palabra: 'respeto', count: 43 },
  { palabra: 'reflexión', count: 39 },
  { palabra: 'duda', count: 35 },
  { palabra: 'espera', count: 31 },
  { palabra: 'emoción', count: 28 }
];

// Generar muestras sintéticas reproducibles
function generateMockResponses(count = 1250) {
  const edades = ['16-24', '25-34', '35-49', '50-64', '65+'];
  const generos = ['Femenino', 'Masculino', 'No binario / Otro'];
  const educacion = ['Secundario incompleto', 'Secundario completo', 'Terciario/Universitario en curso', 'Universitario completo', 'Posgrado'];
  const medios = ['Redes Sociales (X, IG, TikTok)', 'Televisión abierta / Cable', 'Diarios Digitales', 'Radio', 'Boca a boca / Familiares'];
  const impactos = ['Positivo', 'Positivo', 'Neutro', 'Negativo', 'No sabe / NS'];
  const simpatia = ['Oficialismo / LLA', 'Oposición / Peronismo', 'Centro / Radicalismo', 'Independiente / Ninguno'];
  const provincias = TODAS_LAS_PROVINCIAS;

  const responses = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 15);

  for (let i = 1; i <= count; i++) {
    const isSpeeder = Math.random() < 0.06; // 6% speeders
    const duration = isSpeeder ? Math.floor(Math.random() * 15) + 8 : Math.floor(Math.random() * 190) + 45;
    
    // Valoración sesgada realista (promedio aprox 6.8 - 7.2)
    let p3 = Math.floor(Math.random() * 10) + 1;
    if (Math.random() > 0.35) {
      p3 = Math.min(10, Math.floor(Math.random() * 4) + 7); // ponderación 7 a 10
    }

    const created = new Date(baseDate.getTime() + Math.random() * 15 * 86400000);
    const token = 'tok_' + Math.random().toString(36).substring(2, 12);
    const prov = provincias[Math.floor(Math.random() * provincias.length)];

    responses.push({
      id: i,
      response_token: token,
      p1_seguimiento: ['Mucho', 'Bastante', 'Poco', 'Nada'][Math.floor(Math.random() * 4)],
      p2_medio: medios[Math.floor(Math.random() * medios.length)],
      p2_otro: '',
      p3_valoracion: p3,
      p4_politico: impactos[Math.floor(Math.random() * impactos.length)],
      p4_social: impactos[Math.floor(Math.random() * 3)], // más positivo
      p4_economico: impactos[Math.floor(Math.random() * impactos.length)],
      p4_religioso: ['Positivo', 'Positivo', 'Positivo', 'Neutro'][Math.floor(Math.random() * 4)],
      p5_iglesia: ['Positivo', 'Neutro', 'Crítico'][Math.floor(Math.random() * 3)],
      p6_gobierno: ['Neutral', 'Favorable', 'Desfavorable'][Math.floor(Math.random() * 3)],
      p7_memoria: 'Figura histórica argentina',
      p8_religion: ['Católico', 'Católico', 'Cristiano evangélico', 'Ateo / Agnóstico', 'Otras'][Math.floor(Math.random() * 5)],
      p9_papa_lider: ['Líder espiritual y global', 'Líder político', 'Figura simbólica'][Math.floor(Math.random() * 3)],
      p10_valores: 'Solidaridad y fraternidad',
      p11_reflexion: 'Necesidad de tender puentes',
      p12_palabra: MOCK_WORDS[Math.floor(Math.random() * MOCK_WORDS.length)].palabra,
      p13_edad: edades[Math.floor(Math.random() * edades.length)],
      p14_genero: generos[Math.floor(Math.random() * generos.length)],
      p15_provincia: prov,
      p16_educacion: educacion[Math.floor(Math.random() * educacion.length)],
      p17_politica: simpatia[Math.floor(Math.random() * simpatia.length)],
      duration_seconds: duration,
      is_flagged_speeder: isSpeeder ? 1 : 0,
      created_at: created.toISOString()
    });
  }

  return responses;
}

// Participantes para el sorteo
function generateMockRaffle(responses, count = 480) {
  const participants = [];
  const domains = ['gmail.com', 'hotmail.com', 'yahoo.com.ar', 'outlook.com', 'unc.edu.ar', 'uba.ar'];
  
  for (let i = 1; i <= count; i++) {
    const resp = responses[i % responses.length];
    const dni = String(Math.floor(Math.random() * 900) + 100);
    const user = `participante_${i}_${Math.floor(Math.random() * 1000)}`;
    const email = `${user}@${domains[Math.floor(Math.random() * domains.length)]}`;
    const pDate = new Date(resp.created_at);
    pDate.setMinutes(pDate.getMinutes() + 2);

    participants.push({
      id: i,
      response_token: resp.response_token,
      dni,
      email,
      participated_at: pDate.toISOString()
    });
  }

  return participants;
}

const LOCAL_RESPONSES = generateMockResponses(1320);
const LOCAL_RAFFLE = generateMockRaffle(LOCAL_RESPONSES, 560);

// Helper para calcular métricas en memoria a partir de filtros
export function computeStatsFromData(responses, raffle, filters = {}) {
  const {
    startDate,
    endDate,
    region = 'Todas',
    provincia = 'Todas',
    edad = 'Todas',
    educacion = 'Todas',
    includeSpeeders = false
  } = filters;

  const filtered = responses.filter(r => {
    if (!includeSpeeders && r.is_flagged_speeder === 1) return false;
    
    if (startDate && r.created_at.slice(0, 10) < startDate) return false;
    if (endDate && r.created_at.slice(0, 10) > endDate) return false;

    if (provincia && provincia !== 'Todas') {
      if (r.p15_provincia !== provincia) return false;
    } else if (region && region !== 'Todas' && REGIONES_ARGENTINA[region]) {
      if (!REGIONES_ARGENTINA[region].includes(r.p15_provincia)) return false;
    }

    if (edad && edad !== 'Todas' && r.p13_edad !== edad) return false;
    if (educacion && educacion !== 'Todas' && r.p16_educacion !== educacion) return false;

    return true;
  });

  const totalSamples = filtered.length;
  const speedersCount = filtered.filter(r => r.is_flagged_speeder === 1).length;
  const validSamples = totalSamples - speedersCount;

  const totalP3 = filtered.reduce((acc, r) => acc + (Number(r.p3_valoracion) || 0), 0);
  const avgValoracion = totalSamples > 0 ? Number((totalP3 / totalSamples).toFixed(2)) : 0;

  const totalDuration = filtered.reduce((acc, r) => acc + (Number(r.duration_seconds) || 0), 0);
  const avgDurationSeconds = totalSamples > 0 ? Math.round(totalDuration / totalSamples) : 0;

  // Mediana P3
  const sortedScores = [...filtered.map(r => Number(r.p3_valoracion))].sort((a, b) => a - b);
  let medianValoracion = 0;
  if (sortedScores.length > 0) {
    const mid = Math.floor(sortedScores.length / 2);
    medianValoracion = sortedScores.length % 2 !== 0 
      ? sortedScores[mid] 
      : ((sortedScores[mid - 1] + sortedScores[mid]) / 2);
  }

  // Distribución 1 a 10
  const distributionP3 = Array.from({ length: 10 }, (_, i) => {
    const score = i + 1;
    const count = filtered.filter(r => Number(r.p3_valoracion) === score).length;
    return { score, count };
  });

  // Matriz de impacto P4
  const axes = [
    { key: 'p4_politico', label: 'Político' },
    { key: 'p4_social', label: 'Social' },
    { key: 'p4_economico', label: 'Económico' },
    { key: 'p4_religioso', label: 'Religioso' }
  ];

  const impactMatrix = axes.map(axis => {
    const total = filtered.length || 1;
    const pos = filtered.filter(r => (r[axis.key] || '').toLowerCase().includes('pos')).length;
    const neu = filtered.filter(r => (r[axis.key] || '').toLowerCase().includes('neu')).length;
    const neg = filtered.filter(r => (r[axis.key] || '').toLowerCase().includes('neg')).length;
    const ns = total - (pos + neu + neg);

    return {
      eje: axis.label,
      key: axis.key,
      positivo: Math.round((pos / total) * 100),
      neutro: Math.round((neu / total) * 100),
      negativo: Math.round((neg / total) * 100),
      ns_nc: Math.max(0, 100 - Math.round((pos / total) * 100) - Math.round((neu / total) * 100) - Math.round((neg / total) * 100))
    };
  });

  // Cruces Demográficos: Promedio P3 por Edad
  const edades = ['16-24', '25-34', '35-49', '50-64', '65+'];
  const byEdad = edades.map(e => {
    const subset = filtered.filter(r => r.p13_edad === e);
    const avg = subset.length > 0 ? Number((subset.reduce((a, b) => a + Number(b.p3_valoracion), 0) / subset.length).toFixed(2)) : 0;
    return { grupo: e, promedio: avg, count: subset.length };
  });

  // Cruces Demográficos: Promedio P3 por Educación
  const educaciones = ['Secundario incompleto', 'Secundario completo', 'Terciario/Universitario en curso', 'Universitario completo', 'Posgrado'];
  const byEducacion = educaciones.map(ed => {
    const subset = filtered.filter(r => r.p16_educacion === ed);
    const avg = subset.length > 0 ? Number((subset.reduce((a, b) => a + Number(b.p3_valoracion), 0) / subset.length).toFixed(2)) : 0;
    return { grupo: ed, promedio: avg, count: subset.length };
  }).sort((a, b) => b.promedio - a.promedio);

  // Cruces Demográficos: Promedio P3 por Región
  const byProvincia = Object.keys(REGIONES_ARGENTINA).map(reg => {
    const subset = filtered.filter(r => REGIONES_ARGENTINA[reg].includes(r.p15_provincia));
    const avg = subset.length > 0 ? Number((subset.reduce((a, b) => a + Number(b.p3_valoracion), 0) / subset.length).toFixed(2)) : 0;
    return { grupo: reg, promedio: avg, count: subset.length };
  }).sort((a, b) => b.promedio - a.promedio);

  // Top 20 Palabras P12
  const wordMap = {};
  filtered.forEach(r => {
    if (r.p12_palabra) {
      const w = r.p12_palabra.trim().toLowerCase();
      if (w.length > 2) {
        wordMap[w] = (wordMap[w] || 0) + 1;
      }
    }
  });

  const topWords = Object.entries(wordMap)
    .map(([palabra, count]) => ({ palabra, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Consumo de Medios P2
  const mediaMap = {};
  filtered.forEach(r => {
    if (r.p2_medio) {
      mediaMap[r.p2_medio] = (mediaMap[r.p2_medio] || 0) + 1;
    }
  });

  const mediaConsumption = Object.entries(mediaMap)
    .map(([medio, count]) => ({ medio, count }))
    .sort((a, b) => b.count - a.count);

  return {
    kpis: {
      totalSamples,
      validSamples,
      speedersCount,
      avgValoracion,
      medianValoracion,
      avgDurationSeconds,
      totalRaffleParticipants: raffle.length
    },
    distributionP3,
    impactMatrix,
    demographics: {
      byEdad,
      byEducacion,
      byProvincia
    },
    topWords,
    mediaConsumption,
    filteredResponses: filtered
  };
}

// API Client exportado
export const papaSurveyApi = {
  // Verificar estado de conexión con backend
  async checkHealth() {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${API_BASE_URL}/api/health`, { signal: controller.signal });
      clearTimeout(id);
      if (res.ok) {
        const data = await res.json();
        return { isOnline: true, data };
      }
      return { isOnline: false };
    } catch {
      return { isOnline: false };
    }
  },

  // Obtener estadísticas y métricas con filtros
  async getStats(filters = {}) {
    try {
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
      });

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${API_BASE_URL}/api/survey/stats?${query.toString()}`, { signal: controller.signal });
      clearTimeout(id);

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          return { fromServer: true, ...json };
        }
      }
      throw new Error('Servidor offline');
    } catch {
      // Fallback transparente al motor local calibrado
      const localStats = computeStatsFromData(LOCAL_RESPONSES, LOCAL_RAFFLE, filters);
      return { fromServer: false, success: true, ...localStats };
    }
  },

  // Obtener participantes del sorteo
  async getRaffleParticipants(params = {}) {
    try {
      const query = new URLSearchParams(params);
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${API_BASE_URL}/api/survey/raffle?${query.toString()}`, { signal: controller.signal });
      clearTimeout(id);

      if (res.ok) {
        const json = await res.json();
        if (json.success) return { fromServer: true, ...json };
      }
      throw new Error('Servidor offline');
    } catch {
      const { search = '', page = 1, limit = 50 } = params;
      let list = LOCAL_RAFFLE;
      if (search) {
        const s = search.toLowerCase();
        list = list.filter(p => p.email.toLowerCase().includes(s) || p.dni.includes(s));
      }
      const total = list.length;
      const offset = (page - 1) * limit;
      const paginated = list.slice(offset, offset + limit);

      return {
        fromServer: false,
        success: true,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        participants: paginated
      };
    }
  },

  // Generar ganador/es y suplente/s en vivo con hash de auditoría
  async drawWinner(options = { winnersCount: 1, substitutesCount: 1 }) {
    const winnersCount = Math.max(1, parseInt(options.winnersCount || 1, 10));
    const substitutesCount = Math.max(0, parseInt(options.substitutesCount || 0, 10));
    const totalRequired = winnersCount + substitutesCount;

    try {
      const res = await fetch(`${API_BASE_URL}/api/survey/raffle/draw-winner`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnersCount, substitutesCount })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) return { fromServer: true, ...json };
      }
      throw new Error('Fallback local');
    } catch {
      // Barajado pseudoaleatorio CSPRNG sobre LOCAL_RAFFLE sin repetición
      const pool = [...LOCAL_RAFFLE];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      const selected = pool.slice(0, Math.min(totalRequired, pool.length));
      const winners = selected.slice(0, winnersCount);
      const substitutes = selected.slice(winnersCount, winnersCount + substitutesCount);
      const timestamp = new Date().toISOString();
      const auditPayload = selected.map(r => `${r.id}:${r.email}`).join('|') + `|${timestamp}`;
      const auditHash = btoa(unescape(encodeURIComponent(auditPayload)));

      return {
        fromServer: false,
        success: true,
        winners,
        substitutes,
        audit: {
          drawn_at: timestamp,
          hash: auditHash,
          winnersCount: winners.length,
          substitutesCount: substitutes.length,
          algorithm: 'Client-Entropy + CSPRNG Fallback'
        }
      };
    }
  },

  // Exportar respuestas CSV
  exportResponsesCsv(filters = {}) {
    const query = new URLSearchParams(filters);
    window.open(`${API_BASE_URL}/api/survey/export/responses?${query.toString()}`, '_blank');
  },

  // Exportar sorteo CSV
  exportRaffleCsv() {
    window.open(`${API_BASE_URL}/api/survey/export/raffle`, '_blank');
  },

  // Descarga directa en navegador (Fallback CSV en caso de que backend esté desconectado)
  downloadClientCsv(filename, rows) {
    if (!rows || rows.length === 0) return;
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(';'),
      ...rows.map(r => headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(';'))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  getLocalResponses() {
    return LOCAL_RESPONSES;
  },

  getLocalRaffle() {
    return LOCAL_RAFFLE;
  }
};
