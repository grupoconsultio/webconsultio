import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { Quote } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

const defaultTestimonials = [
  {
    id: 1,
    text: "Consultio transformó por completo nuestra gestión de datos. Su atención al detalle y enfoque estratégico es inigualable.",
    author: "Alejandro Ruiz",
    role: "Secretario de Innovación",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    id: 2,
    text: "Los resultados fueron inmediatos. El observatorio de gestión nos permitió tomar decisiones basadas en evidencia real.",
    author: "Elena Rodríguez",
    role: "Directora de Operaciones",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    id: 3,
    text: "Servicio excepcional y de alta calidad técnica. Entienden las dinámicas tanto del sector público como privado.",
    author: "Marcos Torres",
    role: "Fundador, Zenith Corp",
    avatar: "https://randomuser.me/api/portraits/men/67.jpg"
  },
  {
    id: 4,
    text: "Una experiencia verdaderamente profesional. Absoluta confidencialidad y rigor metodológico en cada etapa del estudio.",
    author: "Sara Jiménez",
    role: "VP Marketing",
    avatar: "https://randomuser.me/api/portraits/women/68.jpg"
  }
];

const Testimonials = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('testimonials');
    if (saved && JSON.parse(saved).length > 0) {
      setData(JSON.parse(saved));
    } else {
      setData(defaultTestimonials);
      localStorage.setItem('testimonials', JSON.stringify(defaultTestimonials));
    }
  }, []);

  return (
    <section id="testimonials" className="py-24 bg-brand-surface relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <span className="text-[var(--color-brand-cyan)] font-semibold tracking-widest uppercase text-xs">Testimonios</span>
          <h2 className="text-4xl md:text-6xl font-display font-bold mt-4">Confían en Nosotros</h2>
        </div>

        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
          className="pb-16"
        >
          {data.map((item, index) => (
            <SwiperSlide key={index}>
              <div className="p-10 glass rounded-3xl h-full flex flex-col justify-between border border-white/5 bg-white/[0.02]">
                <div>
                  <Quote className="text-white/20 w-12 h-12 mb-6" />
                  <p className="text-lg text-white/90 leading-relaxed italic mb-8">
                    "{item.text}"
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <img 
                    src={item.avatar} 
                    alt={item.author} 
                    className="w-12 h-12 rounded-full object-cover grayscale brightness-125"
                  />
                  <div>
                    <h4 className="font-bold text-white">{item.author}</h4>
                    <p className="text-xs text-brand-secondary">{item.role}</p>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Decorative */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-white/[0.02] to-transparent pointer-events-none" />
    </section>
  );
};

export default Testimonials;
