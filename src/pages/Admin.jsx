import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Plus, Trash2, Home, Calendar, Menu, X, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const NAV_ITEMS = [
  { key: 'newsletter',   label: 'Newsletter',  icon: Mail },
  { key: 'clients',      label: 'Clientes',    icon: Users },
  { key: 'meetings',     label: 'Reuniones',   icon: Calendar },
];

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors";

const Admin = () => {
  const [activeTab, setActiveTab]       = useState('newsletter');
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [newsletters, setNewsletters]   = useState([]);
  const [clients, setClients]           = useState([]);
  const [meetings, setMeetings]         = useState([]);

  const [newClient, setNewClient]           = useState({ name: '', industry: '' });

  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') !== '1') { navigate('/admin/login'); return; }

    setNewsletters(JSON.parse(localStorage.getItem('newsletterSubs') || '[]'));
    setClients(JSON.parse(localStorage.getItem('clients') || '[]'));
    setMeetings(JSON.parse(localStorage.getItem('meetings') || '[]'));
  }, [navigate]);

  const handleLogout    = () => { sessionStorage.removeItem('adminAuth'); navigate('/admin/login'); };
  const handleTabChange = (tab) => { setActiveTab(tab); setSidebarOpen(false); };

  /* Newsletter */
  const handleDeleteSub = (email) => {
    const u = newsletters.filter(n => n.email !== email);
    setNewsletters(u); localStorage.setItem('newsletterSubs', JSON.stringify(u));
  };

  /* Clients */
  const handleAddClient = (e) => {
    e.preventDefault();
    if (!newClient.name) return;
    const u = [...clients, { ...newClient, id: Date.now() }];
    setClients(u); localStorage.setItem('clients', JSON.stringify(u));
    setNewClient({ name: '', industry: '' });
  };
  const handleDeleteClient = (id) => {
    const u = clients.filter(c => c.id !== id);
    setClients(u); localStorage.setItem('clients', JSON.stringify(u));
  };

  /* Meetings */
  const handleDeleteMeeting = (id) => {
    const u = meetings.filter(m => m.id !== id);
    setMeetings(u); localStorage.setItem('meetings', JSON.stringify(u));
  };


  const tabLabel = NAV_ITEMS.find(n => n.key === activeTab)?.label ?? '';

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-brand-surface border-r border-white/5 flex flex-col p-6 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="mb-10 flex items-start justify-between">
          <div className="flex flex-col leading-none">
            <span className="text-sm font-display font-light tracking-[0.2em] text-brand-secondary">GRUPO</span>
            <span className="text-2xl font-display font-extrabold tracking-tight text-white">CONSULTIO</span>
          </div>
          <button className="lg:hidden p-1 text-brand-secondary hover:text-white" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>
        <nav className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => handleTabChange(key)}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${activeTab === key ? 'bg-[var(--color-brand-cyan)]/10 text-[var(--color-brand-cyan)]' : 'text-brand-secondary hover:text-white hover:bg-white/5'}`}>
              <Icon size={18} />{label}
            </button>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-1">
          <Link to="/" className="flex items-center gap-3 p-3 rounded-lg text-brand-secondary hover:text-white hover:bg-white/5 transition-colors"><Home size={18} />Volver al Sitio</Link>
          <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-lg text-brand-secondary hover:text-red-400 hover:bg-red-400/5 transition-colors"><LogOut size={18} />Cerrar Sesión</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-brand-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Menu size={22} /></button>
          <div className="flex flex-col leading-none">
            <span className="text-xs font-display font-light tracking-[0.2em] text-brand-secondary">GRUPO</span>
            <span className="text-base font-display font-extrabold tracking-tight text-white">CONSULTIO</span>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-8 lg:p-10">
          <h1 className="text-2xl md:text-3xl font-display font-bold mb-6 md:mb-8">{tabLabel}</h1>

          {/* Newsletter */}
          {activeTab === 'newsletter' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-elevated rounded-2xl p-4 md:p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[400px]">
                  <thead><tr className="border-b border-white/10 text-brand-secondary">
                    <th className="pb-4 font-medium">Email</th>
                    <th className="pb-4 font-medium hidden sm:table-cell">Fecha</th>
                    <th className="pb-4 font-medium text-right">Acciones</th>
                  </tr></thead>
                  <tbody>
                    {newsletters.length === 0
                      ? <tr><td colSpan="3" className="py-8 text-center text-brand-secondary">No hay suscriptores aún.</td></tr>
                      : newsletters.map((sub, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-4 text-white text-sm break-all">{sub.email}</td>
                          <td className="py-4 text-brand-secondary text-sm hidden sm:table-cell">{new Date(sub.date).toLocaleDateString()}</td>
                          <td className="py-4 text-right"><button onClick={() => handleDeleteSub(sub.email)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={18} /></button></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Reuniones */}
          {activeTab === 'meetings' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-elevated rounded-2xl p-4 md:p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead><tr className="border-b border-white/10 text-brand-secondary">
                    <th className="pb-4 font-medium">Nombre / Org.</th>
                    <th className="pb-4 font-medium hidden md:table-cell">Email</th>
                    <th className="pb-4 font-medium">Fecha</th>
                    <th className="pb-4 font-medium hidden sm:table-cell">Estado</th>
                    <th className="pb-4 font-medium text-right">Acciones</th>
                  </tr></thead>
                  <tbody>
                    {meetings.length === 0
                      ? <tr><td colSpan="5" className="py-8 text-center text-brand-secondary">No hay reuniones agendadas aún.</td></tr>
                      : meetings.map((meet) => (
                        <tr key={meet.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-4 text-white font-medium text-sm">{meet.name}</td>
                          <td className="py-4 text-brand-secondary text-sm hidden md:table-cell">{meet.email}</td>
                          <td className="py-4 text-white text-sm">{new Date(meet.date).toLocaleDateString()}</td>
                          <td className="py-4 hidden sm:table-cell"><span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-medium">{meet.status}</span></td>
                          <td className="py-4 text-right"><button onClick={() => handleDeleteMeeting(meet.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={18} /></button></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Clientes */}
          {activeTab === 'clients' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
              <form onSubmit={handleAddClient} className="glass-elevated rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm text-brand-secondary mb-2">Nombre del Cliente</label>
                  <input type="text" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} className={inputCls} placeholder="Ej: Ministerio de Salud" required />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm text-brand-secondary mb-2">Sector</label>
                  <input type="text" value={newClient.industry} onChange={e => setNewClient({...newClient, industry: e.target.value})} className={inputCls} placeholder="Ej: Sector Público" />
                </div>
                <button type="submit" className="btn-primary flex items-center gap-2 h-[46px] w-full sm:w-auto"><Plus size={18} /> Añadir</button>
              </form>
              <div className="glass-elevated rounded-2xl p-4 md:p-6 overflow-x-auto">
                <table className="w-full text-left min-w-[320px]">
                  <thead><tr className="border-b border-white/10 text-brand-secondary">
                    <th className="pb-4 font-medium">Organización</th>
                    <th className="pb-4 font-medium hidden sm:table-cell">Sector</th>
                    <th className="pb-4 font-medium text-right">Acciones</th>
                  </tr></thead>
                  <tbody>
                    {clients.length === 0
                      ? <tr><td colSpan="3" className="py-8 text-center text-brand-secondary">No hay clientes.</td></tr>
                      : clients.map(c => (
                        <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-4 text-white font-medium text-sm">{c.name}</td>
                          <td className="py-4 text-[var(--color-brand-cyan)] text-sm hidden sm:table-cell">{c.industry}</td>
                          <td className="py-4 text-right"><button onClick={() => handleDeleteClient(c.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={18} /></button></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}


        </div>
      </main>
    </div>
  );
};

export default Admin;
