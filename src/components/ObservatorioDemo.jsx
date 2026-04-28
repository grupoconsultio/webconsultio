import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, TrendingUp, HardHat, ArrowLeft, Activity, Clock,
  Percent, DollarSign, Briefcase, Building2, CheckCircle2,
  AlertCircle, Users, Stethoscope, BarChart3
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

/* ── Shared ─────────────────────────────────────────── */
const CYAN = 'var(--color-brand-cyan)';
const C = [CYAN, '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#10b981'];

const tooltip = {
  contentStyle: {
    backgroundColor: 'var(--color-brand-surface)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    fontSize: '12px'
  },
  itemStyle: { color: CYAN },
  labelStyle: { color: 'rgba(255,255,255,0.5)' },
};

const KPI = ({ label, value, sub, icon: Icon, color = CYAN }) => (
  <div className="bg-brand-bg/60 p-4 rounded-2xl border border-white/5 flex flex-col gap-1.5">
    <div className="flex justify-between items-start">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-secondary">{label}</span>
      <Icon size={14} style={{ color }} />
    </div>
    <span className="text-2xl font-display font-bold" style={{ color }}>{value}</span>
    {sub && <span className="text-[11px] text-brand-secondary leading-tight">{sub}</span>}
  </div>
);

const Card = ({ title, children, className = '' }) => (
  <div className={`bg-brand-bg/60 p-4 rounded-2xl border border-white/5 ${className}`}>
    <p className="text-[10px] font-semibold uppercase tracking-wider text-brand-secondary mb-3">{title}</p>
    {children}
  </div>
);

/* ══════════════════════════════════════════════════════
   SALUD
══════════════════════════════════════════════════════ */
const saludTrend = [
  { mes: 'Ene', atenciones: 6820 }, { mes: 'Feb', atenciones: 7140 },
  { mes: 'Mar', atenciones: 8300 }, { mes: 'Abr', atenciones: 7950 },
  { mes: 'May', atenciones: 8780 }, { mes: 'Jun', atenciones: 9200 },
  { mes: 'Jul', atenciones: 9490 },
];
const centros = [
  { c: 'C. Norte', v: 8240 }, { c: 'C. Sur', v: 6180 }, { c: 'C. Este', v: 9140 },
  { c: 'C. Oeste', v: 7320 }, { c: 'Policlínico', v: 12450 }, { c: 'CAPS 1', v: 5062 },
];
const disciplinas = [
  { name: 'Med. General', value: 35 }, { name: 'Pediatría', value: 22 },
  { name: 'Odontología', value: 18 }, { name: 'Ginecología', value: 12 },
  { name: 'Traumatología', value: 8 }, { name: 'Otros', value: 5 },
];

const SaludDash = () => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="Total Atenciones" value="48.392" sub="Acumulado 2026" icon={Activity} />
      <KPI label="Centros Activos" value="24" sub="En operación" icon={Building2} />
      <KPI label="Ocupación de Camas" value="76%" sub="Tasa promedio" icon={Percent} color="#f59e0b" />
      <KPI label="Espera Promedio" value="18 min" sub="Tiempo de admisión" icon={Clock} color="#10b981" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card title="Evolución mensual de atenciones">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={saludTrend} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CYAN} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={CYAN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="mes" stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip {...tooltip} />
              <Area type="monotone" dataKey="atenciones" name="Atenciones" stroke={CYAN} strokeWidth={2} fill="url(#sg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="Atenciones por centro de salud">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={centros} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <XAxis dataKey="c" stroke="rgba(255,255,255,0.15)" fontSize={9} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.15)" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip {...tooltip} />
              <Bar dataKey="v" name="Atenciones" fill={CYAN} radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
    <Card title="Distribución por especialidad médica">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="h-40 w-full md:w-44 flex-shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={disciplinas} innerRadius={42} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none">
                {disciplinas.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
              </Pie>
              <Tooltip {...tooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs w-full">
          {disciplinas.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: C[i] }} />
              <span className="text-brand-secondary">{d.name}</span>
              <span className="text-white font-semibold ml-auto">{d.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  </div>
);

/* ══════════════════════════════════════════════════════
   ECONOMÍA
══════════════════════════════════════════════════════ */
const econTrend = [
  { mes: 'Ene', ingresos: 380, egresos: 340 }, { mes: 'Feb', ingresos: 420, egresos: 390 },
  { mes: 'Mar', ingresos: 460, egresos: 410 }, { mes: 'Abr', ingresos: 440, egresos: 420 },
  { mes: 'May', ingresos: 510, egresos: 470 }, { mes: 'Jun', ingresos: 490, egresos: 450 },
  { mes: 'Jul', ingresos: 540, egresos: 500 },
];
const gastos = [
  { name: 'Educación', value: 32 }, { name: 'Salud', value: 24 },
  { name: 'Infraestructura', value: 18 }, { name: 'Seguridad', value: 12 },
  { name: 'Otros', value: 14 },
];
const recaudMensual = [
  { mes: 'Ene', v: 380 }, { mes: 'Feb', v: 420 }, { mes: 'Mar', v: 460 },
  { mes: 'Abr', v: 440 }, { mes: 'May', v: 510 }, { mes: 'Jun', v: 490 }, { mes: 'Jul', v: 540 },
];

const EconomiaDash = () => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="Recaudación" value="$2.840M" sub="Acumulado 2026" icon={DollarSign} />
      <KPI label="Ejecución Presup." value="68%" sub="Sobre lo proyectado" icon={Percent} color="#f59e0b" />
      <KPI label="Resultado" value="+$124M" sub="Superávit acumulado" icon={TrendingUp} color="#10b981" />
      <KPI label="Empleo Formal" value="12.450" sub="Trabajadores registrados" icon={Briefcase} color="#8b5cf6" />
    </div>
    <Card title="Ingresos vs. Egresos mensuales (millones $)">
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={econTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="ing" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CYAN} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CYAN} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="egr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="mes" stroke="rgba(255,255,255,0.15)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="rgba(255,255,255,0.15)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip {...tooltip} />
            <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', paddingTop: '8px' }} />
            <Area type="monotone" dataKey="ingresos" name="Ingresos" stroke={CYAN} strokeWidth={2} fill="url(#ing)" />
            <Area type="monotone" dataKey="egresos" name="Egresos" stroke="#f59e0b" strokeWidth={2} fill="url(#egr)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card title="Recaudación mensual (millones $)">
        <div className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={recaudMensual} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <XAxis dataKey="mes" stroke="rgba(255,255,255,0.15)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.15)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip {...tooltip} />
              <Bar dataKey="v" name="Recaudación" fill="#10b981" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="Distribución del gasto público">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="h-40 w-full md:w-36 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gastos} innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="value" stroke="none">
                  {gastos.map((_, i) => <Cell key={i} fill={C[i % C.length]} />)}
                </Pie>
                <Tooltip {...tooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 md:flex md:flex-col gap-2 text-xs w-full">
            {gastos.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: C[i] }} />
                <span className="text-brand-secondary">{d.name}</span>
                <span className="text-white font-semibold ml-auto pl-2">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════
   OBRAS PÚBLICAS
══════════════════════════════════════════════════════ */
const obrasPorZona = [
  { zona: 'Norte', v: 8 }, { zona: 'Sur', v: 11 }, { zona: 'Este', v: 7 },
  { zona: 'Oeste', v: 9 }, { zona: 'Centro', v: 11 },
];
const inversionMensual = [
  { mes: 'Ene', v: 120 }, { mes: 'Feb', v: 145 }, { mes: 'Mar', v: 180 },
  { mes: 'Abr', v: 165 }, { mes: 'May', v: 210 }, { mes: 'Jun', v: 195 }, { mes: 'Jul', v: 225 },
];
const proyectos = [
  { nombre: 'Pavimentación Av. Principal', avance: 85, warn: false },
  { nombre: 'Nuevo Hospital Municipal', avance: 45, warn: false },
  { nombre: 'Ampliación Red Cloacal', avance: 72, warn: false },
  { nombre: 'Parque Tecnológico', avance: 30, warn: true },
  { nombre: 'Repavimentación Calles', avance: 91, warn: false },
];

const ObrasDash = () => (
  <div className="flex flex-col gap-4">
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <KPI label="En Ejecución" value="34" sub="Proyectos activos" icon={HardHat} />
      <KPI label="Completados" value="12" sub="En lo que va del año" icon={CheckCircle2} color="#10b981" />
      <KPI label="Inversión Total" value="$1.240M" sub="Presupuesto 2026" icon={DollarSign} color="#8b5cf6" />
      <KPI label="Avance Promedio" value="58%" sub="Sobre el plan de obra" icon={Percent} color="#f59e0b" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card title="Obras por zona geográfica">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={obrasPorZona} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <XAxis dataKey="zona" stroke="rgba(255,255,255,0.15)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.15)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip {...tooltip} />
              <Bar dataKey="v" name="Obras" fill="#8b5cf6" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card title="Inversión ejecutada mensual (millones $)">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={inversionMensual} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="mes" stroke="rgba(255,255,255,0.15)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.15)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip {...tooltip} />
              <Area type="monotone" dataKey="v" name="Inversión" stroke="#8b5cf6" strokeWidth={2} fill="url(#invGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
    <Card title="Avance de proyectos destacados">
      <div className="flex flex-col gap-3 mt-1">
        {proyectos.map((p, i) => (
          <div key={i}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-brand-secondary truncate pr-2">{p.nombre}</span>
              <div className="flex items-center gap-1 flex-shrink-0">
                {p.warn
                  ? <AlertCircle size={12} className="text-yellow-500" />
                  : <CheckCircle2 size={12} className="text-[var(--color-brand-cyan)]" />}
                <span className="text-xs font-bold text-white">{p.avance}%</span>
              </div>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5">
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${p.avance}%`, backgroundColor: p.warn ? '#f59e0b' : CYAN }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

/* ══════════════════════════════════════════════════════
   CATEGORÍAS
══════════════════════════════════════════════════════ */
const categorias = [
  {
    key: 'salud',
    icon: Heart,
    color: '#ef4444',
    label: 'Salud',
    kpis: ['48.392 atenciones', '24 centros activos', '76% ocupación'],
    dash: SaludDash,
  },
  {
    key: 'economia',
    icon: TrendingUp,
    color: '#10b981',
    label: 'Economía',
    kpis: ['$2.840M recaudado', '68% ejecución presup.', '+$124M superávit'],
    dash: EconomiaDash,
  },
  {
    key: 'obras',
    icon: HardHat,
    color: '#8b5cf6',
    label: 'Obras Públicas',
    kpis: ['34 proyectos activos', '12 completados', '$1.240M inversión'],
    dash: ObrasDash,
  },
];

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════ */
const ObservatorioDemo = () => {
  const [active, setActive] = useState(null);
  const cat = categorias.find(c => c.key === active);

  return (
    <div className="glass-elevated border border-[var(--color-brand-cyan)]/20 rounded-2xl overflow-hidden shadow-2xl">

      {/* Chrome bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-brand-surface/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
        </div>
        <span className="text-[10px] text-[var(--color-brand-cyan)] font-mono tracking-widest font-bold hidden sm:block">
          OBSERVATORIO DE GESTIÓN — SISTEMA DE MONITOREO
        </span>
        <span className="text-[10px] text-[var(--color-brand-cyan)] font-mono tracking-widest font-bold sm:hidden">
          OBSERVATORIO
        </span>
        <div className="w-16" />
      </div>

      <div className="p-5 md:p-8">
        <AnimatePresence mode="wait">

          {/* ── Portada ── */}
          {!active && (
            <motion.div key="portada" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-brand-cyan)]/10 border border-[var(--color-brand-cyan)]/20 mb-5">
                  <BarChart3 size={13} className="text-[var(--color-brand-cyan)]" />
                  <span className="text-[var(--color-brand-cyan)] text-xs font-semibold tracking-widest uppercase">En tiempo real</span>
                </div>
                <h2 className="text-2xl md:text-4xl font-display font-bold text-white mb-3">
                  Observatorio de Gestión
                </h2>
                <p className="text-brand-secondary text-sm md:text-base max-w-lg mx-auto leading-relaxed">
                  Plataforma de monitoreo integral para la toma de decisiones basada en evidencia. Seleccioná una categoría para explorar los indicadores.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {categorias.map((c) => {
                  const Icon = c.icon;
                  return (
                    <motion.button
                      key={c.key}
                      whileHover={{ y: -5, scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActive(c.key)}
                      className="text-left p-6 bg-brand-bg/60 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-300 group"
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                        style={{ backgroundColor: `${c.color}20` }}
                      >
                        <Icon size={24} style={{ color: c.color }} />
                      </div>
                      <h3 className="text-lg font-display font-bold text-white mb-3 group-hover:text-[var(--color-brand-cyan)] transition-colors">
                        {c.label}
                      </h3>
                      <ul className="flex flex-col gap-1.5">
                        {c.kpis.map((k, i) => (
                          <li key={i} className="flex items-center gap-2 text-xs text-brand-secondary">
                            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: c.color }} />
                            {k}
                          </li>
                        ))}
                      </ul>
                      <div
                        className="mt-5 text-xs font-semibold flex items-center gap-1 transition-colors"
                        style={{ color: c.color }}
                      >
                        Ver tablero →
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* ── Dashboard ── */}
          {active && cat && (
            <motion.div key={active} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => setActive(null)}
                  className="flex items-center gap-1.5 text-brand-secondary hover:text-white transition-colors text-sm"
                >
                  <ArrowLeft size={15} /> Categorías
                </button>
                <div className="h-4 w-px bg-white/10" />
                <div className="flex items-center gap-2">
                  <cat.icon size={16} style={{ color: cat.color }} />
                  <span className="font-display font-bold text-white">{cat.label}</span>
                </div>
                <span
                  className="ml-auto text-[10px] font-semibold px-3 py-1 rounded-full"
                  style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                >
                  En tiempo real
                </span>
              </div>

              <cat.dash />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default ObservatorioDemo;
