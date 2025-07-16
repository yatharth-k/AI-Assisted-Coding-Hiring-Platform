
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code, Users, Star, Github, LogOut, Moon, Sun, Trophy } from "lucide-react";
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Variants, TargetAndTransition } from 'framer-motion';
// 1. Add font import for Manrope (or Satoshi if available)
import "@fontsource/manrope/700.css";
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Helper for staggered reveal
const revealVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: (custom: number = 0): TargetAndTransition => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 18,
      delay: custom * 0.08,
    },
  }),
};

const fadeScaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: (custom: number = 0): TargetAndTransition => ({
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 18,
      delay: custom * 0.08,
    },
  }),
};

// Add a helper for magnetic effect
function useMagnetic(ref) {
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    let hovering = false;
    function onMove(e) {
      if (!hovering) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${x * 0.12}px, ${y * 0.12}px)`;
    }
    function onEnter() {
      hovering = true;
      el.style.transition = 'transform 0.18s cubic-bezier(.22,1,.36,1)';
    }
    function onLeave() {
      hovering = false;
      el.style.transform = 'translate(0,0)';
      el.style.transition = 'transform 0.28s cubic-bezier(.22,1,.36,1)';
    }
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [ref]);
}

// Count up hook for when element is visible
function useCountUpOnVisible(target: number, duration = 1200) {
  const ref = useRef<HTMLDivElement>(null);
  const [val, setVal] = useState(0);
  useEffect(() => {
    let frame: number;
    let observer: IntersectionObserver;
    function animate(now: number, start: number) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      setVal(Math.floor(t * target));
      if (t < 1) frame = requestAnimationFrame((n) => animate(n, start));
    }
    function onVisible(entries: IntersectionObserverEntry[]) {
      if (entries[0].isIntersecting) {
        const start = performance.now();
        frame = requestAnimationFrame((n) => animate(n, start));
        observer.disconnect();
      }
    }
    if (ref.current) {
      observer = new IntersectionObserver(onVisible, { threshold: 0.5 });
      observer.observe(ref.current);
    }
    return () => {
      if (frame) cancelAnimationFrame(frame);
      if (observer && ref.current) observer.unobserve(ref.current);
    };
  }, [target, duration]);
  return [ref, val] as const;
}

// Add StatsCard component for animated stat
function StatsCard({ value, label, color, shadow, percent, shouldReduceMotion }: { value: number, label: string, color: string, shadow: string, percent: number, shouldReduceMotion: boolean }) {
  const [ref, val] = useCountUpOnVisible(value);
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeScaleVariants}
      className={`rounded-2xl shadow-2xl bg-gradient-to-br from-indigo-900/40 to-indigo-700/30 backdrop-blur-md p-8 ${color}`}
      style={{ boxShadow: shadow }}
    >
      <div ref={ref} className="text-4xl font-bold mb-2">{val.toLocaleString()}+</div>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: percent + '%' }}
        transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 1.2, type: "spring" }}
        className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 mt-2"
        style={{ width: percent + '%' }}
      />
      <div className="text-indigo-200 text-lg">{label}</div>
    </motion.div>
  );
}

// Remove current custom cursor/trail effect and add useCursorTrail from Dashboard
function useCursorTrail() {
  useEffect(() => {
    function spawnDot(e: MouseEvent) {
      const dot = document.createElement('div');
      dot.style.position = 'fixed';
      dot.style.left = `${e.clientX - 8}px`;
      dot.style.top = `${e.clientY - 8}px`;
      dot.style.width = '16px';
      dot.style.height = '16px';
      dot.style.pointerEvents = 'none';
      dot.style.borderRadius = '50%';
      dot.style.background = 'radial-gradient(circle, #7c3aed 60%, transparent 100%)';
      dot.style.boxShadow = '0 0 16px 8px #7c3aed88';
      dot.style.opacity = '0.7';
      dot.style.zIndex = '9999';
      dot.style.transition = 'opacity 0.5s linear';
      document.body.appendChild(dot);
      requestAnimationFrame(() => {
        dot.style.opacity = '0';
      });
      setTimeout(() => {
        dot.remove();
      }, 500);
    }
    window.addEventListener('mousemove', spawnDot);
    return () => window.removeEventListener('mousemove', spawnDot);
  }, []);
}

const Index = () => {
  const { user, signOut } = useAuth();
  const [theme, setTheme] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored === 'dark' || stored === 'light') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  });
  React.useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const shouldReduceMotion = useReducedMotion();
  const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // --- Custom Cursor and Trail Effect ---
  // REMOVE the entire useEffect that creates custom cursor and trail
  // REMOVE useCursorTrail() call

  // Parallax background state
  const bgRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (shouldReduceMotion || isMobile) return;
    function onMove(e: MouseEvent) {
      if (!bgRef.current) return;
      const x = e.clientX / window.innerWidth;
      const y = e.clientY / window.innerHeight;
      // Parallax: move background shapes subtly
      bgRef.current.style.transform = `translate3d(${(x - 0.5) * 32}px, ${(y - 0.5) * 24}px, 0)`;
      // Optionally, adjust gradient angle
      bgRef.current.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, #a78bfa33 0%, #312e8133 100%)`;
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [shouldReduceMotion, isMobile]);

  const handleSignOut = async () => {
    await signOut();
  };

  const dashboardBtnRef = useRef<HTMLButtonElement>(null);
  const signupBtnRef = useRef<HTMLButtonElement>(null);
  useMagnetic(dashboardBtnRef);
  useMagnetic(signupBtnRef);

  // Add missing CSS for .animate-pulse-slow
  // (If not present in index.css, add here for now)
  if (typeof window !== 'undefined' && !document.getElementById('pulse-slow-style')) {
    const style = document.createElement('style');
    style.id = 'pulse-slow-style';
    style.innerHTML = `
      @keyframes pulse-slow { 0%, 100% { opacity: 1; box-shadow: 0 0 32px 0 #a78bfa55; } 50% { opacity: 0.92; box-shadow: 0 0 48px 0 #a78bfa99; } }
      .animate-pulse-slow { animation: pulse-slow 2.2s cubic-bezier(.4,0,.6,1) infinite; }
    `;
    document.head.appendChild(style);
  }

  // Helper for smooth scroll to anchor
  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-bg text-white font-sans relative">
      {/* Animated background gradient layer */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] animate-gradient-move" />
      {/* Parallax background for hero section */}
      <div className="absolute top-0 left-0 w-full h-[520px] pointer-events-none -z-10 overflow-hidden select-none">
        <div ref={bgRef} className="absolute inset-0 w-full h-full transition-transform duration-300 will-change-transform" style={{
          background: 'radial-gradient(circle at 50% 40%, #a78bfa33 0%, #312e8133 100%)',
          zIndex: 0,
        }}>
          {/* Floating blurred shapes */}
          <div className="absolute left-[10%] top-[20%] w-48 h-48 rounded-full bg-purple-400/20 blur-3xl animate-float-slow" />
          <div className="absolute right-[12%] top-[10%] w-32 h-32 rounded-full bg-cyan-400/20 blur-2xl animate-float-slower" />
          <div className="absolute left-[40%] bottom-[8%] w-40 h-40 rounded-full bg-indigo-400/20 blur-2xl animate-float-slowest" />
          {/* Optionally add SVG particles or more shapes */}
        </div>
      </div>
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="fixed top-0 left-0 w-full h-20 md:h-24 px-6 md:px-12 bg-indigo-950/80 backdrop-blur-lg shadow-2xl z-20 flex justify-between items-center"
      >
        <div
          className="flex items-center gap-4 sm:gap-5 select-none min-w-0 px-2 py-1 rounded-2xl bg-gradient-to-br from-pink-100/10 to-yellow-100/10 shadow-lg"
          aria-label="LogicLane logo and brand"
        >
          {/* Friendly mascot icon (waving hand) */}
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-yellow-200/80 to-pink-200/80 shadow-md flex-shrink-0 mr-2">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
              <circle cx="14" cy="14" r="13" fill="#FDE68A" stroke="#FBBF24" strokeWidth="2" />
              <ellipse cx="14" cy="17" rx="6" ry="3" fill="#FBBF24" fillOpacity="0.15" />
              <circle cx="10.5" cy="13" r="1.2" fill="#F59E42" />
              <circle cx="17.5" cy="13" r="1.2" fill="#F59E42" />
              <path d="M11 18c1.5 1.5 4.5 1.5 6 0" stroke="#F59E42" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M21 8c.5 2-1 3-2 2" stroke="#F59E42" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M7 8c-.5 2 1 3 2 2" stroke="#F59E42" strokeWidth="1.2" strokeLinecap="round" />
              <text x="19" y="7" fontSize="7" fontFamily="Arial" fill="#F59E42" aria-label="Waving hand">👋</text>
            </svg>
            <span className="sr-only">LogicLane mascot, a friendly waving face</span>
          </span>
          {/* Brand text with hand-drawn/rounded font and pastel color */}
          <span
            className="text-2xl sm:text-3xl font-extrabold tracking-wide text-[#F59E42] drop-shadow-lg font-[cursive,sans-serif] pl-1 pr-2"
            style={{ fontFamily: '"Comic Sans MS", "Comic Sans", "Quicksand", "Poppins", cursive, sans-serif' }}
          >
            LogicLane
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-indigo-700 dark:bg-indigo-300 text-white dark:text-indigo-900 rounded-full p-2 shadow-lg transition-colors duration-400 focus:outline-none flex items-center justify-center"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            role="switch"
            aria-checked={theme === 'dark'}
            tabIndex={0}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setTheme(theme === 'dark' ? 'light' : 'dark'); }}
            style={{ marginRight: '0.5rem' }}
          >
            {theme === 'dark' ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
          </motion.button>
          {user ? (
            <>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="text-slate-300 text-sm sm:text-base"
              >
                Welcome, {user.user_metadata?.full_name || user.email}
              </motion.span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white hover:text-purple-300 rounded-full p-2 shadow-lg transition-colors duration-400 focus:outline-none flex items-center justify-center"
                aria-label="Dashboard"
                onClick={() => scrollToSection('features')}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') scrollToSection('features'); }}
              >
                <Code className="h-5 w-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white hover:text-purple-300 rounded-full p-2 shadow-lg transition-colors duration-400 focus:outline-none flex items-center justify-center"
                aria-label="Sign Out"
                onClick={handleSignOut}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleSignOut(); }}
              >
                <LogOut className="h-5 w-5" />
              </motion.button>
            </>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="text-white hover:text-purple-300 rounded-full p-2 shadow-lg transition-colors duration-400 focus:outline-none flex items-center justify-center"
                aria-label="Login"
                onClick={() => scrollToSection('features')}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') scrollToSection('features'); }}
              >
                <Code className="h-5 w-5" />
              </motion.button>
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2 shadow-lg transition-colors duration-400 focus:outline-none flex items-center justify-center"
                  aria-label="Get Started"
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.button>
              </Link>
            </>
          )}
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div
        className="relative w-full flex flex-col items-center justify-center min-h-[520px] py-12 sm:py-20 px-4 sm:px-8 bg-gradient-to-br from-[#a78bfa] via-[#312e81] to-[#38bdf8] overflow-hidden" style={{ fontFamily: 'Manrope, Poppins, Inter, sans-serif' }}>
        {/* Floating shapes */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none">
          <div className="absolute left-[8%] top-[18%] w-56 h-56 rounded-full bg-purple-400/20 blur-3xl animate-float-slow" />
          <div className="absolute right-[10%] top-[8%] w-40 h-40 rounded-full bg-cyan-400/20 blur-2xl animate-float-slower" />
          <div className="absolute left-[45%] bottom-[10%] w-44 h-44 rounded-full bg-indigo-400/20 blur-2xl animate-float-slowest" />
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 w-full max-w-5xl mx-auto">
          {/* Mascot/Logo */}
          <div className="flex-shrink-0 flex items-center justify-center w-28 h-28 rounded-full bg-gradient-to-br from-yellow-200/80 to-pink-200/80 shadow-lg border-4 border-white/30">
            <svg width="64" height="64" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
              <circle cx="14" cy="14" r="13" fill="#FDE68A" stroke="#FBBF24" strokeWidth="2" />
              <ellipse cx="14" cy="17" rx="6" ry="3" fill="#FBBF24" fillOpacity="0.15" />
              <circle cx="10.5" cy="13" r="1.2" fill="#F59E42" />
              <circle cx="17.5" cy="13" r="1.2" fill="#F59E42" />
              <path d="M11 18c1.5 1.5 4.5 1.5 6 0" stroke="#F59E42" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M21 8c.5 2-1 3-2 2" stroke="#F59E42" strokeWidth="1.2" strokeLinecap="round" />
              <path d="M7 8c-.5 2 1 3 2 2" stroke="#F59E42" strokeWidth="1.2" strokeLinecap="round" />
              <text x="19" y="7" fontSize="14" fontFamily="Arial" fill="#F59E42" aria-label="Waving hand">👋</text>
            </svg>
          </div>
          {/* Headline and CTA */}
          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left gap-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-white drop-shadow-xl font-manrope" style={{ fontFamily: 'Manrope, Poppins, Inter, sans-serif', letterSpacing: '-0.01em' }}>
              Welcome to LogicLane
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-indigo-100 font-medium max-w-2xl" style={{ fontFamily: 'Manrope, Poppins, Inter, sans-serif' }}>
              Practice coding, join contests, and showcase your skills to top companies in a vibrant, human-centered community.
            </p>
            <div className="mt-4 flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-center">
              <Link to="/signup">
                <button className="px-6 py-3 sm:px-8 sm:py-4 text-xl font-bold rounded-2xl bg-gradient-to-tr from-purple-500 to-cyan-400 text-white shadow-2xl focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-200 hover:scale-105 hover:shadow-[0_0_32px_0_#38bdf8aa] relative group">
                  <span className="relative z-10">Get Started</span>
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-400/30 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </Link>
              <Link to="/dashboard">
                <button className="px-6 py-3 sm:px-8 sm:py-4 text-lg font-semibold rounded-2xl bg-white/10 text-white border-2 border-white/20 shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-200 hover:bg-white/20 hover:scale-105">
                  Explore Dashboard
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full flex flex-col items-center justify-center py-20 bg-gradient-to-br from-indigo-900/40 to-indigo-700/30 backdrop-blur-md">
        <h2 className="text-4xl font-bold text-center mb-12 text-white drop-shadow-lg">Why Choose LogicLane?</h2>
        <div className="flex flex-row flex-wrap justify-center gap-4 sm:gap-x-6 gap-y-8 w-full max-w-6xl px-4">
          {/* Feature Cards */}
          {[
            { icon: <Code className="h-7 w-7 sm:h-8 sm:w-8 text-purple-400" />, label: 'Real-time Code Execution', desc: 'Test your code instantly with our powerful online IDE supporting multiple languages.', tooltip: 'Run code in real time' },
            { icon: <Trophy className="h-7 w-7 sm:h-8 sm:w-8 text-orange-400" />, label: 'Live Contests', desc: 'Participate in weekly coding contests and climb the global leaderboard.', tooltip: 'Compete in live events' },
            { icon: <Users className="h-7 w-7 sm:h-8 sm:w-8 text-cyan-400" />, label: 'Hiring Assessments', desc: 'Companies can create custom assessments to evaluate developer skills.', tooltip: 'Get hired by top companies' },
            { icon: <Star className="h-7 w-7 sm:h-8 sm:w-8 text-yellow-300" />, label: 'Gamification', desc: 'Earn XP, unlock achievements, and track your coding journey.', tooltip: 'Earn XP and rewards' },
            { icon: <Badge className="h-7 w-7 sm:h-8 sm:w-8 text-pink-400" />, label: 'Problem Categories', desc: 'Practice algorithms, data structures, and domain-specific challenges.', tooltip: 'Practice by category' },
            { icon: <ArrowRight className="h-7 w-7 sm:h-8 sm:w-8 text-green-400" />, label: 'Progress Tracking', desc: 'Monitor your improvement with detailed analytics and insights.', tooltip: 'Track your progress' },
          ].map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.06, boxShadow: '0 8px 32px 0 #a78bfa33' }}
              transition={{ type: 'spring', stiffness: 260, damping: 18, delay: i * 0.07 }}
              className="flex flex-col items-center justify-center rounded-2xl shadow-2xl bg-gradient-to-br from-indigo-900/60 to-indigo-700/40 backdrop-blur-md p-4 sm:p-6 min-w-[160px] sm:min-w-[180px] md:min-w-[220px] max-w-[98vw] sm:max-w-[90vw] md:max-w-[220px] transition-all duration-300 cursor-pointer group relative"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center justify-center mb-3">
                    <motion.span
                      whileHover={{ scale: 1.18, y: -6, filter: 'drop-shadow(0 0 12px #a78bfa)' }}
                      transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                      className="flex items-center justify-center"
                    >
                      {f.icon}
                    </motion.span>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top">{f.tooltip}</TooltipContent>
              </Tooltip>
              <div className="text-white text-lg font-semibold mb-1 text-center">{f.label}</div>
              <div className="text-indigo-200 text-base text-center">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* --- Compact Stats & CTA Row --- */}
      <div className="w-full flex flex-col items-center justify-center mt-[-40px] mb-12 z-10 relative">
        <div className="flex flex-row flex-wrap justify-center gap-2 sm:gap-4 md:gap-6 w-full max-w-5xl mx-auto">
          {/* Active Users */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.06, boxShadow: '0 8px 32px 0 #a78bfa44' }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="rounded-2xl shadow-2xl bg-gradient-to-br from-indigo-900/60 to-indigo-700/40 backdrop-blur-md px-4 sm:p-6 flex flex-col items-center min-w-[160px] sm:min-w-[180px] md:min-w-[220px] max-w-[98vw] sm:max-w-[90vw] md:max-w-[220px] transition-all duration-300 cursor-pointer group"
          >
            <Users className="h-7 w-7 sm:h-8 sm:w-8 text-purple-400 mb-2 drop-shadow-glow" />
            <div ref={useCountUpOnVisible(10000)[0]} className="text-3xl font-bold text-purple-300 mb-1">10,000+</div>
            <div className="text-indigo-200 text-base font-medium">Active Users</div>
          </motion.div>
          {/* Problems Solved */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.06, boxShadow: '0 8px 32px 0 #38bdf844' }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.08 }}
            className="rounded-2xl shadow-2xl bg-gradient-to-br from-indigo-900/60 to-indigo-700/40 backdrop-blur-md px-4 sm:p-6 flex flex-col items-center min-w-[160px] sm:min-w-[180px] md:min-w-[220px] max-w-[98vw] sm:max-w-[90vw] md:max-w-[220px] transition-all duration-300 cursor-pointer group"
          >
            <Star className="h-7 w-7 sm:h-8 sm:w-8 text-cyan-400 mb-2 drop-shadow-glow" />
            <div ref={useCountUpOnVisible(1000)[0]} className="text-3xl font-bold text-cyan-300 mb-1">1,000+</div>
            <div className="text-indigo-200 text-base font-medium">Problems Solved</div>
          </motion.div>
          {/* Companies Hiring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.06, boxShadow: '0 8px 32px 0 #22c55e44' }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.16 }}
            className="rounded-2xl shadow-2xl bg-gradient-to-br from-indigo-900/60 to-indigo-700/40 backdrop-blur-md px-4 sm:p-6 flex flex-col items-center min-w-[160px] sm:min-w-[180px] md:min-w-[220px] max-w-[98vw] sm:max-w-[90vw] md:max-w-[220px] transition-all duration-300 cursor-pointer group"
          >
            <Code className="h-7 w-7 sm:h-8 sm:w-8 text-green-400 mb-2 drop-shadow-glow" />
            <div ref={useCountUpOnVisible(500)[0]} className="text-3xl font-bold text-green-300 mb-1">500+</div>
            <div className="text-indigo-200 text-base font-medium">Companies Hiring</div>
          </motion.div>
          {/* Join a Contest CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.09, boxShadow: '0 0 32px 0 #fb923c88' }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.24 }}
            className="rounded-2xl shadow-2xl bg-gradient-to-br from-yellow-400/20 to-orange-400/10 backdrop-blur-md px-4 sm:p-6 flex flex-col items-center min-w-[160px] sm:min-w-[180px] md:min-w-[220px] max-w-[98vw] sm:max-w-[90vw] md:max-w-[220px] transition-all duration-300 cursor-pointer group relative"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to="/contests">
                  <button className="flex flex-col items-center focus:outline-none">
                    <Trophy className="h-7 w-7 sm:h-8 sm:w-8 text-orange-400 mb-2 drop-shadow-glow animate-bounce" />
                    <span className="text-xl font-bold text-orange-300 mb-1">Join a Contest</span>
                  </button>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="top">Compete in weekly contests and climb the leaderboard!</TooltipContent>
            </Tooltip>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div
        className="bg-gradient-to-r from-purple-600 to-cyan-600 py-20"
      >
        <div className="container mx-auto px-6 text-center">
          <h2
            className="text-4xl font-bold mb-6 text-white drop-shadow-lg"
          >Ready to Start Your Journey?</h2>
          <p
            className="text-xl mb-8 text-indigo-100"
          >Join LogicLane today and take your coding skills to the next level</p>
          <div
            className="inline-block"
          >
            <Link to="/signup">
              <Button size="lg" className="bg-white text-purple-700 hover:bg-slate-100 px-6 py-3 sm:px-8 sm:py-4 text-lg font-semibold shadow-xl rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400">
                Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="bg-gradient-to-br from-indigo-900/60 to-indigo-800/60 border-t border-indigo-700 py-12"
      >
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Code className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold text-white">LogicLane</span>
              </div>
              <p className="text-indigo-200">Empowering developers worldwide through coding challenges and competitions.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Platform</h3>
              <ul className="space-y-2 text-indigo-200">
                <li><Link to="/practice" className="hover:text-white transition-colors duration-200 focus:outline-none focus:text-white">Practice</Link></li>
                <li><Link to="/contests" className="hover:text-white transition-colors duration-200 focus:outline-none focus:text-white">Contests</Link></li>
                <li><Link to="/leaderboard" className="hover:text-white transition-colors duration-200 focus:outline-none focus:text-white">Leaderboard</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-2 text-indigo-200">
                <li><Link to="/about" className="hover:text-white transition-colors duration-200 focus:outline-none focus:text-white">About</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors duration-200 focus:outline-none focus:text-white">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors duration-200 focus:outline-none focus:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4 text-white">Connect</h3>
              <div className="flex space-x-4">
                <motion.a
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.13, boxShadow: '0 0 0 4px #a78bfa, 0 0 16px #7c3aed' }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                  transition={shouldReduceMotion ? { duration: 0.01 } : { type: "spring", stiffness: 350, damping: 18 }}
                  href="#"
                  className="h-6 w-6 text-indigo-200 hover:text-white cursor-pointer focus:outline-none focus:text-white"
                  aria-label="GitHub"
                >
                  <Github className="h-6 w-6" />
                </motion.a>
                <motion.a
                  whileHover={shouldReduceMotion ? undefined : { scale: 1.13, boxShadow: '0 0 0 4px #38bdf8, 0 0 16px #0ea5e9' }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                  transition={shouldReduceMotion ? { duration: 0.01 } : { type: "spring", stiffness: 350, damping: 18 }}
                  href="#"
                  className="h-6 w-6 text-indigo-200 hover:text-white cursor-pointer focus:outline-none focus:text-white"
                  aria-label="X (Twitter)"
                >
                  <div className="h-6 w-6 flex items-center justify-center">𝕏</div>
                </motion.a>
              </div>
            </div>
          </div>
          <div className="border-t border-indigo-700 mt-8 pt-8 text-center text-indigo-200">
            <p>&copy; 2024 LogicLane. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
