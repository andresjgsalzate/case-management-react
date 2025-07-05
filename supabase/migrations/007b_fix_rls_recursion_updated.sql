-- Migration 007B: Fix RLS Infinite Recursion (Updated)
-- This migration fixes the infinite recursion in user_profiles policies

-- First, let's clean up any existing functions that might conflict
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_admin(UUID);

-- Disable RLS temporarily on user_profiles to fix the recursion
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies for user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- Re-enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create a simple function to check if user is admin without causing recursion
CREATE FUNCTION is_admin_simple(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.id = check_user_id AND r.name = 'admin'
    );
$$;

-- Create new simplified policies that don't cause recursion
-- Users can view their own profile (simple check without joins)
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid());

-- Users can update their own profile (simple check without joins)  
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- Admins can manage all profiles using the new function
CREATE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL USING (is_admin_simple());

-- Also fix the cases policies to avoid similar issues
-- Drop existing cases policies
DROP POLICY IF EXISTS "Users can view own cases or admins can view all" ON cases;
DROP POLICY IF EXISTS "Users can insert own cases" ON cases;
DROP POLICY IF EXISTS "Users can update own cases or admins can update all" ON cases;
DROP POLICY IF EXISTS "Users can delete own cases or admins can delete all" ON cases;
DROP POLICY IF EXISTS "Users can view all cases" ON cases;
DROP POLICY IF EXISTS "Users can update cases" ON cases;
DROP POLICY IF EXISTS "Users can delete cases" ON cases;

-- Create new simplified cases policies
CREATE POLICY "Users can view own cases or admins can view all" ON cases
    FOR SELECT USING (
        user_id = auth.uid() OR is_admin_simple()
    );

CREATE POLICY "Users can insert own cases" ON cases
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cases or admins can update all" ON cases
    FOR UPDATE USING (
        user_id = auth.uid() OR is_admin_simple()
    )
    WITH CHECK (
        user_id = auth.uid() OR is_admin_simple()
    );

CREATE POLICY "Users can delete own cases or admins can delete all" ON cases
    FOR DELETE USING (
        user_id = auth.uid() OR is_admin_simple()
    );
