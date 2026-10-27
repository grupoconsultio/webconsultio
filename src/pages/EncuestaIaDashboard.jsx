import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Server,
  Building2,
  Compass,
  Vote,
  Target,
  MapPin,
  Briefcase,
  Bot,
  Brain,
  Zap,
  Radio,
  FileText,
  ExternalLink,
  ChevronRight,
  Eye,
  CheckCheck,
  HelpCircle,
  Scale
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
  PieChart,
  Pie
} from 'recharts';

import {
  iaSurveyApi,
  REGIONES_ARGENTINA,
  TODAS_LAS_PROVINCIAS,
  EMPTY_IA_STATS
} from '../services/iaSurveyApi';

import MapaArgentinaEncuesta from '../components/MapaArgentinaEncuesta';

// Paleta tecnológica ConsulDat
const COLORS = {
  cyan: '#00E5FF',
  purple: '#A855F7',
  blue: '#3B82F6',
  emerald: '#10B981',
  amber: '#F59E0B',
  rose: '#F43F5E',
  indigo: '#6366F1',
  slate: '#64748B'
};

const PIE_PALETTE = ['#00E5FF', '#A855F7', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#64748B'];

export default function EncuestaIaDashboard() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'political' | 'geo' | 'raffle' | 'feed'

  // Estado BBDD MySQL
  const [dbStatus, setDbStatus] = useState({ checked: false, isOnline: false, info: null });
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [isRetryingDb, setIsRetryingDb] = useState(false);
  const [loading, setLoading] = useState(true);

  // Live Real-Time Engine
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);

  // Filtros dinámicos
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    region: 'Todas',
    provincia: 'Todas',
    edad: 'Todas',
    genero: 'Todos',
    educacion: 'Todas',
    frecuencia: 'Todas',
    includeSpeeders: false
  });

  const [statsData, setStatsData] = useState(EMPTY_IA_STATS);

  // Sorteo
  const [winnersCount, setWinnersCount] = useState(1);
  const [substitutesCount, setSubstitutesCount] = useState(2);
  const [raffleList, setRaffleList] = useState([]);
  const [raffleSearch, setRaffleSearch] = useState('');
  const [rafflePage, setRafflePage] = useState(1);
  const [raffleTotal, setRaffleTotal] = useState(0);

  // Modal Ganadores Sorteo
  const [isDrawing, setIsDrawing] = useState(false);
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [winnerData, setWinnerData] = useState(null);
  const [rouletteText, setRouletteText] = useState('Iniciando bolillero digital...');
  const [copiedHash, setCopiedHash] = useState(false);

  // 1. Health check inicial
  const checkDbHealth = async () => {
    const res = await iaSurveyApi.checkHealth();
    setDbStatus({ checked: true, isOnline: res.isOnline, info: res.data });
  };

  useEffect(() => {
    checkDbHealth();
  }, []);

  const handleRetryDb = async () => {
    setIsRetryingDb(true);
    await checkDbHealth();
    const data = await iaSurveyApi.getStats(filters);
    setStatsData(data);
    setLastUpdated(new Date());
    setSecondsAgo(0);
    setIsRetryingDb(false);
  };

  // 2. Carga periódica de estadísticas (Real-Time Polling)
  const fetchStats = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await iaSurveyApi.getStats(filters);
      setStatsData(data);
      setLastUpdated(new Date());
      setSecondsAgo(0);
    } catch (err) {
      console.error('Error fetching IA stats:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(true);
  }, [filters]);

  // Polling cada 12 segundos cuando autoRefresh esté activado
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchStats(false);
    }, 12000);
    return () => clearInterval(interval);
  }, [autoRefresh, filters]);

  // Contador de segundos transcurridos
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  // 3. Cargar participantes de sorteo al abrir tab
  useEffect(() => {
    if (activeTab === 'raffle') {
      iaSurveyApi.getRaffleParticipants({ page: rafflePage, limit: 30, search: raffleSearch })
        .then(res => {
          setRaffleList(res.participants || []);
          setRaffleTotal(res.total || 0);
        })
        .catch(() => {});
    }
  }, [activeTab, rafflePage, raffleSearch]);

  const handleDrawWinner = async () => {
    setIsDrawing(true);
    setWinnerModalOpen(true);
    setWinnerData(null);
    setRouletteText('Conectando con pool de MySQL y CSPRNG...');

    const interval = setInterval(() => {
      const msgs = [
        'Extrayendo tokens de auditoría cifrados...',
        'Mezclando padrón con algoritmo PRNG de entropía cuántica...',
        'Auditando unicidad de emails y terminaciones de DNI...',
        'Calculando firma criptográfica SHA-256...'
      ];
      setRouletteText(msgs[Math.floor(Math.random() * msgs.length)]);
    }, 450);

    try {
      const res = await iaSurveyApi.drawWinner({ winnersCount, substitutesCount });
      setTimeout(() => {
        clearInterval(interval);
        setWinnerData(res);
        setIsDrawing(false);
      }, 2000);
    } catch (err) {
      clearInterval(interval);
      setIsDrawing(false);
      alert(err.message || 'Error al ejecutar sorteo');
      setWinnerModalOpen(false);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      region: 'Todas',
      provincia: 'Todas',
      edad: 'Todas',
      genero: 'Todos',
      educacion: 'Todas',
      frecuencia: 'Todas',
      includeSpeeders: false
    });
  };

  const kpis = statsData?.kpis || EMPTY_IA_STATS.kpis;

  // Cálculo de penetración de uso regular (diario + semanal)
  const penetracionRegular = useMemo(() => {
    if (!statsData?.p1Frecuencia?.length) return 0;
    const diarios = statsData.p1Frecuencia.find(f => f.id === 'todos_los_dias')?.pct || 0;
    const semanales = statsData.p1Frecuencia.find(f => f.id === 'varias_veces_semana')?.pct || 0;
    return (diarios + semanales).toFixed(1);
  }, [statsData?.p1Frecuencia]);

  // Cálculo de impacto electoral percibido (Mucho + Algo)
  const impactoElectoral = useMemo(() => {
    if (!statsData?.p9InfluenciaVoto?.length) return 0;
    const mucho = statsData.p9InfluenciaVoto.find(f => f.id === 'mucho')?.pct || 0;
    const algo = statsData.p9InfluenciaVoto.find(f => f.id === 'algo')?.pct || 0;
    return (mucho + algo).toFixed(1);
  }, [statsData?.p9InfluenciaVoto]);

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-[#080D1A] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* 1. HEADER INSTITUCIONAL */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b ${darkMode ? 'bg-[#0B132B]/85 border-white/10 shadow-lg shadow-black/30' : 'bg-white/90 border-slate-200 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className={`p-2 rounded-xl border transition-all ${
                darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white hover:border-[var(--color-brand-cyan)]' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
              title="Volver al Panel de Administrador"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--color-brand-cyan)] bg-[var(--color-brand-cyan)]/10 px-2.5 py-0.5 rounded-full border border-[var(--color-brand-cyan)]/25 flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,229,255,0.2)]">
                  <Bot className="w-3.5 h-3.5" />
                  Estudio Nacional IA 2026
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">• Grupo Consultio & ConsulDat</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight mt-0.5 flex items-center gap-2">
                Tablero de Inteligencia: Adopción, Confianza e Impacto Electoral
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Live Real-Time Badge & Auto-refresh Toggle */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
              darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className="flex items-center gap-1.5 focus:outline-none"
                title={autoRefresh ? "Pausar actualización automática" : "Activar actualización automática en tiempo real"}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]' : 'bg-slate-500'}`} />
                <span className={`font-semibold ${autoRefresh ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {autoRefresh ? 'En Vivo' : 'Pausado'}
                </span>
              </button>
              <span className="text-slate-500 text-[11px] hidden md:inline">
                ({secondsAgo}s)
              </span>
              <button
                onClick={() => fetchStats(true)}
                className="hover:text-[var(--color-brand-cyan)] transition-colors p-0.5 ml-1"
                title="Recargar datos manualmente ahora"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[var(--color-brand-cyan)]' : ''}`} />
              </button>
            </div>

            {/* Status BBDD MySQL */}
            <button
              onClick={() => setDbModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                dbStatus.isOnline
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              }`}
              title="Ver estado de conexión a la Base de Datos"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">MySQL:</span>
              <span>{dbStatus.isOnline ? 'Online' : 'Conectando'}</span>
            </button>

            {/* Exportar Excel / CSV */}
            <div className="flex items-center gap-1">
              <a
                href={iaSurveyApi.getExportUrl('responses', 'xlsx', filters)}
                download
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-all"
                title="Descargar base de respuestas en formato Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Exportar</span> Excel
              </a>
            </div>

            {/* Toggle Dark / Light */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition-colors ${
                darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-amber-300' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
              title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* 2. BARRA DE PESTAÑAS PRINCIPALES */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-white/5 py-1">
          {[
            { id: 'analytics', label: 'Uso & Herramientas', icon: Bot },
            { id: 'political', label: 'Confianza & Voto', icon: Vote },
            { id: 'geo', label: 'Territorio & Provincias', icon: MapPin },
            { id: 'raffle', label: 'Sorteo ($200.000)', icon: Gift, badge: kpis.totalRaffleParticipants },
            { id: 'feed', label: 'Feed en Tiempo Real', icon: Radio, pulse: true }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[var(--color-brand-cyan)] text-black shadow-[0_0_15px_rgba(0,229,255,0.4)]'
                    : darkMode
                      ? 'text-slate-300 hover:text-white hover:bg-white/5'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : ''}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isActive ? 'bg-black/20 text-black' : 'bg-white/10 text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
                {tab.pulse && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* BANNER DE ESTADO EN VIVO SI LA BBDD ESTÁ EN CERO ESPERANDO RESPUESTAS */}
      {kpis.totalSamples === 0 && (
        <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-4 py-2.5 text-center text-xs text-cyan-300 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
          <span>
            <strong>Recepción en vivo activa:</strong> Base de datos MySQL conectada. Aguardando el ingreso de las primeras respuestas de la encuesta en Argentina.
          </span>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* 3. FILTROS DINÁMICOS */}
        <div className={`p-4 rounded-2xl border transition-colors ${
          darkMode ? 'bg-[#0D152A]/90 border-white/10 shadow-lg' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--color-brand-cyan)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Segmentación & Filtros Cruzados
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={filters.includeSpeeders}
                  onChange={(e) => setFilters({ ...filters, includeSpeeders: e.target.checked })}
                  className="rounded border-slate-700 text-[var(--color-brand-cyan)] focus:ring-0 bg-slate-800"
                />
                <span>Incluir Speeders (&lt; 25s)</span>
              </label>
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                title="Restablecer todos los filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* Región */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Región</label>
              <select
                value={filters.region}
                onChange={(e) => setFilters({ ...filters, region: e.target.value, provincia: 'Todas' })}
                className={`w-full text-xs rounded-xl px-2.5 py-2 border focus:outline-none transition-colors ${
                  darkMode ? 'bg-[#131B2E] border-white/10 text-white focus:border-[var(--color-brand-cyan)]' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <option value="Todas">Todas las Regiones</option>
                {Object.keys(REGIONES_ARGENTINA).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Provincia */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Provincia</label>
              <select
                value={filters.provincia}
                onChange={(e) => setFilters({ ...filters, provincia: e.target.value, region: 'Todas' })}
                className={`w-full text-xs rounded-xl px-2.5 py-2 border focus:outline-none transition-colors ${
                  darkMode ? 'bg-[#131B2E] border-white/10 text-white focus:border-[var(--color-brand-cyan)]' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <option value="Todas">Todas las Provincias</option>
                {TODAS_LAS_PROVINCIAS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* Rango Etario */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Rango Etario</label>
              <select
                value={filters.edad}
                onChange={(e) => setFilters({ ...filters, edad: e.target.value })}
                className={`w-full text-xs rounded-xl px-2.5 py-2 border focus:outline-none transition-colors ${
                  darkMode ? 'bg-[#131B2E] border-white/10 text-white focus:border-[var(--color-brand-cyan)]' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <option value="Todas">Todas las Edades</option>
                <option value="16_24">16 a 24 años</option>
                <option value="25_34">25 a 34 años</option>
                <option value="35_49">35 a 49 años</option>
                <option value="50_64">50 a 64 años</option>
                <option value="65_mas">65 años o más</option>
              </select>
            </div>

            {/* Género */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Género</label>
              <select
                value={filters.genero}
                onChange={(e) => setFilters({ ...filters, genero: e.target.value })}
                className={`w-full text-xs rounded-xl px-2.5 py-2 border focus:outline-none transition-colors ${
                  darkMode ? 'bg-[#131B2E] border-white/10 text-white focus:border-[var(--color-brand-cyan)]' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <option value="Todos">Todos los Géneros</option>
                <option value="mujer">Mujer</option>
                <option value="varon">Varón</option>
                <option value="otro">Otro / No especifica</option>
              </select>
            </div>

            {/* Frecuencia de Uso */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Frecuencia IA</label>
              <select
                value={filters.frecuencia}
                onChange={(e) => setFilters({ ...filters, frecuencia: e.target.value })}
                className={`w-full text-xs rounded-xl px-2.5 py-2 border focus:outline-none transition-colors ${
                  darkMode ? 'bg-[#131B2E] border-white/10 text-white focus:border-[var(--color-brand-cyan)]' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <option value="Todas">Todas las Frecuencias</option>
                <option value="todos_los_dias">Todos los días</option>
                <option value="varias_veces_semana">Varias veces por semana</option>
                <option value="mes_o_menos">Una vez al mes o menos</option>
                <option value="una_o_dos_veces">1 o 2 veces (curiosidad)</option>
                <option value="nunca">Nunca la usó</option>
              </select>
            </div>

            {/* Nivel Educativo */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Educación</label>
              <select
                value={filters.educacion}
                onChange={(e) => setFilters({ ...filters, educacion: e.target.value })}
                className={`w-full text-xs rounded-xl px-2.5 py-2 border focus:outline-none transition-colors ${
                  darkMode ? 'bg-[#131B2E] border-white/10 text-white focus:border-[var(--color-brand-cyan)]' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <option value="Todas">Todos los Niveles</option>
                <option value="hasta_primaria">Hasta primaria</option>
                <option value="secundaria">Secundaria</option>
                <option value="terciario_univ_incompleto">Superior incompleto</option>
                <option value="terciario_univ_completo">Superior completo</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          {/* Total Muestras */}
          <div className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-white/[0.03] border-white/10 hover:border-[var(--color-brand-cyan)]/40' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Muestras Totales</span>
              <Users className="w-4 h-4 text-[var(--color-brand-cyan)]" />
            </div>
            <div className="text-2xl font-black tracking-tight text-white">
              {kpis.totalSamples.toLocaleString('es-AR')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <span className="text-emerald-400 font-semibold">{kpis.validSamples} válidas</span>
              <span>•</span>
              <span className="text-amber-400">{kpis.speedersCount} rápidas</span>
            </div>
          </div>

          {/* Penetración de Uso Regular */}
          <div className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-white/[0.03] border-white/10 hover:border-emerald-500/40' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Uso Frecuente</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black tracking-tight text-emerald-400">
              {penetracionRegular}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Uso diario o semanal regular
            </div>
          </div>

          {/* Confianza Promedio */}
          <div className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-white/[0.03] border-white/10 hover:border-amber-500/40' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Confianza</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black tracking-tight text-amber-300">
              {kpis.totalSamples > 0 && kpis.avgConfianza ? Number(kpis.avgConfianza).toFixed(2) : '0.0'} <span className="text-sm font-normal text-slate-400">/ 5</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Escala de fiabilidad ciudadana
            </div>
          </div>

          {/* Impacto en el Voto */}
          <div className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-white/[0.03] border-white/10 hover:border-purple-500/40' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Impacto Voto</span>
              <Vote className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black tracking-tight text-purple-300">
              {impactoElectoral}%
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Creen que influirá mucho o algo
            </div>
          </div>

          {/* Duración Promedio */}
          <div className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-white/[0.03] border-white/10 hover:border-blue-500/40' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Tiempo Promedio</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black tracking-tight text-blue-300">
              {Math.floor(kpis.avgDurationSeconds / 60)}m {Math.round(kpis.avgDurationSeconds % 60)}s
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Duración de completado
            </div>
          </div>

          {/* Participantes Sorteo */}
          <div className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-white/[0.03] border-white/10 hover:border-rose-500/40' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider">Sorteo $200k</span>
              <Gift className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black tracking-tight text-rose-300">
              {kpis.totalRaffleParticipants.toLocaleString('es-AR')}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Aspirantes registrados
            </div>
          </div>

        </div>

        {/* 5. VISTAS SEGÚN LA PESTAÑA ACTIVA */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            
            {/* Frecuencia de Uso + Herramientas Más Utilizadas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* P1: Frecuencia de Uso de IA */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-bold text-[var(--color-brand-cyan)] uppercase tracking-wider">P1 • Penetracion</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">Frecuencia de Uso de Inteligencia Artificial</h3>
                  </div>
                  <BarChart3 className="w-4 h-4 text-slate-400" />
                </div>

                {statsData.p1Frecuencia?.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statsData.p1Frecuencia} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" horizontal={false} />
                        <XAxis type="number" unit="%" domain={[0, 'dataMax + 10']} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <YAxis type="category" dataKey="label" width={140} tick={{ fill: '#e2e8f0', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0B132B', borderColor: '#ffffff20', borderRadius: '12px', fontSize: '12px' }}
                          formatter={(val, name, item) => [`${val}% (${item.payload.count} respuestas)`, 'Porcentaje']}
                        />
                        <Bar dataKey="pct" radius={[0, 8, 8, 0]}>
                          {statsData.p1Frecuencia.map((entry, index) => (
                            <Cell key={`p1-cell-${index}`} fill={index === 0 ? COLORS.cyan : index === 1 ? COLORS.purple : COLORS.blue} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
                    <BarChart3 className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
                    <span>Aguardando primeras respuestas registradas para P1...</span>
                  </div>
                )}
              </div>

              {/* P2: Herramientas Más Populares */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">P2 • Ecosistema Tecnológico</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">Herramientas Más Utilizadas (Múltiple)</h3>
                  </div>
                  <Bot className="w-4 h-4 text-purple-400" />
                </div>

                {statsData.p2Herramientas?.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statsData.p2Herramientas} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="id" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} angle={-30} textAnchor="end" />
                        <YAxis unit="%" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0B132B', borderColor: '#ffffff20', borderRadius: '12px', fontSize: '12px' }}
                          formatter={(val, name, item) => [`${val}% (${item.payload.count} usuarios)`, item.payload.label]}
                        />
                        <Bar dataKey="pct" radius={[8, 8, 0, 0]}>
                          {statsData.p2Herramientas.map((entry, index) => (
                            <Cell key={`p2-cell-${index}`} fill={PIE_PALETTE[index % PIE_PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
                    <Bot className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
                    <span>Aguardando primeras respuestas registradas para P2...</span>
                  </div>
                )}
              </div>

            </div>

            {/* P3: Usos Principales (Ranking y desglose) */}
            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">P3 • Aplicación Práctica</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">¿Para qué utilizan la IA los argentinos? (Hasta 3 opciones)</h3>
                </div>
                <Briefcase className="w-4 h-4 text-emerald-400" />
              </div>

              {statsData.p3Usos?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {statsData.p3Usos.map((uso, idx) => (
                    <div key={uso.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/20">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-xs font-semibold text-white">{uso.label}</div>
                          <div className="text-[11px] text-slate-400">{uso.count} menciones</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-emerald-400">{uso.pct}%</span>
                        <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                          <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${uso.pct}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500 text-xs">
                  <Briefcase className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-pulse" />
                  <span>Aguardando primeras respuestas registradas para P3...</span>
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'political' && (
          <div className="space-y-6">
            
            {/* Fila 1: P4 Confianza + P5 Decisiones Importantes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* P4: Nivel de Confianza (1 a 5) */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">P4 • Fiabilidad Percibida</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">¿Cuánto confían en las respuestas de la IA?</h3>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData.p4Confianza} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="rating" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <YAxis unit="%" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0B132B', borderColor: '#ffffff20', borderRadius: '12px', fontSize: '12px' }}
                        formatter={(val, name, item) => [`${val}% (${item.payload.count} personas)`, item.payload.label]}
                      />
                      <Bar dataKey="pct" radius={[8, 8, 0, 0]}>
                        {statsData.p4Confianza.map((entry, index) => (
                          <Cell
                            key={`p4-cell-${index}`}
                            fill={index === 0 ? COLORS.rose : index === 1 ? COLORS.amber : index === 2 ? COLORS.slate : index === 3 ? COLORS.blue : COLORS.emerald}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* P5: Consulta para Decisiones Importantes */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-bold text-[var(--color-brand-cyan)] uppercase tracking-wider">P5 • Toma de Decisiones</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">¿Le consultan a la IA al tomar decisiones cruciales?</h3>
                  </div>
                  <Brain className="w-4 h-4 text-[var(--color-brand-cyan)]" />
                </div>

                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statsData.p5Decision}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="pct"
                        label={({ label, pct }) => `${label}: ${pct}%`}
                      >
                        {statsData.p5Decision.map((entry, index) => (
                          <Cell key={`p5-pie-${index}`} fill={PIE_PALETTE[index % PIE_PALETTE.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0B132B', borderColor: '#ffffff20', borderRadius: '12px', fontSize: '12px' }}
                        formatter={(val, name, item) => [`${val}% (${item.payload.count} votos)`, item.payload.label]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Fila 2: P6 Consultas Políticas + P7 Ayuda en el Voto */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* P6: Preguntas sobre Política */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">P6 • Política & Candidatos</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">¿Alguna vez consultaron algo sobre política o gobierno?</h3>
                  </div>
                  <HelpCircle className="w-4 h-4 text-purple-400" />
                </div>

                <div className="space-y-3">
                  {statsData.p6PreguntaPolitica.map(item => (
                    <div key={item.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-white">{item.label}</span>
                        <span className="font-bold text-purple-300">{item.pct}% ({item.count})</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-purple-400 h-full rounded-full" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* P7: Ayuda para Decidir el Voto */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">P7 • Incidencia Electoral</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">¿Le pedirían a una IA que les ayude a decidir su voto?</h3>
                  </div>
                  <Vote className="w-4 h-4 text-rose-400" />
                </div>

                <div className="space-y-3">
                  {statsData.p7AyudaVoto.map(item => (
                    <div key={item.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-white">{item.label}</span>
                        <span className="font-bold text-rose-300">{item.pct}% ({item.count})</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-rose-400 h-full rounded-full" style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Fila 3: P8 Enfoque de Consulta + P10 Percepción de Neutralidad */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* P8: Enfoque de consulta electoral */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">P8 • Enfoque Electoral</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">¿Qué le preguntarían sobre las elecciones?</h3>
                  </div>
                  <Target className="w-4 h-4 text-blue-400" />
                </div>

                <div className="space-y-2.5">
                  {statsData.p8EnfoqueVoto.map(item => (
                    <div key={item.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white">{item.label}</div>
                        <div className="text-[11px] text-slate-400">{item.count} respuestas</div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-blue-400">{item.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* P10: Neutralidad vs Sesgo Ideológico */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">P10 • Imparcialidad</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">¿Las respuestas de la IA sobre política son neutrales?</h3>
                  </div>
                  <Scale className="w-4 h-4 text-emerald-400" />
                </div>

                <div className="space-y-2.5">
                  {statsData.p10Neutralidad.map(item => (
                    <div key={item.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white">{item.label}</div>
                        <div className="text-[11px] text-slate-400">{item.count} opiniones</div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-emerald-400">{item.pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {activeTab === 'geo' && (
          <div className="space-y-6">
            
            {/* Mapa Interactivo de Argentina + Desglose Regional */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Mapa de Argentina */}
              <div className={`lg:col-span-2 p-5 rounded-2xl border ${
                darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[var(--color-brand-cyan)] uppercase tracking-wider">Geolocalización Federal</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">Distribución Provincial de la Muestra Nacional</h3>
                  </div>
                  <MapPin className="w-4 h-4 text-[var(--color-brand-cyan)]" />
                </div>

                <div className="h-[420px] rounded-xl overflow-hidden border border-white/10 relative">
                  <MapaArgentinaEncuesta
                    provinciaStats={statsData.demographics.byProvincia}
                    totalSamples={kpis.totalSamples}
                    selectedProvincia={filters.provincia}
                    onSelectProvincia={(p) => setFilters({ ...filters, provincia: p })}
                    darkMode={darkMode}
                  />
                </div>
              </div>

              {/* Distribución por Región */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">Regiones</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">Participación por Zona</h3>
                  </div>
                  <Layers className="w-4 h-4 text-purple-400" />
                </div>

                <div className="space-y-3">
                  {statsData.demographics.byRegion.map(reg => (
                    <div key={reg.region} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-white">{reg.region}</span>
                        <span className="font-bold text-purple-300">{reg.pct}% ({reg.count})</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-purple-400 h-full rounded-full" style={{ width: `${reg.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Demografía: Edad, Género, Nivel Educativo */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Edad */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Segmento Etario</h4>
                <div className="space-y-2.5">
                  {statsData.demographics.byEdad.map(item => (
                    <div key={item.label} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/[0.02]">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="font-bold text-[var(--color-brand-cyan)]">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Género */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Distribución por Género</h4>
                <div className="space-y-2.5">
                  {statsData.demographics.byGenero.map(item => (
                    <div key={item.label} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/[0.02]">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="font-bold text-emerald-400">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Nivel Educativo */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Nivel Educativo</h4>
                <div className="space-y-2.5">
                  {statsData.demographics.byEducacion.map(item => (
                    <div key={item.label} className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/[0.02]">
                      <span className="text-slate-300">{item.label}</span>
                      <span className="font-bold text-purple-400">{item.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {activeTab === 'raffle' && (
          <div className="space-y-6">
            
            {/* Cabecera del Sorteo & Bolillero */}
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-rose-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                      Sorteo Oficial de $200.000 ARS
                    </span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white mt-1">
                    Auditoría & Bolillero Criptográfico en Vivo
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Garantía de transparencia con CSPRNG aleatorio y sellado de tiempo criptográfico SHA-256.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href={iaSurveyApi.getExportUrl('raffle', 'xlsx')}
                    download
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Descargar Padrón (.xlsx)
                  </a>
                  <button
                    onClick={handleDrawWinner}
                    disabled={isDrawing || raffleTotal === 0}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-bold text-xs shadow-lg shadow-rose-500/25 hover:brightness-110 disabled:opacity-50 transition-all cursor-pointer"
                  >
                    <Trophy className="w-4 h-4" />
                    Sortear Ganador Ahora
                  </button>
                </div>
              </div>
            </div>

            {/* Buscador y Tabla de Participantes */}
            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={raffleSearch}
                    onChange={(e) => setRaffleSearch(e.target.value)}
                    placeholder="Buscar participante por email o últimos 3 del DNI..."
                    className={`w-full text-xs pl-9 pr-4 py-2 rounded-xl border focus:outline-none transition-colors ${
                      darkMode ? 'bg-[#131B2E] border-white/10 text-white focus:border-[var(--color-brand-cyan)]' : 'bg-slate-100 border-slate-200 text-slate-800'
                    }`}
                  />
                </div>
                <div className="text-xs text-slate-400 font-semibold">
                  Total de inscriptos: <strong className="text-white">{raffleTotal}</strong>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-slate-400">
                      <th className="py-2.5 px-3 font-semibold">#</th>
                      <th className="py-2.5 px-3 font-semibold">Token de Encuesta</th>
                      <th className="py-2.5 px-3 font-semibold">DNI (Últimos 3)</th>
                      <th className="py-2.5 px-3 font-semibold">Correo Electrónico</th>
                      <th className="py-2.5 px-3 font-semibold">Fecha de Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {raffleList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No se encontraron participantes registrados con los criterios de búsqueda.
                        </td>
                      </tr>
                    ) : (
                      raffleList.map((p, index) => (
                        <tr key={p.id || index} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 text-slate-500">{index + 1}</td>
                          <td className="py-2.5 px-3 font-mono text-[11px] text-[var(--color-brand-cyan)]">{p.response_token}</td>
                          <td className="py-2.5 px-3 font-bold text-white">***{p.dni}</td>
                          <td className="py-2.5 px-3 text-slate-300">{p.email}</td>
                          <td className="py-2.5 px-3 text-slate-400">
                            {p.participated_at ? new Date(p.participated_at).toLocaleString('es-AR') : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {activeTab === 'feed' && (
          <div className="space-y-4">
            
            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="text-sm font-bold text-white">Streaming de Respuestas en Tiempo Real</h3>
                </div>
                <span className="text-xs text-slate-400">
                  Actualizado en vivo hace {secondsAgo} seg
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                Listado secuencial de las últimas encuestas completadas que ingresan al sistema en directo.
              </p>

              <div className="space-y-2.5">
                {statsData?.recentResponses?.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 text-xs">
                    Esperando nuevas respuestas del formulario público...
                  </div>
                ) : (
                  statsData.recentResponses.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all flex flex-wrap items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 rounded-md bg-[var(--color-brand-cyan)]/10 text-[var(--color-brand-cyan)] font-mono font-bold text-[11px]">
                          #{item.id}
                        </span>
                        <div>
                          <div className="font-semibold text-white flex items-center gap-2 flex-wrap">
                            <span>{item.p13_provincia || 'Provincia'}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400 capitalize">{item.p12 || 'Género'}</span>
                            <span className="text-slate-500">•</span>
                            <span className="text-slate-400">{item.p11 ? item.p11.replace('_', ' a ') + ' años' : ''}</span>
                            {item.is_flagged_speeder ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold">
                                Speeder (&lt;25s)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-semibold">
                                Válida
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                            <span>Herramientas: <strong className="text-purple-300">{item.p2 || 'ChatGPT'}</strong></span>
                            <span>•</span>
                            <span>Confianza: <strong className="text-amber-300">{item.p4 || 3} / 5</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <div className="text-[11px] text-slate-400">
                            {item.dur ? `${item.dur} seg` : 'Rápida'}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {item.created_at ? new Date(item.created_at).toLocaleTimeString('es-AR') : 'Recién'}
                          </div>
                        </div>
                        {item.is_flagged_speeder ? (
                          <AlertTriangle className="w-4 h-4 text-amber-400" title="Respuesta rápida (<25 seg)" />
                        ) : (
                          <CheckCheck className="w-4 h-4 text-emerald-400" title="Respuesta válida" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 6. MODAL ESTADO BASE DE DATOS */}
      <AnimatePresence>
        {dbModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0D152A] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setDbModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${dbStatus.isOnline ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-300'}`}>
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Conexión MySQL IA</h3>
                  <p className="text-xs text-slate-400">consuldatio-bbddia-imnia9:3306</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs text-slate-300 bg-black/40 p-3.5 rounded-xl border border-white/5 mb-5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Host de base de datos:</span>
                  <span className="text-white">consuldatio-bbddia-imnia9</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Puerto estándar:</span>
                  <span className="text-white">3306</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Usuario:</span>
                  <span className="text-white">mysql</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estado de red:</span>
                  <span className={dbStatus.isOnline ? 'text-emerald-400 font-bold' : 'text-amber-300'}>
                    {dbStatus.isOnline ? 'Conectado (En vivo)' : 'Sincronizando / Docker Network'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRetryDb}
                  disabled={isRetryingDb}
                  className="flex-1 py-2.5 rounded-xl bg-[var(--color-brand-cyan)] text-black font-bold text-xs hover:brightness-110 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRetryingDb ? 'animate-spin' : ''}`} />
                  <span>Probar Conexión Ahora</span>
                </button>
                <button
                  onClick={() => setDbModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs hover:bg-white/15"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. MODAL GANADOR DEL SORTEO */}
      <AnimatePresence>
        {winnerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0B132B] border border-rose-500/30 rounded-2xl p-6 max-w-lg w-full shadow-[0_0_50px_rgba(244,63,94,0.3)] relative text-center"
            >
              <button
                onClick={() => setWinnerModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {isDrawing ? (
                <div className="py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full border-4 border-rose-500 border-t-transparent animate-spin mx-auto" />
                  <h3 className="text-lg font-bold text-white">Extrayendo Ganador Oficial</h3>
                  <p className="text-xs font-mono text-rose-300 animate-pulse">{rouletteText}</p>
                </div>
              ) : winnerData ? (
                <div className="py-4 space-y-5 text-left">
                  <div className="text-center">
                    <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 text-xs font-bold uppercase tracking-wider border border-rose-500/30">
                      Premio $200.000 ARS
                    </span>
                    <h3 className="text-2xl font-black text-white mt-2">¡Ganador Seleccionado!</h3>
                  </div>

                  {/* Tarjeta Ganador Titular */}
                  {winnerData.winners?.map((w, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-center">
                      <div className="text-xs uppercase font-bold text-rose-400 mb-1">Ganador Titular #1</div>
                      <div className="text-lg font-extrabold text-white">{w.email}</div>
                      <div className="text-xs text-slate-300 mt-1">DNI terminado en: <strong>***{w.dni}</strong></div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">Token: {w.response_token}</div>
                    </div>
                  ))}

                  {/* Suplentes */}
                  {winnerData.substitutes?.length > 0 && (
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase text-slate-400">Suplentes en Orden de Prelación:</div>
                      {winnerData.substitutes.map((s, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">Suplente #{idx + 1}: {s.email}</span>
                          <span className="text-slate-400">DNI: ***{s.dni}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Hash de Auditoría Criptográfica */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-[11px] text-slate-400">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-300">Hash SHA-256 de Auditoría:</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(winnerData.audit?.hash || '');
                          setCopiedHash(true);
                          setTimeout(() => setCopiedHash(false), 2000);
                        }}
                        className="text-[var(--color-brand-cyan)] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedHash ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                    <div className="truncate text-slate-300 select-all">{winnerData.audit?.hash}</div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Sellado: {winnerData.audit?.drawn_at ? new Date(winnerData.audit.drawn_at).toLocaleString('es-AR') : ''}
                    </div>
                  </div>

                  <button
                    onClick={() => setWinnerModalOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                  >
                    Aceptar y Guardar Constancia
                  </button>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
