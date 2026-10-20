import React, { useState } from 'react';
import { Mail, Linkedin, Instagram, ArrowUp, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      const subs = JSON.parse(localStorage.getItem('newsletterSubs') || '[]');
      if (!subs.some(s => s.email === cleanEmail)) {
        subs.push({ email: cleanEmail, date: new Date().toISOString() });
        localStorage.setItem('newsletterSubs', JSON.stringify(subs));
      }

      try {
        await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: cleanEmail })
        });
      } catch (err) {
        // Fallback gracefully if backend is offline
      }

      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black border-t border-white/10 pt-24 pb-12 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[var(--color-brand-cyan)]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        
        {/* Big Olivia-inspired Brand Statement Banner */}
        <div className="pb-16 border-b border-white/10 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full border-2 border-white/80 flex items-center justify-center">
                <span className="w-2 h-2 rounded-full bg-[var(--color-brand-cyan)]" />
              </div>
              <span className="text-xs font-display font-bold tracking-[0.25em] text-white/50 uppercase">
                FIRMA CONSULTORA
              </span>
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-display font-black uppercase text-white tracking-tight leading-[0.95]">
              GRUPO CONSULTIO
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={scrollToTop}
              className="w-14 h-14 rounded-full border border-white/20 bg-white/5 hover:bg-white text-white hover:text-black transition-all duration-300 flex items-center justify-center group"
              aria-label="Volver arriba"
            >
              <ArrowUp size={20} className="transition-transform group-hover:-translate-y-1" />
            </button>
          </div>
        </div>

        {/* 3-Column Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 py-16 border-b border-white/10">
          
          {/* Col 1: About & Positioning */}
          <div className="lg:col-span-5">
            <p className="text-base text-white/70 font-sans leading-relaxed mb-8 max-w-sm">
              Especialistas en procesos de transformación institucional, encuestas de opinión pública, observatorios de gestión territorial y diagnósticos organizacionales en América Latina y España.
            </p>
            
            {/* Olivia-style Social Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://www.linkedin.com/in/grupoconsultio"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:border-[var(--color-brand-cyan)] hover:text-[var(--color-brand-cyan)] text-white/80 text-xs font-display font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
              >
                <Linkedin size={14} />
                <span>LinkedIn</span>
              </a>
              <a
                href="https://www.instagram.com/grupoconsultio?igsh=MTF0OGQ4a2lxc3FwZw=="
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:border-[var(--color-brand-cyan)] hover:text-[var(--color-brand-cyan)] text-white/80 text-xs font-display font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
              >
                <Instagram size={14} />
                <span>Instagram</span>
              </a>
              <a
                href="mailto:info@grupoconsultio.com"
                className="px-5 py-2.5 rounded-full border border-white/10 bg-white/5 hover:border-[var(--color-brand-cyan)] hover:text-[var(--color-brand-cyan)] text-white/80 text-xs font-display font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2"
              >
                <Mail size={14} />
                <span>Contacto</span>
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[var(--color-brand-cyan)] mb-6">
              NAVEGACIÓN //
            </h4>
            <ul className="flex flex-col gap-3 text-sm font-display font-bold uppercase tracking-wider">
              <li>
                <a href="#about" className="text-white/60 hover:text-white transition-colors flex items-center justify-between group py-1">
                  <span>Quiénes Somos</span>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a href="#services" className="text-white/60 hover:text-white transition-colors flex items-center justify-between group py-1">
                  <span>Servicios</span>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
              <li>
                <a href="#contact" className="text-white/60 hover:text-white transition-colors flex items-center justify-between group py-1">
                  <span>Contacto Directo</span>
                  <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Olivia-style Newsletter Card */}
          <div className="lg:col-span-4">
            <div className="olivia-card p-6 md:p-8 bg-white/[0.03] border-white/10">
              <h4 className="text-xs font-display font-bold uppercase tracking-[0.2em] text-[var(--color-brand-cyan)] mb-2">
                INSIGHTS & REPORTES //
              </h4>
              <p className="text-xs text-white/60 font-sans mb-6">
                Reciba mensualmente nuestros estudios de opinión pública, auditorías metodológicas y análisis de gestión.
              </p>

              {subscribed ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>¡Gracias por suscribirse a nuestros reportes!</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full bg-black/50 border border-white/10 rounded-full px-5 py-3 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
                  />
                  <button
                    type="submit"
                    className="btn-primary w-full text-xs py-3 justify-center"
                  >
                    <span>Suscribirse</span>
                    <ArrowUpRight size={14} />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-white/40">
          <div>
            © {new Date().getFullYear()} GRUPO CONSULTIO. TODOS LOS DERECHOS RESERVADOS.
          </div>
          <div className="flex items-center gap-6">
            <Link to="/terminos" className="hover:text-white transition-colors">Términos de Servicio</Link>
            <span>•</span>
            <Link to="/privacidad" className="hover:text-white transition-colors">Privacidad de Datos</Link>
            <span>•</span>
            <span className="text-[var(--color-brand-cyan)] font-bold">LATAM & ESPAÑA</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;

