import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const areaData = [
  { name: 'Ene', metric: 4000 },
  { name: 'Feb', metric: 3000 },
  { name: 'Mar', metric: 5000 },
  { name: 'Abr', metric: 4780 },
  { name: 'May', metric: 6890 },
  { name: 'Jun', metric: 8390 },
  { name: 'Jul', metric: 9490 },
];

const pieData = [
  { name: 'Aprobación', value: 68 },
  { name: 'Rechazo', value: 20 },
  { name: 'Indecisos', value: 12 },
];
const COLORS = ['var(--color-brand-cyan)', '#334155', '#475569'];

const DashboardMock = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full max-w-6xl mx-auto mt-24 glass-elevated border border-[var(--color-brand-cyan)]/20 rounded-2xl p-4 md:p-6 lg:p-10 overflow-hidden relative shadow-2xl"
    >
      <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-[var(--color-brand-cyan)]/10 blur-[100px] rounded-full pointer-events-none"></div>
      
      <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-8 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <span className="text-xs text-[var(--color-brand-cyan)] font-mono tracking-widest font-bold">PANEL DE CONTROL AVANZADO</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative z-10">
        {/* Main Area Chart */}
        <div className="lg:col-span-2 bg-brand-bg/50 p-4 md:p-6 rounded-2xl border border-white/5 flex flex-col">
          <div className="flex flex-wrap md:flex-nowrap justify-between items-start md:items-center gap-4 mb-6">
            <span className="text-sm font-semibold uppercase text-brand-secondary">Evolución</span>
            <span className="px-3 py-1 bg-[var(--color-brand-cyan)]/10 text-[var(--color-brand-cyan)] rounded-full text-xs font-bold w-fit">+24% vs año anterior</span>
          </div>
          <div className="flex-1 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-brand-cyan)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-brand-cyan)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-brand-surface)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: 'var(--color-brand-cyan)' }}
                />
                <Area type="monotone" dataKey="metric" stroke="var(--color-brand-cyan)" strokeWidth={3} fillOpacity={1} fill="url(#colorMetric)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart Analysis */}
        <div className="lg:col-span-1 bg-brand-bg/50 p-4 md:p-6 rounded-2xl border border-white/5 flex flex-col">
           <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold uppercase text-brand-secondary">Distribución</span>
          </div>
          <div className="flex-1 h-[180px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-brand-surface)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-white">68%</span>
            </div>
          </div>
          <div className="mt-2 flex justify-center gap-4 text-xs text-brand-secondary">
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[var(--color-brand-cyan)]"></div>Aprobación</div>
             <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-slate-700"></div>Rechazo</div>
          </div>
        </div>

        {/* Side Metrics */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-brand-bg/50 p-4 md:p-6 rounded-2xl border border-white/5 h-full flex flex-col justify-center">
            <div className="flex justify-between items-center text-brand-secondary mb-3">
              <span className="text-xs uppercase font-semibold text-white">Eficacia Proyectada</span>
              <Activity size={18} className="text-[var(--color-brand-cyan)]" />
            </div>
            <span className="text-4xl font-display font-bold text-[var(--color-brand-cyan)] mb-2">94.2%</span>
            <span className="text-sm text-brand-secondary leading-tight">Incremento sostenido en los últimos meses.</span>
          </div>
          <div className="bg-brand-bg/50 p-4 md:p-6 rounded-2xl border border-white/5 h-full flex flex-col justify-center">
            <div className="flex justify-between items-center text-brand-secondary mb-3">
              <span className="text-xs uppercase font-semibold text-white">Riesgo Operativo</span>
              <ShieldCheck size={18} className="text-[var(--color-brand-cyan)]" />
            </div>
            <span className="text-4xl font-display font-bold text-white mb-2">Bajo</span>
            <span className="text-sm text-brand-secondary leading-tight">Sin anomalías detectadas en la gestión.</span>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default DashboardMock;
