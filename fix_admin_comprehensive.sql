-- Comprehensive Admin User Fix Script
-- Run this script to ensure the admin user is properly set up

-- 1. Check if the admin user exists in auth.users
SELECT 'Checking auth user...' as step;
SELECT id, email, created_at 
FROM auth.users 
WHERE email = 'andresjgsalzate@gmail.com';

-- 2. Check if user_profiles record exists
SELECT 'Checking user profile...' as step;
SELECT up.id, up.email, up.full_name, up.role_id, r.name as role_name
FROM user_profiles up
LEFT JOIN roles r ON up.role_id = r.id
WHERE up.email = 'andresjgsalzate@gmail.com';

-- 3. Ensure user profile exists (insert if missing)
INSERT INTO user_profiles (id, email, full_name, role_id, is_active)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', 'Andres Alzate Admin'),
    r.id,
    true
FROM auth.users au
CROSS JOIN roles r
WHERE au.email = 'andresjgsalzate@gmail.com' 
AND r.name = 'user'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.id = au.id
);

-- 4. Update user to admin role
UPDATE user_profiles 
SET role_id = r.id,
    full_name = COALESCE(full_name, 'Andres Alzate Admin'),
    is_active = true
FROM roles r
WHERE user_profiles.email = 'andresjgsalzate@gmail.com' 
AND r.name = 'admin';

-- 5. Verify the final setup
SELECT 'Final verification...' as step;
SELECT 
    up.id,
    up.email,
    up.full_name,
    up.is_active,
    r.name as role_name,
    r.description as role_description,
    COUNT(p.id) as permission_count
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id AND p.is_active = true
WHERE up.email = 'andresjgsalzate@gmail.com'
GROUP BY up.id, up.email, up.full_name, up.is_active, r.name, r.description;

-- 6. List admin permissions
SELECT 'Admin permissions...' as step;
SELECT 
    p.name as permission_name,
    p.resource,
    p.action,
    p.description
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE up.email = 'andresjgsalzate@gmail.com'
AND p.is_active = true
ORDER BY p.resource, p.action;
