import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  ShieldCheck,
  Award,
  Clock,
  Filter,
  RotateCcw,
  Download,
  Sparkles,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sun,
  Moon,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  FileSpreadsheet,
  TrendingUp,
  Layers,
  Vote,
  Target,
  MapPin,
  Building2,
  UserCheck,
  ChevronRight,
  ExternalLink,
  ChevronDown
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
  rioTerceroSurveyApi,
  EDADES_RIO_TERCERO,
  GENEROS_RIO_TERCERO,
  EDU_RIO_TERCERO,
  VOTOS_2023_RIO_TERCERO
} from '../services/rioTerceroSurveyApi';

const COLORS = {
  cyan: '#00e5ff',
  emerald: '#10b981',
  amber: '#f59e0b',
  rose: '#ef4444',
  purple: '#8b5cf6',
  blue: '#0284c7',
  slate: '#64748b'
};

const PIE_PALETTE = ['#00e5ff', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#3b82f6', '#64748b'];

const EncuestaRioTerceroDashboard = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('resumen'); // 'resumen' | 'gestiones' | 'dirigentes' | 'electoral' | 'demografia' | 'auditoria' | 'respuestas'
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    edad: 'Todas',
    genero: 'Todos',
    educacion: 'Todas',
    voto2023: 'Todos',
    encuestador: 'Todos',
    startDate: '',
    endDate: ''
  });

  const [statsData, setStatsData] = useState(null);

  // Sub-estados dentro de solapas
  const [selectedDirigentesType, setSelectedDirigentesType] = useState('locales'); // 'locales' | 'departamentales'
  const [selectedEscenarioIdx, setSelectedEscenarioIdx] = useState(0); // 0 to 4
  const [tableSearch, setTableSearch] = useState('');
  const [tablePage, setTablePage] = useState(1);
  const rowsPerPage = 12;

  // Carga inicial y actualización
  const loadData = async (forceRefresh = false) => {
    if (forceRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const data = await rioTerceroSurveyApi.getStats(filters, forceRefresh);
      setStatsData(data);
    } catch (err) {
      console.error('Error cargando datos de encuesta:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(false);
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      edad: 'Todas',
      genero: 'Todos',
      educacion: 'Todas',
      voto2023: 'Todos',
      encuestador: 'Todos',
      startDate: '',
      endDate: ''
    });
  };

  const hasActiveFilters = useMemo(() => {
    return (
      filters.edad !== 'Todas' ||
      filters.genero !== 'Todos' ||
      filters.educacion !== 'Todas' ||
      filters.voto2023 !== 'Todos' ||
      filters.encuestador !== 'Todos' ||
      Boolean(filters.startDate) ||
      Boolean(filters.endDate)
    );
  }, [filters]);

  // Respuestas filtradas para la tabla con búsqueda
  const filteredTableRows = useMemo(() => {
    if (!statsData?.rows) return [];
    if (!tableSearch.trim()) return statsData.rows;
    const term = tableSearch.toLowerCase();
    return statsData.rows.filter(r => {
      return (
        String(r.encuestador || '').toLowerCase().includes(term) ||
        String(r.edad || '').toLowerCase().includes(term) ||
        String(r.genero || '').toLowerCase().includes(term) ||
        String(r.educacion || '').toLowerCase().includes(term) ||
        String(r.voto_2023 || '').toLowerCase().includes(term) ||
        String(r.cambio_continuidad || '').toLowerCase().includes(term) ||
        String(r.gestion_ferrer || '').toLowerCase().includes(term) ||
        (r.problemas || []).some(p => p.toLowerCase().includes(term))
      );
    });
  }, [statsData?.rows, tableSearch]);

  const totalTablePages = Math.ceil(filteredTableRows.length / rowsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    const start = (tablePage - 1) * rowsPerPage;
    return filteredTableRows.slice(start, start + rowsPerPage);
  }, [filteredTableRows, tablePage]);

  // Estilos según el modo Dark / Light
  const bgClass = darkMode ? 'bg-[#0a0f1d] text-white' : 'bg-slate-50 text-slate-900';
  const cardBgClass = darkMode ? 'bg-[#111827]/80 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const subTextClass = darkMode ? 'text-slate-400' : 'text-slate-500';
  const headerBgClass = darkMode ? 'bg-[#0f172a]/90 border-white/10' : 'bg-white/90 border-slate-200';
  const inputClass = darkMode
    ? 'bg-[#1e293b] border-white/10 text-white placeholder-slate-500 focus:border-[var(--color-brand-cyan)]'
    : 'bg-slate-100 border-slate-300 text-slate-800 placeholder-slate-400 focus:border-cyan-600';

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300 font-sans selection:bg-[var(--color-brand-cyan)] selection:text-black`}>
      {/* ── HEADER SUPERIOR ─────────────────────────────────────── */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b ${headerBgClass} px-4 lg:px-8 py-3.5 transition-colors`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/admin"
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                darkMode
                  ? 'border-white/10 bg-white/5 hover:bg-white/10 text-slate-300'
                  : 'border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Volver al Admin
            </Link>

            <div className="h-4 w-[1px] bg-white/20 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[var(--color-brand-cyan)]/15 text-[var(--color-brand-cyan)] border border-[var(--color-brand-cyan)]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-cyan)] animate-pulse" />
                  Google Sheets en Vivo
                </span>
                <span className={`text-xs ${subTextClass} hidden sm:inline`}>
                  Río Tercero, Córdoba
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight mt-0.5 flex items-center gap-2">
                Encuesta Presencial Río Tercero 2026
              </h1>
            </div>
          </div>

          {/* Acciones y Métricas Rápidas */}
          <div className="flex items-center gap-2 self-end md:self-center">
            {statsData?.updatedAt && (
              <span className={`text-[11px] ${subTextClass} hidden lg:flex items-center gap-1.5 mr-2`}>
                <Clock className="w-3 h-3 text-cyan-400" />
                Actualizado: {statsData.updatedAt}
              </span>
            )}

            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                darkMode
                  ? 'border-white/10 bg-white/5 hover:bg-white/10 text-white'
                  : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-800'
              } ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Refrescar datos desde Google Sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[var(--color-brand-cyan)] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sincronizar</span>
            </button>

            <button
              onClick={() => statsData?.rows && rioTerceroSurveyApi.exportCsv(statsData.rows)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-[var(--color-brand-cyan)] text-black font-semibold hover:opacity-90 transition-opacity shadow-sm shadow-cyan-500/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-xl border transition-colors ${
                darkMode
                  ? 'border-white/10 bg-white/5 hover:bg-white/10 text-amber-400'
                  : 'border-slate-300 bg-white hover:bg-slate-100 text-slate-700'
              }`}
              title="Cambiar Modo Oscuro / Claro"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* ── CONTENIDO PRINCIPAL ─────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-6">
        {/* BARRA DE FILTROS */}
        <section className={`p-4 rounded-2xl border ${cardBgClass} backdrop-blur-md transition-all`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[var(--color-brand-cyan)]" />
              <h3 className="text-sm font-semibold tracking-wide uppercase">Filtros Segmentados</h3>
              {hasActiveFilters && (
                <span className="px-2 py-0.5 rounded-md text-[10px] bg-cyan-500/20 text-cyan-300 font-medium">
                  Filtros activos
                </span>
              )}
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 transition-colors self-start md:self-auto"
              >
                <RotateCcw className="w-3 h-3" /> Restablecer filtros
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-3">
            {/* Filtro Edad */}
            <div>
              <label className={`block text-[11px] font-medium ${subTextClass} mb-1`}>Edad</label>
              <select
                value={filters.edad}
                onChange={e => setFilters(prev => ({ ...prev, edad: e.target.value }))}
                className={`w-full text-xs rounded-xl px-3 py-2 border outline-none cursor-pointer ${inputClass}`}
              >
                <option value="Todas">Todas las edades</option>
                {EDADES_RIO_TERCERO.map(e => (
                  <option key={e} value={e}>{e} años</option>
                ))}
              </select>
            </div>

            {/* Filtro Género */}
            <div>
              <label className={`block text-[11px] font-medium ${subTextClass} mb-1`}>Género</label>
              <select
                value={filters.genero}
                onChange={e => setFilters(prev => ({ ...prev, genero: e.target.value }))}
                className={`w-full text-xs rounded-xl px-3 py-2 border outline-none cursor-pointer ${inputClass}`}
              >
                <option value="Todos">Todos los géneros</option>
                {GENEROS_RIO_TERCERO.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Filtro Educación */}
            <div>
              <label className={`block text-[11px] font-medium ${subTextClass} mb-1`}>Educación</label>
              <select
                value={filters.educacion}
                onChange={e => setFilters(prev => ({ ...prev, educacion: e.target.value }))}
                className={`w-full text-xs rounded-xl px-3 py-2 border outline-none cursor-pointer ${inputClass}`}
              >
                <option value="Todas">Todos los niveles</option>
                {EDU_RIO_TERCERO.map(edu => (
                  <option key={edu} value={edu}>{edu}</option>
                ))}
              </select>
            </div>

            {/* Filtro Voto 2023 */}
            <div>
              <label className={`block text-[11px] font-medium ${subTextClass} mb-1`}>Voto Presidencial 2023</label>
              <select
                value={filters.voto2023}
                onChange={e => setFilters(prev => ({ ...prev, voto2023: e.target.value }))}
                className={`w-full text-xs rounded-xl px-3 py-2 border outline-none cursor-pointer ${inputClass}`}
              >
                <option value="Todos">Todos los candidatos</option>
                {VOTOS_2023_RIO_TERCERO.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>

            {/* Filtro Encuestador */}
            <div>
              <label className={`block text-[11px] font-medium ${subTextClass} mb-1`}>Encuestador / Auditor</label>
              <select
                value={filters.encuestador}
                onChange={e => setFilters(prev => ({ ...prev, encuestador: e.target.value }))}
                className={`w-full text-xs rounded-xl px-3 py-2 border outline-none cursor-pointer ${inputClass}`}
              >
                <option value="Todos">Todos los encuestadores</option>
                {(statsData?.listaEncuestadores || []).map(enc => (
                  <option key={enc.email} value={enc.email}>
                    {enc.email.split('@')[0]} ({enc.totalCasos})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ── KPIS CARDS DE PRIMER IMPACTO ──────────────────────── */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* Total Muestra */}
          <div className={`p-4 rounded-2xl border ${cardBgClass} relative overflow-hidden group`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-medium ${subTextClass}`}>Muestra Relevada</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black tracking-tight flex items-baseline gap-2">
              <span>{statsData?.kpis?.totalMuestra ?? '—'}</span>
              {statsData?.kpis?.totalUniverso && statsData?.kpis?.totalMuestra !== statsData?.kpis?.totalUniverso && (
                <span className="text-xs font-medium text-slate-400">/ {statsData.kpis.totalUniverso}</span>
              )}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Presencial 100% auditada
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Clima de Cambio */}
          <div className={`p-4 rounded-2xl border ${cardBgClass} relative overflow-hidden group`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-medium ${subTextClass}`}>Preferencia de Cambio</span>
              <Vote className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black tracking-tight text-amber-400">
              {statsData?.kpis?.pctCambio ?? 0}%
            </div>
            <div className={`text-[11px] ${subTextClass} mt-1`}>
              Continuidad: <span className="font-semibold text-cyan-400">{statsData?.kpis?.pctContinuidad ?? 0}%</span>
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Neto Marcos Ferrer */}
          <div className={`p-4 rounded-2xl border ${cardBgClass} relative overflow-hidden group`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-medium ${subTextClass}`}>Neto Marcos Ferrer</span>
              <Building2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className={`text-2xl font-black tracking-tight ${
              (statsData?.kpis?.netoFerrer ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {(statsData?.kpis?.netoFerrer ?? 0) > 0 ? '+' : ''}{statsData?.kpis?.netoFerrer ?? 0}%
            </div>
            <div className={`text-[11px] ${subTextClass} mt-1`}>
              Gestión Municipal Río Tercero
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Neto Martín Llaryora */}
          <div className={`p-4 rounded-2xl border ${cardBgClass} relative overflow-hidden group`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-medium ${subTextClass}`}>Neto Martín Llaryora</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className={`text-2xl font-black tracking-tight ${
              (statsData?.kpis?.netoLlaryora ?? 0) >= 0 ? 'text-cyan-400' : 'text-rose-400'
            }`}>
              {(statsData?.kpis?.netoLlaryora ?? 0) > 0 ? '+' : ''}{statsData?.kpis?.netoLlaryora ?? 0}%
            </div>
            <div className={`text-[11px] ${subTextClass} mt-1`}>
              Gestión Provincial Córdoba
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* Neto Javier Milei */}
          <div className={`p-4 rounded-2xl border ${cardBgClass} relative overflow-hidden group col-span-2 sm:col-span-1`}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-xs font-medium ${subTextClass}`}>Neto Javier Milei</span>
              <Target className="w-4 h-4 text-purple-400" />
            </div>
            <div className={`text-2xl font-black tracking-tight ${
              (statsData?.kpis?.netoMilei ?? 0) >= 0 ? 'text-purple-400' : 'text-rose-400'
            }`}>
              {(statsData?.kpis?.netoMilei ?? 0) > 0 ? '+' : ''}{statsData?.kpis?.netoMilei ?? 0}%
            </div>
            <div className={`text-[11px] ${subTextClass} mt-1`}>
              Gestión Nacional Argentina
            </div>
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          </div>
        </section>

        {/* ── PESTAÑAS TEMÁTICAS ─────────────────────────────────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-white/10">
          {[
            { id: 'resumen', label: 'Resumen Ejecutivo', icon: Sparkles },
            { id: 'gestiones', label: 'Evaluación de Gestiones', icon: BarChart3 },
            { id: 'dirigentes', label: 'Matriz de Dirigentes', icon: UserCheck },
            { id: 'electoral', label: 'Escenarios Electorales', icon: Vote },
            { id: 'demografia', label: 'Perfil Demográfico', icon: Users },
            { id: 'auditoria', label: 'Auditoría de Campo', icon: ShieldCheck },
            { id: 'respuestas', label: 'Base en Vivo', icon: FileSpreadsheet }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[var(--color-brand-cyan)] text-black shadow-md shadow-cyan-500/20'
                    : darkMode
                    ? 'text-slate-300 hover:text-white hover:bg-white/5'
                    : 'text-slate-600 hover:text-black hover:bg-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── CONTENIDO DE CADA PESTAÑA ─────────────────────────── */}
        <AnimatePresence mode="wait">
          {/* 1. RESUMEN EJECUTIVO */}
          {activeTab === 'resumen' && (
            <motion.div
              key="resumen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Comparativa de las 3 Gestiones */}
                <div className={`lg:col-span-7 p-5 rounded-2xl border ${cardBgClass}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold">Balance de Gestiones Públicas</h3>
                      <p className={`text-xs ${subTextClass}`}>Imagen Positiva vs Imagen Negativa en Río Tercero</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {[
                      {
                        title: 'Gestión Municipal: Marcos Ferrer',
                        data: statsData?.gestiones?.ferrer,
                        tag: 'Local'
                      },
                      {
                        title: 'Gestión Provincial: Martín Llaryora',
                        data: statsData?.gestiones?.llaryora,
                        tag: 'Córdoba'
                      },
                      {
                        title: 'Gestión Nacional: Javier Milei',
                        data: statsData?.gestiones?.milei,
                        tag: 'Nación'
                      }
                    ].map((item, idx) => {
                      const pos = item.data?.positivaPct ?? 0;
                      const neg = item.data?.negativaPct ?? 0;
                      const nsnc = item.data?.nsncPct ?? 0;
                      const dif = item.data?.diferencial ?? 0;

                      return (
                        <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="flex items-center gap-2">
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                {item.tag}
                              </span>
                              {item.title}
                            </span>
                            <span className={dif >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              Neto: {dif > 0 ? '+' : ''}{dif}%
                            </span>
                          </div>

                          {/* Barra visual apilada */}
                          <div className="h-4 w-full rounded-full bg-slate-800 overflow-hidden flex text-[10px] font-bold text-black">
                            <div
                              style={{ width: `${pos}%` }}
                              className="bg-emerald-400 flex items-center justify-center transition-all duration-500"
                              title={`Positiva: ${pos}%`}
                            >
                              {pos > 12 && `${pos}%`}
                            </div>
                            <div
                              style={{ width: `${neg}%` }}
                              className="bg-rose-500 text-white flex items-center justify-center transition-all duration-500"
                              title={`Negativa: ${neg}%`}
                            >
                              {neg > 12 && `${neg}%`}
                            </div>
                            <div
                              style={{ width: `${nsnc}%` }}
                              className="bg-slate-500 text-white flex items-center justify-center transition-all duration-500"
                              title={`NS/NC: ${nsnc}%`}
                            >
                              {nsnc > 10 && `${nsnc}%`}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                            <span className="text-emerald-400 font-medium">Positiva: {pos}%</span>
                            <span className="text-rose-400 font-medium">Negativa: {neg}%</span>
                            <span className="text-slate-400">NS/NC: {nsnc}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Continuidad vs Cambio */}
                <div className={`lg:col-span-5 p-5 rounded-2xl border ${cardBgClass} flex flex-col justify-between`}>
                  <div>
                    <h3 className="text-base font-bold">Elección Municipal Río Tercero</h3>
                    <p className={`text-xs ${subTextClass}`}>¿Desea continuidad del equipo de gobierno o cambio?</p>
                  </div>

                  <div className="h-56 my-2 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statsData?.eleccionMunicipal?.chartData || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="valor"
                        >
                          {(statsData?.eleccionMunicipal?.chartData || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                          formatter={(value, name, item) => [`${value} casos (${item.payload.pct}%)`, name]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black text-amber-400">{statsData?.eleccionMunicipal?.pctCambio ?? 0}%</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Cambio</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center">
                    <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <span className="text-[10px] text-amber-300 font-medium block">Prefiere Cambio</span>
                      <span className="text-sm font-bold text-amber-400">{statsData?.eleccionMunicipal?.pctCambio ?? 0}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                      <span className="text-[10px] text-cyan-300 font-medium block">Continuidad</span>
                      <span className="text-sm font-bold text-cyan-400">{statsData?.eleccionMunicipal?.pctContinuidad ?? 0}%</span>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-500/10 border border-slate-500/20">
                      <span className="text-[10px] text-slate-300 font-medium block">NS / NC</span>
                      <span className="text-sm font-bold text-slate-400">{statsData?.eleccionMunicipal?.pctNsnc ?? 0}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ranking de Principales Problemas de la Localidad */}
              <div className={`p-5 rounded-2xl border ${cardBgClass}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold">Principales Problemas de Río Tercero</h3>
                    <p className={`text-xs ${subTextClass}`}>Respuestas espontáneas / múltiples de los vecinos</p>
                  </div>
                  <span className="text-xs text-cyan-400 font-medium bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                    Pregunta 7
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {(statsData?.rankingProblemas || []).map((prob, idx) => {
                    const isTop = idx < 3;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border transition-all ${
                          isTop
                            ? 'bg-white/[0.04] border-[var(--color-brand-cyan)]/30'
                            : 'bg-white/[0.01] border-white/5'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                          <span className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold ${
                              isTop ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {idx + 1}
                            </span>
                            {prob.problema}
                          </span>
                          <span className={isTop ? 'text-cyan-400 font-bold' : 'text-slate-300'}>
                            {prob.pct}% ({prob.count})
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            style={{ width: `${prob.pct}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              isTop ? 'bg-[var(--color-brand-cyan)]' : 'bg-slate-500'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. EVALUACIÓN DE GESTIONES */}
          {activeTab === 'gestiones' && (
            <motion.div
              key="gestiones"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Marcos Ferrer',
                    sub: 'Intendencia de Río Tercero',
                    data: statsData?.gestiones?.ferrer,
                    color: 'emerald'
                  },
                  {
                    title: 'Martín Llaryora',
                    sub: 'Gobierno de la Provincia de Córdoba',
                    data: statsData?.gestiones?.llaryora,
                    color: 'cyan'
                  },
                  {
                    title: 'Javier Milei',
                    sub: 'Presidencia de la Nación',
                    data: statsData?.gestiones?.milei,
                    color: 'purple'
                  }
                ].map((g, i) => (
                  <div key={i} className={`p-5 rounded-2xl border ${cardBgClass} flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[11px] font-semibold uppercase tracking-wider ${subTextClass}`}>
                          {g.sub}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          (g.data?.diferencial ?? 0) >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          Neto: {(g.data?.diferencial ?? 0) > 0 ? '+' : ''}{g.data?.diferencial ?? 0}%
                        </span>
                      </div>
                      <h3 className="text-xl font-bold">{g.title}</h3>

                      <div className="h-48 my-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={g.data?.chartData || []} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} />
                            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
                            <Tooltip
                              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                              formatter={(val, name, item) => [`${val} respuestas (${item.payload.pct}%)`, 'Cantidad']}
                            />
                            <Bar dataKey="valor" radius={[6, 6, 0, 0]}>
                              {(g.data?.chartData || []).map((entry, index) => (
                                <Cell key={`bar-${index}`} fill={entry.color} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5 text-center">
                      <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <span className="text-[10px] text-emerald-300 block font-medium">Positiva Total</span>
                        <span className="text-base font-black text-emerald-400">{g.data?.positivaPct ?? 0}%</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20">
                        <span className="text-[10px] text-rose-300 block font-medium">Negativa Total</span>
                        <span className="text-base font-black text-rose-400">{g.data?.negativaPct ?? 0}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 3. MATRIZ DE DIRIGENTES */}
          {activeTab === 'dirigentes' && (
            <motion.div
              key="dirigentes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Selector Locales vs Departamentales */}
              <div className="flex items-center justify-between">
                <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10">
                  <button
                    onClick={() => setSelectedDirigentesType('locales')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedDirigentesType === 'locales'
                        ? 'bg-[var(--color-brand-cyan)] text-black'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    9 Dirigentes Locales (P9)
                  </button>
                  <button
                    onClick={() => setSelectedDirigentesType('departamentales')}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      selectedDirigentesType === 'departamentales'
                        ? 'bg-[var(--color-brand-cyan)] text-black'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    4 Dirigentes Departamentales (P10)
                  </button>
                </div>

                <span className={`text-xs ${subTextClass}`}>
                  Ordenados por Imagen Positiva
                </span>
              </div>

              {/* Grid de Tarjetas de Dirigentes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {(
                  selectedDirigentesType === 'locales'
                    ? statsData?.dirigentesLocales || []
                    : statsData?.dirigentesDepartamentales || []
                ).map((d, i) => (
                  <div key={d.nombre} className={`p-4 rounded-2xl border ${cardBgClass} flex flex-col justify-between space-y-3`}>
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px] font-bold">
                              {i + 1}
                            </span>
                            <h4 className="text-base font-bold">{d.nombre}</h4>
                          </div>
                          <span className={`text-[11px] ${subTextClass} block mt-0.5`}>
                            Conocimiento: <strong className="text-white">{d.conocimientoPct}%</strong> (No conoce: {d.noConocePct}%)
                          </span>
                        </div>

                        <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${
                          d.diferencial >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {d.diferencial > 0 ? '+' : ''}{d.diferencial}%
                        </span>
                      </div>

                      {/* Barra de Distribución */}
                      <div className="mt-3 space-y-1">
                        <div className="h-3 w-full rounded-full bg-slate-800 overflow-hidden flex">
                          <div style={{ width: `${d.posPct}%` }} className="bg-emerald-400" title={`Positiva: ${d.posPct}%`} />
                          <div style={{ width: `${d.negPct}%` }} className="bg-rose-500" title={`Negativa: ${d.negPct}%`} />
                          <div style={{ width: `${d.noConocePct}%` }} className="bg-slate-600" title={`No conoce: ${d.noConocePct}%`} />
                          <div style={{ width: `${d.nsncPct}%` }} className="bg-slate-700" title={`NS/NC: ${d.nsncPct}%`} />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/5 text-center text-[11px]">
                      <div className="p-1 rounded-lg bg-emerald-500/10">
                        <span className="text-[10px] text-emerald-300 block">Positiva</span>
                        <strong className="text-emerald-400">{d.posPct}%</strong>
                      </div>
                      <div className="p-1 rounded-lg bg-rose-500/10">
                        <span className="text-[10px] text-rose-300 block">Negativa</span>
                        <strong className="text-rose-400">{d.negPct}%</strong>
                      </div>
                      <div className="p-1 rounded-lg bg-slate-500/10">
                        <span className="text-[10px] text-slate-300 block">No conoce</span>
                        <strong className="text-slate-400">{d.noConocePct}%</strong>
                      </div>
                      <div className="p-1 rounded-lg bg-slate-500/10">
                        <span className="text-[10px] text-slate-300 block">NS/NC</span>
                        <strong className="text-slate-400">{d.nsncPct}%</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 4. ESCENARIOS ELECTORALES */}
          {activeTab === 'electoral' && (
            <motion.div
              key="electoral"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* P11 Gobernador General */}
              <div className={`p-5 rounded-2xl border ${cardBgClass}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold">Elecciones Gobernador de Córdoba 2027 (Preferencia General)</h3>
                    <p className={`text-xs ${subTextClass}`}>Pregunta 11: ¿Votaría por…?</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {(statsData?.gobernadorP11?.items || []).map((item, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                      <span className={`text-[11px] font-medium ${subTextClass} block`}>{item.candidato}</span>
                      <div className="text-xl font-black text-cyan-400">{item.pct}%</div>
                      <span className={`text-[10px] ${subTextClass}`}>{item.count} votos</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* P12 Escenarios 1 al 5 */}
              <div className={`p-5 rounded-2xl border ${cardBgClass}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div>
                    <h3 className="text-base font-bold">Escenarios Competitivos a Gobernador (P12)</h3>
                    <p className={`text-xs ${subTextClass}`}>Selecciona el escenario para comparar la intención de voto</p>
                  </div>

                  <div className="inline-flex p-1 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto overflow-x-auto max-w-full">
                    {[0, 1, 2, 3, 4].map(idx => (
                      <button
                        key={idx}
                        onClick={() => setSelectedEscenarioIdx(idx)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                          selectedEscenarioIdx === idx
                            ? 'bg-[var(--color-brand-cyan)] text-black'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        Escenario {idx + 1}
                      </button>
                    ))}
                  </div>
                </div>

                {statsData?.escenariosP12?.[selectedEscenarioIdx] && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-semibold text-cyan-300">
                      {statsData.escenariosP12[selectedEscenarioIdx].title}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {statsData.escenariosP12[selectedEscenarioIdx].items.map((cand, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span>{cand.candidato}</span>
                            <span className="text-cyan-400 font-bold">{cand.pct}% ({cand.count})</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                            <div
                              style={{ width: `${cand.pct}%` }}
                              className="h-full rounded-full bg-[var(--color-brand-cyan)] transition-all duration-500"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 5. PERFIL DEMOGRÁFICO */}
          {activeTab === 'demografia' && (
            <motion.div
              key="demografia"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Por Edad */}
                <div className={`p-5 rounded-2xl border ${cardBgClass}`}>
                  <h3 className="text-base font-bold mb-3">Distribución por Edad</h3>
                  <div className="space-y-2.5">
                    {(statsData?.demografia?.porEdad || []).map((e, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{e.name} años</span>
                          <span className="font-semibold text-cyan-400">{e.pct}% ({e.count})</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div style={{ width: `${e.pct}%` }} className="h-full bg-cyan-400 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Por Género */}
                <div className={`p-5 rounded-2xl border ${cardBgClass}`}>
                  <h3 className="text-base font-bold mb-3">Distribución por Género</h3>
                  <div className="space-y-2.5">
                    {(statsData?.demografia?.porGenero || []).map((g, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{g.name}</span>
                          <span className="font-semibold text-emerald-400">{g.pct}% ({g.count})</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div style={{ width: `${g.pct}%` }} className="h-full bg-emerald-400 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Por Voto 2023 */}
                <div className={`p-5 rounded-2xl border ${cardBgClass}`}>
                  <h3 className="text-base font-bold mb-3">Voto Presidencial 2023</h3>
                  <div className="space-y-2.5">
                    {(statsData?.rankingVoto2023 || []).map((v, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span>{v.candidato}</span>
                          <span className="font-semibold text-purple-400">{v.pct}% ({v.count})</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div style={{ width: `${v.pct}%` }} className="h-full bg-purple-400 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 6. AUDITORÍA DE CAMPO */}
          {activeTab === 'auditoria' && (
            <motion.div
              key="auditoria"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className={`p-5 rounded-2xl border ${cardBgClass}`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold">Rendimiento por Encuestador</h3>
                    <p className={`text-xs ${subTextClass}`}>Casos relevados presencialmente con geolocalización y marca temporal</p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {statsData?.kpis?.totalEncuestadores ?? 0} encuestadores activos
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className={`border-b ${darkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                        <th className="py-2.5 px-3">Encuestador</th>
                        <th className="py-2.5 px-3">Total Relevados</th>
                        <th className="py-2.5 px-3">% Muestra</th>
                        <th className="py-2.5 px-3">Estado Auditoría</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(statsData?.listaEncuestadores || []).map((enc, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-3 font-medium flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center font-bold text-[10px]">
                              {idx + 1}
                            </span>
                            {enc.email}
                          </td>
                          <td className="py-3 px-3 font-bold text-white">{enc.totalCasos} encuestas</td>
                          <td className="py-3 px-3 text-cyan-400 font-semibold">
                            {statsData?.kpis?.totalUniverso
                              ? ((enc.totalCasos / statsData.kpis.totalUniverso) * 100).toFixed(1)
                              : 0}%
                          </td>
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> Válida & Verificada
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* 7. BASE EN VIVO */}
          {activeTab === 'respuestas' && (
            <motion.div
              key="respuestas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className={`p-5 rounded-2xl border ${cardBgClass}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-base font-bold">Base de Datos de Respuestas en Vivo</h3>
                    <p className={`text-xs ${subTextClass}`}>
                      {filteredTableRows.length} registros encontrados
                    </p>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Buscar por encuestador, edad, voto..."
                      value={tableSearch}
                      onChange={e => {
                        setTableSearch(e.target.value);
                        setTablePage(1);
                      }}
                      className={`text-xs pl-8 pr-3 py-2 rounded-xl border outline-none w-64 ${inputClass}`}
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead>
                      <tr className={`border-b ${darkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                        <th className="py-2.5 px-2">#</th>
                        <th className="py-2.5 px-2">Fecha</th>
                        <th className="py-2.5 px-2">Edad</th>
                        <th className="py-2.5 px-2">Género</th>
                        <th className="py-2.5 px-2">Gestión Ferrer</th>
                        <th className="py-2.5 px-2">Gestión Llaryora</th>
                        <th className="py-2.5 px-2">Gestión Milei</th>
                        <th className="py-2.5 px-2">Elección Río Tercero</th>
                        <th className="py-2.5 px-2">Voto 2023</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {paginatedRows.map((r, i) => (
                        <tr key={i} className="hover:bg-white/[0.02]">
                          <td className="py-2 px-2 text-slate-400">{r._rowIndex}</td>
                          <td className="py-2 px-2 whitespace-nowrap">{r.fecha}</td>
                          <td className="py-2 px-2">{r.edad}</td>
                          <td className="py-2 px-2">{r.genero}</td>
                          <td className="py-2 px-2 font-medium">{r.gestion_ferrer}</td>
                          <td className="py-2 px-2 font-medium">{r.gestion_llaryora}</td>
                          <td className="py-2 px-2 font-medium">{r.gestion_milei}</td>
                          <td className="py-2 px-2 font-semibold text-amber-400">{r.cambio_continuidad}</td>
                          <td className="py-2 px-2 text-cyan-400">{r.voto_2023}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs">
                  <span className={subTextClass}>
                    Página {tablePage} de {totalTablePages}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setTablePage(p => Math.max(1, p - 1))}
                      disabled={tablePage === 1}
                      className={`px-3 py-1 rounded-lg border ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-300 hover:bg-slate-100'} disabled:opacity-40`}
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setTablePage(p => Math.min(totalTablePages, p + 1))}
                      disabled={tablePage === totalTablePages}
                      className={`px-3 py-1 rounded-lg border ${darkMode ? 'border-white/10 hover:bg-white/5' : 'border-slate-300 hover:bg-slate-100'} disabled:opacity-40`}
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default EncuestaRioTerceroDashboard;
