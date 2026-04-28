import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, UserMinus, Star, GraduationCap,
  TrendingUp, TrendingDown, Briefcase, 
  BrainCircuit, Heart, BarChart2,
  ChevronRight, AlertCircle, Sparkles
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend
} from 'recharts';

/* ── Constants & Styles ──────────────────────────────── */
const CYAN = 'var(--color-brand-cyan)';
const PURPLE = '#8b5cf6';
const EMERALD = '#10b981';
const AMBER = '#f59e0b';
const ROSE = '#ef4444';

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'var(--color-brand-surface)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
    fontSize: '11px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  itemStyle: { color: CYAN },
  labelStyle: { color: 'rgba(255,255,255,0.5)', marginBottom: '4px' },
};

/* ── Mock Data ───────────────────────────────────────── */
const ENPS_DATA = [
  { month: 'Ene', nps: 42 }, { month: 'Feb', nps: 45 }, { month: 'Mar', nps: 40 },
  { month: 'Abr', nps: 52 }, { month: 'May', nps: 58 }, { month: 'Jun', nps: 62 },
];

const DEP_SATISFACTION = [
  { subject: 'Cultura', A: 85, fullMark: 100 },
  { subject: 'Liderazgo', A: 70, fullMark: 100 },
  { subject: 'Compensación', A: 65, fullMark: 100 },
  { subject: 'Crecimiento', A: 78, fullMark: 100 },
  { subject: 'Balance', A: 90, fullMark: 100 },
];

const TURNOVER_DATA = [
  { name: 'Ventas', value: 12, color: ROSE },
  { name: 'Tecnología', value: 4, color: EMERALD },
  { name: 'Operaciones', value: 8, color: AMBER },
  { name: 'RRHH', value: 2, color: PURPLE },
];

const SKILLS_DATA = [
  { name: 'Soft Skills', completed: 85 },
  { name: 'Técnico', completed: 62 },
  { name: 'Liderazgo', completed: 45 },
  { name: 'Seguridad', completed: 98 },
];

/* ── Components ──────────────────────────────────────── */

const CorporateKPI = ({ label, value, sub, icon: Icon, color = CYAN }) => (
  <div className="bg-brand-surface/40 p-5 rounded-3xl border border-white/5 flex flex-col gap-3 group relative overflow-hidden">
    <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={48} style={{ color }} />
    </div>
    <div className="flex justify-between items-center">
      <div className="p-2 rounded-xl bg-white/5 text-brand-secondary group-hover:text-white transition-colors">
        <Icon size={18} style={{ color }} />
      </div>
      <div className={`flex items-center gap-1 text-[10px] font-bold ${sub.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
        {sub.startsWith('+') ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
        {sub}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-1">{label}</p>
      <h3 className="text-2xl font-display font-bold text-white">{value}</h3>
    </div>
  </div>
);

const PeopleAnalyticsDemo = () => {
  return (
    <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
      
      {/* 1. Top KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CorporateKPI label="Colaboradores" value="482" sub="+12%" icon={Users} color={PURPLE} />
        <CorporateKPI label="Tasa Rotación" value="4.2%" sub="-0.8%" icon={UserMinus} color={ROSE} />
        <CorporateKPI label="eNPS Global" value="+62" sub="+15" icon={Star} color={AMBER} />
        <CorporateKPI label="Capacitación" value="78%" sub="+5%" icon={GraduationCap} color={EMERALD} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. eNPS Evolution */}
        <div className="lg:col-span-2 bg-brand-surface/40 rounded-3xl border border-white/5 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary flex items-center gap-2">
              <TrendingUp size={14} className="text-[var(--color-brand-cyan)]" /> Evolución de Clima Organizacional (eNPS)
            </h4>
            <div className="flex gap-2">
              <span className="text-[9px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-bold">EXCELENTE</span>
            </div>
          </div>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ENPS_DATA}>
                <defs>
                  <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PURPLE} stopOpacity={1} />
                    <stop offset="100%" stopColor={CYAN} stopOpacity={1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}} dy={10} />
                <YAxis hide domain={[0, 80]} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="nps" stroke="url(#lineGradient)" strokeWidth={4} dot={{r: 4, fill: PURPLE, strokeWidth: 0}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Radar: Diagnostic */}
        <div className="bg-brand-surface/40 rounded-3xl border border-white/5 p-6">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-6 flex items-center gap-2">
            <BrainCircuit size={14} className="text-purple-500" /> Diagnóstico de Atributos
          </h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={DEP_SATISFACTION}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 9}} />
                <Radar name="Valoración" dataKey="A" stroke={PURPLE} fill={PURPLE} fillOpacity={0.4} />
                <Tooltip {...tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 4. Turnover by Dept */}
        <div className="bg-brand-surface/40 rounded-3xl border border-white/5 p-6">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-6 flex items-center gap-2">
            <UserMinus size={14} className="text-rose-500" /> Fuga de Talento por Departamento
          </h4>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TURNOVER_DATA} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'white', fontSize: 11}} width={80} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={20}>
                  {TURNOVER_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Training Progress */}
        <div className="bg-brand-surface/40 rounded-3xl border border-white/5 p-6">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-6 flex items-center gap-2">
            <GraduationCap size={14} className="text-emerald-500" /> Avance de Planes de Carrera
          </h4>
          <div className="space-y-5 py-2">
            {SKILLS_DATA.map((skill, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-white">{skill.name}</span>
                  <span className="text-brand-secondary font-mono">{skill.completed}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${skill.completed}%` }}
                    className="h-full bg-emerald-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 6. Insights Section */}
      <div className="bg-gradient-to-br from-brand-surface to-purple-900/20 rounded-[32px] border border-purple-500/20 p-8">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
            <Sparkles size={32} />
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <h4 className="text-xl font-display font-bold text-white">Insights Estratégicos de IA</h4>
            <p className="text-sm text-brand-secondary leading-relaxed">
              El departamento de <span className="text-white font-bold">Ventas</span> presenta un riesgo de rotación elevado. Se recomienda revisar el plan de incentivos. El bienestar general (Work-Life Balance) es la mayor fortaleza actual de la organización.
            </p>
          </div>
          <button className="bg-purple-600 text-white font-bold px-6 py-3 rounded-2xl hover:bg-purple-500 transition-all flex items-center gap-2 whitespace-nowrap">
            Generar Reporte <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="flex flex-wrap justify-center gap-8 text-[9px] text-brand-secondary font-bold uppercase tracking-widest border-t border-white/5 pt-8">
        <div className="flex items-center gap-2"><Briefcase size={12} className="text-purple-500" /> Business Unit: Corporate</div>
        <div className="flex items-center gap-2"><Heart size={12} className="text-rose-500" /> Employee Happiness Focus</div>
        <div className="flex items-center gap-2"><AlertCircle size={12} className="text-amber-500" /> 3 High Priority Risks</div>
      </div>

    </div>
  );
};

export default PeopleAnalyticsDemo;
