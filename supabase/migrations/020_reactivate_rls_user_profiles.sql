-- =============================================
-- REACTIVAR RLS EN USER_PROFILES CON POLÍTICAS SEGURAS
-- =============================================

-- 1. Primero verificamos que las funciones necesarias existen
-- (Deberían existir de migraciones anteriores)

-- 2. Activar RLS en user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can insert their own profile" ON user_profiles;

-- 4. Crear políticas RLS seguras y simples

-- Política para SELECT: Los usuarios pueden ver su propio perfil, los admins pueden ver todos
CREATE POLICY "user_profiles_select_policy" ON user_profiles FOR SELECT
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM role_permissions rp
    JOIN roles r ON r.id = rp.role_id
    JOIN user_profiles up ON up.role_id = r.id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE up.id = auth.uid()
    AND r.name = 'admin'
    AND p.name = 'system.admin'
  )
);

-- Política para INSERT: Cualquier usuario autenticado puede crear su propio perfil
-- (Esto es necesario para el registro automático)
CREATE POLICY "user_profiles_insert_policy" ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Política para UPDATE: Los usuarios pueden actualizar su propio perfil, los admins pueden actualizar cualquiera
CREATE POLICY "user_profiles_update_policy" ON user_profiles FOR UPDATE
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM role_permissions rp
    JOIN roles r ON r.id = rp.role_id
    JOIN user_profiles up ON up.role_id = r.id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE up.id = auth.uid()
    AND r.name = 'admin'
    AND p.name = 'system.admin'
  )
);

-- Política para DELETE: Solo admins pueden eliminar perfiles
CREATE POLICY "user_profiles_delete_policy" ON user_profiles FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM role_permissions rp
    JOIN roles r ON r.id = rp.role_id
    JOIN user_profiles up ON up.role_id = r.id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE up.id = auth.uid()
    AND r.name = 'admin'
    AND p.name = 'system.admin'
  )
);

-- 5. Verificar que las políticas se crearon correctamente
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- 6. Mensaje de confirmación
SELECT 'RLS reactivado en user_profiles con políticas seguras' as status;
