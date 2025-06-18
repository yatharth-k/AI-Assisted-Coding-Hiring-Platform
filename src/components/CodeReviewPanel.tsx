
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Info, Lightbulb, BarChart3, Eye } from "lucide-react";
import { codeReviewService } from "@/services/codeReviewService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CodeReviewPanelProps {
  code: string;
  language: string;
  userId?: string;
  problemId?: string;
  onReviewComplete?: (analysis: any) => void;
}

export const CodeReviewPanel: React.FC<CodeReviewPanelProps> = ({
  code,
  language,
  userId,
  problemId,
  onReviewComplete
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const analyzeCode = async () => {
    if (!code.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await codeReviewService.analyzeCode(code, language);
      setAnalysis(result);
      onReviewComplete?.(result);

      // Save to database if user and problem are provided
      if (userId && problemId) {
        await codeReviewService.saveCodeReview({
          userId,
          problemId,
          code,
          language,
          analysis: result
        });
      }
    } catch (error) {
      console.error('Code analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    // Auto-analyze when code changes (debounced)
    const timer = setTimeout(() => {
      if (code.trim() && code.length > 10) {
        analyzeCode();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [code]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      default:
        return <Info className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Code Review</span>
          </CardTitle>
          <Button
            onClick={analyzeCode}
            disabled={isAnalyzing || !code.trim()}
            variant="outline"
            size="sm"
            className="border-slate-600 text-white hover:bg-slate-700"
          >
            {isAnalyzing ? 'Analyzing...' : 'Review Code'}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {isAnalyzing && (
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm text-slate-300">
              <span>Analyzing code quality...</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        )}

        {analysis && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-700">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-purple-600">
                Overview
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="text-white data-[state=active]:bg-purple-600">
                Suggestions
              </TabsTrigger>
              <TabsTrigger value="issues" className="text-white data-[state=active]:bg-purple-600">
                Issues
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-700 border-slate-600">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-slate-300 flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>Overall Score</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      <span className={getScoreColor(analysis.overall_score)}>
                        {analysis.overall_score}
                      </span>
                      <span className="text-slate-400 text-sm ml-1">/100</span>
                    </div>
                    <Progress value={analysis.overall_score} className="mt-2 h-2" />
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Readability:</span>
                    <span className={`font-medium ${getScoreColor(analysis.readability_score)}`}>
                      {analysis.readability_score}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Complexity:</span>
                    <span className={`font-medium ${getScoreColor(analysis.complexity_score)}`}>
                      {analysis.complexity_score}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Maintainability:</span>
                    <span className={`font-medium ${getScoreColor(analysis.maintainability_score)}`}>
                      {analysis.maintainability_score}/100
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="suggestions" className="space-y-3 mt-4">
              {analysis.suggestions.length > 0 ? (
                analysis.suggestions.map((suggestion: string, index: number) => (
                  <Card key={index} className="bg-slate-700 border-slate-600">
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                        <p className="text-slate-300 text-sm">{suggestion}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-slate-300">No suggestions - your code looks great!</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="issues" className="space-y-3 mt-4">
              {analysis.issues.length > 0 ? (
                analysis.issues.map((issue: any, index: number) => (
                  <Card key={index} className="bg-slate-700 border-slate-600">
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-2">
                        {getIssueIcon(issue.type)}
                        <div className="flex-1">
                          <p className="text-slate-300 text-sm">{issue.message}</p>
                          {issue.line && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              Line {issue.line}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <p className="text-slate-300">No issues found - clean code!</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {!analysis && !isAnalyzing && (
          <div className="text-center py-8 text-slate-400">
            <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Write some code to get AI-powered review and suggestions</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
