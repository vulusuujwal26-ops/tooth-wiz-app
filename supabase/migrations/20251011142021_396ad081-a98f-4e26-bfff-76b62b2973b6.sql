-- Make appointment_id nullable in treatments table
ALTER TABLE public.treatments ALTER COLUMN appointment_id DROP NOT NULL;