import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

const values = [
  { title: "Orientación a resultados", desc: "Desarrollamos estudios pensados para apoyar decisiones reales y mejorar la gestión operativa." },
  { title: "Calidad y profesionalismo", desc: "Aplicamos metodologías rigurosas y estándares técnicos sumamente elevados." },
  { title: "Claridad en la información", desc: "Transformamos datos complejos en indicadores visuales, precisos y rápidamente accionables." },
  { title: "Compromiso con el cliente", desc: "Trabajamos de manera muy cercana, entendiendo las particularidades de cada sector y organización." },
  { title: "Confidencialidad", desc: "Garantizamos el resguardo responsable de la información, respetando protocolos estrictos." },
  { title: "Innovación aplicada", desc: "Incorporamos tecnología analítica de vanguardia para optimizar el monitoreo en todo momento." },
];

const About = () => {
  const [activeTab, setActiveTab] = useState('mission');

  return (
    <section id="about" className="py-12 md:py-24 bg-brand-surface relative overflow-hidden">
      <div className="container mx-auto px-6">

        {/* Main Header & Tabs */}
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-10 md:mb-16">
          <span className="text-[var(--color-brand-cyan)] font-semibold tracking-widest uppercase text-xs">Quiénes Somos</span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mt-4 mb-6">
            Transformamos datos en <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[var(--color-brand-cyan)]">información estratégica</span>
          </h2>
          <p className="text-brand-secondary text-lg mb-10 leading-relaxed max-w-3xl">
            Somos una consultora especializada que trabaja con gobiernos y organizaciones públicas y privadas para mejorar la gestión y fortalecer estrategias institucionales a través del poder de la evidencia.
          </p>

          <div className="flex gap-4 justify-center mb-8">
            <button 
              onClick={() => setActiveTab('mission')}
              className={`pb-2 border-b-2 font-display font-bold transition-colors ${activeTab === 'mission' ? 'border-[var(--color-brand-cyan)] text-white' : 'border-transparent text-brand-secondary hover:text-white'}`}
            >
              Nuestra Misión
            </button>
            <button 
              onClick={() => setActiveTab('vision')}
              className={`pb-2 border-b-2 font-display font-bold transition-colors ${activeTab === 'vision' ? 'border-[var(--color-brand-cyan)] text-white' : 'border-transparent text-brand-secondary hover:text-white'}`}
            >
              Nuestra Visión
            </button>
          </div>

          <div className="min-h-[120px] w-full max-w-3xl">
            <AnimatePresence mode="wait">
              {activeTab === 'mission' && (
                <motion.p
                  key="mission"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-brand-secondary leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/10"
                >
                  Acompañar a gobiernos y organizaciones en la toma de decisiones estratégicas mediante información confiable, análisis de datos y estudios de opinión pública, aportando soluciones prácticas que mejoren la eficiencia y el impacto global.
                </motion.p>
              )}
              {activeTab === 'vision' && (
                <motion.p
                  key="vision"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-brand-secondary leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/10"
                >
                  Convertirnos en un socio estratégico de referencia, reconocido por transformar datos en conocimiento útil y por generar evidencia que permita diseñar, implementar y evaluar políticas públicas y corporativas con resultados medibles.
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Values Carousel */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-display font-bold inline-block relative">
              Nuestros Valores
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-[var(--color-brand-cyan)] rounded-full"></div>
            </h3>
          </div>

          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30}
            slidesPerView={1}
            pagination={{ clickable: true }}
            autoplay={{ delay: 3500 }}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 }
            }}
            className="pb-16 flex items-stretch"
          >
            {values.map((val, idx) => (
              <SwiperSlide key={idx} style={{ height: 'auto' }}>
                <div className="bg-white/5 p-8 rounded-2xl border border-white/5 hover:border-[var(--color-brand-cyan)]/30 transition-colors group h-full flex flex-col justify-start">
                  <CheckCircle2 className="text-[var(--color-brand-cyan)] w-8 h-8 mb-6 group-hover:scale-110 transition-transform flex-shrink-0" />
                  <h4 className="font-bold text-xl text-white mb-4">{val.title}</h4>
                  <p className="text-brand-secondary leading-relaxed">{val.desc}</p>
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
