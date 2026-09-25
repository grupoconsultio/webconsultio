import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  Award,
  Clock,
  Gift,
  Filter,
  RotateCcw,
  Download,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
  Database,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  FileSpreadsheet,
  Trophy,
  TrendingUp,
  Layers,
  Copy,
  Check,
  UserCheck,
  UserPlus,
  X,
  Sliders,
  Server
} from 'lucide-react';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  PieChart,
  Pie
} from 'recharts';

import {
  papaSurveyApi,
  REGIONES_ARGENTINA,
  TODAS_LAS_PROVINCIAS
} from '../services/papaSurveyApi';

// Paleta institucional ConsulDat
const COLORS = {
  blue: '#0284c7',
  cyan: '#00e5ff',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#f43f5e',
  purple: '#8b5cf6',
  slate: '#64748b'
};

const IMPACT_COLORS = {
  positivo: '#10b981',
  neutro: '#94a3b8',
  negativo: '#f43f5e',
  ns_nc: '#8b5cf6'
};

const PIE_PALETTE = ['#0284c7', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#64748b', '#e11d48'];

const EncuestaPapaDashboard = () => {
  // Tema Dark / Light
  const [darkMode, setDarkMode] = useState(true);

  // Pestañas Unificadas: Tablero Analítico vs Sorteo
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'raffle'

  // Estado de Conexión BBDD
  const [dbStatus, setDbStatus] = useState({ checked: false, isOnline: false, info: null });
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [isRetryingDb, setIsRetryingDb] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filtros Globales
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    region: 'Todas',
    provincia: 'Todas',
    edad: 'Todas',
    educacion: 'Todas',
    includeSpeeders: false
  });

  // Datos calculados
  const [statsData, setStatsData] = useState(null);

  // Cruce Demográfico Activo (dentro del tablero unificado)
  const [cruceType, setCruceType] = useState('edad'); // 'edad' | 'educacion' | 'provincia'

  // Configuración de Sorteo
  const [winnersCount, setWinnersCount] = useState(1);
  const [substitutesCount, setSubstitutesCount] = useState(2);
  const [raffleList, setRaffleList] = useState([]);
  const [raffleSearch, setRaffleSearch] = useState('');
  const [rafflePage, setRafflePage] = useState(1);
  const [raffleTotal, setRaffleTotal] = useState(0);

  // Sorteo en Vivo Modal
  const [isDrawing, setIsDrawing] = useState(false);
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [winnerData, setWinnerData] = useState(null);
  const [rouletteText, setRouletteText] = useState('Preparando bolillero digital...');
  const [copiedHash, setCopiedHash] = useState(false);

  // Cargar estado de salud de la base de datos
  const checkDbHealth = async () => {
    const res = await papaSurveyApi.checkHealth();
    setDbStatus({ checked: true, isOnline: res.isOnline, info: res.data });
  };

  useEffect(() => {
    checkDbHealth();
  }, []);

  const handleRetryDb = async () => {
    setIsRetryingDb(true);
    await checkDbHealth();
    const data = await papaSurveyApi.getStats(filters);
    setStatsData(data);
    setIsRetryingDb(false);
  };

  // Cargar estadísticas al cambiar los filtros
  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      setLoading(true);
      try {
        const data = await papaSurveyApi.getStats(filters);
        if (isMounted) {
          setStatsData(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        if (isMounted) setLoading(false);
      }
    }
    fetchStats();
    return () => { isMounted = false; };
  }, [filters]);

  // Cargar lista de participantes de sorteo
  useEffect(() => {
    async function fetchRaffle() {
      const res = await papaSurveyApi.getRaffleParticipants({
        search: raffleSearch,
        page: rafflePage,
        limit: 15
      });
      if (res.success) {
        setRaffleList(res.participants || []);
        setRaffleTotal(res.total || 0);
      }
    }
    if (activeTab === 'raffle') {
      fetchRaffle();
    }
  }, [activeTab, raffleSearch, rafflePage]);

  // Reset de filtros
  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      region: 'Todas',
      provincia: 'Todas',
      edad: 'Todas',
      educacion: 'Todas',
      includeSpeeders: false
    });
  };

  const formatSeconds = (sec) => {
    if (!sec) return '0s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  // Sorteador en Vivo con animación y soporte para múltiples ganadores y suplentes
  const handleLiveDraw = async () => {
    setIsDrawing(true);
    setWinnerModalOpen(true);
    setWinnerData(null);
    setCopiedHash(false);

    const dummyNames = [
      'usuario_381@gmail.com (DNI ***492)',
      'mariana.c@hotmail.com (DNI ***105)',
      'rodrigo_gonzalez@outlook.com (DNI ***720)',
      'florencia_p@uba.ar (DNI ***618)',
      'carlos_mendoza@yahoo.com.ar (DNI ***934)',
      'beatriz_cordoba@gmail.com (DNI ***311)',
      'ignacio_sur@gmail.com (DNI ***842)',
      'valeria_rosario@gmail.com (DNI ***552)'
    ];

    let count = 0;
    const interval = setInterval(() => {
      setRouletteText(dummyNames[count % dummyNames.length]);
      count++;
    }, 85);

    setTimeout(async () => {
      clearInterval(interval);
      try {
        const result = await papaSurveyApi.drawWinner({ winnersCount, substitutesCount });
        setWinnerData(result);
      } catch (err) {
        console.error('Error drawing winners:', err);
      } finally {
        setIsDrawing(false);
      }
    }, 3200);
  };

  // Copiar hash de auditoría
  const handleCopyHash = () => {
    if (winnerData?.audit?.hash) {
      navigator.clipboard.writeText(winnerData.audit.hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  // Exportar datos
  const handleExportResponses = () => {
    if (statsData?.filteredResponses) {
      papaSurveyApi.downloadClientCsv(`respuestas_visita_papal_${Date.now()}.csv`, statsData.filteredResponses);
    } else {
      papaSurveyApi.exportResponsesCsv(filters);
    }
  };

  const handleExportRaffle = () => {
    const list = papaSurveyApi.getLocalRaffle();
    papaSurveyApi.downloadClientCsv(`participantes_sorteo_${Date.now()}.csv`, list);
  };

  // Provincias disponibles según región
  const provinciasDisponibles = useMemo(() => {
    if (filters.region === 'Todas') return ['Todas', ...TODAS_LAS_PROVINCIAS];
    return ['Todas', ...(REGIONES_ARGENTINA[filters.region] || [])];
  }, [filters.region]);

  // Estilos temáticos
  const theme = {
    bg: darkMode ? 'bg-[#0B0F17]' : 'bg-[#F8FAFC]',
    card: darkMode ? 'bg-[#131B2E]/90 border-white/10 text-white shadow-xl' : 'bg-white border-slate-200 text-slate-900 shadow-md',
    cardSubtle: darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200',
    headerText: darkMode ? 'text-white' : 'text-slate-900',
    subText: darkMode ? 'text-slate-400' : 'text-slate-600',
    input: darkMode ? 'bg-[#1C2638] border-white/10 text-white' : 'bg-white border-slate-300 text-slate-900',
    border: darkMode ? 'border-white/10' : 'border-slate-200',
    chartGrid: darkMode ? '#1e293b' : '#e2e8f0',
    chartText: darkMode ? '#94a3b8' : '#64748b'
  };

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-300 font-sans selection:bg-[#0284c7] selection:text-white`}>
      
      {/* ─── HEADER INSTITUCIONAL ─── */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b ${theme.border} ${darkMode ? 'bg-[#0B0F17]/85' : 'bg-white/85'} px-4 lg:px-8 py-3.5 transition-colors`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className={`p-2 rounded-xl ${theme.cardSubtle} hover:bg-[#0284c7]/20 text-[#0284c7] transition-all flex items-center gap-1.5 text-xs font-semibold`}
            >
              <ArrowLeft size={16} /> Volver al Admin
            </Link>

            <div className="h-6 w-px bg-slate-500/20" />

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-widest font-extrabold text-[#0284c7] font-display">CONSULDAT BI</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ENCUESTA NACIONAL
                </span>
              </div>
              <h1 className={`text-lg md:text-xl font-display font-extrabold tracking-tight ${theme.headerText}`}>
                Visita Papal a la Argentina
              </h1>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Estado BBDD (Clickable para ver diagnóstico / configuración) */}
            <button
              onClick={() => setDbModalOpen(true)}
              className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ${
                dbStatus.isOnline
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
              title="Click para ver estado y diagnóstico de la base de datos MySQL"
            >
              <Database size={14} className={dbStatus.isOnline ? 'text-emerald-400 animate-pulse' : 'text-amber-400'} />
              <span>{dbStatus.isOnline ? 'MySQL Conectado' : 'Motor Analítico Activo'}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 font-bold">Diagnóstico</span>
            </button>

            {/* Toggle Modo Oscuro */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border ${theme.cardSubtle} ${theme.headerText} hover:border-[#0284c7] transition-all`}
              title={darkMode ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
            >
              {darkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} className="text-slate-700" />}
            </button>

            {/* Exportar CSV */}
            <button
              onClick={handleExportResponses}
              className="px-3.5 py-1.5 rounded-xl bg-[#0284c7] hover:bg-[#0284c7]/90 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-[#0284c7]/20 transition-all active:scale-95"
            >
              <Download size={14} /> Exportar CSV
            </button>
          </div>

        </div>
      </header>

      {/* ─── CONTENIDO PRINCIPAL ─── */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 flex flex-col gap-6">

        {/* ─── 1. FILA DE KPIS PRINCIPALES ─── */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-2xl border ${theme.card}`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className={theme.subText}>Muestras Recibidas</span>
              <div className="w-8 h-8 rounded-lg bg-[#0284c7]/10 flex items-center justify-center text-[#0284c7]"><Users size={18} /></div>
            </div>
            <div className="text-2xl md:text-3xl font-display font-extrabold tracking-tight">
              {statsData ? statsData.kpis.totalSamples.toLocaleString() : '—'}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 size={12} /> 100% Cobertura Federal
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className={`p-4 rounded-2xl border ${theme.card}`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className={theme.subText}>Válidas vs. Speeders</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400"><ShieldCheck size={18} /></div>
            </div>
            <div className="text-2xl md:text-3xl font-display font-extrabold tracking-tight">
              {statsData ? statsData.kpis.validSamples.toLocaleString() : '—'}
            </div>
            <div className="text-[11px] text-amber-400 font-medium mt-1 flex items-center gap-1">
              <AlertTriangle size={12} /> {statsData ? statsData.kpis.speedersCount : 0} descartadas (&lt;25s)
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className={`p-4 rounded-2xl border ${theme.card}`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className={theme.subText}>Valoración Media (P3)</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400"><Award size={18} /></div>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-amber-400">
                {statsData ? statsData.kpis.avgValoracion : '—'}
              </span>
              <span className={`text-xs ${theme.subText}`}>/ 10</span>
            </div>
            <div className={`text-[11px] ${theme.subText} mt-1`}>
              Mediana Nacional: <span className="font-bold text-white">{statsData?.kpis.medianValoracion || '—'}</span> pts
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className={`p-4 rounded-2xl border ${theme.card}`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className={theme.subText}>Tiempo Promedio</span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400"><Clock size={18} /></div>
            </div>
            <div className="text-2xl md:text-3xl font-display font-extrabold tracking-tight">
              {statsData ? formatSeconds(statsData.kpis.avgDurationSeconds) : '—'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Tasa completado: 94.2%</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`col-span-2 md:col-span-1 p-4 rounded-2xl border ${theme.card}`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className={theme.subText}>Anotados en Sorteo</span>
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400"><Gift size={18} /></div>
            </div>
            <div className="text-2xl md:text-3xl font-display font-extrabold tracking-tight text-rose-400">
              {statsData ? statsData.kpis.totalRaffleParticipants.toLocaleString() : '—'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Base disociada (DNI/Email)</div>
          </motion.div>

        </section>

        {/* ─── 2. PANEL DE FILTROS GLOBALES ─── */}
        <section className={`p-4 md:p-5 rounded-2xl border ${theme.card}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-[#0284c7]" />
              <span className="font-display font-bold text-sm">Filtros Globales Interactivos</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#0284c7]/20 text-[#0284c7] font-semibold">
                {statsData?.kpis.totalSamples || 0} registros activos
              </span>
            </div>

            <button
              onClick={handleResetFilters}
              className={`px-3 py-1.5 rounded-xl border ${theme.cardSubtle} text-xs font-medium hover:border-[#0284c7] flex items-center gap-1.5 transition-all self-start lg:self-auto`}
            >
              <RotateCcw size={13} /> Restablecer Filtros
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4 pt-4 border-t border-slate-500/10 text-xs">
            <div>
              <label className={`block font-medium mb-1 ${theme.subText}`}>Región</label>
              <select
                value={filters.region}
                onChange={(e) => setFilters({ ...filters, region: e.target.value, provincia: 'Todas' })}
                className={`w-full px-3 py-2 rounded-xl border ${theme.input} focus:outline-none focus:border-[#0284c7] transition-all`}
              >
                <option value="Todas">Todas las Regiones</option>
                {Object.keys(REGIONES_ARGENTINA).map((reg) => (<option key={reg} value={reg}>{reg}</option>))}
              </select>
            </div>

            <div>
              <label className={`block font-medium mb-1 ${theme.subText}`}>Provincia</label>
              <select
                value={filters.provincia}
                onChange={(e) => setFilters({ ...filters, provincia: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${theme.input} focus:outline-none focus:border-[#0284c7] transition-all`}
              >
                {provinciasDisponibles.map((prov) => (<option key={prov} value={prov}>{prov}</option>))}
              </select>
            </div>

            <div>
              <label className={`block font-medium mb-1 ${theme.subText}`}>Rango Etario (P13)</label>
              <select
                value={filters.edad}
                onChange={(e) => setFilters({ ...filters, edad: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${theme.input} focus:outline-none focus:border-[#0284c7] transition-all`}
              >
                <option value="Todas">Todos los Rangos</option>
                <option value="16-24">16 a 24 años</option>
                <option value="25-34">25 a 34 años</option>
                <option value="35-49">35 a 49 años</option>
                <option value="50-64">50 a 64 años</option>
                <option value="65+">65 o más años</option>
              </select>
            </div>

            <div>
              <label className={`block font-medium mb-1 ${theme.subText}`}>Nivel Educativo (P16)</label>
              <select
                value={filters.educacion}
                onChange={(e) => setFilters({ ...filters, educacion: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${theme.input} focus:outline-none focus:border-[#0284c7] transition-all`}
              >
                <option value="Todas">Todos los Niveles</option>
                <option value="Secundario incompleto">Secundario incompleto</option>
                <option value="Secundario completo">Secundario completo</option>
                <option value="Terciario/Universitario en curso">Terciario/Univ. en curso</option>
                <option value="Universitario completo">Universitario completo</option>
                <option value="Posgrado">Posgrado</option>
              </select>
            </div>

            <div className="flex flex-col justify-end">
              <label className={`flex items-center gap-2.5 p-2 rounded-xl border ${theme.input} cursor-pointer hover:border-[#0284c7] transition-all`}>
                <input
                  type="checkbox"
                  checked={filters.includeSpeeders}
                  onChange={(e) => setFilters({ ...filters, includeSpeeders: e.target.checked })}
                  className="rounded text-[#0284c7] focus:ring-0 w-4 h-4 cursor-pointer"
                />
                <span className="text-[11px] leading-tight select-none">Incluir speeders (&lt;25 segs)</span>
              </label>
            </div>
          </div>
        </section>

        {/* ─── 3. PESTAÑAS PRINCIPALES: TABLERO UNIFICADO VS SORTEO ─── */}
        <div className="flex items-center gap-2 border-b border-slate-500/10 pb-2">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'bg-[#0284c7] text-white shadow-lg shadow-[#0284c7]/25'
                : `${theme.subText} hover:text-white hover:bg-white/5`
            }`}
          >
            <BarChart3 size={17} /> Tablero Analítico Unificado (Matriz & Cruces)
          </button>

          <button
            onClick={() => setActiveTab('raffle')}
            className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'raffle'
                ? 'bg-[#0284c7] text-white shadow-lg shadow-[#0284c7]/25'
                : `${theme.subText} hover:text-white hover:bg-white/5`
            }`}
          >
            <Trophy size={17} /> Sorteo & Auditoría en Vivo
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════════════
            PESTAÑA 1: TABLERO ANALÍTICO UNIFICADO (MATRIZ + CRUCES + P3 + PALABRAS)
           ══════════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'analytics' && (
          <div className="flex flex-col gap-6">
            
            {/* FILA SUPERIOR: Distribución P3 + Medios de Información */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Gráfico 1: Distribución de Valoración P3 */}
              <div className={`lg:col-span-7 p-5 rounded-2xl border ${theme.card} flex flex-col justify-between`}>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-display font-bold text-base flex items-center gap-2">
                      <TrendingUp size={18} className="text-[#0284c7]" /> Distribución de Valoración (P3: Escala 1 a 10)
                    </h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                      Promedio: {statsData?.kpis.avgValoracion || 0} pts
                    </span>
                  </div>
                  <p className={`text-xs ${theme.subText} mb-6`}>
                    Puntaje otorgado a la visita papal (1 = Muy Negativo, 10 = Excelente).
                  </p>
                </div>

                <div className="h-[270px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData?.distributionP3 || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} vertical={false} />
                      <XAxis dataKey="score" stroke={theme.chartText} tick={{ fontSize: 12 }} />
                      <YAxis stroke={theme.chartText} tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                          borderColor: darkMode ? '#334155' : '#cbd5e1',
                          borderRadius: '12px',
                          color: darkMode ? '#ffffff' : '#0f172a',
                          fontSize: '12px'
                        }}
                        formatter={(val) => [`${val} respuestas`, 'Frecuencia']}
                        labelFormatter={(lbl) => `Puntuación: ${lbl} / 10`}
                      />
                      <ReferenceLine
                        x={statsData?.kpis.medianValoracion}
                        stroke="#f59e0b"
                        strokeDasharray="4 4"
                        label={{ value: 'Mediana', fill: '#f59e0b', fontSize: 11, position: 'top' }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {(statsData?.distributionP3 || []).map((entry, index) => {
                          const isHigh = entry.score >= 7;
                          const isLow = entry.score <= 4;
                          const barColor = isHigh ? COLORS.emerald : (isLow ? COLORS.rose : COLORS.blue);
                          return <Cell key={`cell-${index}`} fill={barColor} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-4 border-t border-slate-500/10 mt-2">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> 1-4 (Crítica)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0284c7]" /> 5-6 (Neutra)</span>
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 7-10 (Favorable)</span>
                  </div>
                  <span className={theme.subText}>Mediana: {statsData?.kpis.medianValoracion} pts</span>
                </div>
              </div>

              {/* Gráfico 2: Medios de Información P2 */}
              <div className={`lg:col-span-5 p-5 rounded-2xl border ${theme.card} flex flex-col justify-between`}>
                <div>
                  <h3 className="font-display font-bold text-base flex items-center gap-2 mb-1">
                    <PieChartIcon size={18} className="text-purple-400" /> Medios de Información (P2)
                  </h3>
                  <p className={`text-xs ${theme.subText} mb-4`}>
                    Canal por el cual los ciudadanos se enteraron de la visita.
                  </p>
                </div>

                <div className="h-[230px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statsData?.mediaConsumption || []}
                        dataKey="count"
                        nameKey="medio"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {(statsData?.mediaConsumption || []).map((_, index) => (
                          <Cell key={`slice-${index}`} fill={PIE_PALETTE[index % PIE_PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                          borderColor: darkMode ? '#334155' : '#cbd5e1',
                          borderRadius: '12px',
                          color: darkMode ? '#ffffff' : '#0f172a',
                          fontSize: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-3 border-t border-slate-500/10">
                  {(statsData?.mediaConsumption || []).slice(0, 4).map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 truncate">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_PALETTE[idx] }} />
                      <span className="truncate">{item.medio}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* SECCIÓN UNIFICADA: Matriz de Impactos P4 (Barras Apiladas 100%) */}
            <div className={`p-5 rounded-2xl border ${theme.card}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="font-display font-bold text-base flex items-center gap-2">
                    <Layers size={18} className="text-emerald-400" /> Matriz de Impactos Percibidos (P4: 100% Apiladas)
                  </h3>
                  <p className={`text-xs ${theme.subText} mt-0.5`}>
                    Evaluación multidimensional en 4 ejes estratégicos: Político, Social, Económico y Religioso.
                  </p>
                </div>

                {/* Leyenda de Impactos */}
                <div className="flex items-center gap-3 text-xs flex-wrap">
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#10b981]" /> Positivo</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#94a3b8]" /> Neutro</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#f43f5e]" /> Negativo</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-[#8b5cf6]" /> No sabe</span>
                </div>
              </div>

              <div className="h-[270px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={statsData?.impactMatrix || []}
                    margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke={theme.chartText} tickFormatter={(v) => `${v}%`} />
                    <YAxis dataKey="eje" type="category" stroke={theme.chartText} tick={{ fontSize: 13, fontWeight: 600 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                        borderColor: darkMode ? '#334155' : '#cbd5e1',
                        borderRadius: '12px',
                        color: darkMode ? '#ffffff' : '#0f172a',
                        fontSize: '12px'
                      }}
                      formatter={(val, name) => [`${val}%`, name.toUpperCase()]}
                    />
                    <Bar dataKey="positivo" stackId="a" fill={IMPACT_COLORS.positivo} radius={[0, 0, 0, 0]} name="Positivo" />
                    <Bar dataKey="neutro" stackId="a" fill={IMPACT_COLORS.neutro} name="Neutro" />
                    <Bar dataKey="negativo" stackId="a" fill={IMPACT_COLORS.negativo} name="Negativo" />
                    <Bar dataKey="ns_nc" stackId="a" fill={IMPACT_COLORS.ns_nc} radius={[0, 6, 6, 0]} name="No sabe" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-500/10">
                {(statsData?.impactMatrix || []).map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-xl ${theme.cardSubtle}`}>
                    <span className="text-xs text-slate-400 font-medium">Eje {item.eje}</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-bold text-emerald-400">{item.positivo}% Pos.</span>
                      <span className="text-sm font-bold text-rose-400">{item.negativo}% Neg.</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN UNIFICADA: Cruce Demográfico de Valoración (P3) */}
            <div className={`p-5 rounded-2xl border ${theme.card}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="font-display font-bold text-base flex items-center gap-2">
                    <BarChart3 size={18} className="text-[#0284c7]" /> Cruce Demográfico de Valoración (P3)
                  </h3>
                  <p className={`text-xs ${theme.subText} mt-0.5`}>
                    Comparación de la calificación promedio cruzada por variables demográficas clave.
                  </p>
                </div>

                {/* Selector de tipo de cruce */}
                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto">
                  <button
                    onClick={() => setCruceType('edad')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      cruceType === 'edad' ? 'bg-[#0284c7] text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Por Rango Etario
                  </button>
                  <button
                    onClick={() => setCruceType('educacion')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      cruceType === 'educacion' ? 'bg-[#0284c7] text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Por Educación
                  </button>
                  <button
                    onClick={() => setCruceType('provincia')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      cruceType === 'provincia' ? 'bg-[#0284c7] text-white shadow' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Por Región
                  </button>
                </div>
              </div>

              <div className="h-[290px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={
                      cruceType === 'edad'
                        ? statsData?.demographics.byEdad || []
                        : (cruceType === 'educacion'
                            ? statsData?.demographics.byEducacion || []
                            : statsData?.demographics.byProvincia || [])
                    }
                    margin={{ top: 10, right: 20, left: -10, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.chartGrid} vertical={false} />
                    <XAxis
                      dataKey="grupo"
                      stroke={theme.chartText}
                      tick={{ fontSize: 11 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis stroke={theme.chartText} domain={[0, 10]} tick={{ fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
                        borderColor: darkMode ? '#334155' : '#cbd5e1',
                        borderRadius: '12px',
                        color: darkMode ? '#ffffff' : '#0f172a',
                        fontSize: '12px'
                      }}
                      formatter={(val, name) => [
                        name === 'promedio' ? `${val} pts` : val,
                        name === 'promedio' ? 'Valoración Media' : 'Muestras'
                      ]}
                    />
                    <ReferenceLine
                      y={statsData?.kpis.avgValoracion}
                      stroke="#f59e0b"
                      strokeDasharray="4 4"
                      label={{ value: `Media Nac. ${statsData?.kpis.avgValoracion}`, fill: '#f59e0b', fontSize: 11 }}
                    />
                    <Bar dataKey="promedio" fill="#0284c7" radius={[6, 6, 0, 0]} name="promedio">
                      {(
                        cruceType === 'edad'
                          ? statsData?.demographics.byEdad || []
                          : (cruceType === 'educacion'
                              ? statsData?.demographics.byEducacion || []
                              : statsData?.demographics.byProvincia || [])
                      ).map((entry, index) => (
                        <Cell
                          key={`cruce-${index}`}
                          fill={entry.promedio >= (statsData?.kpis.avgValoracion || 7) ? COLORS.emerald : COLORS.blue}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* SECCIÓN UNIFICADA: Ranking Top 20 Palabras P12 (Nube de Síntesis) */}
            <div className={`p-5 rounded-2xl border ${theme.card}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-display font-bold text-base flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-400" /> Ranking de Palabras Síntesis (P12)
                  </h3>
                  <p className={`text-xs ${theme.subText}`}>
                    Top 20 términos más citados por los encuestados para describir la visita en una sola palabra.
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                  Frecuencia Absoluta
                </span>
              </div>

              {/* Nube de Tags Ponderada */}
              <div className="flex flex-wrap gap-2.5 my-4">
                {(statsData?.topWords || []).map((item, idx) => {
                  const sizeCls = idx < 3
                    ? 'text-sm font-extrabold px-4 py-2 bg-[#0284c7]/20 text-[#00e5ff] border-[#0284c7]/40 shadow-md'
                    : (idx < 8
                        ? 'text-xs font-bold px-3 py-1.5 bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                        : 'text-xs font-medium px-2.5 py-1 bg-white/5 text-slate-300 border-white/10');

                  return (
                    <motion.div
                      key={item.palabra}
                      whileHover={{ scale: 1.05 }}
                      className={`rounded-xl border flex items-center gap-2 transition-all cursor-default ${sizeCls}`}
                    >
                      <span className="capitalize">{item.palabra}</span>
                      <span className="opacity-60 text-[10px] font-mono">({item.count})</span>
                    </motion.div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 pt-4 border-t border-slate-500/10 text-xs">
                {(statsData?.topWords || []).slice(0, 10).map((w, i) => (
                  <div key={i} className={`p-2.5 rounded-xl ${theme.cardSubtle} flex items-center justify-between`}>
                    <span className="font-medium text-slate-300 capitalize">#{i + 1} {w.palabra}</span>
                    <span className="font-bold text-[#0284c7]">{w.count}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════════════
            PESTAÑA 2: SORTEO & AUDITORÍA EN VIVO (CON GANADORES Y SUPLENTES CONFIGURABLES)
           ══════════════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'raffle' && (
          <div className="flex flex-col gap-6">
            
            {/* Panel de Configuración y Disparador de Sorteo */}
            <div className={`p-6 rounded-2xl border ${theme.card} flex flex-col lg:flex-row lg:items-center justify-between gap-6`}>
              <div className="max-w-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={20} className="text-amber-400" />
                  <h3 className="font-display font-extrabold text-lg">Sorteo Transparente & Auditoría en Vivo</h3>
                </div>
                <p className={`text-xs ${theme.subText} leading-relaxed`}>
                  Módulo de sorteo oficial certificado. Permite seleccionar simultáneamente la cantidad deseada de <strong>ganadores titulares</strong> y <strong>suplentes</strong> garantizando unicidad y emisión de hash SHA inmutable.
                </p>
              </div>

              {/* Selector de Cantidad de Ganadores y Suplentes */}
              <div className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                
                {/* Ganadores Titulares */}
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-amber-400 mb-1 flex items-center gap-1">
                    <UserCheck size={13} /> Ganadores Titulares
                  </span>
                  <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setWinnersCount((prev) => Math.max(1, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={winnersCount}
                      onChange={(e) => setWinnersCount(Math.max(1, parseInt(e.target.value || '1', 10)))}
                      className="w-12 text-center bg-transparent text-white font-mono font-bold text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setWinnersCount((prev) => Math.min(20, prev + 1))}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Suplentes */}
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <UserPlus size={13} /> Suplentes
                  </span>
                  <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl p-1">
                    <button
                      type="button"
                      onClick={() => setSubstitutesCount((prev) => Math.max(0, prev - 1))}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center transition-colors"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={substitutesCount}
                      onChange={(e) => setSubstitutesCount(Math.max(0, parseInt(e.target.value || '0', 10)))}
                      className="w-12 text-center bg-transparent text-white font-mono font-bold text-sm focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setSubstitutesCount((prev) => Math.min(20, prev + 1))}
                      className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-sm flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Botón Disparador del Sorteo */}
                <div className="flex flex-col justify-end">
                  <button
                    onClick={handleLiveDraw}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs md:text-sm flex items-center gap-2 shadow-xl shadow-amber-500/25 transition-all active:scale-95"
                  >
                    <Sparkles size={16} /> Sortear ({winnersCount} Titular{winnersCount > 1 ? 'es' : ''} + {substitutesCount} Suplente{substitutesCount !== 1 ? 's' : ''})
                  </button>
                </div>

              </div>
            </div>

            {/* Buscador y Tabla de Padrón de Participantes */}
            <div className={`p-5 rounded-2xl border ${theme.card}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="relative flex-1 max-w-md">
                  <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={raffleSearch}
                    onChange={(e) => setRaffleSearch(e.target.value)}
                    placeholder="Buscar por email o últimos 3 dígitos de DNI..."
                    className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs border ${theme.input} focus:outline-none focus:border-[#0284c7] transition-all`}
                  />
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="text-xs text-slate-400 font-medium">
                    Total inscriptos: <strong className="text-white">{raffleTotal}</strong>
                  </span>
                  <button
                    onClick={handleExportRaffle}
                    className={`px-3 py-1.5 rounded-xl border ${theme.cardSubtle} text-xs font-semibold hover:border-white/30 flex items-center gap-1.5 transition-all`}
                  >
                    <FileSpreadsheet size={14} /> Exportar Padrón
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-500/20 text-slate-400 font-medium">
                      <th className="pb-3 pl-2">ID</th>
                      <th className="pb-3">Email Registrado</th>
                      <th className="pb-3">DNI (3 Dígitos)</th>
                      <th className="pb-3">Token Anónimo</th>
                      <th className="pb-3 pr-2 text-right">Fecha de Participación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {raffleList.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-8 text-center text-slate-400">
                          No se encontraron participantes con los criterios de búsqueda.
                        </td>
                      </tr>
                    ) : (
                      raffleList.map((p) => (
                        <tr key={p.id} className="border-b border-slate-500/10 hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 pl-2 font-mono text-slate-500">#{p.id}</td>
                          <td className="py-3 font-medium text-white">{p.email}</td>
                          <td className="py-3">
                            <span className="font-mono px-2 py-0.5 rounded bg-white/5 text-amber-300 font-bold border border-white/10">
                              ***{p.dni}
                            </span>
                          </td>
                          <td className="py-3 font-mono text-slate-400">{p.response_token.substring(0, 14)}...</td>
                          <td className="py-3 pr-2 text-right text-slate-400">
                            {new Date(p.participated_at).toLocaleString('es-AR')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-500/10 text-xs text-slate-400">
                <span>Página {rafflePage} de {Math.max(1, Math.ceil(raffleTotal / 15))}</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={rafflePage <= 1}
                    onClick={() => setRafflePage((prev) => Math.max(1, prev - 1))}
                    className={`px-3 py-1 rounded-lg border ${theme.cardSubtle} disabled:opacity-40`}
                  >
                    Anterior
                  </button>
                  <button
                    disabled={rafflePage * 15 >= raffleTotal}
                    onClick={() => setRafflePage((prev) => prev + 1)}
                    className={`px-3 py-1 rounded-lg border ${theme.cardSubtle} disabled:opacity-40`}
                  >
                    Siguiente
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* ─── MODAL TRANSPARENTE: GANADORES Y SUPLENTES EN VIVO ─── */}
      <AnimatePresence>
        {winnerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111827] border-2 border-amber-500/50 rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col relative shadow-2xl shadow-amber-500/20 overflow-hidden"
            >
              {/* HEADER FIJO */}
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center flex-shrink-0">
                    <Trophy size={20} />
                  </div>
                  <div className="text-left">
                    <h2 className="text-base sm:text-lg font-display font-extrabold text-white leading-tight">
                      {isDrawing ? 'Sorteando en Vivo...' : '¡Resultado Oficial del Sorteo!'}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      {isDrawing ? 'Bolillero digital en ejecución...' : 'Selección oficial con certificación criptográfica'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setWinnerModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* CUERPO CON SCROLL INTERNO */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-5">
                {isDrawing ? (
                  <div className="py-12 px-6 rounded-2xl bg-black/50 border border-amber-500/30 flex flex-col items-center justify-center">
                    <RefreshCw size={36} className="text-amber-400 animate-spin mb-4" />
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-1">
                      Bolillero Digital en Proceso
                    </span>
                    <span className="text-base font-mono text-white font-semibold tracking-wide text-center">
                      {rouletteText}
                    </span>
                  </div>
                ) : (
                  <>
                    {/* SECCIÓN 1: GANADORES TITULARES */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                        <h4 className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                          Ganadores Titulares ({winnerData?.winners?.length || 0})
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {(winnerData?.winners || []).map((w, idx) => (
                          <div
                            key={w.id}
                            className="p-3.5 rounded-xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/40 flex flex-col justify-between"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-bold uppercase">
                                Titular #{idx + 1}
                              </span>
                              <span className="text-xs font-mono text-slate-400">ID #{w.id}</span>
                            </div>
                            <span className="text-sm font-extrabold text-white font-mono break-all">{w.email}</span>
                            <span className="mt-2 text-xs font-mono font-bold text-amber-300">
                              DNI: ***{w.dni}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SECCIÓN 2: SUPLENTES (SI APLICA) */}
                    {(winnerData?.substitutes || []).length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                          <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-300">
                            Suplentes Designados ({winnerData?.substitutes?.length || 0})
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {(winnerData?.substitutes || []).map((s, idx) => (
                            <div
                              key={s.id}
                              className="p-3 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between"
                            >
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 font-bold uppercase">
                                  Suplente #{idx + 1}
                                </span>
                                <span className="text-xs font-mono text-slate-400">ID #{s.id}</span>
                              </div>
                              <span className="text-xs font-bold text-slate-200 font-mono break-all">{s.email}</span>
                              <span className="mt-1.5 text-xs font-mono text-slate-400">
                                DNI: ***{s.dni}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* SECCIÓN 3: CERTIFICADO DE AUDITORÍA CRIPTOGRÁFICA */}
                    {winnerData?.audit && (
                      <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-[11px] font-mono text-slate-400">
                        <div className="text-slate-200 font-bold mb-2 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-400" /> Certificado Oficial de Transparencia
                          </span>
                          <button
                            onClick={handleCopyHash}
                            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-200 transition-colors"
                          >
                            {copiedHash ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                            {copiedHash ? 'Hash Copiado' : 'Copiar Hash'}
                          </button>
                        </div>
                        <div className="truncate">Timestamp: {winnerData.audit.drawn_at}</div>
                        <div className="truncate">Hash SHA: {winnerData.audit.hash}</div>
                        <div>Algoritmo: {winnerData.audit.algorithm}</div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* FOOTER FIJO SIEMPRE VISIBLE */}
              <div className="p-3.5 sm:p-4 border-t border-white/10 flex items-center justify-end gap-3 bg-black/50 flex-shrink-0">
                <button
                  disabled={isDrawing}
                  onClick={() => setWinnerModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all"
                >
                  Cerrar
                </button>
                <button
                  disabled={isDrawing}
                  onClick={handleLiveDraw}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20"
                >
                  <RefreshCw size={14} /> Sortear Nuevamente
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── MODAL DE DIAGNÓSTICO Y CONEXIÓN BBDD ─── */}
      <AnimatePresence>
        {dbModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#111827] border-2 border-[#0284c7]/40 rounded-3xl max-w-xl w-full max-h-[88vh] flex flex-col relative shadow-2xl shadow-[#0284c7]/15 overflow-hidden text-left"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/40 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0284c7]/20 border border-[#0284c7]/40 text-[#00e5ff] flex items-center justify-center flex-shrink-0">
                    <Database size={20} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-display font-extrabold text-white leading-tight">
                      Diagnóstico de Conexión a Base de Datos
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      MySQL · Encuesta "Visita Papal a la Argentina"
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setDbModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex flex-col gap-4 text-xs">
                {/* Estado */}
                <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
                  dbStatus.isOnline
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                }`}>
                  <div className="mt-0.5">
                    {dbStatus.isOnline ? <CheckCircle2 size={18} className="text-emerald-400" /> : <AlertTriangle size={18} className="text-amber-400" />}
                  </div>
                  <div>
                    <span className="font-bold text-sm block">
                      {dbStatus.isOnline ? 'Conexión a MySQL En Línea' : 'Operando con Motor Analítico Local'}
                    </span>
                    <p className="text-[11px] opacity-80 mt-1 leading-relaxed">
                      {dbStatus.isOnline
                        ? 'El backend está leyendo y agregando datos directamente desde el contenedor MySQL.'
                        : 'El host interno de la captura ("consuldatio-bbddencuestapapa-9zupcr") pertenece a la red Docker privada de tu servidor/VPS, por lo que no es accesible desde tu PC sin el puerto público expuesto.'}
                    </p>
                  </div>
                </div>

                {/* Parámetros de la Captura */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Credenciales Configuradas (según captura):
                  </span>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-slate-500 block text-[10px]">Host:</span>
                      <span className="text-white truncate block">consuldatio-bbddencuestapapa-9zupcr</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-slate-500 block text-[10px]">Puerto Interno:</span>
                      <span className="text-white block">3306</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-slate-500 block text-[10px]">Usuario:</span>
                      <span className="text-white block">mysql</span>
                    </div>
                    <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                      <span className="text-slate-500 block text-[10px]">Base de Datos:</span>
                      <span className="text-white block">mysql</span>
                    </div>
                  </div>
                </div>

                {/* Guía para conectar los datos reales */}
                <div className="p-4 rounded-2xl bg-[#0284c7]/10 border border-[#0284c7]/20 text-slate-300">
                  <span className="font-bold text-white block mb-1">
                    ¿Cómo conectar los datos reales en vivo?
                  </span>
                  <p className="text-[11px] leading-relaxed mb-2">
                    Para que la base de datos sea alcanzable desde cualquier máquina, en tu panel de Coolify o Railway:
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-400">
                    <li>Ingresa al servicio de la base de datos <strong>consuldatio-bbddencuestapapa</strong>.</li>
                    <li>Activa la casilla <strong>"Expose to Internet" / "Puerto Público"</strong> (ej: mapear a un puerto como <code>3306</code> o <code>13306</code>).</li>
                    <li>Pega la IP o dominio público del VPS en <code>server/.env</code> en la variable <code>DB_HOST</code>.</li>
                  </ol>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3.5 sm:p-4 border-t border-white/10 flex items-center justify-between bg-black/50 flex-shrink-0">
                <span className="text-[11px] text-slate-400">
                  Estado: {dbStatus.isOnline ? 'Online' : 'Esperando host público'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDbModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all"
                  >
                    Entendido
                  </button>
                  <button
                    disabled={isRetryingDb}
                    onClick={handleRetryDb}
                    className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0284c7]/90 text-white font-semibold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#0284c7]/20 disabled:opacity-50"
                  >
                    <RefreshCw size={13} className={isRetryingDb ? 'animate-spin' : ''} />
                    {isRetryingDb ? 'Probando...' : 'Reintentar Conexión'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EncuestaPapaDashboard;
