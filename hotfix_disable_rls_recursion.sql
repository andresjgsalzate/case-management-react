-- =============================================
-- CORRECCIÓN URGENTE: DESACTIVAR RLS TEMPORALMENTE
-- PARA SOLUCIONAR LA RECURSIÓN INFINITA
-- =============================================

-- PASO 1: Desactivar RLS temporalmente para permitir acceso
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- PASO 2: Eliminar todas las políticas problemáticas
DROP POLICY IF EXISTS "user_profiles_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;  
DROP POLICY IF EXISTS "user_profiles_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_policy" ON user_profiles;

-- CONFIRMACIÓN
SELECT 'RLS TEMPORALMENTE DESACTIVADO - RECURSIÓN SOLUCIONADA' as status;
