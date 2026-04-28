import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Clock, CheckCircle2, AlertCircle, 
  Search, Plus, ChevronRight,
  SearchIcon, LayoutDashboard, ThumbsUp,
  ArrowLeft, Save, History, TrendingUp, PieChart as PieIcon,
  MapPin, Calendar, User, Phone, Mail, ClipboardList,
  Zap
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

/* ── Constants & Styles ──────────────────────────────── */
const CYAN = 'var(--color-brand-cyan)';
const AMBER = '#f59e0b';
const EMERALD = '#10b981';
const ROSE = '#ef4444';
const PURPLE = '#8b5cf6';

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'var(--color-brand-surface)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
    fontSize: '12px',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  },
  itemStyle: { color: CYAN },
  labelStyle: { color: 'rgba(255,255,255,0.5)', marginBottom: '4px' },
};

/* ── Mock Data ───────────────────────────────────────── */
const CATEGORIES = [
  {id:'salud', nombre:'Salud', icon:'🏥', area:'Secretaría de Salud', sla:72, color: ROSE, subs:[
    {id:'s1',nombre:'Higiene urbana / fumigación',sla:72},
    {id:'s2',nombre:'Zoonosis (animales sueltos)',sla:24},
    {id:'s3',nombre:'Control de plagas',sla:72}
  ]},
  {id:'servicios', nombre:'Servicios Públicos', icon:'💡', area:'Secretaría de Infraestructura', sla:120, color: CYAN, subs:[
    {id:'sv1',nombre:'Alumbrado público',sla:48},
    {id:'sv2',nombre:'Recolección de residuos',sla:120},
    {id:'sv3',nombre:'Agua y cloacas',sla:48}
  ]},
  {id:'obras', nombre:'Obras Públicas', icon:'🏗️', area:'Dirección de Obras Públicas', sla:240, color: PURPLE, subs:[
    {id:'o1',nombre:'Baches y pavimento',sla:240},
    {id:'o2',nombre:'Semáforos y señalización',sla:120},
    {id:'o3',nombre:'Espacios verdes',sla:240}
  ]},
  {id:'tributos', nombre:'Rentas', icon:'💰', area:'Dirección de Rentas', sla:120, color: AMBER, subs:[
    {id:'t1',nombre:'Consulta de deuda',sla:120},
    {id:'t2',nombre:'Plan de pagos',sla:120}
  ]}
];

// Generator for 157 claims
const generateInitialClaims = () => {
  const users = ['Juan Pérez', 'María García', 'Carlos Ruiz', 'Laura Beltrán', 'Roberto Gómez', 'Ana Martínez', 'Jorge Sosa', 'Lucía Fernández', 'Esteban Quito', 'Sofía Rey', 'Pedro Picapiedra', 'Mónica Galindo', 'Daniela Spalla', 'Ignacio López', 'Carla Peterson'];
  const statusOptions = ['Pendiente', 'En Proceso', 'Resuelto', 'Urgente'];
  const data = [];
  
  for (let i = 1; i <= 157; i++) {
    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const sub = cat.subs[Math.floor(Math.random() * cat.subs.length)];
    const status = statusOptions[Math.floor(Math.random() * 4)];
    const id = `REC-2024-${String(82000 + i).padStart(5, '0')}`;
    
    data.push({
      id,
      user: users[Math.floor(Math.random() * users.length)],
      address: `Calle ${Math.floor(Math.random() * 2000)}, Barrio ${['Centro', 'Alberdi', 'Banda Norte', 'Las Flores'][Math.floor(Math.random() * 4)]}`,
      cat: sub.nombre,
      catId: cat.id,
      status,
      priority: status === 'Urgente' ? 'Alta' : ['Baja', 'Media', 'Alta'][Math.floor(Math.random() * 3)],
      time: i < 20 ? `hace ${i} horas` : `${Math.floor(i/24)} días`,
      desc: 'Descripción automática del reclamo simulado para completar el tablero de control.',
      history: [
        {status: 'Pendiente', text: 'Reclamo registrado', date: '28/04/2024 09:00'},
        ...(status !== 'Pendiente' ? [{status: 'En Proceso', text: 'Móvil asignado', date: '28/04/2024 10:30'}] : []),
        ...(status === 'Resuelto' ? [{status: 'Resuelto', text: 'Tarea completada', date: '28/04/2024 11:15'}] : []),
      ]
    });
  }
  return data.reverse(); 
};

const INITIAL_CLAIMS = generateInitialClaims();

const WEEKLY_DATA = [
  { day: 'Lun', total: 145, resueltos: 120 }, 
  { day: 'Mar', total: 158, resueltos: 130 }, 
  { day: 'Mie', total: 152, resueltos: 145 },
  { day: 'Jue', total: 175, resueltos: 150 }, 
  { day: 'Vie', total: 168, resueltos: 160 }, 
  { day: 'Sab', total: 82, resueltos: 75 }, 
  { day: 'Dom', total: 45, resueltos: 40 },
];

/* ── Components ──────────────────────────────────────── */

const StatusTag = ({ status }) => {
  const styles = {
    'Pendiente': { bg: `${AMBER}20`, text: AMBER },
    'En Proceso': { bg: `${CYAN}20`, text: CYAN },
    'Resuelto': { bg: `${EMERALD}20`, text: EMERALD },
    'Urgente': { bg: `${ROSE}20`, text: ROSE },
  };
  const s = styles[status] || { bg: 'rgba(255,255,255,0.1)', text: 'white' };
  return (
    <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border" 
          style={{ backgroundColor: s.bg, color: s.text, borderColor: `${s.text}30` }}>
      {status}
    </span>
  );
};

const KPI = ({ label, value, icon: Icon, color = CYAN }) => (
  <div className="bg-brand-surface/40 p-4 rounded-2xl border border-white/5 flex flex-col gap-1.5 relative overflow-hidden group">
    <div className="absolute -right-2 -top-2 opacity-5 group-hover:opacity-10 transition-opacity">
      <Icon size={48} style={{ color }} />
    </div>
    <div className="flex justify-between items-start">
      <span className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">{label}</span>
      <Icon size={14} style={{ color }} />
    </div>
    <span className="text-2xl font-display font-bold text-white">{value}</span>
  </div>
);

/* ── SUB-VIEWS ───────────────────────────────────────── */

const NewClaimView = ({ wizardStep, setWizardStep, newClaim, setNewClaim, handleCreateClaim, setActiveTab, handleSearch }) => (
  <div className="max-w-2xl mx-auto py-4">
    <div className="flex justify-between mb-8 relative">
      <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0" />
      {[1, 2, 3, 4].map(s => (
        <div key={s} className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${wizardStep >= s ? 'bg-[var(--color-brand-cyan)] text-black' : 'bg-brand-surface border border-white/10 text-brand-secondary'}`}>
          {s}
        </div>
      ))}
    </div>

    <AnimatePresence mode="wait">
      {wizardStep === 1 && (
        <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
          <h3 className="text-xl font-display font-bold">👤 Tus datos de contacto</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-brand-secondary">Nombre Completo</label>
              <input type="text" value={newClaim.name} onChange={e => setNewClaim({...newClaim, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-brand-cyan)] outline-none" placeholder="Ej: Juan Pérez" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-brand-secondary">Dirección del Reclamo</label>
              <input type="text" value={newClaim.address} onChange={e => setNewClaim({...newClaim, address: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-brand-cyan)] outline-none" placeholder="Calle y número" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-brand-secondary">Celular</label>
              <input type="tel" value={newClaim.phone} onChange={e => setNewClaim({...newClaim, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-brand-cyan)] outline-none" placeholder="0358-123456" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-brand-secondary">Email</label>
              <input type="email" value={newClaim.email} onChange={e => setNewClaim({...newClaim, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-brand-cyan)] outline-none" placeholder="ejemplo@mail.com" />
            </div>
          </div>
          <button onClick={() => setWizardStep(2)} className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-cyan-100 transition-colors">Siguiente paso →</button>
        </motion.div>
      )}

      {wizardStep === 2 && (
        <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
          <h3 className="text-xl font-display font-bold">📋 ¿Qué tipo de reclamo es?</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setNewClaim({...newClaim, catId: c.id, subId: ''})} className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${newClaim.catId === c.id ? 'bg-[var(--color-brand-cyan)]/10 border-[var(--color-brand-cyan)]' : 'bg-white/5 border-white/10 hover:border-white/20'}`}>
                <span className="text-2xl">{c.icon}</span>
                <span className="text-[10px] font-bold uppercase">{c.nombre}</span>
              </button>
            ))}
          </div>
          {newClaim.catId && (
            <div className="space-y-3 pt-4 border-t border-white/5">
              <p className="text-[10px] uppercase font-bold text-brand-secondary">Subcategoría</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.find(c => c.id === newClaim.catId).subs.map(s => (
                  <button key={s.id} onClick={() => setNewClaim({...newClaim, subId: s.id})} className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${newClaim.subId === s.id ? 'bg-[var(--color-brand-cyan)] text-black border-[var(--color-brand-cyan)]' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                    {s.nombre}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-4">
            <button onClick={() => setWizardStep(1)} className="flex-1 bg-white/5 py-3 rounded-xl hover:bg-white/10 transition-colors">← Volver</button>
            <button onClick={() => setWizardStep(3)} disabled={!newClaim.subId} className="flex-[2] bg-white text-black font-bold py-3 rounded-xl hover:bg-cyan-100 transition-colors disabled:opacity-30">Continuar →</button>
          </div>
        </motion.div>
      )}

      {wizardStep === 3 && (
        <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
          <h3 className="text-xl font-display font-bold">📝 Detalle del problema</h3>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-brand-secondary">Descripción detallada</label>
            <textarea value={newClaim.desc} onChange={e => setNewClaim({...newClaim, desc: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-brand-cyan)] outline-none min-h-[120px] resize-none" placeholder="Describa el lugar, lo que sucede y cualquier detalle relevante..." />
          </div>
          <div className="bg-[var(--color-brand-cyan)]/5 border border-[var(--color-brand-cyan)]/20 p-4 rounded-xl flex items-center gap-3">
            <Clock size={16} className="text-[var(--color-brand-cyan)]" />
            <p className="text-xs text-brand-secondary">Plazo estimado de respuesta: <span className="text-white font-bold">
              {CATEGORIES.find(c => c.id === newClaim.catId)?.subs.find(s => s.id === newClaim.subId)?.sla || 0} hs hábiles
            </span></p>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setWizardStep(2)} className="flex-1 bg-white/5 py-3 rounded-xl hover:bg-white/10 transition-colors">← Volver</button>
            <button onClick={handleCreateClaim} className="flex-[2] bg-[var(--color-brand-cyan)] text-black font-bold py-3 rounded-xl hover:bg-cyan-300 transition-colors">Enviar Reclamo →</button>
          </div>
        </motion.div>
      )}

      {wizardStep === 4 && (
        <motion.div key="s4" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 py-8">
          <div className="w-20 h-20 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={48} />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-display font-bold text-white">¡Reclamo Registrado!</h3>
            <p className="text-brand-secondary">Tu número de expediente es:</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-6 rounded-2xl inline-block font-mono text-3xl font-bold tracking-widest text-[var(--color-brand-cyan)]">
            {newClaim.id}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button onClick={() => { handleSearch(newClaim.id); setActiveTab('track'); }} className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-cyan-100 transition-colors">Hacer seguimiento →</button>
            <button onClick={() => { setWizardStep(1); setNewClaim({name:'', address:'', phone:'', email:'', catId:'', subId:'', desc:'', id:''}); }} className="flex-1 bg-white/5 py-3 rounded-xl hover:bg-white/10 transition-colors">Registrar otro</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const TrackClaimView = ({ searchId, setSearchId, handleSearch, trackedClaim }) => (
  <div className="max-w-2xl mx-auto py-4 space-y-6">
    <div className="bg-brand-surface/60 border border-white/5 p-6 rounded-3xl shadow-xl space-y-6">
      <h3 className="text-xl font-display font-bold">🔍 Seguimiento de Reclamo</h3>
      <div className="flex gap-2">
        <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex items-center gap-3 focus-within:border-[var(--color-brand-cyan)] transition-all">
          <SearchIcon size={18} className="text-brand-secondary" />
          <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()} className="bg-transparent border-none outline-none text-white w-full text-sm font-mono tracking-widest" placeholder="REC-2024-XXXXX" />
        </div>
        <button onClick={() => handleSearch()} className="bg-white text-black font-bold px-6 rounded-xl hover:bg-cyan-100 transition-colors">Buscar</button>
      </div>
    </div>

    <AnimatePresence mode="wait">
      {trackedClaim && (
        <motion.div key={trackedClaim.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
          <div className="bg-brand-surface/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] uppercase font-bold text-brand-secondary tracking-widest mb-1">Expediente</p>
                <h4 className="text-2xl font-display font-bold text-[var(--color-brand-cyan)]">{trackedClaim.id}</h4>
              </div>
              <StatusTag status={trackedClaim.status} />
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><p className="text-brand-secondary mb-1">Vecino</p><p className="font-bold">{trackedClaim.user || trackedClaim.name}</p></div>
              <div><p className="text-brand-secondary mb-1">Ubicación</p><p className="font-bold">{trackedClaim.address}</p></div>
              <div><p className="text-brand-secondary mb-1">Categoría</p><p className="font-bold">{trackedClaim.cat}</p></div>
              <div><p className="text-brand-secondary mb-1">Estado</p><p className="font-bold">{trackedClaim.status}</p></div>
            </div>
          </div>

          <div className="bg-brand-surface/40 p-6 rounded-3xl border border-white/5">
            <h5 className="text-xs font-bold uppercase tracking-widest text-brand-secondary mb-6 flex items-center gap-2">
              <Clock size={14} /> Línea de Tiempo
            </h5>
            <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
              {trackedClaim.history.map((h, i) => (
                <div key={i} className="relative pl-8">
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-brand-bg z-10 ${i === 0 ? 'bg-[var(--color-brand-cyan)] shadow-[0_0_10px_rgba(0,229,255,0.4)]' : 'bg-brand-secondary'}`} />
                  <p className="text-[10px] text-brand-secondary mb-1">{h.date}</p>
                  <p className="text-sm font-bold text-white">{h.status}</p>
                  <p className="text-xs text-brand-secondary mt-1">{h.text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const AdminDashboard = ({ claims, onSelectClaim }) => {
  const pieData = CATEGORIES.map(c => ({
    name: c.nombre,
    value: claims.filter(r => r.catId === c.id).length || 0,
    color: c.color
  }));

  const recentClaims = claims.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 max-h-[750px] overflow-y-auto pr-2">
      {/* Metrics Row - Fixed Math to include all 157 */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KPI label="Total Reclamos" value={claims.length} icon={MessageSquare} />
        <KPI label="Pendientes" value={claims.filter(c => c.status === 'Pendiente').length} icon={Clock} color={AMBER} />
        <KPI label="En Proceso" value={claims.filter(c => c.status === 'En Proceso').length} icon={LayoutDashboard} color={CYAN} />
        <KPI label="Resueltos" value={claims.filter(c => c.status === 'Resuelto').length} icon={CheckCircle2} color={EMERALD} />
        <KPI label="Urgentes" value={claims.filter(c => c.status === 'Urgente').length} icon={Zap} color={ROSE} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-brand-surface/40 p-6 rounded-3xl border border-white/5">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-6 flex items-center gap-2">
            <TrendingUp size={14} className="text-[var(--color-brand-cyan)]" /> Desempeño Semanal
          </h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={WEEKLY_DATA}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CYAN} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={CYAN} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResueltos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={EMERALD} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={EMERALD} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: 'rgba(255,255,255,0.3)', fontSize: 10}} />
                <Tooltip {...tooltipStyle} />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{fontSize: '10px', textTransform: 'uppercase', fontWeight: 'bold'}} />
                <Area name="Ingresados" type="monotone" dataKey="total" stroke={CYAN} fillOpacity={1} fill="url(#colorTotal)" strokeWidth={3} />
                <Area name="Resueltos" type="monotone" dataKey="resueltos" stroke={EMERALD} fillOpacity={1} fill="url(#colorResueltos)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-brand-surface/40 p-6 rounded-3xl border border-white/5">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-6 flex items-center gap-2">
            <PieIcon size={14} className="text-[var(--color-brand-cyan)]" /> Distribución
          </h4>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{fontSize: '9px', paddingTop: '20px'}} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-brand-surface/40 p-6 rounded-3xl border border-white/5">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-6 flex items-center gap-2">
          <History size={14} className="text-[var(--color-brand-cyan)]" /> Última Actividad (Recientes)
        </h4>
        <div className="space-y-3">
          {recentClaims.map((c, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[var(--color-brand-cyan)]/10 flex items-center justify-center text-[var(--color-brand-cyan)]">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white group-hover:text-[var(--color-brand-cyan)] transition-colors">{c.id} — {c.user || c.name}</p>
                  <p className="text-[10px] text-brand-secondary">{c.cat} • {c.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <StatusTag status={c.status} />
                <button onClick={() => onSelectClaim(c.id)} className="p-2 hover:bg-[var(--color-brand-cyan)] hover:text-black rounded-lg transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Row */}
      <div className="bg-brand-surface/40 rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h3 className="text-xs font-bold uppercase tracking-widest text-brand-secondary">Listado General de Gestión</h3>
          <div className="bg-white/5 rounded-lg px-3 py-1.5 flex items-center gap-2 border border-white/5">
            <Search size={14} className="text-brand-secondary" />
            <input type="text" placeholder="Buscar..." className="bg-transparent border-none outline-none text-xs text-white w-32" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] text-brand-secondary font-bold uppercase tracking-tighter border-b border-white/5">
                <th className="p-4">ID</th>
                <th className="p-4">Vecino / Dirección</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {claims.slice(0, 15).map((c, i) => (
                <tr key={i} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 text-[11px] font-mono font-bold text-brand-secondary">{c.id}</td>
                  <td className="p-4">
                    <p className="text-xs font-bold text-white">{c.user || c.name}</p>
                    <p className="text-[10px] text-brand-secondary">{c.address}</p>
                  </td>
                  <td className="p-4 text-xs">{c.cat}</td>
                  <td className="p-4"><StatusTag status={c.status} /></td>
                  <td className="p-4 text-right">
                    <button onClick={() => onSelectClaim(c.id)} className="px-3 py-1.5 bg-white/5 hover:bg-[var(--color-brand-cyan)] hover:text-black rounded-lg text-[10px] font-bold transition-all border border-white/10 hover:border-transparent uppercase">Gestionar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {claims.length > 15 && (
            <div className="p-4 text-center border-t border-white/5">
              <p className="text-[10px] text-brand-secondary uppercase font-bold tracking-widest">Mostrando primeros 15 de {claims.length} reclamos</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ManageClaimView = ({ claim, onBack, onUpdateStatus }) => {
  const [newStatus, setNewStatus] = useState(claim.status);
  const [note, setNote] = useState('');

  const handleUpdate = () => {
    onUpdateStatus(claim.id, newStatus, note);
    setNote('');
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-4xl mx-auto space-y-6 py-2">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold text-brand-secondary hover:text-white transition-colors">
          <ArrowLeft size={16} /> VOLVER AL PANEL
        </button>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-brand-secondary uppercase tracking-widest">Estado Actual:</span>
          <StatusTag status={claim.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-brand-surface/40 p-6 rounded-3xl border border-white/5 space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-1">{claim.id}</h3>
                <p className="text-xs text-brand-secondary flex items-center gap-1"><Calendar size={12} /> Ingresado: {claim.time || 'Recientemente'}</p>
              </div>
              <div className="bg-[var(--color-brand-cyan)]/10 p-3 rounded-2xl">
                <ClipboardList size={24} className="text-[var(--color-brand-cyan)]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/5">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-brand-secondary"><User size={16} /><div className="text-xs"><p className="font-bold text-white">{claim.user || claim.name}</p><p>Vecino</p></div></div>
                <div className="flex items-center gap-3 text-brand-secondary"><MapPin size={16} /><div className="text-xs"><p className="font-bold text-white">{claim.address}</p><p>Ubicación</p></div></div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-brand-secondary"><Phone size={16} /><div className="text-xs"><p className="font-bold text-white">{claim.phone || 'N/A'}</p><p>Celular</p></div></div>
                <div className="flex items-center gap-3 text-brand-secondary"><Mail size={16} /><div className="text-xs"><p className="font-bold text-white">{claim.email || 'N/A'}</p><p>Email</p></div></div>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/5">
              <p className="text-[10px] font-bold uppercase text-brand-secondary tracking-widest">Descripción del Problema</p>
              <div className="bg-white/5 p-4 rounded-xl text-sm leading-relaxed border border-white/5">
                {claim.desc}
              </div>
            </div>
          </div>

          <div className="bg-brand-surface/40 p-6 rounded-3xl border border-white/5">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary mb-6 flex items-center gap-2"><History size={14} /> Trazabilidad del Reclamo</h4>
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-white/10">
              {claim.history.map((h, i) => (
                <div key={i} className="relative pl-8">
                  <div className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-brand-bg z-10 ${i === claim.history.length-1 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-brand-secondary'}`} />
                  <p className="text-[10px] text-brand-secondary mb-1">{h.date}</p>
                  <p className="text-sm font-bold text-white">{h.status}</p>
                  <p className="text-xs text-brand-secondary mt-1">{h.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <div className="bg-brand-surface/60 p-6 rounded-3xl border border-[var(--color-brand-cyan)]/20 shadow-2xl space-y-6 sticky top-24">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary flex items-center gap-2"><Save size={14} /> Gestión de Estado</h4>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-brand-secondary">Actualizar Estado</label>
              <div className="relative">
                <select 
                  value={newStatus} 
                  onChange={e => setNewStatus(e.target.value)} 
                  className="w-full bg-[#1e293b] text-white border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-brand-cyan)] outline-none appearance-none cursor-pointer"
                >
                  <option value="Pendiente" className="bg-[#1e293b]">Pendiente</option>
                  <option value="En Proceso" className="bg-[#1e293b]">En Proceso</option>
                  <option value="Resuelto" className="bg-[#1e293b]">Resuelto</option>
                  <option value="Urgente" className="bg-[#1e293b]">Urgente</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <ChevronRight size={14} className="rotate-90 text-brand-secondary" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-brand-secondary">Nota Interna / Respuesta</label>
              <textarea value={note} onChange={e => setNote(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[var(--color-brand-cyan)] outline-none min-h-[100px] resize-none" placeholder="Escriba aquí la actualización para el vecino..." />
            </div>

            <button onClick={handleUpdate} className="w-full bg-[var(--color-brand-cyan)] text-black font-bold py-3 rounded-xl hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.2)]">
              <Save size={18} /> GUARDAR CAMBIOS
            </button>

            <div className="pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-[10px] text-brand-secondary">
                <AlertCircle size={12} /> 
                <span>Se enviará una notificación automática al vecino.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ── MAIN COMPONENT ──────────────────────────────────── */

const SistemaReclamosDemo = () => {
  const [activeTab, setActiveTab] = useState('new'); // new, track, admin, manage
  const [claims, setClaims] = useState(INITIAL_CLAIMS);
  const [wizardStep, setWizardStep] = useState(1);
  const [newClaim, setNewClaim] = useState({
    name: '', address: '', phone: '', email: '', 
    catId: '', subId: '', desc: '', id: ''
  });
  const [searchId, setSearchId] = useState('');
  const [trackedClaim, setTrackedClaim] = useState(null);
  const [managingClaim, setManagingClaim] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCreateClaim = () => {
    if (!newClaim.desc) return showToast('Por favor, describa el problema');
    const id = `REC-2024-${Math.floor(10000 + Math.random() * 90000)}`;
    const freshClaim = {
      ...newClaim,
      id,
      status: 'Pendiente',
      time: 'recién',
      user: newClaim.name,
      cat: CATEGORIES.find(c => c.id === newClaim.catId)?.subs.find(s => s.id === newClaim.subId)?.nombre || 'General',
      history: [{status: 'Pendiente', text: 'Reclamo registrado exitosamente', date: new Date().toLocaleString('es-AR')}]
    };
    setClaims([freshClaim, ...claims]);
    setNewClaim({...newClaim, id});
    setWizardStep(4);
    showToast('¡Reclamo enviado con éxito!');
  };

  const handleSearch = (idToSearch) => {
    const term = idToSearch || searchId;
    const found = claims.find(c => c.id.toUpperCase() === term.toUpperCase());
    if (found) {
      setTrackedClaim(found);
      setSearchId(found.id);
    }
    else showToast('No se encontró el expediente');
  };

  const handleAdminSelect = (id) => {
    const found = claims.find(c => c.id === id);
    if (found) {
      setManagingClaim(found);
      setActiveTab('manage');
    }
  };

  const updateClaimStatus = (id, status, text) => {
    const updated = claims.map(c => {
      if (c.id === id) {
        return {
          ...c,
          status,
          history: [...c.history, { status, text: text || 'Estado actualizado por sistema', date: new Date().toLocaleString('es-AR') }]
        };
      }
      return c;
    });
    setClaims(updated);
    setManagingClaim(updated.find(c => c.id === id));
    showToast(`Reclamo ${id} actualizado a ${status}`);
  };

  return (
    <div className="glass-elevated border border-[var(--color-brand-cyan)]/20 rounded-3xl overflow-hidden shadow-2xl relative">
      
      {/* Fake Browser Chrome */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-brand-surface/90 backdrop-blur-xl z-20 sticky top-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <nav className="hidden md:flex items-center gap-1">
            <button onClick={() => setActiveTab('new')} className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${activeTab === 'new' ? 'bg-[var(--color-brand-cyan)] text-black' : 'text-brand-secondary hover:text-white'}`}>NUEVO RECLAMO</button>
            <button onClick={() => setActiveTab('track')} className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${activeTab === 'track' ? 'bg-[var(--color-brand-cyan)] text-black' : 'text-brand-secondary hover:text-white'}`}>SEGUIMIENTO</button>
            <button onClick={() => setActiveTab('admin')} className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${activeTab === 'admin' || activeTab === 'manage' ? 'bg-[var(--color-brand-cyan)] text-black' : 'text-brand-secondary hover:text-white'}`}>PANEL ADMIN</button>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-emerald-500/20">SISTEMA ACTIVO</div>
        </div>
      </div>

      <div className="p-6 md:p-8 bg-brand-bg/40 min-h-[600px]">
        <AnimatePresence mode="wait">
          {activeTab === 'new' && (
            <motion.div key="new" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NewClaimView 
                wizardStep={wizardStep} 
                setWizardStep={setWizardStep} 
                newClaim={newClaim} 
                setNewClaim={setNewClaim} 
                handleCreateClaim={handleCreateClaim}
                setActiveTab={setActiveTab}
                handleSearch={handleSearch}
              />
            </motion.div>
          )}
          {activeTab === 'track' && (
            <motion.div key="track" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <TrackClaimView 
                searchId={searchId} 
                setSearchId={setSearchId} 
                handleSearch={handleSearch} 
                trackedClaim={trackedClaim} 
              />
            </motion.div>
          )}
          {activeTab === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminDashboard 
                claims={claims} 
                onSelectClaim={handleAdminSelect} 
              />
            </motion.div>
          )}
          {activeTab === 'manage' && managingClaim && (
            <motion.div key="manage" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ManageClaimView 
                claim={managingClaim} 
                onBack={() => setActiveTab('admin')}
                onUpdateStatus={updateClaimStatus}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Nav */}
      <div className="md:hidden flex border-t border-white/10 bg-brand-surface/90 backdrop-blur-xl">
        <button onClick={() => setActiveTab('new')} className={`flex-1 py-4 flex flex-col items-center gap-1 ${activeTab === 'new' ? 'text-[var(--color-brand-cyan)]' : 'text-brand-secondary'}`}>
          <Plus size={20} /><span className="text-[8px] font-bold">NUEVO</span>
        </button>
        <button onClick={() => setActiveTab('track')} className={`flex-1 py-4 flex flex-col items-center gap-1 ${activeTab === 'track' ? 'text-[var(--color-brand-cyan)]' : 'text-brand-secondary'}`}>
          <Search size={20} /><span className="text-[8px) font-bold">SEGUIMIENTO</span>
        </button>
        <button onClick={() => setActiveTab('admin')} className={`flex-1 py-4 flex flex-col items-center gap-1 ${activeTab === 'admin' ? 'text-[var(--color-brand-cyan)]' : 'text-brand-secondary'}`}>
          <LayoutDashboard size={20} /><span className="text-[8px] font-bold">ADMIN</span>
        </button>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-3 rounded-2xl font-bold text-sm shadow-2xl z-[100] flex items-center gap-2">
            <ThumbsUp size={16} /> {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer System Status */}
      <div className="px-6 py-2 border-t border-white/5 bg-brand-surface/30 flex justify-between items-center">
        <p className="text-[8px] text-brand-secondary font-mono">NODE_STATUS: STABLE // SESSION_ACTIVE</p>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /><span className="text-[8px] font-bold text-brand-secondary uppercase">Database Encrypted</span></div>
        </div>
      </div>
    </div>
  );
};

export default SistemaReclamosDemo;
