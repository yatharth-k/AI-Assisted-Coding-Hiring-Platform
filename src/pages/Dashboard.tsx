import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Code, Star, Clock, Trophy, ArrowRight, User, Settings, ArrowUpRight } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup, faLink, faBox, faBrain } from '@fortawesome/free-solid-svg-icons';
import confetti from 'canvas-confetti';
import { FaUser } from 'react-icons/fa';
import { AnimatePresence } from 'framer-motion';

// Easing function
function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

// Format number with commas
function formatNumber(n: number) {
  return n.toLocaleString();
}

// Custom hook: count up when visible
function useCountUpOnVisible(target: number, duration = 1200) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [value, setValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    let observer: IntersectionObserver | null = null;
    let frame: number;
    function animate() {
      const start = performance.now();
      function step(now: number) {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        const eased = easeOutCubic(t);
        setValue(Math.round(eased * target));
        if (t < 1) {
          frame = requestAnimationFrame(step);
        }
      }
      frame = requestAnimationFrame(step);
    }
    observer = new window.IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          animate();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(ref.current);
    return () => {
      if (observer && ref.current) observer.unobserve(ref.current);
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line
  }, [target, duration, hasAnimated]);
  return [ref, value] as const;
}

function useIdle(timeout = 30000) {
  const [idle, setIdle] = React.useState(false);
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    const reset = () => {
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(() => setIdle(true), timeout);
    };
    window.addEventListener('mousemove', reset);
    window.addEventListener('keydown', reset);
    window.addEventListener('scroll', reset);
    timer = setTimeout(() => setIdle(true), timeout);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
      window.removeEventListener('scroll', reset);
    };
  }, [timeout]);
  return idle;
}

// Add helper for animated percent
function useAnimatedPercent(targetPercent: number, duration = 1000) {
  const [percent, setPercent] = React.useState(0);
  React.useEffect(() => {
    let frame: number;
    const start = performance.now();
    function animate(now: number) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      setPercent(t * targetPercent);
      if (t < 1) frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [targetPercent, duration]);
  return percent;
}

// Add countdown hook
function useCountdown(targetDate: string, targetTime: string) {
  const [countdown, setCountdown] = React.useState('');
  React.useEffect(() => {
    function update() {
      const date = new Date(`${targetDate}T${targetTime.replace(' UTC', 'Z')}`);
      const now = new Date();
      let diff = Math.max(0, date.getTime() - now.getTime());
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      diff -= d * 1000 * 60 * 60 * 24;
      const h = Math.floor(diff / (1000 * 60 * 60));
      diff -= h * 1000 * 60 * 60;
      const m = Math.floor(diff / (1000 * 60));
      setCountdown(`Starts in ${d}d ${h}h ${m}m`);
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate, targetTime]);
  return countdown;
}

// Add dark mode hook
function useDarkMode() {
  const [theme, setTheme] = React.useState<'dark' | 'light'>(() => {
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
  return [theme, setTheme] as const;
}

// Add cursor trail effect
function useCursorTrail() {
  React.useEffect(() => {
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

const Dashboard = () => {
  const navigate = useNavigate();
  const problems = [
    { id: 1, title: "Two Sum", difficulty: "Easy", category: "Arrays", solved: true, xp: 10 },
    { id: 2, title: "Reverse Linked List", difficulty: "Easy", category: "Linked Lists", solved: true, xp: 10 },
    { id: 3, title: "Maximum Subarray", difficulty: "Medium", category: "Dynamic Programming", solved: false, xp: 25 },
    { id: 4, title: "Valid Parentheses", difficulty: "Easy", category: "Stack", solved: true, xp: 10 },
    { id: 5, title: "Binary Tree Inorder", difficulty: "Medium", category: "Trees", solved: false, xp: 25 },
    { id: 6, title: "Merge Two Sorted Lists", difficulty: "Easy", category: "Linked Lists", solved: false, xp: 10 },
  ];

  const contests = [
    { id: 1, title: 'Weekly Contest 125', date: '2024-12-20', time: '10:00 UTC', participants: 1250 },
    { id: 2, title: 'Biweekly Contest 60', date: '2024-12-22', time: '14:30 UTC', participants: 850 },
  ];
  const [popupStates, setPopupStates] = React.useState(Array(contests.length).fill(false));
  const countdowns = contests.map(c => useCountdown(c.date, c.time));
  const handleRegister = React.useCallback((idx: number) => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.7 },
    });
    setPopupStates(prev => {
      const arr = [...prev];
      arr[idx] = true;
      return arr;
    });
    setTimeout(() => {
      setPopupStates(prev => {
        const arr = [...prev];
        arr[idx] = false;
        return arr;
      });
    }, 1800);
  }, [setPopupStates]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-400 text-black shadow-[0_0_8px_2px_#22d3ee]';
      case 'Medium': return 'bg-orange-400 text-black shadow-[0_0_8px_2px_#fb923c]';
      case 'Hard': return 'bg-red-500 text-white shadow-[0_0_8px_2px_#ef4444]';
      default: return 'bg-gray-400 text-black';
    }
  };

  // Simulate API state for stats
  const [xp, setXp] = React.useState(1250);
  const [rank, setRank] = React.useState(847);
  const [solved, setSolved] = React.useState(43);
  const [rating, setRating] = React.useState(1456);
  // Animate stat transitions (clamp to zero)
  const [xpRef, xpVal] = useCountUpOnVisible(Math.max(0, xp), 1200);
  const [rankRef, rankVal] = useCountUpOnVisible(Math.max(0, rank), 1200);
  const [solvedRef, solvedVal] = useCountUpOnVisible(Math.max(0, solved), 1200);
  const [ratingRef, ratingVal] = useCountUpOnVisible(Math.max(0, rating), 1200);

  const currentXP = xp, nextLevelXP = 2000;
  const xpPercent = useAnimatedPercent((currentXP / nextLevelXP) * 100, 1000);

  // Example streak data (replace with real data if available)
  const loggedInDates = [
    '2024-07-01', '2024-07-03', '2024-07-04', '2024-07-07', '2024-07-08',
    '2024-07-10', '2024-07-12', '2024-07-13', '2024-07-15', '2024-07-16',
  ];
  const today = new Date();
  const streakData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const loggedIn = loggedInDates.some(ld => new Date(ld).toDateString() === d.toDateString());
    return { date: d, loggedIn, dateStr };
  });

  const [showHints, setShowHints] = React.useState(false);
  const isIdle = useIdle(30000);
  const [theme, setTheme] = useDarkMode();

  useCursorTrail();

  return (
    <div className="bg-gradient-bg min-h-screen text-white font-sans">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 border-b border-indigo-800 bg-indigo-950/80 backdrop-blur">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
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
        </motion.div>
        <div className="flex items-center space-x-4">
          <button
            className="bg-indigo-700 dark:bg-indigo-300 text-white dark:text-indigo-900 rounded-full p-2 shadow-lg transition-colors duration-400 focus:outline-none flex items-center justify-center"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            role="switch"
            aria-checked={theme === 'dark'}
            tabIndex={0}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') setTheme(theme === 'dark' ? 'light' : 'dark'); }}
            style={{ marginRight: '0.5rem' }}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m8.66-13.66l-.71.71M4.05 19.95l-.71.71M21 12h-1M4 12H3m16.66 5.66l-.71-.71M4.05 4.05l-.71-.71M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>
            )}
          </button>
          <Link to="/profile">
            <button className="bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg text-white font-semibold rounded-lg px-5 py-2 transition-transform duration-300 hover:scale-105 hover:from-violet-700 hover:to-indigo-700 focus:outline-none flex items-center text-sm">
              <User className="h-4 w-4 mr-2" />
              Profile
            </button>
          </Link>
          {/* Removed settings button for cleaner header */}
        </div>
      </nav>

      {/* Animated background gradient layer */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] animate-gradient-move" />
      <div className="container mx-auto max-w-screen-xl px-6 py-8 relative">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Welcome back, Developer! 👋</h1>
          <p className="text-base md:text-lg text-indigo-200">Ready to solve some problems and level up your skills?</p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {/* XP Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px 0 #a78bfa44' }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0 }}
            className="rounded-2xl shadow-2xl backdrop-blur-md bg-gradient-to-br from-indigo-900/40 to-indigo-700/30 bg-white/5 p-6 flex flex-col transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-semibold text-indigo-200">Total XP</span>
              <span className="text-violet-400 text-2xl font-bold" ref={xpRef}>{formatNumber(xpVal)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-indigo-400">
              <ArrowUpRight className="inline-block text-green-400 animate-bounce" />
              +50 this week
            </div>
            <div className="mt-2 flex flex-col items-start">
              <div className="w-full h-2 bg-indigo-800 rounded-full overflow-hidden">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-violet-500 to-indigo-400 transition-all"
                  style={{ width: `${xpPercent}%`, transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)' }}
                />
              </div>
              <span className="text-xs text-indigo-300 mt-1">{currentXP} / {nextLevelXP} XP to next level</span>
            </div>
          </motion.div>

          {/* Global Rank Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px 0 #38bdf844' }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.08 }}
            className="rounded-2xl shadow-2xl backdrop-blur-md bg-gradient-to-br from-indigo-900/40 to-indigo-700/30 bg-white/5 p-6 flex flex-col transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-semibold text-indigo-200">Global Rank</span>
              <span className="text-cyan-400 text-2xl font-bold" ref={rankRef}>#{formatNumber(rankVal)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-400">
              <ArrowUpRight className="inline-block animate-bounce" />
              ↑ 12 positions
            </div>
          </motion.div>

          {/* Problems Solved Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px 0 #22c55e44' }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.16 }}
            className="rounded-2xl shadow-2xl backdrop-blur-md bg-gradient-to-br from-indigo-900/40 to-indigo-700/30 bg-white/5 p-6 flex flex-col transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-semibold text-indigo-200">Problems Solved</span>
              <span className="text-green-400 text-2xl font-bold" ref={solvedRef}>{formatNumber(solvedVal)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-green-400">
              <ArrowUpRight className="inline-block animate-bounce" />
              3 this week
            </div>
          </motion.div>

          {/* Contest Rating Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px 0 #fb923c44' }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.24 }}
            className="rounded-2xl shadow-2xl backdrop-blur-md bg-gradient-to-br from-indigo-900/40 to-indigo-700/30 bg-white/5 p-6 flex flex-col transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xl font-semibold text-indigo-200">Contest Rating</span>
              <span className="text-orange-400 text-2xl font-bold" ref={ratingRef}>{formatNumber(ratingVal)}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-indigo-400">
              <Trophy className="inline-block text-orange-400" />
              Specialist
            </div>
          </motion.div>

          {/* Streak Tracker Card (span 2 columns on md, 1 on sm) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02, boxShadow: '0 8px 32px 0 #22c55e44' }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.32 }}
            className="rounded-2xl shadow-2xl backdrop-blur-md bg-gradient-to-br from-indigo-900/40 to-indigo-700/30 bg-white/5 p-6 flex flex-col items-center justify-center transition-all duration-300 col-span-1 sm:col-span-2 md:col-span-1"
          >
            <span className="text-xl font-semibold text-indigo-200 mb-2">Streak Tracker</span>
            <div className="grid grid-cols-10 gap-1 mb-2">
              {streakData.map((day, i) => (
                <div
                  key={i}
                  title={day.loggedIn ? `Solved 3 problems` : `No activity`}
                  className={`w-3 h-3 rounded ${day.loggedIn ? 'bg-green-500' : 'bg-gray-700'} border border-gray-800 cursor-pointer transition-colors duration-200`}
                />
              ))}
            </div>
            <span className="text-xs text-indigo-400">Last 30 days</span>
          </motion.div>
        </div>

        {/* Quick Actions Tab */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.04, boxShadow: '0 0 32px 0 #a78bfa66' }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.4 }}
          className="mx-auto mb-10 flex flex-col items-center justify-center w-fit rounded-full bg-gradient-to-r from-violet-800/40 to-purple-700/20 backdrop-blur-md shadow-2xl px-8 py-4 border border-violet-400/40"
        >
          <span className="text-violet-300 text-xl font-semibold drop-shadow-glow mb-2">Quick Actions</span>
          <div className="flex flex-row items-center gap-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.13, boxShadow: '0 0 0 4px #a78bfa, 0 0 16px #7c3aed' }}
                    transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                    className="rounded-xl bg-gradient-to-tr from-violet-700 to-indigo-700 text-white shadow-md focus:outline-none transition-all duration-200 relative flex items-center justify-center w-12 h-12"
                    aria-label="Open Code Editor"
                    style={{ outline: 'none' }}
                  >
                    <Link to="/editor" className="flex items-center justify-center w-full h-full">
                      <motion.span
                        whileHover={{ scale: 1.18, filter: 'drop-shadow(0 0 8px #a78bfa)' }}
                        transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                        className="flex items-center justify-center w-full h-full"
                      >
                        <Code className="w-6 h-6" />
                      </motion.span>
                    </Link>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top">Code Editor</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.13, boxShadow: '0 0 0 4px #38bdf8, 0 0 16px #0ea5e9' }}
                    transition={{ type: 'spring', stiffness: 350, damping: 18, delay: 0.05 }}
                    className="rounded-xl bg-gradient-to-tr from-violet-700 to-indigo-700 text-white shadow-md focus:outline-none transition-all duration-200 relative flex items-center justify-center w-12 h-12"
                    aria-label="View Leaderboard"
                    style={{ outline: 'none' }}
                  >
                    <Link to="/leaderboard" className="flex items-center justify-center w-full h-full">
                      <motion.span
                        whileHover={{ scale: 1.18, filter: 'drop-shadow(0 0 8px #38bdf8)' }}
                        transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                        className="flex items-center justify-center w-full h-full"
                      >
                        <Star className="w-6 h-6" />
                      </motion.span>
                    </Link>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top">Leaderboard</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.13, boxShadow: '0 0 0 4px #fbbf24, 0 0 16px #f59e42' }}
                    transition={{ type: 'spring', stiffness: 350, damping: 18, delay: 0.1 }}
                    className="rounded-xl bg-gradient-to-tr from-violet-700 to-indigo-700 text-white shadow-md focus:outline-none transition-all duration-200 relative flex items-center justify-center w-12 h-12"
                    aria-label="Random Practice"
                    style={{ outline: 'none' }}
                    onClick={() => {
                      const random = problems[Math.floor(Math.random() * problems.length)];
                      navigate(`/editor/${random.id}`);
                    }}
                  >
                    <motion.span
                      whileHover={{ scale: 1.18, filter: 'drop-shadow(0 0 8px #fbbf24)' }}
                      transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                      className="flex items-center justify-center w-full h-full"
                    >
                      <Trophy className="w-6 h-6" />
                    </motion.span>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top">Random Practice</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button
                    whileHover={{ scale: 1.13, boxShadow: '0 0 0 4px #a78bfa, 0 0 16px #7c3aed' }}
                    transition={{ type: 'spring', stiffness: 350, damping: 18, delay: 0.15 }}
                    className="rounded-xl bg-gradient-to-tr from-violet-700 to-indigo-700 text-white shadow-md focus:outline-none transition-all duration-200 relative flex items-center justify-center w-12 h-12"
                    aria-label="Employer Assessments"
                    style={{ outline: 'none' }}
                  >
                    <Link to="/employers" className="flex items-center justify-center w-full h-full">
                      <motion.span
                        whileHover={{ scale: 1.18, filter: 'drop-shadow(0 0 8px #a78bfa)' }}
                        transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                        className="flex items-center justify-center w-full h-full"
                      >
                        <User className="w-6 h-6" />
                      </motion.span>
                    </Link>
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="top">Employer Assessments</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Problems Section */}
          <div className="lg:col-span-2">
            <Card className="bg-indigo-950 border-indigo-800 shadow-lg transition duration-300 hover:scale-105 hover:shadow-glow">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="heading-2 text-white">Practice Problems</CardTitle>
                  <Link to="/problems">
                    <button className="bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg text-white font-semibold rounded-lg px-4 py-2 transition-transform duration-300 hover:scale-105 hover:from-violet-700 hover:to-indigo-700 focus:outline-none flex items-center text-sm">
                      View All <ArrowRight className="ml-1 h-4 w-4" />
                    </button>
                  </Link>
                </div>
                <CardDescription className="subtitle">
                  Continue solving problems to improve your skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {problems.map(problem => (
                    <motion.div
                      key={problem.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-violet-900 hover:scale-[1.03] hover:shadow-glow transition-all duration-200 group w-full text-xs sm:text-sm md:text-base"
                    >
                      <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto mb-2 sm:mb-0">
                        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-800 group-hover:bg-violet-700 transition-colors">
                          <FontAwesomeIcon icon={faLayerGroup} className="text-violet-300 text-xl" />
                        </div>
                        <div className="min-w-0">
                          <Link to={`/problems/${problem.id}`} className="text-white font-semibold text-lg truncate hover:text-violet-300">{problem.title}</Link>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="px-2 py-0.5 rounded font-semibold text-xs ...">{problem.difficulty}</span>
                            <span className="px-2 py-0.5 rounded bg-indigo-700 text-indigo-200 text-xs font-medium">{problem.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                        <span className="px-3 py-1 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-500 text-white text-xs font-bold shadow font-mono">{problem.xp} XP</span>
                        <button
                          className="bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg text-white font-semibold rounded-lg px-4 py-2 transition-transform duration-200 hover:scale-105 hover:shadow-glow hover:from-violet-700 hover:to-indigo-700 focus:outline-none text-sm"
                          onClick={() => {
                            // setXpGain({ amount: problem.xp, visible: true }); // Removed xpGain state
                            setXp(xp + problem.xp);
                            confetti({
                              particleCount: 40,
                              spread: 60,
                              origin: { y: 0.7 },
                            });
                            // setTimeout(() => setXpGain(g => ({ ...g, visible: false })), 1000); // Removed xpGain state
                            navigate(`/editor/${problem.id}`);
                          }}
                        >
                          {problem.solved ? 'Review' : 'Solve'}
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Contests */}
            <Card className="bg-indigo-950 border-indigo-800 shadow-lg transition duration-300 hover:scale-105 hover:shadow-glow">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-orange-400" />
                  Upcoming Contests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contests.map((contest, idx) => (
                  <motion.div
                    key={contest.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: contest.id * 0.1 }}
                    className="p-3 rounded-lg bg-indigo-900 transition duration-200 hover:scale-105 hover:shadow-glow relative overflow-visible"
                  >
                    <h4 className="heading-3 text-white mb-2">{contest.title}</h4>
                    <div className="space-y-1 text-sm subtitle">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#38bdf8]">{countdowns[idx]}</span>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        className="flex items-center gap-1"
                      >
                        <FaUser className="h-3 w-3 text-indigo-300" />
                        <span className="text-indigo-200">{contest.participants} registered</span>
                      </motion.div>
                    </div>
                    <button
                      className="mt-3 w-full bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg text-white font-semibold rounded-lg px-4 py-2 transition-transform duration-300 hover:scale-105 hover:from-violet-700 hover:to-indigo-700 focus:outline-none text-sm"
                      onClick={() => handleRegister(idx)}
                    >
                      Register
                    </button>
                    {/* Confetti popup */}
                    {popupStates[idx] && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute left-1/2 -translate-x-1/2 top-2 z-20 bg-indigo-800 text-white px-4 py-2 rounded-xl shadow-lg text-base font-semibold flex items-center gap-2"
                      >
                        You’re in! <span role="img" aria-label="party">🎉</span>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
                <Link to="/contests">
                  <button className="w-full bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg text-white font-semibold rounded-lg px-4 py-2 transition-transform duration-300 hover:scale-105 hover:from-violet-700 hover:to-indigo-700 focus:outline-none text-sm">
                    View All Contests
                  </button>
                </Link>
              </CardContent>
            </Card>

            {/* Progress Tracker */}
            <Card className="bg-indigo-950 border-indigo-800 shadow-lg transition duration-300 hover:scale-105 hover:shadow-glow">
              <CardHeader>
                <CardTitle className="text-white">Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0 }}
                  >
                    <div className="flex justify-between text-sm mb-2">
                      <span className="subtitle">Problems Solved</span>
                      <span className="body-text text-white">3/5</span>
                    </div>
                    <Progress value={60} className="h-2 bg-indigo-900" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                  >
                    <div className="flex justify-between text-sm mb-2">
                      <span className="subtitle">XP Gained</span>
                      <span className="body-text text-white">50/100</span>
                    </div>
                    <Progress value={50} className="h-2 bg-indigo-900" />
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <div className="flex justify-between text-sm mb-2">
                      <span className="subtitle">Daily Streak</span>
                      <span className="body-text text-white">7 days 🔥</span>
                    </div>
                    <Progress value={100} className="h-2 bg-indigo-900" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions (compact, horizontally-aligned, icon-based, with tooltips) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut', delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-indigo-950 via-indigo-900 to-violet-950 border-indigo-800 shadow-lg rounded-2xl px-4 py-3 sm:px-6 sm:py-4 mb-8 flex items-center justify-center transition-all duration-200">
                <CardHeader className="p-0 flex-shrink-0">
                  <CardTitle className="text-indigo-300 text-sm font-semibold tracking-wide mb-0">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-row items-center gap-3 sm:gap-5 p-0 ml-4 justify-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.13, boxShadow: '0 0 0 4px #a78bfa, 0 0 16px #7c3aed' }}
                          transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                          className="rounded-xl bg-gradient-to-tr from-violet-700 to-indigo-700 text-white shadow-md focus:outline-none transition-all duration-200 relative flex items-center justify-center w-11 h-11"
                          aria-label="Open Code Editor"
                          style={{ outline: 'none' }}
                        >
                          <Link to="/editor" className="flex items-center justify-center w-full h-full">
                            <motion.span
                              whileHover={{ scale: 1.18, filter: 'drop-shadow(0 0 8px #a78bfa)' }}
                              transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                              className="flex items-center justify-center w-full h-full"
                            >
                              <Code className="w-5 h-5" />
                            </motion.span>
                          </Link>
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Code Editor</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.13, boxShadow: '0 0 0 4px #38bdf8, 0 0 16px #0ea5e9' }}
                          transition={{ type: 'spring', stiffness: 350, damping: 18, delay: 0.05 }}
                          className="rounded-xl bg-gradient-to-tr from-violet-700 to-indigo-700 text-white shadow-md focus:outline-none transition-all duration-200 relative flex items-center justify-center w-11 h-11"
                          aria-label="View Leaderboard"
                          style={{ outline: 'none' }}
                        >
                          <Link to="/leaderboard" className="flex items-center justify-center w-full h-full">
                            <motion.span
                              whileHover={{ scale: 1.18, filter: 'drop-shadow(0 0 8px #38bdf8)' }}
                              transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                              className="flex items-center justify-center w-full h-full"
                            >
                              <Star className="w-5 h-5" />
                            </motion.span>
                          </Link>
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Leaderboard</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.button
                          whileHover={{ scale: 1.13, boxShadow: '0 0 0 4px #fbbf24, 0 0 16px #f59e42' }}
                          transition={{ type: 'spring', stiffness: 350, damping: 18, delay: 0.1 }}
                          className="rounded-xl bg-gradient-to-tr from-violet-700 to-indigo-700 text-white shadow-md focus:outline-none transition-all duration-200 relative flex items-center justify-center w-11 h-11"
                          aria-label="Random Practice"
                          style={{ outline: 'none' }}
                          onClick={() => {
                            const random = problems[Math.floor(Math.random() * problems.length)];
                            navigate(`/editor/${random.id}`);
                          }}
                        >
                          <motion.span
                            whileHover={{ scale: 1.18, filter: 'drop-shadow(0 0 8px #fbbf24)' }}
                            transition={{ type: 'spring', stiffness: 350, damping: 18 }}
                            className="flex items-center justify-center w-full h-full"
                          >
                            <Trophy className="w-5 h-5" />
                          </motion.span>
                        </motion.button>
                      </TooltipTrigger>
                      <TooltipContent side="top">Random Practice</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
      {isIdle && (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    <div
      className="relative cursor-pointer animate-pulse bg-white/10 shadow-glow rounded-full p-2 flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-xl"
      style={{ boxShadow: '0 0 20px #8b5cf6' }}
      onClick={() => setShowHints(v => !v)}
      title="Need help solving a problem?"
    >
      <Player
        autoplay
        loop
        src={assistantLottie}
        style={{ height: 64, width: 64 }}
      />
      <div className="absolute -top-8 right-0 bg-indigo-700 text-white text-xs px-3 py-1 rounded-xl shadow-lg">
        Need help solving a problem?
      </div>
    </div>
    {showHints && (
      <div className="mt-3 w-64 bg-white/90 text-gray-900 rounded-2xl shadow-xl p-4 animate-fade-in">
        <div className="font-semibold mb-2">Stuck? Try these:</div>
        <ul className="list-disc ml-5 text-sm">
          <li>Break the problem into smaller steps</li>
          <li>Check for edge cases</li>
          <li>Review similar solved problems</li>
        </ul>
        <button className="mt-3 w-full bg-primary text-white rounded-xl py-2 font-semibold hover:bg-glow transition">Show Hint</button>
      </div>
    )}
  </div>
)}
      {/* Floating Assistant Bubble */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-colors duration-200"
      >
        <Code className="h-6 w-6" />
      </motion.div>
    </div>
  );
};

export default Dashboard;
