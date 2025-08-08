-- Tabla para tokens de recuperación de contraseña personalizada
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- RLS (Row Level Security)
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Política para que solo los administradores puedan ver los tokens
CREATE POLICY "Admin can manage password reset tokens" ON password_reset_tokens
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() 
            AND r.name = 'admin'
        )
    );

-- Función para limpiar tokens expirados automáticamente
CREATE OR REPLACE FUNCTION cleanup_expired_password_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM password_reset_tokens 
    WHERE expires_at < NOW() 
    OR (used = TRUE AND used_at < NOW() - INTERVAL '7 days');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_password_reset_tokens_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_password_reset_tokens_updated_at
    BEFORE UPDATE ON password_reset_tokens
    FOR EACH ROW
    EXECUTE FUNCTION update_password_reset_tokens_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE password_reset_tokens IS 'Tokens para recuperación de contraseña personalizada usando nuestro sistema SMTP';
COMMENT ON COLUMN password_reset_tokens.email IS 'Email del usuario que solicita la recuperación';
COMMENT ON COLUMN password_reset_tokens.token IS 'Token único y seguro para la recuperación';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Fecha y hora de expiración del token';
COMMENT ON COLUMN password_reset_tokens.used IS 'Indica si el token ya fue utilizado';
COMMENT ON COLUMN password_reset_tokens.used_at IS 'Fecha y hora cuando se utilizó el token';

-- Datos de ejemplo para testing (opcional)
-- INSERT INTO password_reset_tokens (email, token, expires_at) 
-- VALUES ('test@example.com', 'test_token_123', NOW() + INTERVAL '24 hours');
