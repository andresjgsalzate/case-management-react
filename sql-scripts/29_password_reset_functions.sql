-- Función para crear tokens de password reset con SECURITY DEFINER
-- Esto bypass los problemas de RLS permitiendo al sistema crear tokens

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

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION create_password_reset_token(TEXT, TEXT, TIMESTAMPTZ) TO authenticated;

-- Función adicional para marcar token como usado
CREATE OR REPLACE FUNCTION mark_password_reset_token_used(
    p_token TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    token_exists BOOLEAN;
BEGIN
    -- Verificar si el token existe y no está usado
    SELECT EXISTS(
        SELECT 1 FROM password_reset_tokens 
        WHERE token = p_token 
        AND used = FALSE 
        AND expires_at > NOW()
    ) INTO token_exists;
    
    IF NOT token_exists THEN
        RETURN FALSE;
    END IF;
    
    -- Marcar como usado
    UPDATE password_reset_tokens 
    SET used = TRUE, used_at = NOW(), updated_at = NOW()
    WHERE token = p_token;
    
    RETURN TRUE;
END;
$$;

-- Otorgar permisos de ejecución
GRANT EXECUTE ON FUNCTION mark_password_reset_token_used(TEXT) TO authenticated;

-- Comentarios para documentación
COMMENT ON FUNCTION create_password_reset_token IS 'Función segura para crear tokens de password reset, bypassa RLS';
COMMENT ON FUNCTION mark_password_reset_token_used IS 'Función segura para marcar tokens como usados';
