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
  Server,
  Building2,
  Compass,
  Vote,
  Target,
  MapPin,
  Briefcase
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
  sanLuisSurveyApi,
  DEPARTAMENTOS_SAN_LUIS,
  DIRIGENTES_SAN_LUIS,
  EMPTY_SAN_LUIS_STATS
} from '../services/sanLuisSurveyApi';

const COLORS = {
  emerald: '#10b981',
  teal: '#14b8a6',
  cyan: '#06b6d4',
  amber: '#f59e0b',
  rose: '#f43f5e',
  purple: '#8b5cf6',
  blue: '#3b82f6',
  slate: '#64748b'
};

const PIE_PALETTE = ['#10b981', '#06b6d4', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#64748b'];

const EncuestaSanLuisDashboard = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics' | 'raffle'

  // Estado BBDD PostgreSQL
  const [dbStatus, setDbStatus] = useState({ checked: false, isOnline: false, info: null });
  const [dbModalOpen, setDbModalOpen] = useState(false);
  const [isRetryingDb, setIsRetryingDb] = useState(false);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    departamento: 'Todos',
    edad: 'Todas',
    genero: 'Todos',
    laboral: 'Todas',
    includeSpeeders: false
  });

  const [statsData, setStatsData] = useState(EMPTY_SAN_LUIS_STATS);

  // Sorteo
  const [winnersCount, setWinnersCount] = useState(1);
  const [substitutesCount, setSubstitutesCount] = useState(2);
  const [raffleList, setRaffleList] = useState([]);
  const [raffleSearch, setRaffleSearch] = useState('');
  const [rafflePage, setRafflePage] = useState(1);
  const [raffleTotal, setRaffleTotal] = useState(0);

  // Sorteo Modal
  const [isDrawing, setIsDrawing] = useState(false);
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);
  const [winnerData, setWinnerData] = useState(null);
  const [rouletteText, setRouletteText] = useState('Iniciando bolillero digital...');
  const [copiedHash, setCopiedHash] = useState(false);

  // Health check
  const checkDbHealth = async () => {
    const res = await sanLuisSurveyApi.checkHealth();
    setDbStatus({ checked: true, isOnline: res.isOnline, info: res.data });
  };

  useEffect(() => {
    checkDbHealth();
  }, []);

  const handleRetryDb = async () => {
    setIsRetryingDb(true);
    await checkDbHealth();
    const data = await sanLuisSurveyApi.getStats(filters);
    setStatsData(data);
    setIsRetryingDb(false);
  };

  // Cargar estadísticas
  useEffect(() => {
    let isMounted = true;
    async function fetchStats() {
      setLoading(true);
      try {
        const data = await sanLuisSurveyApi.getStats(filters);
        if (isMounted) {
          setStatsData(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching San Luis stats:', err);
        if (isMounted) setLoading(false);
      }
    }
    fetchStats();
    return () => { isMounted = false; };
  }, [filters]);

  // Cargar participantes de sorteo
  useEffect(() => {
    if (activeTab === 'raffle') {
      sanLuisSurveyApi.getRaffleParticipants({ page: rafflePage, limit: 30, search: raffleSearch })
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
    setRouletteText('Extrayendo claves seguras de PostgreSQL...');

    const interval = setInterval(() => {
      const msgs = [
        'Verificando registros de participantes...',
        'Mezclando padrón con algoritmo PRNG...',
        'Auditando unicidad de números de contacto...',
        'Calculando firma criptográfica SHA-256...'
      ];
      setRouletteText(msgs[Math.floor(Math.random() * msgs.length)]);
    }, 450);

    try {
      const res = await sanLuisSurveyApi.drawWinner({ winnersCount, substitutesCount });
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
      departamento: 'Todos',
      edad: 'Todas',
      genero: 'Todos',
      laboral: 'Todas',
      includeSpeeders: false
    });
  };

  const kpis = statsData?.kpis || EMPTY_SAN_LUIS_STATS.kpis;

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-[#0A0F1D] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* 1. HEADER INSTITUCIONAL */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${darkMode ? 'bg-[#0D1527]/90 border-white/10' : 'bg-white/90 border-slate-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className={`p-2 rounded-xl border transition-colors ${
                darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
              title="Volver al Administrador"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Estudio Provincial San Luis 2026
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">• Grupo Consultio</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight mt-0.5">
                Tablero de Inteligencia Territorial & Clima Electoral
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Status BBDD */}
            <button
              onClick={() => setDbModalOpen(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                dbStatus.isOnline
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${dbStatus.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
              <Database className="w-3.5 h-3.5" />
              <span>{dbStatus.isOnline ? 'PostgreSQL Activo' : 'BBDD Desconectada'}</span>
            </button>

            {/* Selector de pestañas */}
            <div className={`p-1 rounded-xl border flex items-center gap-1 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'analytics'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Analítica</span>
              </button>
              <button
                onClick={() => setActiveTab('raffle')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === 'raffle'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Sorteo $100.000</span>
              </button>
            </div>

            {/* Toggle Dark / Light */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition-colors ${
                darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 text-amber-400' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700'
              }`}
              title="Cambiar tema visual"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* 2. BARRA DE FILTROS INTERACTIVOS */}
        <section className={`p-4 rounded-2xl border transition-all ${darkMode ? 'bg-[#0D1527] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
              <Filter className="w-4 h-4" />
              <span>Filtros Demográficos y Territoriales</span>
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleResetFilters}
                className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-colors ${
                  darkMode ? 'border-white/10 text-slate-300 hover:bg-white/5' : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>

              <button
                onClick={() => sanLuisSurveyApi.exportResponsesExcel(filters)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors shadow-sm"
                title="Descargar base completa en Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Exportar Excel</span>
              </button>

              <button
                onClick={() => sanLuisSurveyApi.exportResponsesCsv(filters)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium bg-slate-700 hover:bg-slate-600 text-white flex items-center gap-1.5 transition-colors"
                title="Descargar en formato CSV plano"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Departamento */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Departamento</label>
              <select
                value={filters.departamento}
                onChange={(e) => setFilters(f => ({ ...f, departamento: e.target.value }))}
                className={`w-full text-xs rounded-xl p-2.5 border outline-none ${
                  darkMode ? 'bg-[#131B2E] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="Todos">Todos los departamentos</option>
                {DEPARTAMENTOS_SAN_LUIS.map(dep => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            </div>

            {/* Rango de Edad */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Rango Etario</label>
              <select
                value={filters.edad}
                onChange={(e) => setFilters(f => ({ ...f, edad: e.target.value }))}
                className={`w-full text-xs rounded-xl p-2.5 border outline-none ${
                  darkMode ? 'bg-[#131B2E] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="Todas">Todas las edades</option>
                <option value="16 a 24">16 a 24 años</option>
                <option value="25 a 34">25 a 34 años</option>
                <option value="35 a 49">35 a 49 años</option>
                <option value="50 a 64">50 a 64 años</option>
                <option value="65 o más">65 años o más</option>
              </select>
            </div>

            {/* Género */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Género</label>
              <select
                value={filters.genero}
                onChange={(e) => setFilters(f => ({ ...f, genero: e.target.value }))}
                className={`w-full text-xs rounded-xl p-2.5 border outline-none ${
                  darkMode ? 'bg-[#131B2E] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="Todos">Todos los géneros</option>
                <option value="Mujer">Mujer</option>
                <option value="Varón">Varón</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* Situación Laboral */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Situación Laboral</label>
              <select
                value={filters.laboral}
                onChange={(e) => setFilters(f => ({ ...f, laboral: e.target.value }))}
                className={`w-full text-xs rounded-xl p-2.5 border outline-none ${
                  darkMode ? 'bg-[#131B2E] border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <option value="Todas">Todas las situaciones</option>
                <option value="Empleado/a público provincial">Empleado público provincial</option>
                <option value="Empleado/a público municipal o nacional">Empleado municipal / nacional</option>
                <option value="Empleado/a privado">Empleado privado</option>
                <option value="Cuenta propia o comerciante">Cuenta propia / comerciante</option>
                <option value="Plan de Inclusión">Plan de Inclusión</option>
                <option value="Jubilado/a">Jubilado/a</option>
                <option value="Desempleado/a">Desempleado/a</option>
                <option value="Estudiante">Estudiante</option>
              </select>
            </div>

            {/* Toggle Speeders */}
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border border-white/10 bg-[#131B2E]">
                <input
                  type="checkbox"
                  checked={filters.includeSpeeders}
                  onChange={(e) => setFilters(f => ({ ...f, includeSpeeders: e.target.checked }))}
                  className="rounded text-emerald-500 focus:ring-emerald-400"
                />
                <span className="text-xs text-slate-300">Incluir respuestas rápidas (&lt;20s)</span>
              </label>
            </div>
          </div>
        </section>

        {/* 3. KPIS PRINCIPALES */}
        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#0D1527] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Muestras Totales</span>
              <Users className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white">{kpis.totalSamples.toLocaleString('es-AR')}</div>
            <div className="text-[11px] text-slate-400 mt-1">Registros en PostgreSQL</div>
          </div>

          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#0D1527] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Muestras Válidas</span>
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-400">{kpis.validSamples.toLocaleString('es-AR')}</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {kpis.totalSamples > 0 ? `${Math.round((kpis.validSamples / kpis.totalSamples) * 100)}% de efectividad` : '100% de calidad'}
            </div>
          </div>

          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#0D1527] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Desestimadas (&lt;20s)</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400">{kpis.speedersCount.toLocaleString('es-AR')}</div>
            <div className="text-[11px] text-slate-400 mt-1">Speeders filtrados</div>
          </div>

          <div className={`p-4 rounded-2xl border ${darkMode ? 'bg-[#0D1527] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Duración Promedio</span>
              <Clock className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-400">
              {kpis.avgDurationSeconds > 0 ? `${Math.round(kpis.avgDurationSeconds)}s` : '0s'}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Tiempo de llenado</div>
          </div>

          <div className={`col-span-2 sm:col-span-1 p-4 rounded-2xl border ${darkMode ? 'bg-[#0D1527] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Inscriptos Sorteo</span>
              <Gift className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-400">{kpis.totalRaffleParticipants.toLocaleString('es-AR')}</div>
            <div className="text-[11px] text-slate-400 mt-1">Pozo: $100.000</div>
          </div>
        </section>

        {/* 4. CONTENIDO SEGÚN PESTAÑA */}
        {activeTab === 'analytics' ? (
          <div className="space-y-6">

            {/* BLOQUE A: CLIMA SOCIAL Y COYUNTURA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* P1: Rumbo de San Luis */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D1527] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>¿San Luis va por buen camino? (P1)</span>
                  </h3>
                </div>

                {statsData?.p1Rumbo?.length > 0 ? (
                  <div className="space-y-3">
                    <div className="h-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statsData.p1Rumbo}
                            dataKey="count"
                            nameKey="label"
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={70}
                            paddingAngle={3}
                          >
                            {statsData.p1Rumbo.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.label === 'Buen camino' ? '#10b981' :
                                  entry.label === 'Mal camino' ? '#f43f5e' : '#f59e0b'
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#131B2E', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="space-y-2">
                      {statsData.p1Rumbo.map((item, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{
                                backgroundColor: item.label === 'Buen camino' ? '#10b981' : item.label === 'Mal camino' ? '#f43f5e' : '#f59e0b'
                              }}
                            />
                            <span>{item.label}</span>
                          </span>
                          <span className="font-bold text-slate-300">{item.pct}% ({item.count})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-xs text-slate-500">
                    Sin respuestas registradas con los filtros actuales
                  </div>
                )}
              </div>

              {/* P2: Principales Problemáticas */}
              <div className={`lg:col-span-2 p-5 rounded-2xl border ${darkMode ? 'bg-[#0D1527] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2">
                    <Target className="w-4 h-4 text-rose-400" />
                    <span>Problema más grave de la provincia (P2)</span>
                  </h3>
                </div>

                {statsData?.p2Problema?.length > 0 ? (
                  <div className="h-60">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={statsData.p2Problema.slice(0, 7)}
                        margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                        <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `${v}%`} />
                        <YAxis type="category" dataKey="label" stroke="#94a3b8" tick={{ fontSize: 11 }} width={120} />
                        <Tooltip contentStyle={{ backgroundColor: '#131B2E', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                        <Bar dataKey="pct" fill="#06b6d4" radius={[0, 6, 6, 0]}>
                          {statsData.p2Problema.slice(0, 7).map((_, index) => (
                            <Cell key={`p2-${index}`} fill={PIE_PALETTE[index % PIE_PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-60 flex items-center justify-center text-xs text-slate-500">
                    Esperando datos en vivo de la base de datos
                  </div>
                )}
              </div>
            </div>

            {/* BLOQUE B: IMAGEN DE DIRIGENTES & GESTIÓN */}
            <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D1527] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-base text-slate-200 flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Termómetro de Imagen de Dirigentes Políticos (P5)</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Evaluación individual de conocimiento, imagen positiva, negativa y balance neto
                  </p>
                </div>
              </div>

              {statsData?.imagenDirigentes?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {statsData.imagenDirigentes.map((dir, idx) => (
                    <div
                      key={dir.key || idx}
                      className={`p-4 rounded-xl border flex flex-col justify-between ${
                        darkMode ? 'bg-[#131B2E] border-white/5' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm text-white">{dir.name}</div>
                        <div className="text-[11px] text-slate-400 mb-3">{dir.cargo}</div>

                        {/* Barra compuesta */}
                        <div className="h-3 w-full rounded-full overflow-hidden flex bg-slate-800 mb-3">
                          <div style={{ width: `${dir.positiva}%` }} className="bg-emerald-500" title={`Positiva: ${dir.positiva}%`} />
                          <div style={{ width: `${dir.regular}%` }} className="bg-amber-500" title={`Regular: ${dir.regular}%`} />
                          <div style={{ width: `${dir.negativa}%` }} className="bg-rose-500" title={`Negativa: ${dir.negativa}%`} />
                          <div style={{ width: `${dir.noConoce}%` }} className="bg-slate-600" title={`No conoce: ${dir.noConoce}%`} />
                        </div>

                        <div className="space-y-1.5 text-xs">
                          <div className="flex justify-between">
                            <span className="text-emerald-400">Positiva</span>
                            <span className="font-bold">{dir.positiva}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-rose-400">Negativa</span>
                            <span className="font-bold">{dir.negativa}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-amber-400">Regular / Neutra</span>
                            <span className="font-bold">{dir.regular}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">No lo conoce</span>
                            <span className="font-bold">{dir.noConoce}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                        <span className="text-slate-400">Diferencial Neto:</span>
                        <span className={`font-extrabold ${dir.neto >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {dir.neto >= 0 ? `+${dir.neto}%` : `${dir.neto}%`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-36 flex items-center justify-center text-xs text-slate-500">
                  Sin datos de evaluación de dirigentes
                </div>
              )}
            </div>

            {/* BLOQUE C: GESTIÓN POGGI VS MILEI & ESCENARIOS ELECTORALES 2027 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* P4 vs P9: Gestión Poggi vs Milei */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D1527] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2 mb-4">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>Evaluación de Gestión: Poggi vs Javier Milei (P4 & P9)</span>
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-emerald-400 mb-2">Gobierno de Claudio Poggi</h4>
                    <div className="space-y-2">
                      {statsData?.p4GestionPoggi?.map((it, idx) => (
                        <div key={idx} className="text-xs">
                          <div className="flex justify-between text-slate-300 mb-0.5">
                            <span>{it.label}</span>
                            <span className="font-bold">{it.pct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div style={{ width: `${it.pct}%` }} className="h-full bg-emerald-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-purple-400 mb-2">Gobierno de Javier Milei</h4>
                    <div className="space-y-2">
                      {statsData?.p9GestionMilei?.map((it, idx) => (
                        <div key={idx} className="text-xs">
                          <div className="flex justify-between text-slate-300 mb-0.5">
                            <span>{it.label}</span>
                            <span className="font-bold">{it.pct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div style={{ width: `${it.pct}%` }} className="h-full bg-purple-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* P6: Intención de voto Gobernador 2027 */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D1527] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2 mb-4">
                  <Vote className="w-4 h-4 text-amber-400" />
                  <span>Intención de Voto a Gobernador (P6)</span>
                </h3>

                {statsData?.p6Voto?.length > 0 ? (
                  <div className="space-y-2.5">
                    {statsData.p6Voto.map((candidato, idx) => (
                      <div key={idx} className="text-xs">
                        <div className="flex justify-between text-slate-300 mb-1">
                          <span className="font-medium">{candidato.label}</span>
                          <span className="font-bold">{candidato.pct}% ({candidato.count})</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${candidato.pct}%`,
                              backgroundColor: PIE_PALETTE[idx % PIE_PALETTE.length]
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-44 flex items-center justify-center text-xs text-slate-500">
                    Aguardando ingresos en vivo
                  </div>
                )}
              </div>
            </div>

            {/* BLOQUE D: DISTRIBUCIÓN TERRITORIAL Y DEMOGRÁFICA */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* Departamentos */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D1527] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-teal-400" />
                  <span>Distribución por Departamento</span>
                </h3>

                <div className="space-y-2 text-xs">
                  {statsData?.demographics?.byDepartamento?.map((dep, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-slate-300">{dep.label}</span>
                      <span className="font-bold text-teal-400">{dep.pct}% ({dep.count})</span>
                    </div>
                  ))}
                  {(!statsData?.demographics?.byDepartamento || statsData.demographics.byDepartamento.length === 0) && (
                    <div className="py-8 text-center text-xs text-slate-500">Sin datos de departamentos</div>
                  )}
                </div>
              </div>

              {/* Rango Etario & Género */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D1527] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Perfil Demográfico (Edad & Género)</span>
                </h3>

                <div className="space-y-4 text-xs">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Grupos de Edad</span>
                    <div className="space-y-1.5 mt-1.5">
                      {statsData?.demographics?.byEdad?.map((ed, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-slate-300">{ed.label}</span>
                          <span className="font-bold text-purple-400">{ed.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Género</span>
                    <div className="space-y-1.5 mt-1.5">
                      {statsData?.demographics?.byGenero?.map((gen, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-slate-300">{gen.label}</span>
                          <span className="font-bold text-cyan-400">{gen.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Situación Laboral */}
              <div className={`p-5 rounded-2xl border ${darkMode ? 'bg-[#0D1527] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                <h3 className="font-bold text-sm text-slate-200 flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <span>Situación Laboral</span>
                </h3>

                <div className="space-y-2 text-xs">
                  {statsData?.demographics?.byLaboral?.map((lab, idx) => (
                    <div key={idx} className="flex justify-between items-center py-1 border-b border-white/5">
                      <span className="text-slate-300">{lab.label}</span>
                      <span className="font-bold text-amber-400">{lab.pct}% ({lab.count})</span>
                    </div>
                  ))}
                  {(!statsData?.demographics?.byLaboral || statsData.demographics.byLaboral.length === 0) && (
                    <div className="py-8 text-center text-xs text-slate-500">Sin datos laborales</div>
                  )}
                </div>
              </div>

            </div>

          </div>
        ) : (
          /* PESTAÑA SORTEO OFICIAL */
          <div className="space-y-6">
            <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-[#0D1527] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg font-bold">Módulo de Sorteo Oficial ($100.000)</h2>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Padrón independiente con contacto disociado de respuestas de encuesta para preservar secreto estadístico.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => sanLuisSurveyApi.exportRaffleExcel()}
                    className="text-xs px-3 py-2 rounded-xl font-medium bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Exportar Padrón Excel</span>
                  </button>

                  <button
                    onClick={handleDrawWinner}
                    disabled={raffleTotal === 0 || isDrawing}
                    className="text-xs px-4 py-2 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-amber-500/20"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Realizar Sorteo en Vivo</span>
                  </button>
                </div>
              </div>

              {/* Buscador de participantes */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border flex-1 ${
                  darkMode ? 'bg-[#131B2E] border-white/10' : 'bg-slate-50 border-slate-200'
                }`}>
                  <Search className="w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar participante por celular o mail..."
                    value={raffleSearch}
                    onChange={(e) => { setRaffleSearch(e.target.value); setRafflePage(1); }}
                    className="bg-transparent text-xs w-full outline-none text-white placeholder-slate-500"
                  />
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  Total inscriptos: <strong className="text-white">{raffleTotal}</strong>
                </div>
              </div>

              {/* Tabla de participantes */}
              <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-xs text-left">
                  <thead className={darkMode ? 'bg-white/5 text-slate-300' : 'bg-slate-100 text-slate-700'}>
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">ID</th>
                      <th className="py-2.5 px-4 font-semibold">Contacto Registrado</th>
                      <th className="py-2.5 px-4 font-semibold">Canal</th>
                      <th className="py-2.5 px-4 font-semibold">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {raffleList.map((p) => (
                      <tr key={p.id} className={darkMode ? 'hover:bg-white/5' : 'hover:bg-slate-50'}>
                        <td className="py-2.5 px-4 font-mono text-slate-400">#{p.id}</td>
                        <td className="py-2.5 px-4 font-medium text-white">{p.contacto}</td>
                        <td className="py-2.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.tipo === 'mail' ? 'bg-purple-500/10 text-purple-400' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {p.tipo}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-slate-400">{p.fecha || new Date(p.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {raffleList.length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-500">
                          No hay participantes registrados en el sorteo aún.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* 5. MODAL DE ESTADO Y CONECTIVIDAD POSTGRESQL */}
      <AnimatePresence>
        {dbModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-md p-6 rounded-2xl border shadow-2xl ${
                darkMode ? 'bg-[#0D1527] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <Database className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-base">Estado de Base de Datos PostgreSQL</h3>
                </div>
                <button onClick={() => setDbModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs mb-6">
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-slate-400">Estado de Conexión:</span>
                  <span className={`font-bold ${dbStatus.isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {dbStatus.isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-slate-400">Host Activo:</span>
                  <span className="font-mono text-slate-300">{dbStatus.info?.database?.host || 'consuldatio-bbddsanluis-hshlgz'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-slate-400">Puerto PostgreSQL:</span>
                  <span className="font-mono text-slate-300">{dbStatus.info?.database?.port || '5432'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-white/10">
                  <span className="text-slate-400">Respuestas en BBDD:</span>
                  <span className="font-bold text-white">{dbStatus.info?.database?.totalResponses ?? 0}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleRetryDb}
                  disabled={isRetryingDb}
                  className="flex-1 py-2.5 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50 text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRetryingDb ? 'animate-spin' : ''}`} />
                  <span>Probar y Reintentar Conexión</span>
                </button>
                <button
                  onClick={() => setDbModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs text-slate-300 hover:bg-white/5"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. MODAL DE SORTEO EN VIVO / AUDITORÍA */}
      <AnimatePresence>
        {winnerModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg p-6 rounded-3xl border border-amber-500/30 bg-[#0D1527] text-white shadow-2xl relative"
            >
              <button
                onClick={() => setWinnerModalOpen(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="inline-flex p-3 rounded-2xl bg-amber-500/10 text-amber-400 mb-3 border border-amber-500/20">
                  <Trophy className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold">Sorteo Oficial de $100.000</h3>
                <p className="text-xs text-slate-400 mt-1">Encuesta de Opinión Pública San Luis 2026</p>
              </div>

              {isDrawing ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full border-4 border-amber-400 border-t-transparent animate-spin" />
                  <p className="text-sm font-semibold text-amber-300 animate-pulse">{rouletteText}</p>
                </div>
              ) : winnerData ? (
                <div className="space-y-4">
                  {/* Ganador */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 border border-amber-500/30">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ganador Titular</span>
                    </div>
                    {winnerData.winners?.map((w, idx) => (
                      <div key={idx} className="flex justify-between items-center mt-2">
                        <span className="text-lg font-extrabold text-white">{w.contacto}</span>
                        <span className="text-xs font-mono bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-lg">
                          ID #{w.id}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Suplentes */}
                  {winnerData.substitutes?.length > 0 && (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                      <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                        Suplentes en orden de prelación
                      </div>
                      <div className="space-y-2">
                        {winnerData.substitutes.map((s, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <span className="text-slate-200">Suplente {idx + 1}: <strong className="text-white">{s.contacto}</strong></span>
                            <span className="font-mono text-slate-400">ID #{s.id}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Firma de Auditoría */}
                  <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Hash SHA-256:</span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(winnerData.audit?.hash || '');
                          setCopiedHash(true);
                          setTimeout(() => setCopiedHash(false), 2000);
                        }}
                        className="text-amber-400 hover:underline flex items-center gap-1"
                      >
                        {copiedHash ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedHash ? 'Copiado' : 'Copiar Hash'}</span>
                      </button>
                    </div>
                    <div className="break-all text-[10px] text-slate-300">{winnerData.audit?.hash}</div>
                    <div className="text-slate-500 pt-1">Timestamp: {winnerData.audit?.timestamp}</div>
                  </div>

                  <button
                    onClick={() => setWinnerModalOpen(false)}
                    className="w-full py-3 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors text-xs"
                  >
                    Cerrar y Registrar Acta
                  </button>
                </div>
              ) : null}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default EncuestaSanLuisDashboard;
