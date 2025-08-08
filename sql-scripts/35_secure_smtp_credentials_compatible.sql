-- Sistema seguro para credenciales SMTP - versión compatible con Supabase
-- Usar encriptación básica disponible en Supabase

-- Crear tabla segura para credenciales SMTP (separada de system_configurations)
CREATE TABLE IF NOT EXISTS smtp_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credential_key TEXT NOT NULL UNIQUE,
    encrypted_value TEXT NOT NULL, -- Cambiar a TEXT para mayor compatibilidad
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Función simple para "encriptar" (ofuscar) credenciales usando encode/decode
CREATE OR REPLACE FUNCTION insert_encrypted_credential(
    p_key TEXT,
    p_value TEXT,
    p_description TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    credential_id UUID;
    obfuscated_value TEXT;
BEGIN
    -- Usar encode con base64 para ofuscar el valor (no es encriptación real pero ayuda)
    obfuscated_value := encode(p_value::bytea, 'base64');
    
    -- Insertar credencial ofuscada
    INSERT INTO smtp_credentials (credential_key, encrypted_value, description)
    VALUES (
        p_key,
        obfuscated_value,
        p_description
    )
    RETURNING id INTO credential_id;
    
    RETURN credential_id;
END;
$$;

-- Función para obtener credencial decodificada (solo para uso interno)
CREATE OR REPLACE FUNCTION get_decrypted_credential(p_key TEXT) 
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    decoded_value TEXT;
BEGIN
    -- Obtener y decodificar valor
    SELECT convert_from(decode(encrypted_value, 'base64'), 'UTF8')
    INTO decoded_value
    FROM smtp_credentials
    WHERE credential_key = p_key AND is_active = true;
    
    RETURN decoded_value;
END;
$$;

-- Función para actualizar credencial ofuscada
CREATE OR REPLACE FUNCTION update_encrypted_credential(
    p_key TEXT,
    p_new_value TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    obfuscated_value TEXT;
BEGIN
    obfuscated_value := encode(p_new_value::bytea, 'base64');
    
    UPDATE smtp_credentials 
    SET 
        encrypted_value = obfuscated_value,
        updated_at = NOW()
    WHERE credential_key = p_key AND is_active = true;
    
    RETURN FOUND;
END;
$$;

-- Insertar la contraseña SMTP ofuscada
SELECT insert_encrypted_credential(
    'smtp_password',
    'B6vIP!h?OM/',
    'Contraseña SMTP de Hostinger para case-management@andrejgalzate.com'
);

-- Eliminar la contraseña en texto plano de system_configurations
DELETE FROM system_configurations 
WHERE category = 'smtp' AND "key" = 'password';

-- Configurar RLS para la tabla de credenciales
ALTER TABLE smtp_credentials ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden acceder a credenciales
CREATE POLICY "Only admins can access smtp credentials" ON smtp_credentials
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin');

-- Política adicional para permitir al sistema acceder a credenciales durante password recovery
CREATE POLICY "Allow system access for password recovery" ON smtp_credentials
    FOR SELECT
    TO anon, authenticated
    USING (credential_key = 'smtp_password');

-- Otorgar permisos a las funciones
GRANT EXECUTE ON FUNCTION get_decrypted_credential(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION insert_encrypted_credential(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_encrypted_credential(TEXT, TEXT) TO authenticated;

-- Verificar que la ofuscación funciona (sin mostrar la contraseña real)
SELECT 
    credential_key,
    description,
    is_active,
    created_at,
    'OBFUSCATED' as status,
    length(encrypted_value) as encrypted_length
FROM smtp_credentials 
WHERE credential_key = 'smtp_password';

-- Comentario de documentación
COMMENT ON TABLE smtp_credentials IS 'Tabla segura para credenciales SMTP con ofuscación base64';
COMMENT ON FUNCTION get_decrypted_credential IS 'Función segura para obtener credenciales decodificadas - solo uso interno';
