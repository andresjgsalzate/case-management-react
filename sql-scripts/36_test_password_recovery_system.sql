-- Script de pruebas para verificar el sistema de password recovery
-- Ejecutar este script para verificar que todo funciona correctamente

-- 1. Verificar que la contraseña SMTP se puede recuperar
SELECT 'Probando recuperación de contraseña SMTP...' as test_step;

SELECT get_decrypted_credential('smtp_password') as smtp_password_test;

-- 2. Verificar que la función get_user_data_for_recovery funciona
SELECT 'Probando función get_user_data_for_recovery...' as test_step;

SELECT * FROM get_user_data_for_recovery('andresjgsalzate@gmail.com');

-- 3. Verificar configuraciones SMTP básicas
SELECT 'Verificando configuraciones SMTP básicas...' as test_step;

SELECT 
    "key",
    value,
    description
FROM system_configurations 
WHERE category = 'smtp' AND is_active = true
ORDER BY "key";

-- 4. Verificar que se pueden crear tokens de password reset
SELECT 'Probando creación de token de password reset...' as test_step;

SELECT create_password_reset_token(
    'andresjgsalzate@gmail.com',
    'test_token_12345',
    NOW() + INTERVAL '24 hours'
) as token_creation_test;

-- 5. Verificar permisos en email_logs
SELECT 'Verificando permisos en email_logs...' as test_step;

SELECT count(*) as total_policies
FROM pg_policies 
WHERE tablename = 'email_logs';

-- Resultado esperado:
-- - smtp_password_test: debería mostrar 'B6vIP!h?OM/'
-- - get_user_data_for_recovery: debería mostrar email y full_name del usuario
-- - configuraciones SMTP: host, port, username, sender_email, sender_name, use_ssl
-- - token_creation_test: debería mostrar un UUID
-- - total_policies: debería mostrar 5 políticas
