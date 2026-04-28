import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, Bot, User, Sparkles, 
  MessageCircle, Info, ChevronRight,
  RefreshCw, ThumbsUp, ThumbsDown,
  Clock, MapPin, Search
} from 'lucide-react';

/* ── Constants & Styles ──────────────────────────────── */
const CYAN = 'var(--color-brand-cyan)';

const SUGGESTIONS = [
  "¿Cómo inicio un reclamo de baches?",
  "Requisitos para licencia de conducir",
  "Calendario de vacunación 2024",
  "¿Dónde pago mis impuestos municipales?",
  "Estado de mi trámite REC-82041"
];

const INITIAL_MESSAGES = [
  { 
    role: 'bot', 
    content: '¡Hola! Soy **ConsulBot**, tu asistente inteligente del municipio. Puedo ayudarte con trámites, información de servicios o el seguimiento de tus reclamos. ¿En qué puedo apoyarte hoy?',
    time: '11:50'
  }
];

/* ── MOCK AI RESPONSES ──────────────────────────────── */
const getBotResponse = (input) => {
  const query = input.toLowerCase();
  if (query.includes('reclamo') || query.includes('bache')) {
    return "Para realizar un reclamo de baches u obras, podés usar nuestra sección de **Nuevo Reclamo**. Necesitarás la dirección exacta y una breve descripción. El tiempo estimado de respuesta es de 240hs hábiles.";
  }
  if (query.includes('licencia') || query.includes('conducir')) {
    return "Para la licencia de conducir, debés sacar turno en el centro de emisión más cercano. Requisitos: DNI original, grupo sanguíneo y no tener multas pendientes.";
  }
  if (query.includes('pago') || query.includes('impuesto') || query.includes('rentas')) {
    return "Podés abonar tus tasas municipales en el portal de **Rentas Online** o en bocas de pago como Rapipago/PagoFácil. ¿Querés que te envíe el link al portal?";
  }
  if (query.includes('estado') || query.includes('rec-')) {
    return "Para consultar un expediente específico, por favor dirigite a la pestaña de **Seguimiento** e ingresá el código. Si lo preferís, puedo buscarlo yo si me das el número completo.";
  }
  return "Interesante consulta. Como asistente en entrenamiento, estoy aprendiendo sobre ese tema. Te recomiendo consultar nuestra sección de **Preguntas Frecuentes** o contactar al 0800-MUNICIPIO para atención personalizada.";
};

const ChatbotDemo = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (text) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    const userMsg = { 
      role: 'user', 
      content: messageText, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    };
    
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI delay
    setTimeout(() => {
      const botMsg = {
        role: 'bot',
        content: getBotResponse(messageText),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="glass-elevated border border-[var(--color-brand-cyan)]/20 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[600px] max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-brand-surface/90 backdrop-blur-xl flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--color-brand-cyan)]/20 flex items-center justify-center relative">
            <Bot size={22} className="text-[var(--color-brand-cyan)]" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-brand-bg shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">ConsulBot AI</h3>
            <p className="text-[9px] text-brand-secondary uppercase tracking-widest font-bold">Asistente Municipal Inteligente</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-white/5 rounded-lg text-brand-secondary transition-colors"><RefreshCw size={16} /></button>
          <div className="h-4 w-px bg-white/10 mx-1" />
          <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-emerald-500/20">ONLINE</div>
        </div>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-brand-bg/20 scroll-smooth"
      >
        {messages.map((m, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}
          >
            {m.role === 'bot' && (
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                <Bot size={14} className="text-[var(--color-brand-cyan)]" />
              </div>
            )}
            <div className={`max-w-[80%] space-y-1`}>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-[var(--color-brand-cyan)] text-black font-medium' 
                  : 'bg-brand-surface border border-white/5 text-brand-secondary'
              }`}>
                {m.content.split('\n').map((line, idx) => (
                  <p key={idx} className={idx > 0 ? 'mt-2' : ''}>
                    {line.split('**').map((part, pidx) => 
                      pidx % 2 === 1 ? <span key={pidx} className="font-bold text-white">{part}</span> : part
                    )}
                  </p>
                ))}
              </div>
              <p className={`text-[9px] text-brand-secondary ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                {m.time}
              </p>
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-[var(--color-brand-cyan)]/20 flex items-center justify-center shrink-0">
                <User size={14} className="text-[var(--color-brand-cyan)]" />
              </div>
            )}
          </motion.div>
        ))}

        {isTyping && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start items-end gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-[var(--color-brand-cyan)]" />
            </div>
            <div className="bg-brand-surface border border-white/5 p-3 rounded-2xl flex gap-1">
              <span className="w-1.5 h-1.5 bg-brand-secondary rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-brand-secondary rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-brand-secondary rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t border-white/10 bg-brand-surface/50 backdrop-blur-md">
        <div className="mb-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s, i) => (
            <button 
              key={i} 
              onClick={() => handleSend(s)}
              className="text-[10px] bg-white/5 border border-white/10 hover:border-[var(--color-brand-cyan)]/30 px-3 py-1.5 rounded-full text-brand-secondary hover:text-white transition-all"
            >
              {s}
            </button>
          ))}
        </div>
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex gap-3"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribí tu mensaje aquí..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-3 text-sm focus:border-[var(--color-brand-cyan)] outline-none text-white transition-all"
          />
          <button 
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-[var(--color-brand-cyan)] text-black rounded-2xl flex items-center justify-center hover:bg-cyan-300 transition-all disabled:opacity-30 shadow-[0_0_20px_rgba(0,229,255,0.2)]"
          >
            <Send size={20} />
          </button>
        </form>
        <div className="mt-4 flex items-center justify-center gap-6 text-[10px] text-brand-secondary font-bold uppercase tracking-widest">
          <span className="flex items-center gap-1.5"><Sparkles size={12} className="text-[var(--color-brand-cyan)]" /> AI Powered</span>
          <span className="flex items-center gap-1.5"><Info size={12} /> Privacy Protected</span>
        </div>
      </div>
    </div>
  );
};

export default ChatbotDemo;
