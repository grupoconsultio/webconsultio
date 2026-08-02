import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem('adminAuth') === '1') {
      navigate('/admin');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanUser = username.trim();
    const cleanPass = password.trim();
    
    // Super-admin por defecto
    if (cleanUser.toLowerCase() === 'grupoconsultio' && cleanPass === 'CoNSUlt1026') {
      sessionStorage.setItem('adminAuth', '1');
      sessionStorage.setItem('userRole', 'administrador');
      sessionStorage.setItem('userName', 'grupoconsultio');
      setLoading(false);
      navigate('/admin');
      return;
    }

    try {
      // 1. Consultar Firestore en la nube
      const querySnapshot = await getDocs(collection(db, 'users'));
      const firebaseUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const foundUser = firebaseUsers.find(
        u => (u.username || '').trim().toLowerCase() === cleanUser.toLowerCase() && (u.password || '').trim() === cleanPass
      );

      if (foundUser) {
        sessionStorage.setItem('adminAuth', '1');
        sessionStorage.setItem('userRole', foundUser.role || 'lector');
        sessionStorage.setItem('userName', foundUser.username);
        setLoading(false);
        navigate('/admin');
        return;
      }
    } catch (err) {
      console.warn('Fallback a almacenamiento local por error en Firebase:', err);
    }

    // 2. Fallback a usuarios registrados en localStorage
    const appUsers = JSON.parse(localStorage.getItem('appUsers') || '[]');
    const foundLocal = appUsers.find(
      u => (u.username || '').trim().toLowerCase() === cleanUser.toLowerCase() && (u.password || '').trim() === cleanPass
    );

    if (foundLocal) {
      sessionStorage.setItem('adminAuth', '1');
      sessionStorage.setItem('userRole', foundLocal.role || 'lector');
      sessionStorage.setItem('userName', foundLocal.username);
      setLoading(false);
      navigate('/admin');
    } else {
      setLoading(false);
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm glass-elevated rounded-2xl p-8"
      >
        <div className="mb-8 text-center">
          <div className="flex flex-col leading-none items-center mb-4">
            <span className="text-sm font-display font-light tracking-[0.2em] text-brand-secondary">GRUPO</span>
            <span className="text-2xl font-display font-extrabold tracking-tight text-white">CONSULTIO</span>
          </div>
          <p className="text-brand-secondary text-sm">Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-brand-secondary mb-2">Usuario</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-secondary pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
                placeholder="Usuario"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-brand-secondary mb-2">Contraseña</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-secondary pointer-events-none" />
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-10 py-3 text-sm focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
                placeholder="Contraseña"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-secondary hover:text-white transition-colors"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Ingresar'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
