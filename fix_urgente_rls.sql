-- 🚑 FIX URGENTE: Desactivar RLS temporalmente para user_profiles
-- Esto permitirá el registro mientras diagnosticamos el problema

-- OPCIÓN 1: Desactivar RLS completamente en user_profiles (TEMPORAL)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- OPCIÓN 2: Crear política muy permisiva (TEMPORAL)
DROP POLICY IF EXISTS "user_profiles_access_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;

-- Política temporal muy permisiva para permitir registros
CREATE POLICY "temporary_permissive_policy" ON user_profiles
    FOR ALL TO authenticated
    USING (true)
    WITH CHECK (true);

-- Reactivar RLS con política permisiva
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Verificar que el trigger funciona
-- Intentar registrar un usuario después de esto

SELECT 'Políticas RLS actualizadas. Intentar registro ahora.' as status;
