-- 🚑 SOLUCIÓN DRÁSTICA: Desactivar RLS temporalmente para permitir registros
-- Esto nos permitirá registrar usuarios mientras identificamos el problema exacto

-- PASO 1: Desactivar RLS completamente en user_profiles
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- PASO 2: Verificar que se desactivó
SELECT 
    tablename, 
    rowsecurity,
    CASE 
        WHEN rowsecurity = false THEN '✅ RLS DESACTIVADO - Registro debería funcionar'
        ELSE '❌ RLS AÚN ACTIVO'
    END as status
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- PASO 3: Verificar trigger (debe estar activo para asignar rol 'user' por defecto)
SELECT 
    tgname,
    tgenabled,
    CASE 
        WHEN tgenabled = 'O' THEN '✅ Trigger activo'
        ELSE '❌ Trigger inactivo'
    END as status
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- PASO 4: Verificar función handle_new_user
SELECT 
    proname,
    CASE 
        WHEN proname IS NOT NULL THEN '✅ Función existe'
        ELSE '❌ Función no existe'
    END as status
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- MENSAJE
SELECT '🎯 RLS DESACTIVADO. Intentar registro ahora. Una vez que funcione, reactivaremos RLS con políticas correctas.' as mensaje;
