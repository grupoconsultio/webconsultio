import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Plus, Trash2, Home, Calendar, MessageSquare, Menu, X, LogOut, Newspaper } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const defaultTestimonials = [
  { id: 1, text: "Consultio transformó por completo nuestra gestión de datos. Su atención al detalle y enfoque estratégico es inigualable.", author: "Alejandro Ruiz", role: "Secretario de Innovación", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
  { id: 2, text: "Los resultados fueron inmediatos. El observatorio de gestión nos permitió tomar decisiones basadas en evidencia real.", author: "Elena Rodríguez", role: "Directora de Operaciones", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: 3, text: "Servicio excepcional y de alta calidad técnica. Entienden las dinámicas tanto del sector público como privado.", author: "Marcos Torres", role: "Fundador, Zenith Corp", avatar: "https://randomuser.me/api/portraits/men/67.jpg" },
  { id: 4, text: "Una experiencia verdaderamente profesional. Absoluta confidencialidad y rigor metodológico en cada etapa del estudio.", author: "Sara Jiménez", role: "VP Marketing", avatar: "https://randomuser.me/api/portraits/women/68.jpg" }
];

const defaultBlogPosts = [
  { id: 1, title: "Reforma Electoral: Desafíos y Perspectivas para la Democracia Latinoamericana", description: "Los sistemas electorales de la región enfrentan presiones sin precedentes. Analizamos los principales ejes de reforma, la incorporación de tecnología en el voto y el impacto de la desconfianza institucional en los niveles de participación ciudadana.", date: "2026-03-15", imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&auto=format&fit=crop" },
  { id: 2, title: "Gestión Municipal y Participación Ciudadana: Nuevos Paradigmas", description: "Las administraciones locales buscan fortalecer vínculos con la ciudadanía a través de mecanismos de consulta y presupuesto participativo. Exploramos casos de éxito y los indicadores clave para medir el impacto de estas iniciativas.", date: "2026-02-28", imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&auto=format&fit=crop" },
  { id: 3, title: "El Rol de los Datos en la Formulación de Políticas Públicas", description: "La evidencia empírica se consolida como base para el diseño de políticas más eficientes. Desde encuestas de opinión hasta modelos predictivos, los gobiernos que invierten en inteligencia de datos obtienen resultados medibles y sostenibles.", date: "2026-01-20", imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop" }
];

const NAV_ITEMS = [
  { key: 'newsletter',   label: 'Newsletter',  icon: Mail },
  { key: 'clients',      label: 'Clientes',    icon: Users },
  { key: 'meetings',     label: 'Reuniones',   icon: Calendar },
  { key: 'testimonials', label: 'Testimonios', icon: MessageSquare },
  { key: 'blog',         label: 'Blog',        icon: Newspaper },
];

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors";

const Admin = () => {
  const [activeTab, setActiveTab]       = useState('newsletter');
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [newsletters, setNewsletters]   = useState([]);
  const [clients, setClients]           = useState([]);
  const [meetings, setMeetings]         = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [blogPosts, setBlogPosts]       = useState([]);

  const [newClient, setNewClient]           = useState({ name: '', industry: '' });
  const [newTestimonial, setNewTestimonial] = useState({ author: '', role: '', text: '', avatar: 'https://randomuser.me/api/portraits/lego/1.jpg' });
  const [newPost, setNewPost]               = useState({ title: '', description: '', date: '', imageUrl: '' });

  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') !== '1') { navigate('/admin/login'); return; }

    setNewsletters(JSON.parse(localStorage.getItem('newsletterSubs') || '[]'));
    setClients(JSON.parse(localStorage.getItem('clients') || '[]'));
    setMeetings(JSON.parse(localStorage.getItem('meetings') || '[]'));

    const savedTest = JSON.parse(localStorage.getItem('testimonials') || 'null');
    setTestimonials(savedTest?.length ? savedTest : defaultTestimonials);
    if (!savedTest?.length) localStorage.setItem('testimonials', JSON.stringify(defaultTestimonials));

    const savedBlog = JSON.parse(localStorage.getItem('blogPosts') || 'null');
    setBlogPosts(savedBlog?.length ? savedBlog : defaultBlogPosts);
    if (!savedBlog?.length) localStorage.setItem('blogPosts', JSON.stringify(defaultBlogPosts));
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

  /* Testimonials */
  const handleAddTestimonial = (e) => {
    e.preventDefault();
    if (!newTestimonial.author || !newTestimonial.text) return;
    const u = [...testimonials, { ...newTestimonial, id: Date.now() }];
    setTestimonials(u); localStorage.setItem('testimonials', JSON.stringify(u));
    setNewTestimonial({ author: '', role: '', text: '', avatar: 'https://randomuser.me/api/portraits/lego/1.jpg' });
  };
  const handleDeleteTestimonial = (id) => {
    const u = testimonials.filter(t => t.id !== id);
    setTestimonials(u); localStorage.setItem('testimonials', JSON.stringify(u));
  };

  /* Blog */
  const handleAddPost = (e) => {
    e.preventDefault();
    if (!newPost.title || !newPost.description || !newPost.date) return;
    const u = [...blogPosts, { ...newPost, id: Date.now() }];
    setBlogPosts(u); localStorage.setItem('blogPosts', JSON.stringify(u));
    setNewPost({ title: '', description: '', date: '', imageUrl: '' });
  };
  const handleDeletePost = (id) => {
    const u = blogPosts.filter(p => p.id !== id);
    setBlogPosts(u); localStorage.setItem('blogPosts', JSON.stringify(u));
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

          {/* Testimonios */}
          {activeTab === 'testimonials' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
              <form onSubmit={handleAddTestimonial} className="glass-elevated rounded-2xl p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-brand-secondary mb-2">Nombre / Autor</label>
                  <input type="text" value={newTestimonial.author} onChange={e => setNewTestimonial({...newTestimonial, author: e.target.value})} className={inputCls} placeholder="Ej: Sara Jiménez" required />
                </div>
                <div>
                  <label className="block text-sm text-brand-secondary mb-2">Rol o Cargo</label>
                  <input type="text" value={newTestimonial.role} onChange={e => setNewTestimonial({...newTestimonial, role: e.target.value})} className={inputCls} placeholder="Ej: Directora de Operaciones" required />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-brand-secondary mb-2">Texto (Máx 130 caracteres)</label>
                  <textarea value={newTestimonial.text} onChange={e => setNewTestimonial({...newTestimonial, text: e.target.value})} className={`${inputCls} resize-none h-24`} maxLength={130} required />
                  <span className="text-xs text-brand-secondary float-right mt-1">{newTestimonial.text.length}/130</span>
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" className="btn-primary flex items-center gap-2 w-full sm:w-auto"><Plus size={18} /> Añadir</button>
                </div>
              </form>
              <div className="glass-elevated rounded-2xl p-4 md:p-6 overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead><tr className="border-b border-white/10 text-brand-secondary">
                    <th className="pb-4 font-medium">Autor</th>
                    <th className="pb-4 font-medium hidden sm:table-cell">Rol</th>
                    <th className="pb-4 font-medium">Testimonio</th>
                    <th className="pb-4 font-medium text-right">Acciones</th>
                  </tr></thead>
                  <tbody>
                    {testimonials.length === 0
                      ? <tr><td colSpan="4" className="py-8 text-center text-brand-secondary">No hay testimonios.</td></tr>
                      : testimonials.map(t => (
                        <tr key={t.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-4 text-white font-medium text-sm">{t.author}</td>
                          <td className="py-4 text-[var(--color-brand-cyan)] text-sm hidden sm:table-cell">{t.role}</td>
                          <td className="py-4 text-brand-secondary text-sm pr-4">"{t.text}"</td>
                          <td className="py-4 text-right"><button onClick={() => handleDeleteTestimonial(t.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={18} /></button></td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Blog */}
          {activeTab === 'blog' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
              <form onSubmit={handleAddPost} className="glass-elevated rounded-2xl p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-brand-secondary mb-2">Título</label>
                  <input type="text" value={newPost.title} onChange={e => setNewPost({...newPost, title: e.target.value})} className={inputCls} placeholder="Título de la publicación" required />
                </div>
                <div>
                  <label className="block text-sm text-brand-secondary mb-2">Fecha de Publicación</label>
                  <input type="date" value={newPost.date} onChange={e => setNewPost({...newPost, date: e.target.value})} className={inputCls} required />
                </div>
                <div>
                  <label className="block text-sm text-brand-secondary mb-2">URL de Imagen (opcional)</label>
                  <input type="url" value={newPost.imageUrl} onChange={e => setNewPost({...newPost, imageUrl: e.target.value})} className={inputCls} placeholder="https://..." />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm text-brand-secondary mb-2">Descripción</label>
                  <textarea value={newPost.description} onChange={e => setNewPost({...newPost, description: e.target.value})} className={`${inputCls} resize-none h-28`} placeholder="Resumen o extracto..." required />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <button type="submit" className="btn-primary flex items-center gap-2 w-full sm:w-auto"><Plus size={18} /> Publicar</button>
                </div>
              </form>

              <div className="glass-elevated rounded-2xl p-4 md:p-6 overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead><tr className="border-b border-white/10 text-brand-secondary">
                    <th className="pb-4 font-medium">Título</th>
                    <th className="pb-4 font-medium hidden sm:table-cell">Fecha</th>
                    <th className="pb-4 font-medium text-right">Acciones</th>
                  </tr></thead>
                  <tbody>
                    {blogPosts.length === 0
                      ? <tr><td colSpan="3" className="py-8 text-center text-brand-secondary">No hay publicaciones.</td></tr>
                      : [...blogPosts].sort((a,b) => new Date(b.date)-new Date(a.date)).map(p => (
                        <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-4 text-white font-medium text-sm max-w-xs truncate pr-4">{p.title}</td>
                          <td className="py-4 text-brand-secondary text-sm hidden sm:table-cell">
                            {new Date(p.date + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="py-4 text-right"><button onClick={() => handleDeletePost(p.id)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"><Trash2 size={18} /></button></td>
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
