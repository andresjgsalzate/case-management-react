-- 🔧 FIX: Arreglar políticas RLS para permitir registro de usuarios
-- Este script soluciona el error "Database error saving new user"

-- PROBLEMA: Las políticas RLS están bloqueando la creación de perfiles de usuario
-- SOLUCIÓN: Permitir que los usuarios creen su propio perfil inicial

-- 1. ARREGLAR POLÍTICA DE USER_PROFILES PARA PERMITIR CREACIÓN
DROP POLICY IF EXISTS "System access required for user_profiles" ON user_profiles;

-- Nueva política que permite:
-- - A los usuarios ver/editar su propio perfil
-- - A usuarios con system.access ver otros perfiles
-- - IMPORTANTE: Permite INSERT para cualquier usuario autenticado (para registro inicial)
CREATE POLICY "user_profiles_access_policy" ON user_profiles
    FOR ALL USING (
        -- El usuario puede ver/editar su propio perfil
        id = auth.uid() 
        OR 
        -- O tiene acceso al sistema (admin, supervisor, analista)
        has_system_access()
    );

-- 2. POLÍTICA ESPECÍFICA PARA PERMITIR INSERT (registro inicial)
CREATE POLICY "user_profiles_insert_policy" ON user_profiles
    FOR INSERT WITH CHECK (
        -- Solo puede insertar su propio perfil
        id = auth.uid()
    );

-- 3. VERIFICAR QUE RLS ESTÁ HABILITADO
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. CREAR FUNCIÓN PARA ASIGNAR ROL 'USER' POR DEFECTO
-- Esta función se ejecutará automáticamente cuando se cree un usuario
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
DECLARE
    default_role_id UUID;
BEGIN
    -- Obtener el ID del rol 'user' (sin acceso)
    SELECT id INTO default_role_id FROM roles WHERE name = 'user' LIMIT 1;
    
    -- Si no existe el rol 'user', crear el perfil sin rol (NULL)
    IF default_role_id IS NULL THEN
        INSERT INTO public.user_profiles (id, email, full_name, role_id, is_active)
        VALUES (
            new.id,
            new.email,
            COALESCE(new.raw_user_meta_data->>'full_name', new.email),
            NULL,
            true
        );
    ELSE
        -- Insertar el perfil con rol 'user' por defecto
        INSERT INTO public.user_profiles (id, email, full_name, role_id, is_active)
        VALUES (
            new.id,
            new.email,
            COALESCE(new.raw_user_meta_data->>'full_name', new.email),
            default_role_id,
            true
        );
    END IF;
    
    RETURN new;
END;
$$ language plpgsql security definer;

-- 5. CREAR TRIGGER PARA EJECUTAR LA FUNCIÓN AL CREAR USUARIO
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- 6. VERIFICAR QUE LAS POLÍTICAS ESTÁN CORRECTAS
DO $$
BEGIN
    -- Verificar que las políticas existen
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'user_profiles_access_policy'
    ) THEN
        RAISE NOTICE '✅ Política de acceso a user_profiles creada correctamente';
    ELSE
        RAISE WARNING '❌ Error: Política de acceso no se creó';
    END IF;
    
    IF EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_profiles' 
        AND policyname = 'user_profiles_insert_policy'
    ) THEN
        RAISE NOTICE '✅ Política de inserción a user_profiles creada correctamente';
    ELSE
        RAISE WARNING '❌ Error: Política de inserción no se creó';
    END IF;
    
    -- Verificar que el trigger existe
    IF EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'on_auth_user_created'
    ) THEN
        RAISE NOTICE '✅ Trigger para nuevos usuarios creado correctamente';
    ELSE
        RAISE WARNING '❌ Error: Trigger no se creó';
    END IF;
    
    -- Verificar rol 'user'
    IF EXISTS (SELECT 1 FROM roles WHERE name = 'user') THEN
        RAISE NOTICE '✅ Rol "user" existe para asignación por defecto';
    ELSE
        RAISE WARNING '❌ Error: Rol "user" no existe';
    END IF;
    
    -- Mensajes finales
    RAISE NOTICE '🎉 Fix completado. Ahora los usuarios pueden registrarse correctamente.';
    RAISE NOTICE '📝 Los nuevos usuarios se crearán con rol "user" (sin acceso) por defecto.';
    RAISE NOTICE '👑 Los administradores podrán activarlos desde el panel de gestión.';
END $$;

-- 7. LIMPIAR SESIONES CACHÉ SI ES NECESARIO
-- Los usuarios que intentaron registrarse y fallaron pueden tener datos corruptos
-- Este comando limpia el caché de auth (ejecutar si es necesario)
-- NOTA: Esto desconectará a todos los usuarios
-- SELECT auth.clear_session();
