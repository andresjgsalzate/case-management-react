-- Migration 006: Fix user profiles and ensure admin has profile
-- This migration ensures all auth.users have corresponding user_profiles

-- First, let's create user_profiles for any auth.users that don't have them
INSERT INTO user_profiles (id, email, full_name, role_id, is_active)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email),
    r.id,
    true
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
CROSS JOIN roles r
WHERE up.id IS NULL AND r.name = 'user';

-- Ensure the admin user has admin role
UPDATE user_profiles 
SET role_id = r.id
FROM roles r
WHERE user_profiles.email = 'andresjgsalzate@gmail.com' 
AND r.name = 'admin';
