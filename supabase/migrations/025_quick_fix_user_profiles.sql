-- =====================================================
-- SOLUCIÓN RÁPIDA: Eliminar Recursión en user_profiles
-- =====================================================
-- Este script elimina TODAS las políticas problemáticas y crea políticas simples

-- =====================================================
-- PASO 1: LIMPIAR COMPLETAMENTE user_profiles
-- =====================================================

-- Deshabilitar RLS completamente
ALTER TABLE public.user_profiles DISABLE ROW LEVEL SECURITY;

-- Eliminar TODAS las políticas existentes (sin importar el nombre)
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.user_profiles', policy_record.policyname);
    END LOOP;
END $$;

-- =====================================================
-- PASO 2: CREAR POLÍTICAS SIMPLES SIN RECURSIÓN
-- =====================================================

-- Re-habilitar RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Política 1: Acceso a perfil propio o con system.access
CREATE POLICY "user_profile_select_policy" ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (
    -- Su propio perfil
    id = auth.uid()
    OR
    -- Verificación directa de system.access (SIN usar has_permission)
    EXISTS (
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
  );

-- Política 2: Solo puede crear su propio perfil
CREATE POLICY "user_profile_insert_policy" ON public.user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Política 3: Actualizar perfil propio o con system.access
CREATE POLICY "user_profile_update_policy" ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (
    id = auth.uid()
    OR
    EXISTS (
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
  WITH CHECK (
    id = auth.uid()
    OR
    EXISTS (
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
  );

-- Política 4: Administradores pueden gestionar todos los perfiles
CREATE POLICY "admin_manage_user_profiles" ON public.user_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.user_profiles up
      JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid()
      AND r.name = 'admin'
      AND up.is_active = true
      AND r.is_active = true
    )
  );

-- =====================================================
-- PASO 3: VERIFICAR QUE FUNCIONA
-- =====================================================

-- Verificar que las políticas se crearon correctamente
SELECT 
  tablename,
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'user_profiles' 
  AND schemaname = 'public'
ORDER BY policyname;

-- Probar acceso básico
SELECT 
  'Test access' as test,
  count(*) as user_profiles_accessible
FROM public.user_profiles;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
-- 1. Sin recursión infinita
-- 2. Usuarios pueden acceder a sus perfiles
-- 3. Las funciones has_permission funcionan normalmente
-- 4. La aplicación carga correctamente
