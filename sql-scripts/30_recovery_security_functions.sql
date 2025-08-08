-- Función para verificar si un email existe para password recovery
-- Permite verificación sin autenticación para usuarios que olvidaron su contraseña

CREATE OR REPLACE FUNCTION get_user_data_for_recovery(
    p_email TEXT
) RETURNS TABLE(email TEXT, full_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Verificar que el email existe
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.email = p_email) THEN
        -- No revelar que el email no existe por seguridad
        RETURN;
    END IF;
    
    -- Retornar datos básicos necesarios para el recovery
    RETURN QUERY
    SELECT 
        user_profiles.email,
        user_profiles.full_name
    FROM user_profiles 
    WHERE user_profiles.email = p_email;
END;
$$;

-- Actualizar función de creación de tokens para permitir acceso anónimo
-- Necesario para usuarios que no pueden autenticarse
DROP FUNCTION IF EXISTS create_password_reset_token(TEXT, TEXT, TIMESTAMPTZ);

CREATE OR REPLACE FUNCTION create_password_reset_token(
    p_email TEXT,
    p_token TEXT,
    p_expires_at TIMESTAMPTZ
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_token_id UUID;
BEGIN
    -- Verificar que el email existe en user_profiles
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = p_email) THEN
        RAISE EXCEPTION 'Email no encontrado en el sistema';
    END IF;
    
    -- Insertar el token
    INSERT INTO password_reset_tokens (email, token, expires_at)
    VALUES (p_email, p_token, p_expires_at)
    RETURNING id INTO new_token_id;
    
    RETURN new_token_id;
END;
$$;

-- Otorgar permisos de ejecución a usuarios anónimos (no autenticados) y autenticados
GRANT EXECUTE ON FUNCTION get_user_data_for_recovery(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_user_data_for_recovery(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_password_reset_token(TEXT, TEXT, TIMESTAMPTZ) TO anon;
GRANT EXECUTE ON FUNCTION create_password_reset_token(TEXT, TEXT, TIMESTAMPTZ) TO authenticated;

-- Comentario para documentación
COMMENT ON FUNCTION get_user_data_for_recovery IS 'Obtiene datos básicos del usuario para password recovery sin requerir autenticación';
COMMENT ON FUNCTION create_password_reset_token IS 'Crea tokens de password reset sin requerir autenticación';
