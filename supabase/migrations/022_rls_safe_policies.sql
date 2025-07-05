-- =============================================
-- POLÍTICAS RLS SEGURAS SIN RECURSIÓN
-- =============================================

-- Activar RLS en user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLÍTICAS PARA user_profiles (SIN RECURSIÓN)
-- =============================================

-- 1. POLÍTICA SELECT: Los usuarios pueden ver su propio perfil
CREATE POLICY "user_profiles_select_own" ON user_profiles FOR SELECT
USING (auth.uid() = id);

-- 2. POLÍTICA INSERT: Cualquier usuario autenticado puede crear su propio perfil
-- (Necesario para que funcione el auto-registro)
CREATE POLICY "user_profiles_insert_own" ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 3. POLÍTICA UPDATE: Los usuarios pueden actualizar su propio perfil
CREATE POLICY "user_profiles_update_own" ON user_profiles FOR UPDATE
USING (auth.uid() = id);

-- 4. POLÍTICA ESPECIAL PARA ADMIN: Hardcodeada por UUID para evitar recursión
-- Reemplazar con el UUID real del admin principal
CREATE POLICY "user_profiles_admin_access" ON user_profiles FOR ALL
USING (
  auth.uid() = '5413c98b-df84-41ec-bd77-5ea321bc6922'::uuid OR 
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = '5413c98b-df84-41ec-bd77-5ea321bc6922'::uuid OR 
  auth.uid() = id
);

-- =============================================
-- FUNCIÓN SEGURA PARA VERIFICAR ACCESO AL SISTEMA
-- =============================================

-- Reemplazar la función anterior con una versión que no cause recursión
CREATE OR REPLACE FUNCTION has_system_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
  user_role_name text;
  user_is_active boolean;
BEGIN
  -- Obtener el UUID del usuario actual
  user_uuid := auth.uid();
  
  -- Si no hay usuario autenticado, no tiene acceso
  IF user_uuid IS NULL THEN
    RETURN false;
  END IF;
  
  -- Admin hardcodeado siempre tiene acceso (evita recursión)
  IF user_uuid = '5413c98b-df84-41ec-bd77-5ea321bc6922'::uuid THEN
    RETURN true;
  END IF;
  
  -- Para otros usuarios, verificar usando bypass de RLS
  SELECT 
    r.name,
    up.is_active
  INTO 
    user_role_name,
    user_is_active
  FROM user_profiles up
  JOIN roles r ON r.id = up.role_id
  WHERE up.id = user_uuid;
  
  -- Si no tiene perfil, no tiene acceso
  IF user_role_name IS NULL THEN
    RETURN false;
  END IF;
  
  -- Solo usuarios activos con roles que no sean 'user' tienen acceso
  IF user_is_active = true AND user_role_name != 'user' THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- =============================================
-- VERIFICAR CONFIGURACIÓN
-- =============================================

-- Verificar que las políticas se crearon
SELECT 
  'Políticas RLS' as tipo,
  policyname,
  cmd as operacion
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Verificar que la función existe
SELECT 
  'Función' as tipo,
  proname as nombre,
  'EXISTS' as estado
FROM pg_proc 
WHERE proname = 'has_system_access';

-- Mensaje de confirmación
SELECT 'RLS ACTIVADO CON POLÍTICAS SEGURAS - SIN RECURSIÓN' as status;
