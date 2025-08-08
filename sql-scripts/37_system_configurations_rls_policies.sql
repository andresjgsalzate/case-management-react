-- Configurar políticas RLS para system_configurations para permitir lectura desde password recovery
-- Esto permite que el sistema de recuperación de contraseñas acceda a configuraciones SMTP

-- Habilitar RLS en system_configurations si no está habilitado
ALTER TABLE system_configurations ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura de configuraciones SMTP a usuarios anónimos y autenticados
CREATE POLICY "Allow read smtp configurations for password recovery" ON system_configurations
    FOR SELECT 
    TO anon, authenticated
    USING (
        category = 'smtp' AND is_active = true
    );

-- Política para permitir lectura de configuraciones URL a usuarios anónimos y autenticados
CREATE POLICY "Allow read url configurations for password recovery" ON system_configurations
    FOR SELECT 
    TO anon, authenticated
    USING (
        category = 'urls' AND is_active = true
    );

-- Política para permitir lectura de configuraciones de límites de email a usuarios autenticados
CREATE POLICY "Allow read email_limits configurations for authenticated users" ON system_configurations
    FOR SELECT 
    TO authenticated
    USING (
        category = 'email_limits' AND is_active = true
    );

-- Política para permitir lectura de configuraciones de templates a usuarios autenticados
CREATE POLICY "Allow read template_config configurations for authenticated users" ON system_configurations
    FOR SELECT 
    TO authenticated
    USING (
        category = 'template_config' AND is_active = true
    );

-- Política para permitir modificación solo a admins
CREATE POLICY "Allow admin modifications to system_configurations" ON system_configurations
    FOR ALL 
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Verificar las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'system_configurations';
