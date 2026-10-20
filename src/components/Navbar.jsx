import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const navLinks = [
    { name: 'Nosotros', href: '#about' },
    { name: 'Servicios', href: '#services' },
    { name: 'Contacto', href: '#contact' },
  ];

  const handleComenzar = () => {
    setIsOpen(false);
    if (location.pathname !== '/') {
      window.location.href = '/#contact';
    } else {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLinkClick = (href) => {
    setIsOpen(false);
    if (href.startsWith('#')) {
      if (location.pathname !== '/') {
        window.location.href = `/${href}`;
      } else {
        const id = href.replace('#', '');
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'py-3.5 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)]' 
            : 'py-6 bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 md:px-12 flex justify-between items-center">
          {/* Logo with clean typography (circle removed as requested) */}
          <Link to="/" className="flex items-center group z-50">
            <div className="flex flex-col leading-none">
              <span className="text-[10px] font-display font-bold tracking-[0.25em] text-white/50 uppercase">GRUPO</span>
              <span className="text-xl md:text-2xl font-display font-black tracking-tight text-white group-hover:text-white transition-colors">
                CONSULTIO
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-9">
            {navLinks.map((link, index) => {
              const isRouterLink = link.href.startsWith('/');
              return isRouterLink ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-xs font-display font-bold uppercase tracking-[0.15em] text-white/70 hover:text-white transition-all duration-200 relative group py-1"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--color-brand-cyan)] transition-all duration-300 group-hover:w-full" />
                </Link>
              ) : (
                <button
                  key={link.name}
                  onClick={() => handleLinkClick(link.href)}
                  className="text-xs font-display font-bold uppercase tracking-[0.15em] text-white/70 hover:text-white transition-all duration-200 relative group py-1"
                >
                  {link.name}
                  <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[var(--color-brand-cyan)] transition-all duration-300 group-hover:w-full" />
                </button>
              );
            })}
            
            {/* Pill CTA Button (Olivia style) */}
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleComenzar}
              className="btn-primary"
            >
              <span>Comenzar</span>
              <ArrowUpRight size={15} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.button>
          </div>

          {/* Custom Olivia-style Hamburger Trigger */}
          <div className="md:hidden z-50">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              aria-label="Abrir Menú"
              className="w-11 h-11 rounded-full border border-white/20 bg-white/5 backdrop-blur-md flex flex-col items-center justify-center gap-1.5 focus:outline-none"
            >
              <span className={`w-5 h-[2px] bg-white transition-all duration-300 origin-center ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-5 h-[2px] bg-white transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
              <span className={`w-5 h-[2px] bg-white transition-all duration-300 origin-center ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>
        </div>
      </nav>

      {/* Fullscreen Mobile Menu (Olivia Global style) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-black/95 backdrop-blur-2xl flex flex-col justify-between p-8 pt-28 md:hidden"
          >
            <div className="flex flex-col gap-5 mt-4">
              <span className="text-[11px] font-display font-bold tracking-[0.25em] text-[var(--color-brand-cyan)] uppercase">
                MENÚ DE NAVEGACIÓN
              </span>
              {navLinks.map((link, idx) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 * idx, duration: 0.4 }}
                >
                  {link.href.startsWith('/') ? (
                    <Link
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-3xl font-display font-black uppercase tracking-tight text-white/90 hover:text-[var(--color-brand-cyan)] flex items-center justify-between py-2 border-b border-white/10"
                    >
                      <span>{link.name}</span>
                      <ChevronRight size={22} className="text-white/40" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleLinkClick(link.href)}
                      className="w-full text-left text-3xl font-display font-black uppercase tracking-tight text-white/90 hover:text-[var(--color-brand-cyan)] flex items-center justify-between py-2 border-b border-white/10"
                    >
                      <span>{link.name}</span>
                      <ChevronRight size={22} className="text-white/40" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
              <button 
                onClick={handleComenzar}
                className="btn-cyan w-full justify-center text-sm py-4"
              >
                <span>Hablemos de su Proyecto</span>
                <ArrowUpRight size={18} />
              </button>
              <div className="flex items-center justify-between text-xs text-white/40 font-mono pt-2">
                <span>CONSULTIO © 2026</span>
                <span className="text-[var(--color-brand-cyan)]">DATOS • GESTIÓN • IMPACTO</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

