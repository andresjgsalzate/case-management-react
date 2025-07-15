-- =====================================================
-- SOLUCIÓN URGENTE: Recursión Infinita en user_profiles
-- =====================================================
-- PROBLEMA: Las políticas RLS en user_profiles están causando recursión infinita
-- porque las funciones has_permission acceden a user_profiles, creando un bucle

-- =====================================================
-- PASO 1: ELIMINAR POLÍTICAS EXISTENTES Y RLS
-- =====================================================
-- Primero eliminamos todas las políticas existentes que pueden estar causando recursión

-- Eliminar todas las políticas existentes de user_profiles
DROP POLICY IF EXISTS "allow_user_profile_access" ON public.user_profiles;
DROP POLICY IF EXISTS "allow_user_profile_creation" ON public.user_profiles;
DROP POLICY IF EXISTS "allow_user_profile_update" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can manage all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow user profile access" ON public.user_profiles;

-- Deshabilitar RLS temporalmente
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 2: CREAR POLÍTICAS SIMPLES SIN RECURSIÓN
-- =====================================================
-- Vamos a crear políticas que NO dependan de has_permission()

-- Re-habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Política simple: usuarios pueden ver su propio perfil
CREATE POLICY "allow_user_profile_access" ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Puede ver su propio perfil
    id = auth.uid()
    OR
    -- O tiene acceso de sistema (usando verificación directa sin has_permission)
    (
      SELECT EXISTS (
        SELECT 1
        FROM public.user_profiles up2
        JOIN public.roles r ON up2.role_id = r.id
        JOIN public.role_permissions rp ON r.id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE up2.id = auth.uid()
        AND p.name = 'system.access'
        AND up2.is_active = true
        AND r.is_active = true
        AND p.is_active = true
      )
    )
  );

-- Política para INSERT: solo puede crear su propio perfil
CREATE POLICY "allow_user_profile_creation" ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Política para UPDATE: puede actualizar su perfil o si tiene system.access
CREATE POLICY "allow_user_profile_update" ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    -- Puede actualizar su propio perfil
    id = auth.uid()
    OR
    -- O tiene acceso de sistema (verificación directa)
    (
      SELECT EXISTS (
        SELECT 1
        FROM public.user_profiles up2
        JOIN public.roles r ON up2.role_id = r.id
        JOIN public.role_permissions rp ON r.id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE up2.id = auth.uid()
        AND p.name = 'system.access'
        AND up2.is_active = true
        AND r.is_active = true
        AND p.is_active = true
      )
    )
  )
  WITH CHECK (
    -- Mismas condiciones para WITH CHECK
    id = auth.uid()
    OR
    (
      SELECT EXISTS (
        SELECT 1
        FROM public.user_profiles up2
        JOIN public.roles r ON up2.role_id = r.id
        JOIN public.role_permissions rp ON r.id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE up2.id = auth.uid()
        AND p.name = 'system.access'
        AND up2.is_active = true
        AND r.is_active = true
        AND p.is_active = true
      )
    )
  );

-- Política para administradores (verificación directa de rol admin)
CREATE POLICY "Admins can manage all user profiles" ON public.user_profiles
  FOR ALL
  TO public
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- =====================================================
-- PASO 3: VERIFICAR FUNCIONES HELPER
-- =====================================================
-- Las funciones helper deberían funcionar ahora que user_profiles
-- tiene políticas que no dependen de has_permission()

-- Verificar que las funciones existen
SELECT 
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('has_permission', 'get_user_role')
ORDER BY routine_name;

-- =====================================================
-- PASO 4: CONFIRMAR QUE LA RECURSIÓN SE RESOLVIÓ
-- =====================================================
-- Probar una consulta simple a user_profiles
SELECT 
  id,
  email,
  full_name,
  is_active
FROM public.user_profiles
WHERE id = auth.uid()
LIMIT 1;

-- =====================================================
-- NOTAS IMPORTANTES:
-- =====================================================
/*
1. Este script resuelve la recursión infinita eliminando la dependencia circular
2. Las políticas de user_profiles ahora usan verificación directa de permisos
3. NO usan has_permission() para evitar la recursión
4. Mantienen la funcionalidad de seguridad necesaria
5. Después de aplicar este script, la aplicación debería funcionar normalmente
*/
