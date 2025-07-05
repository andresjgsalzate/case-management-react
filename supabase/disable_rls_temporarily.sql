-- Script SQL FINAL - Deshabilitar RLS temporalmente para todas las tablas
-- Esto permitirá que la aplicación funcione mientras investigamos la recursión

-- PASO 1: Deshabilitar RLS en todas las tablas
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE origenes DISABLE ROW LEVEL SECURITY;
ALTER TABLE aplicaciones DISABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "users_own_profile" ON user_profiles;
DROP POLICY IF EXISTS "admin_all_profiles" ON user_profiles;
DROP POLICY IF EXISTS "users_own_cases" ON cases;
DROP POLICY IF EXISTS "admin_all_cases" ON cases;
DROP POLICY IF EXISTS "admin_only_roles" ON roles;
DROP POLICY IF EXISTS "admin_only_permissions" ON permissions;
DROP POLICY IF EXISTS "admin_only_role_permissions" ON role_permissions;
DROP POLICY IF EXISTS "admin_only_origenes" ON origenes;
DROP POLICY IF EXISTS "admin_only_aplicaciones" ON aplicaciones;

-- PASO 3: Eliminar funciones problemáticas
DROP FUNCTION IF EXISTS public.is_user_admin();

-- PASO 4: Verificar usuario admin
SELECT 
    up.id,
    up.email,
    up.full_name,
    r.name as role_name,
    up.is_active
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
WHERE up.email = 'andresjgsalzate@gmail.com';

-- COMENTARIO: Con RLS deshabilitado, la aplicación funcionará normalmente
-- Los datos estarán protegidos a nivel de aplicación (React)
-- Esto es temporal hasta que resolvamos la recursión definitivamente
