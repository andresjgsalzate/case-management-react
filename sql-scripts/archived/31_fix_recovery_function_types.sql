-- Corrección de tipos para la función get_user_data_for_recovery
-- Ajustar tipos para coincidir exactamente con la estructura de user_profiles

DROP FUNCTION IF EXISTS get_user_data_for_recovery(TEXT);

CREATE OR REPLACE FUNCTION get_user_data_for_recovery(
    p_email character varying
) RETURNS TABLE(email character varying, full_name character varying)
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

-- Otorgar permisos de ejecución a usuarios anónimos y autenticados
GRANT EXECUTE ON FUNCTION get_user_data_for_recovery(character varying) TO anon;
GRANT EXECUTE ON FUNCTION get_user_data_for_recovery(character varying) TO authenticated;

-- Comentario para documentación
COMMENT ON FUNCTION get_user_data_for_recovery IS 'Obtiene datos básicos del usuario para password recovery sin requerir autenticación - tipos corregidos';
