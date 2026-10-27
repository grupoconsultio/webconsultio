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
  iaMexicoSurveyApi,
  REGIONES_MEXICO,
  TODOS_LOS_ESTADOS_MEXICO,
  EMPTY_IA_MEXICO_STATS
} from '../services/iaMexicoSurveyApi';

import MapaMexicoEncuesta from '../components/MapaMexicoEncuesta';

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

const PIE_PALETTE = ['#00E5FF', '#A855F7', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#6366F1', '#8B5CF6'];

const EncuestaIaMexicoDashboard = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'politics' | 'territory' | 'raffle' | 'feed'
  const [loading, setLoading] = useState(true);
  const [statsData, setStatsData] = useState(EMPTY_IA_MEXICO_STATS);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Estado del servidor MySQL México
  const [dbStatus, setDbStatus] = useState({ checked: false, isOnline: false, info: null });
  const [isRetryingDb, setIsRetryingDb] = useState(false);

  // Filtros dinámicos cruzados
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

  // Sorteo 200 USD
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
    const res = await iaMexicoSurveyApi.checkHealth();
    setDbStatus({ checked: true, isOnline: res.isOnline, info: res.data });
  };

  useEffect(() => {
    checkDbHealth();
  }, []);

  const handleRetryDb = async () => {
    setIsRetryingDb(true);
    await checkDbHealth();
    const data = await iaMexicoSurveyApi.getStats(filters);
    setStatsData(data);
    setLastUpdated(new Date());
    setSecondsAgo(0);
    setIsRetryingDb(false);
  };

  // 2. Carga periódica de estadísticas (Real-Time Polling)
  const fetchStats = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await iaMexicoSurveyApi.getStats(filters);
      setStatsData(data);
      setLastUpdated(new Date());
      setSecondsAgo(0);
    } catch (err) {
      console.error('Error fetching IA Mexico stats:', err);
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
      setSecondsAgo(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 3. Cargar participantes de sorteo al abrir tab
  useEffect(() => {
    if (activeTab === 'raffle') {
      iaMexicoSurveyApi.getRaffleParticipants({ page: rafflePage, limit: 30, search: raffleSearch })
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
    setRouletteText('Conectando con pool de MySQL México y CSPRNG...');

    const interval = setInterval(() => {
      const msgs = [
        'Extrayendo tokens de auditoría cifrados...',
        'Mezclando padrón con algoritmo PRNG de entropía cuántica...',
        'Auditando unicidad de correos e identificaciones...',
        'Calculando firma criptográfica SHA-256 para el sorteo de 200 USD...'
      ];
      setRouletteText(msgs[Math.floor(Math.random() * msgs.length)]);
    }, 450);

    try {
      const res = await iaMexicoSurveyApi.drawWinner({ winnersCount, substitutesCount });
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

  const kpis = statsData?.kpis || EMPTY_IA_MEXICO_STATS.kpis;

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
                  Estudio Nacional IA México 2026
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">• Grupo Consultio & ConsulDat</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight mt-0.5 flex items-center gap-2">
                Tablero de Inteligencia: Adopción, Confianza e Impacto Electoral (México)
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
                className="flex items-center gap-1.5 text-slate-300 hover:text-white"
                title={autoRefresh ? 'Pausar auto-recarga' : 'Activar auto-recarga cada 12s'}
              >
                <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                <span className="font-semibold">{autoRefresh ? `En Vivo (${secondsAgo}s)` : 'Pausado'}</span>
              </button>
              <button
                onClick={() => fetchStats(false)}
                disabled={loading}
                className="text-slate-400 hover:text-[var(--color-brand-cyan)] transition-colors p-0.5"
                title="Actualizar datos ahora"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[var(--color-brand-cyan)]' : ''}`} />
              </button>
            </div>

            {/* Estado MySQL México */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
              dbStatus.isOnline
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}>
              <Database className="w-3.5 h-3.5" />
              <span>{dbStatus.isOnline ? 'MySQL México: Online' : 'MySQL: Offline'}</span>
              {!dbStatus.isOnline && (
                <button
                  onClick={handleRetryDb}
                  disabled={isRetryingDb}
                  className="ml-1 text-[10px] underline hover:text-white"
                >
                  {isRetryingDb ? 'Reintentando...' : 'Reconectar'}
                </button>
              )}
            </div>

            {/* Botón Exportar Excel */}
            <a
              href={iaMexicoSurveyApi.getExportUrl('responses', 'xlsx', filters)}
              download
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-all hover:scale-105"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Excel</span>
            </a>

            {/* Toggle Modo Oscuro */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition-colors ${
                darkMode ? 'bg-white/5 border-white/10 text-amber-400 hover:bg-white/10' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
              title="Cambiar tema visual"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* 2. BARRA DE PESTAÑAS (TABS) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 pb-2">
          {[
            { id: 'analytics', label: 'Uso & Herramientas', icon: Bot },
            { id: 'politics', label: 'Confianza & Voto', icon: Vote },
            { id: 'territory', label: 'Territorio & Estados', icon: MapPin },
            { id: 'raffle', label: 'Sorteo (200 USD)', icon: Gift, badge: kpis.totalRaffleParticipants },
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
            <strong>Recepción en vivo activa para México:</strong> Base de datos MySQL conectada. Aguardando el ingreso de las primeras respuestas ciudadanas.
          </span>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* 3. FILTROS DINÁMICOS CRUZADOS */}
        <div className={`p-4 rounded-2xl border transition-colors ${
          darkMode ? 'bg-[#0D152A]/90 border-white/10 shadow-lg' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--color-brand-cyan)]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Segmentación & Filtros Cruzados (México)
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={filters.includeSpeeders}
                  onChange={(e) => setFilters({ ...filters, includeSpeeders: e.target.checked })}
                  className="rounded border-slate-700 bg-slate-800 text-[var(--color-brand-cyan)] focus:ring-0"
                />
                <span>Incluir Speeders (&lt; 25s)</span>
              </label>

              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                title="Limpiar filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
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
                {Object.keys(REGIONES_MEXICO).map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            {/* Entidad Federativa / Estado */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Estado</label>
              <select
                value={filters.provincia}
                onChange={(e) => setFilters({ ...filters, provincia: e.target.value, region: 'Todas' })}
                className={`w-full text-xs rounded-xl px-2.5 py-2 border focus:outline-none transition-colors ${
                  darkMode ? 'bg-[#131B2E] border-white/10 text-white focus:border-[var(--color-brand-cyan)]' : 'bg-slate-100 border-slate-200 text-slate-800'
                }`}
              >
                <option value="Todas">Todos los Estados</option>
                {TODOS_LOS_ESTADOS_MEXICO.map(p => (
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
                <option value="varon">Hombre</option>
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
                <option value="una_o_dos_veces">1 o 2 veces</option>
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
                <option value="hasta_primaria">Hasta primaria completa</option>
                <option value="secundaria_prepa">Secundaria / Preparatoria</option>
                <option value="licenciatura_incompleta">Licenciatura incompleta</option>
                <option value="licenciatura_completa">Licenciatura completa / posgrado</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. BLOQUE DE KPIS GENERALES */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          
          {/* KPI 1: Muestras Totales */}
          <div className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-[#0D152A]/90 border-white/10 hover:border-[var(--color-brand-cyan)]/50' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Muestras Totales</span>
              <Users className="w-4 h-4 text-[var(--color-brand-cyan)]" />
            </div>
            <div className="text-2xl font-black text-white">
              {kpis.totalSamples.toLocaleString('es-MX')}
            </div>
            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">{kpis.validSamples} válidas</span>
              <span>•</span>
              <span className="text-amber-400">{kpis.speedersCount} rápidas</span>
            </div>
          </div>

          {/* KPI 2: Uso Frecuente */}
          <div className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-[#0D152A]/90 border-white/10 hover:border-emerald-500/50' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Uso Frecuente</span>
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">
              {penetracionRegular}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Uso diario o semanal regular
            </div>
          </div>

          {/* KPI 3: Confianza Promedio */}
          <div className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-[#0D152A]/90 border-white/10 hover:border-amber-500/50' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Confianza</span>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 flex items-baseline gap-1">
              <span>{kpis.avgConfianza || '0.0'}</span>
              <span className="text-xs text-slate-400 font-normal">/ 5</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Escala de fiabilidad ciudadana
            </div>
          </div>

          {/* KPI 4: Impacto en el Voto */}
          <div className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-[#0D152A]/90 border-white/10 hover:border-purple-500/50' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Impacto Voto</span>
              <Vote className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-black text-purple-400">
              {impactoElectoral}%
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Creen que influirá mucho o algo
            </div>
          </div>

          {/* KPI 5: Tiempo Promedio */}
          <div className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-[#0D152A]/90 border-white/10 hover:border-blue-500/50' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Tiempo Promedio</span>
              <Clock className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">
              {kpis.avgDurationSeconds > 0
                ? `${Math.floor(kpis.avgDurationSeconds / 60)}m ${Math.round(kpis.avgDurationSeconds % 60)}s`
                : '0m 0s'}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Duración de completado
            </div>
          </div>

          {/* KPI 6: Aspirantes al Sorteo 200 USD */}
          <div className={`p-4 rounded-2xl border transition-all ${
            darkMode ? 'bg-[#0D152A]/90 border-white/10 hover:border-rose-500/50' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Sorteo 200 USD</span>
              <Gift className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400">
              {kpis.totalRaffleParticipants.toLocaleString('es-MX')}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
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
                    <span className="text-[11px] font-bold text-[var(--color-brand-cyan)] uppercase tracking-wider">P1 • Penetración</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">Frecuencia de Uso de Inteligencia Artificial</h3>
                  </div>
                  <BarChart3 className="w-4 h-4 text-slate-400" />
                </div>

                {statsData.p1Frecuencia.length > 0 ? (
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
                    <span>Aguardando primeras respuestas en vivo para P1...</span>
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

                {statsData.p2Herramientas.length > 0 ? (
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
                    <span>Aguardando primeras respuestas en vivo para P2...</span>
                  </div>
                )}
              </div>

            </div>

            {/* P3: Usos Principales (Ranking y desglose) */}
            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">P3 • Aplicación Práctica</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">¿Para qué utilizan la IA en México? (Hasta 3 opciones)</h3>
                </div>
                <Briefcase className="w-4 h-4 text-emerald-400" />
              </div>

              {statsData.p3Usos.length > 0 ? (
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
                  <span>Aguardando primeras respuestas para P3...</span>
                </div>
              )}
            </div>

            {/* P5: Consulta para Decisiones Importantes */}
            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">P5 • Toma de Decisiones</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">¿Le consultas a la IA antes de una decisión clave?</h3>
                </div>
                <Brain className="w-4 h-4 text-blue-400" />
              </div>

              {statsData.p5Decision.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {statsData.p5Decision.map(d => (
                    <div key={d.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
                      <div className="text-xl font-black text-white">{d.pct}%</div>
                      <div className="text-xs font-semibold text-[var(--color-brand-cyan)] mt-1">{d.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{d.count} respuestas</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <span>Sin datos aún en toma de decisiones.</span>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 2: CONFIANZA & VOTO */}
        {activeTab === 'politics' && (
          <div className="space-y-6">
            
            {/* P4 Escala de Confianza + P10 Neutralidad */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* P4: Nivel de Confianza (1 a 5) */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">P4 • Fiabilidad Ciudadana</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">Nivel de Confianza en las Respuestas de la IA (1 a 5)</h3>
                  </div>
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                </div>

                {statsData.p4Confianza.some(c => c.count > 0) ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statsData.p4Confianza} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} interval={0} angle={-20} textAnchor="end" />
                        <YAxis unit="%" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0B132B', borderColor: '#ffffff20', borderRadius: '12px', fontSize: '12px' }}
                          formatter={(val, name, item) => [`${val}% (${item.payload.count} respuestas)`, 'Porcentaje']}
                        />
                        <Bar dataKey="pct" radius={[8, 8, 0, 0]}>
                          {statsData.p4Confianza.map((entry, index) => (
                            <Cell key={`p4-cell-${index}`} fill={index < 2 ? COLORS.rose : index === 2 ? COLORS.amber : COLORS.emerald} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex flex-col items-center justify-center text-slate-500 text-xs">
                    <ShieldCheck className="w-8 h-8 text-slate-600 mb-2 animate-pulse" />
                    <span>Aguardando valoraciones de confianza...</span>
                  </div>
                )}
              </div>

              {/* P10: Neutralidad vs Sesgo Político */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">P10 • Imparcialidad</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">¿Las respuestas de la IA sobre política son neutrales?</h3>
                  </div>
                  <Scale className="w-4 h-4 text-rose-400" />
                </div>

                {statsData.p10Neutralidad.length > 0 ? (
                  <div className="space-y-3">
                    {statsData.p10Neutralidad.map(item => (
                      <div key={item.id} className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="font-semibold text-white">{item.label}</span>
                          <span className="font-bold text-rose-300">{item.pct}% ({item.count})</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-rose-400 h-full rounded-full" style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    <span>Sin registros de neutralidad todavía.</span>
                  </div>
                )}
              </div>

            </div>

            {/* P7 Ayuda Voto + P8 Enfoque + P9 Influencia */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* P6 & P7: Ayuda para Decidir el Voto */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-[var(--color-brand-cyan)] uppercase tracking-wider">P7 • Decisión Electoral</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">¿Le pedirías a una IA que te ayude a votar?</h3>
                  </div>
                  <Vote className="w-4 h-4 text-[var(--color-brand-cyan)]" />
                </div>

                {statsData.p7AyudaVoto.length > 0 ? (
                  <div className="space-y-2.5">
                    {statsData.p7AyudaVoto.map(item => (
                      <div key={item.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <span className="text-xs text-slate-300">{item.label}</span>
                        <span className="text-xs font-bold text-[var(--color-brand-cyan)]">{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-500 text-xs">Aguardando respuestas P7</div>
                )}
              </div>

              {/* P8: Enfoque de Consulta Electoral */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">P8 • Enfoque Ciudadano</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">¿Qué le preguntarías en campaña?</h3>
                  </div>
                  <Target className="w-4 h-4 text-purple-400" />
                </div>

                {statsData.p8EnfoqueVoto.length > 0 ? (
                  <div className="space-y-2.5">
                    {statsData.p8EnfoqueVoto.map(item => (
                      <div key={item.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <span className="text-xs text-slate-300 truncate max-w-[180px]">{item.label}</span>
                        <span className="text-xs font-bold text-purple-300">{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-500 text-xs">Aguardando respuestas P8</div>
                )}
              </div>

              {/* P9: Percepción de Influencia en la Sociedad */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">P9 • Clima Social</span>
                    <h3 className="text-sm font-bold text-white mt-0.5">¿Cuánto influirá la IA en el voto general?</h3>
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>

                {statsData.p9InfluenciaVoto.length > 0 ? (
                  <div className="space-y-2.5">
                    {statsData.p9InfluenciaVoto.map(item => (
                      <div key={item.id} className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                        <span className="text-xs text-slate-300">{item.label}</span>
                        <span className="text-xs font-bold text-emerald-400">{item.pct}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-slate-500 text-xs">Aguardando respuestas P9</div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: TERRITORIO & ESTADOS DE MÉXICO */}
        {activeTab === 'territory' && (
          <div className="space-y-6">
            
            {/* Mapa Interactivo de México (32 Entidades Federativas) */}
            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-[11px] font-bold text-[var(--color-brand-cyan)] uppercase tracking-wider">Geolocalización Federal México</span>
                  <h3 className="text-sm font-bold text-white mt-0.5">Distribución de la Muestra por Entidad Federativa (32 Estados)</h3>
                </div>
                <MapPin className="w-4 h-4 text-[var(--color-brand-cyan)]" />
              </div>

              <div className="h-[460px] rounded-xl overflow-hidden border border-white/10 relative">
                <MapaMexicoEncuesta
                  provinciaStats={statsData.demographics.byProvincia}
                  totalSamples={kpis.totalSamples}
                  selectedProvincia={filters.provincia}
                  onSelectProvincia={(p) => setFilters({ ...filters, provincia: p })}
                  darkMode={darkMode}
                />
              </div>
            </div>

            {/* Distribución por Región y Demografía */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Regiones */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Regiones de México</span>
                  <Layers className="w-4 h-4 text-purple-400" />
                </div>
                <div className="space-y-2">
                  {statsData.demographics.byRegion.map(r => (
                    <div key={r.region} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                      <span className="text-slate-300">{r.region}</span>
                      <span className="font-bold text-purple-300">{r.pct}% ({r.count})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rango Etario */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Rango Etario</span>
                  <Users className="w-4 h-4 text-blue-400" />
                </div>
                <div className="space-y-2">
                  {statsData.demographics.byEdad.map(e => (
                    <div key={e.label} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                      <span className="text-slate-300">{e.label}</span>
                      <span className="font-bold text-blue-300">{e.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Género */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Género</span>
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="space-y-2">
                  {statsData.demographics.byGenero.map(g => (
                    <div key={g.label} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                      <span className="text-slate-300">{g.label}</span>
                      <span className="font-bold text-emerald-400">{g.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Educación */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Nivel Educativo</span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div className="space-y-2">
                  {statsData.demographics.byEducacion.map(ed => (
                    <div key={ed.label} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs">
                      <span className="text-slate-300 truncate max-w-[150px]">{ed.label}</span>
                      <span className="font-bold text-amber-400">{ed.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 4: SORTEO 200 USD */}
        {activeTab === 'raffle' && (
          <div className="space-y-6">
            
            {/* Cabecera Sorteo */}
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      Premio: 200 USD
                    </span>
                    <span className="text-xs text-slate-400">Auditoría Criptográfica SHA-256</span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">
                    Bolillero Digital y Padrón de Aspirantes México
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                    Participantes que completaron la encuesta y validaron su identificación/email. Selección aleatoria por CSPRNG con hash inmutable.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDrawWinner}
                    disabled={kpis.totalRaffleParticipants === 0 || isDrawing}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-lg shadow-rose-500/25 transition-all hover:scale-105 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    <Trophy className="w-4 h-4" />
                    <span>Realizar Sorteo Digital</span>
                  </button>

                  <a
                    href={iaMexicoSurveyApi.getExportUrl('raffle', 'xlsx')}
                    download
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar Padrón</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Buscador y Tabla de Participantes */}
            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={raffleSearch}
                    onChange={(e) => { setRaffleSearch(e.target.value); setRafflePage(1); }}
                    placeholder="Buscar por correo o terminación DNI..."
                    className="w-full text-xs rounded-xl pl-9 pr-3 py-2 bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[var(--color-brand-cyan)]"
                  />
                </div>
                <div className="text-xs text-slate-400">
                  Total de inscriptos: <strong className="text-white">{raffleTotal}</strong>
                </div>
              </div>

              {raffleList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">Token de Auditoría</th>
                        <th className="py-2.5 px-3">Identificación (Últimos 3)</th>
                        <th className="py-2.5 px-3">Email Encriptado</th>
                        <th className="py-2.5 px-3">Fecha y Hora</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-300">
                      {raffleList.map((p, idx) => (
                        <tr key={p.id} className="hover:bg-white/[0.02]">
                          <td className="py-2.5 px-3 text-slate-500 font-mono">{(rafflePage - 1) * 30 + idx + 1}</td>
                          <td className="py-2.5 px-3 font-mono text-[var(--color-brand-cyan)]">{p.response_token?.slice(0, 16)}...</td>
                          <td className="py-2.5 px-3 font-semibold text-white">***{p.dni}</td>
                          <td className="py-2.5 px-3 text-slate-200">{p.email}</td>
                          <td className="py-2.5 px-3 text-slate-400">{new Date(p.participated_at).toLocaleString('es-MX')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <Gift className="w-8 h-8 text-slate-600 mx-auto mb-2 animate-pulse" />
                  <p>Aún no hay participantes registrados en el sorteo de 200 USD.</p>
                  <p className="text-[11px] text-slate-500 mt-1">Aparecerán aquí automáticamente al enviar sus respuestas.</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB 5: FEED EN TIEMPO REAL */}
        {activeTab === 'feed' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>Monitoreo de Muestras Entrantes (México)</span>
                </h3>
                <p className="text-xs text-slate-400">Últimos registros recibidos en vivo en MySQL</p>
              </div>
              <span className="text-xs text-slate-400">Actualizando automáticamente</span>
            </div>

            {statsData.recentResponses.length > 0 ? (
              <div className="space-y-2">
                {statsData.recentResponses.map((r) => (
                  <div
                    key={r.id}
                    className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                      r.is_flagged_speeder
                        ? 'bg-amber-500/5 border-amber-500/20'
                        : darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-cyan)]/10 text-[var(--color-brand-cyan)] flex items-center justify-center font-bold text-xs border border-[var(--color-brand-cyan)]/25">
                        #{r.id}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white flex items-center gap-2">
                          <span>{r.p13_provincia || 'México'}</span>
                          <span className="text-[10px] text-slate-400">• {r.p11} • {r.p12}</span>
                          {r.is_flagged_speeder ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                              Speeder ({r.dur}s)
                            </span>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Herramientas: <strong className="text-slate-300">{r.p2 || 'N/A'}</strong> | Confianza: <strong className="text-amber-400">{r.p4}/5</strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleTimeString('es-MX')}</span>
                      <div className="text-[10px] text-slate-500">Duración: {r.dur}s</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`p-12 rounded-2xl border text-center ${darkMode ? 'bg-[#0D152A]/90 border-white/10' : 'bg-white border-slate-200'}`}>
                <Radio className="w-8 h-8 text-emerald-400 mx-auto mb-2 animate-ping" />
                <h4 className="text-sm font-bold text-white">Canal de Recepción Abierto</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Esperando el ingreso de las primeras respuestas para comenzar a registrar el feed en tiempo real.
                </p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* MODAL DEL SORTEO DE 200 USD */}
      <AnimatePresence>
        {winnerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0B132B] border border-white/20 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setWinnerModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              {isDrawing ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full border-4 border-rose-500/30 border-t-rose-500 animate-spin mx-auto" />
                  <h3 className="text-base font-bold text-white">Sorteando Premio de 200 USD...</h3>
                  <p className="text-xs text-slate-400 font-mono">{rouletteText}</p>
                </div>
              ) : winnerData ? (
                <div className="space-y-5">
                  <div className="text-center">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Resultado Oficial</span>
                    <h3 className="text-xl font-black text-white mt-1">Ganador/a del Sorteo (200 USD)</h3>
                  </div>

                  {winnerData.winners?.map((w, i) => (
                    <div key={w.id} className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 to-amber-500/10 border border-rose-500/30 text-center">
                      <div className="text-xs text-slate-400">Titular #{i + 1}</div>
                      <div className="text-lg font-black text-white mt-1">{w.maskedEmail}</div>
                      <div className="text-xs font-semibold text-rose-300 mt-1">DNI / ID: {w.maskedDni}</div>
                    </div>
                  ))}

                  {winnerData.substitutes?.length > 0 && (
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Suplentes en Orden</h4>
                      <div className="space-y-2">
                        {winnerData.substitutes.map((s, idx) => (
                          <div key={s.id} className="p-2.5 rounded-lg bg-white/5 text-xs flex items-center justify-between">
                            <span className="text-slate-300">Suplente #{idx + 1}: {s.maskedEmail}</span>
                            <span className="text-slate-500">ID: {s.maskedDni}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-lg bg-black/40 border border-white/5 font-mono text-[10px] text-slate-400 break-all">
                    <div className="text-[9px] uppercase font-bold text-slate-500 mb-1">Hash SHA-256 de Auditoría:</div>
                    {winnerData.audit?.hash}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setWinnerModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              ) : null}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EncuestaIaMexicoDashboard;
