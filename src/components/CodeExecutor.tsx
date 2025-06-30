import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, MemoryStick, AlertCircle, CheckCircle, XCircle, Info, Copy, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { codeReviewService, ExecutionLog } from "@/services/codeReviewService";
import { useAuth } from "@/contexts/AuthContext";

interface CodeExecutorProps {
  code: string;
  language: string;
  testCases?: TestCase[];
  onExecutionComplete?: (results: Results) => void;
}

interface TestCase {
  input: string;
  expectedOutput: string;
}

interface ExecutionResult {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string | null;
  memory: number | null;
}

interface TestResult extends ExecutionResult {
  testCase: TestCase;
  passed: boolean;
  index: number;
}

interface ResultsSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  successRate: number;
  totalTime: number;
  totalMemory: number;
}

interface MultiTestResults {
  testResults: TestResult[];
  summary: ResultsSummary;
}

interface SingleResult {
  singleResult: ExecutionResult;
}

interface ErrorResult {
  error: string;
  details?: string;
  timestamp: string;
}

type Results = MultiTestResults | SingleResult | ErrorResult | null;

// Utility functions for output handling
const decodeBase64 = (str: string | null): string => {
  if (!str) return '';
  try {
    return atob(str);
  } catch (error) {
    console.warn('Failed to decode base64:', error);
    return str; // Return original if decoding fails
  }
};

const formatOutput = (output: string): string => {
  if (!output) return '';
  // Normalize line endings and preserve formatting
  return output.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
};

const formatTime = (time: string | null): string => {
  if (!time) return 'N/A';
  const num = parseFloat(time);
  return num < 1000 ? `${num}ms` : `${(num / 1000).toFixed(2)}s`;
};

const formatMemory = (memory: number | null): string => {
  if (!memory) return 'N/A';
  return memory < 1024 ? `${memory}KB` : `${(memory / 1024).toFixed(2)}MB`;
};

const getStatusInfo = (statusId: number) => {
  const statusMap: Record<number, { 
    label: string; 
    variant: 'default' | 'destructive' | 'secondary' | 'outline';
    icon: React.ReactNode;
    color: string;
  }> = {
    1: { label: 'In Queue', variant: 'secondary', icon: <Clock className="h-3 w-3" />, color: 'text-yellow-400' },
    2: { label: 'Processing', variant: 'secondary', icon: <Clock className="h-3 w-3 animate-spin" />, color: 'text-blue-400' },
    3: { label: 'Accepted', variant: 'default', icon: <CheckCircle className="h-3 w-3" />, color: 'text-green-400' },
    4: { label: 'Wrong Answer', variant: 'destructive', icon: <XCircle className="h-3 w-3" />, color: 'text-red-400' },
    5: { label: 'Time Limit Exceeded', variant: 'secondary', icon: <Clock className="h-3 w-3" />, color: 'text-orange-400' },
    6: { label: 'Compilation Error', variant: 'destructive', icon: <AlertCircle className="h-3 w-3" />, color: 'text-red-400' },
    7: { label: 'Runtime Error', variant: 'destructive', icon: <AlertCircle className="h-3 w-3" />, color: 'text-red-400' },
    8: { label: 'Memory Limit Exceeded', variant: 'secondary', icon: <MemoryStick className="h-3 w-3" />, color: 'text-orange-400' },
  };
  
  return statusMap[statusId] || { 
    label: 'Unknown', 
    variant: 'outline' as const, 
    icon: <Info className="h-3 w-3" />, 
    color: 'text-gray-400' 
  };
};

const copyToClipboard = async (text: string, label: string) => {
  try {
    await navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  } catch (error) {
    console.error('Failed to copy:', error);
    toast({
      title: "Copy failed",
      description: "Failed to copy to clipboard",
      variant: "destructive",
    });
  }
};

const downloadOutput = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const CodeExecutor: React.FC<CodeExecutorProps> = ({
  code,
  language,
  testCases = [],
  onExecutionComplete
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<Results>(null);
  const [currentTest, setCurrentTest] = useState(0);
  const [progress, setProgress] = useState(0);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const { user } = useAuth();

  const logExecution = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setExecutionLog(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const logExecutionToDatabase = async (executionData: Partial<ExecutionLog>) => {
    if (!user?.id) return;

    try {
      await codeReviewService.logExecution({
        user_id: user.id,
        language: executionData.language || language,
        code_length: executionData.code_length || code.length,
        execution_time: executionData.execution_time || 0,
        memory_usage: executionData.memory_usage || 0,
        status: executionData.status || 'Unknown',
        stdout: executionData.stdout,
        stderr: executionData.stderr,
        compile_output: executionData.compile_output,
        test_cases_passed: executionData.test_cases_passed,
        test_cases_total: executionData.test_cases_total,
        success_rate: executionData.success_rate,
        error_message: executionData.error_message,
      });
    } catch (error) {
      console.warn('Failed to log execution to database:', error);
      // Don't throw - logging failures shouldn't break the main flow
    }
  };

  const executeCode = async () => {
    if (!code.trim()) {
      toast({
        title: "No code to execute",
        description: "Please enter some code first",
        variant: "destructive",
      });
      return;
    }

    const startTime = Date.now();
    setIsExecuting(true);
    setResults(null);
    setProgress(0);
    setExecutionLog([]);
    logExecution(`Starting execution for ${language} code`);

    try {
      if (testCases.length > 0) {
        // Execute against test cases
        const testResults = [];
        let totalTime = 0;
        let totalMemory = 0;

        for (let i = 0; i < testCases.length; i++) {
          setCurrentTest(i + 1);
          setProgress(((i + 1) / testCases.length) * 100);
          const testCase = testCases[i];
          
          logExecution(`Running test case ${i + 1}/${testCases.length}`);
          
          // Call backend API
          const response = await fetch('/api/run-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sourceCode: code,
              language,
              stdin: testCase.input
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const result = await response.json();
          
          // Decode base64 outputs
          const decodedResult = {
            ...result,
            stdout: decodeBase64(result.stdout),
            stderr: decodeBase64(result.stderr),
            compile_output: decodeBase64(result.compile_output)
          };

          const expectedOutput = formatOutput(testCase.expectedOutput);
          const actualOutput = formatOutput(decodedResult.stdout || '');
          const passed = actualOutput.trim() === expectedOutput.trim();
          
          if (decodedResult.time) totalTime += parseFloat(decodedResult.time);
          if (decodedResult.memory) totalMemory += decodedResult.memory;

          testResults.push({
            ...decodedResult,
            testCase,
            passed,
            index: i + 1
          });

          logExecution(`Test case ${i + 1} ${passed ? 'PASSED' : 'FAILED'}`);
        }

        const passedTests = testResults.filter(r => r.passed).length;
        const successRate = (passedTests / testCases.length) * 100;
        const finalResults = {
          testResults,
          summary: {
            totalTests: testCases.length,
            passedTests,
            failedTests: testCases.length - passedTests,
            successRate,
            totalTime,
            totalMemory
          }
        };
        
        setResults(finalResults);
        onExecutionComplete?.(finalResults);
        logExecution(`Execution completed: ${passedTests}/${testCases.length} tests passed`);
        
        // Log to database
        await logExecutionToDatabase({
          language,
          code_length: code.length,
          execution_time: Date.now() - startTime,
          memory_usage: totalMemory,
          status: successRate === 100 ? 'Accepted' : 'Wrong Answer',
          test_cases_passed: passedTests,
          test_cases_total: testCases.length,
          success_rate: successRate,
        });
        
        toast({
          title: "Execution Complete",
          description: `${passedTests}/${testCases.length} test cases passed`,
          variant: passedTests === testCases.length ? "default" : "destructive",
        });
      } else {
        // Simple execution without test cases
        logExecution(`Executing single code run`);
        
        const response = await fetch('/api/run-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceCode: code,
            language,
            stdin: ''
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        
        // Decode base64 outputs
        const decodedResult = {
          ...result,
          stdout: decodeBase64(result.stdout),
          stderr: decodeBase64(result.stderr),
          compile_output: decodeBase64(result.compile_output)
        };

        setResults({ singleResult: decodedResult });
        onExecutionComplete?.(decodedResult);
        
        const statusInfo = getStatusInfo(decodedResult.status.id);
        logExecution(`Execution completed with status: ${statusInfo.label}`);
        
        // Log to database
        await logExecutionToDatabase({
          language,
          code_length: code.length,
          execution_time: Date.now() - startTime,
          memory_usage: decodedResult.memory || 0,
          status: statusInfo.label,
          stdout: decodedResult.stdout,
          stderr: decodedResult.stderr,
          compile_output: decodedResult.compile_output,
          success_rate: statusInfo.variant === 'default' ? 100 : 0,
        });
        
        toast({
          title: "Execution Complete",
          description: statusInfo.label,
          variant: statusInfo.variant === 'default' ? 'default' : 'destructive',
        });
      }
    } catch (error) {
      console.error('Execution error:', error);
      const errorResult: ErrorResult = {
        error: error instanceof Error ? error.message : 'Unknown execution error',
        details: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      };
      setResults(errorResult);
      onExecutionComplete?.(errorResult);
      
      logExecution(`Execution failed: ${errorResult.error}`);
      
      // Log error to database
      await logExecutionToDatabase({
        language,
        code_length: code.length,
        execution_time: Date.now() - startTime,
        memory_usage: 0,
        status: 'Error',
        error_message: errorResult.error,
        success_rate: 0,
      });
      
      toast({
        title: "Execution Failed",
        description: errorResult.error,
        variant: "destructive",
      });
    } finally {
      setIsExecuting(false);
      setProgress(100);
    }
  };

  const getStatusBadge = (statusId: number) => {
    const statusInfo = getStatusInfo(statusId);
    return (
      <Badge variant={statusInfo.variant} className="flex items-center space-x-1">
        {statusInfo.icon}
        <span>{statusInfo.label}</span>
      </Badge>
    );
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Play className="h-5 w-5" />
            <span>Code Execution</span>
          </CardTitle>
          <Button
            onClick={executeCode}
            disabled={isExecuting || !code.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            {isExecuting ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Executing...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Code
              </>
            )}
          </Button>
        </div>
        
        {isExecuting && testCases.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Running test case {currentTest} of {testCases.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Execution Log */}
        {executionLog.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-slate-300 text-sm font-medium">Execution Log</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExecutionLog([])}
                className="text-slate-400 hover:text-slate-300"
              >
                Clear
              </Button>
            </div>
            <div className="bg-slate-900 rounded-lg p-3 max-h-32 overflow-y-auto">
              {executionLog.map((log, index) => (
                <div key={index} className="text-xs text-slate-400 font-mono">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {results && 'error' in results && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="font-semibold">Execution Error</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(results.error, 'Error message')}
                  className="text-red-400 hover:text-red-300"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <span className="text-xs text-red-400">
                  {new Date(results.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <p className="text-red-300 mt-2 font-mono text-sm">{results.error}</p>
            {results.details && (
              <details className="mt-2">
                <summary className="text-red-400 text-sm cursor-pointer">Show Details</summary>
                <pre className="text-red-300 text-xs mt-2 whitespace-pre-wrap bg-red-900/20 p-2 rounded">
                  {results.details}
                </pre>
              </details>
            )}
          </div>
        )}

        {results && 'summary' in results && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">Test Results Summary</h3>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-400">
                  {(results as MultiTestResults).summary.passedTests}/{(results as MultiTestResults).summary.totalTests} passed
                </span>
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Success Rate:</span>
                  <span className="text-white ml-2">{(results as MultiTestResults).summary.successRate.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-slate-400">Passed:</span>
                  <span className="text-green-400 ml-2">{(results as MultiTestResults).summary.passedTests}</span>
                </div>
                <div>
                  <span className="text-slate-400">Failed:</span>
                  <span className="text-red-400 ml-2">{(results as MultiTestResults).summary.failedTests}</span>
                </div>
                <div>
                  <span className="text-slate-400">Total Time:</span>
                  <span className="text-white ml-2">{formatTime((results as MultiTestResults).summary.totalTime.toString())}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {results && 'testResults' in results && (
          <div className="space-y-3">
            {(results as MultiTestResults).testResults.map((result: TestResult, index: number) => (
              <Card key={index} className="bg-slate-700 border-slate-600">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">Test Case {result.index}</span>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(result.status.id)}
                      {result.passed ? (
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <span className="text-slate-400">Input: </span>
                      <div className="bg-slate-800 p-2 rounded mt-1 font-mono text-xs">
                        {result.testCase.input || '(empty)'}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400">Expected: </span>
                      <div className="bg-slate-800 p-2 rounded mt-1 font-mono text-xs">
                        {result.testCase.expectedOutput || '(empty)'}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Output: </span>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(result.stdout || '', 'Output')}
                          className="text-slate-400 hover:text-slate-300"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => downloadOutput(result.stdout || '', `test-${result.index}-output.txt`)}
                          className="text-slate-400 hover:text-slate-300"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className={`bg-slate-800 p-2 rounded mt-1 font-mono text-xs whitespace-pre-wrap ${
                      result.passed ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {result.stdout || 'No output'}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(result.time)}</span>
                    </div>
                    {result.memory && (
                      <div className="flex items-center space-x-1">
                        <MemoryStick className="h-3 w-3" />
                        <span>{formatMemory(result.memory)}</span>
                      </div>
                    )}
                  </div>
                  
                  {result.stderr && (
                    <div className="bg-red-900/20 p-2 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-red-400 text-xs font-semibold">Runtime Error:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(result.stderr || '', 'Error output')}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <pre className="text-red-300 text-xs whitespace-pre-wrap">{result.stderr}</pre>
                    </div>
                  )}
                  
                  {result.compile_output && (
                    <div className="bg-yellow-900/20 p-2 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-yellow-400 text-xs font-semibold">Compilation Output:</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(result.compile_output || '', 'Compilation output')}
                          className="text-yellow-400 hover:text-yellow-300"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <pre className="text-yellow-300 text-xs whitespace-pre-wrap">{result.compile_output}</pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {results && 'singleResult' in results && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Execution Result</span>
              {getStatusBadge(results.singleResult.status.id)}
            </div>
            
            {results.singleResult.stdout && (
              <div className="bg-slate-700 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-slate-400 text-sm">Output:</h4>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(results.singleResult.stdout || '', 'Output')}
                      className="text-slate-400 hover:text-slate-300"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadOutput(results.singleResult.stdout || '', 'output.txt')}
                      className="text-slate-400 hover:text-slate-300"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono">
                  {results.singleResult.stdout}
                </pre>
              </div>
            )}
            
            {results.singleResult.stderr && (
              <div className="bg-red-900/20 border border-red-500 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-red-400 text-sm">Runtime Error:</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(results.singleResult.stderr || '', 'Error output')}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <pre className="text-red-300 text-sm whitespace-pre-wrap font-mono">
                  {results.singleResult.stderr}
                </pre>
              </div>
            )}
            
            {results.singleResult.compile_output && (
              <div className="bg-yellow-900/20 border border-yellow-500 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-yellow-400 text-sm">Compilation Output:</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(results.singleResult.compile_output || '', 'Compilation output')}
                    className="text-yellow-400 hover:text-yellow-300"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <pre className="text-yellow-300 text-sm whitespace-pre-wrap font-mono">
                  {results.singleResult.compile_output}
                </pre>
              </div>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-slate-400">
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Time: {formatTime(results.singleResult.time)}</span>
              </div>
              {results.singleResult.memory && (
                <div className="flex items-center space-x-1">
                  <MemoryStick className="h-4 w-4" />
                  <span>Memory: {formatMemory(results.singleResult.memory)}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
