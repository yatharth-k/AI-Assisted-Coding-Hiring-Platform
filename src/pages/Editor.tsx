import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Play, Upload, ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from 'react-router-dom';
import { problems } from "@/data/problems";
import CodeEditor from "@/components/CodeEditor";
import { motion, useReducedMotion } from 'framer-motion';
import "@fontsource/jetbrains-mono/700.css";
import "@fontsource/fira-code/700.css";
import "@fontsource/manrope/700.css";

const Editor = () => {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(`# Write your solution here
def two_sum(nums, target):
    # Your code here
    pass`);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<Array<{ input: string; expected: string; actual: string; passed: boolean | null }>>([]);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [reviewResult, setReviewResult] = useState<string | null>(null);
  const [description, setDescription] = useState<string>(
    `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\nYou can return the answer in any order.`
  );
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  const problem = problems[0]; // For now, use the first problem (Two Sum)
  const publicTestCases = problem.publicTestCases;
  const privateTestCases = problem.privateTestCases;

  const handleRunCode = async () => {
    setIsRunning(true);
    setTestResults([]);
    try {
      const res = await fetch("/api/execute-with-tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          language,
          testCases: [...publicTestCases, ...privateTestCases]
        })
      });
      const data = await res.json();
      setTestResults(data.results.slice(0, publicTestCases.length));
    } catch (e: unknown) {
      setTestResults([{ input: "Error", expected: "", actual: e instanceof Error ? e.message : String(e), passed: false }]);
    }
    setIsRunning(false);
  };

  const handleSubmit = () => {
    console.log('Submitting solution:', { language, code });
    // TODO: Implement submission logic
  };

  // Helper to call AI endpoints
  const callAI = async (endpoint: string, body: unknown, onResult?: (result: string) => void) => {
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);
    try {
      const res = await fetch(`/api/ai/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.result) {
        if (onResult) onResult(data.result);
        else setAiResult(data.result);
      } else setAiError(data.error || 'No result');
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : String(err));
    } finally {
      setAiLoading(false);
    }
  };

  // AI action handlers
  const handleGenerateCode = () => callAI('code-generation', { prompt: description, language }, (result) => setCode(result));
  const handleReview = () => callAI('code-review', { code }, (result) => setReviewResult(result));
  const handleExplain = () => callAI('explanation', { code });
  const handleBugDetect = () => callAI('bug-detection', { code });
  const handleTestCases = () => callAI('test-cases', { code, count: 5 }, (result) => {
    // Try to parse test cases from result (expecting Python unittest or similar)
    // Fallback: show as raw text if parsing fails
    const parsed = parseTestCases(result);
    setTestResults(parsed.length ? parsed : [{ input: '', expected: '', actual: '', passed: null }]);
  });
  const handlePlagiarism = () => callAI('plagiarism', { code });
  const handleDocGen = () => callAI('documentation', { code });
  const handleMultilingual = () => callAI('multilingual', { prompt: 'Explique ce que fait ce code : ' + code });
  const handleAssistant = () => callAI('assistant', { question: 'How do I solve this problem?' });
  const handleTextGen = () => callAI('text-generation', { prompt: 'Summarize this code: ' + code });

  // Parse test cases from AI output (very basic, can be improved)
  function parseTestCases(aiText: string): Array<{ input: string; expected: string; actual: string; passed: boolean | null }> {
    // Try to extract test cases from Python unittest format
    const cases: Array<{ input: string; expected: string; actual: string; passed: boolean | null }> = [];
    const regex = /def (test_\w+)\(self\):[\s\S]*?nums = ([^\n]+)[\s\S]*?target = ([^\n]+)[\s\S]*?expected = ([^\n]+)/g;
    let match;
    while ((match = regex.exec(aiText)) !== null) {
      cases.push({
        input: `nums=${match[2]}, target=${match[3]}`,
        expected: match[4],
        actual: '',
        passed: null
      });
    }
    // Fallback: try to extract from markdown or list
    if (cases.length === 0) {
      const lines = aiText.split('\n').filter(l => l.trim());
      lines.forEach((line) => {
        if (/input/i.test(line) && /expected/i.test(line)) {
          const input = line.match(/input:?\s*([^,]+)/i)?.[1] || '';
          const expected = line.match(/expected:?\s*([^,]+)/i)?.[1] || '';
          cases.push({ input, expected, actual: '', passed: null });
        }
      });
    }
    return cases;
  }

  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] flex flex-col font-manrope relative" style={{ fontFamily: 'Manrope, Poppins, Inter, sans-serif' }}>
      {/* Animated floating shapes */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none select-none">
        <div className="absolute left-[8%] top-[18%] w-56 h-56 rounded-full bg-purple-400/20 blur-3xl animate-float-slow" />
        <div className="absolute right-[10%] top-[8%] w-40 h-40 rounded-full bg-cyan-400/20 blur-2xl animate-float-slower" />
        <div className="absolute left-[45%] bottom-[10%] w-44 h-44 rounded-full bg-indigo-400/20 blur-2xl animate-float-slowest" />
      </div>
      {/* Navigation Bar */}
      <nav className="flex justify-between items-center px-6 py-4 border-b border-white/20 bg-white/10 backdrop-blur-xl rounded-b-2xl shadow-lg z-10">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard">
            <motion.button
              whileHover={shouldReduceMotion ? {} : { scale: 1.08 }}
              whileTap={shouldReduceMotion ? {} : { scale: 0.96 }}
              className="rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 text-white px-4 py-2 font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            >
              <ArrowLeft className="h-5 w-5 mr-2" /> Back
            </motion.button>
          </Link>
          <div className="flex items-center space-x-2">
            <Code className="h-7 w-7 text-purple-400" />
            <span className="text-2xl font-extrabold text-white font-manrope drop-shadow-xl">Code Editor</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {/* Timer as animated circular progress */}
          <motion.div
            initial={shouldReduceMotion ? false : { scale: 0.8, opacity: 0 }}
            animate={shouldReduceMotion ? false : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="relative flex items-center justify-center"
          >
            <svg width="44" height="44" className="absolute top-0 left-0">
              <circle cx="22" cy="22" r="20" stroke="#a78bfa" strokeWidth="4" fill="none" opacity="0.2" />
              <motion.circle
                cx="22" cy="22" r="20" stroke="#38bdf8" strokeWidth="4" fill="none"
                strokeDasharray={125.6}
                strokeDashoffset={125.6 - (elapsedSeconds % 60) / 60 * 125.6}
                initial={false}
                animate={{ strokeDashoffset: 125.6 - (elapsedSeconds % 60) / 60 * 125.6 }}
                transition={{ duration: 0.5, ease: 'linear' }}
                style={{ filter: 'drop-shadow(0 0 8px #38bdf8)' }}
              />
            </svg>
            <span className="text-white font-bold text-lg z-10">{formatTime(elapsedSeconds)}</span>
          </motion.div>
          {/* Theme toggle */}
          <motion.button
            whileHover={shouldReduceMotion ? {} : { scale: 1.12, rotate: 20 }}
            whileTap={shouldReduceMotion ? {} : { scale: 0.95, rotate: -20 }}
            className="rounded-full bg-gradient-to-tr from-indigo-700 to-purple-700 p-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all"
            aria-label="Toggle theme"
          >
            {/* Animated icon transition (example: sun/moon/sepia) */}
            <span className="block text-yellow-300 text-xl">🌙</span>
          </motion.button>
          {/* Profile/avatar dropdown */}
          <motion.div
            whileHover={shouldReduceMotion ? {} : { scale: 1.08 }}
            className="relative group"
          >
            <button className="rounded-full bg-gradient-to-tr from-purple-400 to-cyan-400 w-10 h-10 flex items-center justify-center shadow-lg focus:outline-none focus:ring-2 focus:ring-cyan-400">
              <span className="text-white font-bold text-lg">Y</span>
            </button>
            <div className="absolute right-0 mt-2 w-40 bg-white/90 rounded-xl shadow-xl p-4 hidden group-hover:block z-50">
              <Link to="/profile" className="block text-indigo-900 font-semibold py-1 hover:text-purple-600">Profile</Link>
              <button className="block w-full text-left text-indigo-900 font-semibold py-1 hover:text-purple-600">Sign Out</button>
            </div>
          </motion.div>
        </div>
      </nav>
      {/* Main Split Panel */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 w-full max-w-7xl mx-auto py-8 px-2 md:px-8 relative z-0">
        {/* Problem Details Panel */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, x: -32 }}
          animate={shouldReduceMotion ? false : { opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full md:w-1/2 flex-shrink-0 bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-0 md:p-6 flex flex-col mb-6 md:mb-0"
        >
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-extrabold text-white font-manrope">Two Sum</h1>
              <Badge className="bg-gradient-to-tr from-green-400 to-cyan-400 text-white font-bold rounded-xl shadow">Easy</Badge>
            </div>
            <div className="flex items-center space-x-4 text-sm text-indigo-200 mb-4">
              <span>Accepted: 3.2M</span>
              <span>Submissions: 6.1M</span>
              <span>Acceptance Rate: 52.4%</span>
            </div>
          </div>
          {/* Animated Tabs for Description/Test Cases */}
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 rounded-xl mb-4 overflow-hidden">
              <TabsTrigger value="description" className="text-white data-[state=active]:bg-gradient-to-tr data-[state=active]:from-purple-500 data-[state=active]:to-cyan-400 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold font-manrope rounded-xl transition-all">
                Description
              </TabsTrigger>
              <TabsTrigger value="testcases" className="text-white data-[state=active]:bg-gradient-to-tr data-[state=active]:from-purple-500 data-[state=active]:to-cyan-400 data-[state=active]:text-white data-[state=active]:shadow-lg font-semibold font-manrope rounded-xl transition-all">
                Test Cases
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description">
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="prose prose-invert max-w-none font-manrope text-lg leading-relaxed text-indigo-100"
              >
                <p className="mb-4">{description}</p>
                  
                  <div className="bg-slate-800 p-4 rounded-lg mb-6">
                    <h3 className="text-white font-semibold mb-2">Example 1:</h3>
                    <pre className="text-slate-300 text-sm">
                      <strong>Input:</strong> nums = [2,7,11,15], target = 9{'\n'}
                      <strong>Output:</strong> [0,1]{'\n'}
                      <strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
                    </pre>
                  </div>
                  
                  <div className="bg-slate-800 p-4 rounded-lg mb-6">
                    <h3 className="text-white font-semibold mb-2">Example 2:</h3>
                    <pre className="text-slate-300 text-sm">
                      <strong>Input:</strong> nums = [3,2,4], target = 6{'\n'}
                      <strong>Output:</strong> [1,2]
                    </pre>
                  </div>
                  
                  <div className="bg-slate-800 p-4 rounded-lg">
                    <h3 className="text-white font-semibold mb-2">Constraints:</h3>
                    <ul className="text-slate-300 text-sm space-y-1">
                      <li>• 2 ≤ nums.length ≤ 10⁴</li>
                      <li>• -10⁹ ≤ nums[i] ≤ 10⁹</li>
                      <li>• -10⁹ ≤ target ≤ 10⁹</li>
                      <li>• Only one valid answer exists.</li>
                    </ul>
                  </div>
                </motion.div>
            </TabsContent>
            <TabsContent value="testcases">
              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="space-y-4"
              >
                {testResults.length === 0 && <div className="text-slate-400">No test cases run yet.</div>}
                {testResults.map((test, idx) => (
                  <Card key={idx} className="bg-slate-800 border-slate-700">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm text-white">Test Case {idx + 1}</CardTitle>
                        <div className="flex items-center space-x-1">
                          {test.passed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className={`text-sm ${test.passed ? 'text-green-500' : 'text-red-500'}`}>
                            {test.passed ? 'Passed' : 'Failed'}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="text-sm">
                      <div className="space-y-2">
                        <div>
                          <span className="text-slate-400">Input: </span>
                          <span className="text-slate-300">{test.input}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Expected: </span>
                          <span className="text-slate-300">{test.expected}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Actual: </span>
                          <span className={test.passed ? 'text-green-400' : 'text-red-400'}>{test.actual}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        </motion.div>
        {/* Code Editor & Output Panel */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, x: 32 }}
          animate={shouldReduceMotion ? false : { opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="w-full md:w-1/2 flex flex-col gap-6"
        >
          {/* Editor Header */}
          <div className="flex items-center justify-between mb-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white font-manrope rounded-xl shadow focus:ring-2 focus:ring-cyan-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white/10 border-white/20 text-white font-manrope rounded-xl shadow">
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="java">Java</SelectItem>
                <SelectItem value="cpp">C++</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.08, boxShadow: '0 0 16px #38bdf8aa' }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                onClick={handleRunCode}
                disabled={isRunning}
                className="px-6 py-2 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 text-white font-bold font-manrope shadow-xl focus:outline-none focus:ring-4 focus:ring-cyan-300 transition-all duration-200 relative group text-lg flex items-center gap-2"
              >
                <Play className="h-5 w-5" />
                {isRunning ? 'Running...' : 'Run Code'}
              </motion.button>
              <motion.button
                whileHover={shouldReduceMotion ? {} : { scale: 1.08, boxShadow: '0 0 16px #38d996aa' }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                onClick={handleSubmit}
                className="px-6 py-2 rounded-full bg-gradient-to-tr from-green-400 to-cyan-400 text-white font-bold font-manrope shadow-xl focus:outline-none focus:ring-4 focus:ring-green-300 transition-all duration-200 relative group text-lg flex items-center gap-2"
              >
                <Upload className="h-5 w-5" />
                Submit
              </motion.button>
            </div>
          </div>
          {/* Code Editor */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="relative rounded-2xl shadow-2xl border-2 border-cyan-400/30 bg-white/10 backdrop-blur-xl overflow-hidden flex-1 min-h-[300px]"
            style={{ boxShadow: '0 4px 32px 0 #38bdf855, 0 0 0 4px #a78bfa33 inset' }}
          >
            <CodeEditor
              value={code}
              language={language}
              onChange={setCode}
              className="h-full w-full"
            />
            {/* Dynamic cursor/ripple animation at caret (to be implemented) */}
          </motion.div>
          {/* Output Panel */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-6 mt-2"
          >
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-white font-bold text-lg font-manrope">Output</h3>
              {/* Copy to clipboard button, tooltip, etc. */}
            </div>
            <div className={`rounded-xl p-4 min-h-[64px] font-mono text-base transition-all duration-300 ${output ? (testResults.every(t => t.passed) ? 'bg-green-900/40 text-green-300 animate-pulse-slow' : 'bg-red-900/40 text-red-300 animate-shake') : 'bg-white/5 text-indigo-100'}`}>
              <pre className="whitespace-pre-wrap">{output || 'Run your code to see the output here...'}</pre>
            </div>
            {/* Tooltip hints for errors, emoji/confetti for success, etc. */}
          </motion.div>
          {/* AI Utility Buttons - restored and redesigned */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
            animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
            className="flex flex-wrap gap-3 mt-4"
          >
            {[
              { label: 'Generate Code', onClick: handleGenerateCode },
              { label: 'Review Code', onClick: handleReview },
              { label: 'Explain Code', onClick: handleExplain },
              { label: 'Detect Bugs', onClick: handleBugDetect },
              { label: 'Generate Test Cases', onClick: handleTestCases },
              { label: 'Plagiarism Check', onClick: handlePlagiarism },
              { label: 'Generate Docs', onClick: handleDocGen },
              { label: 'Multilingual', onClick: handleMultilingual },
              { label: 'Ask Assistant', onClick: handleAssistant },
              { label: 'Summarize', onClick: handleTextGen },
            ].map((btn, idx) => (
              <motion.button
                key={btn.label}
                whileHover={shouldReduceMotion ? {} : { scale: 1.08, boxShadow: '0 0 16px #a78bfa99' }}
                whileTap={shouldReduceMotion ? {} : { scale: 0.97 }}
                onClick={btn.onClick}
                className="px-5 py-2 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 text-white font-semibold font-manrope shadow-xl focus:outline-none focus:ring-2 focus:ring-cyan-300 transition-all duration-200 relative group text-base"
                tabIndex={0}
                aria-label={btn.label}
                style={{ minWidth: 140 }}
              >
                {btn.label}
              </motion.button>
            ))}
          </motion.div>
          {/* AI/Output feedback, review, etc. as before, styled with glassy cards */}
        </motion.div>
      </div>
    </div>
  );
};

export default Editor;
