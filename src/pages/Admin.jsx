import React, { useState, useEffect, useRef } from 'react';
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
  Folder,
  FolderPlus,
  ExternalLink,
  UserPlus,
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
  FolderArchive,
  RefreshCw,
  Maximize2,
  Minimize2,
  Lock,
  Check,
  AlertCircle,
  Pencil,
  AlertTriangle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import { db, storage } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// ═══════════════════════════════════════════════════════════════
// CARPETAS DE CLIENTES INICIALES
// (CONSULTIO para Visita Papal y Municipalidad de Río Cuarto para Mapa)
// ═══════════════════════════════════════════════════════════════
const INITIAL_CLIENT_FOLDERS = [
  {
    id: 'folder-consultio',
    name: 'CONSULTIO',
    assignedUsers: ['grupoconsultio', 'todos'],
    industry: 'Investigación & Opinión Pública',
    description: 'Carpeta institucional de ConsulDat / Grupo Consultio. Tableros federales y estudios nacionales.',
    createdAt: new Date('2026-03-01').toISOString(),
    createdBy: 'grupoconsultio'
  },
  {
    id: 'folder-rio-cuarto',
    name: 'Municipalidad de Río Cuarto',
    assignedUsers: ['grupoconsultio', 'lector'],
    industry: 'Sector Público',
    description: 'Gestión de indicadores territoriales, relevamiento socioeconómico y obras públicas.',
    createdAt: new Date('2026-03-05').toISOString(),
    createdBy: 'grupoconsultio'
  }
];

// ═══════════════════════════════════════════════════════════════
// TRABAJOS CARGADOS INICIALES
// ═══════════════════════════════════════════════════════════════
const INITIAL_CLIENT_WORKS = [
  {
    id: 'work-visita-papal',
    clientFolderId: 'folder-consultio',
    title: 'Visita Papal a la Argentina',
    description: 'Dashboard de Business Intelligence con métricas en tiempo real, matriz de impactos y auditoría de sorteo.',
    sourceType: 'url',
    url: '/admin/encuesta-papa',
    category: 'Opinión Pública',
    createdAt: new Date('2026-03-02').toISOString(),
    createdBy: 'grupoconsultio'
  },
  {
    id: 'work-rio-cuarto-mapa',
    clientFolderId: 'folder-rio-cuarto',
    title: 'Encuesta Río Cuarto',
    description: 'Mapa interactivo de indicadores socioeconómicos, obras y opinión pública.',
    sourceType: 'url',
    url: '/mapa',
    category: 'Río Cuarto',
    createdAt: new Date('2026-03-06').toISOString(),
    createdBy: 'grupoconsultio'
  },
  {
    id: 'work-rio-cuarto-informe',
    clientFolderId: 'folder-rio-cuarto',
    title: 'Informe Ejecutivo de Opinión Pública (Q1)',
    description: 'Documento resumen de relevamiento socioeconómico trimestral.',
    sourceType: 'file',
    fileName: 'Informe_Ejecutivo_RioCuarto_Q1.pdf',
    fileType: 'pdf',
    fileSize: '2.4 MB',
    fileData: '',
    category: 'Informe',
    createdAt: new Date('2026-03-08').toISOString(),
    createdBy: 'grupoconsultio'
  }
];

const inputCls = "w-full bg-[#131B2E] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors text-white placeholder-slate-500 [&>option]:bg-[#131B2E] [&>option]:text-white";
const selectCls = "w-full bg-[#131B2E] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors text-white cursor-pointer [&>option]:bg-[#131B2E] [&>option]:text-white";

const Admin = () => {
  const [activeTab, setActiveTab]         = useState('works'); // 'works' | 'users'
  const [sidebarOpen, setSidebarOpen]     = useState(false);
  
  // Roles y Usuarios
  const [userRole, setUserRole]           = useState('administrador');
  const [userName, setUserName]           = useState('grupoconsultio');
  const [appUsers, setAppUsers]           = useState([]);
  const [newUser, setNewUser]             = useState({ username: '', password: '', role: 'lector' });

  // Carpetas de clientes y Trabajos
  const [clientFolders, setClientFolders] = useState([]);
  const [clientWorks, setClientWorks]     = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [folderSearch, setFolderSearch]   = useState('');
  const [workFilter, setWorkFilter]       = useState('todos'); // 'todos' | 'file' | 'url' | 'github'
  const [workSearch, setWorkSearch]       = useState('');

  // Modales
  const [showAddFolderModal, setShowAddFolderModal]   = useState(false);
  const [showEditFolderModal, setShowEditFolderModal] = useState(false);
  const [editingFolder, setEditingFolder]             = useState(null);

  const [showAddWorkModal, setShowAddWorkModal]       = useState(false);
  const [showEditWorkModal, setShowEditWorkModal]     = useState(false);
  const [editingWork, setEditingWork]                 = useState(null);
  const [editingWorkFileObj, setEditingWorkFileObj]   = useState(null);

  const [deleteConfirmModal, setDeleteConfirmModal]   = useState({
    isOpen: false,
    type: null, // 'folder' | 'work'
    id: null,
    title: '',
    message: ''
  });

  const [activePreviewWork, setActivePreviewWork]     = useState(null); // Modal de visualización
  const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);

  // Formulario Nuevo Cliente / Carpeta
  const [newFolder, setNewFolder] = useState({
    name: '',
    assignedUsers: ['grupoconsultio'], // Multi-usuario por defecto con el admin
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

  // ═══════════════════════════════════════════════════════════════
  // INTEGRACIÓN CON GITHUB (Idéntica al proyecto de referencia)
  // ═══════════════════════════════════════════════════════════════
  const [githubToken, setGithubToken]         = useState(() => sessionStorage.getItem('github_token') || localStorage.getItem('github_token') || '');
  const [githubUser, setGithubUser]           = useState(() => sessionStorage.getItem('github_user') || localStorage.getItem('github_user') || '');
  const [githubRepos, setGithubRepos]         = useState([]);
  const [githubBranches, setGithubBranches]   = useState(['main']);
  const [isLoadingRepos, setIsLoadingRepos]   = useState(false);
  const [isLoadingBranches, setIsLoadingBranches] = useState(false);
  const [showGithubConnectModal, setShowGithubConnectModal] = useState(false);
  const [tokenInput, setTokenInput]           = useState('');
  const [tokenError, setTokenError]           = useState('');

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

    // Cargar Usuarios
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setAppUsers(list);
        localStorage.setItem('appUsers', JSON.stringify(list));
      } catch (err) {
        setAppUsers(JSON.parse(localStorage.getItem('appUsers') || '[]'));
      }
    };

    // Cargar Carpetas de Clientes (con migración de las dos carpetas base)
    const fetchFolders = async () => {
      try {
        const snap = await getDocs(collection(db, 'client_folders'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        // Merge asegurando CONSULTIO y Municipalidad de Río Cuarto
        const merged = [...INITIAL_CLIENT_FOLDERS];
        list.forEach(item => {
          if (!merged.some(m => m.id === item.id || m.name === item.name)) {
            merged.push(item);
          }
        });

        setClientFolders(merged);
        localStorage.setItem('clientFolders', JSON.stringify(merged));
      } catch (err) {
        const stored = JSON.parse(localStorage.getItem('clientFolders') || '[]');
        const merged = [...INITIAL_CLIENT_FOLDERS];
        stored.forEach(item => {
          if (!merged.some(m => m.id === item.id || m.name === item.name)) {
            merged.push(item);
          }
        });
        setClientFolders(merged);
      }
    };

    // Cargar Trabajos
    const fetchWorks = async () => {
      try {
        const snap = await getDocs(collection(db, 'client_works'));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        
        const merged = [...INITIAL_CLIENT_WORKS];
        list.forEach(item => {
          if (!merged.some(m => m.id === item.id || m.title === item.title)) {
            merged.push(item);
          }
        });

        setClientWorks(merged);
        localStorage.setItem('clientWorks', JSON.stringify(merged));
      } catch (err) {
        const stored = JSON.parse(localStorage.getItem('clientWorks') || '[]');
        const merged = [...INITIAL_CLIENT_WORKS];
        stored.forEach(item => {
          if (!merged.some(m => m.id === item.id || m.title === item.title)) {
            merged.push(item);
          }
        });
        setClientWorks(merged);
      }
    };

    fetchUsers();
    fetchFolders();
    fetchWorks();
  }, [navigate]);

  // Si hay token de GitHub, cargar los repositorios al iniciar
  useEffect(() => {
    if (githubToken) {
      loadGitHubRepos(githubToken);
    }
  }, [githubToken]);

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
  // FUNCIONES DE GITHUB (API REST DIRECTA + AUTENTICACIÓN)
  // ═══════════════════════════════════════════════════════════════
  const loadGitHubRepos = async (token) => {
    if (!token) return;
    setIsLoadingRepos(true);
    try {
      const res = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (!res.ok) throw new Error('No se pudieron obtener los repositorios.');
      const repos = await res.json();
      setGithubRepos(repos);
      if (repos.length > 0 && !newWork.githubRepo) {
        setNewWork(prev => ({ ...prev, githubRepo: repos[0].full_name }));
        loadGitHubBranches(token, repos[0].full_name);
      }
    } catch (err) {
      console.warn('Error cargando repositorios:', err.message);
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const loadGitHubBranches = async (token, repoFullName) => {
    if (!token || !repoFullName) return;
    setIsLoadingBranches(true);
    try {
      const res = await fetch(`https://api.github.com/repos/${repoFullName}/branches`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (res.ok) {
        const branches = await res.json();
        const branchNames = branches.map(b => b.name);
        setGithubBranches(branchNames.length > 0 ? branchNames : ['main']);
        if (branchNames.length > 0 && !branchNames.includes(newWork.githubBranch)) {
          setNewWork(prev => ({ ...prev, githubBranch: branchNames.includes('main') ? 'main' : branchNames[0] }));
        }
      }
    } catch (err) {
      console.warn('Error cargando ramas:', err);
      setGithubBranches(['main']);
    } finally {
      setIsLoadingBranches(false);
    }
  };

  const handleConnectGitHub = async (e) => {
    e?.preventDefault();
    const token = tokenInput.trim();
    if (!token) {
      setTokenError('Por favor ingresa un Personal Access Token de GitHub.');
      return;
    }

    setTokenError('');
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });
      if (!res.ok) throw new Error('Token inválido o sin permisos.');
      const user = await res.json();
      const login = user.login || 'usuario';

      setGithubToken(token);
      setGithubUser(login);
      sessionStorage.setItem('github_token', token);
      sessionStorage.setItem('github_user', login);
      localStorage.setItem('github_token', token);
      localStorage.setItem('github_user', login);

      setShowGithubConnectModal(false);
      setTokenInput('');
      await loadGitHubRepos(token);
    } catch (err) {
      setTokenError(err.message || 'Error al autenticar con GitHub.');
    }
  };

  const handleDisconnectGitHub = () => {
    setGithubToken('');
    setGithubUser('');
    setGithubRepos([]);
    sessionStorage.removeItem('github_token');
    sessionStorage.removeItem('github_user');
    localStorage.removeItem('github_token');
    localStorage.removeItem('github_user');
  };

  // ═══════════════════════════════════════════════════════════════
  // GESTIÓN DE CLIENTES / CARPETAS (MULTI-USUARIO Y ADMIN)
  // ═══════════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════════
  // GESTIÓN DE CLIENTES / CARPETAS (MULTI-USUARIO Y ADMIN)
  // ═══════════════════════════════════════════════════════════════
  const toggleUserInFolder = (userToToggle, isEdit = false) => {
    if (isEdit) {
      setEditingFolder(prev => {
        if (!prev) return prev;
        const current = prev.assignedUsers || [];
        const exists = current.includes(userToToggle);
        const updated = exists ? current.filter(u => u !== userToToggle) : [...current, userToToggle];
        return { ...prev, assignedUsers: updated };
      });
    } else {
      setNewFolder(prev => {
        const exists = prev.assignedUsers.includes(userToToggle);
        return {
          ...prev,
          assignedUsers: exists
            ? prev.assignedUsers.filter(u => u !== userToToggle)
            : [...prev.assignedUsers, userToToggle]
        };
      });
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolder.name.trim()) return;

    // Asegurar que al menos el admin esté incluido si no se seleccionó ninguno
    const assigned = newFolder.assignedUsers.length > 0 ? newFolder.assignedUsers : ['grupoconsultio'];

    const folderObj = {
      name: newFolder.name.trim(),
      assignedUsers: assigned,
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
      try { localStorage.setItem('clientFolders', JSON.stringify(updated)); } catch (e) {}
    } catch (err) {
      const created = { ...folderObj, id: `folder-${Date.now()}` };
      const updated = [created, ...clientFolders];
      setClientFolders(updated);
      try { localStorage.setItem('clientFolders', JSON.stringify(updated)); } catch (e) {}
    }

    setNewFolder({ name: '', assignedUsers: ['grupoconsultio'], industry: '', description: '' });
    setShowAddFolderModal(false);
  };

  const handleOpenEditFolder = (folder, e) => {
    e?.stopPropagation();
    const assigned = folder.assignedUsers || [folder.assignedUser || 'grupoconsultio'];
    setEditingFolder({
      ...folder,
      assignedUsers: assigned
    });
    setShowEditFolderModal(true);
  };

  const handleUpdateFolder = async (e) => {
    e.preventDefault();
    if (!editingFolder || !editingFolder.name.trim()) return;

    const assigned = editingFolder.assignedUsers?.length > 0 ? editingFolder.assignedUsers : ['grupoconsultio'];
    const updatedData = {
      name: editingFolder.name.trim(),
      industry: editingFolder.industry?.trim() || 'General',
      description: editingFolder.description?.trim() || '',
      assignedUsers: assigned,
      updatedAt: new Date().toISOString()
    };

    try {
      await updateDoc(doc(db, 'client_folders', editingFolder.id), updatedData);
    } catch (err) {
      console.warn('Error actualizando carpeta en Firestore:', err);
    }

    const updatedFolders = clientFolders.map(f => f.id === editingFolder.id ? { ...f, ...updatedData } : f);
    setClientFolders(updatedFolders);
    try { localStorage.setItem('clientFolders', JSON.stringify(updatedFolders)); } catch (e) {}

    if (selectedFolder?.id === editingFolder.id) {
      setSelectedFolder({ ...selectedFolder, ...updatedData });
    }

    setShowEditFolderModal(false);
    setEditingFolder(null);
  };

  const handleRequestDeleteFolder = (folder, e) => {
    e?.stopPropagation();
    setDeleteConfirmModal({
      isOpen: true,
      type: 'folder',
      id: folder.id,
      title: '¿Eliminar Carpeta de Cliente?',
      message: `Estás a punto de eliminar permanentemente la carpeta "${folder.name}". Se eliminarán también todos los trabajos e informes asociados.`
    });
  };

  const handleRequestDeleteWork = (work, e) => {
    e?.stopPropagation();
    setDeleteConfirmModal({
      isOpen: true,
      type: 'work',
      id: work.id,
      title: '¿Eliminar Trabajo?',
      message: `¿Estás seguro de que deseas eliminar permanentemente el trabajo "${work.title}"?`
    });
  };

  const handleConfirmDelete = async () => {
    const { type, id } = deleteConfirmModal;
    if (!type || !id) return;

    if (type === 'folder') {
      try {
        await deleteDoc(doc(db, 'client_folders', id));
      } catch (err) {
        console.warn('Error eliminando carpeta en Firestore:', err);
      }

      const updatedFolders = clientFolders.filter(f => f.id !== id);
      setClientFolders(updatedFolders);
      try { localStorage.setItem('clientFolders', JSON.stringify(updatedFolders)); } catch (e) {}

      const updatedWorks = clientWorks.filter(w => w.clientFolderId !== id);
      setClientWorks(updatedWorks);
      try { localStorage.setItem('clientWorks', JSON.stringify(updatedWorks)); } catch (e) {}

      if (selectedFolder?.id === id) {
        setSelectedFolder(null);
      }
    } else if (type === 'work') {
      try {
        await deleteDoc(doc(db, 'client_works', id));
      } catch (err) {
        console.warn('Error eliminando trabajo en Firestore:', err);
      }

      const updated = clientWorks.filter(w => w.id !== id);
      setClientWorks(updated);
      try { localStorage.setItem('clientWorks', JSON.stringify(updated)); } catch (e) {}

      if (activePreviewWork?.id === id) {
        setActivePreviewWork(null);
      }
    }

    setDeleteConfirmModal({ isOpen: false, type: null, id: null, title: '', message: '' });
  };

  // ═══════════════════════════════════════════════════════════════
  // GESTIÓN DE TRABAJOS (CARGA Y VISUALIZADOR)
  // ═══════════════════════════════════════════════════════════════
  const uploadFilePayload = async (rawFile, dataUrl, folderId) => {
    // 1. Intento principal: Subir al servidor /api/upload
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: rawFile.name, dataUrl })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.url) {
          return json.url;
        }
      }
    } catch (err) {
      console.warn('Fallo subida a servidor, intentando Storage:', err);
    }

    // 2. Intento secundario: Firebase Storage
    try {
      const filePath = `client_works/${folderId}/${Date.now()}_${rawFile.name}`;
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, rawFile);
      return await getDownloadURL(storageRef);
    } catch (err) {
      console.warn('Fallo Firebase Storage:', err);
    }

    // 3. Fallback: DataURL solo si es pequeño (< 400KB)
    if (dataUrl && dataUrl.length < 400000) {
      return dataUrl;
    }

    throw new Error('No se pudo subir el archivo. Verifica tu conexión.');
  };

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
        dataUrl: event.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    const ext = file.name.split('.').pop().toLowerCase();

    const reader = new FileReader();
    reader.onload = (event) => {
      setEditingWorkFileObj({
        name: file.name,
        size: `${sizeInMb} MB`,
        type: ext,
        rawFile: file,
        dataUrl: event.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  const handleCreateWork = async (e) => {
    e.preventDefault();
    if (!selectedFolder || !newWork.title.trim()) return;

    setIsUploading(true);

    try {
      let fileUrl = '';
      if (newWork.sourceType === 'file' && uploadedFileObj?.rawFile) {
        fileUrl = await uploadFilePayload(uploadedFileObj.rawFile, uploadedFileObj.dataUrl, selectedFolder.id);
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
        fileData: newWork.sourceType === 'file' ? fileUrl : '',
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
        try { localStorage.setItem('clientWorks', JSON.stringify(updated)); } catch (e) {}
      } catch (err) {
        const created = { ...workObj, id: `work-${Date.now()}` };
        const updated = [created, ...clientWorks];
        setClientWorks(updated);
        try { localStorage.setItem('clientWorks', JSON.stringify(updated)); } catch (e) {}
      }

      setNewWork({
        title: '',
        description: '',
        category: 'Tablero',
        sourceType: 'url',
        url: '',
        githubRepo: githubRepos[0]?.full_name || '',
        githubBranch: 'main',
        githubPath: 'index.html',
        githubUrl: ''
      });
      setUploadedFileObj(null);
      setShowAddWorkModal(false);
    } catch (err) {
      alert(`Error al guardar trabajo: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenEditWork = (work, e) => {
    e?.stopPropagation();
    setEditingWork({ ...work });
    setEditingWorkFileObj(null);
    setShowEditWorkModal(true);
  };

  const handleUpdateWork = async (e) => {
    e.preventDefault();
    if (!editingWork || !editingWork.title.trim()) return;

    setIsUploading(true);
    try {
      let fileUrl = editingWork.fileData || '';
      let fileName = editingWork.fileName || '';
      let fileType = editingWork.fileType || '';
      let fileSize = editingWork.fileSize || '';

      if (editingWork.sourceType === 'file' && editingWorkFileObj?.rawFile) {
        fileUrl = await uploadFilePayload(editingWorkFileObj.rawFile, editingWorkFileObj.dataUrl, editingWork.clientFolderId);
        fileName = editingWorkFileObj.name;
        fileType = editingWorkFileObj.type;
        fileSize = editingWorkFileObj.size;
      }

      const updatedData = {
        title: editingWork.title.trim(),
        description: editingWork.description?.trim() || '',
        category: editingWork.category || 'Tablero',
        sourceType: editingWork.sourceType,
        url: editingWork.sourceType === 'url' ? (editingWork.url || '').trim() : '',
        fileName: editingWork.sourceType === 'file' ? fileName : '',
        fileType: editingWork.sourceType === 'file' ? fileType : '',
        fileSize: editingWork.sourceType === 'file' ? fileSize : '',
        fileData: editingWork.sourceType === 'file' ? fileUrl : '',
        githubRepo: editingWork.sourceType === 'github' ? (editingWork.githubRepo || '').trim() : '',
        githubBranch: editingWork.sourceType === 'github' ? ((editingWork.githubBranch || '').trim() || 'main') : '',
        githubPath: editingWork.sourceType === 'github' ? ((editingWork.githubPath || '').trim() || 'index.html') : '',
        updatedAt: new Date().toISOString()
      };

      try {
        await updateDoc(doc(db, 'client_works', editingWork.id), updatedData);
      } catch (err) {
        console.warn('Error actualizando trabajo en Firestore:', err);
      }

      const updatedWorks = clientWorks.map(w => w.id === editingWork.id ? { ...w, ...updatedData } : w);
      setClientWorks(updatedWorks);
      try { localStorage.setItem('clientWorks', JSON.stringify(updatedWorks)); } catch (e) {}

      if (activePreviewWork?.id === editingWork.id) {
        setActivePreviewWork({ ...activePreviewWork, ...updatedData });
      }

      setShowEditWorkModal(false);
      setEditingWork(null);
      setEditingWorkFileObj(null);
    } catch (err) {
      alert(`Error al actualizar trabajo: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════
  // GESTIÓN DE USUARIOS
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
      alert(`¡Usuario "${cleanName}" creado exitosamente! Ahora puedes asignarle carpetas en "Trabajos".`);
    } catch (err) {
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
  // FILTRADO Y PERMISOS
  // ═══════════════════════════════════════════════════════════════
  const navItems = userRole === 'lector'
    ? [{ key: 'works', label: 'Trabajos', icon: Briefcase }]
    : [
        { key: 'works', label: 'Trabajos', icon: Briefcase },
        { key: 'users', label: 'Usuarios', icon: ShieldCheck }
      ];

  // Carpetas accesibles para el usuario actual
  const accessibleFolders = clientFolders.filter(folder => {
    if (userRole === 'administrador') return true;
    const usersList = folder.assignedUsers || [folder.assignedUser || ''];
    return usersList.includes(userName) || usersList.includes('todos');
  });

  const filteredFolders = accessibleFolders.filter(f => {
    const q = folderSearch.toLowerCase();
    const assignedStr = (f.assignedUsers || [f.assignedUser || '']).join(' ').toLowerCase();
    return (
      (f.name || '').toLowerCase().includes(q) ||
      (f.industry || '').toLowerCase().includes(q) ||
      assignedStr.includes(q)
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

  const tabLabel = navItems.find(n => n.key === activeTab)?.label ?? 'Trabajos';

  // Renderizar icono por tipo de trabajo
  // Renderizar icono por tipo de trabajo
  const renderWorkIcon = (work) => {
    if (work.sourceType === 'github') {
      return (
        <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
          <Sparkles size={20} />
        </div>
      );
    }
    if (work.sourceType === 'url') {
      return (
        <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-cyan)]/15 border border-[var(--color-brand-cyan)]/30 flex items-center justify-center text-[var(--color-brand-cyan)]">
          <Globe size={20} />
        </div>
      );
    }
    const ext = (work.fileType || '').toLowerCase();
    if (['xlsx', 'xls', 'csv'].includes(ext)) {
      return (
        <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <FileSpreadsheet size={20} />
        </div>
      );
    }
    if (ext === 'pdf') {
      return (
        <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <FileText size={20} />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
        <File size={20} />
      </div>
    );
  };

  // Helper para generar URL de visualización desplegada en servidor para tableros
  const getWorkDeployUrl = (work) => {
    if (!work) return '';
    if (work.sourceType === 'url') return work.url;
    if (work.sourceType === 'github') {
      const rawRepo = (work.githubRepo || '').trim();
      const cleanRepo = rawRepo
        .replace(/^https?:\/\/github\.com\//i, '')
        .replace(/^git@github\.com:/i, '')
        .replace(/\.git$/i, '');
      const parts = cleanRepo.split('/').filter(Boolean);
      const owner = parts[0] || 'grupoconsultio';
      const repo = parts[1] || '';
      const branch = (work.githubBranch || 'main').trim();
      const filePath = (work.githubPath || 'index.html').trim();
      
      const savedToken = typeof localStorage !== 'undefined'
        ? (localStorage.getItem('github_token') || sessionStorage.getItem('github_token') || '')
        : '';
      const tokenQuery = savedToken ? `?token=${encodeURIComponent(savedToken)}` : '';
      
      const safePath = filePath.split('/').map(segment => encodeURIComponent(segment)).join('/');
      return `/api/github/proxy/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/${encodeURIComponent(branch)}/${safePath}${tokenQuery}`;
    }
    return '';
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
          <button className="lg:hidden p-1 text-brand-secondary hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* User Card Header */}
        <div className="mb-6 p-3 rounded-xl bg-[#131B2E] border border-white/10 flex items-center gap-3">
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
          
          {/* Header Superior */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold text-white flex items-center gap-3">
                {activeTab === 'works' && <Briefcase className="text-[var(--color-brand-cyan)]" size={28} />}
                {activeTab === 'users' && <ShieldCheck className="text-purple-400" size={28} />}
                <span>{tabLabel}</span>
              </h1>
              <p className="text-sm text-brand-secondary mt-1">
                {activeTab === 'works' && 'Gestión de carpetas de clientes, tableros interactivos y entrega de trabajos.'}
                {activeTab === 'users' && 'Administración de cuentas de acceso, credenciales y asignación de permisos.'}
              </p>
            </div>
            
            {activeTab === 'works' && userRole === 'administrador' && !selectedFolder && (
              <button
                onClick={() => setShowAddFolderModal(true)}
                className="btn-primary flex items-center gap-2 self-start sm:self-auto shadow-lg shadow-[var(--color-brand-cyan)]/15"
              >
                <FolderPlus size={18} /> Agregar Cliente
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
                  {/* Barra de Búsqueda */}
                  <div className="glass-elevated rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full sm:w-80">
                      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar cliente, sector o usuario..."
                        value={folderSearch}
                        onChange={(e) => setFolderSearch(e.target.value)}
                        className="w-full bg-[#131B2E] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors text-white"
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
                        const assignedList = folder.assignedUsers || [folder.assignedUser || 'todos'];

                        return (
                          <motion.div
                            key={folder.id}
                            whileHover={{ y: -4 }}
                            onClick={() => setSelectedFolder(folder)}
                            className="glass-elevated rounded-2xl p-6 flex flex-col justify-between border border-white/10 relative group hover:border-[var(--color-brand-cyan)]/50 transition-all cursor-pointer shadow-lg hover:shadow-[var(--color-brand-cyan)]/5"
                          >
                            <div>
                              <div className="flex items-start justify-between mb-4 gap-2">
                                <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-cyan)]/15 border border-[var(--color-brand-cyan)]/30 flex items-center justify-center text-[var(--color-brand-cyan)] group-hover:scale-105 transition-transform flex-shrink-0">
                                  <Folder size={24} />
                                </div>
                                <div className="flex flex-wrap gap-1 justify-end max-w-[200px]">
                                  {assignedList.map(u => (
                                    <span key={u} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 flex items-center gap-1">
                                      <Users size={10} className="text-[var(--color-brand-cyan)]" /> @{u}
                                    </span>
                                  ))}
                                </div>
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
                                  <>
                                    <button
                                      onClick={(e) => handleOpenEditFolder(folder, e)}
                                      className="p-2 text-slate-400 hover:text-[var(--color-brand-cyan)] hover:bg-[var(--color-brand-cyan)]/10 rounded-lg transition-colors"
                                      title="Editar carpeta de cliente"
                                    >
                                      <Pencil size={15} />
                                    </button>
                                    <button
                                      onClick={(e) => handleRequestDeleteFolder(folder, e)}
                                      className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-colors"
                                      title="Eliminar carpeta de cliente"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </>
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
                  {/* Barra Superior de Carpeta */}
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
                          <div className="flex flex-wrap items-center gap-2 text-xs text-brand-secondary mt-0.5">
                            <span className="text-[var(--color-brand-cyan)] font-medium">{selectedFolder.industry}</span>
                            <span>•</span>
                            <span>Acceso para: </span>
                            {(selectedFolder.assignedUsers || [selectedFolder.assignedUser || 'todos']).map(u => (
                              <span key={u} className="px-2 py-0.5 bg-white/5 rounded text-[11px] text-white font-medium border border-white/10">
                                @{u}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Botón Cargar Trabajo y Editar Carpeta */}
                    {userRole === 'administrador' && (
                      <div className="flex items-center gap-2 self-start md:self-auto">
                        <button
                          onClick={(e) => handleOpenEditFolder(selectedFolder, e)}
                          className="px-3.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white border border-white/10 flex items-center gap-2 text-xs font-semibold transition-colors"
                        >
                          <Pencil size={15} className="text-[var(--color-brand-cyan)]" /> Editar Carpeta
                        </button>
                        <button
                          onClick={() => setShowAddWorkModal(true)}
                          className="btn-primary flex items-center gap-2 py-3 px-5 text-sm shadow-lg shadow-[var(--color-brand-cyan)]/20"
                        >
                          <Plus size={18} /> Cargar Trabajo
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Filtros de Trabajos */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      {[
                        { id: 'todos', label: 'Todos los Trabajos', icon: Layers },
                        { id: 'file', label: 'Archivos (PDF/Excel/TXT)', icon: FileText },
                        { id: 'url', label: 'Enlaces Web / Tableros', icon: Globe },
                        { id: 'github', label: 'Tableros Desplegados', icon: Sparkles }
                      ].map(tab => {
                        const Icon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => setWorkFilter(tab.id)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                              workFilter === tab.id
                                ? 'bg-[var(--color-brand-cyan)] text-black shadow-md shadow-[var(--color-brand-cyan)]/20'
                                : 'bg-[#131B2E] text-slate-400 hover:text-white border border-white/5'
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
                        className="w-full bg-[#131B2E] border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
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
                          {userRole === 'administrador'
                            ? 'Usa el botón "Cargar Trabajo" para adjuntar archivos PDF, planillas Excel, enlaces a Looker/PowerBI o repositorios de GitHub.'
                            : 'Aún no se han publicado trabajos en esta carpeta.'}
                        </p>
                        {userRole === 'administrador' && (
                          <button
                            onClick={() => setShowAddWorkModal(true)}
                            className="btn-primary mt-2 flex items-center gap-2 text-xs"
                          >
                            <Plus size={16} /> Cargar Trabajo Ahora
                          </button>
                        )}
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
                                {work.sourceType === 'file' ? (work.fileType ? work.fileType.toUpperCase() : 'ARCHIVO') : (work.sourceType === 'github' ? 'TABLERO INTERACTIVO' : 'ENLACE WEB')}
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
                              <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-[11px] text-cyan-300 flex items-center justify-between mb-4">
                                <span className="flex items-center gap-1.5 font-medium">
                                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                  Tablero Desplegado en Servidor
                                </span>
                                <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-200 rounded text-[10px] font-semibold">EN LÍNEA</span>
                              </div>
                            )}

                            {work.sourceType === 'url' && (
                              <div className="p-2.5 rounded-xl bg-[var(--color-brand-cyan)]/10 border border-[var(--color-brand-cyan)]/20 text-[11px] text-[var(--color-brand-cyan)] truncate mb-4 font-mono">
                                {work.url}
                              </div>
                            )}
                          </div>

                          {/* Acciones del Trabajo (Visualizar + Editar + Descargar + Eliminar) */}
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-2">
                            {/* Botón Principal: Visualizar en el Modal */}
                            <button
                              onClick={() => setActivePreviewWork(work)}
                              className="btn-primary flex-1 py-1.5 px-3 text-xs flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <Eye size={14} /> Visualizar
                            </button>

                            {/* Botón Editar Trabajo (solo admin) */}
                            {userRole === 'administrador' && (
                              <button
                                onClick={(e) => handleOpenEditWork(work, e)}
                                className="p-2 text-slate-400 hover:text-[var(--color-brand-cyan)] hover:bg-[var(--color-brand-cyan)]/10 rounded-lg transition-colors flex-shrink-0"
                                title="Editar trabajo"
                              >
                                <Pencil size={15} />
                              </button>
                            )}

                            {/* Botón Descargar (si es archivo) */}
                            {work.sourceType === 'file' && work.fileData && (
                              <a
                                href={work.fileData}
                                download={work.fileName || 'archivo'}
                                className="p-2 rounded-lg border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                                title="Descargar archivo"
                              >
                                <Download size={15} />
                              </a>
                            )}

                            {/* Botón Eliminar Trabajo (solo admin) */}
                            {userRole === 'administrador' && (
                              <button
                                onClick={(e) => handleRequestDeleteWork(work, e)}
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
              PESTAÑA: USUARIOS (Solo Administrador)
             ══════════════════════════════════════════════════════════ */}
          {activeTab === 'users' && userRole === 'administrador' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
              
              {/* Formulario Agregar Usuario */}
              <form onSubmit={handleAddUser} className="glass-elevated rounded-2xl p-4 md:p-6 flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-sm text-brand-secondary mb-2">Nombre de Usuario</label>
                  <input type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className={inputCls} placeholder="Ej: cliente_muni" required />
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
                    className={selectCls}
                  >
                    <option value="lector">Lector (Solo Trabajos)</option>
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
                      <th className="pb-4 font-medium">Carpetas con Acceso</th>
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
                      <td className="py-4 text-xs text-[var(--color-brand-cyan)] font-medium">
                        Todas las carpetas
                      </td>
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
                        const associatedFolders = clientFolders.filter(f => {
                          const list = f.assignedUsers || [f.assignedUser || ''];
                          return list.includes(user.username);
                        });
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
          MODAL DE VISUALIZACIÓN DE TRABAJOS (IDÉNTICO A WEB-SUBSE)
         ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {activePreviewWork && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className={`bg-[#0B0F17] border border-white/20 rounded-2xl flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
                isFullscreenPreview ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[90vh]'
              }`}
            >
              {/* Barra Superior del Visor */}
              <div className="px-5 py-3.5 border-b border-white/10 bg-[#111827] flex items-center justify-between gap-4 flex-shrink-0">
                <div className="flex items-center gap-3 min-w-0">
                  {renderWorkIcon(activePreviewWork)}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-base truncate">{activePreviewWork.title}</h3>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/10 text-[var(--color-brand-cyan)] border border-white/10 flex-shrink-0">
                        {activePreviewWork.category || (activePreviewWork.sourceType === 'github' ? 'Tablero Interactivo' : 'Trabajo')}
                      </span>
                    </div>
                    <p className="text-xs text-brand-secondary truncate">
                      {selectedFolder?.name} · {activePreviewWork.sourceType === 'file' ? activePreviewWork.fileName : (activePreviewWork.sourceType === 'github' ? 'Visualización en vivo' : activePreviewWork.url)}
                    </p>
                  </div>
                </div>

                {/* Acciones de la Barra Superior */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Botón Abrir en Nueva Pestaña (URLs y Tableros desplegados en servidor) */}
                  {(activePreviewWork.sourceType === 'url' || activePreviewWork.sourceType === 'github') && (
                    <a
                      href={getWorkDeployUrl(activePreviewWork)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white hover:bg-white/10 flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink size={14} /> <span className="hidden sm:inline">Abrir en Pestaña</span>
                    </a>
                  )}

                  {activePreviewWork.sourceType === 'file' && activePreviewWork.fileData && (
                    <a
                      href={activePreviewWork.fileData}
                      download={activePreviewWork.fileName || 'archivo'}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600/30 border border-emerald-500/40 text-xs font-semibold text-emerald-200 hover:text-white hover:bg-emerald-600/50 flex items-center gap-1.5 transition-colors"
                    >
                      <Download size={14} /> <span className="hidden sm:inline">Descargar</span>
                    </a>
                  )}

                  {/* Toggle Pantalla Completa */}
                  <button
                    onClick={() => setIsFullscreenPreview(!isFullscreenPreview)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                    title={isFullscreenPreview ? 'Salir de pantalla completa' : 'Pantalla completa'}
                  >
                    {isFullscreenPreview ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  </button>

                  {/* Cerrar Visor */}
                  <button
                    onClick={() => setActivePreviewWork(null)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-1"
                    title="Cerrar visor"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Contenedor del Visor */}
              <div className="flex-1 min-h-0 bg-[#070A10] relative overflow-hidden flex flex-col items-center justify-center">
                {/* 1. Visor de Tableros Interactivos (URLs o Despliegues de GitHub en el Servidor) */}
                {(activePreviewWork.sourceType === 'url' || activePreviewWork.sourceType === 'github') && (
                  <div className="w-full h-full relative flex flex-col bg-[#070A10]">
                    <iframe
                      src={getWorkDeployUrl(activePreviewWork)}
                      title={activePreviewWork.title}
                      className="w-full h-full border-0 bg-[#0B0F17]"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      loading="lazy"
                    />
                    {activePreviewWork.sourceType === 'url' && (
                      <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs flex items-center justify-between text-slate-300">
                        <span>¿La página no cargó en el marco integrado?</span>
                        <a
                          href={activePreviewWork.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--color-brand-cyan)] font-bold hover:underline flex items-center gap-1"
                        >
                          Abrir directamente en navegador <ExternalLink size={12} />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* 2. Visor de Archivos (PDF, TXT, Excel, etc.) */}
                {activePreviewWork.sourceType === 'file' && (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    {/* PDF */}
                    {activePreviewWork.fileType === 'pdf' ? (
                      activePreviewWork.fileData ? (
                        <iframe
                          src={activePreviewWork.fileData}
                          title={activePreviewWork.fileName}
                          className="w-full h-full border-0 rounded-xl"
                        />
                      ) : (
                        <div className="text-center p-8 glass-elevated rounded-2xl max-w-md">
                          <FileText size={48} className="mx-auto text-rose-400 mb-3" />
                          <h4 className="text-lg font-bold text-white mb-2">{activePreviewWork.fileName}</h4>
                          <p className="text-xs text-slate-400 mb-4">{activePreviewWork.fileSize || 'Documento PDF'}</p>
                          <a
                            href={activePreviewWork.fileData}
                            download={activePreviewWork.fileName}
                            className="btn-primary inline-flex items-center gap-2 text-xs"
                          >
                            <Download size={14} /> Descargar Archivo PDF
                          </a>
                        </div>
                      )
                    ) : (
                      /* Otros archivos (Excel, Word, CSV, ZIP) */
                      <div className="text-center p-8 glass-elevated rounded-2xl max-w-lg border border-white/10">
                        {renderWorkIcon(activePreviewWork)}
                        <h4 className="text-xl font-bold text-white my-3">{activePreviewWork.fileName}</h4>
                        <p className="text-sm text-slate-300 mb-2">{activePreviewWork.description}</p>
                        <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs text-slate-400 mb-6 flex justify-around">
                          <span>Formato: <strong className="text-white">.{activePreviewWork.fileType?.toUpperCase()}</strong></span>
                          <span>Tamaño: <strong className="text-white">{activePreviewWork.fileSize || '—'}</strong></span>
                        </div>
                        {activePreviewWork.fileData && (
                          <a
                            href={activePreviewWork.fileData}
                            download={activePreviewWork.fileName}
                            className="btn-primary inline-flex items-center gap-2 text-sm shadow-lg shadow-[var(--color-brand-cyan)]/15"
                          >
                            <Download size={16} /> Descargar Archivo para Abrir
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: AGREGAR CLIENTE / CREAR CARPETA (MULTI-USUARIO)
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
                  <p className="text-xs text-brand-secondary">Asocia esta carpeta a uno o más usuarios creados en "Usuarios" (incluyendo al Administrador).</p>
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
                    placeholder="Ej: CONSULTIO o Municipalidad de Río Cuarto"
                    required
                  />
                </div>

                {/* Selección Múltiple de Usuarios Asociados */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Usuarios con Acceso a esta Carpeta (Selección Múltiple) <span className="text-rose-400">*</span>
                  </label>
                  
                  {/* Selector chips multi-usuario */}
                  <div className="p-3 rounded-xl bg-[#131B2E] border border-white/10 flex flex-col gap-2 max-h-48 overflow-y-auto">
                    {/* Opción 1: Super-Admin grupoconsultio */}
                    <label
                      onClick={() => toggleUserInFolder('grupoconsultio')}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                        newFolder.assignedUsers.includes('grupoconsultio')
                          ? 'bg-[var(--color-brand-cyan)]/15 border border-[var(--color-brand-cyan)]/40 text-white font-semibold'
                          : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-xs">
                        <ShieldCheck size={14} className="text-purple-400" />
                        <span>@grupoconsultio (Administrador / Dueño)</span>
                      </span>
                      {newFolder.assignedUsers.includes('grupoconsultio') && (
                        <Check size={14} className="text-[var(--color-brand-cyan)]" />
                      )}
                    </label>

                    {/* Opción 2: Todos los usuarios */}
                    <label
                      onClick={() => toggleUserInFolder('todos')}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                        newFolder.assignedUsers.includes('todos')
                          ? 'bg-purple-500/20 border border-purple-500/40 text-purple-200 font-semibold'
                          : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-xs">
                        <Globe size={14} className="text-purple-400" />
                        <span>Todos los usuarios (Acceso general / Público)</span>
                      </span>
                      {newFolder.assignedUsers.includes('todos') && (
                        <Check size={14} className="text-purple-400" />
                      )}
                    </label>

                    {/* Lista de usuarios registrados de appUsers */}
                    {appUsers.map(u => (
                      <label
                        key={u.id}
                        onClick={() => toggleUserInFolder(u.username)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                          newFolder.assignedUsers.includes(u.username)
                            ? 'bg-[var(--color-brand-cyan)]/15 border border-[var(--color-brand-cyan)]/40 text-white font-semibold'
                            : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="flex items-center gap-2 text-xs">
                          <Users size={14} className="text-[var(--color-brand-cyan)]" />
                          <span>@{u.username} <span className="text-[10px] text-slate-400 font-normal">({u.role})</span></span>
                        </span>
                        {newFolder.assignedUsers.includes(u.username) && (
                          <Check size={14} className="text-[var(--color-brand-cyan)]" />
                        )}
                      </label>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1">
                    Usuarios seleccionados ({newFolder.assignedUsers.length}):{' '}
                    <strong className="text-[var(--color-brand-cyan)]">
                      {newFolder.assignedUsers.map(u => `@${u}`).join(', ')}
                    </strong>
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
                    rows={2}
                    value={newFolder.description}
                    onChange={(e) => setNewFolder({ ...newFolder, description: e.target.value })}
                    className={inputCls}
                    placeholder="Detalles sobre el proyecto o alcance de la carpeta..."
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
          MODAL: CARGAR TRABAJO (ENLACE, ARCHIVO, GITHUB CON BOTÓN)
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
                    Carpeta: <strong className="text-white">{selectedFolder.name}</strong>
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateWork} className="flex flex-col gap-4">
                {/* Título y Categoría */}
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
                    placeholder="Breve resumen del entregable..."
                  />
                </div>

                {/* Selector visual de Tipo de Fuente */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Tipo de Fuente / Origen del Trabajo <span className="text-rose-400">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* Enlace Web */}
                    <label
                      onClick={() => setNewWork({ ...newWork, sourceType: 'url' })}
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        newWork.sourceType === 'url'
                          ? 'bg-[var(--color-brand-cyan)]/15 border-[var(--color-brand-cyan)] shadow-md shadow-[var(--color-brand-cyan)]/10 text-white'
                          : 'bg-[#131B2E] border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Globe size={16} className={newWork.sourceType === 'url' ? 'text-[var(--color-brand-cyan)]' : 'text-slate-400'} />
                        <span className="font-semibold text-xs">Enlace Web</span>
                      </div>
                      <span className="text-[10px] text-slate-400">PowerBI, Looker, URL</span>
                    </label>

                    {/* Subir Archivo */}
                    <label
                      onClick={() => setNewWork({ ...newWork, sourceType: 'file' })}
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        newWork.sourceType === 'file'
                          ? 'bg-[var(--color-brand-cyan)]/15 border-[var(--color-brand-cyan)] shadow-md shadow-[var(--color-brand-cyan)]/10 text-white'
                          : 'bg-[#131B2E] border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <UploadCloud size={16} className={newWork.sourceType === 'file' ? 'text-[var(--color-brand-cyan)]' : 'text-slate-400'} />
                        <span className="font-semibold text-xs">Subir Archivo</span>
                      </div>
                      <span className="text-[10px] text-slate-400">PDF, Excel, TXT, ZIP</span>
                    </label>

                    {/* GitHub */}
                    <label
                      onClick={() => setNewWork({ ...newWork, sourceType: 'github' })}
                      className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                        newWork.sourceType === 'github'
                          ? 'bg-purple-500/15 border-purple-400 shadow-md shadow-purple-500/10 text-white'
                          : 'bg-[#131B2E] border-white/10 text-slate-400 hover:border-white/20 hover:bg-white/5'
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

                {/* ── TIPO URL ── */}
                {newWork.sourceType === 'url' && (
                  <div className="p-4 rounded-xl bg-[#131B2E] border border-white/10 flex flex-col gap-2">
                    <label className="block text-xs font-semibold text-slate-300">
                      URL del Enlace o Iframe <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={newWork.url}
                      onChange={(e) => setNewWork({ ...newWork, url: e.target.value })}
                      className={inputCls}
                      placeholder="https://lookerstudio.google.com/... o /mapa o /admin/encuesta-papa"
                      required={newWork.sourceType === 'url'}
                    />
                    <p className="text-[11px] text-slate-400">
                      Pega aquí enlaces externos (Looker Studio, PowerBI, Google Sheets) o rutas internas (/mapa, /admin/encuesta-papa).
                    </p>
                  </div>
                )}

                {/* ── TIPO ARCHIVO ── */}
                {newWork.sourceType === 'file' && (
                  <div className="p-4 rounded-xl bg-[#131B2E] border border-white/10 flex flex-col gap-3">
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

                {/* ── TIPO GITHUB (CONEXIÓN Y SELECTORES IDÉNTICOS A WEB-SUBSE) ── */}
                {newWork.sourceType === 'github' && (
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col gap-3.5">
                    {/* Header y Botón Conectar */}
                    <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
                      <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                        <FileCode size={16} /> Repositorio GitHub
                      </span>

                      {/* Estado de Conexión */}
                      <div>
                        {githubToken && githubUser ? (
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30 text-xs">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                              @{githubUser}
                            </span>
                            <button
                              type="button"
                              onClick={handleDisconnectGitHub}
                              className="text-xs text-rose-400 hover:underline font-medium"
                            >
                              Desconectar
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowGithubConnectModal(true)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-black text-white font-bold rounded-lg transition text-xs flex items-center gap-1.5 shadow-sm border border-white/20"
                          >
                            <FileCode size={13} /> Conectar con GitHub
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Si está conectado: Controles dinámicos de Repositorio y Ramas */}
                    {githubToken && githubUser ? (
                      <div className="flex flex-col gap-3">
                        {/* Selector de Repositorios */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-medium text-slate-300">
                              Seleccionar Repositorio <span className="text-rose-400">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => loadGitHubRepos(githubToken)}
                              disabled={isLoadingRepos}
                              className="text-[11px] text-[var(--color-brand-cyan)] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                            >
                              <RefreshCw size={11} className={isLoadingRepos ? 'animate-spin' : ''} />
                              Recargar lista
                            </button>
                          </div>

                          <select
                            value={newWork.githubRepo}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNewWork(prev => ({ ...prev, githubRepo: val }));
                              loadGitHubBranches(githubToken, val);
                            }}
                            className={selectCls}
                            required={newWork.sourceType === 'github'}
                          >
                            {isLoadingRepos ? (
                              <option value="">Cargando repositorios de GitHub...</option>
                            ) : githubRepos.length === 0 ? (
                              <option value="">No se encontraron repositorios</option>
                            ) : (
                              githubRepos.map(r => (
                                <option key={r.id} value={r.full_name}>
                                  {r.full_name} {r.private ? '🔒' : '🌐'}
                                </option>
                              ))
                            )}
                          </select>
                        </div>

                        {/* Rama y Ruta del archivo */}
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Rama (Branch)
                            </label>
                            <select
                              value={newWork.githubBranch}
                              onChange={(e) => setNewWork(prev => ({ ...prev, githubBranch: e.target.value }))}
                              className={selectCls}
                            >
                              {isLoadingBranches ? (
                                <option value="main">Cargando ramas...</option>
                              ) : (
                                githubBranches.map(b => (
                                  <option key={b} value={b}>{b}</option>
                                ))
                              )}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-300 mb-1">
                              Ruta del archivo
                            </label>
                            <input
                              type="text"
                              value={newWork.githubPath}
                              onChange={(e) => setNewWork(prev => ({ ...prev, githubPath: e.target.value }))}
                              className={inputCls}
                              placeholder="index.html"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Si aún no conectó con GitHub */
                      <div className="p-4 rounded-xl bg-purple-900/20 border border-purple-500/20 text-center flex flex-col items-center gap-2">
                        <p className="text-xs text-purple-200">
                          Haz clic en <strong>"Conectar con GitHub"</strong> para seleccionar directamente tus repositorios y ramas disponibles.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowGithubConnectModal(true)}
                          className="btn-primary py-1.5 px-4 text-xs flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white"
                        >
                          <FileCode size={14} /> Conectar Cuenta de GitHub
                        </button>
                      </div>
                    )}
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

      {/* ══════════════════════════════════════════════════════════════
          MODAL: CONECTAR TOKEN DE GITHUB (POPUP IDÉNTICO AL EJEMPLO)
         ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showGithubConnectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0F172A] border border-purple-500/40 rounded-2xl p-6 shadow-2xl relative"
            >
              <button
                onClick={() => setShowGithubConnectModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <FileCode size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Conectar con GitHub</h3>
                  <p className="text-xs text-purple-300">Vinculación de cuenta para explorar repositorios y ramas.</p>
                </div>
              </div>

              <form onSubmit={handleConnectGitHub} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    GitHub Personal Access Token (PAT) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className={inputCls}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    required
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Permite leer tus repositorios públicos y privados con seguridad sin salir del administrador.
                  </p>
                </div>

                {tokenError && (
                  <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle size={15} />
                    <span>{tokenError}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowGithubConnectModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary py-2 px-5 text-xs flex items-center gap-1.5 bg-purple-600 hover:bg-purple-500 text-white"
                  >
                    <Check size={14} /> Conectar Cuenta
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: POPUP DE CONFIRMACIÓN DE ELIMINACIÓN
         ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {deleteConfirmModal.isOpen && (
          <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0F172A] border border-rose-500/30 rounded-2xl p-6 shadow-2xl relative flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
                <AlertTriangle size={28} />
              </div>

              <h3 className="text-lg font-bold text-white mb-2">
                {deleteConfirmModal.title}
              </h3>
              <p className="text-xs text-slate-300 mb-6 leading-relaxed">
                {deleteConfirmModal.message}
              </p>

              <div className="flex items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmModal({ isOpen: false, type: null, id: null, title: '', message: '' })}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-1.5"
                >
                  <Trash2 size={14} /> Eliminar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: EDITAR CARPETA DE CLIENTE
         ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showEditFolderModal && editingFolder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => { setShowEditFolderModal(false); setEditingFolder(null); }}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-cyan)]/20 border border-[var(--color-brand-cyan)]/40 flex items-center justify-center text-[var(--color-brand-cyan)]">
                  <Pencil size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Editar Carpeta de Cliente</h3>
                  <p className="text-xs text-brand-secondary">Modifica nombre, sector y asignación de usuarios.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateFolder} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nombre del Cliente / Carpeta <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingFolder.name}
                    onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                    className={inputCls}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Usuarios con Acceso (Selección Múltiple) <span className="text-rose-400">*</span>
                  </label>
                  <div className="p-3 rounded-xl bg-[#131B2E] border border-white/10 flex flex-col gap-2 max-h-48 overflow-y-auto">
                    {/* Super admin */}
                    <label
                      onClick={() => toggleUserInFolder('grupoconsultio', true)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                        (editingFolder.assignedUsers || []).includes('grupoconsultio')
                          ? 'bg-[var(--color-brand-cyan)]/15 border border-[var(--color-brand-cyan)]/40 text-white font-semibold'
                          : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-xs">
                        <ShieldCheck size={14} className="text-purple-400" />
                        <span>@grupoconsultio (Administrador / Dueño)</span>
                      </span>
                      {(editingFolder.assignedUsers || []).includes('grupoconsultio') && (
                        <Check size={14} className="text-[var(--color-brand-cyan)]" />
                      )}
                    </label>

                    {/* Todos los usuarios */}
                    <label
                      onClick={() => toggleUserInFolder('todos', true)}
                      className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                        (editingFolder.assignedUsers || []).includes('todos')
                          ? 'bg-purple-500/20 border border-purple-500/40 text-purple-200 font-semibold'
                          : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-xs">
                        <Globe size={14} className="text-purple-400" />
                        <span>Todos los usuarios (Acceso general / Público)</span>
                      </span>
                      {(editingFolder.assignedUsers || []).includes('todos') && (
                        <Check size={14} className="text-purple-400" />
                      )}
                    </label>

                    {/* Usuarios registrados */}
                    {appUsers.map(u => (
                      <label
                        key={u.id}
                        onClick={() => toggleUserInFolder(u.username, true)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                          (editingFolder.assignedUsers || []).includes(u.username)
                            ? 'bg-[var(--color-brand-cyan)]/15 border border-[var(--color-brand-cyan)]/40 text-white font-semibold'
                            : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10'
                        }`}
                      >
                        <span className="flex items-center gap-2 text-xs">
                          <Users size={14} className="text-[var(--color-brand-cyan)]" />
                          <span>@{u.username} <span className="text-[10px] text-slate-400 font-normal">({u.role})</span></span>
                        </span>
                        {(editingFolder.assignedUsers || []).includes(u.username) && (
                          <Check size={14} className="text-[var(--color-brand-cyan)]" />
                        )}
                      </label>
                    ))}
                  </div>

                  <p className="text-[11px] text-slate-400 mt-1">
                    Usuarios con acceso ({editingFolder.assignedUsers?.length || 0}):{' '}
                    <strong className="text-[var(--color-brand-cyan)]">
                      {(editingFolder.assignedUsers || []).map(u => `@${u}`).join(', ')}
                    </strong>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Sector / Industria
                  </label>
                  <input
                    type="text"
                    value={editingFolder.industry || ''}
                    onChange={(e) => setEditingFolder({ ...editingFolder, industry: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Descripción / Notas
                  </label>
                  <textarea
                    rows={3}
                    value={editingFolder.description || ''}
                    onChange={(e) => setEditingFolder({ ...editingFolder, description: e.target.value })}
                    className={textareaCls}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => { setShowEditFolderModal(false); setEditingFolder(null); }}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary py-2 px-5 text-xs flex items-center gap-1.5"
                  >
                    <Check size={14} /> Guardar Cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════
          MODAL: EDITAR TRABAJO
         ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showEditWorkModal && editingWork && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-[#0F172A] border border-white/10 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => { setShowEditWorkModal(false); setEditingWork(null); setEditingWorkFileObj(null); }}
                className="absolute top-5 right-5 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-cyan)]/20 border border-[var(--color-brand-cyan)]/40 flex items-center justify-center text-[var(--color-brand-cyan)]">
                  <Pencil size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Editar Trabajo</h3>
                  <p className="text-xs text-brand-secondary">Actualiza los datos del entregable o tablero.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateWork} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Título del Trabajo <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingWork.title}
                    onChange={(e) => setEditingWork({ ...editingWork, title: e.target.value })}
                    className={inputCls}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Categoría
                    </label>
                    <input
                      type="text"
                      value={editingWork.category || 'Tablero'}
                      onChange={(e) => setEditingWork({ ...editingWork, category: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tipo de Fuente
                    </label>
                    <input
                      type="text"
                      disabled
                      value={editingWork.sourceType === 'file' ? 'Archivo' : (editingWork.sourceType === 'github' ? 'Tablero GitHub' : 'Enlace Web')}
                      className={`${inputCls} opacity-60 cursor-not-allowed`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Descripción / Resumen
                  </label>
                  <textarea
                    rows={2}
                    value={editingWork.description || ''}
                    onChange={(e) => setEditingWork({ ...editingWork, description: e.target.value })}
                    className={textareaCls}
                  />
                </div>

                {/* Campos según tipo */}
                {editingWork.sourceType === 'url' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      URL del Tablero / Enlace <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="url"
                      value={editingWork.url || ''}
                      onChange={(e) => setEditingWork({ ...editingWork, url: e.target.value })}
                      className={inputCls}
                      required
                    />
                  </div>
                )}

                {editingWork.sourceType === 'github' && (
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Repositorio (owner/repo)
                      </label>
                      <input
                        type="text"
                        value={editingWork.githubRepo || ''}
                        onChange={(e) => setEditingWork({ ...editingWork, githubRepo: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Rama (Branch)
                        </label>
                        <input
                          type="text"
                          value={editingWork.githubBranch || 'main'}
                          onChange={(e) => setEditingWork({ ...editingWork, githubBranch: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Ruta del Archivo
                        </label>
                        <input
                          type="text"
                          value={editingWork.githubPath || 'index.html'}
                          onChange={(e) => setEditingWork({ ...editingWork, githubPath: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {editingWork.sourceType === 'file' && (
                  <div className="p-3.5 rounded-xl bg-[#131B2E] border border-white/10 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Archivo actual: <strong className="text-white">{editingWork.fileName || 'archivo'}</strong></span>
                      <span className="text-slate-400 font-mono">{editingWork.fileSize || ''}</span>
                    </div>

                    <label className="block text-xs font-medium text-slate-400 mt-1">
                      Reemplazar archivo (opcional):
                    </label>
                    <input
                      type="file"
                      onChange={handleEditFileChange}
                      accept=".pdf,.xlsx,.xls,.txt,.csv,.doc,.docx,.zip,.html,.png,.jpg,.jpeg"
                      className="text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[var(--color-brand-cyan)]/20 file:text-[var(--color-brand-cyan)] hover:file:bg-[var(--color-brand-cyan)]/30 cursor-pointer"
                    />

                    {editingWorkFileObj && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-brand-cyan)]/10 border border-[var(--color-brand-cyan)]/30 text-xs text-[var(--color-brand-cyan)]">
                        <span className="flex items-center gap-1.5 font-medium truncate">
                          <CheckCircle2 size={13} /> {editingWorkFileObj.name} ({editingWorkFileObj.size})
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 mt-4 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => { setShowEditWorkModal(false); setEditingWork(null); setEditingWorkFileObj(null); }}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-white/5"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="btn-primary py-2 px-5 text-xs flex items-center gap-1.5"
                  >
                    {isUploading ? 'Guardando...' : <><Check size={14} /> Guardar Cambios</>}
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
