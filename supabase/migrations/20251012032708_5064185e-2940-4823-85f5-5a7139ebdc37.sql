-- Insert initial admin user role
-- First, you'll need to sign up a user through the auth page, then run this to make them admin
-- Replace 'YOUR_USER_EMAIL' with the actual email address of the user you want to make admin

-- Function to promote user to admin by email
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from profiles table
  SELECT id INTO target_user_id
  FROM public.profiles
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert admin role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'User % has been promoted to admin', user_email;
END;
$$;

-- Trigger to automatically create appointment reminders
CREATE OR REPLACE FUNCTION create_appointment_reminders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create reminder 24 hours before appointment
  INSERT INTO public.reminders (
    appointment_id,
    patient_id,
    reminder_type,
    scheduled_for,
    sent
  ) VALUES (
    NEW.id,
    NEW.patient_id,
    '24h_before',
    (NEW.appointment_date - INTERVAL '1 day'),
    false
  );
  
  -- Create reminder 1 hour before appointment
  INSERT INTO public.reminders (
    appointment_id,
    patient_id,
    reminder_type,
    scheduled_for,
    sent
  ) VALUES (
    NEW.id,
    NEW.patient_id,
    '1h_before',
    (NEW.appointment_date - INTERVAL '1 hour'),
    false
  );
  
  RETURN NEW;
END;
$$;

-- Attach trigger to appointments table
DROP TRIGGER IF EXISTS on_appointment_created ON public.appointments;
CREATE TRIGGER on_appointment_created
  AFTER INSERT ON public.appointments
  FOR EACH ROW
  EXECUTE FUNCTION create_appointment_reminders();