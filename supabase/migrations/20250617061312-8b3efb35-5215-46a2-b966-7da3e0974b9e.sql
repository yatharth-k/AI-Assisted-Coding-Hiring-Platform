-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums for better type safety
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE submission_status AS ENUM ('pending', 'running', 'accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error');
CREATE TYPE programming_language AS ENUM ('python', 'java', 'cpp', 'c', 'javascript', 'typescript', 'go', 'rust', 'swift', 'kotlin');
CREATE TYPE contest_status AS ENUM ('upcoming', 'active', 'completed', 'cancelled');
CREATE TYPE assessment_status AS ENUM ('draft', 'active', 'completed', 'archived');
CREATE TYPE user_role AS ENUM ('user', 'admin', 'company_admin');

-- Users table with XP and ranking system
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    bio TEXT,
    profile_picture_url TEXT,
    country TEXT,
    role user_role DEFAULT 'user',
    total_xp INTEGER DEFAULT 0,
    current_rank INTEGER DEFAULT 0,
    problems_solved INTEGER DEFAULT 0,
    contests_participated INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    xp INTEGER DEFAULT 0,
    rank TEXT DEFAULT 'Novice'
);

-- Problem categories for organization
CREATE TABLE public.problem_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problems table
CREATE TABLE public.problems (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    difficulty difficulty_level NOT NULL,
    category_id UUID REFERENCES public.problem_categories(id),
    max_score INTEGER DEFAULT 100,
    time_limit INTEGER DEFAULT 5000, -- milliseconds
    memory_limit INTEGER DEFAULT 256, -- MB
    xp_reward INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0.00,
    total_submissions INTEGER DEFAULT 0,
    successful_submissions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Problem tags for flexible categorization
CREATE TABLE public.problem_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    color TEXT DEFAULT '#gray',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Many-to-many relationship between problems and tags
CREATE TABLE public.problem_tag_assignments (
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES public.problem_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (problem_id, tag_id)
);

-- Test cases for problems
CREATE TABLE public.test_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    is_sample BOOLEAN DEFAULT false,
    is_hidden BOOLEAN DEFAULT false,
    weight INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User submissions
CREATE TABLE public.submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
    language programming_language NOT NULL,
    code TEXT NOT NULL,
    status submission_status DEFAULT 'pending',
    score INTEGER DEFAULT 0,
    execution_time INTEGER, -- milliseconds
    memory_used INTEGER, -- KB
    test_cases_passed INTEGER DEFAULT 0,
    total_test_cases INTEGER DEFAULT 0,
    error_message TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    judged_at TIMESTAMP WITH TIME ZONE,
    assessment_id UUID REFERENCES public.assessments(id)
);

-- Companies for hiring portal
CREATE TABLE public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    website TEXT,
    logo_url TEXT,
    industry TEXT,
    size_range TEXT,
    headquarters TEXT,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Company admins
CREATE TABLE public.company_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, company_id)
);

-- Contests
CREATE TABLE public.contests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status contest_status DEFAULT 'upcoming',
    max_participants INTEGER,
    is_public BOOLEAN DEFAULT true,
    prize_pool TEXT,
    rules TEXT,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Contest problems (many-to-many) - Fixed: Removed duplicate PRIMARY KEY
CREATE TABLE public.contest_problems (
    contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 100,
    order_index INTEGER DEFAULT 0,
    PRIMARY KEY (contest_id, problem_id)
);

-- Contest participants
CREATE TABLE public.contest_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    total_score INTEGER DEFAULT 0,
    rank INTEGER,
    problems_solved INTEGER DEFAULT 0,
    last_submission_time TIMESTAMP WITH TIME ZONE,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(contest_id, user_id)
);

-- Assessments created by companies
CREATE TABLE public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER DEFAULT 90,
    status assessment_status DEFAULT 'draft',
    instructions TEXT,
    passing_score INTEGER DEFAULT 70,
    max_attempts INTEGER DEFAULT 1,
    is_proctored BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment problems (many-to-many)
CREATE TABLE public.assessment_problems (
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
    points INTEGER DEFAULT 100,
    order_index INTEGER DEFAULT 0,
    PRIMARY KEY (assessment_id, problem_id)
);

-- Assessment invitations
CREATE TABLE public.assessment_invitations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    candidate_email TEXT NOT NULL,
    candidate_name TEXT,
    invitation_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_used BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used_at TIMESTAMP WITH TIME ZONE
);

-- Assessment attempts by candidates
CREATE TABLE public.assessment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id UUID REFERENCES public.assessments(id) ON DELETE CASCADE,
    invitation_id UUID REFERENCES public.assessment_invitations(id),
    candidate_email TEXT NOT NULL,
    candidate_name TEXT,
    total_score INTEGER DEFAULT 0,
    percentage_score DECIMAL(5,2) DEFAULT 0.00,
    problems_solved INTEGER DEFAULT 0,
    time_taken_minutes INTEGER,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT false
);

-- Leaderboards (global and contest-specific)
CREATE TABLE public.leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    contest_id UUID REFERENCES public.contests(id) ON DELETE CASCADE, -- NULL for global leaderboard
    rank INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    problems_solved INTEGER DEFAULT 0,
    total_time_minutes INTEGER DEFAULT 0,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, contest_id)
);

-- User activity analytics
CREATE TABLE public.user_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    problem_id UUID REFERENCES public.problems(id) ON DELETE CASCADE,
    time_spent_minutes INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 1,
    solved BOOLEAN DEFAULT false,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, problem_id, date)
);

-- XP transactions for tracking XP changes
CREATE TABLE public.xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    reference_id UUID, -- Could reference submission_id, contest_id, etc.
    reference_type TEXT, -- 'submission', 'contest', 'achievement', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TABLE contests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  contest_id INT REFERENCES contests(id),
  problem_id INT REFERENCES problems(id),
  code TEXT,
  language TEXT,
  result JSONB, -- {score, passed, time, details...}
  created_at TIMESTAMP DEFAULT NOW()
);
CREATE TABLE contest_problems (
  id SERIAL PRIMARY KEY,
  contest_id INT REFERENCES contests(id) ON DELETE CASCADE,
  problem_id INT REFERENCES problems(id) ON DELETE CASCADE
);
CREATE TABLE problems (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  input_format TEXT,
  output_format TEXT,
  sample_cases JSONB,
  tags TEXT[],
  difficulty TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User achievements/badges
CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    icon TEXT,
    badge_color TEXT DEFAULT '#gold',
    xp_reward INTEGER DEFAULT 0,
    criteria JSONB, -- Flexible criteria storage
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
create table companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  created_at timestamp with time zone default now()
);
create table assessments (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  title text not null,
  description text,
  created_at timestamp with time zone default now()
);
create table assessment_problems (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid references assessments(id) on delete cascade,
  problem_id uuid references problems(id) on delete cascade
);
create table assessment_candidates (
  id uuid primary key default uuid_generate_v4(),
  assessment_id uuid references assessments(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  invited_at timestamp with time zone default now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone
);

-- User achievement unlocks
CREATE TABLE public.user_achievements (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, achievement_id)
);

-- User badges
CREATE TABLE public.user_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_username ON public.users(username);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_total_xp ON public.users(total_xp DESC);
CREATE INDEX idx_users_current_rank ON public.users(current_rank);

CREATE INDEX idx_problems_difficulty ON public.problems(difficulty);
CREATE INDEX idx_problems_category ON public.problems(category_id);
CREATE INDEX idx_problems_is_active ON public.problems(is_active);
CREATE INDEX idx_problems_success_rate ON public.problems(success_rate DESC);

CREATE INDEX idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX idx_submissions_problem_id ON public.submissions(problem_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_submissions_submitted_at ON public.submissions(submitted_at DESC);
CREATE INDEX idx_submissions_user_problem ON public.submissions(user_id, problem_id);

CREATE INDEX idx_contests_status ON public.contests(status);
CREATE INDEX idx_contests_start_time ON public.contests(start_time);
CREATE INDEX idx_contests_end_time ON public.contests(end_time);

CREATE INDEX idx_contest_participants_contest_id ON public.contest_participants(contest_id);
CREATE INDEX idx_contest_participants_user_id ON public.contest_participants(user_id);
CREATE INDEX idx_contest_participants_rank ON public.contest_participants(contest_id, rank);

CREATE INDEX idx_leaderboards_contest_id ON public.leaderboards(contest_id);
CREATE INDEX idx_leaderboards_rank ON public.leaderboards(contest_id, rank);
CREATE INDEX idx_leaderboards_global_rank ON public.leaderboards(rank) WHERE contest_id IS NULL;

CREATE INDEX idx_assessments_company_id ON public.assessments(company_id);
CREATE INDEX idx_assessments_status ON public.assessments(status);

CREATE INDEX idx_user_analytics_user_id ON public.user_analytics(user_id);
CREATE INDEX idx_user_analytics_date ON public.user_analytics(date DESC);
CREATE INDEX idx_user_analytics_user_date ON public.user_analytics(user_id, date);

CREATE INDEX idx_xp_transactions_user_id ON public.xp_transactions(user_id);
CREATE INDEX idx_xp_transactions_created_at ON public.xp_transactions(created_at DESC);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_problems_updated_at BEFORE UPDATE ON public.problems FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contests_updated_at BEFORE UPDATE ON public.contests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_problem_categories_updated_at BEFORE UPDATE ON public.problem_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user XP and rank
CREATE OR REPLACE FUNCTION update_user_xp(user_uuid UUID, xp_amount INTEGER, reason TEXT, ref_id UUID DEFAULT NULL, ref_type TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    -- Insert XP transaction
    INSERT INTO public.xp_transactions (user_id, amount, reason, reference_id, reference_type)
    VALUES (user_uuid, xp_amount, reason, ref_id, ref_type);
    
    -- Update user's total XP
    UPDATE public.users 
    SET total_xp = total_xp + xp_amount,
        updated_at = NOW()
    WHERE id = user_uuid;
    
    -- Recalculate rank (simple ranking based on XP)
    WITH ranked_users AS (
        SELECT id, ROW_NUMBER() OVER (ORDER BY total_xp DESC, created_at ASC) as new_rank
        FROM public.users 
        WHERE is_active = true
    )
    UPDATE public.users 
    SET current_rank = ranked_users.new_rank
    FROM ranked_users 
    WHERE public.users.id = ranked_users.id;
END;
$$ LANGUAGE plpgsql;

-- Enable Row Level Security on tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (you'll need to implement authentication first)
-- Users can view all public user data but only edit their own
CREATE POLICY "Users can view public user data" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Users can view all submissions but only create their own
CREATE POLICY "Anyone can view submissions" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Users can create own submissions" ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only view their own analytics
CREATE POLICY "Users can view own analytics" ON public.user_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON public.user_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only view their own XP transactions
CREATE POLICY "Users can view own XP transactions" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);

-- Enable realtime for key tables
ALTER TABLE public.submissions REPLICA IDENTITY FULL;
ALTER TABLE public.leaderboards REPLICA IDENTITY FULL;
ALTER TABLE public.contest_participants REPLICA IDENTITY FULL;
ALTER TABLE public.contests REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER publication supabase_realtime ADD TABLE public.submissions;
ALTER publication supabase_realtime ADD TABLE public.leaderboards;
ALTER publication supabase_realtime ADD TABLE public.contest_participants;
ALTER publication supabase_realtime ADD TABLE public.contests;

CREATE TABLE public.badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon_url TEXT
);
