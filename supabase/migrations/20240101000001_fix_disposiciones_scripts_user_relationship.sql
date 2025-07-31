-- Fix foreign key relationship for disposiciones_scripts to user_profiles
-- This allows us to properly join with user_profiles table

-- Drop the existing user_id column that references auth.users
ALTER TABLE public.disposiciones_scripts DROP COLUMN IF EXISTS user_id;

-- Add a new user_profile_id column that references user_profiles directly
ALTER TABLE public.disposiciones_scripts 
ADD COLUMN user_profile_id UUID REFERENCES public.user_profiles(id);

-- Create index for the new foreign key
CREATE INDEX idx_disposiciones_scripts_user_profile_id 
ON public.disposiciones_scripts(user_profile_id);

-- Update the RLS policies to use the new field if needed
-- (The existing policies using created_by are still valid)

-- Add comment for the new column
COMMENT ON COLUMN public.disposiciones_scripts.user_profile_id IS 'Referencia al perfil de usuario que creó la disposición';
