
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Trophy, Star, Medal, Crown, User } from "lucide-react";
import { Link } from 'react-router-dom';

const Leaderboard = () => {
  const globalLeaderboard = [
    { rank: 1, name: "AlgoMaster", country: "🇺🇸", xp: 25430, contestRating: 2850, solvedProblems: 1250, streak: 45 },
    { rank: 2, name: "CodeNinja", country: "🇨🇳", xp: 24120, contestRating: 2780, solvedProblems: 1180, streak: 38 },
    { rank: 3, name: "DevWizard", country: "🇮🇳", xp: 23850, contestRating: 2720, solvedProblems: 1150, streak: 42 },
    { rank: 4, name: "ByteHunter", country: "🇯🇵", xp: 22940, contestRating: 2680, solvedProblems: 1080, streak: 31 },
    { rank: 5, name: "ScriptKid", country: "🇩🇪", xp: 22150, contestRating: 2640, solvedProblems: 1020, streak: 28 },
    { rank: 6, name: "LogicBeast", country: "🇧🇷", xp: 21780, contestRating: 2590, solvedProblems: 980, streak: 35 },
    { rank: 7, name: "CppGuru", country: "🇷🇺", xp: 21200, contestRating: 2540, solvedProblems: 950, streak: 22 },
    { rank: 8, name: "PythonPro", country: "🇬🇧", xp: 20850, contestRating: 2510, solvedProblems: 920, streak: 19 },
    { rank: 9, name: "JavaJedi", country: "🇰🇷", xp: 20340, contestRating: 2480, solvedProblems: 890, streak: 25 },
    { rank: 10, name: "JSNinja", country: "🇫🇷", xp: 19950, contestRating: 2450, solvedProblems: 860, streak: 33 },
  ];

  const weeklyLeaderboard = [
    { rank: 1, name: "WeekWarrior", xp: 850, problemsSolved: 15, avgTime: "12m" },
    { rank: 2, name: "SpeedCoder", xp: 780, problemsSolved: 14, avgTime: "8m" },
    { rank: 3, name: "QuickSolver", xp: 720, problemsSolved: 12, avgTime: "15m" },
    { rank: 4, name: "RapidFire", xp: 680, problemsSolved: 11, avgTime: "18m" },
    { rank: 5, name: "FastTrack", xp: 640, problemsSolved: 10, avgTime: "22m" },
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="h-6 w-6 text-yellow-400" />;
      case 2: return <Medal className="h-6 w-6 text-gray-400" />;
      case 3: return <Medal className="h-6 w-6 text-amber-600" />;
      default: return <span className="text-lg font-bold text-slate-400">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 text-black";
    if (rank === 2) return "bg-gray-400 text-black";
    if (rank === 3) return "bg-amber-600 text-white";
    return "bg-slate-600 text-white";
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="flex items-center space-x-2">
          <Code className="h-8 w-8 text-purple-400" />
          <span className="text-2xl font-bold text-white">CodeArena</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/dashboard">
            <Button variant="ghost" className="text-white hover:text-purple-300">
              Dashboard
            </Button>
          </Link>
          <Link to="/contests">
            <Button variant="ghost" className="text-white hover:text-purple-300">
              Contests
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <Trophy className="mr-3 h-10 w-10 text-yellow-400" />
            Leaderboard
          </h1>
          <p className="text-slate-300">See how you stack up against the best coders worldwide</p>
        </div>

        {/* My Rank Card */}
        <Card className="bg-gradient-to-r from-purple-600 to-cyan-600 border-0 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback className="bg-purple-700 text-white">
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">Your Rank</h3>
                  <p className="opacity-90">Keep climbing!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">#847</div>
                <div className="text-sm opacity-90">Global Ranking</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">1,250 XP</div>
                <div className="text-sm opacity-90">Total Experience</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="global" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800 mb-8">
            <TabsTrigger value="global" className="text-white data-[state=active]:bg-purple-600">
              Global Leaderboard
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-white data-[state=active]:bg-purple-600">
              This Week
            </TabsTrigger>
          </TabsList>

          {/* Global Leaderboard */}
          <TabsContent value="global">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Star className="mr-2 h-5 w-5 text-yellow-400" />
                  Top Global Performers
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Based on total XP, contest ratings, and problems solved
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {globalLeaderboard.map((user) => (
                    <div key={user.rank} className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:bg-slate-700 ${user.rank <= 3 ? 'bg-slate-700 border-l-4 border-l-yellow-400' : 'bg-slate-750'}`}>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12">
                          {getRankIcon(user.rank)}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="bg-purple-700 text-white">
                            {user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-white font-semibold">{user.name}</h3>
                            <span className="text-lg">{user.country}</span>
                            <Badge className={getRankBadge(user.rank)}>
                              #{user.rank}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-400 mt-1">
                            <span>{user.solvedProblems} solved</span>
                            <span>•</span>
                            <span>{user.streak} day streak 🔥</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-right">
                        <div>
                          <div className="text-yellow-400 font-bold">{user.xp.toLocaleString()}</div>
                          <div className="text-xs text-slate-400">XP</div>
                        </div>
                        <div>
                          <div className="text-cyan-400 font-bold">{user.contestRating}</div>
                          <div className="text-xs text-slate-400">Rating</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                    Load More Rankings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly Leaderboard */}
          <TabsContent value="weekly">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-green-400" />
                  This Week's Champions
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Top performers from December 13 - December 19, 2024
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyLeaderboard.map((user) => (
                    <div key={user.rank} className={`flex items-center justify-between p-4 rounded-lg transition-all duration-200 hover:bg-slate-700 ${user.rank <= 3 ? 'bg-slate-700 border-l-4 border-l-green-400' : 'bg-slate-750'}`}>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-12 h-12">
                          {getRankIcon(user.rank)}
                        </div>
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="bg-green-700 text-white">
                            {user.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-white font-semibold">{user.name}</h3>
                            <Badge className={getRankBadge(user.rank)}>
                              #{user.rank}
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-400 mt-1">
                            Avg solve time: {user.avgTime}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 text-right">
                        <div>
                          <div className="text-green-400 font-bold">{user.xp}</div>
                          <div className="text-xs text-slate-400">XP This Week</div>
                        </div>
                        <div>
                          <div className="text-purple-400 font-bold">{user.problemsSolved}</div>
                          <div className="text-xs text-slate-400">Problems</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Leaderboard;
