import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  LayoutDashboard, 
  Users, 
  MonitorSmartphone, 
  LineChart, 
  Target, 
  ArrowUpRight,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

const services = [
  {
    id: 'tab1',
    number: '01',
    title: 'Estudios de Opinión y Encuestas',
    subtitle: 'CONOCER LO QUE LA GENTE PIENSA Y SIENTE',
    shortDesc: 'Medimos de forma clara y precisa la percepción de tus clientes, ciudadanos o votantes.',
    fullDesc: 'Hacemos encuestas confiables para saber con exactitud qué opina la gente sobre tu marca, tu gestión o tus servicios. Te entregamos informes claros y fáciles de leer para que tomes decisiones con seguridad, sin basarte en suposiciones.',
    highlights: [
      'Encuestas presenciales, telefónicas y digitales',
      'Conocé qué valoran y qué reclaman clientes o vecinos',
      'Medición de imagen pública, satisfacción y confianza',
      'Informes claros con gráficos que se entienden a simple vista'
    ],
    icon: Search
  },
  {
    id: 'tab2',
    number: '02',
    title: 'Clima Laboral y Equipos de Trabajo',
    subtitle: 'ESCUCHAR Y MOTIVAR A TU EQUIPO',
    shortDesc: 'Evaluamos el ambiente de trabajo para saber cómo se sienten tus colaboradores y mejorar su rendimiento.',
    fullDesc: 'Un equipo motivado trabaja mejor y alcanza más rápido los objetivos. Consultamos de manera anónima y profesional a tus colaboradores para detectar problemas a tiempo, reducir el malestar laboral y fortalecer el compromiso de todos.',
    highlights: [
      'Diagnósticos del ambiente y bienestar en el trabajo',
      'Detección temprana de conflictos y problemas internos',
      'Identificación de áreas que necesitan apoyo o mejoras',
      'Pautas prácticas para que el equipo trabaje con mayor entusiasmo'
    ],
    icon: Users
  },
  {
    id: 'tab3',
    number: '03',
    title: 'Tableros de Control y Datos en Vivo',
    subtitle: 'TODA TU INFORMACIÓN EN UNA SOLA PANTALLA',
    shortDesc: 'Unimos los datos de tu empresa u organismo en pantallas interactivas para que veas en tiempo real cómo marcha todo.',
    fullDesc: 'Dejá de perder tiempo buscando datos en planillas de cálculo dispersas. Diseñamos pantallas simples y visuales donde podés ver minuto a minuto tus ventas, ingresos, gastos o indicadores de gestión, accesibles desde tu computadora o celular.',
    highlights: [
      'Todo en un solo lugar: ventas, clientes, costos y reclamos',
      'Información actualizada al instante, sin esperar a fin de mes',
      'Diseño simple y visual, sin complicaciones técnicas',
      'Acceso seguro desde cualquier computadora, tablet o teléfono'
    ],
    icon: LineChart
  },
  {
    id: 'tab4',
    number: '04',
    title: 'Observatorios y Mapas de Gestión',
    subtitle: 'SABER QUÉ PASA EN CADA LUGAR Y EN CADA MOMENTO',
    shortDesc: 'Mapas interactivos para ubicar sobre el territorio dónde están las necesidades, los reclamos y las obras.',
    fullDesc: 'Permite a directivos y autoridades ver sobre un mapa qué está ocurriendo en cada barrio, sucursal o región. Podés seguir el avance de proyectos, reclamos y servicios para responder con mayor rapidez donde más hace falta.',
    highlights: [
      'Mapas visuales con puntos de interés, sucursales o reclamos',
      'Seguimiento de tiempos de respuesta y solución de problemas',
      'Alertas automáticas ante demoras o situaciones urgentes',
      'Herramienta ideal para coordinar equipos en la calle o en terreno'
    ],
    icon: LayoutDashboard
  },
  {
    id: 'tab5',
    number: '05',
    title: 'Sistemas y Páginas Web a Medida',
    subtitle: 'HERRAMIENTAS DIGITALES Y AUTOMATIZACIÓN',
    shortDesc: 'Creamos sitios web modernos y sistemas personalizados para automatizar tareas, optimizar procesos y resolver cualquier necesidad digital.',
    fullDesc: 'Desarrollamos soluciones digitales prácticas y a medida: desde páginas web modernas hasta sistemas personalizados para automatizar procesos, gestionar información y resolver cualquier desafío operativo de tu organización, sin enredos técnicos ni complicaciones.',
    highlights: [
      'Páginas web rápidas, modernas y adaptadas a celulares',
      'Sistemas y plataformas personalizadas según tus necesidades',
      'Automatización de procesos y tareas para ahorrar tiempo y errores',
      'Mantenimiento continuo y soporte técnico cercano'
    ],
    icon: MonitorSmartphone
  },
  {
    id: 'tab6',
    number: '06',
    title: 'Evaluación de Proyectos y Presupuestos',
    subtitle: 'CUIDAR RECURSOS Y MEDIR RESULTADOS',
    shortDesc: 'Te ayudamos a planificar tus gastos, optimizar tus recursos y verificar que cada inversión dé frutos.',
    fullDesc: 'Analizamos cómo se usan los recursos para asegurar que cada inversión rinda al máximo. Medimos si un programa, campaña o proyecto realmente cumplió sus metas y te damos recomendaciones concretas para optimizar tus presupuestos.',
    highlights: [
      'Análisis claro de ingresos, gastos y rendimiento de la inversión',
      'Medición del impacto real de programas y proyectos',
      'Detección de gastos innecesarios o áreas donde ahorrar dinero',
      'Informes ejecutivos con sugerencias prácticas para mejorar'
    ],
    icon: Target
  }
];

const Services = () => {
  const [activeTab, setActiveTab] = useState(services[0].id);

  const activeService = services.find(s => s.id === activeTab) || services[0];
  const ActiveIcon = activeService.icon;

  const handleSolicitarInfo = () => {
    window.dispatchEvent(new CustomEvent('select-solution', { detail: activeService.title }));
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="services" className="pt-16 md:pt-20 pb-4 md:pb-6 bg-brand-bg relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        
        {/* Section Header: Perfectly Leveled Title and Description */}
        <div className="mb-12 md:mb-14 border-b border-white/10 pb-8">
          <div className="olivia-tag mb-4">
            <span>SOLUCIONES //</span>
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-12">
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-black tracking-tight uppercase leading-none text-white">
              ¿QUÉ HACEMOS?
            </h2>
            <div className="md:max-w-xl">
              <p className="text-base md:text-lg text-white/70 font-sans leading-relaxed">
                Ayudamos a líderes y organizaciones a tomar mejores decisiones con información clara y confiable, combinando análisis de datos, herramientas tecnológicas y acompañamiento profesional.
              </p>
            </div>
          </div>
        </div>

        {/* Olivia Signature Interactive Tabbed Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 mb-0 items-start">
          
          {/* Left Column: Active Service Details Card */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeService.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="olivia-card p-8 md:p-12 relative overflow-hidden"
              >
                {/* Header of Active Service */}
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-brand-cyan)]/10 border border-[var(--color-brand-cyan)]/30 flex items-center justify-center text-[var(--color-brand-cyan)]">
                      <ActiveIcon size={28} />
                    </div>
                    <div>
                      <span className="text-[11px] font-display font-bold tracking-[0.2em] text-[var(--color-brand-cyan)] uppercase block">
                        {activeService.subtitle}
                      </span>
                    </div>
                  </div>
                  <span className="text-4xl md:text-5xl font-display font-black text-white/10">
                    {activeService.number}
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tight mb-5">
                  {activeService.title}
                </h3>

                <p className="text-base md:text-lg text-white/80 leading-relaxed font-sans mb-8">
                  {activeService.fullDesc}
                </p>

                {/* Highlights List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 pt-6 border-t border-white/10">
                  {activeService.highlights.map((h, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-white/70">
                      <CheckCircle2 size={16} className="text-[var(--color-brand-cyan)] mt-0.5 flex-shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Action Button: Only Solicitar Información, taking user to Agendar Reunión */}
                <div className="pt-2">
                  <button
                    onClick={handleSolicitarInfo}
                    className="btn-primary text-xs md:text-sm py-3.5 px-8 flex items-center gap-2 group cursor-pointer shadow-[0_0_20px_rgba(255,255,255,0.15)]"
                  >
                    <span>Solicitar Información</span>
                    <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </button>
                </div>

                {/* Background decorative element */}
                <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-[var(--color-brand-cyan)]/10 rounded-full blur-[90px] pointer-events-none" />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Olivia-style Vertical Interactive Tabs */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <span className="text-[11px] font-display font-bold tracking-[0.25em] text-white/40 uppercase mb-2 pl-2">
              SELECCIONA UNA SOLUCIÓN //
            </span>
            {services.map((service) => {
              const isActive = activeService.id === service.id;
              return (
                <button
                  key={service.id}
                  onClick={() => setActiveTab(service.id)}
                  onMouseEnter={() => setActiveTab(service.id)}
                  className={`w-full text-left p-5 rounded-2xl transition-all duration-300 flex items-center justify-between group border cursor-pointer ${
                    isActive 
                      ? 'bg-white/10 border-[var(--color-brand-cyan)]/50 shadow-[0_0_25px_rgba(0,229,255,0.15)] translate-x-1.5' 
                      : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.05]'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-mono font-bold transition-colors ${isActive ? 'text-[var(--color-brand-cyan)]' : 'text-white/40 group-hover:text-white'}`}>
                      {service.number}
                    </span>
                    <div>
                      <span className={`text-base font-display font-bold uppercase tracking-tight block transition-colors ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>
                        {service.title}
                      </span>
                    </div>
                  </div>
                  <ChevronRight 
                    size={18} 
                    className={`transition-all duration-300 ${
                      isActive 
                        ? 'text-[var(--color-brand-cyan)] translate-x-1' 
                        : 'text-white/30 group-hover:text-white group-hover:translate-x-0.5'
                    }`} 
                  />
                </button>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};

export default Services;
