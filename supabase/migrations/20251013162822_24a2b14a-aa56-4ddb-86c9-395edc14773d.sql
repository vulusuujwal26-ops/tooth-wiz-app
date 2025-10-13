-- Fix RLS policies for better security and functionality

-- 1. Fix profiles table: Restrict dentists to only see profiles of their assigned patients
DROP POLICY IF EXISTS "Dentists and admins can view all profiles" ON public.profiles;

CREATE POLICY "Dentists can view their assigned patients' profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role) OR
  (has_role(auth.uid(), 'dentist'::app_role) AND EXISTS (
    SELECT 1 FROM public.appointments
    WHERE appointments.patient_id = profiles.id
    AND appointments.dentist_id = auth.uid()
  ))
);

-- 2. Add reminders policies for dentists and system
CREATE POLICY "Dentists can view reminders for their patients"
ON public.reminders
FOR SELECT
TO authenticated
USING (
  auth.uid() = patient_id OR
  has_role(auth.uid(), 'admin'::app_role) OR
  (has_role(auth.uid(), 'dentist'::app_role) AND EXISTS (
    SELECT 1 FROM public.appointments
    WHERE appointments.id = reminders.appointment_id
    AND appointments.dentist_id = auth.uid()
  ))
);

CREATE POLICY "System and dentists can create reminders"
ON public.reminders
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR
  (has_role(auth.uid(), 'dentist'::app_role) AND EXISTS (
    SELECT 1 FROM public.appointments
    WHERE appointments.id = appointment_id
    AND appointments.dentist_id = auth.uid()
  ))
);

-- 3. Add treatments INSERT policy for dentists
CREATE POLICY "Dentists can create treatments"
ON public.treatments
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = patient_id OR
  has_role(auth.uid(), 'admin'::app_role) OR
  has_role(auth.uid(), 'dentist'::app_role)
);

-- 4. Add DELETE policies for appointments
CREATE POLICY "Admins can delete appointments"
ON public.appointments
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Patients can delete their own pending appointments"
ON public.appointments
FOR DELETE
TO authenticated
USING (
  auth.uid() = patient_id AND
  status = 'pending'::appointment_status
);

-- 5. Add DELETE policies for notifications
CREATE POLICY "Users can delete their own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can delete any notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));