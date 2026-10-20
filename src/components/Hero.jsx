import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Particles, initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { ArrowUpRight } from 'lucide-react';

const Hero = () => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesOptions = {
    fullScreen: { enable: false },
    background: { color: { value: "transparent" } },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: { enable: true, mode: "grab" },
      },
      modes: {
        grab: { distance: 130, links: { opacity: 0.8 } },
      },
    },
    particles: {
      color: { value: "#00E5FF" },
      links: {
        color: "#00E5FF",
        distance: 140,
        enable: true,
        opacity: 0.35,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: { default: "bounce" },
        random: false,
        speed: 0.9,
        straight: false,
      },
      number: {
        density: { enable: true, area: 900 },
        value: 70,
      },
      opacity: { value: 0.4 },
      shape: { type: "circle" },
      size: { value: { min: 1, max: 2.2 } },
    },
    detectRetina: true,
  };

  return (
    <section className="relative min-h-[78vh] lg:min-h-[82vh] flex flex-col justify-center pt-32 md:pt-40 pb-12 overflow-hidden bg-transparent">
      {/* Particle Background */}
      {init && (
        <Particles
          id="tsparticles"
          className="absolute inset-0 z-0 pointer-events-auto"
          options={particlesOptions}
        />
      )}

      {/* Main Content Area */}
      <div className="container mx-auto px-6 md:px-12 relative z-10 my-auto">
        <div className="max-w-5xl">
          {/* Olivia-style category tag */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 flex flex-wrap items-center gap-3"
          >
            <span className="olivia-tag border-[var(--color-brand-cyan)]/40 text-[var(--color-brand-cyan)] bg-[var(--color-brand-cyan)]/5 shadow-[0_0_20px_rgba(0,229,255,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-cyan)] animate-ping" />
              CONSULTORÍA ESTRATÉGICA & ANALÍTICA
            </span>
            <span className="text-xs font-mono uppercase tracking-widest text-white/40 hidden sm:inline-block">
              // LATAM & ESPAÑA
            </span>
          </motion.div>

          {/* Big Olivia-inspired Headings */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-display font-black leading-[1.12] tracking-tight uppercase mb-6 max-w-4xl">
              Transformar Datos en <br className="hidden md:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/95 to-[var(--color-brand-cyan)]">
                Conocimiento Útil.
              </span>
            </h1>

            <p className="text-base md:text-lg font-normal text-white/75 max-w-2xl leading-relaxed mb-8 font-sans">
              Acompañamos a gobiernos y organizaciones privadas en la toma de decisiones. Desarrollamos estudios de opinión, tableros de control y diagnósticos organizacionales para mejorar el impacto y la gestión.
            </p>

            {/* Pill Action Buttons (Olivia Global style) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary group"
              >
                <span>Explorar Soluciones</span>
                <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('select-solution', { detail: '' }));
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="btn-secondary group"
              >
                <span>Agendar Reunión</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Glows */}
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-[var(--color-brand-cyan)]/10 rounded-full blur-[140px] z-0 pointer-events-none" />
      <div className="absolute bottom-10 left-[-100px] w-[400px] h-[400px] bg-white/5 rounded-full blur-[120px] z-0 pointer-events-none" />
    </section>
  );
};

export default Hero;

