
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Trophy, Clock, Users, Calendar, ArrowRight } from "lucide-react";
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import "@fontsource/manrope/700.css";

const Contests = () => {
  const upcomingContests = [
    {
      id: 1,
      title: "Weekly Contest 125",
      description: "4 problems • 90 minutes",
      startTime: "2024-12-20T10:00:00Z",
      duration: "1h 30m",
      participants: 1250,
      difficulty: "Mixed",
      prize: "XP + Badges"
    },
    {
      id: 2,
      title: "Biweekly Contest 60",
      description: "4 problems • 120 minutes",
      startTime: "2024-12-22T14:30:00Z",
      duration: "2h 00m",
      participants: 850,
      difficulty: "Mixed",
      prize: "XP + Badges"
    },
    {
      id: 3,
      title: "Algorithm Masters Cup",
      description: "6 problems • 180 minutes",
      startTime: "2024-12-25T12:00:00Z",
      duration: "3h 00m",
      participants: 2100,
      difficulty: "Advanced",
      prize: "$500 + XP"
    }
  ];

  const ongoingContests = [
    {
      id: 4,
      title: "Daily Challenge",
      description: "1 problem • 24 hours",
      endTime: "2024-12-19T23:59:59Z",
      participants: 3200,
      timeLeft: "8h 32m"
    }
  ];

  const pastContests = [
    {
      id: 5,
      title: "Weekly Contest 124",
      date: "Dec 13, 2024",
      participants: 1180,
      myRank: 247,
      problems: 4,
      solved: 3
    },
    {
      id: 6,
      title: "Biweekly Contest 59",
      date: "Dec 8, 2024",
      participants: 920,
      myRank: 189,
      problems: 4,
      solved: 4
    }
  ];

  const getTimeUntilStart = (startTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const shouldReduceMotion = useReducedMotion();

  // Check if all contest arrays are empty
  const noContests = upcomingContests.length === 0 && ongoingContests.length === 0 && pastContests.length === 0;

  if (noContests) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] flex items-center justify-center font-manrope relative">
        {/* Animated floating shapes */}
        <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none select-none">
          <div className="absolute left-[8%] top-[18%] w-56 h-56 rounded-full bg-purple-400/20 blur-3xl animate-float-slow" />
          <div className="absolute right-[10%] top-[8%] w-40 h-40 rounded-full bg-cyan-400/20 blur-2xl animate-float-slower" />
          <div className="absolute left-[45%] bottom-[10%] w-44 h-44 rounded-full bg-indigo-400/20 blur-2xl animate-float-slowest" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl px-10 py-12 flex flex-col items-center max-w-md w-full"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1], filter: ["drop-shadow(0 0 16px #facc15cc)", "drop-shadow(0 0 32px #facc15cc)", "drop-shadow(0 0 16px #facc15cc)"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="mb-4"
          >
            <Trophy className="h-16 w-16 text-yellow-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
            No Contests Available
          </h2>
          <p className="text-indigo-100 text-center mb-6">
            Check back soon for upcoming challenges and coding competitions!
          </p>
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 text-white px-6 py-2 font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            >
              Go to Dashboard
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] flex flex-col font-manrope relative" style={{ fontFamily: 'Manrope, Poppins, Inter, sans-serif' }}>
      {/* Animated floating shapes */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none select-none">
        <div className="absolute left-[8%] top-[18%] w-56 h-56 rounded-full bg-purple-400/20 blur-3xl animate-float-slow" />
        <div className="absolute right-[10%] top-[8%] w-40 h-40 rounded-full bg-cyan-400/20 blur-2xl animate-float-slower" />
        <div className="absolute left-[45%] bottom-[10%] w-44 h-44 rounded-full bg-indigo-400/20 blur-2xl animate-float-slowest" />
      </div>
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 border-b border-white/20 bg-white/10 backdrop-blur-xl rounded-b-2xl shadow-lg z-10">
        <div className="flex items-center space-x-2">
          <Code className="h-8 w-8 text-purple-400" />
          <span className="text-2xl font-extrabold text-white font-manrope drop-shadow-xl">LogicLane</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/dashboard">
            <motion.button
              whileHover={shouldReduceMotion ? {} : { scale: 1.08 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
              className="rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 text-white px-4 py-2 font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            >
              Dashboard
            </motion.button>
          </Link>
          <Link to="/leaderboard">
            <motion.button
              whileHover={shouldReduceMotion ? {} : { scale: 1.08 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
              className="rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 text-white px-4 py-2 font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            >
              Leaderboard
            </motion.button>
          </Link>
        </div>
      </nav>
      {/* Header */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
        animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="mb-8 mt-8 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2 flex items-center justify-center gap-3 font-manrope drop-shadow-xl">
          <Trophy className="h-10 w-10 text-yellow-400 animate-bounce" />
          Coding Contests
        </h1>
        <p className="text-indigo-100 text-lg font-medium">Compete with developers worldwide and climb the leaderboard</p>
      </motion.div>
      {/* Contest Tabs */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: 32 }}
        animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
        className="w-full max-w-6xl mx-auto"
      >
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-xl rounded-2xl mb-8 border border-white/20 shadow-lg">
            <TabsTrigger value="upcoming" className="text-white data-[state=active]:bg-gradient-to-tr data-[state=active]:from-purple-500 data-[state=active]:to-cyan-400 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold font-manrope rounded-2xl transition-all">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="ongoing" className="text-white data-[state=active]:bg-gradient-to-tr data-[state=active]:from-green-500 data-[state=active]:to-cyan-400 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold font-manrope rounded-2xl transition-all">
              Ongoing
            </TabsTrigger>
            <TabsTrigger value="past" className="text-white data-[state=active]:bg-gradient-to-tr data-[state=active]:from-indigo-500 data-[state=active]:to-purple-400 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold font-manrope rounded-2xl transition-all">
              Past Contests
            </TabsTrigger>
          </TabsList>
          {/* Upcoming Contests */}
          <TabsContent value="upcoming">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {upcomingContests.map((contest, idx) => (
                <motion.div
                  key={contest.id}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                  animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: 'easeOut' }}
                >
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white text-2xl font-bold font-manrope mb-2">{contest.title}</CardTitle>
                          <CardDescription className="text-indigo-100 font-manrope text-base">{contest.description}</CardDescription>
                        </div>
                        <Badge className="bg-gradient-to-tr from-blue-500 to-cyan-400 text-white font-bold rounded-xl shadow font-manrope text-sm px-4 py-1 mt-1">{contest.difficulty}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-base font-manrope">
                        <div className="flex items-center space-x-2 text-indigo-100">
                          <Clock className="h-5 w-5 text-purple-400" />
                          <span>Starts in <span className="font-bold text-cyan-300">{getTimeUntilStart(contest.startTime)}</span></span>
                        </div>
                        <div className="flex items-center space-x-2 text-indigo-100">
                          <Calendar className="h-5 w-5 text-cyan-400" />
                          <span>{contest.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-indigo-100">
                          <Users className="h-5 w-5 text-green-400" />
                          <span>{contest.participants} registered</span>
                        </div>
                        <div className="flex items-center space-x-2 text-indigo-100">
                          <Trophy className="h-5 w-5 text-yellow-400" />
                          <span>{contest.prize}</span>
                        </div>
                      </div>
                      <div className="flex space-x-3 mt-2">
                        <motion.button
                          whileHover={shouldReduceMotion ? {} : { scale: 1.06, boxShadow: '0 0 16px #a78bfa99' }}
                          whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                          className="flex-1 px-6 py-2 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 text-white font-bold font-manrope shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-200 relative group text-lg"
                        >
                          Register Now
                        </motion.button>
                        <motion.button
                          whileHover={shouldReduceMotion ? {} : { scale: 1.06, boxShadow: '0 0 16px #a78bfa99' }}
                          whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                          className="px-6 py-2 rounded-full border-2 border-white/20 text-white font-bold font-manrope shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-all duration-200 relative group text-lg"
                        >
                          View Details <ArrowRight className="ml-2 h-5 w-5" />
                        </motion.button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
          {/* Ongoing Contests */}
          <TabsContent value="ongoing">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {ongoingContests.map((contest, idx) => (
                <motion.div
                  key={contest.id}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                  animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: 'easeOut' }}
                >
                  <Card className="bg-white/10 backdrop-blur-xl border border-green-400/30 shadow-2xl rounded-2xl">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white text-2xl font-bold font-manrope mb-2 flex items-center">
                            {contest.title}
                            <Badge className="ml-2 bg-gradient-to-tr from-green-500 to-cyan-400 text-white animate-pulse font-manrope text-xs px-3 py-1">LIVE</Badge>
                          </CardTitle>
                          <CardDescription className="text-indigo-100 font-manrope text-base">{contest.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-base font-manrope">
                        <div className="flex items-center space-x-2 text-red-300">
                          <Clock className="h-5 w-5 text-red-400" />
                          <span className="font-bold">{contest.timeLeft} left</span>
                        </div>
                        <div className="flex items-center space-x-2 text-indigo-100">
                          <Users className="h-5 w-5 text-green-400" />
                          <span>{contest.participants} participating</span>
                        </div>
                      </div>
                      <div className="flex space-x-3 mt-2">
                        <motion.button
                          whileHover={shouldReduceMotion ? {} : { scale: 1.06, boxShadow: '0 0 16px #38d99699' }}
                          whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                          className="flex-1 px-6 py-2 rounded-full bg-gradient-to-tr from-green-500 to-cyan-400 text-white font-bold font-manrope shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 relative group text-lg"
                        >
                          Join Contest
                        </motion.button>
                        <motion.button
                          whileHover={shouldReduceMotion ? {} : { scale: 1.06, boxShadow: '0 0 16px #a78bfa99' }}
                          whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                          className="px-6 py-2 rounded-full border-2 border-white/20 text-white font-bold font-manrope shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-all duration-200 relative group text-lg"
                        >
                          Leaderboard
                        </motion.button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
          {/* Past Contests */}
          <TabsContent value="past">
            <div className="space-y-6">
              {pastContests.map((contest, idx) => (
                <motion.div
                  key={contest.id}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                  animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: 'easeOut' }}
                >
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div>
                          <h3 className="text-white text-xl font-bold font-manrope mb-1">{contest.title}</h3>
                          <p className="text-indigo-100 text-base font-manrope">{contest.date}</p>
                        </div>
                        <div className="flex items-center space-x-8 text-base font-manrope">
                          <div className="text-center">
                            <div className="text-white font-bold">#{contest.myRank}</div>
                            <div className="text-indigo-100">My Rank</div>
                          </div>
                          <div className="text-center">
                            <div className="text-white font-bold">{contest.solved}/{contest.problems}</div>
                            <div className="text-indigo-100">Solved</div>
                          </div>
                          <div className="text-center">
                            <div className="text-white font-bold">{contest.participants}</div>
                            <div className="text-indigo-100">Participants</div>
                          </div>
                          <motion.button
                            whileHover={shouldReduceMotion ? {} : { scale: 1.06, boxShadow: '0 0 16px #a78bfa99' }}
                            whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                            className="px-6 py-2 rounded-full border-2 border-white/20 text-white font-bold font-manrope shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-all duration-200 relative group text-lg"
                          >
                            View Results
                          </motion.button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default Contests;
