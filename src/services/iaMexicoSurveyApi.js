/**
 * Servicio API para Encuesta Nacional: "Inteligencia Artificial en México"
 * Conexión en tiempo real con endpoints en /api/ia-mexico (MySQL en producción)
 * Soporta auto-recarga en vivo y estado limpio cuando la BBDD está iniciando.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (typeof window !== 'undefined' && window.location.port !== '5173' ? '' : 'http://localhost:3000');

export const REGIONES_MEXICO = {
  'Noroeste': ['Baja California', 'Baja California Sur', 'Chihuahua', 'Durango', 'Sinaloa', 'Sonora'],
  'Noreste': ['Coahuila', 'Nuevo León', 'Tamaulipas'],
  'Occidente y Bajío': ['Aguascalientes', 'Colima', 'Guanajuato', 'Jalisco', 'Michoacán', 'Nayarit', 'Querétaro', 'San Luis Potosí', 'Zacatecas'],
  'Centro': ['Ciudad de México (CDMX)', 'Ciudad de México', 'CDMX', 'Distrito Federal', 'Estado de México', 'Hidalgo', 'Morelos', 'Puebla', 'Tlaxcala'],
  'Sur - Sureste': ['Campeche', 'Chiapas', 'Guerrero', 'Oaxaca', 'Quintana Roo', 'Tabasco', 'Veracruz', 'Yucatán']
};

export const TODOS_LOS_ESTADOS_MEXICO = [
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

export const EMPTY_IA_MEXICO_STATS = {
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

export const iaMexicoSurveyApi = {
  // Test de salud y conectividad con MySQL México
  async checkHealth() {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${API_BASE_URL}/api/ia-mexico/health`, { signal: controller.signal });
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
      const res = await fetch(`${API_BASE_URL}/api/ia-mexico/stats?${query.toString()}`, { signal: controller.signal });
      clearTimeout(id);

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          return { fromServer: true, ...json };
        }
      }
      throw new Error('Servidor IA México no disponible');
    } catch (err) {
      console.warn('Estado vacío para IA Survey México:', err.message);
      return { fromServer: false, ...EMPTY_IA_MEXICO_STATS };
    }
  },

  // Obtener participantes registrados para el sorteo de 200 USD
  async getRaffleParticipants({ page = 1, limit = 50, search = '' } = {}) {
    try {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) query.append('search', search);

      const res = await fetch(`${API_BASE_URL}/api/ia-mexico/raffle?${query.toString()}`);
      if (res.ok) {
        return await res.json();
      }
      throw new Error('Error al obtener participantes del sorteo México');
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

  // Ejecutar sorteo digital con bolillero criptográfico aleatorio y hash SHA-256
  async drawWinner({ winnersCount = 1, substitutesCount = 2 } = {}) {
    const res = await fetch(`${API_BASE_URL}/api/ia-mexico/raffle/draw-winner`, {
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
    return `${API_BASE_URL}/api/ia-mexico/export/${type}?${query.toString()}`;
  }
};
