export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      achievements: {
        Row: {
          badge_color: string | null
          created_at: string | null
          criteria: Json | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          xp_reward: number | null
        }
        Insert: {
          badge_color?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          xp_reward?: number | null
        }
        Update: {
          badge_color?: string | null
          created_at?: string | null
          criteria?: Json | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          xp_reward?: number | null
        }
        Relationships: []
      }
      assessment_attempts: {
        Row: {
          assessment_id: string | null
          candidate_email: string
          candidate_name: string | null
          completed_at: string | null
          id: string
          invitation_id: string | null
          is_completed: boolean | null
          percentage_score: number | null
          problems_solved: number | null
          started_at: string | null
          time_taken_minutes: number | null
          total_score: number | null
        }
        Insert: {
          assessment_id?: string | null
          candidate_email: string
          candidate_name?: string | null
          completed_at?: string | null
          id?: string
          invitation_id?: string | null
          is_completed?: boolean | null
          percentage_score?: number | null
          problems_solved?: number | null
          started_at?: string | null
          time_taken_minutes?: number | null
          total_score?: number | null
        }
        Update: {
          assessment_id?: string | null
          candidate_email?: string
          candidate_name?: string | null
          completed_at?: string | null
          id?: string
          invitation_id?: string | null
          is_completed?: boolean | null
          percentage_score?: number | null
          problems_solved?: number | null
          started_at?: string | null
          time_taken_minutes?: number | null
          total_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_attempts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_attempts_invitation_id_fkey"
            columns: ["invitation_id"]
            isOneToOne: false
            referencedRelation: "assessment_invitations"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_invitations: {
        Row: {
          assessment_id: string | null
          candidate_email: string
          candidate_name: string | null
          expires_at: string
          id: string
          invitation_token: string
          is_used: boolean | null
          sent_at: string | null
          used_at: string | null
        }
        Insert: {
          assessment_id?: string | null
          candidate_email: string
          candidate_name?: string | null
          expires_at: string
          id?: string
          invitation_token: string
          is_used?: boolean | null
          sent_at?: string | null
          used_at?: string | null
        }
        Update: {
          assessment_id?: string | null
          candidate_email?: string
          candidate_name?: string | null
          expires_at?: string
          id?: string
          invitation_token?: string
          is_used?: boolean | null
          sent_at?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_invitations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_problems: {
        Row: {
          assessment_id: string
          order_index: number | null
          points: number | null
          problem_id: string
        }
        Insert: {
          assessment_id: string
          order_index?: number | null
          points?: number | null
          problem_id: string
        }
        Update: {
          assessment_id?: string
          order_index?: number | null
          points?: number | null
          problem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_problems_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_problems_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          company_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          instructions: string | null
          is_proctored: boolean | null
          max_attempts: number | null
          passing_score: number | null
          status: Database["public"]["Enums"]["assessment_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          instructions?: string | null
          is_proctored?: boolean | null
          max_attempts?: number | null
          passing_score?: number | null
          status?: Database["public"]["Enums"]["assessment_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          instructions?: string | null
          is_proctored?: boolean | null
          max_attempts?: number | null
          passing_score?: number | null
          status?: Database["public"]["Enums"]["assessment_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string | null
          description: string | null
          headquarters: string | null
          id: string
          industry: string | null
          is_active: boolean | null
          is_verified: boolean | null
          logo_url: string | null
          name: string
          size_range: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name: string
          size_range?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          is_verified?: boolean | null
          logo_url?: string | null
          name?: string
          size_range?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      company_users: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "company_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_participants: {
        Row: {
          contest_id: string | null
          id: string
          last_submission_time: string | null
          problems_solved: number | null
          rank: number | null
          registered_at: string | null
          total_score: number | null
          user_id: string | null
        }
        Insert: {
          contest_id?: string | null
          id?: string
          last_submission_time?: string | null
          problems_solved?: number | null
          rank?: number | null
          registered_at?: string | null
          total_score?: number | null
          user_id?: string | null
        }
        Update: {
          contest_id?: string | null
          id?: string
          last_submission_time?: string | null
          problems_solved?: number | null
          rank?: number | null
          registered_at?: string | null
          total_score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contest_participants_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_problems: {
        Row: {
          contest_id: string
          order_index: number | null
          points: number | null
          problem_id: string
        }
        Insert: {
          contest_id: string
          order_index?: number | null
          points?: number | null
          problem_id: string
        }
        Update: {
          contest_id?: string
          order_index?: number | null
          points?: number | null
          problem_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_problems_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contest_problems_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      contests: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string
          id: string
          is_public: boolean | null
          max_participants: number | null
          prize_pool: string | null
          rules: string | null
          start_time: string
          status: Database["public"]["Enums"]["contest_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time: string
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          prize_pool?: string | null
          rules?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["contest_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string
          id?: string
          is_public?: boolean | null
          max_participants?: number | null
          prize_pool?: string | null
          rules?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["contest_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      leaderboards: {
        Row: {
          contest_id: string | null
          id: string
          last_updated: string | null
          problems_solved: number | null
          rank: number
          score: number | null
          total_time_minutes: number | null
          user_id: string | null
        }
        Insert: {
          contest_id?: string | null
          id?: string
          last_updated?: string | null
          problems_solved?: number | null
          rank: number
          score?: number | null
          total_time_minutes?: number | null
          user_id?: string | null
        }
        Update: {
          contest_id?: string | null
          id?: string
          last_updated?: string | null
          problems_solved?: number | null
          rank?: number
          score?: number | null
          total_time_minutes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leaderboards_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leaderboards_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      problem_categories: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      problem_tag_assignments: {
        Row: {
          problem_id: string
          tag_id: string
        }
        Insert: {
          problem_id: string
          tag_id: string
        }
        Update: {
          problem_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_tag_assignments_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "problem_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "problem_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      problem_tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      problems: {
        Row: {
          category_id: string | null
          created_at: string | null
          created_by: string | null
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          id: string
          is_active: boolean | null
          max_score: number | null
          memory_limit: number | null
          slug: string
          success_rate: number | null
          successful_submissions: number | null
          time_limit: number | null
          title: string
          total_submissions: number | null
          updated_at: string | null
          xp_reward: number | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          difficulty: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          is_active?: boolean | null
          max_score?: number | null
          memory_limit?: number | null
          slug: string
          success_rate?: number | null
          successful_submissions?: number | null
          time_limit?: number | null
          title: string
          total_submissions?: number | null
          updated_at?: string | null
          xp_reward?: number | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          difficulty?: Database["public"]["Enums"]["difficulty_level"]
          id?: string
          is_active?: boolean | null
          max_score?: number | null
          memory_limit?: number | null
          slug?: string
          success_rate?: number | null
          successful_submissions?: number | null
          time_limit?: number | null
          title?: string
          total_submissions?: number | null
          updated_at?: string | null
          xp_reward?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "problems_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "problem_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "problems_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      submissions: {
        Row: {
          code: string
          error_message: string | null
          execution_time: number | null
          id: string
          judged_at: string | null
          language: Database["public"]["Enums"]["programming_language"]
          memory_used: number | null
          problem_id: string | null
          score: number | null
          status: Database["public"]["Enums"]["submission_status"] | null
          submitted_at: string | null
          test_cases_passed: number | null
          total_test_cases: number | null
          user_id: string | null
        }
        Insert: {
          code: string
          error_message?: string | null
          execution_time?: number | null
          id?: string
          judged_at?: string | null
          language: Database["public"]["Enums"]["programming_language"]
          memory_used?: number | null
          problem_id?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["submission_status"] | null
          submitted_at?: string | null
          test_cases_passed?: number | null
          total_test_cases?: number | null
          user_id?: string | null
        }
        Update: {
          code?: string
          error_message?: string | null
          execution_time?: number | null
          id?: string
          judged_at?: string | null
          language?: Database["public"]["Enums"]["programming_language"]
          memory_used?: number | null
          problem_id?: string | null
          score?: number | null
          status?: Database["public"]["Enums"]["submission_status"] | null
          submitted_at?: string | null
          test_cases_passed?: number | null
          total_test_cases?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "submissions_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      test_cases: {
        Row: {
          created_at: string | null
          expected_output: string
          id: string
          input: string
          is_hidden: boolean | null
          is_sample: boolean | null
          problem_id: string | null
          weight: number | null
        }
        Insert: {
          created_at?: string | null
          expected_output: string
          id?: string
          input: string
          is_hidden?: boolean | null
          is_sample?: boolean | null
          problem_id?: string | null
          weight?: number | null
        }
        Update: {
          created_at?: string | null
          expected_output?: string
          id?: string
          input?: string
          is_hidden?: boolean | null
          is_sample?: boolean | null
          problem_id?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "test_cases_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_analytics: {
        Row: {
          attempts: number | null
          created_at: string | null
          date: string | null
          id: string
          problem_id: string | null
          solved: boolean | null
          time_spent_minutes: number | null
          user_id: string | null
        }
        Insert: {
          attempts?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          problem_id?: string | null
          solved?: boolean | null
          time_spent_minutes?: number | null
          user_id?: string | null
        }
        Update: {
          attempts?: number | null
          created_at?: string | null
          date?: string | null
          id?: string
          problem_id?: string | null
          solved?: boolean | null
          time_spent_minutes?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_analytics_problem_id_fkey"
            columns: ["problem_id"]
            isOneToOne: false
            referencedRelation: "problems"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_analytics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          bio: string | null
          contests_participated: number | null
          country: string | null
          created_at: string | null
          current_rank: number | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          last_active_at: string | null
          problems_solved: number | null
          profile_picture_url: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          total_xp: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          bio?: string | null
          contests_participated?: number | null
          country?: string | null
          created_at?: string | null
          current_rank?: number | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          last_active_at?: string | null
          problems_solved?: number | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          total_xp?: number | null
          updated_at?: string | null
          username: string
        }
        Update: {
          bio?: string | null
          contests_participated?: number | null
          country?: string | null
          created_at?: string | null
          current_rank?: number | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          last_active_at?: string | null
          problems_solved?: number | null
          profile_picture_url?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          total_xp?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      xp_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          reason: string
          reference_id: string | null
          reference_type: string | null
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          reason: string
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          reason?: string
          reference_id?: string | null
          reference_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "xp_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_user_xp: {
        Args: {
          user_uuid: string
          xp_amount: number
          reason: string
          ref_id?: string
          ref_type?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      assessment_status: "draft" | "active" | "completed" | "archived"
      contest_status: "upcoming" | "active" | "completed" | "cancelled"
      difficulty_level: "easy" | "medium" | "hard"
      programming_language:
        | "python"
        | "java"
        | "cpp"
        | "c"
        | "javascript"
        | "typescript"
        | "go"
        | "rust"
        | "swift"
        | "kotlin"
      submission_status:
        | "pending"
        | "running"
        | "accepted"
        | "wrong_answer"
        | "time_limit_exceeded"
        | "memory_limit_exceeded"
        | "runtime_error"
        | "compilation_error"
      user_role: "user" | "admin" | "company_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      assessment_status: ["draft", "active", "completed", "archived"],
      contest_status: ["upcoming", "active", "completed", "cancelled"],
      difficulty_level: ["easy", "medium", "hard"],
      programming_language: [
        "python",
        "java",
        "cpp",
        "c",
        "javascript",
        "typescript",
        "go",
        "rust",
        "swift",
        "kotlin",
      ],
      submission_status: [
        "pending",
        "running",
        "accepted",
        "wrong_answer",
        "time_limit_exceeded",
        "memory_limit_exceeded",
        "runtime_error",
        "compilation_error",
      ],
      user_role: ["user", "admin", "company_admin"],
    },
  },
} as const
