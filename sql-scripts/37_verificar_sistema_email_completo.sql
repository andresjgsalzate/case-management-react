-- Script de verificación completa del sistema de emails SMTP
-- Ejecutar en Supabase SQL Editor para verificar configuraciones

-- =================================================
-- 1. VERIFICAR CONFIGURACIONES SMTP BÁSICAS
-- =================================================
SELECT 
    '1. CONFIGURACIONES SMTP BÁSICAS' as section,
    category,
    key,
    value,
    description,
    is_active
FROM system_configurations 
WHERE category = 'smtp' 
ORDER BY key;

-- =================================================
-- 2. VERIFICAR CONTRASEÑA SMTP SEGURA
-- =================================================
SELECT 
    '2. CREDENCIAL SMTP SEGURA' as section,
    credential_key,
    description,
    is_active,
    created_at,
    CASE 
        WHEN encrypted_value IS NOT NULL THEN 'Configurada ✅'
        ELSE 'No configurada ❌'
    END as status
FROM smtp_credentials 
WHERE credential_key = 'smtp_password';

-- =================================================
-- 3. PROBAR FUNCIÓN DE DESENCRIPTACIÓN
-- =================================================
SELECT 
    '3. PRUEBA DESENCRIPTACIÓN' as section,
    get_decrypted_credential('smtp_password') as smtp_password_value,
    CASE 
        WHEN get_decrypted_credential('smtp_password') IS NOT NULL 
        AND get_decrypted_credential('smtp_password') != 'CHANGE_THIS_PASSWORD'
        THEN 'Password OK ✅'
        ELSE 'Password problema ❌'
    END as password_status;

-- =================================================
-- 4. VERIFICAR CONFIGURACIONES DE URL
-- =================================================
SELECT 
    '4. CONFIGURACIONES URL' as section,
    key,
    value,
    description
FROM system_configurations 
WHERE category = 'urls' 
ORDER BY key;

-- =================================================
-- 5. VERIFICAR LÍMITES DE EMAIL
-- =================================================
SELECT 
    '5. LÍMITES DE EMAIL' as section,
    key,
    value,
    description
FROM system_configurations 
WHERE category = 'email_limits' 
ORDER BY key;

-- =================================================
-- 6. VERIFICAR TEMPLATES DE EMAIL
-- =================================================
SELECT 
    '6. TEMPLATES DE EMAIL' as section,
    template_type,
    template_name,
    is_active,
    is_default,
    created_at
FROM email_templates 
WHERE is_active = true
ORDER BY template_type;

-- =================================================
-- 7. VERIFICAR LOGS DE EMAIL RECIENTES
-- =================================================
SELECT 
    '7. LOGS DE EMAIL RECIENTES (últimos 5)' as section,
    email_type,
    recipient_email,
    status,
    error_message,
    created_at
FROM email_logs 
ORDER BY created_at DESC 
LIMIT 5;

-- =================================================
-- 8. ESTADÍSTICAS DE EMAILS POR ESTADO
-- =================================================
SELECT 
    '8. ESTADÍSTICAS POR ESTADO' as section,
    status,
    COUNT(*) as total,
    MIN(created_at) as primer_email,
    MAX(created_at) as ultimo_email
FROM email_logs 
GROUP BY status
ORDER BY total DESC;

-- =================================================
-- 9. VERIFICAR FUNCIONES RPC NECESARIAS
-- =================================================
SELECT 
    '9. FUNCIONES RPC DISPONIBLES' as section,
    proname as function_name,
    CASE 
        WHEN proname = 'get_decrypted_credential' THEN 'Para obtener password SMTP ✅'
        WHEN proname = 'get_user_data_for_recovery' THEN 'Para recovery de password ✅'
        WHEN proname = 'create_password_reset_token' THEN 'Para crear tokens de reset ✅'
        ELSE 'Otra función'
    END as purpose
FROM pg_proc 
WHERE proname IN (
    'get_decrypted_credential',
    'get_user_data_for_recovery', 
    'create_password_reset_token'
)
ORDER BY proname;

-- =================================================
-- 10. RESUMEN GENERAL DEL SISTEMA
-- =================================================
SELECT 
    '10. RESUMEN GENERAL' as section,
    'Configuraciones SMTP' as item,
    COUNT(*) as cantidad,
    CASE WHEN COUNT(*) >= 6 THEN '✅ OK' ELSE '❌ Incompletas' END as status
FROM system_configurations 
WHERE category = 'smtp' AND is_active = true

UNION ALL

SELECT 
    '10. RESUMEN GENERAL' as section,
    'Credencial SMTP' as item,
    COUNT(*) as cantidad,
    CASE WHEN COUNT(*) = 1 THEN '✅ OK' ELSE '❌ No configurada' END as status
FROM smtp_credentials 
WHERE credential_key = 'smtp_password' AND is_active = true

UNION ALL

SELECT 
    '10. RESUMEN GENERAL' as section,
    'Templates activos' as item,
    COUNT(*) as cantidad,
    CASE WHEN COUNT(*) >= 4 THEN '✅ OK' ELSE '⚠️ Pocos templates' END as status
FROM email_templates 
WHERE is_active = true

UNION ALL

SELECT 
    '10. RESUMEN GENERAL' as section,
    'Total emails enviados' as item,
    COUNT(*) as cantidad,
    CASE 
        WHEN COUNT(*) = 0 THEN '💤 Sin actividad'
        WHEN COUNT(*) < 10 THEN '📊 Poca actividad'
        ELSE '📈 Actividad normal'
    END as status
FROM email_logs;

-- =================================================
-- MENSAJE FINAL
-- =================================================
SELECT 
    '🎯 SISTEMA DE VERIFICACIÓN COMPLETADO' as mensaje,
    NOW() as fecha_verificacion,
    'Revisa los resultados arriba para identificar cualquier problema' as instrucciones;
