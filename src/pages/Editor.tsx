import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Code, Play, Upload, ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { Link } from 'react-router-dom';
import { problems } from "@/data/problems";
import CodeEditor from "@/components/CodeEditor";

const Editor = () => {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(`# Write your solution here
def two_sum(nums, target):
    # Your code here
    pass`);
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [reviewResult, setReviewResult] = useState<string | null>(null);
  const [description, setDescription] = useState<string>(
    `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\nYou can return the answer in any order.`
  );

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
    } catch (e: any) {
      setTestResults([{ input: "Error", expected: "", actual: e.message, passed: false }]);
    }
    setIsRunning(false);
  };

  const handleSubmit = () => {
    console.log('Submitting solution:', { language, code });
    // TODO: Implement submission logic
  };

  // Helper to call AI endpoints
  const callAI = async (endpoint: string, body: any, onResult?: (result: string) => void) => {
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
    } catch (err: any) {
      setAiError(err.message);
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
    setTestResults(parsed.length ? parsed : [{ id: 1, input: '', expected: '', actual: '', raw: result }]);
  });
  const handlePlagiarism = () => callAI('plagiarism', { code });
  const handleDocGen = () => callAI('documentation', { code });
  const handleMultilingual = () => callAI('multilingual', { prompt: 'Explique ce que fait ce code : ' + code });
  const handleAssistant = () => callAI('assistant', { question: 'How do I solve this problem?' });
  const handleTextGen = () => callAI('text-generation', { prompt: 'Summarize this code: ' + code });

  // Parse test cases from AI output (very basic, can be improved)
  function parseTestCases(aiText: string): any[] {
    // Try to extract test cases from Python unittest format
    const cases: any[] = [];
    const regex = /def (test_\w+)\(self\):[\s\S]*?nums = ([^\n]+)[\s\S]*?target = ([^\n]+)[\s\S]*?expected = ([^\n]+)/g;
    let match;
    let id = 1;
    while ((match = regex.exec(aiText)) !== null) {
      cases.push({
        id: id++,
        input: `nums=${match[2]}, target=${match[3]}`,
        expected: match[4],
        actual: '',
        passed: null
      });
    }
    // Fallback: try to extract from markdown or list
    if (cases.length === 0) {
      const lines = aiText.split('\n').filter(l => l.trim());
      lines.forEach((line, idx) => {
        if (/input/i.test(line) && /expected/i.test(line)) {
          const input = line.match(/input:?\s*([^,]+)/i)?.[1] || '';
          const expected = line.match(/expected:?\s*([^,]+)/i)?.[1] || '';
          cases.push({ id: idx + 1, input, expected, actual: '', passed: null });
        }
      });
    }
    return cases;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm" className="text-white hover:text-purple-300">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center space-x-2">
            <Code className="h-6 w-6 text-purple-400" />
            <span className="text-xl font-bold text-white">Code Editor</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-slate-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm">45:32</span>
          </div>
        </div>
      </nav>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Problem Description */}
        <div className="w-1/2 border-r border-slate-700 overflow-y-auto">
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-white">Two Sum</h1>
                <Badge className="bg-green-500 text-white">Easy</Badge>
              </div>
              <div className="flex items-center space-x-4 text-sm text-slate-400 mb-4">
                <span>Accepted: 3.2M</span>
                <span>Submissions: 6.1M</span>
                <span>Acceptance Rate: 52.4%</span>
              </div>
            </div>

            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger value="description" className="text-white data-[state=active]:bg-purple-600">
                  Description
                </TabsTrigger>
                <TabsTrigger value="testcases" className="text-white data-[state=active]:bg-purple-600">
                  Test Cases
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-6">
                <div className="prose prose-invert max-w-none">
                  <p className="text-slate-300 leading-relaxed mb-4">
                    {description}
                  </p>
                  
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
                </div>
              </TabsContent>
              
              <TabsContent value="testcases" className="mt-6">
                <div className="space-y-4">
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
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Code Editor */}
        <div className="w-1/2 flex flex-col">
          {/* Editor Header */}
          <div className="p-4 border-b border-slate-700 bg-slate-800">
            <div className="flex items-center justify-between">
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-700 border-slate-600">
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                  <SelectItem value="cpp">C++</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRunCode}
                  disabled={isRunning}
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isRunning ? 'Running...' : 'Run Code'}
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Submit
                </Button>
              </div>
            </div>
          </div>

          {/* Editor */}
          <div className="flex-1 flex flex-col">
            <CodeEditor
              value={code}
              language={language}
              onChange={setCode}
              className="flex-1 min-h-[300px]"
            />
          </div>

          {/* Output Panel */}
          <div className="h-1/3 border-t border-slate-700 bg-slate-800">
            <div className="p-4">
              <h3 className="text-white font-semibold mb-2">Output</h3>
              <div className="bg-slate-900 p-3 rounded-lg h-32 overflow-y-auto">
                <pre className="text-slate-300 text-sm whitespace-pre-wrap">
                  {output || 'Run your code to see the output here...'}
                </pre>
              </div>
            </div>
          </div>

          {/* AI Buttons */}
          <div className="flex flex-wrap gap-2 my-2">
            <Button size="sm" onClick={handleGenerateCode}>Generate Code</Button>
            <Button size="sm" onClick={handleReview}>Review Code</Button>
            <Button size="sm" onClick={handleExplain}>Explain Code</Button>
            <Button size="sm" onClick={handleBugDetect}>Detect Bugs</Button>
            <Button size="sm" onClick={handleTestCases}>Generate Test Cases</Button>
            <Button size="sm" onClick={handlePlagiarism}>Plagiarism Check</Button>
            <Button size="sm" onClick={handleDocGen}>Generate Docs</Button>
            <Button size="sm" onClick={handleMultilingual}>Multilingual</Button>
            <Button size="sm" onClick={handleAssistant}>Ask Assistant</Button>
            <Button size="sm" onClick={handleTextGen}>Summarize</Button>
          </div>
          {aiLoading && <div className="text-yellow-400">AI is thinking...</div>}
          {aiError && <div className="text-red-400">Error: {aiError}</div>}
          {reviewResult && <div className="bg-slate-800 text-white p-4 rounded mt-2 whitespace-pre-wrap max-h-64 overflow-y-auto">{reviewResult}</div>}
          {aiResult && <div className="bg-slate-800 text-white p-4 rounded mt-2 whitespace-pre-wrap max-h-64 overflow-y-auto">{aiResult}</div>}
        </div>
      </div>
    </div>
  );
};

export default Editor;
