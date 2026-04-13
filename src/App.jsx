import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Admin from './pages/Admin';
import { motion, useScroll, useSpring } from 'framer-motion';

const MainLanding = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-[var(--color-brand-cyan)] z-[60] origin-left"
        style={{ scaleX }}
      />
      <Navbar />
      <main>
        <Hero />
        <About />
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <Services />
        </motion.div>
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <div className="bg-brand-bg min-h-screen selection:bg-[var(--color-brand-cyan)] selection:text-black text-brand-accent font-sans">
      <Routes>
        <Route path="/" element={<MainLanding />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>

      {/* Global Background visual flair */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] bg-[var(--color-brand-cyan)]/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-[10%] right-[-10%] w-[50%] h-[50%] bg-white/5 rounded-full blur-[180px]" />
      </div>
    </div>
  );
}

export default App;

