/**
 * Servicio API para Encuesta Nacional: "Uso de Inteligencia Artificial en Argentina"
 * Conexión en tiempo real con endpoints en /api/ia (MySQL en producción)
 * Soporta auto-recarga en vivo y fallback analítico estructurado cuando la BBDD está iniciando.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (typeof window !== 'undefined' && window.location.port !== '5173' ? '' : 'http://localhost:3000');

export const REGIONES_ARGENTINA = {
  'Centro': ['Córdoba', 'Santa Fe', 'Entre Ríos', 'Interior Buenos Aires'],
  'CABA': ['Ciudad Autónoma de Buenos Aires (CABA)', 'Ciudad Autónoma de Buenos Aires', 'CABA', 'Capital Federal'],
  'GBA': ['Buenos Aires', 'Gran Buenos Aires', 'Buenos Aires - GBA', 'La Plata / Conurbano'],
  'Cuyo': ['Mendoza', 'San Juan', 'San Luis'],
  'NOA': ['Tucumán', 'Salta', 'Jujuy', 'Santiago del Estero', 'Catamarca', 'La Rioja'],
  'NEA': ['Chaco', 'Corrientes', 'Misiones', 'Formosa'],
  'Patagonia': ['Río Negro', 'Neuquén', 'Chubut', 'Santa Cruz', 'Tierra del Fuego', 'Tierra del Fuego, Antártida e Islas del Atlántico Sur', 'La Pampa']
};

export const TODAS_LAS_PROVINCIAS = [
  "Ciudad Autónoma de Buenos Aires (CABA)",
  "Buenos Aires",
  "Catamarca",
  "Chaco",
  "Chubut",
  "Córdoba",
  "Corrientes",
  "Entre Ríos",
  "Formosa",
  "Jujuy",
  "La Pampa",
  "La Rioja",
  "Mendoza",
  "Misiones",
  "Neuquén",
  "Río Negro",
  "Salta",
  "San Juan",
  "San Luis",
  "Santa Cruz",
  "Santa Fe",
  "Santiago del Estero",
  "Tierra del Fuego",
  "Tucumán"
];

export const EMPTY_IA_STATS = {
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

export const iaSurveyApi = {
  // Test de salud y conectividad con MySQL
  async checkHealth() {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${API_BASE_URL}/api/ia/health`, { signal: controller.signal });
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

  // Obtener estadísticas y métricas agregadas con filtros dinámicos
  async getStats(filters = {}) {
    try {
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '' && v !== 'Todas' && v !== 'Todos') {
          query.append(k, String(v));
        }
      });

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(`${API_BASE_URL}/api/ia/stats?${query.toString()}`, { signal: controller.signal });
      clearTimeout(id);

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          return { fromServer: true, ...json };
        }
      }
      throw new Error('Servidor IA no disponible');
    } catch (err) {
      console.warn('Fallback a datos analíticos locales para IA Survey:', err.message);
      // Retornar fallback analítico para que el dashboard no quede en blanco
      return { fromServer: false, ...EMPTY_IA_STATS };
    }
  },

  // Obtener participantes registrados para el sorteo de $200.000
  async getRaffleParticipants({ page = 1, limit = 50, search = '' } = {}) {
    try {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) query.append('search', search);

      const res = await fetch(`${API_BASE_URL}/api/ia/raffle?${query.toString()}`);
      if (res.ok) {
        return await res.json();
      }
      throw new Error('Error al obtener participantes del sorteo');
    } catch (err) {
      return {
        success: false,
        total: 0,
        page: 1,
        limit,
        totalPages: 1,
        participants: [],
        error: err.message
      };
    }
  },

  // Ejecutar sorteo digital con bolillero aleatorio y hash SHA-256
  async drawWinner({ winnersCount = 1, substitutesCount = 2 } = {}) {
    const res = await fetch(`${API_BASE_URL}/api/ia/raffle/draw-winner`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winnersCount, substitutesCount })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || 'No se pudo sortear el ganador');
    }
    return json;
  },

  // Obtener URL de descarga directa para Excel o CSV
  getExportUrl(type = 'responses', format = 'xlsx', filters = {}) {
    const query = new URLSearchParams();
    query.append('format', format);
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'Todas' && v !== 'Todos') {
        query.append(k, String(v));
      }
    });
    return `${API_BASE_URL}/api/ia/export/${type}?${query.toString()}`;
  }
};
