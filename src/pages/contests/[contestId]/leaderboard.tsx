import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../../components/ui/tooltip";

// Helper for CSV export
function exportToCSV(rows: any[], columns: string[], filename: string) {
  const csv = [columns.join(",")].concat(
    rows.map(row => columns.map(col => JSON.stringify(row[col] ?? "")).join(","))
  ).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Type definitions
interface Contest {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
}
interface Problem {
  id: string;
  title: string;
}
interface Submission {
  id: string;
  user_id: string;
  problem_id: string;
  contest_id: string;
  created_at: string;
  result: { score?: number; passed?: boolean; time?: number };
}
interface User {
  username?: string;
  email?: string;
  avatar_url?: string;
}
interface PresenceUser {
  userId: string;
  username: string;
  avatar_url?: string;
}
interface ProblemScore {
  score: number;
  time: number;
  passed?: boolean;
  created_at: string;
  attempts: number;
}
interface LeaderboardEntry {
  userId: string;
  username: string;
  avatar_url?: string;
  totalScore: number;
  perProblem: Record<string, ProblemScore>;
  fastest: number | null;
  last: number | null;
  attempts: number;
  correct: number;
  totalTime: number;
  firstAC: string | null;
  rank?: number;
}

export default function LeaderboardPage() {
  const { contestId } = useParams<{ contestId: string }>();
  const [contest, setContest] = useState<Contest | null>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [users, setUsers] = useState<{ [userId: string]: User }>({});
  const [presence, setPresence] = useState<PresenceUser[]>([]); // [{userId, username, avatar_url}]
  const [now, setNow] = useState<number>(Date.now());
  const [filter, setFilter] = useState<string>("all");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!contestId) return;
    fetchContest();
    fetchProblems();
    fetchUsers();
    fetchSubmissions();
    subscribeRealtime();
    timerRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line
  }, [contestId]);

  async function fetchContest() {
    const { data } = await supabase.from("contests").select("*").eq("id", contestId).single();
    setContest(data);
  }
  async function fetchProblems() {
    const { data } = await supabase
      .from("contest_problems")
      .select("problem_id, problems(title)")
      .eq("contest_id", contestId);
    setProblems((data || []).map((cp: any) => ({ id: cp.problem_id, title: cp.problems?.title })));
  }
  async function fetchUsers() {
    const { data } = await supabase
      .from("submissions")
      .select("user_id, users(username, email, avatar_url)")
      .eq("contest_id", contestId);
    const userMap: { [userId: string]: User } = {};
    (data || []).forEach((s: any) => {
      if (s.user_id && s.users) userMap[s.user_id] = s.users;
    });
    setUsers(userMap);
  }
  async function fetchSubmissions() {
    const { data } = await supabase
      .from("submissions")
      .select("*", { count: "exact" })
      .eq("contest_id", contestId);
    const mapped = (data || []).map((s: any) => ({
      id: s.id,
      user_id: s.user_id,
      problem_id: s.problem_id,
      contest_id: s.contest_id,
      created_at: s.created_at,
      result: typeof s.result === 'string' ? JSON.parse(s.result) : s.result || {},
    }));
    setSubmissions(mapped);
  }
  function subscribeRealtime() {
    supabase
      .channel(`submissions-leaderboard-${contestId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "submissions" },
        () => fetchSubmissions()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "submissions" },
        () => fetchSubmissions()
      )
      .subscribe();
    // Real presence: use Supabase Realtime presence API (pseudo-code, see docs for actual implementation)
    // setPresence([...]);
  }

  // Aggregate leaderboard
  function getLeaderboard(): LeaderboardEntry[] {
    const leaderboard: Record<string, LeaderboardEntry> = {};
    submissions.forEach((s) => {
      if (!leaderboard[s.user_id]) {
        leaderboard[s.user_id] = {
          userId: s.user_id,
          username: users[s.user_id]?.username || users[s.user_id]?.email || s.user_id,
          avatar_url: users[s.user_id]?.avatar_url,
          totalScore: 0,
          perProblem: {},
          fastest: null,
          last: null,
          attempts: 0,
          correct: 0,
          totalTime: 0,
          firstAC: null,
        };
      }
      const score = s.result?.score || (s.result?.passed ? 1 : 0);
      const time = new Date(s.created_at).getTime();
      const pb = leaderboard[s.user_id].perProblem;
      if (!pb[s.problem_id] || pb[s.problem_id].score < score) {
        pb[s.problem_id] = { score, time, passed: s.result?.passed, created_at: s.created_at, attempts: 1 };
        if (s.result?.passed && !leaderboard[s.user_id].firstAC) leaderboard[s.user_id].firstAC = s.created_at;
      } else {
        pb[s.problem_id].attempts += 1;
      }
      leaderboard[s.user_id].totalScore = Object.values(pb).reduce((a, b) => a + b.score, 0);
      if (!leaderboard[s.user_id].fastest || time < (leaderboard[s.user_id].fastest ?? Infinity)) leaderboard[s.user_id].fastest = time;
      if (!leaderboard[s.user_id].last || time > (leaderboard[s.user_id].last ?? 0)) leaderboard[s.user_id].last = time;
      leaderboard[s.user_id].attempts += 1;
      if (s.result?.passed) leaderboard[s.user_id].correct += 1;
      leaderboard[s.user_id].totalTime += (s.result?.passed ? (s.result?.time || 0) : 0);
    });
    let arr = Object.values(leaderboard)
      .sort((a, b) => b.totalScore - a.totalScore || (a.fastest ?? 0) - (b.fastest ?? 0))
      .map((entry, idx) => ({ ...entry, rank: idx + 1 }));
    // Filters
    if (filter === "solvedAll") arr = arr.filter(e => Object.keys(e.perProblem).length === problems.length && Object.values(e.perProblem).every((p) => p.passed));
    if (filter === "fastest") arr = arr.sort((a, b) => (a.firstAC && b.firstAC ? new Date(a.firstAC).getTime() - new Date(b.firstAC).getTime() : 0));
    return arr;
  }

  function getStatus() {
    if (!contest) return "Loading...";
    const nowTime = now;
    const start = new Date(contest.start_time).getTime();
    const end = new Date(contest.end_time).getTime();
    if (nowTime < start) return "Not started";
    if (nowTime >= start && nowTime < end) return "Running";
    return "Ended";
  }
  function getCountdown() {
    if (!contest) return "";
    const nowTime = now;
    const start = new Date(contest.start_time).getTime();
    const end = new Date(contest.end_time).getTime();
    let diff = 0;
    if (nowTime < start) diff = start - nowTime;
    else if (nowTime < end) diff = end - nowTime;
    else return "";
    const s = Math.floor(diff / 1000) % 60;
    const m = Math.floor(diff / 1000 / 60) % 60;
    const h = Math.floor(diff / 1000 / 60 / 60);
    return `${h}h ${m}m ${s}s`;
  }

  const leaderboard = getLeaderboard();
  const columns = [
    "rank", "username", ...problems.map((p) => p.title), "totalScore", "fastest", "last", "attempts", "correct", "accuracy", "firstAC"
  ];

  // Export handler
  function handleExport() {
    exportToCSV(
      leaderboard.map(e => ({
        ...e,
        accuracy: e.attempts ? ((e.correct / e.attempts) * 100).toFixed(1) + "%" : "-",
        firstAC: e.firstAC ? new Date(e.firstAC).toLocaleString() : "-",
        fastest: e.fastest ? new Date(e.fastest).toLocaleTimeString() : "-",
        last: e.last ? new Date(e.last).toLocaleTimeString() : "-",
      })),
      columns,
      `leaderboard-contest-${contestId}.csv`
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-slate-800 border-slate-700 shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <CardTitle className="text-white text-2xl md:text-3xl">Contest Leaderboard</CardTitle>
              <Badge variant={getStatus() === "Running" ? "default" : getStatus() === "Ended" ? "destructive" : "secondary"} className="text-xs md:text-sm px-2 py-1">
                {getStatus()}
              </Badge>
              <span className="text-slate-300 ml-4 text-sm md:text-base">{getCountdown()}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button size="sm" variant={filter === "all" ? "default" : "outline"} onClick={() => setFilter("all")}>All</Button>
              <Button size="sm" variant={filter === "solvedAll" ? "default" : "outline"} onClick={() => setFilter("solvedAll")}>Solved All</Button>
              <Button size="sm" variant={filter === "fastest" ? "default" : "outline"} onClick={() => setFilter("fastest")}>Fastest</Button>
              <Button size="sm" variant="outline" onClick={handleExport}>Export CSV</Button>
              <span className="text-slate-300 ml-4 text-sm">Online: <b>{presence.length}</b></span>
              {presence.map((u) => (
                <Tooltip key={u.userId}>
                  <TooltipTrigger asChild>
                    <img src={u.avatar_url || "/avatar.png"} alt={u.username} className="w-8 h-8 rounded-full border-2 border-purple-500 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>{u.username}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardHeader>
          <CardContent className="p-0 md:p-6 overflow-x-auto">
            <table className="w-full text-left border-collapse rounded-xl overflow-hidden">
              <thead className="bg-slate-900 text-white sticky top-[80px] z-10">
                <tr>
                  <th className="py-3 px-3 font-semibold text-slate-300 text-sm md:text-base">Rank</th>
                  <th className="py-3 px-3 font-semibold text-slate-300 text-sm md:text-base">User</th>
                  {problems.map((p) => (
                    <th key={p.id} className="py-3 px-3 font-semibold text-slate-300 text-sm md:text-base">{p.title}</th>
                  ))}
                  <th className="py-3 px-3 font-semibold text-slate-300 text-sm md:text-base">Total</th>
                  <th className="py-3 px-3 font-semibold text-slate-300 text-sm md:text-base">Fastest</th>
                  <th className="py-3 px-3 font-semibold text-slate-300 text-sm md:text-base">Last</th>
                  <th className="py-3 px-3 font-semibold text-slate-300 text-sm md:text-base">Attempts</th>
                  <th className="py-3 px-3 font-semibold text-slate-300 text-sm md:text-base">Correct</th>
                  <th className="py-3 px-3 font-semibold text-slate-300 text-sm md:text-base">Accuracy</th>
                  <th className="py-3 px-3 font-semibold text-slate-300 text-sm md:text-base">First AC</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={problems.length + 9} className="text-center py-12 text-slate-400 text-lg">No submissions yet.</td>
                  </tr>
                )}
                {leaderboard.map((entry) => (
                  <tr key={entry.userId} className="border-b border-slate-700 hover:bg-slate-700/60 transition-colors group">
                    <td className="py-3 px-3 font-bold text-purple-400 text-lg group-hover:text-purple-300">{entry.rank}</td>
                    <td className="py-3 px-3 flex items-center gap-2">
                      <img src={entry.avatar_url || "/avatar.png"} alt={entry.username} className="w-8 h-8 rounded-full border border-purple-400" />
                      <span className="text-white font-medium text-base group-hover:text-purple-200">{entry.username}</span>
                    </td>
                    {problems.map((p) => (
                      <td key={p.id} className="py-3 px-3 text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className={entry.perProblem[p.id]?.passed ? "text-green-400 font-bold" : "text-red-400 font-semibold"}>
                              {entry.perProblem[p.id]?.score || 0}
                              {entry.perProblem[p.id]?.passed && <span className="ml-1">✔</span>}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>Attempts: {entry.perProblem[p.id]?.attempts || 0}</TooltipContent>
                        </Tooltip>
                      </td>
                    ))}
                    <td className="py-3 px-3 font-bold text-white text-base">{entry.totalScore}</td>
                    <td className="py-3 px-3 text-xs text-gray-300">{entry.fastest ? new Date(entry.fastest).toLocaleTimeString() : "-"}</td>
                    <td className="py-3 px-3 text-xs text-gray-300">{entry.last ? new Date(entry.last).toLocaleTimeString() : "-"}</td>
                    <td className="py-3 px-3 text-xs text-gray-300">{entry.attempts}</td>
                    <td className="py-3 px-3 text-xs text-gray-300">{entry.correct}</td>
                    <td className="py-3 px-3 text-xs text-gray-300">{entry.attempts ? ((entry.correct / entry.attempts) * 100).toFixed(1) + "%" : "-"}</td>
                    <td className="py-3 px-3 text-xs text-gray-300">{entry.firstAC ? new Date(entry.firstAC).toLocaleString() : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 