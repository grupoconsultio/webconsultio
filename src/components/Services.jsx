import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, LayoutDashboard, MonitorSmartphone, Target, Users, Search } from 'lucide-react';

const services = [
  {
    icon: <Search className="w-8 h-8 text-[var(--color-brand-cyan)]" />,
    title: "Asesoramiento Estratégico",
    description: "Encuestas de opinión pública, evaluación de gobiernos y estudios de diagnóstico integral."
  },
  {
    icon: <MonitorSmartphone className="w-8 h-8 text-[var(--color-brand-cyan)]" />,
    title: "Desarrollo de Tecnología",
    description: "Herramientas avanzadas de captación de datos, arquitectura de sistemas de información y desarrollo de sitios web a medida."
  },
  {
    icon: <Users className="w-8 h-8 text-[var(--color-brand-cyan)]" />,
    title: "Diagnóstico Organizacional",
    description: "Encuestas de clima y satisfacción laboral diseñadas para potenciar el talento interno."
  },
  {
    icon: <LayoutDashboard className="w-8 h-8 text-[var(--color-brand-cyan)]" />,
    title: "Observatorios de Gestión",
    description: "Monitoreo en tiempo real con tableros interactivos para conocer el pulso exacto de su gestión en cada momento."
  },
  {
    icon: <LineChart className="w-8 h-8 text-[var(--color-brand-cyan)]" />,
    title: "Consultoría Presupuestaria",
    description: "Asesoramiento técnico financiero para optimizar la asignación y ejecución de recursos."
  },
  {
    icon: <Target className="w-8 h-8 text-[var(--color-brand-cyan)]" />,
    title: "Evaluación de Políticas",
    description: "Análisis sistemáticos y medición de impacto basados en evidencia medible."
  }
];

const ServiceCard = ({ icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -10 }}
      className="relative p-8 glass-elevated rounded-3xl group transition-all duration-300 hover:border-[var(--color-brand-cyan)]/30 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-brand-cyan)]/0 to-[var(--color-brand-cyan)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:bg-[var(--color-brand-cyan)]/10 group-hover:scale-110 transition-all duration-300">
        {icon}
      </div>
      <h3 className="relative z-10 text-2xl font-display font-bold mb-4">{title}</h3>
      <p className="relative z-10 text-brand-secondary leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
};

const Services = () => {
  return (
    <section id="services" className="py-24 bg-brand-bg relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-20 gap-8">
          <div className="max-w-2xl">
            <span className="inline-block px-3 py-1 bg-[var(--color-brand-cyan)]/10 text-[var(--color-brand-cyan)] font-semibold tracking-widest uppercase text-xs rounded-full mb-4">Nuestra Experiencia</span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight">Soluciones Integradas para la Toma de Decisiones</h2>
          </div>
          <div className="md:w-1/3 flex border-l-2 border-[var(--color-brand-cyan)] pl-6">
            <p className="text-brand-secondary text-lg leading-relaxed">
               Transformamos datos complejos en <strong className="text-white font-normal">información estratégica</strong> para mejorar la gestión y el impacto en su organización.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} index={index} />
          ))}
        </div>


      </div>
    </section>
  );
};

export default Services;
