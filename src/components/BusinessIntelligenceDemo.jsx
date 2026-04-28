import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, DollarSign, Target, 
  BarChart3, MessageSquare, Sparkles, 
  Send, ChevronRight, PieChart as PieIcon,
  ShoppingCart, ArrowUpRight, Zap, Bot
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, CartesianGrid
} from 'recharts';

/* ── Constants & Styles ──────────────────────────────── */
const CYAN = 'var(--color-brand-cyan)';
const PURPLE = '#8b5cf6';
const EMERALD = '#10b981';

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'var(--color-brand-surface)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
    fontSize: '11px',
  },
  itemStyle: { color: CYAN },
};

/* ── Mock Data ───────────────────────────────────────── */
const REVENUE_DATA = [
  { name: 'Lun', sales: 4500 }, { name: 'Mar', sales: 5200 },
  { name: 'Mie', sales: 4800 }, { name: 'Jue', sales: 6100 },
  { name: 'Vie', sales: 5900 }, { name: 'Sab', sales: 7200 },
  { name: 'Dom', sales: 6800 },
];

const FUNNEL_DATA = [
  { step: 'Leads', value: 1200, fill: '#8b5cf6' },
  { step: 'Calificados', value: 800, fill: '#7c3aed' },
  { step: 'Propuestas', value: 450, fill: '#6d28d9' },
  { step: 'Cierres', value: 120, fill: '#00E5FF' },
];

/* ── Components ──────────────────────────────────────── */

const SalesKPI = ({ label, value, sub, icon: Icon, trend }) => (
  <div className="bg-brand-surface/40 p-5 rounded-3xl border border-white/5 flex flex-col gap-2">
    <div className="flex justify-between items-start">
      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-secondary">
        <Icon size={20} />
      </div>
      <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
        {sub}
      </div>
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">{label}</p>
      <h3 className="text-2xl font-display font-bold text-white">{value}</h3>
    </div>
  </div>
);

const BusinessIntelligenceDemo = () => {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hola, soy tu Analista de IA. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const botResponses = {
    'ventas': 'Durante la última semana tuvimos un ingreso total de **$40,500**, lo que representa un crecimiento del **14%** respecto a la semana anterior. El pico máximo fue el **Sábado** con $7,200.',
    'reporte': 'He generado el reporte de performance: El **Funnel de Conversión** está en un **10% (Leads a Cierre)**. Detecto una oportunidad de mejora en la etapa de "Propuestas", donde estamos perdiendo el 60% de los candidatos. Recomiendo automatizar el seguimiento.',
    'recomendacion': 'Basado en los datos, sugiero: 1. Reforzar pauta en canales digitales (Costo por Lead estable). 2. Incentivar cierres antes del Jueves, ya que el ciclo se ralentiza el fin de semana. 3. Lanzar oferta de "Up-selling" para clientes actuales.',
  };

  const handleSend = (key) => {
    const userMsg = key === 'ventas' ? '¿Cómo fueron las ventas la última semana?' : key === 'reporte' ? 'Brindame un reporte de gestión' : '¿Qué recomendaciones estratégicas tenés?';
    
    setMessages([...messages, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: botResponses[key] }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
      
      {/* 1. Header KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SalesKPI label="Revenue Semanal" value="$40,500" sub="+14.2%" icon={DollarSign} trend="up" />
        <SalesKPI label="Nuevos Leads" value="1,240" sub="+5.8%" icon={Zap} trend="up" />
        <SalesKPI label="Tasa Conversión" value="10.2%" sub="-1.2%" icon={Target} trend="down" />
        <SalesKPI label="Ticket Promedio" value="$326" sub="+2.5%" icon={ShoppingCart} trend="up" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Revenue Chart */}
        <div className="lg:col-span-2 bg-brand-surface/40 rounded-3xl border border-white/5 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary flex items-center gap-2">
              <TrendingUp size={14} className="text-emerald-500" /> Ingresos vs. Período Anterior
            </h4>
            <div className="flex gap-2 text-[10px] font-bold">
              <span className="text-white">Actual</span>
              <span className="text-brand-secondary">Anterior</span>
            </div>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_DATA}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={PURPLE} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={PURPLE} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}} dy={10} />
                <Tooltip {...tooltipStyle} />
                <Area type="monotone" dataKey="sales" stroke={PURPLE} strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Funnel Chart */}
        <div className="bg-brand-surface/40 rounded-3xl border border-white/5 p-6">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-6 flex items-center gap-2">
            <Target size={14} className="text-cyan-500" /> Funnel de Conversión
          </h4>
          <div className="space-y-4">
            {FUNNEL_DATA.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-brand-secondary uppercase">{item.step}</span>
                  <span className="text-white">{item.value}</span>
                </div>
                <div className="h-4 w-full bg-white/5 rounded-md overflow-hidden flex">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(item.value / FUNNEL_DATA[0].value) * 100}%` }}
                    className="h-full"
                    style={{ backgroundColor: item.fill }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 4. AI ANALYST CHATBOX */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 bg-brand-surface/40 rounded-3xl border border-white/5 p-6 space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-white uppercase tracking-widest">
            <Sparkles size={14} className="text-purple-400" /> Consultas de IA
          </div>
          <button onClick={() => handleSend('ventas')} className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/50 transition-all text-xs text-brand-secondary hover:text-white flex items-center justify-between group">
            Resumen de ventas <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={() => handleSend('reporte')} className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/50 transition-all text-xs text-brand-secondary hover:text-white flex items-center justify-between group">
            Reporte de gestión <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={() => handleSend('recomendacion')} className="w-full text-left p-3 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/50 transition-all text-xs text-brand-secondary hover:text-white flex items-center justify-between group">
            Recomendaciones <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="lg:col-span-3 bg-brand-surface/60 rounded-[32px] border border-white/10 p-6 flex flex-col h-[400px]">
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Bot size={24} />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white">Consultio AI Analyst</h5>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Conectado al CRM
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 px-2 custom-scrollbar">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white rounded-tr-none' 
                      : 'bg-white/5 text-brand-secondary rounded-tl-none border border-white/10'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-brand-secondary rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-brand-secondary rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-brand-secondary rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="bg-white/5 rounded-2xl px-4 py-3 flex items-center gap-3">
              <input 
                disabled
                className="bg-transparent border-none outline-none text-white text-xs flex-1" 
                placeholder="Preguntá sobre tus ventas..." 
              />
              <button className="text-brand-secondary"><Send size={18} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="flex justify-center gap-8 text-[9px] text-brand-secondary font-bold uppercase tracking-widest border-t border-white/5 pt-8">
        <div className="flex items-center gap-2"><PieIcon size={12} className="text-purple-500" /> Marketplace: Latam Central</div>
        <div className="flex items-center gap-2"><ArrowUpRight size={12} className="text-emerald-500" /> Predicción: Crecimiento +5%</div>
        <div className="flex items-center gap-2"><BarChart3 size={12} className="text-cyan-500" /> Data Source: Real-time API</div>
      </div>

    </div>
  );
};

export default BusinessIntelligenceDemo;
