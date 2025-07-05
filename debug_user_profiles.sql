-- Debug script to check user_profiles and admin setup

-- Check all user profiles
SELECT 
    up.id,
    up.email,
    up.full_name,
    up.role_id,
    up.is_active,
    r.name as role_name,
    r.description as role_description
FROM user_profiles up
LEFT JOIN roles r ON up.role_id = r.id
ORDER BY up.created_at;

-- Check all roles
SELECT * FROM roles ORDER BY name;

-- Check admin permissions
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.resource,
    p.action
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'admin'
ORDER BY p.resource, p.action;

-- Check auth.users
SELECT id, email, created_at FROM auth.users ORDER BY created_at;
