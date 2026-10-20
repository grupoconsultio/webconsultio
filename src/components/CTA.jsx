import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Mail, Calendar, CheckCircle2, Phone, MessageSquare, Sparkles, Loader2 } from 'lucide-react';

const solutionsList = [
  'Estudios de Opinión y Encuestas',
  'Clima Laboral y Equipos',
  'Tableros de Control y Datos',
  'Observatorios y Mapas de Gestión',
  'Sistemas y Páginas Web',
  'Evaluación y Presupuestos',
  'Otro'
];

const CTA = () => {
  const [formMode, setFormMode] = useState(null); // null | 'reunion' | 'contacto'
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulario Reunión
  const [meetingData, setMeetingData] = useState({
    name: '',
    solution: 'Estudios de Opinión y Encuestas',
    solutionDetail: '',
    phone: '',
    email: ''
  });

  // Formulario Contacto General
  const [contactData, setContactData] = useState({
    name: '',
    phone: '',
    email: '',
    reason: ''
  });

  // Escuchar cuando el usuario hace clic en "Solicitar Información" desde alguna solución
  useEffect(() => {
    const handleSelectSolution = (e) => {
      const solutionName = e.detail;
      setFormMode('reunion');
      if (solutionName) {
        setMeetingData(prev => ({
          ...prev,
          solution: solutionsList.includes(solutionName) ? solutionName : 'Otro',
          solutionDetail: !solutionsList.includes(solutionName) ? solutionName : prev.solutionDetail
        }));
      }
    };
    window.addEventListener('select-solution', handleSelectSolution);
    return () => window.removeEventListener('select-solution', handleSelectSolution);
  }, []);

  const saveToStorageAndBackend = async (payload) => {
    // 1. Guardar en localStorage para persistencia y lectura inmediata en el Admin
    try {
      const existing = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      existing.unshift(payload);
      localStorage.setItem('contactSubmissions', JSON.stringify(existing));

      // Guardar también en meetings para compatibilidad
      const meetings = JSON.parse(localStorage.getItem('meetings') || '[]');
      meetings.unshift({ ...payload, date: payload.createdAt });
      localStorage.setItem('meetings', JSON.stringify(meetings));
    } catch (e) {
      console.warn('Error guardando en localStorage:', e);
    }

    // 2. Enviar a la API del servidor (que dispara notificaciones de Resend)
    try {
      await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('Backend offline o endpoint local no accesible:', e);
    }
  };

  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    if (!meetingData.name || !meetingData.phone || !meetingData.email) return;

    setIsSubmitting(true);
    // Centrar la vista inmediatamente a la altura del formulario para ver el procesamiento
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const payload = {
      id: 'reunion_' + Date.now(),
      type: 'reunion',
      name: meetingData.name,
      solution: meetingData.solution,
      solutionDetail: meetingData.solution === 'Otro' ? meetingData.solutionDetail : (meetingData.solutionDetail || ''),
      phone: meetingData.phone,
      email: meetingData.email,
      status: 'Nuevo',
      createdAt: new Date().toISOString()
    };

    await saveToStorageAndBackend(payload);

    setIsSubmitting(false);
    setSuccess(true);

    // Reposicionar al centro exacto del mensaje de éxito
    setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    setTimeout(() => {
      setSuccess(false);
      setFormMode(null);
      setMeetingData({
        name: '',
        solution: 'Estudios de Opinión y Encuestas',
        solutionDetail: '',
        phone: '',
        email: ''
      });
    }, 6000);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactData.name || !contactData.phone || !contactData.email || !contactData.reason) return;

    setIsSubmitting(true);
    // Centrar la vista inmediatamente a la altura del formulario para ver el procesamiento
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const payload = {
      id: 'contacto_' + Date.now(),
      type: 'contacto',
      name: contactData.name,
      phone: contactData.phone,
      email: contactData.email,
      reason: contactData.reason,
      solution: 'Consulta General',
      status: 'Nuevo',
      createdAt: new Date().toISOString()
    };

    await saveToStorageAndBackend(payload);

    setIsSubmitting(false);
    setSuccess(true);

    // Reposicionar al centro exacto del mensaje de éxito
    setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);

    setTimeout(() => {
      setSuccess(false);
      setFormMode(null);
      setContactData({
        name: '',
        phone: '',
        email: '',
        reason: ''
      });
    }, 6000);
  };

  return (
    <section id="contact" className="pt-2 md:pt-4 pb-20 md:pb-28 bg-brand-bg relative overflow-hidden">
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="olivia-card p-8 md:p-16 text-center relative overflow-hidden flex items-center justify-center min-h-[460px]"
        >
          {/* Subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-[var(--color-brand-cyan)]/10 via-transparent to-transparent opacity-40 pointer-events-none" />

          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative z-10 flex flex-col items-center flex-1 py-8 max-w-lg mx-auto"
              >
                <div className="w-16 h-16 rounded-full bg-[var(--color-brand-cyan)]/20 border border-[var(--color-brand-cyan)] flex items-center justify-center text-[var(--color-brand-cyan)] mb-5 shadow-[0_0_30px_rgba(0,229,255,0.3)]">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl md:text-3xl font-display font-black uppercase text-white mb-3">
                  ¡Solicitud Enviada con Éxito!
                </h3>
                <p className="text-white/70 font-sans text-sm md:text-base leading-relaxed mb-6">
                  Hemos recibido tus datos correctamente. Nuestro equipo se pondrá en contacto contigo a la brevedad vía WhatsApp o correo electrónico para coordinar los detalles.
                </p>
                <button
                  onClick={() => { setSuccess(false); setFormMode(null); }}
                  className="btn-secondary text-xs px-6 py-2.5"
                >
                  Cerrar
                </button>
              </motion.div>

            ) : formMode === 'reunion' ? (
              // FORMULARIO: AGENDAR REUNIÓN ESTRATÉGICA
              <motion.form 
                key="form-reunion"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleMeetingSubmit}
                className="relative z-10 w-full max-w-2xl mx-auto text-left flex flex-col gap-5 p-6 md:p-10 rounded-3xl bg-black/80 border border-white/10 backdrop-blur-xl"
              >
                <div className="text-center pb-4 border-b border-white/10">
                  <div className="olivia-tag mx-auto mb-3">
                    <Calendar size={13} />
                    <span>COORDINAR ENCUENTRO //</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-black uppercase text-white mb-2">
                    Agendar Reunión Estratégica
                  </h3>
                  <p className="text-xs md:text-sm text-white/60 font-sans max-w-md mx-auto">
                    Completa tus datos de contacto y la solución que deseas consultar. Coordinaremos la fecha y hora directamente contigo.
                  </p>
                </div>

                {/* Nombre / Organización */}
                <div>
                  <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-2">
                    Nombre Completo / Organización *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Martín Gómez - Empresa / Municipio"
                    value={meetingData.name} 
                    onChange={e => setMeetingData({...meetingData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
                  />
                </div>

                {/* Selector de Soluciones */}
                <div>
                  <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-2.5">
                    Solución de Interés *
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {solutionsList.map((sol) => {
                      const isSelected = meetingData.solution === sol;
                      return (
                        <button
                          type="button"
                          key={sol}
                          onClick={() => setMeetingData({...meetingData, solution: sol})}
                          className={`px-3.5 py-2 rounded-xl text-xs font-display font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--color-brand-cyan)] text-black font-black shadow-[0_0_15px_rgba(0,229,255,0.3)]'
                              : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
                          }`}
                        >
                          {sol}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Detalle opcional (especialmente si elige "Otro") */}
                <div>
                  <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5">
                    Detalle o consulta específica {meetingData.solution === 'Otro' ? '(Por favor especifica)' : '(Opcional)'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={meetingData.solution === 'Otro' ? 'Cuéntanos brevemente qué necesitas...' : 'Puedes agregar detalles adicionales sobre tu proyecto o necesidad...'}
                    value={meetingData.solutionDetail}
                    onChange={e => setMeetingData({...meetingData, solutionDetail: e.target.value})}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors resize-none"
                  />
                </div>

                {/* Datos de Contacto (Celular y Email) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5 flex items-center gap-1.5">
                      <Phone size={12} className="text-[var(--color-brand-cyan)]" /> Celular / WhatsApp *
                    </label>
                    <input 
                      type="tel" 
                      required
                      placeholder="+54 9 358 123456"
                      value={meetingData.phone} 
                      onChange={e => setMeetingData({...meetingData, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5 flex items-center gap-1.5">
                      <Mail size={12} className="text-[var(--color-brand-cyan)]" /> Correo Electrónico *
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder="ejemplo@organizacion.com"
                      value={meetingData.email} 
                      onChange={e => setMeetingData({...meetingData, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
                    />
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-4 pt-3 border-t border-white/10 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setFormMode(null)} 
                    className="flex-1 py-3 text-xs font-display font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors"
                  >
                    Volver
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 btn-primary py-3 text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin text-black" />
                        <span>Enviando solicitud...</span>
                      </>
                    ) : (
                      <>
                        <span>Confirmar Solicitud</span>
                        <ArrowUpRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>

            ) : formMode === 'contacto' ? (
              // FORMULARIO: CONTÁCTANOS GENERAL
              <motion.form 
                key="form-contacto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleContactSubmit}
                className="relative z-10 w-full max-w-xl mx-auto text-left flex flex-col gap-5 p-6 md:p-10 rounded-3xl bg-black/80 border border-white/10 backdrop-blur-xl"
              >
                <div className="text-center pb-4 border-b border-white/10">
                  <div className="olivia-tag mx-auto mb-3">
                    <MessageSquare size={13} />
                    <span>CANAL DIRECTO //</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-display font-black uppercase text-white mb-2">
                    Contáctanos
                  </h3>
                  <p className="text-xs md:text-sm text-white/60 font-sans max-w-md mx-auto">
                    Déjanos tu mensaje o consulta general y nuestro equipo se comunicará contigo de inmediato.
                  </p>
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5">
                    Nombre y Apellido *
                  </label>
                  <input 
                    type="text" 
                    required
                    placeholder="Tu nombre"
                    value={contactData.name} 
                    onChange={e => setContactData({...contactData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
                  />
                </div>

                {/* Celular y Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5 flex items-center gap-1.5">
                      <Phone size={12} className="text-[var(--color-brand-cyan)]" /> Celular / WhatsApp *
                    </label>
                    <input 
                      type="tel" 
                      required
                      placeholder="+54 9 358 123456"
                      value={contactData.phone} 
                      onChange={e => setContactData({...contactData, phone: e.target.value})}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5 flex items-center gap-1.5">
                      <Mail size={12} className="text-[var(--color-brand-cyan)]" /> Correo Electrónico *
                    </label>
                    <input 
                      type="email" 
                      required
                      placeholder="ejemplo@correo.com"
                      value={contactData.email} 
                      onChange={e => setContactData({...contactData, email: e.target.value})}
                      className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors"
                    />
                  </div>
                </div>

                {/* Motivo de Consulta */}
                <div>
                  <label className="block text-xs font-display font-bold uppercase tracking-wider text-white/80 mb-1.5">
                    Motivo de Consulta *
                  </label>
                  <textarea 
                    rows={3}
                    required
                    placeholder="¿En qué podemos ayudarte o qué duda tienes?"
                    value={contactData.reason} 
                    onChange={e => setContactData({...contactData, reason: e.target.value})}
                    className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--color-brand-cyan)] transition-colors resize-none"
                  />
                </div>

                {/* Botones de acción */}
                <div className="flex gap-4 pt-3 border-t border-white/10 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setFormMode(null)} 
                    className="flex-1 py-3 text-xs font-display font-bold uppercase tracking-wider text-white/60 hover:text-white transition-colors"
                  >
                    Volver
                  </button>
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex-1 btn-primary py-3 text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={15} className="animate-spin text-black" />
                        <span>Enviando mensaje...</span>
                      </>
                    ) : (
                      <>
                        <span>Enviar Mensaje</span>
                        <ArrowUpRight size={15} />
                      </>
                    )}
                  </button>
                </div>
              </motion.form>

            ) : (
              // VISTA PRINCIPAL POR DEFECTO
              <motion.div 
                key="cta-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative z-10 max-w-3xl mx-auto w-full"
              >
                <div className="olivia-tag mb-6">
                  <span>TRANSFORMACIÓN ESTRATÉGICA //</span>
                </div>

                <h2 className="text-3xl sm:text-5xl md:text-6xl font-display font-black uppercase tracking-tight text-white mb-6 leading-tight">
                  ¿Listo para <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white/95 to-[var(--color-brand-cyan)]">potenciar</span> su gestión?
                </h2>

                <p className="text-base md:text-xl text-white/70 mb-10 max-w-xl mx-auto font-sans leading-relaxed">
                  Únase a gobiernos y organizaciones que ya transforman datos en decisiones estratégicas.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                  <button 
                    onClick={() => setFormMode('reunion')}
                    className="btn-primary group"
                  >
                    <span>Agendar Reunión</span>
                    <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </button>

                  <button
                    onClick={() => setFormMode('contacto')}
                    className="btn-secondary group"
                  >
                    <Mail size={16} />
                    <span>Contáctenos</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Decorative glows */}
          <div className="absolute -top-10 -left-10 w-44 h-44 bg-[var(--color-brand-cyan)]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
