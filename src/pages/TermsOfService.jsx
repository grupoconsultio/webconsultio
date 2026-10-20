import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, FileText, Lock, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsOfService = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-32 pb-24 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[var(--color-brand-cyan)]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="container mx-auto px-6 md:px-12 max-w-4xl relative z-10">
        
        {/* Back Link */}
        <Link 
          to="/"
          className="inline-flex items-center gap-2 text-xs font-display font-bold uppercase tracking-widest text-white/50 hover:text-[var(--color-brand-cyan)] transition-colors mb-10"
        >
          <ArrowLeft size={16} />
          <span>Volver al Inicio</span>
        </Link>

        {/* Header */}
        <div className="mb-14 pb-8 border-b border-white/10">
          <div className="olivia-tag mb-4">
            <FileText size={12} />
            <span>MARCO LEGAL //</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tight text-white mb-4">
            Términos de Servicio
          </h1>
          <p className="text-white/60 font-sans text-sm md:text-base leading-relaxed">
            Última actualización: Octubre 2026. Al acceder y utilizar los servicios de Grupo Consultio, aceptas las siguientes condiciones de uso profesional.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-white/80 font-sans text-sm md:text-base leading-relaxed">
          
          <section className="olivia-card p-8">
            <h2 className="text-xl font-display font-bold uppercase text-white mb-3 flex items-center gap-2">
              <span className="text-[var(--color-brand-cyan)]">01.</span> Identificación y Objeto
            </h2>
            <p>
              El presente sitio web y sus servicios asociados son operados por <strong>Grupo Consultio</strong>, firma consultora especializada en ciencia de datos, evaluación de opinión pública, desarrollo de observatorios territoriales y diagnóstico organizacional para los sectores público y privado en América Latina y España.
            </p>
          </section>

          <section className="olivia-card p-8">
            <h2 className="text-xl font-display font-bold uppercase text-white mb-3 flex items-center gap-2">
              <span className="text-[var(--color-brand-cyan)]">02.</span> Servicios y Rigor Metodológico
            </h2>
            <p className="mb-3">
              Grupo Consultio provee estudios analíticos, encuestas probabilísticas, tableros de control y plataformas tecnológicas basadas en estándares técnicos internacionales y estrictos protocolos de control de calidad muestral.
            </p>
            <p>
              Los informes y recomendaciones emitidos constituyen herramientas de apoyo para la toma de decisiones estratégicas, fundamentadas en evidencia empírica rigurosa pero sujetas a la interpretación y contexto operacional de cada cliente u organización.
            </p>
          </section>

          <section className="olivia-card p-8">
            <h2 className="text-xl font-display font-bold uppercase text-white mb-3 flex items-center gap-2">
              <span className="text-[var(--color-brand-cyan)]">03.</span> Confidencialidad y Propiedad Intelectual
            </h2>
            <p className="mb-3">
              Toda información suministrada por nuestros clientes en el marco de auditorías, estudios de clima interno o tableros de gestión está amparada por acuerdos estrictos de confidencialidad y no divulgación (NDA).
            </p>
            <p>
              Los códigos fuente, metodologías analíticas, modelos estadísticos y diseños de visualización desarrollados por Grupo Consultio son propiedad intelectual de la firma, otorgándose licencias de uso a los contratantes según los términos acordados en cada propuesta comercial.
            </p>
          </section>

          <section className="olivia-card p-8">
            <h2 className="text-xl font-display font-bold uppercase text-white mb-3 flex items-center gap-2">
              <span className="text-[var(--color-brand-cyan)]">04.</span> Uso de Demos y Plataformas Interactivas
            </h2>
            <p>
              Las demostraciones públicas disponibles en nuestro sitio web tienen fines meramente ilustrativos y exploratorios. Queda prohibida la extracción automatizada masiva (scraping), ingeniería inversa o uso indebido de los datos de muestra expuestos en los tableros demostrativos.
            </p>
          </section>

          <section className="olivia-card p-8">
            <h2 className="text-xl font-display font-bold uppercase text-white mb-3 flex items-center gap-2">
              <span className="text-[var(--color-brand-cyan)]">05.</span> Contacto Legal
            </h2>
            <p>
              Para consultas vinculadas a estos términos o requerimientos contractuales específicos, por favor comunícate a través de nuestro correo oficial: <a href="mailto:info@grupoconsultio.com" className="text-[var(--color-brand-cyan)] hover:underline">info@grupoconsultio.com</a>.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};

export default TermsOfService;
