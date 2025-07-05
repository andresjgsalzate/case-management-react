-- Script SQL DEFINITIVO para resolver recursión RLS
-- Este enfoque evita completamente la recursión usando una estrategia diferente

-- PASO 1: Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "allow_own_profile_access" ON user_profiles;
DROP POLICY IF EXISTS "allow_admin_profile_access" ON user_profiles;
DROP POLICY IF EXISTS "allow_own_cases_access" ON cases;
DROP POLICY IF EXISTS "allow_admin_cases_access" ON cases;
DROP POLICY IF EXISTS "allow_admin_roles_access" ON roles;
DROP POLICY IF EXISTS "allow_admin_permissions_access" ON permissions;
DROP POLICY IF EXISTS "allow_admin_role_permissions_access" ON role_permissions;
DROP POLICY IF EXISTS "allow_admin_origenes_access" ON origenes;
DROP POLICY IF EXISTS "allow_admin_aplicaciones_access" ON aplicaciones;

-- PASO 2: DESHABILITAR temporalmente RLS para evitar problemas
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- PASO 3: Crear una función que accede directamente sin políticas RLS
CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_role_name TEXT;
BEGIN
    -- Buscar directamente en las tablas sin RLS
    SELECT r.name INTO user_role_name
    FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = auth.uid() 
    AND up.is_active = true
    LIMIT 1;
    
    RETURN COALESCE(user_role_name = 'admin', false);
END;
$$;

-- PASO 4: Rehabilitar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- PASO 5: Políticas simples para user_profiles
CREATE POLICY "users_own_profile" ON user_profiles
    FOR ALL USING (id = auth.uid());

-- Esta política para admin usa la función que no causa recursión
CREATE POLICY "admin_all_profiles" ON user_profiles
    FOR ALL USING (public.is_user_admin());

-- PASO 6: Políticas simples para cases
CREATE POLICY "users_own_cases" ON cases
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "admin_all_cases" ON cases
    FOR ALL USING (public.is_user_admin());

-- PASO 7: Políticas para tablas administrativas (solo admin)
CREATE POLICY "admin_only_roles" ON roles
    FOR ALL USING (public.is_user_admin());

CREATE POLICY "admin_only_permissions" ON permissions
    FOR ALL USING (public.is_user_admin());

CREATE POLICY "admin_only_role_permissions" ON role_permissions
    FOR ALL USING (public.is_user_admin());

CREATE POLICY "admin_only_origenes" ON origenes
    FOR ALL USING (public.is_user_admin());

CREATE POLICY "admin_only_aplicaciones" ON aplicaciones
    FOR ALL USING (public.is_user_admin());

-- PASO 8: Verificar el estado del usuario admin
SELECT 
    up.id,
    up.email,
    up.full_name,
    r.name as role_name,
    up.is_active,
    public.is_user_admin() as is_admin_check
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
WHERE up.email = 'andresjgsalzate@gmail.com';
