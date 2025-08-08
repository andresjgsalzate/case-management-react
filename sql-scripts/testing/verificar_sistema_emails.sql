-- ========================================
-- SCRIPT DE VERIFICACIÓN SISTEMA EMAILS
-- ========================================

-- 1. Verificar que las tablas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('system_configurations', 'email_templates', 'email_logs');

-- 2. Verificar permisos insertados
SELECT name, description, resource, action 
FROM permissions 
WHERE resource IN ('system_configurations', 'email_templates', 'email_logs', 'email_sending');

-- 3. Verificar configuraciones iniciales
SELECT category, "key", value, data_type, description 
FROM system_configurations 
ORDER BY category, "key";

-- 4. Verificar templates iniciales
SELECT template_type, template_name, subject, is_active, is_default 
FROM email_templates;

-- 5. Verificar funciones
SELECT proname, prorettype::regtype 
FROM pg_proc 
WHERE proname IN ('get_system_config', 'get_active_email_template');

-- 6. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('system_configurations', 'email_templates', 'email_logs');

-- 7. Test básico de funciones
SELECT get_system_config('smtp', 'host') as smtp_host;
SELECT get_system_config('urls', 'base_url_production') as prod_url;
