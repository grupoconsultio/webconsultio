import React from 'react';
import { Mail, Linkedin, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-brand-bg border-t border-white/5 pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-16">

          {/* Brand Info */}
          <div>
            <div className="flex flex-col leading-none mb-6">
              <span className="text-sm font-display font-light tracking-[0.2em] text-brand-secondary">GRUPO</span>
              <span className="text-2xl font-display font-extrabold tracking-tight text-white">CONSULTIO</span>
            </div>
            <p className="text-brand-secondary text-sm leading-relaxed mb-8">
              Transformando datos complejos en información estratégica para mejorar la gestión y las políticas públicas.
            </p>
            <div className="flex gap-4">
              <a
                href="https://www.linkedin.com/in/grupoconsultio"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 glass rounded-lg text-brand-secondary hover:text-[var(--color-brand-cyan)] transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
              <a
                href="https://www.instagram.com/grupoconsultio?igsh=MTF0OGQ4a2lxc3FwZw=="
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 glass rounded-lg text-brand-secondary hover:text-[var(--color-brand-cyan)] transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="mailto:info@grupoconsultio.com"
                className="p-2 glass rounded-lg text-brand-secondary hover:text-[var(--color-brand-cyan)] transition-colors"
                aria-label="Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold mb-6">Institucional</h4>
            <ul className="flex flex-col gap-4">
              <li><a href="#about" className="text-sm text-brand-secondary hover:text-[var(--color-brand-cyan)] transition-colors">Quiénes Somos</a></li>
              <li><a href="#services" className="text-sm text-brand-secondary hover:text-[var(--color-brand-cyan)] transition-colors">Servicios</a></li>
              <li><a href="#testimonials" className="text-sm text-brand-secondary hover:text-[var(--color-brand-cyan)] transition-colors">Testimonios</a></li>
              <li><a href="/blog" className="text-sm text-brand-secondary hover:text-[var(--color-brand-cyan)] transition-colors">Blog</a></li>
              <li><a href="#contact" className="text-sm text-brand-secondary hover:text-[var(--color-brand-cyan)] transition-colors">Contacto</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display font-bold mb-6">Novedades</h4>
            <p className="text-sm text-brand-secondary mb-4">Manténgase actualizado con nuestros últimos informes.</p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
                id="newsletter-email"
              />
              <button
                className="btn-primary w-full text-sm py-3"
                onClick={() => {
                  const email = document.getElementById('newsletter-email').value;
                  if (email) {
                    const subs = JSON.parse(localStorage.getItem('newsletterSubs') || '[]');
                    subs.push({ email, date: new Date().toISOString() });
                    localStorage.setItem('newsletterSubs', JSON.stringify(subs));
                    alert('Suscripción exitosa');
                    document.getElementById('newsletter-email').value = '';
                  }
                }}
              >
                Suscribirse
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-brand-secondary">
            © 2026 Consultio. Todos los derechos reservados.
          </p>
          <div className="flex gap-8">
            <a href="#" className="text-xs text-brand-secondary hover:text-[var(--color-brand-cyan)] transition-colors">Política de Privacidad</a>
            <a href="#" className="text-xs text-brand-secondary hover:text-[var(--color-brand-cyan)] transition-colors">Términos de Servicio</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
