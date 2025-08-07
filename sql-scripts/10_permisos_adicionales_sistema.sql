-- ================================================================
-- PERMISOS ADICIONALES PARA FUNCIONALIDADES ESPECÍFICAS DEL SISTEMA
-- ================================================================
-- Descripción: Permisos adicionales identificados en el análisis del código
-- Sistema: Permisos granulares con formato "modulo.accion_scope"
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- VERIFICACIÓN INICIAL
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  AGREGANDO PERMISOS ADICIONALES';
    RAISE NOTICE '  PARA FUNCIONALIDADES ESPECÍFICAS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE '';
END $$;

-- ================================================================
-- PERMISOS PARA SOLUCIONES Y CATEGORÍAS DE DOCUMENTACIÓN
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES
-- Categorías de soluciones
('solution_categories.read_own', 'Ver categorías de soluciones propias', 'solution_categories', 'read', 'own', true),
('solution_categories.read_team', 'Ver categorías de soluciones del equipo', 'solution_categories', 'read', 'team', true),
('solution_categories.read_all', 'Ver todas las categorías de soluciones', 'solution_categories', 'read', 'all', true),
('solution_categories.create_own', 'Crear categorías de soluciones propias', 'solution_categories', 'create', 'own', true),
('solution_categories.create_team', 'Crear categorías de soluciones para el equipo', 'solution_categories', 'create', 'team', true),
('solution_categories.create_all', 'Crear categorías de soluciones globales', 'solution_categories', 'create', 'all', true),
('solution_categories.update_own', 'Actualizar categorías de soluciones propias', 'solution_categories', 'update', 'own', true),
('solution_categories.update_team', 'Actualizar categorías de soluciones del equipo', 'solution_categories', 'update', 'team', true),
('solution_categories.update_all', 'Actualizar todas las categorías de soluciones', 'solution_categories', 'update', 'all', true),
('solution_categories.delete_own', 'Eliminar categorías de soluciones propias', 'solution_categories', 'delete', 'own', true),
('solution_categories.delete_team', 'Eliminar categorías de soluciones del equipo', 'solution_categories', 'delete', 'team', true),
('solution_categories.delete_all', 'Eliminar todas las categorías de soluciones', 'solution_categories', 'delete', 'all', true),
('solution_categories.admin_own', 'Administración completa de categorías propias', 'solution_categories', 'admin', 'own', true),
('solution_categories.admin_team', 'Administración completa de categorías del equipo', 'solution_categories', 'admin', 'team', true),
('solution_categories.admin_all', 'Administración completa de todas las categorías', 'solution_categories', 'admin', 'all', true),

-- Documentos de soluciones
('solution_documents.read_own', 'Ver documentos de soluciones propios', 'solution_documents', 'read', 'own', true),
('solution_documents.read_team', 'Ver documentos de soluciones del equipo', 'solution_documents', 'read', 'team', true),
('solution_documents.read_all', 'Ver todos los documentos de soluciones', 'solution_documents', 'read', 'all', true),
('solution_documents.create_own', 'Crear documentos de soluciones propios', 'solution_documents', 'create', 'own', true),
('solution_documents.create_team', 'Crear documentos de soluciones para el equipo', 'solution_documents', 'create', 'team', true),
('solution_documents.create_all', 'Crear documentos de soluciones globales', 'solution_documents', 'create', 'all', true),
('solution_documents.update_own', 'Actualizar documentos de soluciones propios', 'solution_documents', 'update', 'own', true),
('solution_documents.update_team', 'Actualizar documentos de soluciones del equipo', 'solution_documents', 'update', 'team', true),
('solution_documents.update_all', 'Actualizar todos los documentos de soluciones', 'solution_documents', 'update', 'all', true),
('solution_documents.delete_own', 'Eliminar documentos de soluciones propios', 'solution_documents', 'delete', 'own', true),
('solution_documents.delete_team', 'Eliminar documentos de soluciones del equipo', 'solution_documents', 'delete', 'team', true),
('solution_documents.delete_all', 'Eliminar todos los documentos de soluciones', 'solution_documents', 'delete', 'all', true),
('solution_documents.publish_own', 'Publicar documentos de soluciones propios', 'solution_documents', 'publish', 'own', true),
('solution_documents.publish_team', 'Publicar documentos de soluciones del equipo', 'solution_documents', 'publish', 'team', true),
('solution_documents.publish_all', 'Publicar todos los documentos de soluciones', 'solution_documents', 'publish', 'all', true),
('solution_documents.admin_own', 'Administración completa de documentos propios', 'solution_documents', 'admin', 'own', true),
('solution_documents.admin_team', 'Administración completa de documentos del equipo', 'solution_documents', 'admin', 'team', true),
('solution_documents.admin_all', 'Administración completa de todos los documentos', 'solution_documents', 'admin', 'all', true),

-- Feedback de soluciones
('solution_feedback.read_own', 'Ver feedback de soluciones propias', 'solution_feedback', 'read', 'own', true),
('solution_feedback.read_team', 'Ver feedback de soluciones del equipo', 'solution_feedback', 'read', 'team', true),
('solution_feedback.read_all', 'Ver todo el feedback de soluciones', 'solution_feedback', 'read', 'all', true),
('solution_feedback.create_own', 'Crear feedback en soluciones propias', 'solution_feedback', 'create', 'own', true),
('solution_feedback.create_team', 'Crear feedback en soluciones del equipo', 'solution_feedback', 'create', 'team', true),
('solution_feedback.create_all', 'Crear feedback en todas las soluciones', 'solution_feedback', 'create', 'all', true),
('solution_feedback.moderate_own', 'Moderar feedback en soluciones propias', 'solution_feedback', 'moderate', 'own', true),
('solution_feedback.moderate_team', 'Moderar feedback en soluciones del equipo', 'solution_feedback', 'moderate', 'team', true),
('solution_feedback.moderate_all', 'Moderar todo el feedback de soluciones', 'solution_feedback', 'moderate', 'all', true);

-- ================================================================
-- PERMISOS PARA SISTEMA DE AUDITORÍA Y LOGS
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES
-- Auditoría
('audit.read_own', 'Ver auditoría de actividades propias', 'audit', 'read', 'own', true),
('audit.read_team', 'Ver auditoría de actividades del equipo', 'audit', 'read', 'team', true),
('audit.read_all', 'Ver toda la auditoría del sistema', 'audit', 'read', 'all', true),
('audit.export_own', 'Exportar auditoría de actividades propias', 'audit', 'export', 'own', true),
('audit.export_team', 'Exportar auditoría de actividades del equipo', 'audit', 'export', 'team', true),
('audit.export_all', 'Exportar toda la auditoría del sistema', 'audit', 'export', 'all', true),
('audit.admin_all', 'Administración completa de auditoría', 'audit', 'admin', 'all', true),

-- Logs del sistema
('logs.read_own', 'Ver logs de actividades propias', 'logs', 'read', 'own', true),
('logs.read_team', 'Ver logs de actividades del equipo', 'logs', 'read', 'team', true),
('logs.read_all', 'Ver todos los logs del sistema', 'logs', 'read', 'all', true),
('logs.export_all', 'Exportar logs del sistema', 'logs', 'export', 'all', true),
('logs.admin_all', 'Administración completa de logs', 'logs', 'admin', 'all', true);

-- ================================================================
-- PERMISOS PARA SISTEMA DE NOTIFICACIONES
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES
-- Notificaciones
('notifications.read_own', 'Ver notificaciones propias', 'notifications', 'read', 'own', true),
('notifications.create_own', 'Crear notificaciones propias', 'notifications', 'create', 'own', true),
('notifications.create_team', 'Crear notificaciones para el equipo', 'notifications', 'create', 'team', true),
('notifications.create_all', 'Crear notificaciones globales', 'notifications', 'create', 'all', true),
('notifications.update_own', 'Actualizar notificaciones propias', 'notifications', 'update', 'own', true),
('notifications.delete_own', 'Eliminar notificaciones propias', 'notifications', 'delete', 'own', true),
('notifications.admin_own', 'Administración completa de notificaciones propias', 'notifications', 'admin', 'own', true),
('notifications.admin_team', 'Administración completa de notificaciones del equipo', 'notifications', 'admin', 'team', true),
('notifications.admin_all', 'Administración completa de todas las notificaciones', 'notifications', 'admin', 'all', true),

-- Configuración de notificaciones
('notification_settings.read_own', 'Ver configuración de notificaciones propias', 'notification_settings', 'read', 'own', true),
('notification_settings.update_own', 'Actualizar configuración de notificaciones propias', 'notification_settings', 'update', 'own', true),
('notification_settings.admin_team', 'Administrar configuración de notificaciones del equipo', 'notification_settings', 'admin', 'team', true),
('notification_settings.admin_all', 'Administrar configuración global de notificaciones', 'notification_settings', 'admin', 'all', true);

-- ================================================================
-- PERMISOS PARA SISTEMA DE TEMPLATES Y PLANTILLAS
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES
-- Templates
('templates.read_own', 'Ver plantillas propias', 'templates', 'read', 'own', true),
('templates.read_team', 'Ver plantillas del equipo', 'templates', 'read', 'team', true),
('templates.read_all', 'Ver todas las plantillas', 'templates', 'read', 'all', true),
('templates.create_own', 'Crear plantillas propias', 'templates', 'create', 'own', true),
('templates.create_team', 'Crear plantillas para el equipo', 'templates', 'create', 'team', true),
('templates.create_all', 'Crear plantillas globales', 'templates', 'create', 'all', true),
('templates.update_own', 'Actualizar plantillas propias', 'templates', 'update', 'own', true),
('templates.update_team', 'Actualizar plantillas del equipo', 'templates', 'update', 'team', true),
('templates.update_all', 'Actualizar todas las plantillas', 'templates', 'update', 'all', true),
('templates.delete_own', 'Eliminar plantillas propias', 'templates', 'delete', 'own', true),
('templates.delete_team', 'Eliminar plantillas del equipo', 'templates', 'delete', 'team', true),
('templates.delete_all', 'Eliminar todas las plantillas', 'templates', 'delete', 'all', true),
('templates.admin_own', 'Administración completa de plantillas propias', 'templates', 'admin', 'own', true),
('templates.admin_team', 'Administración completa de plantillas del equipo', 'templates', 'admin', 'team', true),
('templates.admin_all', 'Administración completa de todas las plantillas', 'templates', 'admin', 'all', true);

-- ================================================================
-- PERMISOS PARA SISTEMA DE WORKFLOWS
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES
-- Workflows
('workflows.read_own', 'Ver workflows propios', 'workflows', 'read', 'own', true),
('workflows.read_team', 'Ver workflows del equipo', 'workflows', 'read', 'team', true),
('workflows.read_all', 'Ver todos los workflows', 'workflows', 'read', 'all', true),
('workflows.create_team', 'Crear workflows para el equipo', 'workflows', 'create', 'team', true),
('workflows.create_all', 'Crear workflows globales', 'workflows', 'create', 'all', true),
('workflows.update_team', 'Actualizar workflows del equipo', 'workflows', 'update', 'team', true),
('workflows.update_all', 'Actualizar todos los workflows', 'workflows', 'update', 'all', true),
('workflows.delete_team', 'Eliminar workflows del equipo', 'workflows', 'delete', 'team', true),
('workflows.delete_all', 'Eliminar todos los workflows', 'workflows', 'delete', 'all', true),
('workflows.execute_own', 'Ejecutar workflows en recursos propios', 'workflows', 'execute', 'own', true),
('workflows.execute_team', 'Ejecutar workflows en recursos del equipo', 'workflows', 'execute', 'team', true),
('workflows.execute_all', 'Ejecutar workflows en todos los recursos', 'workflows', 'execute', 'all', true),
('workflows.admin_team', 'Administración completa de workflows del equipo', 'workflows', 'admin', 'team', true),
('workflows.admin_all', 'Administración completa de todos los workflows', 'workflows', 'admin', 'all', true);

-- ================================================================
-- PERMISOS PARA SISTEMA DE BACKUP Y MANTENIMIENTO
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES
-- Backups
('backups.read_all', 'Ver información de backups', 'backups', 'read', 'all', true),
('backups.create_all', 'Crear backups del sistema', 'backups', 'create', 'all', true),
('backups.restore_all', 'Restaurar backups del sistema', 'backups', 'restore', 'all', true),
('backups.delete_all', 'Eliminar backups antiguos', 'backups', 'delete', 'all', true),
('backups.admin_all', 'Administración completa de backups', 'backups', 'admin', 'all', true),

-- Mantenimiento del sistema
('maintenance.read_all', 'Ver estado de mantenimiento', 'maintenance', 'read', 'all', true),
('maintenance.schedule_all', 'Programar mantenimiento del sistema', 'maintenance', 'schedule', 'all', true),
('maintenance.execute_all', 'Ejecutar tareas de mantenimiento', 'maintenance', 'execute', 'all', true),
('maintenance.admin_all', 'Administración completa de mantenimiento', 'maintenance', 'admin', 'all', true);

-- ================================================================
-- PERMISOS PARA SISTEMA DE INTEGRATIONS Y API
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES
-- API Keys
('api_keys.read_own', 'Ver claves API propias', 'api_keys', 'read', 'own', true),
('api_keys.read_team', 'Ver claves API del equipo', 'api_keys', 'read', 'team', true),
('api_keys.read_all', 'Ver todas las claves API', 'api_keys', 'read', 'all', true),
('api_keys.create_own', 'Crear claves API propias', 'api_keys', 'create', 'own', true),
('api_keys.create_team', 'Crear claves API para el equipo', 'api_keys', 'create', 'team', true),
('api_keys.create_all', 'Crear claves API globales', 'api_keys', 'create', 'all', true),
('api_keys.update_own', 'Actualizar claves API propias', 'api_keys', 'update', 'own', true),
('api_keys.update_team', 'Actualizar claves API del equipo', 'api_keys', 'update', 'team', true),
('api_keys.update_all', 'Actualizar todas las claves API', 'api_keys', 'update', 'all', true),
('api_keys.delete_own', 'Eliminar claves API propias', 'api_keys', 'delete', 'own', true),
('api_keys.delete_team', 'Eliminar claves API del equipo', 'api_keys', 'delete', 'team', true),
('api_keys.delete_all', 'Eliminar todas las claves API', 'api_keys', 'delete', 'all', true),
('api_keys.admin_all', 'Administración completa de claves API', 'api_keys', 'admin', 'all', true),

-- Integraciones
('integrations.read_all', 'Ver integraciones del sistema', 'integrations', 'read', 'all', true),
('integrations.create_all', 'Crear nuevas integraciones', 'integrations', 'create', 'all', true),
('integrations.update_all', 'Actualizar integraciones', 'integrations', 'update', 'all', true),
('integrations.delete_all', 'Eliminar integraciones', 'integrations', 'delete', 'all', true),
('integrations.test_all', 'Probar integraciones', 'integrations', 'test', 'all', true),
('integrations.admin_all', 'Administración completa de integraciones', 'integrations', 'admin', 'all', true),

-- Webhooks
('webhooks.read_team', 'Ver webhooks del equipo', 'webhooks', 'read', 'team', true),
('webhooks.read_all', 'Ver todos los webhooks', 'webhooks', 'read', 'all', true),
('webhooks.create_team', 'Crear webhooks para el equipo', 'webhooks', 'create', 'team', true),
('webhooks.create_all', 'Crear webhooks globales', 'webhooks', 'create', 'all', true),
('webhooks.update_team', 'Actualizar webhooks del equipo', 'webhooks', 'update', 'team', true),
('webhooks.update_all', 'Actualizar todos los webhooks', 'webhooks', 'update', 'all', true),
('webhooks.delete_team', 'Eliminar webhooks del equipo', 'webhooks', 'delete', 'team', true),
('webhooks.delete_all', 'Eliminar todos los webhooks', 'webhooks', 'delete', 'all', true),
('webhooks.test_team', 'Probar webhooks del equipo', 'webhooks', 'test', 'team', true),
('webhooks.test_all', 'Probar todos los webhooks', 'webhooks', 'test', 'all', true),
('webhooks.admin_all', 'Administración completa de webhooks', 'webhooks', 'admin', 'all', true);

-- ================================================================
-- PERMISOS PARA SISTEMA DE MÉTRICAS Y PERFORMANCE
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES
-- Métricas de rendimiento
('performance.read_own', 'Ver métricas de rendimiento propias', 'performance', 'read', 'own', true),
('performance.read_team', 'Ver métricas de rendimiento del equipo', 'performance', 'read', 'team', true),
('performance.read_all', 'Ver todas las métricas de rendimiento', 'performance', 'read', 'all', true),
('performance.monitor_team', 'Monitorear rendimiento del equipo', 'performance', 'monitor', 'team', true),
('performance.monitor_all', 'Monitorear rendimiento del sistema', 'performance', 'monitor', 'all', true),
('performance.admin_all', 'Administración completa de métricas', 'performance', 'admin', 'all', true),

-- Análisis de sistema
('system_analysis.read_all', 'Ver análisis del sistema', 'system_analysis', 'read', 'all', true),
('system_analysis.generate_all', 'Generar análisis del sistema', 'system_analysis', 'generate', 'all', true),
('system_analysis.export_all', 'Exportar análisis del sistema', 'system_analysis', 'export', 'all', true),
('system_analysis.admin_all', 'Administración completa de análisis', 'system_analysis', 'admin', 'all', true);

-- ================================================================
-- CONFIRMACIÓN DE INSERCIÓN
-- ================================================================
DO $$
DECLARE
    total_nuevos_permisos INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_nuevos_permisos 
    FROM permissions 
    WHERE name LIKE 'solution_%' 
       OR name LIKE 'audit.%' 
       OR name LIKE 'logs.%' 
       OR name LIKE 'notifications.%'
       OR name LIKE 'notification_settings.%'
       OR name LIKE 'templates.%'
       OR name LIKE 'workflows.%'
       OR name LIKE 'backups.%'
       OR name LIKE 'maintenance.%'
       OR name LIKE 'api_keys.%'
       OR name LIKE 'integrations.%'
       OR name LIKE 'webhooks.%'
       OR name LIKE 'performance.%'
       OR name LIKE 'system_analysis.%';
    
    RAISE NOTICE '';
    RAISE NOTICE '✅ PERMISOS ADICIONALES AGREGADOS EXITOSAMENTE';
    RAISE NOTICE 'Total de permisos nuevos: %', total_nuevos_permisos;
    RAISE NOTICE '';
    RAISE NOTICE 'Recursos agregados:';
    RAISE NOTICE '- solution_categories (15 permisos)';
    RAISE NOTICE '- solution_documents (18 permisos)';
    RAISE NOTICE '- solution_feedback (9 permisos)';
    RAISE NOTICE '- audit (7 permisos)';
    RAISE NOTICE '- logs (5 permisos)';
    RAISE NOTICE '- notifications (9 permisos)';
    RAISE NOTICE '- notification_settings (4 permisos)';
    RAISE NOTICE '- templates (15 permisos)';
    RAISE NOTICE '- workflows (13 permisos)';
    RAISE NOTICE '- backups (5 permisos)';
    RAISE NOTICE '- maintenance (4 permisos)';
    RAISE NOTICE '- api_keys (12 permisos)';
    RAISE NOTICE '- integrations (6 permisos)';
    RAISE NOTICE '- webhooks (11 permisos)';
    RAISE NOTICE '- performance (6 permisos)';
    RAISE NOTICE '- system_analysis (4 permisos)';
    RAISE NOTICE '';
    RAISE NOTICE 'NOTA: Estos permisos complementan el sistema granular existente';
    RAISE NOTICE 'permitiendo un control más fino sobre funcionalidades específicas.';
    RAISE NOTICE '';
END $$;
