-- Create prescriptions table
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  dentist_id UUID NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id),
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT,
  prescribed_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add cost estimate to treatments table
ALTER TABLE public.treatments 
ADD COLUMN IF NOT EXISTS estimated_cost NUMERIC,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

-- Create waitlist table
CREATE TABLE public.waitlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  preferred_date DATE,
  preferred_time TEXT,
  reason TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'contacted', 'scheduled', 'cancelled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics views table for caching dashboard data
CREATE TABLE public.analytics_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value JSONB NOT NULL,
  period TEXT NOT NULL,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(metric_name, period)
);

-- Enable RLS
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;

-- Prescriptions RLS Policies
CREATE POLICY "Dentists can create prescriptions"
ON public.prescriptions FOR INSERT
WITH CHECK (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Dentists can view all prescriptions"
ON public.prescriptions FOR SELECT
USING (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Patients can view their own prescriptions"
ON public.prescriptions FOR SELECT
USING (auth.uid() = patient_id);

CREATE POLICY "Dentists can update prescriptions"
ON public.prescriptions FOR UPDATE
USING (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Waitlist RLS Policies
CREATE POLICY "Patients can join waitlist"
ON public.waitlist FOR INSERT
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can view their own waitlist entries"
ON public.waitlist FOR SELECT
USING (auth.uid() = patient_id);

CREATE POLICY "Dentists can view all waitlist entries"
ON public.waitlist FOR SELECT
USING (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Dentists can update waitlist entries"
ON public.waitlist FOR UPDATE
USING (has_role(auth.uid(), 'dentist'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Patients can update their own waitlist entries"
ON public.waitlist FOR UPDATE
USING (auth.uid() = patient_id);

-- Analytics RLS Policies
CREATE POLICY "Admins and dentists can view analytics"
ON public.analytics_cache FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'dentist'::app_role));

CREATE POLICY "System can manage analytics cache"
ON public.analytics_cache FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add updated_at triggers
CREATE TRIGGER update_prescriptions_updated_at
BEFORE UPDATE ON public.prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_waitlist_updated_at
BEFORE UPDATE ON public.waitlist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();