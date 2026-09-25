/**
 * Servicio API para Encuesta "Visita Papal a la Argentina"
 * Conexión directa a API REST Backend conectada a MySQL en producción
 * Los datos ficticios han sido completamente eliminados: solo datos reales de BBDD.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (typeof window !== 'undefined' && window.location.port !== '5173' ? '' : 'http://localhost:3001');

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

// Estructura vacía cuando no hay conexión o no hay datos reales en la BBDD
export const EMPTY_STATS = {
  kpis: {
    totalSamples: 0,
    validSamples: 0,
    speedersCount: 0,
    avgValoracion: 0,
    medianValoracion: 0,
    avgDurationSeconds: 0,
    totalRaffleParticipants: 0
  },
  distributionP3: Array.from({ length: 10 }, (_, i) => ({ score: i + 1, count: 0 })),
  impactMatrix: [
    { eje: 'Político', key: 'p4_politico', positivo: 0, neutro: 0, negativo: 0, ns_nc: 0 },
    { eje: 'Social', key: 'p4_social', positivo: 0, neutro: 0, negativo: 0, ns_nc: 0 },
    { eje: 'Económico', key: 'p4_economico', positivo: 0, neutro: 0, negativo: 0, ns_nc: 0 },
    { eje: 'Religioso', key: 'p4_religioso', positivo: 0, neutro: 0, negativo: 0, ns_nc: 0 }
  ],
  demographics: {
    byEdad: [],
    byEducacion: [],
    byProvincia: []
  },
  topWords: [],
  mediaConsumption: [],
  filteredResponses: []
};

// API Client exportado
export const papaSurveyApi = {
  // Verificar estado de conexión con backend
  async checkHealth() {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${API_BASE_URL}/api/health`, { signal: controller.signal });
      clearTimeout(id);
      if (res.ok) {
        const data = await res.json();
        return { isOnline: data?.database?.ok === true, data };
      }
      return { isOnline: false, data: null };
    } catch {
      return { isOnline: false, data: null };
    }
  },

  // Obtener estadísticas y métricas con filtros (SOLO DATOS REALES)
  async getStats(filters = {}) {
    try {
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
      });

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${API_BASE_URL}/api/survey/stats?${query.toString()}`, { signal: controller.signal });
      clearTimeout(id);

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          return { fromServer: true, ...json };
        }
      }
      throw new Error('Servidor o base de datos no disponible');
    } catch (err) {
      console.warn('[PapaSurveyApi] No se pudieron obtener datos del servidor:', err.message);
      // Retornar estado vacío limpio, CERO datos ficticios
      return { fromServer: false, success: false, ...EMPTY_STATS, error: err.message };
    }
  },

  // Obtener participantes del sorteo (SOLO DATOS REALES DE BBDD)
  async getRaffleParticipants(params = {}) {
    try {
      const query = new URLSearchParams(params);
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${API_BASE_URL}/api/survey/raffle?${query.toString()}`, { signal: controller.signal });
      clearTimeout(id);

      if (res.ok) {
        const json = await res.json();
        if (json.success) return { fromServer: true, ...json };
      }
      throw new Error('Servidor o base de datos no disponible');
    } catch {
      return {
        fromServer: false,
        success: false,
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
        participants: []
      };
    }
  },

  // Generar ganador/es y suplente/s en vivo desde el Backend
  async drawWinner(options = { winnersCount: 1, substitutesCount: 1 }) {
    const winnersCount = Math.max(1, parseInt(options.winnersCount || 1, 10));
    const substitutesCount = Math.max(0, parseInt(options.substitutesCount || 0, 10));

    const res = await fetch(`${API_BASE_URL}/api/survey/raffle/draw-winner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winnersCount, substitutesCount })
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success) return { fromServer: true, ...json };
    }

    throw new Error('No se pudo ejecutar el sorteo: Base de datos no disponible o sin participantes registrados.');
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

  // Descarga directa en navegador CSV
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
    return [];
  },

  getLocalRaffle() {
    return [];
  }
};
