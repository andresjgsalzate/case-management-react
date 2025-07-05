-- Migration 007: Fix RLS Infinite Recursion
-- This migration fixes the infinite recursion in user_profiles policies

-- Disable RLS temporarily on user_profiles to fix the recursion
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all user_profiles" ON user_profiles;

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies that don't cause recursion
-- Users can view their own profile (simple check without joins)
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid());

-- Users can update their own profile (simple check without joins)  
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Admins can manage all profiles (using a simpler approach)
-- First drop any existing is_admin functions to avoid conflicts
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_admin(UUID);

-- Create a new function to check if user is admin without recursion
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.id = user_id AND r.name = 'admin'
    );
$$;

-- Create admin policy using the function
CREATE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL USING (is_admin());

-- Also fix the cases policies to avoid similar issues
-- Drop existing cases policies
DROP POLICY IF EXISTS "Users can view own cases or admins can view all" ON cases;
DROP POLICY IF EXISTS "Users can insert own cases" ON cases;
DROP POLICY IF EXISTS "Users can update own cases or admins can update all" ON cases;
DROP POLICY IF EXISTS "Users can delete own cases or admins can delete all" ON cases;

-- Create new simplified cases policies
CREATE POLICY "Users can view own cases or admins can view all" ON cases
    FOR SELECT USING (
        user_id = auth.uid() OR is_admin()
    );

CREATE POLICY "Users can insert own cases" ON cases
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cases or admins can update all" ON cases
    FOR UPDATE USING (
        user_id = auth.uid() OR is_admin()
    )
    WITH CHECK (
        user_id = auth.uid() OR is_admin()
    );

CREATE POLICY "Users can delete own cases or admins can delete all" ON cases
    FOR DELETE USING (
        user_id = auth.uid() OR is_admin()
    );
