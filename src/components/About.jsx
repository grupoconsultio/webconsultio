import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const values = [
  { 
    number: "01",
    title: "Orientación a resultados", 
    desc: "Desarrollamos estudios pensados para apoyar decisiones reales y mejorar la gestión operativa." 
  },
  { 
    number: "02",
    title: "Calidad y profesionalismo", 
    desc: "Aplicamos metodologías rigurosas y estándares técnicos sumamente elevados." 
  },
  { 
    number: "03",
    title: "Claridad en la información", 
    desc: "Transformamos datos complejos en indicadores visuales, precisos y rápidamente accionables." 
  },
  { 
    number: "04",
    title: "Compromiso con el cliente", 
    desc: "Trabajamos de manera muy cercana, entendiendo las particularidades de cada sector y organización." 
  },
  { 
    number: "05",
    title: "Confidencialidad", 
    desc: "Garantizamos el resguardo responsable de la información, respetando protocolos estrictos." 
  },
  { 
    number: "06",
    title: "Innovación aplicada", 
    desc: "Incorporamos tecnología analítica de vanguardia para optimizar el monitoreo en todo momento." 
  },
];

// Marquee tags balancing public and corporate sectors
const clientLogos = [
  "COMPAÑÍAS FINANCIERAS & FINTECH",
  "MUNICIPALIDADES & GOBIERNOS LOCALES",
  "EMPRESAS DE CONSUMO MASIVO",
  "ORGANISMOS PÚBLICOS PROVINCIALES",
  "FIRMAS DE LOGÍSTICA & RETAIL",
  "ESTUDIOS DE OPINIÓN PÚBLICA LATAM",
  "COMPAÑÍAS DE TECNOLOGÍA & SERVICIOS",
  "ORGANIZACIONES DE LA SOCIEDAD CIVIL"
];

const About = () => {
  const [activeTab, setActiveTab] = useState('mission');

  return (
    <section id="about" className="pt-0 pb-24 md:pb-32 bg-brand-surface relative overflow-hidden">
      
      {/* Olivia-style Marquee Ticker */}
      <div className="border-y border-white/10 py-5 bg-[#0D0D0D] mb-20 overflow-hidden relative">
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-brand-surface to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-brand-surface to-transparent z-10 pointer-events-none" />
        <div className="animate-marquee flex items-center gap-12 whitespace-nowrap">
          {clientLogos.concat(clientLogos).map((item, index) => (
            <div key={index} className="flex items-center gap-6">
              <span className="text-xs md:text-sm font-display font-bold uppercase tracking-[0.25em] text-white/50 hover:text-[var(--color-brand-cyan)] transition-colors cursor-default">
                {item}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-cyan)]" />
            </div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">

        {/* Top Header - Exact Original Copy with Olivia Typography */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <div className="olivia-tag mb-4">
            <span>QUIÉNES SOMOS</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-black uppercase tracking-tight leading-[1.08] mt-2 mb-6">
            Transformamos datos en <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/95 to-[var(--color-brand-cyan)]">información estratégica</span>
          </h2>

          <p className="text-white/70 text-base md:text-xl mb-10 leading-relaxed max-w-3xl font-sans">
            Somos una consultora especializada que trabaja con gobiernos y organizaciones públicas y privadas para mejorar la gestión y fortalecer estrategias institucionales a través del poder de la evidencia.
          </p>

          {/* Olivia-style Pill Switcher for Mission / Vision */}
          <div className="inline-flex p-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <button 
              onClick={() => setActiveTab('mission')}
              className={`px-8 py-2.5 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'mission' 
                  ? 'bg-white text-black shadow-[0_2px_15px_rgba(255,255,255,0.2)]' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Nuestra Misión
            </button>
            <button 
              onClick={() => setActiveTab('vision')}
              className={`px-8 py-2.5 rounded-full text-xs font-display font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === 'vision' 
                  ? 'bg-white text-black shadow-[0_2px_15px_rgba(255,255,255,0.2)]' 
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Nuestra Visión
            </button>
          </div>

          {/* Mission / Vision Dynamic Display */}
          <div className="min-h-[120px] w-full max-w-3xl">
            <AnimatePresence mode="wait">
              {activeTab === 'mission' && (
                <motion.div
                  key="mission"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="olivia-card p-8 text-left border-l-4 border-l-[var(--color-brand-cyan)]"
                >
                  <p className="text-white/90 leading-relaxed font-sans text-base md:text-lg">
                    Acompañar a gobiernos y organizaciones en la toma de decisiones estratégicas mediante información confiable, análisis de datos y estudios de opinión pública, aportando soluciones prácticas que mejoren la eficiencia y el impacto global.
                  </p>
                </motion.div>
              )}
              {activeTab === 'vision' && (
                <motion.div
                  key="vision"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="olivia-card p-8 text-left border-l-4 border-l-[var(--color-brand-cyan)]"
                >
                  <p className="text-white/90 leading-relaxed font-sans text-base md:text-lg">
                    Convertirnos en un socio estratégico de referencia, reconocido por transformar datos en conocimiento útil y por generar evidencia que permita diseñar, implementar y evaluar políticas públicas y corporativas con resultados medibles.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Olivia-style Showcase of "NUESTROS VALORES" */}
        <div id="valores" className="mt-28">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 pb-6 border-b border-white/10 gap-6">
            <div>
              <div className="olivia-tag mb-3">
                <Sparkles size={12} />
                <span>PRINCIPIOS //</span>
              </div>
              <h3 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight text-white">
                Nuestros Valores
              </h3>
            </div>
            <div className="flex items-center gap-4 text-xs font-display font-bold uppercase tracking-wider text-white/50">
              <span className="hidden sm:inline">6 PILARES ESTRATÉGICOS</span>
              <div className="flex items-center gap-2">
                <button
                  id="swiper-prev-val"
                  aria-label="Anterior"
                  className="w-10 h-10 rounded-full border border-white/15 bg-white/5 hover:bg-[var(--color-brand-cyan)] hover:text-black hover:border-[var(--color-brand-cyan)] transition-all flex items-center justify-center text-white cursor-pointer"
                >
                  ←
                </button>
                <button
                  id="swiper-next-val"
                  aria-label="Siguiente"
                  className="w-10 h-10 rounded-full border border-white/15 bg-white/5 hover:bg-[var(--color-brand-cyan)] hover:text-black hover:border-[var(--color-brand-cyan)] transition-all flex items-center justify-center text-white cursor-pointer"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          <Swiper
            modules={[Autoplay, Pagination, Navigation]}
            navigation={{
              prevEl: '#swiper-prev-val',
              nextEl: '#swiper-next-val',
            }}
            spaceBetween={24}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3800, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
            className="pb-16 flex items-stretch !overflow-visible"
          >
            {values.map((val, idx) => (
              <SwiperSlide key={idx} style={{ height: 'auto' }}>
                <div className="olivia-card p-8 h-full flex flex-col justify-between group hover:border-[var(--color-brand-cyan)]/60 hover:shadow-[0_10px_35px_rgba(0,229,255,0.12)] transition-all duration-300">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-[var(--color-brand-cyan)]/10 border border-[var(--color-brand-cyan)]/30 flex items-center justify-center text-[var(--color-brand-cyan)] group-hover:scale-110 group-hover:bg-[var(--color-brand-cyan)]/20 transition-all">
                        <CheckCircle2 size={24} />
                      </div>
                      <span className="text-3xl font-display font-black text-white/15 group-hover:text-[var(--color-brand-cyan)]/40 transition-colors">
                        {val.number}
                      </span>
                    </div>

                    <h4 className="font-display font-black text-xl md:text-2xl uppercase text-white mb-4 group-hover:text-[var(--color-brand-cyan)] transition-colors">
                      {val.title}
                    </h4>

                    <p className="text-white/70 font-sans leading-relaxed text-sm md:text-base">
                      {val.desc}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between text-xs font-mono uppercase text-white/30">
                    <span>PILAR {val.number}</span>
                    <span className="w-2 h-2 rounded-full bg-[var(--color-brand-cyan)]" />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

      </div>
    </section>
  );
};

export default About;


