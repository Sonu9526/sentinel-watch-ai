-- Create enums for the system
CREATE TYPE public.app_role AS ENUM ('admin', 'viewer');
CREATE TYPE public.alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.detection_status AS ENUM ('normal', 'suspicious', 'ransomware');

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create user_roles table for role-based access
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create file_events table for simulated file behavior
CREATE TABLE public.file_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  modification_rate NUMERIC NOT NULL DEFAULT 0,
  entropy_change NUMERIC NOT NULL DEFAULT 0,
  rename_count INTEGER NOT NULL DEFAULT 0,
  process_id INTEGER,
  process_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create detection_results table for ML model predictions
CREATE TABLE public.detection_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_event_id UUID REFERENCES public.file_events(id) ON DELETE CASCADE,
  status detection_status NOT NULL DEFAULT 'normal',
  risk_score NUMERIC NOT NULL DEFAULT 0,
  confidence NUMERIC NOT NULL DEFAULT 0,
  model_version TEXT DEFAULT 'v1.0.0',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create alerts table for security alerts
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  detection_result_id UUID REFERENCES public.detection_results(id) ON DELETE CASCADE,
  severity alert_severity NOT NULL DEFAULT 'low',
  title TEXT NOT NULL,
  description TEXT,
  acknowledged BOOLEAN DEFAULT false,
  acknowledged_by UUID REFERENCES auth.users(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Create system_config table for configuration
CREATE TABLE public.system_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key TEXT UNIQUE NOT NULL,
  config_value JSONB NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.file_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detection_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'admin')
$$;

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can manage roles"
  ON public.user_roles FOR ALL
  USING (public.is_admin(auth.uid()));

-- File events policies (authenticated users can view)
CREATE POLICY "Authenticated users can view file events"
  ON public.file_events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert file events"
  ON public.file_events FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Detection results policies
CREATE POLICY "Authenticated users can view detection results"
  ON public.detection_results FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert detection results"
  ON public.detection_results FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin(auth.uid()));

-- Alerts policies
CREATE POLICY "Authenticated users can view alerts"
  ON public.alerts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage alerts"
  ON public.alerts FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Authenticated users can acknowledge alerts"
  ON public.alerts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- System config policies
CREATE POLICY "Authenticated users can view config"
  ON public.system_config FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage config"
  ON public.system_config FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- First user becomes admin, others are viewers
  IF (SELECT COUNT(*) FROM public.user_roles) = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'viewer');
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert default system config
INSERT INTO public.system_config (config_key, config_value) VALUES
  ('monitoring', '{"enabled": true, "folder": "/home/user/documents", "scan_interval": 5000}'),
  ('thresholds', '{"modification_rate": 10, "entropy_change": 0.5, "rename_count": 5}'),
  ('ml_model', '{"version": "v1.0.0", "type": "random_forest", "accuracy": 0.94}');

-- Enable realtime for alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.file_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.detection_results;