-- Create messages table for real-time chat
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies for messages
CREATE POLICY "Users can view their own messages"
  ON public.messages
  FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages"
  ON public.messages
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their received messages"
  ON public.messages
  FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payments
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Policies for payments
CREATE POLICY "Patients can view their own payments"
  ON public.payments
  FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Admins and dentists can view all payments"
  ON public.payments
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'dentist'::app_role));

CREATE POLICY "System can create payments"
  ON public.payments
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update payments"
  ON public.payments
  FOR UPDATE
  USING (true);

-- Create consultations table for video calls
CREATE TABLE public.consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  dentist_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  room_url TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on consultations
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Policies for consultations
CREATE POLICY "Participants can view their consultations"
  ON public.consultations
  FOR SELECT
  USING (auth.uid() = patient_id OR auth.uid() = dentist_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Dentists can create consultations"
  ON public.consultations
  FOR INSERT
  WITH CHECK (auth.uid() = dentist_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Participants can update consultations"
  ON public.consultations
  FOR UPDATE
  USING (auth.uid() = patient_id OR auth.uid() = dentist_id OR has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for payments updated_at
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();