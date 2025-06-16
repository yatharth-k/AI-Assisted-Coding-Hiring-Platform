
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Trophy, Clock, Users, Calendar, ArrowRight } from "lucide-react";
import { Link } from 'react-router-dom';

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
          <Link to="/leaderboard">
            <Button variant="ghost" className="text-white hover:text-purple-300">
              Leaderboard
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
            <Trophy className="mr-3 h-10 w-10 text-yellow-400" />
            Coding Contests
          </h1>
          <p className="text-slate-300">Compete with developers worldwide and climb the leaderboard</p>
        </div>

        {/* Contest Tabs */}
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 mb-8">
            <TabsTrigger value="upcoming" className="text-white data-[state=active]:bg-purple-600">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="ongoing" className="text-white data-[state=active]:bg-purple-600">
              Ongoing
            </TabsTrigger>
            <TabsTrigger value="past" className="text-white data-[state=active]:bg-purple-600">
              Past Contests
            </TabsTrigger>
          </TabsList>

          {/* Upcoming Contests */}
          <TabsContent value="upcoming" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {upcomingContests.map(contest => (
                <Card key={contest.id} className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-all duration-300 hover:scale-105">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white text-xl mb-2">{contest.title}</CardTitle>
                        <CardDescription className="text-slate-400">{contest.description}</CardDescription>
                      </div>
                      <Badge className="bg-blue-600 text-white">{contest.difficulty}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Clock className="h-4 w-4 text-purple-400" />
                        <span>Starts in {getTimeUntilStart(contest.startTime)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Calendar className="h-4 w-4 text-cyan-400" />
                        <span>{contest.duration}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Users className="h-4 w-4 text-green-400" />
                        <span>{contest.participants} registered</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Trophy className="h-4 w-4 text-yellow-400" />
                        <span>{contest.prize}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                        Register Now
                      </Button>
                      <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                        View Details <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Ongoing Contests */}
          <TabsContent value="ongoing" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {ongoingContests.map(contest => (
                <Card key={contest.id} className="bg-slate-800 border-slate-700 border-l-4 border-l-green-500">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white text-xl mb-2 flex items-center">
                          {contest.title}
                          <Badge className="ml-2 bg-green-600 text-white animate-pulse">LIVE</Badge>
                        </CardTitle>
                        <CardDescription className="text-slate-400">{contest.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Clock className="h-4 w-4 text-red-400" />
                        <span className="text-red-400 font-semibold">{contest.timeLeft} left</span>
                      </div>
                      <div className="flex items-center space-x-2 text-slate-300">
                        <Users className="h-4 w-4 text-green-400" />
                        <span>{contest.participants} participating</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button className="flex-1 bg-green-600 hover:bg-green-700">
                        Join Contest
                      </Button>
                      <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-700">
                        Leaderboard
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Past Contests */}
          <TabsContent value="past" className="space-y-6">
            <div className="space-y-4">
              {pastContests.map(contest => (
                <Card key={contest.id} className="bg-slate-800 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="text-white text-lg font-semibold mb-1">{contest.title}</h3>
                        <p className="text-slate-400 text-sm">{contest.date}</p>
                      </div>
                      
                      <div className="flex items-center space-x-8 text-sm">
                        <div className="text-center">
                          <div className="text-white font-semibold">#{contest.myRank}</div>
                          <div className="text-slate-400">My Rank</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-semibold">{contest.solved}/{contest.problems}</div>
                          <div className="text-slate-400">Solved</div>
                        </div>
                        <div className="text-center">
                          <div className="text-white font-semibold">{contest.participants}</div>
                          <div className="text-slate-400">Participants</div>
                        </div>
                        <Button variant="outline" size="sm" className="border-slate-600 text-white hover:bg-slate-700">
                          View Results
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Contests;
