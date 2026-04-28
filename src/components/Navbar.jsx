import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight } from 'lucide-react';
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

  const navLinks = [
    { name: 'Nosotros', href: '#about' },
    { name: 'Servicios', href: '#services' },
    { name: 'Testimonios', href: '#testimonials' },
    { name: 'Blog', href: '/blog' },
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

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-4 glass border-b' : 'py-6 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        {/* Logo */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <Link to="/" className="flex flex-col leading-none">
            <span className="text-sm font-display font-light tracking-[0.2em] text-brand-secondary">GRUPO</span>
            <span className="text-2xl font-display font-extrabold tracking-tight">CONSULTIO</span>
          </Link>
        </motion.div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link, index) => {
            const isRouterLink = link.href.startsWith('/');
            return (
               isRouterLink ? (
                 <Link
                   key={link.name}
                   to={link.href}
                   className="text-sm font-medium text-brand-secondary hover:text-white transition-colors"
                 >
                   {link.name}
                 </Link>
               ) : (
                <motion.a
                  key={link.name}
                  href={location.pathname === '/' ? link.href : `/${link.href}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="text-sm font-medium text-brand-secondary hover:text-white transition-colors"
                >
                  {link.name}
                </motion.a>
               )
            );
          })}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={handleComenzar}
            className="btn-primary py-2 px-6 text-sm"
          >
            Comenzar
          </motion.button>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-brand-surface/98 backdrop-blur-xl border-b border-white/10 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => {
                const isRouterLink = link.href.startsWith('/');
                return isRouterLink ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className="flex justify-between items-center text-lg font-medium py-2 border-b border-white/5"
                  >
                    {link.name}
                    <ChevronRight size={18} className="text-brand-secondary" />
                  </Link>
                ) : (
                  <a
                    key={link.name}
                    href={location.pathname === '/' ? link.href : `/${link.href}`}
                    onClick={() => setIsOpen(false)}
                    className="flex justify-between items-center text-lg font-medium py-2 border-b border-white/5"
                  >
                    {link.name}
                    <ChevronRight size={18} className="text-brand-secondary" />
                  </a>
                );
              })}
              <button 
                onClick={handleComenzar}
                className="btn-primary w-full mt-4"
              >
                Comenzar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
