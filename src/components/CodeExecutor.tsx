
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, MemoryStick, AlertCircle, CheckCircle } from "lucide-react";
import { judge0Service } from "@/services/judge0Service";
import { Progress } from "@/components/ui/progress";

interface CodeExecutorProps {
  code: string;
  language: string;
  testCases?: Array<{
    input: string;
    expectedOutput: string;
  }>;
  onExecutionComplete?: (results: any) => void;
}

export const CodeExecutor: React.FC<CodeExecutorProps> = ({
  code,
  language,
  testCases = [],
  onExecutionComplete
}) => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [currentTest, setCurrentTest] = useState(0);
  const [progress, setProgress] = useState(0);

  const executeCode = async () => {
    if (!code.trim()) {
      return;
    }

    setIsExecuting(true);
    setResults(null);
    setProgress(0);

    try {
      if (testCases.length > 0) {
        // Execute against test cases
        const testResults = [];
        
        for (let i = 0; i < testCases.length; i++) {
          setCurrentTest(i + 1);
          setProgress(((i + 1) / testCases.length) * 100);
          
          const testCase = testCases[i];
          const result = await judge0Service.executeCode(
            code,
            language,
            testCase.input,
            testCase.expectedOutput
          );

          const passed = result.stdout?.trim() === testCase.expectedOutput.trim();
          testResults.push({
            ...result,
            testCase,
            passed,
            index: i + 1
          });
        }

        const passedTests = testResults.filter(r => r.passed).length;
        const finalResults = {
          testResults,
          summary: {
            totalTests: testCases.length,
            passedTests,
            failedTests: testCases.length - passedTests,
            successRate: (passedTests / testCases.length) * 100
          }
        };

        setResults(finalResults);
        onExecutionComplete?.(finalResults);
      } else {
        // Simple execution without test cases
        const result = await judge0Service.executeCode(code, language);
        setResults({ singleResult: result });
        onExecutionComplete?.(result);
      }
    } catch (error) {
      console.error('Execution error:', error);
      setResults({
        error: error instanceof Error ? error.message : 'Unknown execution error'
      });
    } finally {
      setIsExecuting(false);
      setProgress(100);
    }
  };

  const getStatusBadge = (statusId: number) => {
    const statusMap: Record<number, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline' }> = {
      3: { label: 'Accepted', variant: 'default' },
      4: { label: 'Wrong Answer', variant: 'destructive' },
      5: { label: 'Time Limit Exceeded', variant: 'secondary' },
      6: { label: 'Compilation Error', variant: 'destructive' },
      7: { label: 'Runtime Error', variant: 'destructive' },
    };
    
    const status = statusMap[statusId] || { label: 'Unknown', variant: 'outline' as const };
    return <Badge variant={status.variant}>{status.label}</Badge>;
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
      </CardHeader>

      <CardContent>
        {results?.error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2 text-red-400">
              <AlertCircle className="h-4 w-4" />
              <span className="font-semibold">Execution Error</span>
            </div>
            <p className="text-red-300 mt-2">{results.error}</p>
          </div>
        )}

        {results?.summary && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-white font-semibold">Test Results Summary</h3>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-400">
                  {results.summary.passedTests}/{results.summary.totalTests} passed
                </span>
              </div>
            </div>
            <div className="bg-slate-700 rounded-lg p-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-slate-400">Success Rate:</span>
                  <span className="text-white ml-2">{results.summary.successRate.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-slate-400">Passed:</span>
                  <span className="text-green-400 ml-2">{results.summary.passedTests}</span>
                </div>
                <div>
                  <span className="text-slate-400">Failed:</span>
                  <span className="text-red-400 ml-2">{results.summary.failedTests}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {results?.testResults && (
          <div className="space-y-3">
            {results.testResults.map((result: any, index: number) => (
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
                <CardContent className="text-sm space-y-2">
                  <div>
                    <span className="text-slate-400">Input: </span>
                    <span className="text-slate-300">{result.testCase.input}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Expected: </span>
                    <span className="text-slate-300">{result.testCase.expectedOutput}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Output: </span>
                    <span className={result.passed ? 'text-green-400' : 'text-red-400'}>
                      {result.stdout || 'No output'}
                    </span>
                  </div>
                  {result.time && (
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{result.time}s</span>
                      </div>
                      {result.memory && (
                        <div className="flex items-center space-x-1">
                          <MemoryStick className="h-3 w-3" />
                          <span>{result.memory}KB</span>
                        </div>
                      )}
                    </div>
                  )}
                  {result.stderr && (
                    <div className="bg-red-900/20 p-2 rounded text-red-300 text-xs">
                      <strong>Error:</strong> {result.stderr}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {results?.singleResult && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Execution Result</span>
              {getStatusBadge(results.singleResult.status.id)}
            </div>
            
            {results.singleResult.stdout && (
              <div className="bg-slate-700 p-3 rounded-lg">
                <h4 className="text-slate-400 text-sm mb-2">Output:</h4>
                <pre className="text-slate-300 text-sm whitespace-pre-wrap">
                  {results.singleResult.stdout}
                </pre>
              </div>
            )}
            
            {results.singleResult.stderr && (
              <div className="bg-red-900/20 border border-red-500 p-3 rounded-lg">
                <h4 className="text-red-400 text-sm mb-2">Error:</h4>
                <pre className="text-red-300 text-sm whitespace-pre-wrap">
                  {results.singleResult.stderr}
                </pre>
              </div>
            )}
            
            {results.singleResult.compile_output && (
              <div className="bg-yellow-900/20 border border-yellow-500 p-3 rounded-lg">
                <h4 className="text-yellow-400 text-sm mb-2">Compilation Output:</h4>
                <pre className="text-yellow-300 text-sm whitespace-pre-wrap">
                  {results.singleResult.compile_output}
                </pre>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
