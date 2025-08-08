-- Actualización de políticas RLS para password_reset_tokens
-- Este script corrige los permisos para permitir la creación de tokens

-- Eliminar la política restrictiva actual
DROP POLICY IF EXISTS "Admin can manage password reset tokens" ON password_reset_tokens;

-- Política para permitir inserción de tokens para usuarios existentes
-- El sistema debe poder crear tokens para cualquier email válido en user_profiles
CREATE POLICY "System can create password reset tokens" ON password_reset_tokens
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE email = password_reset_tokens.email
        )
    );

-- Política para que solo administradores puedan ver todos los tokens
CREATE POLICY "Admin can view all password reset tokens" ON password_reset_tokens
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() 
            AND r.name = 'admin'
        )
    );

-- Política para que usuarios puedan ver solo sus propios tokens
CREATE POLICY "Users can view own password reset tokens" ON password_reset_tokens
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            WHERE up.id = auth.uid() 
            AND up.email = password_reset_tokens.email
        )
    );

-- Política para que el sistema pueda marcar tokens como usados
CREATE POLICY "System can update password reset tokens" ON password_reset_tokens
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles 
            WHERE email = password_reset_tokens.email
        )
    );

-- Política para que administradores puedan eliminar tokens
CREATE POLICY "Admin can delete password reset tokens" ON password_reset_tokens
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() 
            AND r.name = 'admin'
        )
    );

-- Verificar que las políticas están activas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'password_reset_tokens';
