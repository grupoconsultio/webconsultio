import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Services from './components/Services';
import CTA from './components/CTA';
import Footer from './components/Footer';
import Admin from './pages/Admin';
import AdminLogin from './pages/AdminLogin';
import Demos from './pages/Demos';
import MapaIndicadores from './pages/MapaIndicadores';
import EncuestaPapaDashboard from './pages/EncuestaPapaDashboard';
import EncuestaSanLuisDashboard from './pages/EncuestaSanLuisDashboard';
import EncuestaRioTerceroDashboard from './pages/EncuestaRioTerceroDashboard';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import { motion, useScroll, useSpring } from 'framer-motion';

import Lenis from 'lenis';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = sessionStorage.getItem('adminAuth') === '1';
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const LoginOrAdmin = () => {
  const [isAuth, setIsAuth] = React.useState(() => sessionStorage.getItem('adminAuth') === '1');

  if (isAuth) {
    return <Admin />;
  }

  return <AdminLogin onLoginSuccess={() => setIsAuth(true)} />;
};

const MainLanding = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Olivia-style Smooth Scroll with Lenis
  React.useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--color-brand-cyan)] to-white z-[60] origin-left shadow-[0_0_10px_rgba(0,229,255,0.8)]"
        style={{ scaleX }}
      />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Services />
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
        <Route path="/login" element={<LoginOrAdmin />} />
        <Route path="/admin/login" element={<Navigate to="/login" replace />} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/admin/encuesta-papa" element={<ProtectedRoute><EncuestaPapaDashboard /></ProtectedRoute>} />
        <Route path="/encuesta-papa" element={<EncuestaPapaDashboard />} />
        <Route path="/admin/encuesta-san-luis" element={<ProtectedRoute><EncuestaSanLuisDashboard /></ProtectedRoute>} />
        <Route path="/encuesta-san-luis" element={<EncuestaSanLuisDashboard />} />
        <Route path="/admin/encuesta-rio-tercero" element={<ProtectedRoute><EncuestaRioTerceroDashboard /></ProtectedRoute>} />
        <Route path="/encuesta-rio-tercero" element={<EncuestaRioTerceroDashboard />} />
        <Route path="/demos" element={<><Navbar /><Demos /><Footer /></>} />
        <Route path="/mapa" element={<ProtectedRoute><MapaIndicadores /></ProtectedRoute>} />
        <Route path="/terminos" element={<><Navbar /><TermsOfService /><Footer /></>} />
        <Route path="/privacidad" element={<><Navbar /><PrivacyPolicy /><Footer /></>} />
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
