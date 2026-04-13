import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Plus, Trash2, Home, Calendar, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const defaultTestimonials = [
  {
    id: 1,
    text: "Consultio transformó por completo nuestra gestión de datos. Su atención al detalle y enfoque estratégico es inigualable.",
    author: "Alejandro Ruiz",
    role: "Secretario de Innovación",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 2,
    text: "Los resultados fueron inmediatos. El observatorio de gestión nos permitió tomar decisiones basadas en evidencia real.",
    author: "Elena Rodríguez",
    role: "Directora de Operaciones",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 3,
    text: "Servicio excepcional y de alta calidad técnica. Entienden las dinámicas tanto del sector público como privado.",
    author: "Marcos Torres",
    role: "Fundador, Zenith Corp",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg"
  },
  {
    id: 4,
    text: "Una experiencia verdaderamente profesional. Absoluta confidencialidad y rigor metodológico en cada etapa del estudio.",
    author: "Sara Jiménez",
    role: "VP Marketing",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg"
  }
];

const Admin = () => {
  const [activeTab, setActiveTab] = useState('newsletter');
  const [newsletters, setNewsletters] = useState([]);
  const [clients, setClients] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  
  const [newClient, setNewClient] = useState({ name: '', industry: '' });
  const [newTestimonial, setNewTestimonial] = useState({ author: '', role: '', text: '', avatar: 'https://randomuser.me/api/portraits/lego/1.jpg' });

  useEffect(() => {
    // Load initial data
    const loadedNews = JSON.parse(localStorage.getItem('newsletterSubs') || '[]');
    setNewsletters(loadedNews);
    
    const loadedClients = JSON.parse(localStorage.getItem('clients') || '[]');
    setClients(loadedClients);

    const loadedMeetings = JSON.parse(localStorage.getItem('meetings') || '[]');
    setMeetings(loadedMeetings);

    const loadedTestimonials = JSON.parse(localStorage.getItem('testimonials') || 'null');
    if (loadedTestimonials && loadedTestimonials.length > 0) {
      setTestimonials(loadedTestimonials);
    } else {
      setTestimonials(defaultTestimonials);
      localStorage.setItem('testimonials', JSON.stringify(defaultTestimonials));
    }
  }, []);

  const handleDeleteSub = (email) => {
    const updated = newsletters.filter(n => n.email !== email);
    setNewsletters(updated);
    localStorage.setItem('newsletterSubs', JSON.stringify(updated));
  };

  const handleAddClient = (e) => {
    e.preventDefault();
    if (newClient.name) {
      const updated = [...clients, { ...newClient, id: Date.now() }];
      setClients(updated);
      localStorage.setItem('clients', JSON.stringify(updated));
      setNewClient({ name: '', industry: '' });
    }
  };

  const handleDeleteClient = (id) => {
    const updated = clients.filter(c => c.id !== id);
    setClients(updated);
    localStorage.setItem('clients', JSON.stringify(updated));
  };

  const handleDeleteMeeting = (id) => {
    const updated = meetings.filter(m => m.id !== id);
    setMeetings(updated);
    localStorage.setItem('meetings', JSON.stringify(updated));
  };

  const handleAddTestimonial = (e) => {
    e.preventDefault();
    if (newTestimonial.author && newTestimonial.text) {
      const updated = [...testimonials, { ...newTestimonial, id: Date.now() }];
      setTestimonials(updated);
      localStorage.setItem('testimonials', JSON.stringify(updated));
      setNewTestimonial({ author: '', role: '', text: '', avatar: 'https://randomuser.me/api/portraits/lego/1.jpg' });
    }
  };

  const handleDeleteTestimonial = (id) => {
    const updated = testimonials.filter(t => t.id !== id);
    setTestimonials(updated);
    localStorage.setItem('testimonials', JSON.stringify(updated));
  }

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-surface border-r border-white/5 p-6 flex flex-col">
        <div className="mb-12">
          <div className="flex flex-col leading-none">
            <span className="text-sm font-display font-light tracking-[0.2em] text-brand-secondary">GRUPO</span>
            <span className="text-2xl font-display font-extrabold tracking-tight text-white">CONSULTIO</span>
          </div>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('newsletter')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'newsletter' ? 'bg-[var(--color-brand-cyan)]/10 text-[var(--color-brand-cyan)]' : 'text-brand-secondary hover:text-white hover:bg-white/5'}`}
          >
            <Mail size={18} />
            Newsletter
          </button>
          <button 
            onClick={() => setActiveTab('clients')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'clients' ? 'bg-[var(--color-brand-cyan)]/10 text-[var(--color-brand-cyan)]' : 'text-brand-secondary hover:text-white hover:bg-white/5'}`}
          >
            <Users size={18} />
            Clientes
          </button>
          <button 
            onClick={() => setActiveTab('meetings')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'meetings' ? 'bg-[var(--color-brand-cyan)]/10 text-[var(--color-brand-cyan)]' : 'text-brand-secondary hover:text-white hover:bg-white/5'}`}
          >
            <Calendar size={18} />
            Reuniones
          </button>
          <button 
            onClick={() => setActiveTab('testimonials')}
            className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${activeTab === 'testimonials' ? 'bg-[var(--color-brand-cyan)]/10 text-[var(--color-brand-cyan)]' : 'text-brand-secondary hover:text-white hover:bg-white/5'}`}
          >
            <MessageSquare size={18} />
            Testimonios
          </button>
        </nav>

        <div className="mt-auto">
          <Link to="/" className="flex items-center gap-3 p-3 rounded-lg text-brand-secondary hover:text-white hover:bg-white/5 transition-colors">
            <Home size={18} />
            Volver al Sitio
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <h1 className="text-3xl font-display font-bold mb-8">
          {activeTab === 'newsletter' && 'Suscriptores al Newsletter'}
          {activeTab === 'clients' && 'Gestión de Clientes'}
          {activeTab === 'meetings' && 'Reuniones Agendadas'}
          {activeTab === 'testimonials' && 'Gestión de Testimonios'}
        </h1>

        {activeTab === 'newsletter' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-elevated rounded-2xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-brand-secondary">
                    <th className="pb-4 font-medium">Email</th>
                    <th className="pb-4 font-medium">Fecha de Suscripción</th>
                    <th className="pb-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {newsletters.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="py-8 text-center text-brand-secondary">No hay suscriptores aún.</td>
                    </tr>
                  ) : (
                    newsletters.map((sub, idx) => (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-4 text-white">{sub.email}</td>
                        <td className="py-4 text-brand-secondary">{new Date(sub.date).toLocaleDateString()}</td>
                        <td className="py-4 text-right">
                          <button onClick={() => handleDeleteSub(sub.email)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'meetings' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-elevated rounded-2xl p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/10 text-brand-secondary">
                    <th className="pb-4 font-medium">Nombre / Org.</th>
                    <th className="pb-4 font-medium">Email</th>
                    <th className="pb-4 font-medium">Fecha Propuesta</th>
                    <th className="pb-4 font-medium">Estado</th>
                    <th className="pb-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {meetings.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-brand-secondary">No hay reuniones agendadas aún.</td>
                    </tr>
                  ) : (
                    meetings.map((meet) => (
                      <tr key={meet.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-4 text-white font-medium">{meet.name}</td>
                        <td className="py-4 text-brand-secondary">{meet.email}</td>
                        <td className="py-4 text-white">{new Date(meet.date).toLocaleDateString()}</td>
                        <td className="py-4">
                          <span className="bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-medium">
                            {meet.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <button onClick={() => handleDeleteMeeting(meet.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'clients' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
            <form onSubmit={handleAddClient} className="glass-elevated rounded-2xl p-6 flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm text-brand-secondary mb-2">Nombre del Cliente</label>
                <input 
                  type="text" 
                  value={newClient.name}
                  onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
                  placeholder="Ej: Ministerio de Salud"
                  required
                />
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm text-brand-secondary mb-2">Sector</label>
                <input 
                  type="text" 
                  value={newClient.industry}
                  onChange={(e) => setNewClient({...newClient, industry: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
                  placeholder="Ej: Sector Público"
                />
              </div>
              <button type="submit" className="btn-primary flex items-center gap-2 h-[46px]">
                <Plus size={18} /> Añadir
              </button>
            </form>

            <div className="glass-elevated rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 text-brand-secondary">
                      <th className="pb-4 font-medium">Organización</th>
                      <th className="pb-4 font-medium">Sector</th>
                      <th className="pb-4 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="py-8 text-center text-brand-secondary">No hay clientes agregados.</td>
                      </tr>
                    ) : (
                      clients.map((client) => (
                        <tr key={client.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-4 text-white font-medium">{client.name}</td>
                          <td className="py-4 text-[var(--color-brand-cyan)] text-sm">{client.industry}</td>
                          <td className="py-4 text-right">
                            <button onClick={() => handleDeleteClient(client.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'testimonials' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8">
            <form onSubmit={handleAddTestimonial} className="glass-elevated rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-brand-secondary mb-2">Nombre / Autor</label>
                <input 
                  type="text" 
                  value={newTestimonial.author}
                  onChange={(e) => setNewTestimonial({...newTestimonial, author: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
                  placeholder="Ej: Sara Jiménez"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-brand-secondary mb-2">Rol o Cargo</label>
                <input 
                  type="text" 
                  value={newTestimonial.role}
                  onChange={(e) => setNewTestimonial({...newTestimonial, role: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
                  placeholder="Ej: Directora de Operaciones"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-brand-secondary mb-2">Texto del Testimonio (Máx 130 caracteres)</label>
                <textarea 
                  value={newTestimonial.text}
                  onChange={(e) => setNewTestimonial({...newTestimonial, text: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors resize-none h-24"
                  placeholder="Escriba el testimonio aquí..."
                  maxLength={130}
                  required
                />
                <span className="text-xs text-brand-secondary float-right mt-1">{newTestimonial.text.length}/130</span>
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button type="submit" className="btn-primary flex items-center gap-2">
                  <Plus size={18} /> Añadir Testimonio
                </button>
              </div>
            </form>

            <div className="glass-elevated rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left relative min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 text-brand-secondary">
                      <th className="pb-4 font-medium w-1/4">Autor</th>
                      <th className="pb-4 font-medium w-1/4">Rol</th>
                      <th className="pb-4 font-medium w-2/4">Testimonio</th>
                      <th className="pb-4 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testimonials.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-brand-secondary">No hay testimonios agregados.</td>
                      </tr>
                    ) : (
                      testimonials.map((test) => (
                        <tr key={test.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-4 text-white font-medium">{test.author}</td>
                          <td className="py-4 text-[var(--color-brand-cyan)] text-sm">{test.role}</td>
                          <td className="py-4 text-brand-secondary text-sm pr-4">"{test.text}"</td>
                          <td className="py-4 text-right">
                            <button onClick={() => handleDeleteTestimonial(test.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default Admin;
