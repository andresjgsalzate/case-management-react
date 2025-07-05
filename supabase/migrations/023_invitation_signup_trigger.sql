-- Migración: Función para manejar signup de usuarios invitados
-- Fecha: 2025-07-05
-- Descripción: Función que puede ser llamada desde el frontend para crear perfiles de usuarios invitados

-- Función para crear perfil de usuario invitado
CREATE OR REPLACE FUNCTION public.create_invited_user_profile(
  user_id UUID,
  user_email TEXT,
  user_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID AS $$
BEGIN
  -- Insertar o actualizar perfil con datos de la invitación
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    role_id,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    user_id,
    user_email,
    COALESCE(user_metadata->>'full_name', ''),
    COALESCE(user_metadata->>'role_id', (SELECT id FROM roles WHERE name = 'user' LIMIT 1)),
    COALESCE((user_metadata->>'is_active')::boolean, true),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    role_id = COALESCE(EXCLUDED.role_id, user_profiles.role_id),
    is_active = EXCLUDED.is_active,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dar permisos para ejecutar la función
GRANT EXECUTE ON FUNCTION public.create_invited_user_profile TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_invited_user_profile TO anon;

-- Comentario para documentación
COMMENT ON FUNCTION public.create_invited_user_profile(UUID, TEXT, JSONB) IS 
'Crea o actualiza un perfil de usuario para usuarios invitados por admin. Puede ser llamada desde el frontend después del signup.';

-- Logs para verificación
SELECT 'Migration completed: create_invited_user_profile function created' as status;
