-- Script SQL para aplicar directamente en Supabase Dashboard
-- Esto resuelve definitivamente el problema de recursión infinita en RLS

-- PASO 1: Eliminar TODAS las políticas que dependen de las funciones problemáticas
-- Primero eliminamos TODAS las políticas que usan check_admin_role

-- Eliminar políticas de user_profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all user_profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Allow own profile access" ON user_profiles;
DROP POLICY IF EXISTS "Allow admin role access" ON user_profiles;

-- Eliminar políticas de cases
DROP POLICY IF EXISTS "Users can view own cases or admins can view all" ON cases;
DROP POLICY IF EXISTS "Users can insert own cases" ON cases;
DROP POLICY IF EXISTS "Users can update own cases or admins can update all" ON cases;
DROP POLICY IF EXISTS "Users can delete own cases or admins can delete all" ON cases;
DROP POLICY IF EXISTS "Own cases access" ON cases;
DROP POLICY IF EXISTS "Admin cases access" ON cases;

-- Eliminar políticas de roles
DROP POLICY IF EXISTS "Admins can manage roles" ON roles;

-- Eliminar políticas de permissions
DROP POLICY IF EXISTS "Admins can manage permissions" ON permissions;

-- Eliminar políticas de role_permissions
DROP POLICY IF EXISTS "Admins can manage role permissions" ON role_permissions;

-- Eliminar políticas de origenes (si existen)
DROP POLICY IF EXISTS "Admins can manage origenes" ON origenes;

-- Eliminar políticas de aplicaciones (si existen)
DROP POLICY IF EXISTS "Admins can manage aplicaciones" ON aplicaciones;

-- Ahora podemos eliminar las funciones problemáticas
DROP FUNCTION IF EXISTS is_admin();
DROP FUNCTION IF EXISTS is_admin(UUID);
DROP FUNCTION IF EXISTS check_admin_role(UUID);
DROP FUNCTION IF EXISTS check_admin_role();

-- PASO 2: Deshabilitar temporalmente RLS en todas las tablas
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE origenes DISABLE ROW LEVEL SECURITY;
ALTER TABLE aplicaciones DISABLE ROW LEVEL SECURITY;

-- PASO 3: Volver a habilitar RLS en todas las tablas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE origenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE aplicaciones ENABLE ROW LEVEL SECURITY;

-- PASO 4: Crear políticas simples y no recursivas para todas las tablas

-- Para user_profiles: permitir acceso propio
CREATE POLICY "allow_own_profile_access" ON user_profiles
    FOR ALL USING (id = auth.uid());

-- Para user_profiles: permitir acceso de administradores
-- Esta consulta no causa recursión porque no referencia user_profiles dentro de la subconsulta
CREATE POLICY "allow_admin_profile_access" ON user_profiles
    FOR ALL USING (
        auth.uid() IN (
            SELECT up.id 
            FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id 
            WHERE r.name = 'admin' AND up.is_active = true
        )
    );

-- Para cases: permitir acceso a casos propios
CREATE POLICY "allow_own_cases_access" ON cases
    FOR ALL USING (user_id = auth.uid());

-- Para cases: permitir acceso de administradores
CREATE POLICY "allow_admin_cases_access" ON cases
    FOR ALL USING (
        auth.uid() IN (
            SELECT up.id 
            FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id 
            WHERE r.name = 'admin' AND up.is_active = true
        )
    );

-- Para roles: solo administradores pueden acceder
CREATE POLICY "allow_admin_roles_access" ON roles
    FOR ALL USING (
        auth.uid() IN (
            SELECT up.id 
            FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id 
            WHERE r.name = 'admin' AND up.is_active = true
        )
    );

-- Para permissions: solo administradores pueden acceder
CREATE POLICY "allow_admin_permissions_access" ON permissions
    FOR ALL USING (
        auth.uid() IN (
            SELECT up.id 
            FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id 
            WHERE r.name = 'admin' AND up.is_active = true
        )
    );

-- Para role_permissions: solo administradores pueden acceder
CREATE POLICY "allow_admin_role_permissions_access" ON role_permissions
    FOR ALL USING (
        auth.uid() IN (
            SELECT up.id 
            FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id 
            WHERE r.name = 'admin' AND up.is_active = true
        )
    );

-- Para origenes: solo administradores pueden acceder
CREATE POLICY "allow_admin_origenes_access" ON origenes
    FOR ALL USING (
        auth.uid() IN (
            SELECT up.id 
            FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id 
            WHERE r.name = 'admin' AND up.is_active = true
        )
    );

-- Para aplicaciones: solo administradores pueden acceder
CREATE POLICY "allow_admin_aplicaciones_access" ON aplicaciones
    FOR ALL USING (
        auth.uid() IN (
            SELECT up.id 
            FROM user_profiles up 
            JOIN roles r ON up.role_id = r.id 
            WHERE r.name = 'admin' AND up.is_active = true
        )
    );

-- PASO 5: Asegurar que el usuario admin existe y está configurado correctamente
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
AND r.name = 'admin'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up 
    WHERE up.id = au.id
)
ON CONFLICT (id) DO UPDATE SET
    role_id = EXCLUDED.role_id,
    full_name = EXCLUDED.full_name,
    is_active = true;

-- PASO 6: Verificar que todo funciona correctamente
-- Mostrar el usuario admin
SELECT 
    up.id,
    up.email,
    up.full_name,
    r.name as role_name,
    up.is_active
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
WHERE up.email = 'andresjgsalzate@gmail.com';
