-- Configurar políticas RLS para email_logs para permitir inserción desde password recovery
-- Esto permite que el sistema de recuperación de contraseñas registre logs sin autenticación

-- Habilitar RLS en email_logs si no está habilitado
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserción de logs durante password recovery (usuarios anónimos)
CREATE POLICY "Allow anonymous insert for password recovery logs" ON email_logs
    FOR INSERT 
    TO anon
    WITH CHECK (
        email_type = 'password_reset' OR
        email_type = 'password_recovery'
    );

-- Política para permitir inserción de logs para usuarios autenticados (todos los tipos)
CREATE POLICY "Allow authenticated insert for email logs" ON email_logs
    FOR INSERT 
    TO authenticated
    WITH CHECK (true);

-- Política para permitir lectura de logs solo a usuarios autenticados (con sus propios emails)
CREATE POLICY "Allow authenticated read own email logs" ON email_logs
    FOR SELECT 
    TO authenticated
    USING (
        auth.email() = recipient_email OR
        auth.jwt() ->> 'role' = 'admin'
    );

-- Verificar las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'email_logs';
