
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Code, Star, Clock, Trophy, ArrowRight, User, Settings } from "lucide-react";
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const problems = [
    { id: 1, title: "Two Sum", difficulty: "Easy", category: "Arrays", solved: true, xp: 10 },
    { id: 2, title: "Reverse Linked List", difficulty: "Easy", category: "Linked Lists", solved: true, xp: 10 },
    { id: 3, title: "Maximum Subarray", difficulty: "Medium", category: "Dynamic Programming", solved: false, xp: 25 },
    { id: 4, title: "Valid Parentheses", difficulty: "Easy", category: "Stack", solved: true, xp: 10 },
    { id: 5, title: "Binary Tree Inorder", difficulty: "Medium", category: "Trees", solved: false, xp: 25 },
    { id: 6, title: "Merge Two Sorted Lists", difficulty: "Easy", category: "Linked Lists", solved: false, xp: 10 },
  ];

  const contests = [
    { id: 1, title: "Weekly Contest 125", date: "Dec 20, 2024", time: "10:00 AM UTC", participants: 1250 },
    { id: 2, title: "Biweekly Contest 60", date: "Dec 22, 2024", time: "2:30 PM UTC", participants: 850 },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Hard': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
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
          <Link to="/profile">
            <Button variant="ghost" size="sm" className="text-white hover:text-purple-300">
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </Link>
          <Link to="/settings">
            <Button variant="ghost" size="sm" className="text-white hover:text-purple-300">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, Developer! 👋</h1>
          <p className="text-slate-300">Ready to solve some problems and level up your skills?</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total XP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">1,250</div>
              <div className="text-xs text-slate-500">+50 this week</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Global Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">#847</div>
              <div className="text-xs text-slate-500">↑ 12 positions</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Problems Solved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">43</div>
              <div className="text-xs text-slate-500">3 this week</div>
            </CardContent>
          </Card>
          
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Contest Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">1,456</div>
              <div className="text-xs text-slate-500">Specialist</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Problems Section */}
          <div className="lg:col-span-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Practice Problems</CardTitle>
                  <Link to="/problems">
                    <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                      View All <ArrowRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <CardDescription className="text-slate-400">
                  Continue solving problems to improve your skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {problems.map(problem => (
                    <div key={problem.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className={`w-3 h-3 rounded-full ${problem.solved ? 'bg-green-500' : 'bg-slate-500'}`} />
                        <div>
                          <Link to={`/problems/${problem.id}`} className="text-white hover:text-purple-300 font-medium">
                            {problem.title}
                          </Link>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className={`${getDifficultyColor(problem.difficulty)} text-white text-xs px-2 py-1`}>
                              {problem.difficulty}
                            </Badge>
                            <span className="text-xs text-slate-400">{problem.category}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-yellow-400">{problem.xp} XP</span>
                        <Button size="sm" variant="outline" className="border-purple-600 text-purple-400 hover:bg-purple-600 hover:text-white">
                          {problem.solved ? 'Review' : 'Solve'}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Contests */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-yellow-400" />
                  Upcoming Contests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {contests.map(contest => (
                  <div key={contest.id} className="p-3 rounded-lg bg-slate-700">
                    <h4 className="text-white font-medium mb-2">{contest.title}</h4>
                    <div className="space-y-1 text-sm text-slate-400">
                      <div className="flex items-center">
                        <Clock className="mr-1 h-3 w-3" />
                        {contest.date} at {contest.time}
                      </div>
                      <div className="flex items-center">
                        <User className="mr-1 h-3 w-3" />
                        {contest.participants} registered
                      </div>
                    </div>
                    <Button size="sm" className="mt-3 w-full bg-purple-600 hover:bg-purple-700">
                      Register
                    </Button>
                  </div>
                ))}
                <Link to="/contests">
                  <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">
                    View All Contests
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Progress Tracker */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Problems Solved</span>
                      <span className="text-white">3/5</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">XP Gained</span>
                      <span className="text-white">50/100</span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-400">Daily Streak</span>
                      <span className="text-white">7 days 🔥</span>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/editor">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Code className="mr-2 h-4 w-4" />
                    Open Code Editor
                  </Button>
                </Link>
                <Link to="/leaderboard">
                  <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">
                    <Star className="mr-2 h-4 w-4" />
                    View Leaderboard
                  </Button>
                </Link>
                <Link to="/practice">
                  <Button variant="outline" className="w-full border-slate-600 text-white hover:bg-slate-700">
                    <Trophy className="mr-2 h-4 w-4" />
                    Random Practice
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
