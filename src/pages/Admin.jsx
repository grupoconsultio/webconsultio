import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Users,
  Plus,
  Trash2,
  Home,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  FileBarChart,
  Folder,
  FolderPlus,
  ExternalLink,
  UserPlus,
  MapPin,
  Eye,
  FileText,
  FileSpreadsheet,
  FileCode,
  File,
  Download,
  Search,
  ArrowLeft,
  ChevronRight,
  Globe,
  UploadCloud,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  FolderArchive
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { db, storage } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Encuestas predeterminadas
const DEFAULT_SURVEYS = [
  {
    id: 'visita-papal-dashboard',
    title: 'Visita Papal a la Argentina',
    category: 'Opinión Pública',
    description: 'Dashboard de Business Intelligence con métricas en tiempo real, matriz de impactos y auditoría de sorteo.',
    link: '/admin/encuesta-papa',
    isInternal: true,
    badge: 'Nacional'
  },
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

// Carpetas de clientes demostración iniciales
const DEFAULT_CLIENT_FOLDERS = [
  {
    id: 'folder-demo-1',
    name: 'Municipalidad de Río Cuarto',
    assignedUser: 'lector',
    industry: 'Sector Público',
    description: 'Monitoreo territorial, indicadores de gestión y satisfacción ciudadana.',
    createdAt: new Date('2026-03-01').toISOString(),
    createdBy: 'grupoconsultio'
  },
  {
    id: 'folder-demo-2',
    name: 'Ministerio de Innovación & Producción',
    assignedUser: 'todos',
    industry: 'Sector Gubernamental',
    description: 'Tableros de impacto productivo, empleo y desarrollo territorial.',
    createdAt: new Date('2026-03-10').toISOString(),
    createdBy: 'grupoconsultio'
  }
];

// Trabajos de muestra iniciales
const DEFAULT_CLIENT_WORKS = [
  {
    id: 'work-demo-1',
    clientFolderId: 'folder-demo-1',
    title: 'Mapa Interactivo de Obras y Servicios',
    description: 'Georreferenciación de indicadores de infraestructura y demanda social.',
    sourceType: 'url',
    url: '/mapa',
    category: 'Tablero Web',
    createdAt: new Date('2026-03-02').toISOString(),
    createdBy: 'grupoconsultio'
  },
  {
    id: 'work-demo-2',
    clientFolderId: 'folder-demo-1',
    title: 'Informe Ejecutivo de Opinión Pública (Q1)',
    description: 'Documento resumen de relevamiento socioeconómico trimestral.',
    sourceType: 'file',
    fileName: 'Informe_Ejecutivo_RioCuarto_Q1.pdf',
    fileType: 'pdf',
    fileSize: '2.4 MB',
    fileData: '',
    category: 'Informe',
    createdAt: new Date('2026-03-05').toISOString(),
    createdBy: 'grupoconsultio'
  },
  {
    id: 'work-demo-3',
    clientFolderId: 'folder-demo-1',
    title: 'Tablero de Control GitHub',
    description: 'Visualizador de datos desplegado desde repositorio GitHub.',
    sourceType: 'github',
    githubRepo: 'grupoconsultio/mapa-obras',
    githubBranch: 'main',
    githubPath: 'index.html',
    category: 'Repositorio',
    createdAt: new Date('2026-03-08').toISOString(),
    createdBy: 'grupoconsultio'
  },
  {
    id: 'work-demo-4',
    clientFolderId: 'folder-demo-2',
    title: 'Tablero Federal de Opinión Visita Papal',
    description: 'Dashboard analítico con cruces demográficos y cobertura federal.',
    sourceType: 'url',
    url: '/admin/encuesta-papa',
    category: 'Business Intelligence',
    createdAt: new Date('2026-03-12').toISOString(),
    createdBy: 'grupoconsultio'
  }
];

const inputCls = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors text-white placeholder-slate-500";

const Admin = () => {
  const [activeTab, setActiveTab]         = useState('works'); // 'works' | 'surveys' | 'users'
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  
  // Roles y Usuarios
  const [userRole, setUserRole]           = useState('administrador');
  const [userName, setUserName]           = useState('grupoconsultio');
  const [appUsers, setAppUsers]           = useState([]);
  const [newUser, setNewUser]             = useState({ username: '', password: '', role: 'lector' });

  // Encuestas
  const [surveys, setSurveys]             = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [showSurveyForm, setShowSurveyForm]       = useState(false);
  const [newSurvey, setNewSurvey]         = useState({ title: '', category: 'Río Cuarto', description: '', link: '/mapa', badge: 'Río Cuarto' });

  // ═══════════════════════════════════════════════════════════════
  // ESTADOS DE "TRABAJOS" Y CARPETAS DE CLIENTES
  // ═══════════════════════════════════════════════════════════════
  const [clientFolders, setClientFolders] = useState([]);
  const [clientWorks, setClientWorks]     = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null); // Carpeta abierta actualmente
  const [folderSearch, setFolderSearch]   = useState('');
  const [workFilter, setWorkFilter]       = useState('todos'); // 'todos' | 'file' | 'url' | 'github'
  const [workSearch, setWorkSearch]       = useState('');

  // Modales
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [showAddWorkModal, setShowAddWorkModal]     = useState(false);

  // Formulario Nuevo Cliente / Carpeta
  const [newFolder, setNewFolder] = useState({
    name: '',
    assignedUser: 'todos',
    industry: '',
    description: ''
  });

  // Formulario Nuevo Trabajo
  const [newWork, setNewWork] = useState({
    title: '',
    description: '',
    category: 'Tablero',
    sourceType: 'url', // 'url' | 'file' | 'github'
    url: '',
    githubRepo: '',
    githubBranch: 'main',
    githubPath: 'index.html',
    githubUrl: ''
  });
  const [uploadedFileObj, setUploadedFileObj] = useState(null);
  const [isUploading, setIsUploading]         = useState(false);

  const navigate = useNavigate();

  // ── CARGA INICIAL DE DATOS ─────────────────────────────────
  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') !== '1') {
      navigate('/admin/login');
      return;
    }

    const role = sessionStorage.getItem('userRole') || 'administrador';
    const name = sessionStorage.getItem('userName') || 'grupoconsultio';
    setUserRole(role);
    setUserName(name);

    // Cargar Usuarios de Firestore / LocalStorage
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAppUsers(list);
        localStorage.setItem('appUsers', JSON.stringify(list));
      } catch (err) {
        console.warn('Fallback local para usuarios:', err);
        setAppUsers(JSON.parse(localStorage.getItem('appUsers') || '[]'));
      }
    };

    // Cargar Encuestas
    const fetchSurveys = async () => {
      try {
        const snap = await getDocs(collection(db, 'surveys'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        const merged = [...DEFAULT_SURVEYS];
        list.forEach(item => {
          if (!merged.some(m => m.id === item.id)) merged.push(item);
        });
        setSurveys(merged);
        localStorage.setItem('appSurveys', JSON.stringify(merged));
      } catch (err) {
        const storedSurveys = JSON.parse(localStorage.getItem('appSurveys') || '[]');
        const merged = [...DEFAULT_SURVEYS];
        storedSurveys.forEach(item => {
          if (!merged.some(m => m.id === item.id)) merged.push(item);
        });
        setSurveys(merged);
      }
    };

    // Cargar Carpetas de Clientes
    const fetchFolders = async () => {
      try {
        const snap = await getDocs(collection(db, 'client_folders'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (list.length > 0) {
          setClientFolders(list);
          localStorage.setItem('clientFolders', JSON.stringify(list));
        } else {
          const stored = JSON.parse(localStorage.getItem('clientFolders') || '[]');
          setClientFolders(stored.length > 0 ? stored : DEFAULT_CLIENT_FOLDERS);
        }
      } catch (err) {
        const stored = JSON.parse(localStorage.getItem('clientFolders') || '[]');
        setClientFolders(stored.length > 0 ? stored : DEFAULT_CLIENT_FOLDERS);
      }
    };

    // Cargar Trabajos
    const fetchWorks = async () => {
      try {
        const snap = await getDocs(collection(db, 'client_works'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (list.length > 0) {
          setClientWorks(list);
          localStorage.setItem('clientWorks', JSON.stringify(list));
        } else {
          const stored = JSON.parse(localStorage.getItem('clientWorks') || '[]');
          setClientWorks(stored.length > 0 ? stored : DEFAULT_CLIENT_WORKS);
        }
      } catch (err) {
        const stored = JSON.parse(localStorage.getItem('clientWorks') || '[]');
        setClientWorks(stored.length > 0 ? stored : DEFAULT_CLIENT_WORKS);
      }
    };

    fetchUsers();
    fetchSurveys();
    fetchFolders();
    fetchWorks();
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

  // ═══════════════════════════════════════════════════════════════
  // GESTIÓN DE CLIENTES / CARPETAS (TAB: TRABAJOS)
  // ═══════════════════════════════════════════════════════════════
  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolder.name.trim()) return;

    const folderObj = {
      name: newFolder.name.trim(),
      assignedUser: newFolder.assignedUser || 'todos',
      industry: newFolder.industry.trim() || 'General',
      description: newFolder.description.trim(),
      createdAt: new Date().toISOString(),
      createdBy: userName
    };

    try {
      const docRef = await addDoc(collection(db, 'client_folders'), folderObj);
      const created = { ...folderObj, id: docRef.id };
      const updated = [created, ...clientFolders];
      setClientFolders(updated);
      localStorage.setItem('clientFolders', JSON.stringify(updated));
    } catch (err) {
      console.warn('Error guardando carpeta en Firestore, guardando en local:', err);
      const created = { ...folderObj, id: `folder-${Date.now()}` };
      const updated = [created, ...clientFolders];
      setClientFolders(updated);
      localStorage.setItem('clientFolders', JSON.stringify(updated));
    }

    setNewFolder({ name: '', assignedUser: 'todos', industry: '', description: '' });
    setShowAddFolderModal(false);
  };

  const handleDeleteFolder = async (folderId, e) => {
    e?.stopPropagation();
    if (!window.confirm('¿Seguro que deseas eliminar esta carpeta de cliente y todos sus trabajos asociados?')) return;

    try {
      await deleteDoc(doc(db, 'client_folders', folderId));
    } catch (err) {
      console.warn('Error eliminando en Firestore:', err);
    }

    const updatedFolders = clientFolders.filter(f => f.id !== folderId);
    setClientFolders(updatedFolders);
    localStorage.setItem('clientFolders', JSON.stringify(updatedFolders));

    // Eliminar trabajos asociados
    const updatedWorks = clientWorks.filter(w => w.clientFolderId !== folderId);
    setClientWorks(updatedWorks);
    localStorage.setItem('clientWorks', JSON.stringify(updatedWorks));

    if (selectedFolder?.id === folderId) {
      setSelectedFolder(null);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // GESTIÓN DE TRABAJOS (CARGA: ARCHIVO, ENLACE, GITHUB)
  // ═══════════════════════════════════════════════════════════════
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    const ext = file.name.split('.').pop().toLowerCase();

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedFileObj({
        name: file.name,
        size: `${sizeInMb} MB`,
        type: ext,
        rawFile: file,
        dataUrl: event.target.result // Base64 data URL para preview y descarga directa
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCreateWork = async (e) => {
    e.preventDefault();
    if (!selectedFolder || !newWork.title.trim()) return;

    setIsUploading(true);

    let fileUrl = '';
    let storagePath = '';

    // Si es tipo archivo y tenemos archivo seleccionado
    if (newWork.sourceType === 'file' && uploadedFileObj?.rawFile) {
      // Intentar subir a Firebase Storage
      try {
        const filePath = `client_works/${selectedFolder.id}/${Date.now()}_${uploadedFileObj.name}`;
        const storageRef = ref(storage, filePath);
        await uploadBytes(storageRef, uploadedFileObj.rawFile);
        fileUrl = await getDownloadURL(storageRef);
        storagePath = filePath;
      } catch (err) {
        console.warn('Firebase Storage no disponible o sin permiso, usando DataURL seguro:', err);
        // Fallback a Base64 DataURL
        fileUrl = uploadedFileObj.dataUrl || '';
      }
    }

    const workObj = {
      clientFolderId: selectedFolder.id,
      title: newWork.title.trim(),
      description: newWork.description.trim(),
      category: newWork.category || 'Tablero',
      sourceType: newWork.sourceType, // 'url' | 'file' | 'github'
      url: newWork.sourceType === 'url' ? newWork.url.trim() : '',
      fileName: newWork.sourceType === 'file' ? (uploadedFileObj?.name || 'archivo') : '',
      fileType: newWork.sourceType === 'file' ? (uploadedFileObj?.type || 'file') : '',
      fileSize: newWork.sourceType === 'file' ? (uploadedFileObj?.size || '—') : '',
      fileData: newWork.sourceType === 'file' ? (fileUrl || uploadedFileObj?.dataUrl || '') : '',
      storagePath,
      githubRepo: newWork.sourceType === 'github' ? newWork.githubRepo.trim() : '',
      githubBranch: newWork.sourceType === 'github' ? (newWork.githubBranch.trim() || 'main') : '',
      githubPath: newWork.sourceType === 'github' ? (newWork.githubPath.trim() || 'index.html') : '',
      createdAt: new Date().toISOString(),
      createdBy: userName
    };

    try {
      const docRef = await addDoc(collection(db, 'client_works'), workObj);
      const created = { ...workObj, id: docRef.id };
      const updated = [created, ...clientWorks];
      setClientWorks(updated);
      localStorage.setItem('clientWorks', JSON.stringify(updated));
    } catch (err) {
      console.warn('Error guardando trabajo en Firestore, guardando en local:', err);
      const created = { ...workObj, id: `work-${Date.now()}` };
      const updated = [created, ...clientWorks];
      setClientWorks(updated);
      localStorage.setItem('clientWorks', JSON.stringify(updated));
    }

    setIsUploading(false);
    setNewWork({
      title: '',
      description: '',
      category: 'Tablero',
      sourceType: 'url',
      url: '',
      githubRepo: '',
      githubBranch: 'main',
      githubPath: 'index.html',
      githubUrl: ''
    });
    setUploadedFileObj(null);
    setShowAddWorkModal(false);
  };

  const handleDeleteWork = async (workId, e) => {
    e?.stopPropagation();
    if (!window.confirm('¿Deseas eliminar este trabajo?')) return;

    try {
      await deleteDoc(doc(db, 'client_works', workId));
    } catch (err) {
      console.warn('Error eliminando trabajo en Firestore:', err);
    }

    const updated = clientWorks.filter(w => w.id !== workId);
    setClientWorks(updated);
    localStorage.setItem('clientWorks', JSON.stringify(updated));
  };

  // ═══════════════════════════════════════════════════════════════
  // GESTIÓN DE USUARIOS (TAB: USUARIOS)
  // ═══════════════════════════════════════════════════════════════
  const handleAddUser = async (e) => {
    e.preventDefault();
    const cleanName = newUser.username.trim();
    const cleanPass = newUser.password.trim();
    if (!cleanName || !cleanPass) return;

    if (cleanName.toLowerCase() === 'grupoconsultio') {
      alert('El nombre de usuario "grupoconsultio" es un super-administrador reservado.');
      return;
    }

    if (appUsers.some(u => (u.username || '').trim().toLowerCase() === cleanName.toLowerCase())) {
      alert('Ya existe un usuario con este nombre.');
      return;
    }

    const userObj = {
      username: cleanName,
      password: cleanPass,
      role: newUser.role || 'lector',
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'users'), userObj);
      const created = { ...userObj, id: docRef.id };
      const updated = [...appUsers, created];
      setAppUsers(updated);
      localStorage.setItem('appUsers', JSON.stringify(updated));
      alert(`¡Usuario "${cleanName}" creado exitosamente! Ahora puedes asignarle una carpeta en la pestaña Trabajos.`);
    } catch (err) {
      console.warn('Error guardando en Firestore, guardando localmente:', err);
      const created = { ...userObj, id: Date.now().toString() };
      const updated = [...appUsers, created];
      setAppUsers(updated);
      localStorage.setItem('appUsers', JSON.stringify(updated));
      alert(`Usuario "${cleanName}" creado localmente.`);
    }

    setNewUser({ username: '', password: '', role: 'lector' });
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('¿Eliminar este usuario de acceso?')) return;
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (err) {
      console.warn('Error eliminando en Firestore:', err);
    }
    const updated = appUsers.filter(u => u.id !== id);
    setAppUsers(updated);
    localStorage.setItem('appUsers', JSON.stringify(updated));
  };

  // ═══════════════════════════════════════════════════════════════
  // GESTIÓN DE ENCUESTAS (TAB: ENCUESTAS)
  // ═══════════════════════════════════════════════════════════════
  const handleAddSurvey = async (e) => {
    e.preventDefault();
    if (!newSurvey.title || !newSurvey.link) return;
    const isInternal = newSurvey.link.startsWith('/');
    const surveyObj = { ...newSurvey, isInternal, createdAt: new Date().toISOString() };

    try {
      const docRef = await addDoc(collection(db, 'surveys'), surveyObj);
      const created = { ...surveyObj, id: docRef.id };
      const updated = [...surveys, created];
      setSurveys(updated);
      localStorage.setItem('appSurveys', JSON.stringify(updated));
    } catch (err) {
      const created = { ...surveyObj, id: Date.now().toString() };
      const updated = [...surveys, created];
      setSurveys(updated);
      localStorage.setItem('appSurveys', JSON.stringify(updated));
    }

    setNewSurvey({ title: '', category: 'Río Cuarto', description: '', link: '/mapa', badge: 'Río Cuarto' });
    setShowSurveyForm(false);
  };

  const handleDeleteSurvey = async (id) => {
    try {
      await deleteDoc(doc(db, 'surveys', id));
    } catch (err) {
      console.warn('Error eliminando encuesta en Firestore:', err);
    }
    const updated = surveys.filter(s => s.id !== id);
    setSurveys(updated);
    localStorage.setItem('appSurveys', JSON.stringify(updated));
  };

  // ═══════════════════════════════════════════════════════════════
  // FILTRADO Y PERMISOS
  // ═══════════════════════════════════════════════════════════════
  // Pestañas disponibles en Sidebar
  const navItems = userRole === 'lector'
    ? [
        { key: 'works', label: 'Trabajos', icon: Briefcase },
        { key: 'surveys', label: 'Encuestas', icon: FileBarChart }
      ]
    : [
        { key: 'works', label: 'Trabajos', icon: Briefcase },
        { key: 'surveys', label: 'Encuestas', icon: FileBarChart },
        { key: 'users', label: 'Usuarios', icon: ShieldCheck }
      ];

  // Carpetas accesibles para el usuario actual
  const accessibleFolders = clientFolders.filter(folder => {
    if (userRole === 'administrador') return true;
    // Si es lector, ve las carpetas asignadas a su username o con acceso para 'todos'
    return folder.assignedUser === userName || folder.assignedUser === 'todos';
  });

  const filteredFolders = accessibleFolders.filter(f => {
    const q = folderSearch.toLowerCase();
    return (
      (f.name || '').toLowerCase().includes(q) ||
      (f.industry || '').toLowerCase().includes(q) ||
      (f.assignedUser || '').toLowerCase().includes(q)
    );
  });

  // Trabajos de la carpeta seleccionada
  const folderWorks = selectedFolder
    ? clientWorks.filter(w => w.clientFolderId === selectedFolder.id)
    : [];

  const filteredWorks = folderWorks.filter(w => {
    const matchesType = workFilter === 'todos' ? true : w.sourceType === workFilter;
    const matchesSearch =
      (w.title || '').toLowerCase().includes(workSearch.toLowerCase()) ||
      (w.description || '').toLowerCase().includes(workSearch.toLowerCase()) ||
      (w.fileName || '').toLowerCase().includes(workSearch.toLowerCase());
    return matchesType && matchesSearch;
  });

  const categories = ['Todas', ...Array.from(new Set(surveys.map(s => s.category || 'General')))];
  const filteredSurveys = selectedCategory === 'Todas'
    ? surveys
    : surveys.filter(s => s.category === selectedCategory);

  const tabLabel = navItems.find(n => n.key === activeTab)?.label ?? 'Trabajos';

  // Helper para renderizar iconos según tipo de archivo o fuente
  const renderWorkIcon = (work) => {
    if (work.sourceType === 'github') {
      return (
        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
          <FileCode size={20} />
        </div>
      );
    }
    if (work.sourceType === 'url') {
      return (
        <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-cyan)]/10 border border-[var(--color-brand-cyan)]/30 flex items-center justify-center text-[var(--color-brand-cyan)]">
          <Globe size={20} />
        </div>
      );
    }
    // Tipo file
    const ext = (work.fileType || '').toLowerCase();
    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <FileSpreadsheet size={20} />
        </div>
      );
    }
    if (ext === 'pdf') {
      return (
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <FileText size={20} />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
        <File size={20} />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-brand-bg flex text-slate-100">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* ── SIDEBAR DE NAVEGACIÓN ────────────────────────── */}
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

        <nav className="flex-1 flex flex-col gap-1.5">
          {navItems.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => handleTabChange(key)}
              className={`flex items-center gap-3 p-3 rounded-xl transition-all text-left font-medium text-sm ${
                activeTab === key
                  ? 'bg-[var(--color-brand-cyan)]/10 text-[var(--color-brand-cyan)] border border-[var(--color-brand-cyan)]/20 shadow-sm'
                  : 'text-brand-secondary hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Icon size={18} />
              <span>{label}</span>
              {key === 'works' && (
                <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                  {accessibleFolders.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1 pt-4 border-t border-white/5">
          <Link to="/" className="flex items-center gap-3 p-3 rounded-lg text-brand-secondary hover:text-white hover:bg-white/5 transition-colors text-sm">
            <Home size={18} /> Volver al Sitio
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-lg text-brand-secondary hover:text-rose-400 hover:bg-rose-400/5 transition-colors text-sm">
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* ── ÁREA PRINCIPAL DE CONTENIDO ─────────────────── */}
      <main className="flex-1 min-w-0 flex flex-col overflow-y-auto">
        {/* Mobile Header Bar */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 text-brand-secondary hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <Menu size={22} />
          </button>
          <div className="flex flex-col leading-none">
            <span className="text-xs font-display font-light tracking-[0.2em] text-brand-secondary">GRUPO</span>
            <span className="text-base font-display font-extrabold tracking-tight text-white">CONSULTIO</span>
          </div>
        </div>

        <div className="flex-1 p-4 md:p-8 lg:p-10">
          
          {/* Header de Pestaña Superior */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-3">
                {activeTab === 'works' && <Briefcase className="text-[var(--color-brand-cyan)]" size={28} />}
                {activeTab === 'surveys' && <FileBarChart className="text-[var(--color-brand-cyan)]" size={28} />}
                {activeTab === 'users' && <ShieldCheck className="text-purple-400" size={28} />}
                <span>{tabLabel}</span>
              </h1>
              <p className="text-sm text-brand-secondary mt-1">
                {activeTab === 'works' && 'Gestión de carpetas de clientes, tableros interactivos y entrega de trabajos.'}
                {activeTab === 'surveys' && 'Acceso privado a encuestas de opinión pública, mapas y dashboards BI.'}
                {activeTab === 'users' && 'Administración de cuentas, credenciales y asignación de permisos.'}
              </p>
            </div>
            
            {/* Botones de acción según pestaña */}
            {activeTab === 'works' && userRole === 'administrador' && !selectedFolder && (
              <button
                onClick={() => setShowAddFolderModal(true)}
                className="btn-primary flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-[var(--color-brand-cyan)]/15"
              >
                <FolderPlus size={18} /> Agregar Cliente
              </button>
            )}

            {activeTab === 'surveys' && userRole === 'administrador' && (
              <button
                onClick={() => setShowSurveyForm(!showSurveyForm)}
                className="btn-primary flex items-center gap-2 self-start sm:self-auto"
              >
                <FolderPlus size={18} /> {showSurveyForm ? 'Cerrar Formulario' : 'Nueva Encuesta'}
              </button>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════
              PESTAÑA: TRABAJOS (Carpetas de Clientes + Trabajos)
             ══════════════════════════════════════════════════════════ */}
          {activeTab === 'works' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">

              {/* VISTA 1: LISTADO DE CARPETAS DE CLIENTES */}
              {!selectedFolder && (
                <div className="flex flex-col gap-6">
                  {/* Barra de Búsqueda y Estadísticas */}
                  <div className="glass-elevated rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar cliente, sector o usuario..."
                        value={folderSearch}
                        onChange={(e) => setFolderSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors text-white"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-brand-secondary self-start sm:self-auto">
                      <Folder size={15} className="text-[var(--color-brand-cyan)]" />
                      <span>{filteredFolders.length} {filteredFolders.length === 1 ? 'cliente activo' : 'clientes activos'}</span>
                    </div>
                  </div>

                  {/* Grid de Carpetas de Clientes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFolders.length === 0 ? (
                      <div className="col-span-full glass-elevated rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
                        <FolderArchive size={48} className="text-slate-500 stroke-1" />
                        <h4 className="text-lg font-bold text-white">No hay carpetas de clientes disponibles</h4>
                        <p className="text-xs text-brand-secondary max-w-md">
                          {userRole === 'administrador'
                            ? 'Crea tu primera carpeta de cliente para comenzar a cargar informes, tableros de Looker/PowerBI, archivos o proyectos de GitHub.'
                            : 'Aún no tienes carpetas asignadas a tu cuenta de usuario.'}
                        </p>
                        {userRole === 'administrador' && (
                          <button
                            onClick={() => setShowAddFolderModal(true)}
                            className="btn-primary mt-2 flex items-center gap-2 text-xs"
                          >
                            <FolderPlus size={16} /> Crear Carpeta de Cliente
                          </button>
                        )}
                      </div>
                    ) : (
                      filteredFolders.map(folder => {
                        const worksInFolder = clientWorks.filter(w => w.clientFolderId === folder.id);
                        return (
                          <motion.div
                            key={folder.id}
                            whileHover={{ y: -4 }}
                            onClick={() => setSelectedFolder(folder)}
                            className="glass-elevated rounded-2xl p-6 flex flex-col justify-between border border-white/10 relative group hover:border-[var(--color-brand-cyan)]/50 transition-all cursor-pointer shadow-lg hover:shadow-[var(--color-brand-cyan)]/5"
                          >
                            <div>
                              <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-cyan)]/15 border border-[var(--color-brand-cyan)]/30 flex items-center justify-center text-[var(--color-brand-cyan)] group-hover:scale-105 transition-transform">
                                  <Folder size={24} />
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 flex items-center gap-1.5">
                                  <Users size={12} className="text-[var(--color-brand-cyan)]" /> @{folder.assignedUser}
                                </span>
                              </div>

                              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[var(--color-brand-cyan)] transition-colors">
                                {folder.name}
                              </h3>
                              <p className="text-xs text-[var(--color-brand-cyan)] font-medium mb-3">
                                {folder.industry || 'Cliente'}
                              </p>
                              <p className="text-xs text-brand-secondary line-clamp-2 mb-4 leading-relaxed">
                                {folder.description || 'Carpeta exclusiva de entregables, informes estadísticos y tableros.'}
                              </p>
                            </div>

                            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                              <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                                <Layers size={14} className="text-slate-400" />
                                {worksInFolder.length} {worksInFolder.length === 1 ? 'trabajo' : 'trabajos'}
                              </span>

                              <div className="flex items-center gap-2">
                                {userRole === 'administrador' && (
                                  <button
                                    onClick={(e) => handleDeleteFolder(folder.id, e)}
                                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                                    title="Eliminar carpeta de cliente"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                                <span className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1">
                                  Abrir <ChevronRight size={14} />
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* VISTA 2: DENTRO DE UNA CARPETA DE CLIENTE SELECCIONADA */}
              {selectedFolder && (
                <div className="flex flex-col gap-6">
                  {/* Barra Superior de Carpeta (Breadcrumbs + Botón Volver + Cargar) */}
                  <div className="glass-elevated rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <button
                        onClick={() => setSelectedFolder(null)}
                        className="inline-flex items-center gap-1.5 text-xs text-brand-secondary hover:text-[var(--color-brand-cyan)] transition-colors mb-2 font-medium"
                      >
                        <ArrowLeft size={14} /> Volver a Todas las Carpetas
                      </button>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-cyan)]/20 border border-[var(--color-brand-cyan)]/40 flex items-center justify-center text-[var(--color-brand-cyan)]">
                          <Folder size={20} />
                        </div>
                        <div>
                          <h2 className="text-xl md:text-2xl font-bold text-white">{selectedFolder.name}</h2>
                          <div className="flex items-center gap-2 text-xs text-brand-secondary mt-0.5">
                            <span className="text-[var(--color-brand-cyan)] font-medium">{selectedFolder.industry}</span>
                            <span>•</span>
                            <span>Usuario asignado: <strong className="text-white">@{selectedFolder.assignedUser}</strong></span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botón Cargar Trabajo */}
                    <button
                      onClick={() => setShowAddWorkModal(true)}
                      className="btn-primary flex items-center gap-2 py-3 px-5 text-sm self-start md:self-auto shadow-lg shadow-[var(--color-brand-cyan)]/20"
                    >
                      <Plus size={18} /> Cargar Trabajo
                    </button>
                  </div>

                  {/* Filtros de Trabajos (Todos, Archivos, Links, GitHub) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {[
                        { id: 'todos', label: 'Todos los Trabajos', icon: Layers },
                        { id: 'file', label: 'Archivos (PDF/Excel/TXT)', icon: FileText },
                        { id: 'url', label: 'Enlaces Web / Tableros', icon: Globe },
                        { id: 'github', label: 'GitHub', icon: FileCode }
                      ].map(tab => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setWorkFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                              workFilter === tab.id
                                ? 'bg-[var(--color-brand-cyan)] text-black shadow-md shadow-[var(--color-brand-cyan)]/20'
                                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
                            }`}
                          >
                            <Icon size={14} />
                            {tab.label}
                          </button>
                        );
                      })}
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar en esta carpeta..."
                        value={workSearch}
                        onChange={(e) => setWorkSearch(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Grid de Trabajos Cargados */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredWorks.length === 0 ? (
                      <div className="col-span-full glass-elevated rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3">
                        <UploadCloud size={44} className="text-slate-500 stroke-1" />
                        <h4 className="text-base font-bold text-white">No hay trabajos cargados con este criterio</h4>
                        <p className="text-xs text-brand-secondary max-w-sm">
                          Usa el botón "Cargar Trabajo" para adjuntar archivos PDF, planillas Excel, enlaces a Looker/PowerBI o repositorios de GitHub.
                        </p>
                        <button
                          onClick={() => setShowAddWorkModal(true)}
                          className="btn-primary mt-2 flex items-center gap-2 text-xs"
                        >
                          <Plus size={16} /> Cargar Trabajo Ahora
                        </button>
                      </div>
                    ) : (
                      filteredWorks.map(work => (
                        <motion.div
                          key={work.id}
                          whileHover={{ y: -3 }}
                          className="glass-elevated rounded-2xl p-5 flex flex-col justify-between border border-white/10 relative group hover:border-[var(--color-brand-cyan)]/40 transition-all"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              {renderWorkIcon(work)}
                              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300 font-medium">
                                {work.sourceType === 'file' ? (work.fileType ? work.fileType.toUpperCase() : 'ARCHIVO') : (work.sourceType === 'github' ? 'GITHUB' : 'ENLACE WEB')}
                              </span>
                            </div>

                            <h4 className="text-base font-bold text-white mb-1.5 group-hover:text-[var(--color-brand-cyan)] transition-colors">
                              {work.title}
                            </h4>
                            <p className="text-xs text-brand-secondary line-clamp-2 mb-4 leading-relaxed">
                              {work.description || 'Sin descripción adicional.'}
                            </p>

                            {/* Detalles de la fuente */}
                            {work.sourceType === 'file' && (
                              <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-slate-300 flex items-center justify-between mb-4">
                                <span className="truncate max-w-[160px] font-mono">{work.fileName || 'archivo'}</span>
                                <span className="text-slate-400 font-mono">{work.fileSize || '—'}</span>
                              </div>
                            )}

                            {work.sourceType === 'github' && (
                              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-300 flex items-center justify-between mb-4">
                                <span className="truncate max-w-[150px] font-mono">{work.githubRepo}</span>
                                <span className="px-1.5 py-0.5 bg-purple-500/20 rounded text-[10px]">{work.githubBranch || 'main'}</span>
                              </div>
                            )}

                            {work.sourceType === 'url' && (
                              <div className="p-2.5 rounded-xl bg-[var(--color-brand-cyan)]/10 border border-[var(--color-brand-cyan)]/20 text-[11px] text-[var(--color-brand-cyan)] truncate mb-4 font-mono">
                                {work.url}
                              </div>
                            )}
                          </div>

                          {/* Acciones del Trabajo */}
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                            {/* Acción según fuente */}
                            {work.sourceType === 'file' && (
                              <div className="flex items-center gap-2 flex-1">
                                {work.fileData && (
                                  <a
                                    href={work.fileData}
                                    download={work.fileName || 'archivo'}
                                    className="btn-primary flex-1 py-1.5 px-3 text-xs flex items-center justify-center gap-1.5"
                                  >
                                    <Download size={14} /> Descargar
                                  </a>
                                )}
                                {work.fileData && ['pdf', 'png', 'jpg', 'jpeg', 'txt', 'html'].includes((work.fileType || '').toLowerCase()) && (
                                  <a
                                    href={work.fileData}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                                    title="Previsualizar en pestaña"
                                  >
                                    <Eye size={15} />
                                  </a>
                                )}
                              </div>
                            )}

                            {work.sourceType === 'url' && (
                              <a
                                href={work.url}
                                target={work.url.startsWith('/') ? '_self' : '_blank'}
                                rel="noopener noreferrer"
                                className="btn-primary flex-1 py-1.5 px-3 text-xs flex items-center justify-center gap-1.5"
                              >
                                <ExternalLink size={14} /> Abrir Tablero / Enlace
                              </a>
                            )}

                            {work.sourceType === 'github' && (
                              <div className="flex items-center gap-2 flex-1">
                                <a
                                  href={`https://github.com/${work.githubRepo}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn-primary flex-1 py-1.5 px-3 text-xs flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white"
                                >
                                  <FileCode size={14} /> Ver Repositorio
                                </a>
                                {work.githubPath && (
                                  <a
                                    href={`https://github.com/${work.githubRepo}/blob/${work.githubBranch || 'main'}/${work.githubPath}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                                    title="Ver archivo fuente en GitHub"
                                  >
                                    <Eye size={15} />
                                  </a>
                                )}
                              </div>
                            )}

                            {/* Botón Eliminar Trabajo (solo admin) */}
                            {userRole === 'administrador' && (
                              <button
                                onClick={(e) => handleDeleteWork(work.id, e)}
                                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors flex-shrink-0"
                                title="Eliminar trabajo"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════
              PESTAÑA: ENCUESTAS (BI / Dashboards)
             ══════════════════════════════════════════════════════════ */}
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
                      <label className="block text-sm text-brand-secondary mb-1">Categoría</label>
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

              {/* Filtros de Categorías */}
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
                            {survey.id === 'visita-papal-dashboard' ? <FileBarChart size={24} /> : <MapPin size={24} />}
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
                            <ExternalLink size={16} /> Abrir Enlace
                          </a>
                        )}

                        {userRole === 'administrador' && !['rio-cuarto-mapa', 'visita-papal-dashboard'].includes(survey.id) && (
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

          {/* ══════════════════════════════════════════════════════════
              PESTAÑA: USUARIOS (Solo Administrador)
             ══════════════════════════════════════════════════════════ */}
          {activeTab === 'users' && userRole === 'administrador' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
              
              {/* Formulario Agregar Usuario */}
              <form onSubmit={handleAddUser} className="glass-elevated rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm text-brand-secondary mb-2">Nombre de Usuario</label>
                  <input type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className={inputCls} placeholder="Ej: cliente_municipio" required />
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm text-brand-secondary mb-2">Contraseña</label>
                  <input type="text" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className={inputCls} placeholder="Contraseña de acceso" required />
                </div>
                <div className="w-full md:w-56">
                  <label className="block text-sm text-brand-secondary mb-2">Rol / Permisos</label>
                  <select
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value})}
                    className={`${inputCls} bg-brand-surface cursor-pointer`}
                  >
                    <option value="lector">Lector (Solo Trabajos y Encuestas)</option>
                    <option value="administrador">Administrador (Control Total)</option>
                  </select>
                </div>
                <button type="submit" className="btn-primary flex items-center justify-center gap-2 h-[46px] w-full md:w-auto min-w-[150px]">
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
                      <th className="pb-4 font-medium">Carpetas Asociadas</th>
                      <th className="pb-4 font-medium text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Super admin por defecto */}
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
                      <td className="py-4 text-xs text-brand-secondary">Todas las carpetas</td>
                      <td className="py-4 text-right text-xs text-brand-secondary italic">Sistema</td>
                    </tr>

                    {appUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="py-6 text-center text-brand-secondary text-sm">
                          No hay usuarios adicionales registrados. Crea usuarios tipo "Lector" para asociarlos a carpetas de clientes en "Trabajos".
                        </td>
                      </tr>
                    ) : (
                      appUsers.map(user => {
                        const associatedFolders = clientFolders.filter(f => f.assignedUser === user.username);
                        return (
                          <tr key={user.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                            <td className="py-4 text-white font-medium text-sm flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                              {user.username}
                            </td>
                            <td className="py-4 text-brand-secondary text-sm font-mono">{user.password}</td>
                            <td className="py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${user.role === 'administrador' ? 'bg-purple-500/20 text-purple-300' : 'bg-cyan-500/20 text-cyan-300'}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-4 text-xs text-slate-300">
                              {associatedFolders.length > 0 ? (
                                <span className="text-[var(--color-brand-cyan)] font-medium">
                                  {associatedFolders.map(f => f.name).join(', ')}
                                </span>
                              ) : (
                                <span className="text-slate-500 italic">Ninguna asignada</span>
                              )}
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
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        </div>
      </main>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: AGREGAR CLIENTE / CREAR CARPETA
         ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showAddFolderModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg glass-elevated border border-[var(--color-brand-cyan)]/30 rounded-2xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowAddFolderModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-cyan)]/20 border border-[var(--color-brand-cyan)]/40 flex items-center justify-center text-[var(--color-brand-cyan)]">
                  <FolderPlus size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Nueva Carpeta de Cliente</h3>
                  <p className="text-xs text-brand-secondary">Asocia esta carpeta a un usuario creado en "Usuarios" para otorgarle acceso privado.</p>
                </div>
              </div>

              <form onSubmit={handleCreateFolder} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre del Cliente / Organización <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newFolder.name}
                    onChange={(e) => setNewFolder({ ...newFolder, name: e.target.value })}
                    className={inputCls}
                    placeholder="Ej: Municipalidad de Río Cuarto"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Usuario Asociado (con acceso exclusivo) <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={newFolder.assignedUser}
                    onChange={(e) => setNewFolder({ ...newFolder, assignedUser: e.target.value })}
                    className={`${inputCls} bg-brand-surface cursor-pointer`}
                  >
                    <option value="todos">Todos los usuarios (Acceso compartido)</option>
                    <option value="lector">lector (Usuario lector de demostración)</option>
                    {appUsers.map(u => (
                      <option key={u.id} value={u.username}>
                        @{u.username} ({u.role})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Solo este usuario (y administradores) podrán ver esta carpeta al iniciar sesión.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sector / Industria
                  </label>
                  <input
                    type="text"
                    value={newFolder.industry}
                    onChange={(e) => setNewFolder({ ...newFolder, industry: e.target.value })}
                    className={inputCls}
                    placeholder="Ej: Sector Público, Salud, Consultoría"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Descripción / Notas
                  </label>
                  <textarea
                    rows={3}
                    value={newFolder.description}
                    onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                    className={inputCls}
                    placeholder="Detalles sobre el proyecto, alcance o notas para el cliente..."
                  />
                </div>

                <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddFolderModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary flex items-center gap-2 text-xs">
                    <FolderPlus size={16} /> Crear Carpeta
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: CARGAR TRABAJO (ENLACE, ARCHIVO, GITHUB)
         ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showAddWorkModal && selectedFolder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl glass-elevated border border-[var(--color-brand-cyan)]/40 rounded-2xl p-6 shadow-2xl my-8 relative"
            >
              <button
                onClick={() => setShowAddWorkModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-cyan)]/20 border border-[var(--color-brand-cyan)]/40 flex items-center justify-center text-[var(--color-brand-cyan)]">
                  <Plus size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Cargar Trabajo</h3>
                  <p className="text-xs text-brand-secondary">
                    Carpeta: <strong className="text-white">{selectedFolder.name}</strong> (@{selectedFolder.assignedUser})
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateWork} className="flex flex-col gap-4">
                {/* 1. Título y Categoría */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Título del Trabajo <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newWork.title}
                      onChange={(e) => setNewWork({ ...newWork, title: e.target.value })}
                      className={inputCls}
                      placeholder="Ej: Tablero de Control / Informe Q1"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Categoría</label>
                    <input
                      type="text"
                      value={newWork.category}
                      onChange={(e) => setNewWork({ ...newWork, category: e.target.value })}
                      className={inputCls}
                      placeholder="Ej: Tablero, Informe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={newWork.description}
                    onChange={(e) => setNewWork({ ...newWork, description: e.target.value })}
                    className={inputCls}
                    placeholder="Breve resumen del contenido o entregable..."
                  />
                </div>

                {/* 2. Selector de Tipo de Fuente (Enlace, Archivo, GitHub) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Tipo de Fuente / Origen del Trabajo <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Opción 1: Enlace Web */}
                    <label
                      onClick={() => setNewWork({ ...newWork, sourceType: 'url' })}
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        newWork.sourceType === 'url'
                          ? 'bg-[var(--color-brand-cyan)]/15 border-[var(--color-brand-cyan)] shadow-md shadow-[var(--color-brand-cyan)]/10 text-white'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Globe size={16} className={newWork.sourceType === 'url' ? 'text-[var(--color-brand-cyan)]' : 'text-slate-400'} />
                        <span className="font-semibold text-xs">Enlace Web</span>
                      </div>
                      <span className="text-[10px] text-slate-400">PowerBI, Looker, URL</span>
                    </label>

                    {/* Opción 2: Subir Archivo */}
                    <label
                      onClick={() => setNewWork({ ...newWork, sourceType: 'file' })}
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        newWork.sourceType === 'file'
                          ? 'bg-[var(--color-brand-cyan)]/15 border-[var(--color-brand-cyan)] shadow-md shadow-[var(--color-brand-cyan)]/10 text-white'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <UploadCloud size={16} className={newWork.sourceType === 'file' ? 'text-[var(--color-brand-cyan)]' : 'text-slate-400'} />
                        <span className="font-semibold text-xs">Subir Archivo</span>
                      </div>
                      <span className="text-[10px] text-slate-400">PDF, Excel, TXT, ZIP</span>
                    </label>

                    {/* Opción 3: GitHub */}
                    <label
                      onClick={() => setNewWork({ ...newWork, sourceType: 'github' })}
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        newWork.sourceType === 'github'
                          ? 'bg-purple-500/15 border-purple-400 shadow-md shadow-purple-500/10 text-white'
                          : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FileCode size={16} className={newWork.sourceType === 'github' ? 'text-purple-400' : 'text-slate-400'} />
                        <span className="font-semibold text-xs">GitHub</span>
                      </div>
                      <span className="text-[10px] text-slate-400">Repositorio / Código</span>
                    </label>
                  </div>
                </div>

                {/* 3. Campos dinámicos según el tipo de fuente */}
                
                {/* ── TIPO URL ── */}
                {newWork.sourceType === 'url' && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      URL del Enlace o Iframe <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="url"
                      value={newWork.url}
                      onChange={(e) => setNewWork({ ...newWork, url: e.target.value })}
                      className={inputCls}
                      placeholder="https://lookerstudio.google.com/... o https://app.powerbi.com/..."
                      required={newWork.sourceType === 'url'}
                    />
                    <p className="text-[11px] text-slate-400">
                      Pega aquí el enlace de Looker Studio, PowerBI, Google Sheets o cualquier dashboard externo.
                    </p>
                  </div>
                )}

                {/* ── TIPO ARCHIVO (PDF, TXT, EXCEL, ZIP) ── */}
                {newWork.sourceType === 'file' && (
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col gap-3">
                    <label className="block text-xs font-semibold text-slate-300">
                      Archivo del Trabajo (PDF, Excel, TXT, CSV, ZIP, HTML) <span className="text-rose-400">*</span>
                    </label>
                    
                    <div className="border-2 border-dashed border-white/20 rounded-xl p-5 text-center hover:border-[var(--color-brand-cyan)] transition-colors relative bg-white/[0.02]">
                      <input
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.xlsx,.xls,.txt,.csv,.doc,.docx,.zip,.html,.png,.jpg,.jpeg"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                        required={newWork.sourceType === 'file' && !uploadedFileObj}
                      />
                      <UploadCloud size={32} className="mx-auto text-slate-400 mb-2" />
                      <p className="text-xs font-medium text-white mb-1">
                        {uploadedFileObj ? uploadedFileObj.name : 'Haz clic o arrastra tu archivo aquí'}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {uploadedFileObj ? `${uploadedFileObj.size} · Tipo: .${uploadedFileObj.type}` : 'Formatos soportados: PDF, Excel (.xlsx, .xls), TXT, CSV, DOCX, ZIP'}
                      </p>
                    </div>

                    {uploadedFileObj && (
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-brand-cyan)]/10 border border-[var(--color-brand-cyan)]/30 text-xs text-[var(--color-brand-cyan)]">
                        <span className="flex items-center gap-1.5 font-medium truncate max-w-[280px]">
                          <CheckCircle2 size={14} /> {uploadedFileObj.name}
                        </span>
                        <span className="text-slate-300 font-mono text-[11px]">{uploadedFileObj.size}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* ── TIPO GITHUB ── */}
                {newWork.sourceType === 'github' && (
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col gap-3">
                    <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <FileCode size={16} /> Configuración de Repositorio GitHub
                    </span>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Repositorio (owner/repo o URL completa) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={newWork.githubRepo}
                        onChange={(e) => setNewWork({ ...newWork, githubRepo: e.target.value.replace(/^https?:\/\/github\.com\//, '') })}
                        className={inputCls}
                        placeholder="Ej: grupoconsultio/tablero-satisfaccion"
                        required={newWork.sourceType === 'github'}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Rama (Branch)</label>
                        <input
                          type="text"
                          value={newWork.githubBranch}
                          onChange={(e) => setNewWork({ ...newWork, githubBranch: e.target.value })}
                          className={inputCls}
                          placeholder="main"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Ruta del archivo</label>
                        <input
                          type="text"
                          value={newWork.githubPath}
                          onChange={(e) => setNewWork({ ...newWork, githubPath: e.target.value })}
                          className={inputCls}
                          placeholder="index.html"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones de Envío */}
                <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddWorkModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="btn-primary flex items-center gap-2 text-xs"
                  >
                    {isUploading ? (
                      <>Cargando trabajo...</>
                    ) : (
                      <><Plus size={16} /> Guardar y Cargar Trabajo</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Admin;
