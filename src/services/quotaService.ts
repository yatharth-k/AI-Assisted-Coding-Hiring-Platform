import { supabase } from '@/integrations/supabase/client';

export interface QuotaUsage {
  dailyExecutions: number;
  monthlyExecutions: number;
  totalExecutions: number;
  lastExecution: string | null;
  quotaExceeded: boolean;
  quotaWarning: boolean;
}

export interface QuotaLimits {
  maxDailyExecutions: number;
  maxMonthlyExecutions: number;
  maxTotalExecutions: number;
  warningThreshold: number;
}

class QuotaService {
  private readonly defaultLimits: QuotaLimits = {
    maxDailyExecutions: parseInt(process.env.MAX_DAILY_EXECUTIONS || '1000'),
    maxMonthlyExecutions: parseInt(process.env.MAX_MONTHLY_EXECUTIONS || '30000'),
    maxTotalExecutions: parseInt(process.env.MAX_TOTAL_EXECUTIONS || '100000'),
    warningThreshold: parseFloat(process.env.QUOTA_WARNING_THRESHOLD || '0.9'),
  };

  // In-memory storage for demo purposes
  private executionCounts: Map<string, number> = new Map();
  private dailyCounts: Map<string, number> = new Map();
  private monthlyCounts: Map<string, number> = new Map();
  private lastExecutions: Map<string, string> = new Map();

  private log(message: string, data?: unknown) {
    const timestamp = new Date().toISOString();
    console.log(`[QuotaService ${timestamp}] ${message}`, data || '');
  }

  private getDateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  }

  private getMonthKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}`;
  }

  async checkQuota(userId?: string): Promise<QuotaUsage> {
    try {
      this.log('Checking quota usage', { userId });

      const today = new Date();
      const todayKey = this.getDateKey(today);
      const monthKey = this.getMonthKey(today);
      const userKey = userId || 'anonymous';

      // Get counts from memory
      const dailyExecutions = this.dailyCounts.get(`${userKey}-${todayKey}`) || 0;
      const monthlyExecutions = this.monthlyCounts.get(`${userKey}-${monthKey}`) || 0;
      const totalExecutions = this.executionCounts.get(userKey) || 0;
      const lastExecution = this.lastExecutions.get(userKey) || null;

      const usage: QuotaUsage = {
        dailyExecutions,
        monthlyExecutions,
        totalExecutions,
        lastExecution,
        quotaExceeded: false,
        quotaWarning: false,
      };

      // Check if quota is exceeded
      usage.quotaExceeded = 
        usage.dailyExecutions >= this.defaultLimits.maxDailyExecutions ||
        usage.monthlyExecutions >= this.defaultLimits.maxMonthlyExecutions ||
        usage.totalExecutions >= this.defaultLimits.maxTotalExecutions;

      // Check if quota warning should be shown
      usage.quotaWarning = 
        usage.dailyExecutions >= this.defaultLimits.maxDailyExecutions * this.defaultLimits.warningThreshold ||
        usage.monthlyExecutions >= this.defaultLimits.maxMonthlyExecutions * this.defaultLimits.warningThreshold ||
        usage.totalExecutions >= this.defaultLimits.maxTotalExecutions * this.defaultLimits.warningThreshold;

      this.log('Quota check completed', { usage });

      return usage;
    } catch (error) {
      this.log('Error checking quota', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  async logExecution(userId?: string, executionData?: unknown): Promise<void> {
    try {
      this.log('Logging execution for quota tracking', { userId });

      const now = new Date();
      const userKey = userId || 'anonymous';
      const todayKey = this.getDateKey(now);
      const monthKey = this.getMonthKey(now);

      // Update counts
      const currentTotal = this.executionCounts.get(userKey) || 0;
      this.executionCounts.set(userKey, currentTotal + 1);

      const currentDaily = this.dailyCounts.get(`${userKey}-${todayKey}`) || 0;
      this.dailyCounts.set(`${userKey}-${todayKey}`, currentDaily + 1);

      const currentMonthly = this.monthlyCounts.get(`${userKey}-${monthKey}`) || 0;
      this.monthlyCounts.set(`${userKey}-${monthKey}`, currentMonthly + 1);

      // Update last execution
      this.lastExecutions.set(userKey, now.toISOString());

      this.log('Execution logged', { userId, executionData });
    } catch (error) {
      this.log('Error logging execution', { error: error instanceof Error ? error.message : 'Unknown error' });
      // Don't throw - quota logging shouldn't break the main flow
    }
  }

  async getQuotaLimits(): Promise<QuotaLimits> {
    return this.defaultLimits;
  }

  async updateQuotaLimits(limits: Partial<QuotaLimits>): Promise<void> {
    try {
      this.log('Updating quota limits', { limits });

      // In a real implementation, this would update the limits in a database
      // For now, we'll just update the default limits
      Object.assign(this.defaultLimits, limits);

      this.log('Quota limits updated successfully');
    } catch (error) {
      this.log('Error updating quota limits', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  async resetDailyQuota(): Promise<void> {
    try {
      this.log('Resetting daily quota');

      // Clear daily counts
      this.dailyCounts.clear();

      this.log('Daily quota reset completed');
    } catch (error) {
      this.log('Error resetting daily quota', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  async getQuotaAnalytics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    averageExecutionsPerUser: number;
    topUsers: Array<{ userId: string; executions: number }>;
  }> {
    try {
      this.log('Fetching quota analytics');

      // Get unique users from execution counts
      const uniqueUsers = Array.from(this.executionCounts.keys());
      const totalUsersCount = uniqueUsers.length;

      // Get active users (users with executions in the last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const activeUsers = uniqueUsers.filter(userId => {
        const lastExecution = this.lastExecutions.get(userId);
        if (!lastExecution) return false;
        return new Date(lastExecution) > sevenDaysAgo;
      });
      const activeUsersCount = activeUsers.length;

      // Get top users by execution count
      const topUsersList = Array.from(this.executionCounts.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([userId, executions]) => ({ userId, executions }));

      const totalExecutions = Array.from(this.executionCounts.values()).reduce((sum, count) => sum + count, 0);
      const averageExecutionsPerUser = totalUsersCount > 0 ? totalExecutions / totalUsersCount : 0;

      const analytics = {
        totalUsers: totalUsersCount,
        activeUsers: activeUsersCount,
        averageExecutionsPerUser,
        topUsers: topUsersList,
      };

      this.log('Quota analytics fetched successfully', { analytics });

      return analytics;
    } catch (error) {
      this.log('Error fetching quota analytics', { error: error instanceof Error ? error.message : 'Unknown error' });
      throw error;
    }
  }

  async sendQuotaAlert(userId: string, quotaType: 'daily' | 'monthly' | 'total'): Promise<void> {
    try {
      this.log('Sending quota alert', { userId, quotaType });

      // In a real implementation, this would send an email, push notification, etc.
      // For now, we'll just log the alert
      this.log(`Quota alert sent to user ${userId} for ${quotaType} quota`);
    } catch (error) {
      this.log('Error sending quota alert', { error: error instanceof Error ? error.message : 'Unknown error' });
      // Don't throw - alert failures shouldn't break the main flow
    }
  }

  // Cleanup old data (should be called periodically)
  async cleanupOldData(): Promise<void> {
    try {
      this.log('Cleaning up old quota data');

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Remove old daily counts (older than 30 days)
      for (const [key] of this.dailyCounts) {
        const [, dateKey] = key.split('-', 2);
        if (dateKey) {
          const [year, month, day] = dateKey.split('-').map(Number);
          const date = new Date(year, month, day);
          if (date < thirtyDaysAgo) {
            this.dailyCounts.delete(key);
          }
        }
      }

      // Remove old monthly counts (older than 12 months)
      for (const [key] of this.monthlyCounts) {
        const [, monthKey] = key.split('-', 2);
        if (monthKey) {
          const [year, month] = monthKey.split('-').map(Number);
          const date = new Date(year, month, 1);
          const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);
          if (date < twelveMonthsAgo) {
            this.monthlyCounts.delete(key);
          }
        }
      }

      this.log('Old quota data cleanup completed');
    } catch (error) {
      this.log('Error cleaning up old data', { error: error instanceof Error ? error.message : 'Unknown error' });
    }
  }
}

export const quotaService = new QuotaService(); 