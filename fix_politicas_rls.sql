-- 🔧 FIX DEFINITIVO: Reemplazar políticas con versiones más permisivas
-- El problema está en los permisos específicos de las políticas RLS

-- PASO 1: Eliminar políticas problemáticas
DROP POLICY IF EXISTS "user_profiles_access_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;

-- PASO 2: Crear política MUY permisiva para INSERT (registro)
-- Esta política permite que cualquier usuario autenticado inserte SU propio perfil
CREATE POLICY "allow_user_profile_creation" ON user_profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (id = auth.uid());

-- PASO 3: Crear política permisiva para SELECT/UPDATE 
-- Permite que usuarios vean/editen su perfil O tengan system.access
CREATE POLICY "allow_user_profile_access" ON user_profiles
    FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() 
        OR 
        (
            SELECT EXISTS (
                SELECT 1 
                FROM user_profiles up2
                JOIN roles r ON up2.role_id = r.id
                JOIN role_permissions rp ON r.id = rp.role_id
                JOIN permissions p ON rp.permission_id = p.id
                WHERE up2.id = auth.uid() 
                AND p.name = 'system.access'
                AND up2.is_active = true
                AND r.is_active = true
                AND p.is_active = true
            )
        )
    );

-- PASO 4: Política para UPDATE
CREATE POLICY "allow_user_profile_update" ON user_profiles
    FOR UPDATE
    TO authenticated
    USING (
        id = auth.uid() 
        OR 
        (
            SELECT EXISTS (
                SELECT 1 
                FROM user_profiles up2
                JOIN roles r ON up2.role_id = r.id
                JOIN role_permissions rp ON r.id = rp.role_id
                JOIN permissions p ON rp.permission_id = p.id
                WHERE up2.id = auth.uid() 
                AND p.name = 'system.access'
                AND up2.is_active = true
                AND r.is_active = true
                AND p.is_active = true
            )
        )
    )
    WITH CHECK (
        id = auth.uid() 
        OR 
        (
            SELECT EXISTS (
                SELECT 1 
                FROM user_profiles up2
                JOIN roles r ON up2.role_id = r.id
                JOIN role_permissions rp ON r.id = rp.role_id
                JOIN permissions p ON rp.permission_id = p.id
                WHERE up2.id = auth.uid() 
                AND p.name = 'system.access'
                AND up2.is_active = true
                AND r.is_active = true
                AND p.is_active = true
            )
        )
    );

-- PASO 5: Verificar que las nuevas políticas se crearon
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'allow_user_profile_creation') THEN
        RAISE NOTICE '✅ Política de creación de perfiles creada';
    ELSE
        RAISE WARNING '❌ Error: Política de creación no se creó';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'allow_user_profile_access') THEN
        RAISE NOTICE '✅ Política de acceso a perfiles creada';
    ELSE
        RAISE WARNING '❌ Error: Política de acceso no se creó';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'allow_user_profile_update') THEN
        RAISE NOTICE '✅ Política de actualización de perfiles creada';
    ELSE
        RAISE WARNING '❌ Error: Política de actualización no se creó';
    END IF;
    
    RAISE NOTICE '🎉 Políticas RLS actualizadas. Registro debería funcionar ahora.';
END $$;

-- PASO 6: Verificar el trigger y función están funcionando
SELECT 
    'Trigger: ' || tgname as status
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created'
UNION ALL
SELECT 
    'Función: ' || proname as status
FROM pg_proc 
WHERE proname = 'handle_new_user';
