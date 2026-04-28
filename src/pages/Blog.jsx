import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { Link } from 'react-router-dom';

const defaultPosts = [
  { id: 1, title: "Reforma Electoral: Desafíos y Perspectivas para la Democracia Latinoamericana", description: "Los sistemas electorales de la región enfrentan presiones sin precedentes. Analizamos los principales ejes de reforma, la incorporación de tecnología en el voto y el impacto de la desconfianza institucional en los niveles de participación ciudadana.", date: "2026-03-15", imageUrl: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&auto=format&fit=crop" },
  { id: 2, title: "Gestión Municipal y Participación Ciudadana: Nuevos Paradigmas", description: "Las administraciones locales buscan fortalecer vínculos con la ciudadanía a través de mecanismos de consulta y presupuesto participativo. Exploramos casos de éxito y los indicadores clave para medir el impacto de estas iniciativas.", date: "2026-02-28", imageUrl: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800&auto=format&fit=crop" },
  { id: 3, title: "El Rol de los Datos en la Formulación de Políticas Públicas", description: "La evidencia empírica se consolida como base para el diseño de políticas más eficientes. Desde encuestas de opinión hasta modelos predictivos, los gobiernos que invierten en inteligencia de datos obtienen resultados medibles y sostenibles.", date: "2026-01-20", imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop" }
];

const Blog = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('blogPosts') || 'null');
    if (saved && saved.length > 0) {
      setPosts(saved);
    } else {
      setPosts(defaultPosts);
      localStorage.setItem('blogPosts', JSON.stringify(defaultPosts));
    }
  }, []);

  const sorted = [...posts].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="min-h-screen bg-brand-bg pt-28 pb-20">
      <div className="container mx-auto px-6">

        <div className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-brand-secondary hover:text-[var(--color-brand-cyan)] transition-colors text-sm mb-8">
            <ArrowLeft size={16} />
            Volver al inicio
          </Link>
          <div className="flex flex-col items-start">
            <span className="text-[var(--color-brand-cyan)] font-semibold tracking-widest uppercase text-xs mb-3">Publicaciones</span>
            <h1 className="text-4xl md:text-5xl font-display font-bold">Blog</h1>
            <p className="text-brand-secondary mt-4 max-w-xl">
              Análisis, perspectivas y reflexiones sobre política, gestión pública y toma de decisiones basada en evidencia.
            </p>
          </div>
        </div>

        {sorted.length === 0 ? (
          <p className="text-brand-secondary text-center py-20">No hay publicaciones aún.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sorted.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="glass-elevated rounded-2xl overflow-hidden group flex flex-col"
              >
                <div className="aspect-[16/9] overflow-hidden bg-white/5">
                  {post.imageUrl ? (
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={e => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-secondary">
                      <CalendarDays size={32} />
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarDays size={13} className="text-[var(--color-brand-cyan)]" />
                    <time className="text-xs text-brand-secondary">
                      {new Date(post.date + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </time>
                  </div>
                  <h2 className="text-lg font-display font-bold text-white mb-3 leading-snug group-hover:text-[var(--color-brand-cyan)] transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-brand-secondary text-sm leading-relaxed flex-1">
                    {post.description}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
