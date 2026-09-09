-- ============================================================================
-- i-Lab Solutions — Supabase Database Migration & Updates
-- Run this SQL script in your Supabase SQL Editor:
-- (Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run)
-- ============================================================================

-- 1. EXTEND PROFILES TABLE WITH CATEGORY AND LAST WORK TIMESTAMPS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS assigned_category TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_work_at TIMESTAMPTZ DEFAULT NOW();

-- 2. CREATE TASKS TABLE FOR WORKER TASKS
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  admin_file_url TEXT DEFAULT '',
  status TEXT DEFAULT 'pending', -- 'pending', 'submitted', 'completed', 'rejected'
  user_text_submission TEXT DEFAULT '',
  user_file_url TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS) FOR TASKS TABLE
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES FOR TASKS TABLE
DO $$ BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Admin full access to tasks" ON public.tasks';
  EXECUTE 'DROP POLICY IF EXISTS "Workers view own tasks" ON public.tasks';
  EXECUTE 'DROP POLICY IF EXISTS "Workers update own tasks" ON public.tasks';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Admin full access to tasks" ON public.tasks
  FOR ALL USING (public.is_admin());

CREATE POLICY "Workers view own tasks" ON public.tasks
  FOR SELECT USING (auth.uid() = worker_id);

CREATE POLICY "Workers update own tasks" ON public.tasks
  FOR UPDATE USING (auth.uid() = worker_id);

-- 5. SETUP STORAGE BUCKETS FOR TASK FILES
INSERT INTO storage.buckets (id, name, public) VALUES ('admin-tasks', 'admin-tasks', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('task-submissions', 'task-submissions', true) ON CONFLICT (id) DO NOTHING;

-- 6. SETUP STORAGE POLICIES FOR BUCKETS
DO $$ BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Public bucket access for admin-tasks" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated bucket upload for admin-tasks" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Public bucket access for task-submissions" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated bucket upload for task-submissions" ON storage.objects';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Public bucket access for admin-tasks" ON storage.objects 
  FOR SELECT USING (bucket_id = 'admin-tasks');

CREATE POLICY "Authenticated bucket upload for admin-tasks" ON storage.objects 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'admin-tasks');

CREATE POLICY "Public bucket access for task-submissions" ON storage.objects 
  FOR SELECT USING (bucket_id = 'task-submissions');

CREATE POLICY "Authenticated bucket upload for task-submissions" ON storage.objects 
  FOR INSERT WITH CHECK (auth.role() = 'authenticated' AND bucket_id = 'task-submissions');

-- 8. ADD GOOGLE SHEET LINK COLUMN FOR TASK SUBMISSIONS (Profile "Submit Your Work")
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS google_sheet_url TEXT DEFAULT '';

-- 7. FUNCTION FOR AUTOMATIC 3-DAY INACTIVITY BLOCKING
CREATE OR REPLACE FUNCTION public.check_and_block_inactive_workers()
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET account_status = 'blocked'
  WHERE role = 'worker'
    AND account_status = 'active'
    AND last_work_at < (NOW() - INTERVAL '3 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
