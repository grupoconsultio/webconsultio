import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Mail, Calendar, CheckCircle } from 'lucide-react';

const CTA = () => {
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', date: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if(formData.name && formData.email && formData.date) {
      const meetings = JSON.parse(localStorage.getItem('meetings') || '[]');
      meetings.push({ ...formData, id: Date.now(), status: 'Pendiente' });
      localStorage.setItem('meetings', JSON.stringify(meetings));
      setSuccess(true);
      setTimeout(() => {
        setShowForm(false);
        setSuccess(false);
        setFormData({ name: '', email: '', date: '' });
      }, 3000);
    }
  };

  return (
    <section id="contact" className="py-24 bg-brand-bg relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative glass-elevated p-12 md:p-20 rounded-[3rem] overflow-hidden text-center min-h-[400px] flex items-center justify-center"
        >
          {/* Background Highlight */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-br from-[var(--color-brand-cyan)]/5 via-transparent to-transparent opacity-50" />
          
          <AnimatePresence mode="wait">
            {!showForm && !success ? (
              <motion.div 
                key="cta-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative z-10 max-w-3xl mx-auto w-full"
              >
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-8 leading-tight">
                  ¿Listo para <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[var(--color-brand-cyan)]">potenciar</span> su gestión?
                </h2>
                <p className="text-xl text-brand-secondary mb-12 max-w-xl mx-auto">
                  Únase a gobiernos y organizaciones que ya transforman datos en decisiones estratégicas.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <button 
                    onClick={() => setShowForm(true)}
                    className="btn-primary flex items-center gap-2 group"
                  >
                    Agendar Reunión
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="flex items-center gap-2 text-white font-semibold hover:text-[var(--color-brand-cyan)] transition-colors">
                    <Mail size={20} />
                    Contáctenos
                  </button>
                </div>
              </motion.div>
            ) : success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative z-10 flex flex-col items-center flex-1"
              >
                <CheckCircle className="w-20 h-20 text-[var(--color-brand-cyan)] mb-6" />
                <h3 className="text-3xl font-display font-bold text-white mb-2">¡Reunión Agendada!</h3>
                <p className="text-brand-secondary">Nos pondremos en contacto a la brevedad para confirmar los detalles.</p>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                onSubmit={handleSubmit}
                className="relative z-10 w-full max-w-md mx-auto text-left flex flex-col gap-4"
              >
                <h3 className="text-2xl font-display font-bold text-white mb-4 text-center flex items-center justify-center gap-2">
                  <Calendar className="text-[var(--color-brand-cyan)]" /> Agendar Reunión
                </h3>
                
                <div>
                  <label className="block text-sm text-brand-secondary mb-2">Nombre / Organización</label>
                  <input 
                    type="text" required
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-cyan)]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-brand-secondary mb-2">Correo Electrónico</label>
                  <input 
                    type="email" required
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-cyan)]"
                  />
                </div>
                <div>
                  <label className="block text-sm text-brand-secondary mb-2">Fecha Propuesta</label>
                  <input 
                    type="date" required
                    value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[var(--color-brand-cyan)]"
                     style={{ colorScheme: 'dark' }}
                  />
                </div>

                <div className="flex gap-4 mt-4">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 text-brand-secondary hover:text-white transition-colors">
                    Cancelar
                  </button>
                  <button type="submit" className="flex-1 btn-primary py-3">
                    Confirmar
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Floating elements */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[var(--color-brand-cyan)]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-[var(--color-brand-cyan)]/10 rounded-full blur-3xl pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;

