-- Corrección específica para la política INSERT de password_reset_tokens
-- El problema es que WITH CHECK no está funcionando correctamente

-- Primero, eliminar la política INSERT problemática
DROP POLICY IF EXISTS "System can create password reset tokens" ON password_reset_tokens;

-- Crear una política INSERT más permisiva que funcione
-- Permitir INSERT para usuarios autenticados si el email existe en user_profiles
CREATE POLICY "Allow password reset token creation" ON password_reset_tokens
    FOR INSERT 
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE email = password_reset_tokens.email
        )
    );

-- Verificar las políticas actualizadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'password_reset_tokens' AND cmd = 'INSERT';
