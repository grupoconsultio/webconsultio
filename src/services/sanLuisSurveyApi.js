/**
 * Servicio API para Encuesta "San Luis 2026"
 * Conexión directa a API REST Backend conectada a PostgreSQL en producción
 * Los datos ficticios han sido completamente eliminados: solo datos reales de BBDD.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (typeof window !== 'undefined' && window.location.port !== '5173' ? '' : 'http://localhost:3000');

export const DEPARTAMENTOS_SAN_LUIS = [
  "Juan Martín de Pueyrredón",
  "General Pedernera",
  "Junín",
  "Chacabuco",
  "Coronel Pringles",
  "Ayacucho",
  "Belgrano",
  "Gobernador Dupuy",
  "Libertador General San Martín"
];

export const DIRIGENTES_SAN_LUIS = [
  { key: 'p5_poggi', name: 'Claudio Poggi', cargo: 'Gobernador de San Luis' },
  { key: 'p5_alberto', name: 'Alberto Rodríguez Saá', cargo: 'Ex Gobernador' },
  { key: 'p5_adolfo', name: 'Adolfo Rodríguez Saá', cargo: 'Ex Gobernador' },
  { key: 'p5_frontera', name: 'Maximiliano Frontera', cargo: 'Intendente de Villa Mercedes' },
  { key: 'p5_abdala', name: 'Bartolomé Abdala', cargo: 'Presidente Provisional del Senado' }
];

export const EMPTY_SAN_LUIS_STATS = {
  kpis: {
    totalSamples: 0,
    validSamples: 0,
    speedersCount: 0,
    avgDurationSeconds: 0,
    totalRaffleParticipants: 0
  },
  p1Rumbo: [],
  p2Problema: [],
  p3Economia: [],
  p4GestionPoggi: [],
  imagenDirigentes: DIRIGENTES_SAN_LUIS.map(d => ({
    key: d.key,
    name: d.name,
    cargo: d.cargo,
    positiva: 0,
    negativa: 0,
    regular: 0,
    noConoce: 0,
    neto: 0,
    totalEvaluaciones: 0
  })),
  p6Voto: [],
  p7Rumbo: [],
  p8Frase: [],
  p9GestionMilei: [],
  p10Formula: [],
  p11Cualidad: [],
  p12Prioridad: [],
  demographics: {
    byGenero: [],
    byEdad: [],
    byLaboral: [],
    byDepartamento: [],
    byLocalidad: []
  }
};

export const sanLuisSurveyApi = {
  // Verificar estado de conexión con base de datos PostgreSQL
  async checkHealth() {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${API_BASE_URL}/api/san-luis/health`, { signal: controller.signal });
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

  // Obtener estadísticas y cruces (SOLO DATOS REALES DE POSTGRESQL)
  async getStats(filters = {}) {
    try {
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
      });

      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${API_BASE_URL}/api/san-luis/stats?${query.toString()}`, { signal: controller.signal });
      clearTimeout(id);

      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          return { fromServer: true, ...json };
        }
      }
      throw new Error('Servidor o base de datos PostgreSQL no disponible');
    } catch (err) {
      console.warn('[SanLuisSurveyApi] No se pudieron obtener datos del servidor:', err.message);
      return { fromServer: false, success: false, ...EMPTY_SAN_LUIS_STATS, error: err.message };
    }
  },

  // Obtener participantes registrados al sorteo
  async getRaffleParticipants(params = {}) {
    try {
      const query = new URLSearchParams(params);
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${API_BASE_URL}/api/san-luis/raffle?${query.toString()}`, { signal: controller.signal });
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

  // Ejecutar sorteo digital en vivo
  async drawWinner(options = { winnersCount: 1, substitutesCount: 2 }) {
    const winnersCount = Math.max(1, parseInt(options.winnersCount || 1, 10));
    const substitutesCount = Math.max(0, parseInt(options.substitutesCount || 2, 10));

    const res = await fetch(`${API_BASE_URL}/api/san-luis/raffle/draw-winner`, {
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
    window.open(`${API_BASE_URL}/api/san-luis/export/responses?${query.toString()}`, '_blank');
  },

  // Exportar respuestas Excel XLSX
  exportResponsesExcel(filters = {}) {
    const query = new URLSearchParams({ ...filters, format: 'xlsx' });
    window.open(`${API_BASE_URL}/api/san-luis/export/responses?${query.toString()}`, '_blank');
  },

  // Exportar participantes sorteo CSV
  exportRaffleCsv() {
    window.open(`${API_BASE_URL}/api/san-luis/export/raffle`, '_blank');
  },

  // Exportar participantes sorteo Excel XLSX
  exportRaffleExcel() {
    window.open(`${API_BASE_URL}/api/san-luis/export/raffle?format=xlsx`, '_blank');
  },

  // Descarga directa en el navegador
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
  }
};
