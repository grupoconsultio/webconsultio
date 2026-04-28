import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map as MapIcon, HardHat, TrendingUp, 
  DollarSign, Eye, ImageIcon, Layers,
  CheckCircle2, Info, ArrowUpRight, 
  Clock, MapPin, Construction
} from 'lucide-react';

/* ── Constants & Styles ──────────────────────────────── */
const CYAN = 'var(--color-brand-cyan)';
const EMERALD = '#10b981';
const ROSE = '#ef4444';
const AMBER = '#f59e0b';

const PROJECTS = [
  { id: 1, title: 'Nuevo Centro de Salud Municipal', cat: 'Salud', status: 'En Ejecución', progress: 65, investment: 45000000, district: 'Norte', jobs: 45, date: 'Dic 2024' },
  { id: 2, title: 'Pavimentación Av. Circunvalación', cat: 'Vial', status: 'Finalizada', progress: 100, investment: 120000000, district: 'Este', jobs: 120, date: 'Abr 2024' },
  { id: 3, title: 'Remodelación Plaza Olmos', cat: 'Espacios Verdes', status: 'En Ejecución', progress: 30, investment: 15500000, district: 'Centro', jobs: 25, date: 'Oct 2024' },
  { id: 4, title: 'Escuela Proa - Barrio Alberdi', cat: 'Educación', status: 'Licitada', progress: 5, investment: 85000000, district: 'Sur', jobs: 80, date: 'Mar 2025' },
];

/* ── Components ──────────────────────────────────────── */

const WorkCard = ({ work }) => {
  const statusColor = work.status === 'Finalizada' ? EMERALD : work.status === 'En Ejecución' ? CYAN : AMBER;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-elevated rounded-3xl p-6 border border-white/5 bg-brand-surface/40 hover:border-white/10 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-brand-secondary group-hover:text-white transition-colors">
            {work.cat === 'Vial' ? <Construction size={20} /> : <HardHat size={20} />}
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-brand-secondary">{work.cat}</span>
            <h4 className="text-sm font-bold text-white leading-tight">{work.title}</h4>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border" 
                style={{ backgroundColor: `${statusColor}20`, color: statusColor, borderColor: `${statusColor}30` }}>
            {work.status}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <p className="text-[9px] font-bold uppercase text-brand-secondary mb-1">Inversión</p>
            <p className="text-sm font-bold text-white">${(work.investment / 1000000).toFixed(1)}M</p>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5">
            <p className="text-[9px] font-bold uppercase text-brand-secondary mb-1">Empleos</p>
            <p className="text-sm font-bold text-white">{work.jobs} puestos</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-[10px] font-bold uppercase">
            <span className="text-brand-secondary">Avance Físico</span>
            <span className="text-white">{work.progress}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${work.progress}%` }}
              className="h-full rounded-full"
              style={{ backgroundColor: statusColor }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
        <div className="flex items-center gap-2 text-[10px] text-brand-secondary font-bold uppercase">
          <MapPin size={12} className="text-[var(--color-brand-cyan)]" /> {work.district}
        </div>
        <button className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-brand-cyan)] flex items-center gap-1 hover:gap-2 transition-all">
          VER DETALLES <ArrowUpRight size={14} />
        </button>
      </div>
    </motion.div>
  );
};

const MapaObrasDemo = () => {
  const [activeTab, setActiveTab] = useState('list'); // list, map, comparison

  return (
    <div className="space-y-8 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
      
      {/* 1. Impact Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-brand-surface/40 p-5 rounded-3xl border border-white/5">
          <DollarSign size={20} className="text-emerald-500 mb-3" />
          <p className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Inversión Total</p>
          <p className="text-2xl font-display font-bold text-white">$245.5M</p>
        </div>
        <div className="bg-brand-surface/40 p-5 rounded-3xl border border-white/5">
          <Construction size={20} className="text-cyan-500 mb-3" />
          <p className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Obras Activas</p>
          <p className="text-2xl font-display font-bold text-white">12</p>
        </div>
        <div className="bg-brand-surface/40 p-5 rounded-3xl border border-white/5">
          <CheckCircle2 size={20} className="text-emerald-500 mb-3" />
          <p className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Finalizadas</p>
          <p className="text-2xl font-display font-bold text-white">34</p>
        </div>
        <div className="bg-brand-surface/40 p-5 rounded-3xl border border-white/5">
          <TrendingUp size={20} className="text-purple-500 mb-3" />
          <p className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Trabajo Local</p>
          <p className="text-2xl font-display font-bold text-white">+850</p>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex justify-center">
        <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 flex gap-1">
          {[
            { id: 'list', label: 'Listado de Obras', icon: Layers },
            { id: 'map', label: 'Mapa Interactivo', icon: MapIcon },
            { id: 'comparison', label: 'Antes vs Después', icon: ImageIcon },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === tab.id 
                  ? 'bg-white text-black shadow-lg' 
                  : 'text-brand-secondary hover:text-white'
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'list' && (
          <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROJECTS.map(w => <WorkCard key={w.id} work={w} />)}
          </motion.div>
        )}

        {activeTab === 'map' && (
          <motion.div key="map" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-video bg-brand-surface/40 rounded-[40px] border border-white/5 relative overflow-hidden flex items-center justify-center p-8">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.google.com/maps/vt/pb=!1m4!1m3!1i14!2i4434!3i6153!2m3!1e0!2sm!3i401183110!3m17!2sen!3sUS!5e18!12m4!1e68!2m2!1sset!2sRoadmap!12m3!1e37!2m1!1ssmartmaps!12m3!1e12!2b1!4b1!4m59!1m3!1d3444!2d-64.3!3d-33.1!2m1!1e1!4m50!1m4!1m3!1i14!2i4434!3i6153!2m3!1e0!2sm!3i401183110!3m17!2sen!3sUS!5e18!12m4!1e68!2m2!1sset!2sRoadmap!12m3!1e37!2m1!1ssmartmaps!12m3!1e12!2b1!4b1!4m59!1m3!1d3444!2d-64.3!3d-33.1!2m1!1e1!4m50!1m4!1m3!1i14!2i4434!3i6153!2m3!1e0!2sm!3i401183110!3m17!2sen!3sUS!5e18!12m4!1e68!2m2!1sset!2sRoadmap!12m3!1e37!2m1!1ssmartmaps!12m3!1e12!2b1!4b1!4m59!1m3!1d3444!2d-64.3!3d-33.1!2m1!1e1!4m50')] bg-center bg-cover grayscale invert" />
            <div className="text-center space-y-4 z-10">
              <div className="w-16 h-16 rounded-full bg-[var(--color-brand-cyan)]/10 flex items-center justify-center mx-auto text-[var(--color-brand-cyan)] animate-pulse">
                <MapPin size={32} />
              </div>
              <p className="text-sm text-brand-secondary max-w-xs mx-auto">Mapa interactivo con georreferenciación de obras en tiempo real (Simulado para demostración).</p>
            </div>
            {/* Markers */}
            <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-cyan-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(0,229,255,0.5)]" />
            <div className="absolute bottom-1/3 left-1/2 w-4 h-4 bg-amber-500 rounded-full border-2 border-white shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
          </motion.div>
        )}

        {activeTab === 'comparison' && (
          <motion.div key="comparison" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-secondary flex items-center gap-2"><Clock size={14} /> Situación Anterior (2022)</p>
                <div className="aspect-video bg-white/5 rounded-3xl border border-white/5 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-6 text-white font-bold">Terreno baldío / Desuso</div>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-brand-cyan)] flex items-center gap-2"><ArrowUpRight size={14} /> Situación Actual (2024)</p>
                <div className="aspect-video bg-[var(--color-brand-cyan)]/10 rounded-3xl border border-[var(--color-brand-cyan)]/20 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-6 text-white font-bold">Nuevo Polideportivo Municipal</div>
                  <div className="absolute top-4 right-6 bg-emerald-500 text-black px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">¡FINALIZADA!</div>
                </div>
              </div>
            </div>
            <div className="bg-brand-surface/40 p-6 rounded-3xl border border-white/5 flex items-center gap-4">
              <Info size={24} className="text-brand-secondary" />
              <p className="text-xs text-brand-secondary leading-relaxed">Este módulo permite al ciudadano visualizar el impacto real de las obras en su entorno directo mediante comparativas visuales y datos de inversión auditables.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center gap-12 text-[10px] text-brand-secondary font-bold uppercase tracking-widest border-t border-white/5 pt-8">
        <div className="flex items-center gap-2"><Eye size={12} /> Datos Abiertos</div>
        <div className="flex items-center gap-2"><Construction size={12} /> Actualización Semanal</div>
        <div className="flex items-center gap-2"><TrendingUp size={12} /> Impacto Social Medido</div>
      </div>
    </div>
  );
};

export default MapaObrasDemo;
