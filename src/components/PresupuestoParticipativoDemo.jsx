import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Vote, Wallet, MapPin, Users, 
  CheckCircle2, Plus, Info, TrendingUp,
  Filter, Award, Clock, ArrowRight, X, Fingerprint
} from 'lucide-react';

/* ── Constants & Styles ──────────────────────────────── */
const TOTAL_BUDGET = 150000000; 

const PROJECTS = [
  { id: 1, title: 'Plaza Solar Inteligente', category: 'Espacios Verdes', cost: 12000000, district: 'Norte', votes: 1450, target: 2000, img: '🌳', desc: 'Instalación de luminarias LED solares y estaciones de carga USB en la Plaza Central.' },
  { id: 2, title: 'Corredor Deportivo Seguro', category: 'Deportes', cost: 25000000, district: 'Sur', votes: 2100, target: 3000, img: '🏃', desc: 'Nueva pista de atletismo con piso antigolpes y cámaras de seguridad.' },
  { id: 3, title: 'Puntos de Reciclaje Pro', category: 'Ambiente', cost: 8500000, district: 'Centro', votes: 980, target: 1500, img: '♻️', desc: 'Instalación de 10 puntos de separación de residuos con compactadoras automáticas.' },
  { id: 4, title: 'Centro Cultural Joven', category: 'Cultura', cost: 45000000, district: 'Norte', votes: 3400, target: 5000, img: '🎨', desc: 'Refuncionalización del viejo galpón municipal para talleres de arte digital.' },
  { id: 5, title: 'Red de Bicisendas Fase 1', category: 'Movilidad', cost: 38000000, district: 'Oeste', votes: 1200, target: 2500, img: '🚲', desc: 'Conexión ciclista segura entre el campus universitario y el centro comercial.' },
  { id: 6, title: 'Iluminación LED Total', category: 'Servicios', cost: 55000000, district: 'Este', votes: 4100, target: 4000, img: '💡', desc: 'Recambio de 400 luminarias de sodio por tecnología LED de alta eficiencia.' },
];

/* ── Components ──────────────────────────────────────── */

const ProjectCard = ({ project, onSelect, isSelected, canAfford, maxReached }) => {
  const progress = (project.votes / project.target) * 100;

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`glass-elevated rounded-3xl p-6 border transition-all duration-300 relative overflow-hidden flex flex-col gap-4 ${
        isSelected 
          ? 'border-[var(--color-brand-cyan)] bg-[var(--color-brand-cyan)]/5 shadow-[0_0_20px_rgba(0,229,255,0.1)]' 
          : 'border-white/5 bg-brand-surface/40 hover:border-white/20'
      }`}
    >
      {isSelected && (
        <div className="absolute top-0 right-0 p-3 text-[var(--color-brand-cyan)]">
          <CheckCircle2 size={24} />
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl">
          {project.img}
        </div>
        <div className="flex-1">
          <span className="text-[9px] font-bold uppercase tracking-widest text-brand-secondary">{project.category}</span>
          <h4 className="text-lg font-display font-bold text-white leading-tight">{project.title}</h4>
        </div>
      </div>

      <p className="text-xs text-brand-secondary line-clamp-2 leading-relaxed">
        {project.desc}
      </p>

      <div className="space-y-2 mt-auto">
        <div className="flex justify-between text-[10px] font-bold uppercase">
          <span className="text-brand-secondary">Apoyo Ciudadano</span>
          <span className={progress >= 100 ? 'text-emerald-500' : 'text-white'}>
            {project.votes} / {project.target}
          </span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            className={`h-full rounded-full ${progress >= 100 ? 'bg-emerald-500' : 'bg-[var(--color-brand-cyan)]'}`}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="text-xs">
          <p className="text-brand-secondary text-[10px] uppercase font-bold">Inversión</p>
          <p className="font-bold text-white">${project.cost.toLocaleString()}</p>
        </div>
        <button 
          onClick={() => onSelect(project)}
          disabled={!isSelected && (maxReached || !canAfford)}
          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
            isSelected 
              ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' 
              : 'bg-[var(--color-brand-cyan)] text-black hover:bg-cyan-300 disabled:opacity-30'
          }`}
        >
          {isSelected ? 'Quitar' : 'Votar Proyecto'}
        </button>
      </div>
    </motion.div>
  );
};

const PresupuestoParticipativoDemo = () => {
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeDistrict, setActiveDistrict] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [dni, setDni] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const selectedProjects = PROJECTS.filter(p => selectedIds.includes(p.id));
  const allocated = selectedProjects.reduce((acc, curr) => acc + curr.cost, 0);
  const remaining = TOTAL_BUDGET - allocated;
  const filteredProjects = activeDistrict === 'Todos' ? PROJECTS : PROJECTS.filter(p => p.district === activeDistrict);

  const toggleProject = (project) => {
    if (selectedIds.includes(project.id)) {
      setSelectedIds(selectedIds.filter(id => id !== project.id));
    } else {
      if (selectedIds.length < 3 && project.cost <= remaining) {
        setSelectedIds([...selectedIds, project.id]);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedIds.length > 0 && dni.length > 6) {
      setIsSuccess(true);
    }
  };

  return (
    <div className="space-y-8 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar relative">
      
      {/* 1. Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-brand-surface/40 rounded-3xl border border-white/5 p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-cyan)]/5 rounded-full blur-3xl -mr-16 -mt-16" />
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary flex items-center gap-2">
                <Wallet size={14} className="text-[var(--color-brand-cyan)]" /> Presupuesto Disponible
              </p>
              <h3 className="text-4xl font-display font-bold text-white mt-2">${remaining.toLocaleString()}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">Votos Usados</p>
              <p className="text-xl font-display font-bold text-[var(--color-brand-cyan)]">{selectedIds.length} / 3</p>
            </div>
          </div>
          <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(allocated / TOTAL_BUDGET) * 100}%` }}
              className="h-full bg-gradient-to-r from-[var(--color-brand-cyan)] to-emerald-500"
            />
          </div>
        </div>

        <div className="bg-[var(--color-brand-cyan)]/5 border border-[var(--color-brand-cyan)]/20 rounded-3xl p-8 flex flex-col justify-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[var(--color-brand-cyan)]/20 flex items-center justify-center mx-auto text-[var(--color-brand-cyan)]">
            <Vote size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">Votos Registrados</p>
            <p className="text-3xl font-display font-bold text-white mt-1">12.450</p>
          </div>
        </div>
      </div>

      {/* 2. Filters */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-3 overflow-x-auto pb-2 w-full md:w-auto">
          <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest flex items-center gap-2 whitespace-nowrap">
            <Filter size={14} /> Puntos:
          </span>
          {['Todos', 'Centro', 'Norte', 'Sur', 'Este', 'Oeste'].map(d => (
            <button 
              key={d} 
              onClick={() => setActiveDistrict(d)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                activeDistrict === d 
                  ? 'bg-white text-black' 
                  : 'bg-white/5 text-brand-secondary hover:bg-white/10'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-2xl border border-emerald-500/20 flex items-center gap-2 text-xs font-bold">
          <Clock size={14} /> Quedan 12 días para votar
        </div>
      </div>

      {/* 3. Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(p => (
          <ProjectCard 
            key={p.id} 
            project={p} 
            isSelected={selectedIds.includes(p.id)}
            canAfford={p.cost <= remaining}
            maxReached={selectedIds.length >= 3}
            onSelect={toggleProject}
          />
        ))}
      </div>

      {/* 4. Action Bar */}
      <div className="bg-brand-surface/40 rounded-3xl border border-white/5 p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-2">
          <h4 className="text-xl font-display font-bold text-white">¿Listo para confirmar?</h4>
          <p className="text-sm text-brand-secondary">
            Podés elegir hasta un máximo de <strong className="text-white">3 proyectos</strong>. Actualmente tenés <strong className="text-[var(--color-brand-cyan)]">{selectedIds.length} seleccionados</strong>.
          </p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          disabled={selectedIds.length === 0}
          className="bg-white text-black font-bold px-8 py-4 rounded-2xl hover:bg-cyan-100 transition-all flex items-center gap-2 group disabled:opacity-30"
        >
          CONFIRMAR VOTOS <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !isSuccess && setShowModal(false)}
              className="absolute inset-0 bg-brand-bg/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-brand-surface border border-white/10 rounded-[32px] p-8 max-w-md w-full shadow-2xl relative z-10"
            >
              {!isSuccess ? (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-white">Confirmar Votación</h3>
                      <p className="text-xs text-brand-secondary mt-1">Por favor, validá tu identidad para registrar los votos.</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="text-brand-secondary hover:text-white transition-colors"><X /></button>
                  </div>

                  <div className="space-y-4 mb-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-brand-secondary">Documento (DNI)</label>
                      <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-[var(--color-brand-cyan)] transition-all">
                        <Fingerprint size={18} className="text-brand-secondary" />
                        <input 
                          type="text" 
                          value={dni} 
                          onChange={e => setDni(e.target.value)} 
                          className="bg-transparent border-none outline-none text-white w-full text-sm font-bold" 
                          placeholder="Sin puntos ni espacios" 
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase text-brand-secondary">Proyectos Elegidos ({selectedProjects.length})</p>
                      <div className="space-y-2">
                        {selectedProjects.map(p => (
                          <div key={p.id} className="bg-white/5 p-3 rounded-xl flex items-center gap-3 border border-white/5">
                            <span className="text-lg">{p.img}</span>
                            <span className="text-xs font-bold text-white">{p.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={handleConfirm}
                    disabled={dni.length < 7}
                    className="w-full bg-[var(--color-brand-cyan)] text-black font-bold py-4 rounded-2xl hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 disabled:opacity-30"
                  >
                    FINALIZAR Y VOTAR
                  </button>
                </>
              ) : (
                <div className="text-center py-6 space-y-6">
                  <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={48} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-white">¡Voto Registrado!</h3>
                    <p className="text-brand-secondary text-sm mt-2 leading-relaxed">
                      Muchas gracias por participar, <strong className="text-white">{dni}</strong>. Tu aporte es fundamental para transformar la ciudad.
                    </p>
                  </div>
                  <button 
                    onClick={() => { setShowModal(false); setIsSuccess(false); setSelectedIds([]); setDni(''); }}
                    className="w-full bg-white/5 border border-white/10 text-white font-bold py-4 rounded-2xl hover:bg-white/10 transition-all"
                  >
                    CERRAR VENTANA
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer Stats */}
      <div className="flex justify-center gap-8 text-[10px] text-brand-secondary font-bold uppercase tracking-widest border-t border-white/5 pt-8">
        <div className="flex items-center gap-2"><MapPin size={12} className="text-[var(--color-brand-cyan)]" /> Todas las zonas activas</div>
        <div className="flex items-center gap-2"><Award size={12} className="text-[var(--color-brand-cyan)]" /> 24 Proyectos Finalizados</div>
        <div className="flex items-center gap-2"><Users size={12} className="text-[var(--color-brand-cyan)]" /> 45.000 Vecinos Registrados</div>
      </div>
    </div>
  );
};

export default PresupuestoParticipativoDemo;
