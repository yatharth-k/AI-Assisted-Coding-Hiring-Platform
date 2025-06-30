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

export interface ExecutionLog {
  id?: string;
  user_id?: string;
  language: string;
  code_length: number;
  execution_time: number;
  memory_usage: number;
  status: string;
  stdout?: string;
  stderr?: string;
  compile_output?: string;
  test_cases_passed?: number;
  test_cases_total?: number;
  success_rate?: number;
  error_message?: string;
  created_at?: string;
}

export interface CodeReview {
  id?: string;
  user_id?: string;
  code_snippet: string;
  language: string;
  review_comments: string[];
  suggestions: string[];
  score: number;
  created_at?: string;
}

class CodeReviewService {
  private log(message: string, data?: unknown) {
    const timestamp = new Date().toISOString();
    console.log(`[CodeReviewService ${timestamp}] ${message}`, data || '');
  }

  async logExecution(executionData: ExecutionLog): Promise<void> {
    try {
      this.log('Logging execution data', { 
        language: executionData.language, 
        status: executionData.status,
        successRate: executionData.success_rate 
      });

      const { error } = await supabase
        .from('execution_logs')
        .insert([executionData]);

      if (error) {
        this.log('Failed to log execution', { error: error.message });
        throw new Error(`Failed to log execution: ${error.message}`);
      }

      this.log('Execution logged successfully');
    } catch (error) {
      this.log('Error logging execution', { error: error instanceof Error ? error.message : 'Unknown error' });
      // Don't throw - logging failures shouldn't break the main flow
    }
  }

  async getExecutionHistory(userId: string, limit = 50): Promise<ExecutionLog[]> {
    try {
      this.log('Fetching execution history', { userId, limit });

      const { data, error } = await supabase
        .from('execution_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.log('Failed to fetch execution history', { error: error.message });
        throw new Error(`Failed to fetch execution history: ${error.message}`);
      }

      this.log('Execution history fetched successfully', { count: data?.length });
      return data || [];
    } catch (error) {
      this.log('Error fetching execution history', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  async getExecutionStats(userId: string): Promise<{
    totalExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    mostUsedLanguage: string;
    recentActivity: number;
  }> {
    try {
      this.log('Fetching execution stats', { userId });

      const { data, error } = await supabase
        .from('execution_logs')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        this.log('Failed to fetch execution stats', { error: error.message });
        throw new Error(`Failed to fetch execution stats: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return {
          totalExecutions: 0,
          successRate: 0,
          averageExecutionTime: 0,
          mostUsedLanguage: 'None',
          recentActivity: 0
        };
      }

      const totalExecutions = data.length;
      const successfulExecutions = data.filter(log => log.status === 'Accepted').length;
      const successRate = (successfulExecutions / totalExecutions) * 100;
      
      const averageExecutionTime = data.reduce((sum, log) => sum + (log.execution_time || 0), 0) / totalExecutions;
      
      const languageCounts = data.reduce((acc, log) => {
        acc[log.language] = (acc[log.language] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const mostUsedLanguage = Object.entries(languageCounts)
        .sort(([,a], [,b]) => b - a)[0][0];

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const recentActivity = data.filter(log => 
        new Date(log.created_at || '') > oneWeekAgo
      ).length;

      this.log('Execution stats calculated successfully', {
        totalExecutions,
        successRate,
        averageExecutionTime,
        mostUsedLanguage,
        recentActivity
      });

      return {
        totalExecutions,
        successRate,
        averageExecutionTime,
        mostUsedLanguage,
        recentActivity
      };
    } catch (error) {
      this.log('Error calculating execution stats', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  async createCodeReview(reviewData: CodeReview): Promise<CodeReview> {
    try {
      this.log('Creating code review', { 
        language: reviewData.language, 
        score: reviewData.score 
      });

      const { data, error } = await supabase
        .from('code_reviews')
        .insert([reviewData])
        .select()
        .single();

      if (error) {
        this.log('Failed to create code review', { error: error.message });
        throw new Error(`Failed to create code review: ${error.message}`);
      }

      this.log('Code review created successfully', { id: data?.id });
      return data;
    } catch (error) {
      this.log('Error creating code review', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  async getCodeReviews(userId: string, limit = 20): Promise<CodeReview[]> {
    try {
      this.log('Fetching code reviews', { userId, limit });

      const { data, error } = await supabase
        .from('code_reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        this.log('Failed to fetch code reviews', { error: error.message });
        throw new Error(`Failed to fetch code reviews: ${error.message}`);
      }

      this.log('Code reviews fetched successfully', { count: data?.length });
      return data || [];
    } catch (error) {
      this.log('Error fetching code reviews', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  // Analytics methods for debugging and monitoring
  async getSystemStats(): Promise<{
    totalExecutions: number;
    averageSuccessRate: number;
    mostPopularLanguage: string;
    averageExecutionTime: number;
    errorRate: number;
  }> {
    try {
      this.log('Fetching system-wide stats');

      const { data, error } = await supabase
        .from('execution_logs')
        .select('*');

      if (error) {
        this.log('Failed to fetch system stats', { error: error.message });
        throw new Error(`Failed to fetch system stats: ${error.message}`);
      }

      if (!data || data.length === 0) {
        return {
          totalExecutions: 0,
          averageSuccessRate: 0,
          mostPopularLanguage: 'None',
          averageExecutionTime: 0,
          errorRate: 0
        };
      }

      const totalExecutions = data.length;
      const successfulExecutions = data.filter(log => log.status === 'Accepted').length;
      const averageSuccessRate = (successfulExecutions / totalExecutions) * 100;
      
      const averageExecutionTime = data.reduce((sum, log) => sum + (log.execution_time || 0), 0) / totalExecutions;
      
      const languageCounts = data.reduce((acc, log) => {
        acc[log.language] = (acc[log.language] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const mostPopularLanguage = Object.entries(languageCounts)
        .sort(([,a], [,b]) => b - a)[0][0];

      const errorExecutions = data.filter(log => 
        log.status !== 'Accepted' && log.status !== 'In Queue' && log.status !== 'Processing'
      ).length;
      const errorRate = (errorExecutions / totalExecutions) * 100;

      this.log('System stats calculated successfully', {
        totalExecutions,
        averageSuccessRate,
        mostPopularLanguage,
        averageExecutionTime,
        errorRate
      });

      return {
        totalExecutions,
        averageSuccessRate,
        mostPopularLanguage,
        averageExecutionTime,
        errorRate
      };
    } catch (error) {
      this.log('Error calculating system stats', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  // Export execution logs for analysis
  async exportExecutionLogs(userId: string, format: 'json' | 'csv' = 'json'): Promise<string> {
    try {
      this.log('Exporting execution logs', { userId, format });

      const { data, error } = await supabase
        .from('execution_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        this.log('Failed to export execution logs', { error: error.message });
        throw new Error(`Failed to export execution logs: ${error.message}`);
      }

      if (format === 'csv') {
        const headers = ['Date', 'Language', 'Status', 'Execution Time', 'Memory Usage', 'Success Rate', 'Error Message'];
        const rows = data?.map(log => [
          log.created_at,
          log.language,
          log.status,
          log.execution_time,
          log.memory_usage,
          log.success_rate,
          log.error_message || ''
        ]) || [];
        
        const csvContent = [headers, ...rows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');
        
        return csvContent;
      } else {
        return JSON.stringify(data, null, 2);
      }
    } catch (error) {
      this.log('Error exporting execution logs', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

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
