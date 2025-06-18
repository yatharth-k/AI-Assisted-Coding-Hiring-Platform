
import { supabase } from "@/integrations/supabase/client";

interface CodeReviewAnalysis {
  overall_score: number;
  readability_score: number;
  complexity_score: number;
  maintainability_score: number;
  suggestions: string[];
  issues: {
    type: 'warning' | 'error' | 'info';
    message: string;
    line?: number;
  }[];
}

class CodeReviewService {
  async analyzeCode(code: string, language: string): Promise<CodeReviewAnalysis> {
    try {
      // Call Supabase Edge Function for code analysis
      const { data, error } = await supabase.functions.invoke('analyze-code', {
        body: { code, language }
      });

      if (error) {
        console.error('Code analysis error:', error);
        return this.getFallbackAnalysis();
      }

      return data;
    } catch (error) {
      console.error('Code review service error:', error);
      return this.getFallbackAnalysis();
    }
  }

  private getFallbackAnalysis(): CodeReviewAnalysis {
    return {
      overall_score: 75,
      readability_score: 80,
      complexity_score: 70,
      maintainability_score: 75,
      suggestions: [
        "Consider adding more comments to improve code readability",
        "Break down complex functions into smaller, more manageable pieces",
        "Add error handling for better robustness"
      ],
      issues: [
        {
          type: 'info',
          message: 'Code analysis service temporarily unavailable - showing basic feedback'
        }
      ]
    };
  }

  async saveCodeReview(data: {
    userId: string;
    problemId: string;
    code: string;
    language: string;
    analysis: CodeReviewAnalysis;
  }): Promise<void> {
    const { error } = await supabase
      .from('code_reviews')
      .insert({
        user_id: data.userId,
        problem_id: data.problemId,
        code: data.code,
        language: data.language,
        overall_score: data.analysis.overall_score,
        readability_score: data.analysis.readability_score,
        complexity_score: data.analysis.complexity_score,
        maintainability_score: data.analysis.maintainability_score,
        suggestions: data.analysis.suggestions,
        issues: data.analysis.issues,
      });

    if (error) {
      console.error('Failed to save code review:', error);
      throw error;
    }
  }
}

export const codeReviewService = new CodeReviewService();
