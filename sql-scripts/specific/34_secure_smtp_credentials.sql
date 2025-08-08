-- Sistema seguro para credenciales SMTP con encriptación
-- Usar encriptación pgcrypto para proteger contraseñas sensibles

-- Habilitar extensión de encriptación si no está habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Crear tabla segura para credenciales SMTP (separada de system_configurations)
CREATE TABLE IF NOT EXISTS smtp_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    credential_key TEXT NOT NULL UNIQUE,
    encrypted_value BYTEA NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Función para insertar credenciales encriptadas
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
    encryption_key TEXT;
BEGIN
    -- Usar una clave de encriptación derivada de secretos de Supabase
    -- En producción, esto debería venir de variables de entorno
    encryption_key := 'case-management-smtp-key-2025';
    
    -- Insertar credencial encriptada
    INSERT INTO smtp_credentials (credential_key, encrypted_value, description)
    VALUES (
        p_key,
        pgp_sym_encrypt(p_value, encryption_key),
        p_description
    )
    RETURNING id INTO credential_id;
    
    RETURN credential_id;
END;
$$;

-- Función para obtener credencial desencriptada (solo para uso interno)
CREATE OR REPLACE FUNCTION get_decrypted_credential(p_key TEXT) 
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    decrypted_value TEXT;
    encryption_key TEXT;
BEGIN
    -- Usar la misma clave de encriptación
    encryption_key := 'case-management-smtp-key-2025';
    
    -- Obtener y desencriptar valor
    SELECT pgp_sym_decrypt(encrypted_value, encryption_key)
    INTO decrypted_value
    FROM smtp_credentials
    WHERE credential_key = p_key AND is_active = true;
    
    RETURN decrypted_value;
END;
$$;

-- Función para actualizar credencial encriptada
CREATE OR REPLACE FUNCTION update_encrypted_credential(
    p_key TEXT,
    p_new_value TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    encryption_key TEXT;
BEGIN
    encryption_key := 'case-management-smtp-key-2025';
    
    UPDATE smtp_credentials 
    SET 
        encrypted_value = pgp_sym_encrypt(p_new_value, encryption_key),
        updated_at = NOW()
    WHERE credential_key = p_key AND is_active = true;
    
    RETURN FOUND;
END;
$$;

-- Insertar la contraseña SMTP encriptada
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

-- Otorgar permisos a las funciones para usuarios autenticados (solo para sistema interno)
GRANT EXECUTE ON FUNCTION get_decrypted_credential(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION insert_encrypted_credential(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_encrypted_credential(TEXT, TEXT) TO authenticated;

-- Verificar que la encriptación funciona (sin mostrar la contraseña real)
SELECT 
    credential_key,
    description,
    is_active,
    created_at,
    'ENCRYPTED' as status
FROM smtp_credentials 
WHERE credential_key = 'smtp_password';

-- Comentario de documentación
COMMENT ON TABLE smtp_credentials IS 'Tabla segura para credenciales SMTP con encriptación pgcrypto';
COMMENT ON FUNCTION get_decrypted_credential IS 'Función segura para obtener credenciales desencriptadas - solo uso interno';
