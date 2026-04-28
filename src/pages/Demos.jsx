import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BarChart2, Globe, MessageSquare, PieChart, Vote, Map, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ObservatorioDemo from '../components/ObservatorioDemo';
import SistemaReclamosDemo from '../components/SistemaReclamosDemo';
import ChatbotDemo from '../components/ChatbotDemo';
import OpinionPublicaDemo from '../components/OpinionPublicaDemo';
import PresupuestoParticipativoDemo from '../components/PresupuestoParticipativoDemo';
import MapaObrasDemo from '../components/MapaObrasDemo';

const products = [
  {
    key: 'observatorio',
    icon: BarChart2,
    title: 'Observatorios de Gestión',
    subtitle: 'Monitoreo en tiempo real por categoría temática',
    description: 'Explorá dashboards interactivos de Salud, Economía y Obras Públicas. Visualizá KPIs, tendencias y distribuciones que transforman datos complejos en decisiones estratégicas.',
    tag: 'Dashboard interactivo',
  },
  {
    key: 'tecnologia',
    icon: Globe,
    title: 'Desarrollo de Tecnología',
    subtitle: 'Sistema de gestión de reclamos',
    description: 'Plataforma de seguimiento y resolución de reclamos ciudadanos, diseñada para organismos públicos y privados.',
    tag: 'Sistema de gestión',
  },
  {
    key: 'participacion',
    icon: Vote,
    title: 'Participación Ciudadana',
    subtitle: 'Presupuesto Participativo Digital',
    description: 'Gestión de votos y asignación de presupuesto a los proyectos que transformarán tu ciudad.',
    tag: 'Democracia Digital',
  },
  {
    key: 'obras',
    icon: Map,
    title: 'Transparencia de Obras',
    subtitle: 'Mapa interactivo de obra pública',
    description: 'Seguimiento físico y financiero de proyectos de infraestructura con comparativas visuales y datos abiertos para el ciudadano.',
    tag: 'Transparencia',
  },
  {
    key: 'opinion',
    icon: PieChart,
    title: 'Análisis de Opinión',
    subtitle: 'Estudios de opinión pública y encuestas',
    description: 'Visualizá el humor social, preocupaciones ciudadanas y percepción de imagen mediante dashboards analíticos de alta precisión.',
    tag: 'Análisis Estratégico',
  },
  {
    key: 'chatbot',
    icon: MessageSquare,
    title: 'Asistente de IA',
    subtitle: 'Chatbot municipal inteligente',
    description: 'Atención al ciudadano 24/7 mediante inteligencia artificial. Resolución de dudas frecuentes, trámites y derivación inteligente.',
    tag: 'Inteligencia Artificial',
  },
];

const Demos = () => {
  const [active, setActive] = useState(null);

  return (
    <div className="min-h-screen bg-brand-bg pt-28 pb-20">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="mb-14">
          <Link to="/" className="inline-flex items-center gap-2 text-brand-secondary hover:text-[var(--color-brand-cyan)] transition-colors text-sm mb-8">
            <ArrowLeft size={16} /> Volver al inicio
          </Link>
          <span className="block text-[var(--color-brand-cyan)] font-semibold tracking-widest uppercase text-xs mb-3">Demostraciones</span>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">Nuestros Productos</h1>
          <p className="text-brand-secondary max-w-xl leading-relaxed">
            Explorá algunas de las herramientas que desarrollamos. Estos son proyectos modelo: diseñamos y adaptamos cada solución a medida según las necesidades específicas de cada organización.
          </p>
        </div>

        {/* Product cards */}
        {!active && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {products.map((p) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={p.key}
                  whileHover={{ y: -6 }}
                  onClick={() => setActive(p.key)}
                  className="glass-elevated rounded-3xl p-8 flex flex-col gap-6 border border-white/5 transition-all duration-300 cursor-pointer hover:border-[var(--color-brand-cyan)]/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-cyan)]/10 flex items-center justify-center">
                      <Icon size={26} className="text-[var(--color-brand-cyan)]" />
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--color-brand-cyan)]/10 text-[var(--color-brand-cyan)]">
                      {p.tag}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-xl font-display font-bold text-white mb-1">{p.title}</h2>
                    <p className="text-sm text-[var(--color-brand-cyan)] mb-3 font-medium">{p.subtitle}</p>
                    <p className="text-brand-secondary text-sm leading-relaxed line-clamp-3">{p.description}</p>
                  </div>

                  <div className="flex items-center gap-2 text-[var(--color-brand-cyan)] text-sm font-semibold mt-auto">
                    Ver demo <ChevronRight size={16} />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Demo view */}
        <AnimatePresence mode="wait">
          {active && (
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <button
                onClick={() => setActive(null)}
                className="inline-flex items-center gap-2 text-brand-secondary hover:text-[var(--color-brand-cyan)] transition-colors text-sm mb-8"
              >
                <ArrowLeft size={16} /> Volver a productos
              </button>

              {active === 'observatorio' && (
                <div>
                  <div className="mb-6">
                    <span className="text-[var(--color-brand-cyan)] text-xs font-semibold tracking-widest uppercase">Observatorios de Gestión</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold mt-1">Sistema de Monitoreo Interactivo</h2>
                    <p className="text-brand-secondary text-sm mt-2 max-w-lg">
                      Seleccioná una categoría para explorar sus indicadores clave, tendencias y distribuciones en tiempo real.
                    </p>
                  </div>
                  <ObservatorioDemo />
                </div>
              )}

              {active === 'tecnologia' && (
                <div>
                  <div className="mb-6">
                    <span className="text-[var(--color-brand-cyan)] text-xs font-semibold tracking-widest uppercase">Tecnología Aplicada</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold mt-1">Gestión de Reclamos Ciudadanos</h2>
                    <p className="text-brand-secondary text-sm mt-2 max-w-lg">
                      Visualizá cómo nuestra plataforma centraliza incidencias, optimiza tiempos de respuesta y mejora la comunicación con el vecino.
                    </p>
                  </div>
                  <SistemaReclamosDemo />
                </div>
              )}

              {active === 'participacion' && (
                <div>
                  <div className="mb-6">
                    <span className="text-[var(--color-brand-cyan)] text-xs font-semibold tracking-widest uppercase">Participación Ciudadana</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold mt-1">Presupuesto Participativo Digital</h2>
                    <p className="text-brand-secondary text-sm mt-2 max-w-lg">
                      Gestión de votos y asignación de presupuesto a los proyectos que transformarán tu ciudad.
                    </p>
                  </div>
                  <PresupuestoParticipativoDemo />
                </div>
              )}

              {active === 'obras' && (
                <div>
                  <div className="mb-6">
                    <span className="text-[var(--color-brand-cyan)] text-xs font-semibold tracking-widest uppercase">Transparencia</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold mt-1">Portal de Seguimiento de Obras</h2>
                    <p className="text-brand-secondary text-sm mt-2 max-w-lg">
                      Explorá el progreso físico y financiero de la infraestructura pública con datos georreferenciados.
                    </p>
                  </div>
                  <MapaObrasDemo />
                </div>
              )}

              {active === 'opinion' && (
                <div>
                  <div className="mb-6">
                    <span className="text-[var(--color-brand-cyan)] text-xs font-semibold tracking-widest uppercase">Análisis Estratégico</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold mt-1">Dashboard de Opinión Pública</h2>
                    <p className="text-brand-secondary text-sm mt-2 max-w-lg">
                      Explorá el sentimiento social, los problemas prioritarios y la percepción de imagen mediante analítica avanzada.
                    </p>
                  </div>
                  <OpinionPublicaDemo />
                </div>
              )}

              {active === 'chatbot' && (
                <div>
                  <div className="mb-6">
                    <span className="text-[var(--color-brand-cyan)] text-xs font-semibold tracking-widest uppercase">Inteligencia Artificial</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold mt-1">Asistente Virtual ConsulBot</h2>
                    <p className="text-brand-secondary text-sm mt-2 max-w-lg">
                      Interactuá con nuestro agente entrenado para resolver dudas municipales, consultar requisitos y realizar trámites de forma automática.
                    </p>
                  </div>
                  <ChatbotDemo />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Demos;
