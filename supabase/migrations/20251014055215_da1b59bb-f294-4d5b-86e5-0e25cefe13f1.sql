-- Create storage bucket for medical images (x-rays, photos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'medical-images',
  'medical-images',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Storage policies for medical images
CREATE POLICY "Users can upload their own medical images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'medical-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own medical images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Dentists and admins can view all medical images"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-images' AND
  (has_role(auth.uid(), 'dentist') OR has_role(auth.uid(), 'admin'))
);

CREATE POLICY "Users can delete their own medical images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'medical-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Medical images table to track uploads
CREATE TABLE public.medical_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.medical_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own medical images"
ON public.medical_images FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Patients can upload medical images"
ON public.medical_images FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can delete their own medical images"
ON public.medical_images FOR DELETE
TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Dentists can view all medical images"
ON public.medical_images FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'dentist') OR has_role(auth.uid(), 'admin'));

-- Reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dentist_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(appointment_id, patient_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can create reviews for their appointments"
ON public.reviews FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = patient_id AND
  EXISTS (
    SELECT 1 FROM public.appointments
    WHERE id = appointment_id AND patient_id = auth.uid()
  )
);

CREATE POLICY "Patients can view their own reviews"
ON public.reviews FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Patients can update their own reviews"
ON public.reviews FOR UPDATE
TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Dentists can view reviews"
ON public.reviews FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'dentist') OR 
  has_role(auth.uid(), 'admin')
);

-- Medical history table
CREATE TABLE public.medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  allergies TEXT,
  current_medications TEXT,
  past_dental_procedures TEXT,
  medical_conditions TEXT,
  blood_type TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  has_heart_disease BOOLEAN DEFAULT false,
  has_diabetes BOOLEAN DEFAULT false,
  has_high_blood_pressure BOOLEAN DEFAULT false,
  is_pregnant BOOLEAN DEFAULT false,
  is_smoker BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.medical_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view their own medical history"
ON public.medical_history FOR SELECT
TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Patients can insert their medical history"
ON public.medical_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Patients can update their medical history"
ON public.medical_history FOR UPDATE
TO authenticated
USING (auth.uid() = patient_id);

CREATE POLICY "Dentists can view medical history"
ON public.medical_history FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'dentist') OR 
  has_role(auth.uid(), 'admin')
);

-- Trigger for updated_at on reviews
CREATE TRIGGER update_reviews_updated_at
BEFORE UPDATE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger for updated_at on medical_history
CREATE TRIGGER update_medical_history_updated_at
BEFORE UPDATE ON public.medical_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();