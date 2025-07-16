
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Code, Github } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { motion, useReducedMotion } from 'framer-motion';
import "@fontsource/manrope/700.css";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const shouldReduceMotion = useReducedMotion();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: "Welcome back!",
      });
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] overflow-hidden" style={{ fontFamily: 'Manrope, Poppins, Inter, sans-serif' }}>
      {/* Animated floating shapes */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none select-none">
        <div className="absolute left-[8%] top-[18%] w-56 h-56 rounded-full bg-purple-400/20 blur-3xl animate-float-slow" />
        <div className="absolute right-[10%] top-[8%] w-40 h-40 rounded-full bg-cyan-400/20 blur-2xl animate-float-slower" />
        <div className="absolute left-[45%] bottom-[10%] w-44 h-44 rounded-full bg-indigo-400/20 blur-2xl animate-float-slowest" />
      </div>
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 40 }}
        animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo in glowing circle */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-yellow-200/80 to-pink-200/80 shadow-lg border-4 border-white/30 animate-pulse-slow">
            <svg width="48" height="48" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
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
          <span className="text-3xl font-extrabold text-white drop-shadow-xl mt-4 font-manrope" style={{ fontFamily: 'Manrope, Poppins, Inter, sans-serif' }}>LogicLane</span>
        </div>
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
          animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
        >
          <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl md:text-3xl text-white font-bold font-manrope">Welcome Back</CardTitle>
              <CardDescription className="text-indigo-100 text-base font-medium font-manrope">Sign in to continue your coding journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-white text-lg font-semibold font-manrope">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-indigo-200 rounded-xl px-4 py-3 text-base font-manrope focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                    placeholder="Enter your email"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-white text-lg font-semibold font-manrope">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-indigo-200 rounded-xl px-4 py-3 text-base font-manrope focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                </div>
                <motion.button
                  whileHover={shouldReduceMotion ? {} : { scale: 1.04, boxShadow: '0 0 32px 0 #38bdf8aa' }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                  type="submit"
                  className="w-full py-3 mt-2 rounded-2xl bg-gradient-to-tr from-purple-500 to-cyan-400 text-white text-lg font-bold font-manrope shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-200 relative overflow-hidden group"
                  disabled={loading}
                >
                  <span className="relative z-10">{loading ? 'Signing in...' : 'Sign In'}</span>
                  <span className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-purple-400/30 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              </form>
              <div className="text-center">
                <Link to="/forgot-password" className="text-sm text-cyan-300 hover:text-cyan-200 underline focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded transition-all font-manrope">
                  Forgot your password?
                </Link>
              </div>
              <Separator className="bg-white/20" />
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.03, boxShadow: '0 0 24px 0 #a78bfa55' }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                type="button"
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-white/20 text-white font-manrope text-base font-semibold bg-white/10 hover:bg-white/20 shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                onClick={handleGoogleLogin}
                disabled={loading}
                aria-label="Continue with Google"
              >
                <Github className="h-5 w-5" /> Continue with Google
              </motion.button>
              <div className="text-center text-sm text-indigo-100 font-manrope">
                Don't have an account?{' '}
                <Link to="/signup" className="text-cyan-300 hover:text-cyan-200 underline focus:outline-none focus:ring-2 focus:ring-cyan-400 rounded transition-all">Sign up</Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
