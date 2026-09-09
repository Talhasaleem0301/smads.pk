-- ============================================================================
-- i-Lab Solutions — Comprehensive Supabase Database Schema
-- Run this complete SQL script in your Supabase SQL Editor:
-- (Supabase Dashboard -> SQL Editor -> New Query -> Paste & Run)
-- ============================================================================

-- 1. GRANT PERMISSIONS ON PUBLIC SCHEMA
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;

-- 2. ENUM TYPES
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('worker', 'employer', 'admin');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
    CREATE TYPE account_status AS ENUM ('pending_payment', 'active', 'expired', 'inactive', 'blocked');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'test_status') THEN
    CREATE TYPE test_status AS ENUM ('not_scheduled', 'scheduled', 'pending_verification', 'passed', 'failed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'PAID', 'FAILED');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'proof_status') THEN
    CREATE TYPE proof_status AS ENUM ('Pending Review', 'Approved', 'Rejected', 'Paid');
  END IF;
END $$;

-- If the enum already exists but is missing 'blocked', add it
DO $$ BEGIN
  ALTER TYPE account_status ADD VALUE IF NOT EXISTS 'blocked';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- 2b. RPC FUNCTIONS (used by post likes)
CREATE OR REPLACE FUNCTION public.increment_likes(post_id_input UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = post_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_likes(post_id_input UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = post_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. PROFILES TABLE (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role DEFAULT 'worker',
  registration_fee_paid BOOLEAN DEFAULT FALSE,
  account_status account_status DEFAULT 'pending_payment',
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  expired_at TIMESTAMPTZ DEFAULT NULL,
  bio TEXT DEFAULT '',
  connections INTEGER DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT NULL,
  review_count INTEGER DEFAULT 0,
  work_history JSONB DEFAULT '[]'::jsonb,
  test_status test_status DEFAULT 'not_scheduled',
  test_available_at TIMESTAMPTZ DEFAULT NULL,
  test_score INTEGER DEFAULT NULL,
  test_verification_code TEXT DEFAULT NULL,
  test_verification_expires TIMESTAMPTZ DEFAULT NULL,
  avatar_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invoice_no TEXT UNIQUE NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 500.00,
  currency TEXT DEFAULT 'PKR',
  gateway TEXT NOT NULL,
  account_number TEXT NOT NULL,
  transaction_ref TEXT DEFAULT '',
  status payment_status DEFAULT 'PENDING',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PAYMENT PROOFS TABLE (Screenshot verification)
CREATE TABLE IF NOT EXISTS public.payment_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  txn_id TEXT UNIQUE NOT NULL,
  worker TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Registration Fee',
  method TEXT NOT NULL,
  amount TEXT NOT NULL,
  date TEXT NOT NULL,
  status proof_status DEFAULT 'Pending Review',
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  screenshot_url TEXT DEFAULT '',
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ DEFAULT NULL,
  rejection_reason TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WALLETS TABLE
CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance NUMERIC(10,2) DEFAULT 0.00,
  total_earned NUMERIC(10,2) DEFAULT 0.00,
  total_withdrawn NUMERIC(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. JOBS TABLE (Employers job postings & categories)
CREATE TABLE IF NOT EXISTS public.jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT DEFAULT '',
  budget NUMERIC(10,2) DEFAULT 0.00,
  duration TEXT DEFAULT '',
  status TEXT DEFAULT 'open',
  employer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. JOB APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
  job_slug TEXT NOT NULL,
  applicant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  category_name TEXT NOT NULL,
  cover_letter TEXT DEFAULT '',
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. POSTS TABLE (Social Feed)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_role TEXT DEFAULT 'worker',
  content TEXT NOT NULL,
  media_url TEXT DEFAULT '',
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. POST LIKES TABLE
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (post_id, user_id)
);

-- 11. CONVERSATIONS TABLE (1:1 Chat)
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  last_message TEXT DEFAULT '',
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- AUTOMATIC TRIGGER FOR PROFILE & WALLET CREATION ON SIGNUP
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, account_status)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'::user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'employer' THEN 'employer'::user_role
      ELSE 'worker'::user_role
    END,
    'pending_payment'
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.wallets (user_id, balance, total_earned, total_withdrawn)
  VALUES (NEW.id, 0.00, 0.00, 0.00)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies before re-creating to avoid duplicates
DO $$ BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS "Users can view own payments" ON public.payments';
  EXECUTE 'DROP POLICY IF EXISTS "Users can create payments" ON public.payments';
  EXECUTE 'DROP POLICY IF EXISTS "Admin can update payments" ON public.payments';
  EXECUTE 'DROP POLICY IF EXISTS "Public can view payment proofs" ON public.payment_proofs';
  EXECUTE 'DROP POLICY IF EXISTS "Users can submit payment proof" ON public.payment_proofs';
  EXECUTE 'DROP POLICY IF EXISTS "Admin or owner can update proof" ON public.payment_proofs';
  EXECUTE 'DROP POLICY IF EXISTS "Users can view own wallet" ON public.wallets';
  EXECUTE 'DROP POLICY IF EXISTS "Users can insert own wallet" ON public.wallets';
  EXECUTE 'DROP POLICY IF EXISTS "Public can view jobs" ON public.jobs';
  EXECUTE 'DROP POLICY IF EXISTS "Employers can insert jobs" ON public.jobs';
  EXECUTE 'DROP POLICY IF EXISTS "Admin can delete jobs" ON public.jobs';
  EXECUTE 'DROP POLICY IF EXISTS "Applicants & employers view applications" ON public.job_applications';
  EXECUTE 'DROP POLICY IF EXISTS "Workers can apply for jobs" ON public.job_applications';
  EXECUTE 'DROP POLICY IF EXISTS "Public can view posts" ON public.posts';
  EXECUTE 'DROP POLICY IF EXISTS "Users can create posts" ON public.posts';
  EXECUTE 'DROP POLICY IF EXISTS "Public can view post likes" ON public.post_likes';
  EXECUTE 'DROP POLICY IF EXISTS "Users can like posts" ON public.post_likes';
  EXECUTE 'DROP POLICY IF EXISTS "Users can unlike posts" ON public.post_likes';
  EXECUTE 'DROP POLICY IF EXISTS "Participants view conversations" ON public.conversations';
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated users start conversations" ON public.conversations';
  EXECUTE 'DROP POLICY IF EXISTS "Participants view messages" ON public.messages';
  EXECUTE 'DROP POLICY IF EXISTS "Participants send messages" ON public.messages';
  EXECUTE 'DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications';
  EXECUTE 'DROP POLICY IF EXISTS "Users update own notifications" ON public.notifications';
  EXECUTE 'DROP POLICY IF EXISTS "Public view reviews" ON public.reviews';
  EXECUTE 'DROP POLICY IF EXISTS "Users create reviews" ON public.reviews';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- Profiles: Public select, owner/admin insert/update
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Payments: Owner or admin select/insert/update
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can create payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admin can update payments" ON public.payments FOR UPDATE USING (public.is_admin());

-- Payment Proofs: Public select, owner/admin insert/update
CREATE POLICY "Public can view payment proofs" ON public.payment_proofs FOR SELECT USING (true);
CREATE POLICY "Users can submit payment proof" ON public.payment_proofs FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Admin or owner can update proof" ON public.payment_proofs FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- Wallets: Owner or admin select/insert
CREATE POLICY "Users can view own wallet" ON public.wallets FOR SELECT USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can insert own wallet" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id OR public.is_admin());

-- Jobs: Everyone select, employers/admin insert, admin delete
CREATE POLICY "Public can view jobs" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "Employers can insert jobs" ON public.jobs FOR INSERT WITH CHECK (auth.uid() = employer_id OR public.is_admin());
CREATE POLICY "Admin can delete jobs" ON public.jobs FOR DELETE USING (public.is_admin());

-- Job Applications: Applicants or job employers select/insert
CREATE POLICY "Applicants & employers view applications" ON public.job_applications FOR SELECT
  USING (auth.uid() = applicant_id OR public.is_admin());
CREATE POLICY "Workers can apply for jobs" ON public.job_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);

-- Posts & Likes: Public view, authenticated create/like
CREATE POLICY "Public can view posts" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public can view post likes" ON public.post_likes FOR SELECT USING (true);
CREATE POLICY "Users can like posts" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike posts" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Conversations & Messages: Participants view/insert
CREATE POLICY "Participants view conversations" ON public.conversations FOR SELECT
  USING (auth.uid() = participant_1 OR auth.uid() = participant_2 OR public.is_admin());
CREATE POLICY "Authenticated users start conversations" ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_1 OR auth.uid() = participant_2);
CREATE POLICY "Participants view messages" ON public.messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = conversation_id AND (participant_1 = auth.uid() OR participant_2 = auth.uid())
  ) OR public.is_admin());
CREATE POLICY "Participants send messages" ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Notifications: Owner view/update
CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Reviews: Public view, authenticated insert
CREATE POLICY "Public view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Users create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- ============================================================================
-- STORAGE BUCKETS SETUP
-- ============================================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('post-media', 'post-media', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('admin-tasks', 'admin-tasks', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('task-submissions', 'task-submissions', true) ON CONFLICT (id) DO NOTHING;

DO $$ BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Public bucket access" ON storage.objects';
  EXECUTE 'DROP POLICY IF EXISTS "Authenticated bucket upload" ON storage.objects';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Public bucket access" ON storage.objects FOR SELECT USING (bucket_id IN ('avatars', 'payment-proofs', 'post-media', 'admin-tasks', 'task-submissions'));
CREATE POLICY "Authenticated bucket upload" ON storage.objects FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- TASK & CATEGORY EXTENSIONS
-- ============================================================================

-- Extend profiles for assigned category and last work completion timestamp
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS assigned_category TEXT DEFAULT NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_work_at TIMESTAMPTZ DEFAULT NOW();

-- Tasks table for assigned assignments/work
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
  google_sheet_url TEXT DEFAULT '',
  submitted_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies for tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Admin full access to tasks" ON public.tasks';
  EXECUTE 'DROP POLICY IF EXISTS "Workers view own tasks" ON public.tasks';
  EXECUTE 'DROP POLICY IF EXISTS "Workers update own tasks" ON public.tasks';
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Admin full access to tasks" ON public.tasks FOR ALL USING (public.is_admin());
CREATE POLICY "Workers view own tasks" ON public.tasks FOR SELECT USING (auth.uid() = worker_id);
CREATE POLICY "Workers update own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = worker_id);

-- Function for automatic 3-day inactivity blocking
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
