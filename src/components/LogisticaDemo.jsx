import React from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, Clock, Package, BarChart3, 
  MapPin, AlertTriangle, CheckCircle2, 
  ArrowUpRight, Navigation, Zap,
  Activity, ShieldCheck
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, Cell
} from 'recharts';

/* ── Constants & Styles ──────────────────────────────── */
const PURPLE = '#8b5cf6';
const INDIGO = '#6366f1';
const EMERALD = '#10b981';
const AMBER = '#f59e0b';
const ROSE = '#ef4444';

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'var(--color-brand-surface)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
    fontSize: '11px',
  },
  itemStyle: { color: PURPLE },
};

/* ── Mock Data ───────────────────────────────────────── */
const EFFICIENCY_DATA = [
  { name: 'S1', planned: 45, actual: 48 },
  { name: 'S2', planned: 42, actual: 41 },
  { name: 'S3', planned: 40, actual: 44 },
  { name: 'S4', planned: 38, actual: 37 },
];

const STOCK_DATA = [
  { name: 'Insumos A', stock: 85 },
  { name: 'Insumos B', stock: 24 },
  { name: 'Productos C', stock: 65 },
  { name: 'Packaging', stock: 12 },
];

/* ── Components ──────────────────────────────────────── */

const LogisticaKPI = ({ label, value, sub, icon: Icon, color = PURPLE }) => (
  <div className="bg-brand-surface/40 p-5 rounded-3xl border border-white/5 flex flex-col gap-3 group relative overflow-hidden">
    <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={48} style={{ color }} />
    </div>
    <div className="flex justify-between items-center">
      <div className="p-2 rounded-xl bg-white/5 text-brand-secondary group-hover:text-white transition-colors">
        <Icon size={18} style={{ color }} />
      </div>
      <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-white/50`}>
        {sub}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1">{label}</p>
      <h3 className="text-2xl font-display font-bold text-white">{value}</h3>
    </div>
  </div>
);

const LogisticaDemo = () => {
  return (
    <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
      
      {/* 1. Header KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <LogisticaKPI label="Flota Activa" value="24 Unidades" sub="85% Capacidad" icon={Truck} color={PURPLE} />
        <LogisticaKPI label="Eficiencia (OTD)" value="94.2%" sub="+2.1% mes" icon={ShieldCheck} color={EMERALD} />
        <LogisticaKPI label="Tiempo Entrega" value="3.4 hs" sub="Promedio" icon={Clock} color={AMBER} />
        <LogisticaKPI label="Envíos Mes" value="1,450" sub="Meta: 1,800" icon={Package} color={INDIGO} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Operations Map (Stylized) */}
        <div className="lg:col-span-2 bg-brand-surface/40 rounded-3xl border border-white/5 p-6 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary flex items-center gap-2">
              <Navigation size={14} className="text-purple-500" /> Cobertura de Operaciones Globales
            </h4>
            <div className="flex gap-4">
              <div className="flex items-center gap-2 text-[9px] font-bold text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 12 Hubs Activos
              </div>
            </div>
          </div>
          
          <div className="flex-1 min-h-[300px] flex items-center justify-center relative">
            {/* Stylized Map Grid */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
            
            {/* Visual Markers */}
            <div className="relative w-full h-full flex items-center justify-center">
              <motion.div 
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/5 rounded-full animate-ping" />
              
              <div className="flex flex-col items-center gap-2 z-10">
                <MapPin size={40} className="text-purple-500" />
                <p className="text-[10px] font-bold text-white uppercase tracking-widest">Hub Central: Buenos Aires</p>
                <p className="text-[9px] text-brand-secondary">Última actualización: hace 2 min</p>
              </div>

              {/* Smaller Nodes */}
              <div className="absolute top-10 right-20 flex flex-col items-center gap-1 opacity-60">
                <MapPin size={20} className="text-indigo-400" />
                <span className="text-[8px] text-white font-bold">Node: Córdoba</span>
              </div>
              <div className="absolute bottom-20 left-40 flex flex-col items-center gap-1 opacity-60">
                <MapPin size={20} className="text-indigo-400" />
                <span className="text-[8px] text-white font-bold">Node: Rosario</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Planned vs Actual */}
        <div className="bg-brand-surface/40 rounded-3xl border border-white/5 p-6">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-6 flex items-center gap-2">
            <Activity size={14} className="text-emerald-500" /> Desviación de Tiempos (Semanas)
          </h4>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={EFFICIENCY_DATA}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="planned" fill="rgba(255,255,255,0.1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill={PURPLE} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[9px] text-brand-secondary mt-4 text-center">Barras claras: Planificado | Púrpura: Ejecutado</p>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 4. Critical Inventory */}
        <div className="bg-brand-surface/40 rounded-3xl border border-white/5 p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary flex items-center gap-2">
              <Package size={14} className="text-amber-500" /> Niveles de Stock Críticos
            </h4>
            <AlertTriangle size={16} className="text-amber-500 animate-pulse" />
          </div>
          <div className="space-y-4">
            {STOCK_DATA.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-white w-20 uppercase tracking-tighter">{item.name}</span>
                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.stock}%` }}
                    className={`h-full rounded-full ${item.stock < 30 ? 'bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-emerald-500'}`}
                  />
                </div>
                <span className={`text-[10px] font-bold ${item.stock < 30 ? 'text-rose-500' : 'text-brand-secondary'}`}>
                  {item.stock}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Quick Insights */}
        <div className="bg-brand-surface/40 rounded-3xl border border-white/5 p-6 flex flex-col justify-between">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-4 flex items-center gap-2">
            <Zap size={14} className="text-indigo-400" /> Alertas Operativas
          </h4>
          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center gap-3">
              <AlertTriangle size={16} className="text-rose-500" />
              <div>
                <p className="text-[10px] font-bold text-white uppercase">Quiebre de Stock</p>
                <p className="text-[9px] text-brand-secondary">Packaging alcanzará nivel crítico en 48hs.</p>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
              <CheckCircle2 size={16} className="text-emerald-500" />
              <div>
                <p className="text-[10px] font-bold text-white uppercase">Mantenimiento OK</p>
                <p className="text-[9px] text-brand-secondary">Flota revisada y certificada para el próximo ciclo.</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-4 py-3 rounded-2xl border border-white/5 text-[10px] font-bold text-brand-secondary hover:text-white hover:bg-white/5 transition-all uppercase tracking-widest flex items-center justify-center gap-2">
            Optimizar Rutas <ArrowUpRight size={14} />
          </button>
        </div>

      </div>

      {/* Final System Status */}
      <div className="flex justify-center gap-8 text-[9px] text-brand-secondary font-bold uppercase tracking-widest border-t border-white/5 pt-8">
        <div className="flex items-center gap-2"><Activity size={12} className="text-purple-500" /> Supply Chain: Online</div>
        <div className="flex items-center gap-2"><Zap size={12} className="text-amber-500" /> Predictive Analysis Active</div>
        <div className="flex items-center gap-2"><BarChart3 size={12} className="text-cyan-500" /> Operational Efficiency: +12%</div>
      </div>

    </div>
  );
};

export default LogisticaDemo;
