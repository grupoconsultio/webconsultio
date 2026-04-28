import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BarChart2, Globe, MessageSquare, PieChart, Vote, Map, Briefcase, TrendingUp, Truck, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import ObservatorioDemo from '../components/ObservatorioDemo';
import SistemaReclamosDemo from '../components/SistemaReclamosDemo';
import ChatbotDemo from '../components/ChatbotDemo';
import OpinionPublicaDemo from '../components/OpinionPublicaDemo';
import PresupuestoParticipativoDemo from '../components/PresupuestoParticipativoDemo';
import MapaObrasDemo from '../components/MapaObrasDemo';
import PeopleAnalyticsDemo from '../components/PeopleAnalyticsDemo';
import BusinessIntelligenceDemo from '../components/BusinessIntelligenceDemo';
import LogisticaDemo from '../components/LogisticaDemo';

const products = [
  // SECTOR PÚBLICO
  {
    key: 'observatorio',
    category: 'Público',
    icon: BarChart2,
    title: 'Observatorios de Gestión',
    subtitle: 'Monitoreo en tiempo real por categoría temática',
    description: 'Explorá dashboards interactivos de Salud, Economía y Obras Públicas. Visualizá KPIs, tendencias y distribuciones que transforman datos complejos en decisiones estratégicas.',
    tag: 'Dashboard interactivo',
  },
  {
    key: 'tecnologia',
    category: 'Público',
    icon: Globe,
    title: 'Desarrollo de Tecnología',
    subtitle: 'Sistema de gestión de reclamos',
    description: 'Plataforma de seguimiento y resolución de reclamos ciudadanos, diseñada para organismos públicos y privados.',
    tag: 'Sistema de gestión',
  },
  {
    key: 'participacion',
    category: 'Público',
    icon: Vote,
    title: 'Participación Ciudadana',
    subtitle: 'Presupuesto Participativo Digital',
    description: 'Gestión de votos y asignación de presupuesto a los proyectos que transformarán tu ciudad.',
    tag: 'Democracia Digital',
  },
  {
    key: 'obras',
    category: 'Público',
    icon: Map,
    title: 'Transparencia de Obras',
    subtitle: 'Mapa interactivo de obra pública',
    description: 'Seguimiento físico y financiero de proyectos de infraestructura con comparativas visuales y datos abiertos para el ciudadano.',
    tag: 'Transparencia',
  },
  {
    key: 'opinion',
    category: 'Público',
    icon: PieChart,
    title: 'Análisis de Opinión',
    subtitle: 'Estudios de opinión pública y encuestas',
    description: 'Visualizá el humor social, preocupaciones ciudadanas y percepción de imagen mediante dashboards analíticos de alta precisión.',
    tag: 'Análisis Estratégico',
  },
  {
    key: 'chatbot',
    category: 'General',
    icon: MessageSquare,
    title: 'Asistente de IA',
    subtitle: 'Chatbot municipal inteligente',
    description: 'Atención al ciudadano 24/7 mediante inteligencia artificial. Resolución de dudas frecuentes, trámites y derivación inteligente.',
    tag: 'Inteligencia Artificial',
  },
  // SECTOR PRIVADO
  {
    key: 'people',
    category: 'Privado',
    icon: Briefcase,
    title: 'People Analytics',
    subtitle: 'Análisis estratégico de talento',
    description: 'Optimizá la gestión de recursos humanos con datos sobre clima organizacional, rotación, eNPS y desarrollo de carrera.',
    tag: 'Corporate Insight',
  },
  {
    key: 'bi',
    category: 'Privado',
    icon: TrendingUp,
    title: 'Business Intelligence & IA',
    subtitle: 'Dashboard de ventas e Inteligencia Artificial',
    description: 'Consolidá tus ventas y conversiones en tiempo real. Incluye un Analista de IA integrado para consultas directas sobre tus datos de negocio.',
    tag: 'Sales Intelligence',
  },
  {
    key: 'logistica',
    category: 'Privado',
    icon: Truck,
    title: 'Logística & Operaciones',
    subtitle: 'Monitoreo de eficiencia operativa',
    description: 'Visualizá tu flota, tiempos de entrega y niveles de stock en tiempo real para optimizar la cadena de suministro.',
    tag: 'Ops Excellence',
  },
];

const Demos = () => {
  const [active, setActive] = useState(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [active]);

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
            Explorá algunas de las herramientas que desarrollamos. Estos son proyectos modelo: además de estas soluciones, diseñamos estrategias a medida para resolver cualquier desafío que su organización enfrente. Transformamos necesidades en soluciones tecnológicas y analíticas personalizadas.
          </p>
        </div>

        {/* Product cards grouped by Sector */}
        {!active && (
          <div className="space-y-16">
            {/* Sector Público */}
            <div className="space-y-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-brand-secondary border-l-2 border-[var(--color-brand-cyan)] pl-4">Sector Público</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.filter(p => p.category === 'Público' || p.category === 'General').map((p) => {
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
              </div>
            </div>

            {/* Sector Privado */}
            <div className="space-y-8">
              <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-brand-secondary border-l-2 border-purple-500 pl-4">Sector Privado</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.filter(p => p.category === 'Privado').map((p) => {
                  const Icon = p.icon;
                  return (
                    <motion.div
                      key={p.key}
                      whileHover={{ y: -6 }}
                      onClick={() => setActive(p.key)}
                      className="glass-elevated rounded-3xl p-8 flex flex-col gap-6 border border-white/5 transition-all duration-300 cursor-pointer hover:border-purple-500/30"
                    >
                      <div className="flex items-start justify-between">
                        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 flex items-center justify-center">
                          <Icon size={26} className="text-purple-500" />
                        </div>
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-500/10 text-purple-500">
                          {p.tag}
                        </span>
                      </div>
                      <div>
                        <h2 className="text-xl font-display font-bold text-white mb-1">{p.title}</h2>
                        <p className="text-sm text-purple-400 mb-3 font-medium">{p.subtitle}</p>
                        <p className="text-brand-secondary text-sm leading-relaxed line-clamp-3">{p.description}</p>
                      </div>
                      <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold mt-auto">
                        Ver demo <ChevronRight size={16} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
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

              {active === 'people' && (
                <div>
                  <div className="mb-6">
                    <span className="text-purple-400 text-xs font-semibold tracking-widest uppercase">People Analytics</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold mt-1">Gestión Estratégica del Talento</h2>
                    <p className="text-brand-secondary text-sm mt-2 max-w-lg">
                      Transformá la gestión de personas con datos sobre clima, rotación y desarrollo para maximizar el potencial de su organización.
                    </p>
                  </div>
                  <PeopleAnalyticsDemo />
                </div>
              )}

              {active === 'bi' && (
                <div>
                  <div className="mb-6">
                    <span className="text-purple-400 text-xs font-semibold tracking-widest uppercase">Business Intelligence</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold mt-1">Inteligencia Comercial & IA</h2>
                    <p className="text-brand-secondary text-sm mt-2 max-w-lg">
                      Consolidá tus ventas y conversiones en tiempo real con un Analista de IA integrado para decisiones basadas en datos.
                    </p>
                  </div>
                  <BusinessIntelligenceDemo />
                </div>
              )}

              {active === 'logistica' && (
                <div>
                  <div className="mb-6">
                    <span className="text-purple-400 text-xs font-semibold tracking-widest uppercase">Eficiencia Operativa</span>
                    <h2 className="text-2xl md:text-3xl font-display font-bold mt-1">Logística & Supply Chain</h2>
                    <p className="text-brand-secondary text-sm mt-2 max-w-lg">
                      Optimizá tus operaciones en tiempo real: desde el seguimiento de flota hasta el control inteligente de stock y entregas.
                    </p>
                  </div>
                  <LogisticaDemo />
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
