-- Migration 007C: Fix RLS Infinite Recursion (Final Version)
-- This migration fixes the infinite recursion in user_profiles policies
-- by properly handling dependencies

-- STEP 1: First, drop all policies that depend on is_admin function
-- This prevents the dependency error when dropping the function

-- Drop user_profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;

-- Drop cases policies 
DROP POLICY IF EXISTS "Users can view own cases or admins can view all" ON cases;
DROP POLICY IF EXISTS "Users can insert own cases" ON cases;
DROP POLICY IF EXISTS "Users can update own cases or admins can update all" ON cases;
DROP POLICY IF EXISTS "Users can delete own cases or admins can delete all" ON cases;
DROP POLICY IF EXISTS "Users can view all cases" ON cases;
DROP POLICY IF EXISTS "Users can update cases" ON cases;
DROP POLICY IF EXISTS "Users can delete cases" ON cases;
DROP POLICY IF EXISTS "Users can view own cases" ON cases;
DROP POLICY IF EXISTS "Users can update own cases" ON cases;
DROP POLICY IF EXISTS "Users can delete own cases" ON cases;

-- Drop roles, permissions, role_permissions policies that might use is_admin
DROP POLICY IF EXISTS "Admins can manage roles" ON roles;
DROP POLICY IF EXISTS "Admins can manage permissions" ON permissions;
DROP POLICY IF EXISTS "Admins can manage role permissions" ON role_permissions;

-- STEP 2: Now we can safely drop the is_admin function
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_admin(UUID);

-- STEP 3: Temporarily disable RLS on user_profiles to avoid any remaining issues
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create a new function with a different name to avoid conflicts
CREATE FUNCTION check_admin_role(check_user_id UUID DEFAULT auth.uid())
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

-- STEP 5: Create new simplified policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL USING (check_admin_role());

-- STEP 6: Create new policies for cases
CREATE POLICY "Users can view own cases or admins can view all" ON cases
    FOR SELECT USING (
        user_id = auth.uid() OR check_admin_role()
    );

CREATE POLICY "Users can insert own cases" ON cases
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cases or admins can update all" ON cases
    FOR UPDATE USING (
        user_id = auth.uid() OR check_admin_role()
    )
    WITH CHECK (
        user_id = auth.uid() OR check_admin_role()
    );

CREATE POLICY "Users can delete own cases or admins can delete all" ON cases
    FOR DELETE USING (
        user_id = auth.uid() OR check_admin_role()
    );

-- STEP 7: Recreate admin policies for other tables
CREATE POLICY "Admins can manage roles" ON roles
    FOR ALL USING (check_admin_role());

CREATE POLICY "Admins can manage permissions" ON permissions
    FOR ALL USING (check_admin_role());

CREATE POLICY "Admins can manage role permissions" ON role_permissions
    FOR ALL USING (check_admin_role());
