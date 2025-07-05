-- 🔧 FIX DEFINITIVO: Eliminar trigger problemático y usar webhook/function edge
-- El problema es que el trigger está interfiriendo con la creación en auth.users

-- PASO 1: ELIMINAR TRIGGER PROBLEMÁTICO
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- PASO 2: ELIMINAR FUNCIÓN PROBLEMÁTICA  
DROP FUNCTION IF EXISTS handle_new_user();

-- PASO 3: Verificar que se eliminaron
DO $$
BEGIN
    -- Verificar que el trigger se eliminó
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        RAISE NOTICE '✅ Trigger problemático eliminado';
    ELSE
        RAISE WARNING '❌ Trigger aún existe';
    END IF;
    
    -- Verificar que la función se eliminó
    IF NOT EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'handle_new_user'
    ) THEN
        RAISE NOTICE '✅ Función problemática eliminada';
    ELSE
        RAISE WARNING '❌ Función aún existe';
    END IF;
    
    RAISE NOTICE '🎉 LISTO: Ahora el registro debería funcionar sin interferencias.';
    RAISE NOTICE '📝 Los usuarios se crearán solo en auth.users inicialmente.';
    RAISE NOTICE '👑 Crearemos los perfiles desde el frontend cuando sea necesario.';
END $$;

-- PASO 4: Verificar estado final
SELECT 
    'user_profiles' as tabla,
    rowsecurity,
    CASE 
        WHEN rowsecurity = false THEN '✅ RLS DESACTIVADO'
        ELSE '❌ RLS ACTIVO'
    END as estado_rls
FROM pg_tables 
WHERE tablename = 'user_profiles';
