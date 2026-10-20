import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ShieldCheck, Lock, EyeOff, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white pt-32 pb-24 relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[var(--color-brand-cyan)]/5 rounded-full blur-[140px] pointer-events-none" />

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
            <ShieldCheck size={12} />
            <span>PROTECCIÓN DE DATOS //</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-display font-black uppercase tracking-tight text-white mb-4">
            Política de Privacidad
          </h1>
          <p className="text-white/60 font-sans text-sm md:text-base leading-relaxed">
            En Grupo Consultio la confidencialidad, la seguridad y el tratamiento responsable de la información son pilares fundamentales de nuestro compromiso profesional.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-10 text-white/80 font-sans text-sm md:text-base leading-relaxed">
          
          <section className="olivia-card p-8">
            <h2 className="text-xl font-display font-bold uppercase text-white mb-3 flex items-center gap-2">
              <span className="text-[var(--color-brand-cyan)]">01.</span> Información que Recopilamos
            </h2>
            <p className="mb-3">
              Recopilamos únicamente los datos necesarios para brindar nuestros servicios de consultoría y responder a tus requerimientos:
            </p>
            <ul className="space-y-2 text-sm text-white/70 list-disc list-inside">
              <li><strong>Formularios de contacto y reuniones:</strong> Nombre, teléfono o WhatsApp, dirección de correo electrónico y solución o motivo de interés.</li>
              <li><strong>Suscripción a Insights & Reportes:</strong> Correo electrónico proporcionado voluntariamente para el envío de estudios analíticos periódicos.</li>
              <li><strong>Datos de navegación técnica:</strong> Métricas anónimas de rendimiento y navegación para optimizar la velocidad y compatibilidad de nuestro sitio web.</li>
            </ul>
          </section>

          <section className="olivia-card p-8">
            <h2 className="text-xl font-display font-bold uppercase text-white mb-3 flex items-center gap-2">
              <span className="text-[var(--color-brand-cyan)]">02.</span> Finalidad del Tratamiento de Datos
            </h2>
            <p className="mb-3">
              La información suministrada se utiliza con los siguientes propósitos exclusivos:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-white/70">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[var(--color-brand-cyan)] mt-0.5 flex-shrink-0" />
                <span>Coordinar reuniones estratégicas y responder consultas solicitadas.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[var(--color-brand-cyan)] mt-0.5 flex-shrink-0" />
                <span>Enviar informes ejecutivos, estudios de opinión y análisis mensuales.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[var(--color-brand-cyan)] mt-0.5 flex-shrink-0" />
                <span>Garantizar la seguridad y correcto funcionamiento de nuestros tableros.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-[var(--color-brand-cyan)] mt-0.5 flex-shrink-0" />
                <span>Cumplir con estándares éticos y obligaciones legales aplicables.</span>
              </div>
            </div>
          </section>

          <section className="olivia-card p-8">
            <h2 className="text-xl font-display font-bold uppercase text-white mb-3 flex items-center gap-2">
              <span className="text-[var(--color-brand-cyan)]">03.</span> Anonimización en Estudios y Encuestas
            </h2>
            <p>
              En todas las investigaciones de opinión pública, encuestas sociales y diagnósticos de clima organizacional que desarrollamos, las respuestas son procesadas de manera <strong>estrictamente anónima y agregada</strong>. Ningún informe entregado a clientes asocia respuestas individuales con identidades particulares, resguardando el secreto estadístico y la libertad de opinión de los participantes.
            </p>
          </section>

          <section className="olivia-card p-8">
            <h2 className="text-xl font-display font-bold uppercase text-white mb-3 flex items-center gap-2">
              <span className="text-[var(--color-brand-cyan)]">04.</span> Seguridad y No Cesión a Terceros
            </h2>
            <p>
              Bajo ninguna circunstancia vendemos, alquilamos ni transferimos datos de contacto a terceros con fines comerciales o publicitarios ajenos a Grupo Consultio. Aplicamos estándares de cifrado y medidas de seguridad técnicas para prevenir accesos no autorizados o filtraciones.
            </p>
          </section>

          <section className="olivia-card p-8">
            <h2 className="text-xl font-display font-bold uppercase text-white mb-3 flex items-center gap-2">
              <span className="text-[var(--color-brand-cyan)]">05.</span> Derechos de Acceso y Baja
            </h2>
            <p>
              Puedes ejercer tus derechos de acceso, rectificación, actualización o baja total de tus datos en cualquier momento enviando un correo a <a href="mailto:info@grupoconsultio.com" className="text-[var(--color-brand-cyan)] hover:underline">info@grupoconsultio.com</a>. Las suscripciones al newsletter pueden ser canceladas automáticamente mediante el enlace incluido en cada comunicado.
            </p>
          </section>

        </div>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
