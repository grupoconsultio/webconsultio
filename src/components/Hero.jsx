import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Particles, initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import { ArrowRight, Laptop } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    background: {
      color: {
        value: "transparent",
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: "grab",
        },
      },
      modes: {
        grab: {
          distance: 140,
          links: {
            opacity: 1,
          },
        },
      },
    },
    particles: {
      color: {
        value: "#00E5FF",
      },
      links: {
        color: "#00E5FF",
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      move: {
        direction: "none",
        enable: true,
        outModes: {
          default: "bounce",
        },
        random: false,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 80,
      },
      opacity: {
        value: 0.5,
      },
      shape: {
        type: "circle",
      },
      size: {
        value: { min: 1, max: 2 },
      },
    },
    detectRetina: true,
  };

  return (
    <section className="relative min-h-[80vh] md:min-h-screen flex items-start pt-36 md:items-center md:pt-20 overflow-hidden bg-transparent">
      {/* Particle Background */}
      {init && (
        <Particles
          id="tsparticles"
          className="absolute inset-0 z-0"
          options={particlesOptions}
        />
      )}

      {/* Content */}
      <div className="container mx-auto px-6 relative z-10 text-center md:text-left">
        <div className="max-w-4xl mx-auto md:mx-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block py-1 px-4 rounded-full border border-[var(--color-brand-cyan)] bg-[var(--color-brand-cyan)]/10 text-sm md:text-xs font-semibold tracking-widest uppercase mb-6 text-[var(--color-brand-cyan)] shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              Análisis Estratégico
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-extrabold leading-tight mb-5 md:mb-8">
              Transformar Datos en <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[var(--color-brand-cyan)]">Conocimiento Útil</span>
            </h1>
            <p className="text-base md:text-xl text-brand-secondary mb-6 md:mb-10 max-w-2xl mx-auto md:mx-0 leading-relaxed">
              Acompañamos a gobiernos y organizaciones privadas en la toma de decisiones. Desarrollamos estudios de opinión, tableros de control y diagnósticos organizacionales para mejorar el impacto y la gestión.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-10 md:justify-start justify-center">
              <button
                onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary flex items-center gap-2 group w-full sm:w-auto justify-center"
              >
                Conoce Nuestros Servicios
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                to="/demos"
                className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center hover:border-[var(--color-brand-cyan)]/50"
              >
                <div className="w-8 h-8 rounded-full bg-[var(--color-brand-cyan)]/20 flex items-center justify-center">
                  <Laptop size={14} className="text-[var(--color-brand-cyan)]" />
                </div>
                Probar Nuestras Demos
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[var(--color-brand-cyan)]/10 rounded-full blur-[120px] z-0 pointer-events-none" />
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-white/5 rounded-full blur-[100px] z-0 pointer-events-none" />
    </section>
  );
};

export default Hero;
