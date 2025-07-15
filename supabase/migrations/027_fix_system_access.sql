-- =====================================================
-- SOLUCIÓN: Recrear función has_system_access
-- =====================================================
-- La función has_system_access fue eliminada pero es necesaria para la aplicación

-- =====================================================
-- PASO 1: Activar cuentas de usuarios principales
-- =====================================================

-- Activar los usuarios principales
UPDATE public.user_profiles 
SET is_active = true 
WHERE email IN (
  'andresjgsalzate@gmail.com',
  'hjurgensen@todosistemassti.co',
  'juegosjgsalza@gmail.com'
);

-- =====================================================
-- PASO 2: Crear función has_system_access
-- =====================================================

CREATE OR REPLACE FUNCTION public.has_system_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_profile RECORD;
BEGIN
  -- Obtener el perfil del usuario actual
  SELECT 
    up.is_active,
    r.name as role_name
  INTO user_profile
  FROM public.user_profiles up
  LEFT JOIN public.roles r ON up.role_id = r.id
  WHERE up.id = auth.uid();
  
  -- Si no se encuentra el perfil, no tiene acceso
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Solo tiene acceso si está activo y tiene un rol válido
  RETURN (
    user_profile.is_active = true 
    AND user_profile.role_name IS NOT NULL 
    AND user_profile.role_name != 'user'
  );
END;
$$;

-- =====================================================
-- PASO 3: Verificar que funciona
-- =====================================================

-- Probar la función para el usuario admin
SELECT 
  'Test has_system_access' as test,
  public.has_system_access() as has_access,
  auth.uid() as current_user;

-- Verificar estado de usuarios
SELECT 
  email,
  full_name,
  is_active,
  r.name as role_name,
  CASE 
    WHEN is_active = true AND r.name != 'user' THEN 'Acceso permitido'
    ELSE 'Sin acceso'
  END as status
FROM public.user_profiles up
LEFT JOIN public.roles r ON up.role_id = r.id
WHERE email IN (
  'andresjgsalzate@gmail.com',
  'hjurgensen@todosistemassti.co',
  'juegosjgsalza@gmail.com'
)
ORDER BY email;

-- =====================================================
-- RESULTADO ESPERADO:
-- =====================================================
/*
✅ Usuarios principales activados (is_active = true)
✅ Función has_system_access() recreada
✅ La aplicación debería permitir acceso a usuarios con roles admin/supervisor/analista
✅ Eliminar la pantalla de "Acceso Restringido"
*/
