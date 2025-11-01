-- Add new role types to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'receptionist';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'nurse';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'manager';

-- Create a function to assign multiple roles at once
CREATE OR REPLACE FUNCTION public.assign_user_role(
  _user_id uuid,
  _role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can assign roles
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can assign roles';
  END IF;

  -- Insert the role if it doesn't exist
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

-- Create a function to remove a role
CREATE OR REPLACE FUNCTION public.remove_user_role(
  _user_id uuid,
  _role app_role
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can remove roles
  IF NOT has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can remove roles';
  END IF;

  -- Don't allow removing the last role
  IF (SELECT COUNT(*) FROM public.user_roles WHERE user_id = _user_id) <= 1 THEN
    RAISE EXCEPTION 'Cannot remove the last role from a user';
  END IF;

  DELETE FROM public.user_roles
  WHERE user_id = _user_id AND role = _role;
END;
$$;