/**
 * Servicio API y Procesador Analítico en Tiempo Real
 * Encuesta Presencial Río Tercero — Octubre 2026
 * Conexión en vivo a Google Sheets (Google Apps Script Web App)
 */

import fallbackData from '../data/rioTerceroFallback.json';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzL9xax-jwwM0Jbuc-UXD2Vv_sekg3rOWqY8YC00uZh7G29ZJi7RzqtYda6fybygc1lzg/exec';

export const EDADES_RIO_TERCERO = ['16-25', '26-35', '36-45', '46-55', '56-65', '66 o más'];
export const GENEROS_RIO_TERCERO = ['Femenino', 'Masculino'];
export const EDU_RIO_TERCERO = [
  'Primario incompleto',
  'Primario completo',
  'Secundario incompleto',
  'Secundario completo',
  'Terciario/Universitario incompleto',
  'Terciario/Universitario completo'
];

export const VOTOS_2023_RIO_TERCERO = [
  'Javier Milei',
  'Juan Schiaretti',
  'Sergio Massa',
  'Patricia Bullrich',
  'Myriam Bregman',
  'No votó',
  'NS/NC'
];

export const DIRIGENTES_LOCALES_NOMBRES = [
  'Marcos Ferrer',
  'Juan Pablo Peirone',
  'Alberto Martino',
  'David Consalvi',
  'Andrea Salazar',
  'Lautaro Villafañe',
  'Nicolás Rodríguez',
  'Miguel Canutto',
  'Juan Carlos Scotto'
];

export const DIRIGENTES_DEPTALES_NOMBRES = [
  'Juan Pablo Peirone',
  'David Consalvi',
  'Rubén Dagum',
  'Gustavo Botasso'
];

// Limpieza y normalización de textos
function cleanStr(str) {
  if (!str) return '';
  return String(str).trim();
}

// Normalizador seguro de cada fila del Google Sheet
function normalizeRow(row) {
  const norm = {
    _rowIndex: row._rowIndex || 0,
    dirigentes_locales: {},
    dirigentes_departamentales: {}
  };

  for (const [key, val] of Object.entries(row)) {
    const k = cleanStr(key);
    const v = cleanStr(val);

    if (k.startsWith('P1.')) norm.edad = v;
    else if (k.startsWith('P2.')) norm.genero = v;
    else if (k.startsWith('P3.')) norm.educacion = v;
    else if (k.startsWith('P4.')) norm.gestion_milei = v;
    else if (k.startsWith('P5.')) norm.gestion_llaryora = v;
    else if (k.startsWith('P6.')) norm.gestion_ferrer = v;
    else if (k.startsWith('P7.')) {
      norm.problemas = val ? String(val).split(',').map(s => s.trim()).filter(Boolean) : [];
    }
    else if (k.startsWith('P8.')) norm.cambio_continuidad = v;
    else if (k.startsWith('P9.')) {
      const match = k.match(/\[(.*?)\]/);
      const name = match ? match[1].trim() : k;
      norm.dirigentes_locales[name] = v;
    }
    else if (k.startsWith('P10.')) {
      const match = k.match(/\[(.*?)\]/);
      const name = match ? match[1].trim() : k;
      norm.dirigentes_departamentales[name] = v;
    }
    else if (k.startsWith('P11.')) norm.voto_gobernador = v;
    else if (k.startsWith('P12.1')) norm.escenario_1 = v;
    else if (k.startsWith('P12.2')) norm.escenario_2 = v;
    else if (k.startsWith('P12.3')) norm.escenario_3 = v;
    else if (k.startsWith('P12.4')) norm.escenario_4 = v;
    else if (k.startsWith('P12.5')) norm.escenario_5 = v;
    else if (k.startsWith('P13.')) norm.voto_2023 = v;
    else if (k.toLowerCase().includes('correo') || k.toLowerCase().includes('email')) norm.encuestador = v;
    else if (k.toLowerCase().includes('marca') || k.toLowerCase().includes('timestamp') || k.toLowerCase().includes('fecha')) norm.fecha = v;
  }

  return norm;
}

// Estructura de estadísticas procesadas
export const rioTerceroSurveyApi = {
  _cache: null,
  _lastFetchTime: 0,

  /**
   * Obtiene los datos crudos del Google Apps Script con fallback
   */
  async fetchRawData(forceRefresh = false) {
    const now = Date.now();
    // Cache de 30 segundos a menos que se fuerce refresco
    if (!forceRefresh && this._cache && (now - this._lastFetchTime < 30000)) {
      return this._cache;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const res = await fetch(GOOGLE_SCRIPT_URL, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.rows)) {
          this._cache = {
            fromServer: true,
            sheetTitle: json.sheetTitle || 'Encuesta Río Tercero 2026',
            totalResponses: json.totalResponses || json.rows.length,
            updatedAt: json.updatedAt || new Date().toLocaleString(),
            rows: json.rows.map(normalizeRow)
          };
          this._lastFetchTime = now;
          return this._cache;
        }
      }
      throw new Error('Respuesta inválida de Google Apps Script');
    } catch (err) {
      console.warn('[RioTerceroSurveyApi] Usando datos locales de respaldo:', err.message);
      const fallbackRows = (fallbackData.rows || []).map(normalizeRow);
      this._cache = {
        fromServer: false,
        isFallback: true,
        sheetTitle: fallbackData.sheetTitle || 'Encuesta Río Tercero 2026',
        totalResponses: fallbackRows.length,
        updatedAt: fallbackData.updatedAt || new Date().toLocaleString(),
        rows: fallbackRows,
        error: err.message
      };
      return this._cache;
    }
  },

  /**
   * Procesa estadísticas y matrices aplicando los filtros seleccionados
   */
  async getStats(filters = {}, forceRefresh = false) {
    const rawData = await this.fetchRawData(forceRefresh);
    const allRows = rawData.rows || [];

    // 1. Filtrado dinámico
    const filteredRows = allRows.filter(r => {
      if (filters.edad && filters.edad !== 'Todas' && r.edad !== filters.edad) return false;
      if (filters.genero && filters.genero !== 'Todos' && r.genero !== filters.genero) return false;
      if (filters.educacion && filters.educacion !== 'Todas' && r.educacion !== filters.educacion) return false;
      if (filters.voto2023 && filters.voto2023 !== 'Todos' && r.voto_2023 !== filters.voto2023) return false;
      if (filters.encuestador && filters.encuestador !== 'Todos' && r.encuestador !== filters.encuestador) return false;
      if (filters.startDate && r.fecha && r.fecha < filters.startDate) return false;
      if (filters.endDate && r.fecha && r.fecha > filters.endDate + ' 23:59:59') return false;
      return true;
    });

    const total = filteredRows.length;

    // Helper para porcentajes
    const pct = (count) => (total > 0 ? parseFloat(((count / total) * 100).toFixed(1)) : 0);

    // 2. Evaluaciones de Gestión (Nacional, Provincial, Local)
    const computeGestion = (keyName) => {
      const counts = { 'Muy buena': 0, 'Buena': 0, 'Mala': 0, 'Muy mala': 0, 'NS/NC': 0 };
      filteredRows.forEach(r => {
        const val = r[keyName] || 'NS/NC';
        if (counts[val] !== undefined) counts[val]++;
        else counts['NS/NC']++;
      });

      const positivaCount = counts['Muy buena'] + counts['Buena'];
      const negativaCount = counts['Muy mala'] + counts['Mala'];
      const positivaPct = pct(positivaCount);
      const negativaPct = pct(negativaCount);
      const diferencial = parseFloat((positivaPct - negativaPct).toFixed(1));

      return {
        counts,
        positivaCount,
        negativaCount,
        positivaPct,
        negativaPct,
        nsncPct: pct(counts['NS/NC']),
        diferencial,
        chartData: [
          { name: 'Muy buena', valor: counts['Muy buena'], pct: pct(counts['Muy buena']), color: '#10b981' },
          { name: 'Buena', valor: counts['Buena'], pct: pct(counts['Buena']), color: '#06b6d4' },
          { name: 'Mala', valor: counts['Mala'], pct: pct(counts['Mala']), color: '#f59e0b' },
          { name: 'Muy mala', valor: counts['Muy mala'], pct: pct(counts['Muy mala']), color: '#ef4444' },
          { name: 'NS/NC', valor: counts['NS/NC'], pct: pct(counts['NS/NC']), color: '#64748b' }
        ]
      };
    };

    const gestionMilei = computeGestion('gestion_milei');
    const gestionLlaryora = computeGestion('gestion_llaryora');
    const gestionFerrer = computeGestion('gestion_ferrer');

    // 3. Continuidad vs Cambio (P8)
    const cambioCounts = { 'Prefiere un cambio': 0, 'Que continúe el mismo equipo': 0, 'NS/NC': 0 };
    filteredRows.forEach(r => {
      const v = r.cambio_continuidad;
      if (v && cambioCounts[v] !== undefined) cambioCounts[v]++;
      else cambioCounts['NS/NC']++;
    });

    const eleccionMunicipal = {
      counts: cambioCounts,
      pctCambio: pct(cambioCounts['Prefiere un cambio']),
      pctContinuidad: pct(cambioCounts['Que continúe el mismo equipo']),
      pctNsnc: pct(cambioCounts['NS/NC']),
      chartData: [
        { name: 'Prefiere un cambio', valor: cambioCounts['Prefiere un cambio'], pct: pct(cambioCounts['Prefiere un cambio']), color: '#f59e0b' },
        { name: 'Que continúe el mismo equipo', valor: cambioCounts['Que continúe el mismo equipo'], pct: pct(cambioCounts['Que continúe el mismo equipo']), color: '#00e5ff' },
        { name: 'NS/NC', valor: cambioCounts['NS/NC'], pct: pct(cambioCounts['NS/NC']), color: '#64748b' }
      ]
    };

    // 4. Principales Problemas de la Localidad (P7)
    const problemasMap = {};
    filteredRows.forEach(r => {
      (r.problemas || []).forEach(p => {
        if (!p) return;
        problemasMap[p] = (problemasMap[p] || 0) + 1;
      });
    });

    const rankingProblemas = Object.entries(problemasMap)
      .map(([problema, count]) => ({
        problema,
        count,
        pct: pct(count)
      }))
      .sort((a, b) => b.count - a.count);

    // 5. Matriz de Dirigentes (Locales y Departamentales)
    const computeDirigentes = (list, keyDirigentes) => {
      return list.map(nombre => {
        const counts = {
          'Muy buena': 0,
          'Buena': 0,
          'Mala': 0,
          'Muy mala': 0,
          'No lo conoce': 0,
          'NS/NC': 0
        };

        filteredRows.forEach(r => {
          const dict = r[keyDirigentes] || {};
          // Buscar coincidencia exacta o parcial
          let val = dict[nombre];
          if (!val) {
            const foundKey = Object.keys(dict).find(k => k.toLowerCase().includes(nombre.toLowerCase()) || nombre.toLowerCase().includes(k.toLowerCase()));
            val = foundKey ? dict[foundKey] : 'No lo conoce';
          }
          if (counts[val] !== undefined) counts[val]++;
          else counts['NS/NC']++;
        });

        const noConoceCount = counts['No lo conoce'];
        const conoceCount = total - noConoceCount;
        const conocimientoPct = pct(conoceCount);

        const posCount = counts['Muy buena'] + counts['Buena'];
        const negCount = counts['Muy mala'] + counts['Mala'];

        const posPct = pct(posCount);
        const negPct = pct(negCount);
        const diferencial = parseFloat((posPct - negPct).toFixed(1));

        return {
          nombre,
          counts,
          conoceCount,
          noConoceCount,
          conocimientoPct,
          noConocePct: pct(noConoceCount),
          posPct,
          negPct,
          nsncPct: pct(counts['NS/NC']),
          diferencial,
          muyBuenaPct: pct(counts['Muy buena']),
          buenaPct: pct(counts['Buena']),
          malaPct: pct(counts['Mala']),
          muyMalaPct: pct(counts['Muy mala'])
        };
      }).sort((a, b) => b.posPct - a.posPct);
    };

    const dirigentesLocales = computeDirigentes(DIRIGENTES_LOCALES_NOMBRES, 'dirigentes_locales');
    const dirigentesDepartamentales = computeDirigentes(DIRIGENTES_DEPTALES_NOMBRES, 'dirigentes_departamentales');

    // 6. Escenarios Electorales a Gobernador (P11 y P12.1 al P12.5)
    const computeEscenario = (fieldKey, title) => {
      const counts = {};
      filteredRows.forEach(r => {
        const val = cleanStr(r[fieldKey]) || 'No sabe / NS-NC';
        counts[val] = (counts[val] || 0) + 1;
      });

      const items = Object.entries(counts)
        .map(([candidato, count]) => ({
          candidato,
          count,
          pct: pct(count)
        }))
        .sort((a, b) => b.count - a.count);

      return { title, fieldKey, items };
    };

    const gobernadorP11 = computeEscenario('voto_gobernador', 'Preferencia a Gobernador 2027 (General)');
    const escenariosP12 = [
      computeEscenario('escenario_1', 'Escenario 1 (Llaryora / Bornoroni / Juez / De Loredo / Spaccesi / Olivero-Vilchez)'),
      computeEscenario('escenario_2', 'Escenario 2 (Llaryora / Bornoroni / De Loredo / Spaccesi / Olivero-Vilchez)'),
      computeEscenario('escenario_3', 'Escenario 3 (Llaryora / Bornoroni / Spaccesi / Olivero-Vilchez)'),
      computeEscenario('escenario_4', 'Escenario 4 (Llaryora / De Loredo / Spaccesi / Olivero-Vilchez)'),
      computeEscenario('escenario_5', 'Escenario 5 (Llaryora / Juez / De la Sota / Spaccesi / Olivero-Vilchez)')
    ];

    // 7. Voto Presidencial 2023 (P13)
    const voto2023Counts = {};
    filteredRows.forEach(r => {
      const v = cleanStr(r.voto_2023) || 'NS/NC';
      voto2023Counts[v] = (voto2023Counts[v] || 0) + 1;
    });
    const rankingVoto2023 = Object.entries(voto2023Counts)
      .map(([candidato, count]) => ({
        candidato,
        count,
        pct: pct(count)
      }))
      .sort((a, b) => b.count - a.count);

    // 8. Demografía (Edad, Género, Educación)
    const computeDistribution = (key) => {
      const counts = {};
      filteredRows.forEach(r => {
        const v = cleanStr(r[key]) || 'Sin dato';
        counts[v] = (counts[v] || 0) + 1;
      });
      return Object.entries(counts).map(([name, count]) => ({
        name,
        count,
        pct: pct(count)
      })).sort((a, b) => b.count - a.count);
    };

    const demografia = {
      porEdad: computeDistribution('edad'),
      porGenero: computeDistribution('genero'),
      porEducacion: computeDistribution('educacion')
    };

    // 9. Auditoría de Encuestadores
    const encuestadoresMap = {};
    allRows.forEach(r => {
      const email = cleanStr(r.encuestador) || 'Sin registrar';
      if (!encuestadoresMap[email]) {
        encuestadoresMap[email] = {
          email,
          totalCasos: 0,
          casosFiltrados: 0,
          primerRegistro: r.fecha || '',
          ultimoRegistro: r.fecha || ''
        };
      }
      encuestadoresMap[email].totalCasos++;
    });

    filteredRows.forEach(r => {
      const email = cleanStr(r.encuestador) || 'Sin registrar';
      if (encuestadoresMap[email]) {
        encuestadoresMap[email].casosFiltrados++;
      }
    });

    const listaEncuestadores = Object.values(encuestadoresMap).sort((a, b) => b.totalCasos - a.totalCasos);

    // 10. KPIs de Resumen Ejecutivo
    const kpis = {
      totalMuestra: total,
      totalUniverso: allRows.length,
      pctFiltrada: allRows.length > 0 ? parseFloat(((total / allRows.length) * 100).toFixed(1)) : 100,
      pctCambio: eleccionMunicipal.pctCambio,
      pctContinuidad: eleccionMunicipal.pctContinuidad,
      netoFerrer: gestionFerrer.diferencial,
      netoLlaryora: gestionLlaryora.diferencial,
      netoMilei: gestionMilei.diferencial,
      totalEncuestadores: Object.keys(encuestadoresMap).length,
      fechaUltimaRespuesta: allRows.length > 0 ? allRows[allRows.length - 1].fecha : '—'
    };

    return {
      success: true,
      fromServer: rawData.fromServer,
      isFallback: rawData.isFallback || false,
      sheetTitle: rawData.sheetTitle,
      updatedAt: rawData.updatedAt,
      kpis,
      gestiones: {
        milei: gestionMilei,
        llaryora: gestionLlaryora,
        ferrer: gestionFerrer
      },
      eleccionMunicipal,
      rankingProblemas,
      dirigentesLocales,
      dirigentesDepartamentales,
      gobernadorP11,
      escenariosP12,
      rankingVoto2023,
      demografia,
      listaEncuestadores,
      rows: filteredRows
    };
  },

  /**
   * Exporta las respuestas actuales en formato CSV para descarga directa
   */
  exportCsv(rows, filename = 'encuesta_rio_tercero_2026.csv') {
    if (!rows || rows.length === 0) return;

    const headers = [
      'Nro',
      'Fecha',
      'Encuestador',
      'Edad',
      'Género',
      'Nivel Educativo',
      'Gestión Milei',
      'Gestión Llaryora',
      'Gestión Marcos Ferrer',
      'Problemas Localidad',
      'Elección Intendente (Cambio/Continuidad)',
      'Preferencia Gobernador P11',
      'Escenario 1',
      'Escenario 2',
      'Escenario 3',
      'Escenario 4',
      'Escenario 5',
      'Voto Presidente 2023'
    ];

    const csvRows = [
      headers.join(';'),
      ...rows.map(r => [
        r._rowIndex || '',
        `"${cleanStr(r.fecha)}"`,
        `"${cleanStr(r.encuestador)}"`,
        `"${cleanStr(r.edad)}"`,
        `"${cleanStr(r.genero)}"`,
        `"${cleanStr(r.educacion)}"`,
        `"${cleanStr(r.gestion_milei)}"`,
        `"${cleanStr(r.gestion_llaryora)}"`,
        `"${cleanStr(r.gestion_ferrer)}"`,
        `"${(r.problemas || []).join(' | ')}"`,
        `"${cleanStr(r.cambio_continuidad)}"`,
        `"${cleanStr(r.voto_gobernador)}"`,
        `"${cleanStr(r.escenario_1)}"`,
        `"${cleanStr(r.escenario_2)}"`,
        `"${cleanStr(r.escenario_3)}"`,
        `"${cleanStr(r.escenario_4)}"`,
        `"${cleanStr(r.escenario_5)}"`,
        `"${cleanStr(r.voto_2023)}"`
      ].join(';'))
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvRows], { type: 'text/csv;charset=utf-8;' });
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
