import React from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Target, BarChart3, TrendingUp, 
  Smile, Meh, Frown, MessageSquare,
  MapPin, Calendar, ShieldCheck, Zap,
  Info, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from 'recharts';

/* ── Constants & Styles ──────────────────────────────── */
const CYAN = 'var(--color-brand-cyan)';
const EMERALD = '#10b981';
const ROSE = '#ef4444';
const AMBER = '#f59e0b';
const PURPLE = '#8b5cf6';

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
const SENTIMENT_DATA = [
  { name: 'Positivo', value: 38, color: EMERALD },
  { name: 'Neutral', value: 25, color: AMBER },
  { name: 'Negativo', value: 37, color: ROSE },
];

const CONCERNS_DATA = [
  { topic: 'Seguridad', score: 85 },
  { topic: 'Inflación', score: 78 },
  { topic: 'Desempleo', score: 62 },
  { topic: 'Educación', score: 55 },
  { topic: 'Salud', score: 48 },
];

const TREND_DATA = [
  { month: 'Ene', humor: 45 }, { month: 'Feb', humor: 42 }, { month: 'Mar', humor: 48 },
  { month: 'Abr', humor: 52 }, { month: 'May', humor: 50 }, { month: 'Jun', humor: 55 },
];

const IMAGE_DATA = [
  { subject: 'Gestión Local', A: 70, fullMark: 100 },
  { subject: 'Transparencia', A: 55, fullMark: 100 },
  { subject: 'Cercanía', A: 82, fullMark: 100 },
  { subject: 'Eficiencia', A: 60, fullMark: 100 },
  { subject: 'Innovación', A: 75, fullMark: 100 },
];

const WORD_CLOUD = [
  { text: 'Seguridad', size: 32, opacity: 1 },
  { text: 'Economía', size: 28, opacity: 0.9 },
  { text: 'Barrios', size: 24, opacity: 0.8 },
  { text: 'Tránsito', size: 20, opacity: 0.7 },
  { text: 'Limpieza', size: 22, opacity: 0.75 },
  { text: 'Obras', size: 26, opacity: 0.85 },
  { text: 'Iluminación', size: 18, opacity: 0.6 },
  { text: 'Baches', size: 16, opacity: 0.5 },
];

/* ── Components ──────────────────────────────────────── */

const MethodologicalKPI = ({ label, value, sub, icon: Icon }) => (
  <div className="bg-brand-surface/40 p-4 rounded-2xl border border-white/5 flex items-center gap-4 relative overflow-hidden group">
    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-secondary group-hover:text-[var(--color-brand-cyan)] transition-colors">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-[9px] font-bold uppercase tracking-widest text-brand-secondary mb-0.5">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-display font-bold text-white">{value}</span>
        <span className="text-[10px] text-brand-secondary">{sub}</span>
      </div>
    </div>
  </div>
);

const OpinionPublicaDemo = () => {
  return (
    <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
      
      {/* 1. Methodological Header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MethodologicalKPI label="Muestra" value="1.200" sub="Casos" icon={Users} />
        <MethodologicalKPI label="Error" value="±2.8%" sub="Margen" icon={ShieldCheck} />
        <MethodologicalKPI label="Confianza" value="95%" sub="Nivel" icon={Target} />
        <MethodologicalKPI label="Campo" value="15-20" sub="Abril" icon={Calendar} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Sentiment Analysis (Humor Social) */}
        <div className="lg:col-span-1 bg-brand-surface/40 rounded-3xl border border-white/5 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary flex items-center gap-2">
              <Smile size={14} className="text-emerald-500" /> Humor Social Actual
            </h4>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={12} /> +4%
            </div>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center py-4">
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={SENTIMENT_DATA} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {SENTIMENT_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 w-full gap-2 mt-4">
              {SENTIMENT_DATA.map(s => (
                <div key={s.name} className="text-center">
                  <p className="text-[10px] text-brand-secondary mb-1 uppercase tracking-tighter">{s.name}</p>
                  <p className="text-lg font-bold text-white">{s.value}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Trends & Evolution */}
        <div className="lg:col-span-2 bg-brand-surface/40 rounded-3xl border border-white/5 p-6 flex flex-col">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-6 flex items-center gap-2">
            <TrendingUp size={14} className="text-[var(--color-brand-cyan)]" /> Evolución del Índice de Gestión
          </h4>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND_DATA}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}} dy={10} />
                <YAxis hide domain={[30, 70]} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="humor" stroke={CYAN} strokeWidth={4} dot={{r: 4, fill: CYAN, strokeWidth: 0}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-3 bg-white/[0.02] rounded-xl border border-white/5 flex items-center justify-between">
            <p className="text-[10px] text-brand-secondary">Pico histórico alcanzado en <span className="text-white font-bold">Junio</span></p>
            <Zap size={14} className="text-amber-500 animate-pulse" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 4. Top Concerns */}
        <div className="bg-brand-surface/40 rounded-3xl border border-white/5 p-6">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-6 flex items-center gap-2">
            <ShieldCheck size={14} className="text-rose-500" /> Principales Preocupaciones
          </h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CONCERNS_DATA} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="topic" type="category" axisLine={false} tickLine={false} tick={{fill: 'white', fontSize: 11, fontWeight: 'bold'}} width={80} />
                <Tooltip {...tooltipStyle} />
                <Bar dataKey="score" radius={[0, 8, 8, 0]} barSize={20}>
                  {CONCERNS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? ROSE : CYAN} fillOpacity={1 - index * 0.15} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Image & Attributes */}
        <div className="bg-brand-surface/40 rounded-3xl border border-white/5 p-6">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-6 flex items-center gap-2">
            <Target size={14} className="text-purple-500" /> Percepción de Atributos
          </h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={IMAGE_DATA}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 9}} />
                <Radar name="Valoración" dataKey="A" stroke={PURPLE} fill={PURPLE} fillOpacity={0.5} />
                <Tooltip {...tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 6. Word Cloud Simulated & Footer */}
      <div className="bg-brand-surface/60 rounded-3xl border border-[var(--color-brand-cyan)]/20 p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--color-brand-cyan)]/30 to-transparent" />
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-8">Conceptos Asociados a la Gestión</h4>
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 max-w-2xl mx-auto">
          {WORD_CLOUD.map((word, i) => (
            <motion.span 
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: word.opacity }}
              className="font-display font-extrabold cursor-default hover:text-[var(--color-brand-cyan)] transition-colors"
              style={{ fontSize: `${word.size}px`, color: i === 0 ? 'white' : 'rgba(255,255,255,0.6)' }}
            >
              {word.text}
            </motion.span>
          ))}
        </div>
        <div className="mt-12 flex justify-center gap-10 border-t border-white/5 pt-8">
          <div className="text-left">
            <p className="text-[9px] font-bold text-brand-secondary uppercase tracking-widest">Metodología</p>
            <p className="text-xs text-white">IVR + Online</p>
          </div>
          <div className="text-left">
            <p className="text-[9px] font-bold text-brand-secondary uppercase tracking-widest">Ámbito</p>
            <p className="text-xs text-white">Ciudad Capital</p>
          </div>
          <div className="text-left">
            <p className="text-[9px] font-bold text-brand-secondary uppercase tracking-widest">Auditado por</p>
            <p className="text-xs text-[var(--color-brand-cyan)] font-bold">Consultio Tech</p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default OpinionPublicaDemo;
