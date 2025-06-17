
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Code, Users, Star, Github, LogOut } from "lucide-react";
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 border-b border-slate-700">
        <div className="flex items-center space-x-2">
          <Code className="h-8 w-8 text-purple-400" />
          <span className="text-2xl font-bold">CodeArena</span>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-slate-300">Welcome, {user.user_metadata?.full_name || user.email}</span>
              <Link to="/dashboard">
                <Button variant="ghost" className="text-white hover:text-purple-300">
                  Dashboard
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleSignOut} className="text-white hover:text-purple-300">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" className="text-white hover:text-purple-300">
                  Login
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Level Up Your Coding Skills
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8">
            Practice coding problems, join contests, and showcase your skills to top companies
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 px-8 py-3 text-lg">
                  Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/signup">
                <Button size="lg" className="bg-purple-600 hover:bg-purple-700 px-8 py-3 text-lg">
                  Start Practicing <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link to="/contests">
              <Button size="lg" variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-slate-900 px-8 py-3 text-lg">
                Join a Contest
              </Button>
            </Link>
            <Link to="/employers">
              <Button size="lg" variant="outline" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-slate-900 px-8 py-3 text-lg">
                For Employers
              </Button>
            </Link>
          </div>

          {/* Platform Preview */}
          <div className="bg-slate-800 rounded-xl p-6 shadow-2xl border border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Code className="h-5 w-5 mr-2 text-purple-400" />
                    Practice
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">Solve 1000+ coding problems</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Users className="h-5 w-5 mr-2 text-cyan-400" />
                    Compete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">Join weekly contests</p>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-700 border-slate-600">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-400" />
                    Advance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300">Get hired by top companies</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-800 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose CodeArena?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-slate-700 border-slate-600 hover:bg-slate-600 transition-colors">
              <CardHeader>
                <CardTitle className="text-white">Real-time Code Execution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Test your code instantly with our powerful online IDE supporting multiple languages.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-700 border-slate-600 hover:bg-slate-600 transition-colors">
              <CardHeader>
                <CardTitle className="text-white">Live Contests</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Participate in weekly coding contests and climb the global leaderboard.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-700 border-slate-600 hover:bg-slate-600 transition-colors">
              <CardHeader>
                <CardTitle className="text-white">Hiring Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Companies can create custom assessments to evaluate developer skills.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-700 border-slate-600 hover:bg-slate-600 transition-colors">
              <CardHeader>
                <CardTitle className="text-white">Gamification</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Earn XP, unlock achievements, and track your coding journey.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-700 border-slate-600 hover:bg-slate-600 transition-colors">
              <CardHeader>
                <CardTitle className="text-white">Problem Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Practice algorithms, data structures, and domain-specific challenges.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-slate-700 border-slate-600 hover:bg-slate-600 transition-colors">
              <CardHeader>
                <CardTitle className="text-white">Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">Monitor your improvement with detailed analytics and insights.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">Join Thousands of Developers</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-4xl font-bold text-purple-400 mb-2">10K+</div>
              <div className="text-slate-300">Active Developers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-cyan-400 mb-2">1000+</div>
              <div className="text-slate-300">Coding Problems</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-400 mb-2">500+</div>
              <div className="text-slate-300">Companies Hiring</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-yellow-400 mb-2">100+</div>
              <div className="text-slate-300">Contests Hosted</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 to-cyan-600 py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8">Join CodeArena today and take your coding skills to the next level</p>
          <Link to="/signup">
            <Button size="lg" className="bg-white text-purple-600 hover:bg-slate-100 px-8 py-3 text-lg font-semibold">
              Get Started Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-700 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Code className="h-6 w-6 text-purple-400" />
                <span className="text-xl font-bold">CodeArena</span>
              </div>
              <p className="text-slate-400">Empowering developers worldwide through coding challenges and competitions.</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/practice" className="hover:text-white">Practice</Link></li>
                <li><Link to="/contests" className="hover:text-white">Contests</Link></li>
                <li><Link to="/leaderboard" className="hover:text-white">Leaderboard</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/about" className="hover:text-white">About</Link></li>
                <li><Link to="/careers" className="hover:text-white">Careers</Link></li>
                <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <Github className="h-6 w-6 text-slate-400 hover:text-white cursor-pointer" />
                <div className="h-6 w-6 text-slate-400 hover:text-white cursor-pointer">𝕏</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2024 CodeArena. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
