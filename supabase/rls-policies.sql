-- ========================================================
-- ACADEMIA BCA AI-DS — ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- 1. PROFILES POLICIES
-- --------------------------------------------------------
CREATE POLICY "Students can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Students can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Students can insert their own profile on signup"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- --------------------------------------------------------
-- 2. SUBJECTS POLICIES
-- --------------------------------------------------------
CREATE POLICY "Students can view their own subjects"
  ON public.subjects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert subjects for themselves"
  ON public.subjects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own subjects"
  ON public.subjects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can delete their own subjects"
  ON public.subjects FOR DELETE
  USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- 3. SCHEDULE (TIMETABLE) POLICIES
-- --------------------------------------------------------
CREATE POLICY "Students can view their own timetable"
  ON public.schedule FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert slots into their timetable"
  ON public.schedule FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can update their own timetable slots"
  ON public.schedule FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can delete slots from their timetable"
  ON public.schedule FOR DELETE
  USING (auth.uid() = user_id);

-- --------------------------------------------------------
-- 4. ATTENDANCE LOGS POLICIES
-- --------------------------------------------------------
CREATE POLICY "Students can view their own attendance activity logs"
  ON public.attendance_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Students can insert their own attendance activity logs"
  ON public.attendance_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Students can delete their own attendance activity logs"
  ON public.attendance_logs FOR DELETE
  USING (auth.uid() = user_id);
