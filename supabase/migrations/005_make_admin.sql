-- Script para convertir andresjgsalzate@gmail.com en administrador
-- Fecha: 2025-07-05

-- 1. Verificar estado actual
SELECT 'Estado actual de roles:' as info;
SELECT id, name, description, is_active FROM roles;

SELECT 'Estado actual de user_profiles:' as info;
SELECT id, email, full_name, role_id, is_active FROM user_profiles;

-- 2. Obtener IDs necesarios
WITH admin_role AS (
    SELECT id as role_id FROM roles WHERE name = 'admin' LIMIT 1
),
target_user AS (
    SELECT id as user_id FROM auth.users WHERE email = 'andresjgsalzate@gmail.com' LIMIT 1
)
SELECT 
    'IDs encontrados:' as info,
    au.email,
    au.id as user_id,
    ar.role_id as admin_role_id
FROM auth.users au, admin_role ar
WHERE au.email = 'andresjgsalzate@gmail.com';

-- 3. Actualizar el usuario para que sea administrador
UPDATE user_profiles 
SET 
    role_id = (SELECT id FROM roles WHERE name = 'admin' LIMIT 1),
    updated_at = TIMEZONE('utc'::text, NOW())
WHERE id = '5413c98b-df84-41ec-bd77-5ea321bc6922';

-- 4. Si el perfil no existe, crearlo (por si acaso)
INSERT INTO user_profiles (id, email, full_name, role_id, is_active)
SELECT 
    '5413c98b-df84-41ec-bd77-5ea321bc6922',
    'andresjgsalzate@gmail.com',
    'Andres Alzate Admin',
    (SELECT id FROM roles WHERE name = 'admin' LIMIT 1),
    true
WHERE NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = '5413c98b-df84-41ec-bd77-5ea321bc6922'
);

-- 5. Verificar el resultado final
SELECT 'Resultado final:' as info;
SELECT 
    up.id,
    up.email,
    up.full_name,
    r.name as role_name,
    r.description as role_description,
    up.is_active
FROM user_profiles up
LEFT JOIN roles r ON up.role_id = r.id
WHERE up.email = 'andresjgsalzate@gmail.com';

-- 6. Verificar permisos del usuario admin
SELECT 'Permisos del administrador:' as info;
SELECT 
    p.name as permission_name,
    p.description,
    p.resource,
    p.action
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE up.email = 'andresjgsalzate@gmail.com'
ORDER BY p.resource, p.action;
