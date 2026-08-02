import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, Plus, Trash2, Home, Calendar, Menu, X, LogOut, ShieldCheck, FileBarChart, Folder, ExternalLink, UserPlus, FolderPlus, MapPin, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const DEFAULT_SURVEYS = [
  {
    id: 'rio-cuarto-mapa',
    title: 'Encuesta Río Cuarto',
    category: 'Río Cuarto',
    description: 'Mapa interactivo de indicadores socioeconómicos, obras y gestión pública.',
    link: '/mapa',
    isInternal: true,
    badge: 'Río Cuarto'
  }
];

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors";

const Admin = () => {
  const [activeTab, setActiveTab]       = useState('surveys');
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [newsletters, setNewsletters]   = useState([]);
  const [clients, setClients]           = useState([]);
  const [meetings, setMeetings]         = useState([]);
  
  // Roles y Usuarios
  const [userRole, setUserRole]         = useState('administrador');
  const [userName, setUserName]         = useState('grupoconsultio');
  const [appUsers, setAppUsers]         = useState([]);
  const [newUser, setNewUser]           = useState({ username: '', password: '', role: 'lector' });

  // Encuestas
  const [surveys, setSurveys]           = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showSurveyForm, setShowSurveyForm]     = useState(false);
  const [newSurvey, setNewSurvey]       = useState({ title: '', category: 'Río Cuarto', description: '', link: '/mapa', badge: 'Río Cuarto' });

  const [newClient, setNewClient]       = useState({ name: '', industry: '' });

  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') !== '1') {
      navigate('/admin/login');
      return;
    }

    const role = sessionStorage.getItem('userRole') || 'administrador';
    const name = sessionStorage.getItem('userName') || 'grupoconsultio';
    setUserRole(role);
    setUserName(name);

    if (role === 'lector') {
      setActiveTab('surveys');
    }

    setNewsletters(JSON.parse(localStorage.getItem('newsletterSubs') || '[]'));
    setClients(JSON.parse(localStorage.getItem('clients') || '[]'));
    setMeetings(JSON.parse(localStorage.getItem('meetings') || '[]'));
    setAppUsers(JSON.parse(localStorage.getItem('appUsers') || '[]'));

    const storedSurveys = JSON.parse(localStorage.getItem('appSurveys') || 'null');
    if (!storedSurveys || storedSurveys.length === 0) {
      setSurveys(DEFAULT_SURVEYS);
      localStorage.setItem('appSurveys', JSON.stringify(DEFAULT_SURVEYS));
    } else {
      setSurveys(storedSurveys);
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuth');
    sessionStorage.removeItem('userRole');
    sessionStorage.removeItem('userName');
    navigate('/admin/login');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  /* Newsletter */
  const handleDeleteSub = (email) => {
    const u = newsletters.filter(n => n.email !== email);
    setNewsletters(u);
    localStorage.setItem('newsletterSubs', JSON.stringify(u));
  };

  /* Clients */
  const handleAddClient = (e) => {
    e.preventDefault();
    if (!newClient.name) return;
    const u = [...clients, { ...newClient, id: Date.now() }];
    setClients(u);
    localStorage.setItem('clients', JSON.stringify(u));
    setNewClient({ name: '', industry: '' });
  };

  const handleDeleteClient = (id) => {
    const u = clients.filter(c => c.id !== id);
    setClients(u);
    localStorage.setItem('clients', JSON.stringify(u));
  };

  /* Meetings */
  const handleDeleteMeeting = (id) => {
    const u = meetings.filter(m => m.id !== id);
    setMeetings(u);
    localStorage.setItem('meetings', JSON.stringify(u));
  };

  /* Usuarios (Solo Admin) */
  const handleAddUser = (e) => {
    e.preventDefault();
    const cleanName = newUser.username.trim();
    const cleanPass = newUser.password.trim();
    if (!cleanName || !cleanPass) return;

    if (cleanName.toLowerCase() === 'grupoconsultio') {
      alert('El nombre de usuario "grupoconsultio" es un super-administrador reservado.');
      return;
    }

    if (appUsers.some(u => u.username.trim().toLowerCase() === cleanName.toLowerCase())) {
      alert('Ya existe un usuario con este nombre.');
      return;
    }

    const userObj = {
      username: cleanName,
      password: cleanPass,
      role: newUser.role || 'lector',
      id: Date.now()
    };

    const updated = [...appUsers, userObj];
    setAppUsers(updated);
    localStorage.setItem('appUsers', JSON.stringify(updated));
    setNewUser({ username: '', password: '', role: 'lector' });
  };

  const handleDeleteUser = (id) => {
    const updated = appUsers.filter(u => u.id !== id);
    setAppUsers(updated);
    localStorage.setItem('appUsers', JSON.stringify(updated));
  };

  /* Encuestas */
  const handleAddSurvey = (e) => {
    e.preventDefault();
    if (!newSurvey.title || !newSurvey.link) return;
    const isInternal = newSurvey.link.startsWith('/');
    const created = [...surveys, { ...newSurvey, id: Date.now(), isInternal }];
    setSurveys(created);
    localStorage.setItem('appSurveys', JSON.stringify(created));
    setNewSurvey({ title: '', category: 'Río Cuarto', description: '', link: '/mapa', badge: 'Río Cuarto' });
    setShowSurveyForm(false);
  };

  const handleDeleteSurvey = (id) => {
    const updated = surveys.filter(s => s.id !== id);
    setSurveys(updated);
    localStorage.setItem('appSurveys', JSON.stringify(updated));
  };

  // Nav Items por Rol
  const navItems = userRole === 'lector'
    ? [{ key: 'surveys', label: 'Encuestas', icon: FileBarChart }]
    : [
        { key: 'surveys', label: 'Encuestas', icon: FileBarChart },
        { key: 'users', label: 'Usuarios', icon: ShieldCheck },
        { key: 'newsletter', label: 'Newsletter', icon: Mail },
        { key: 'clients', label: 'Clientes', icon: Users },
        { key: 'meetings', label: 'Reuniones', icon: Calendar },
      ];

  const categories = ['Todas', ...Array.from(new Set(surveys.map(s => s.category || 'General')))];
  const filteredSurveys = selectedCategory === 'Todas'
    ? surveys
    : surveys.filter(s => s.category === selectedCategory);

  const tabLabel = navItems.find(n => n.key === activeTab)?.label ?? 'Encuestas';

  return (
    <div className="min-h-screen bg-brand-bg flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-brand-surface border-r border-white/5 flex flex-col p-6 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="mb-8 flex items-start justify-between">
          <div className="flex flex-col leading-none">
            <span className="text-sm font-display font-light tracking-[0.2em] text-brand-secondary">GRUPO</span>
            <span className="text-2xl font-display font-extrabold tracking-tight text-white">CONSULTIO</span>
          </div>
          <button className="lg:hidden p-1 text-brand-secondary hover:text-white" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
        </div>

        {/* User Card Header */}
        <div className="mb-6 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-brand-cyan)]/20 border border-[var(--color-brand-cyan)]/30 flex items-center justify-center text-[var(--color-brand-cyan)] font-bold text-sm">
            {userName.substring(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{userName}</p>
            <span className={`inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${userRole === 'administrador' ? 'bg-purple-500/20 text-purple-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
              {userRole}
            </span>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => handleTabChange(key)}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${activeTab === key ? 'bg-[var(--color-brand-cyan)]/10 text-[var(--color-brand-cyan)] font-semibold' : 'text-brand-secondary hover:text-white hover:bg-white/5'}`}>
              <Icon size={18} />{label}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1">
          <Link to="/" className="flex items-center gap-3 p-3 rounded-lg text-brand-secondary hover:text-white hover:bg-white/5 transition-colors"><Home size={18} />Volver al Sitio</Link>
          <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-lg text-brand-secondary hover:text-red-400 hover:bg-red-400/5 transition-colors"><LogOut size={18} />Cerrar Sesión</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-brand-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors"><Menu size={22} /></button>
          <div className="flex flex-col leading-none">
            <span className="text-xs font-display font-light tracking-[0.2em] text-brand-secondary">GRUPO</span>
            <span className="text-base font-display font-extrabold tracking-tight text-white">CONSULTIO</span>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-8 lg:p-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white">{tabLabel}</h1>
              <p className="text-sm text-brand-secondary mt-1">
                {activeTab === 'surveys' && 'Acceso privado a encuestas, indicadores y mapas georreferenciados.'}
                {activeTab === 'users' && 'Administración de cuentas, perfiles y permisos de acceso.'}
                {activeTab === 'newsletter' && 'Suscriptores registrados en el formulario de newsletter.'}
                {activeTab === 'clients' && 'Listado y gestión de clientes u organizaciones.'}
                {activeTab === 'meetings' && 'Agendamiento y solicitudes de reuniones.'}
              </p>
            </div>
            
            {activeTab === 'surveys' && userRole === 'administrador' && (
              <button onClick={() => setShowSurveyForm(!showSurveyForm)} className="btn-primary flex items-center gap-2 self-start sm:self-auto">
                <FolderPlus size={18} /> {showSurveyForm ? 'Cerrar Formulario' : 'Nueva Encuesta'}
              </button>
            )}
          </div>

          {/* TAB: ENCUESTAS */}
          {activeTab === 'surveys' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
              
              {/* Formulario Administrador para Agregar Encuesta */}
              {userRole === 'administrador' && showSurveyForm && (
                <form onSubmit={handleAddSurvey} className="glass-elevated rounded-2xl p-4 md:p-6 border border-[var(--color-brand-cyan)]/30 flex flex-col gap-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <FolderPlus size={20} className="text-[var(--color-brand-cyan)]" /> Agregar Nueva Encuesta / Página
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-brand-secondary mb-1">Título de Encuesta</label>
                      <input type="text" value={newSurvey.title} onChange={e => setNewSurvey({...newSurvey, title: e.target.value})} className={inputCls} placeholder="Ej: Encuesta Río Cuarto" required />
                    </div>
                    <div>
                      <label className="block text-sm text-brand-secondary mb-1">Categoría / Carpeta</label>
                      <input type="text" value={newSurvey.category} onChange={e => setNewSurvey({...newSurvey, category: e.target.value})} className={inputCls} placeholder="Ej: Río Cuarto" required />
                    </div>
                    <div>
                      <label className="block text-sm text-brand-secondary mb-1">Etiqueta / Badge</label>
                      <input type="text" value={newSurvey.badge} onChange={e => setNewSurvey({...newSurvey, badge: e.target.value})} className={inputCls} placeholder="Ej: Río Cuarto" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-brand-secondary mb-1">Enlace / Ruta Asoc.</label>
                      <input type="text" value={newSurvey.link} onChange={e => setNewSurvey({...newSurvey, link: e.target.value})} className={inputCls} placeholder="Ej: /mapa o https://..." required />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm text-brand-secondary mb-1">Descripción</label>
                      <input type="text" value={newSurvey.description} onChange={e => setNewSurvey({...newSurvey, description: e.target.value})} className={inputCls} placeholder="Breve detalle del contenido de la encuesta..." />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 mt-2">
                    <button type="button" onClick={() => setShowSurveyForm(false)} className="px-4 py-2 rounded-xl text-sm text-brand-secondary hover:text-white bg-white/5 transition-colors">Cancelar</button>
                    <button type="submit" className="btn-primary flex items-center gap-2"><Plus size={16} /> Crear Encuesta</button>
                  </div>
                </form>
              )}

              {/* Filtros de Categorías / Carpetas */}
              {categories.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <span className="text-xs uppercase text-brand-secondary font-bold mr-2 flex items-center gap-1">
                    <Folder size={14} /> Filtros:
                  </span>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                        selectedCategory === cat
                          ? 'bg-[var(--color-brand-cyan)] text-black shadow-lg shadow-[var(--color-brand-cyan)]/20'
                          : 'bg-white/5 text-brand-secondary hover:text-white border border-white/10'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Grid de Encuestas */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSurveys.length === 0 ? (
                  <div className="col-span-full glass-elevated rounded-2xl p-8 text-center text-brand-secondary">
                    No se encontraron encuestas registradas en esta categoría.
                  </div>
                ) : (
                  filteredSurveys.map(survey => (
                    <motion.div
                      key={survey.id}
                      whileHover={{ y: -4 }}
                      className="glass-elevated rounded-2xl p-6 flex flex-col justify-between border border-white/10 relative group hover:border-[var(--color-brand-cyan)]/50 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-cyan)]/10 border border-[var(--color-brand-cyan)]/30 flex items-center justify-center text-[var(--color-brand-cyan)]">
                            <MapPin size={24} />
                          </div>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {survey.badge || survey.category}
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-white mb-2">{survey.title}</h3>
                        <p className="text-sm text-brand-secondary mb-6 leading-relaxed">
                          {survey.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                        {survey.isInternal ? (
                          <Link
                            to={survey.link}
                            className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
                          >
                            <Eye size={16} /> Ver Encuesta
                          </Link>
                        ) : (
                          <a
                            href={survey.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"
                          >
                            <ExternalLink size={16} /> Abrir Enlace External
                          </a>
                        )}

                        {userRole === 'administrador' && survey.id !== 'rio-cuarto-mapa' && (
                          <button
                            onClick={() => handleDeleteSurvey(survey.id)}
                            className="p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                            title="Eliminar Encuesta"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {/* TAB: USUARIOS (Solo Administrador) */}
          {activeTab === 'users' && userRole === 'administrador' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
              
              {/* Formulario Agregar Usuario */}
              <form onSubmit={handleAddUser} className="glass-elevated rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm text-brand-secondary mb-2">Usuario</label>
                  <input type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className={inputCls} placeholder="Nombre de usuario" required />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm text-brand-secondary mb-2">Contraseña</label>
                  <input type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className={inputCls} placeholder="Contraseña de acceso" required />
                </div>
                <div className="w-full md:w-48">
                  <label className="block text-sm text-brand-secondary mb-2">Rol / Permisos</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                    className={`${inputCls} bg-brand-surface cursor-pointer`}
                  >
                    <option value="lector">Lector (Solo Encuestas)</option>
                    <option value="administrador">Administrador (Total)</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary flex items-center justify-center gap-2 h-[46px] w-full md:w-auto min-w-[140px]">
                  <UserPlus size={18} /> Crear Usuario
                </button>
              </form>

              {/* Tabla de Usuarios */}
              <div className="glass-elevated rounded-2xl p-4 md:p-6 overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr className="border-b border-white/10 text-brand-secondary">
                      <th className="pb-4 font-medium">Usuario</th>
                      <th className="pb-4 font-medium">Contraseña</th>
                      <th className="pb-4 font-medium">Rol</th>
                      <th className="pb-4 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Super admin hardcodeado */}
                    <tr className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-4 text-white font-bold text-sm flex items-center gap-2">
                        <ShieldCheck size={16} className="text-purple-400" /> grupoconsultio
                      </td>
                      <td className="py-4 text-brand-secondary text-sm">•••••••••• (Super-Admin)</td>
                      <td className="py-4">
                        <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                          administrador
                        </span>
                      </td>
                      <td className="py-4 text-right text-xs text-brand-secondary italic">Sistema</td>
                    </tr>

                    {appUsers.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-6 text-center text-brand-secondary text-sm">
                          No hay usuarios creados adicionales. Utiliza el formulario superior para registrar usuarios de tipo Lector o Administrador.
                        </td>
                      </tr>
                    ) : (
                      appUsers.map(user => (
                        <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                          <td className="py-4 text-white font-medium text-sm">{user.username}</td>
                          <td className="py-4 text-brand-secondary text-sm font-mono">{user.password}</td>
                          <td className="py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${user.role === 'administrador' ? 'bg-purple-500/20 text-purple-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                              title="Eliminar usuario"
                            >
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

          {/* TAB: NEWSLETTER (Solo Admin) */}
          {activeTab === 'newsletter' && userRole === 'administrador' && (
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

          {/* TAB: REUNIONES (Solo Admin) */}
          {activeTab === 'meetings' && userRole === 'administrador' && (
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

          {/* TAB: CLIENTES (Solo Admin) */}
          {activeTab === 'clients' && userRole === 'administrador' && (
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
