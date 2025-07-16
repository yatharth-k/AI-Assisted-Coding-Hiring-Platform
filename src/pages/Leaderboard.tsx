import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Contest {
  id: string;
  title: string;
  start_time: string;
  end_time: string;
}

export default function LeaderboardContestPicker() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContests() {
      setLoading(true);
      const { data } = await supabase.from("contests").select("id, title, start_time, end_time").order("start_time", { ascending: false });
      setContests(data || []);
      setLoading(false);
    }
    fetchContests();
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] flex items-center justify-center font-manrope relative px-4 py-12">
      {/* Animated floating shapes */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none select-none">
        <div className="absolute left-[8%] top-[18%] w-56 h-56 rounded-full bg-purple-400/20 blur-3xl animate-float-slow" />
        <div className="absolute right-[10%] top-[8%] w-40 h-40 rounded-full bg-cyan-400/20 blur-2xl animate-float-slower" />
        <div className="absolute left-[45%] bottom-[10%] w-44 h-44 rounded-full bg-indigo-400/20 blur-2xl animate-float-slowest" />
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 32 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-3xl max-w-lg w-full px-8 py-10 flex flex-col items-center"
      >
        <CardHeader className="w-full flex flex-col items-center">
          <motion.div
            animate={{ scale: [1, 1.15, 1], filter: ["drop-shadow(0 0 16px #facc15cc)", "drop-shadow(0 0 32px #facc15cc)", "drop-shadow(0 0 16px #facc15cc)"] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="mb-2"
          >
            <Trophy className="h-14 w-14 text-yellow-400" />
          </motion.div>
          <CardTitle className="text-white text-2xl flex items-center gap-2 font-manrope mb-1">
            Select a Contest Leaderboard
          </CardTitle>
        </CardHeader>
        <CardContent className="w-full">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="animate-spin h-8 w-8 text-purple-400" />
            </div>
          ) : contests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <p className="text-indigo-100 text-center mb-6 text-lg">No contests available yet.<br/>Check back soon for upcoming challenges!</p>
              <Link to="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.96 }}
                  className="rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 text-white px-6 py-2 font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
                >
                  Go to Dashboard
                </motion.button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              <AnimatePresence>
                {contests.map((contest, idx) => (
                  <motion.li
                    key={contest.id}
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 24 }}
                    transition={{ duration: 0.5, delay: idx * 0.08, ease: 'easeOut' }}
                  >
                    <Link
                      to={`/contests/${contest.id}/leaderboard`}
                      className="block bg-gradient-to-r from-purple-900/60 to-indigo-900/60 rounded-xl px-6 py-4 shadow hover:shadow-xl hover:scale-[1.03] transition-all duration-200 border border-purple-700/30 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <span className="text-lg font-semibold text-white font-manrope">{contest.title}</span>
                        <span className="text-xs text-slate-300">{new Date(contest.start_time).toLocaleString()}</span>
                      </div>
                    </Link>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          )}
        </CardContent>
      </motion.div>
    </div>
  );
}
