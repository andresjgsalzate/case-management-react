-- =====================================================
-- Script para configurar permisos del rol Analista
-- Elimina permisos existentes y asigna permisos 'own'
-- =====================================================

-- Eliminar todos los permisos existentes del rol Analista
DELETE FROM role_permissions 
WHERE role_id = 'b2e20a71-9268-4b06-8ec3-a776446af064';

-- Insertar permisos 'own' para el rol Analista
-- El analista puede gestionar todo lo que le pertenece EXCEPTO administración
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    'b2e20a71-9268-4b06-8ec3-a776446af064' as role_id,
    id as permission_id
FROM permissions 
WHERE scope = 'own' 
AND is_active = true
AND action != 'admin'  -- Excluir permisos de administración
AND resource NOT IN (   -- Excluir recursos administrativos
    'roles',
    'permissions', 
    'role_permissions',
    'users',
    'config',
    'backups',
    'maintenance',
    'api_keys',
    'integrations',
    'webhooks',
    'system_analysis',
    'audit',
    'logs'
);

-- Verificar los permisos asignados
SELECT 
    r.name as role_name,
    p.name as permission_name,
    p.description as permission_description,
    p.resource,
    p.action,
    p.scope
FROM role_permissions rp
JOIN roles r ON r.id = rp.role_id
JOIN permissions p ON p.id = rp.permission_id
WHERE r.name = 'Analista'
ORDER BY p.resource, p.action;

-- Mostrar resumen de permisos por recurso
SELECT 
    p.resource,
    COUNT(*) as total_permisos
FROM role_permissions rp
JOIN permissions p ON p.id = rp.permission_id
WHERE rp.role_id = 'b2e20a71-9268-4b06-8ec3-a776446af064'
GROUP BY p.resource
ORDER BY p.resource;

-- Comentarios sobre los permisos asignados:
-- ============================================
-- El rol Analista tendrá permisos 'own' en:
--
-- CASOS Y CONTROL DE CASOS:
-- • case_control.assign_own - Asignar sus propios casos al control
-- • case_control.manual_time_own - Gestionar tiempo manual de sus propios casos
-- • case_control.read_own - Ver control de sus propios casos
-- • case_control.reports_own - Ver reportes de sus propios casos
-- • case_control.timer_own - Controlar timer de sus propios casos
-- • case_control.update_status_own - Actualizar estado de sus propios casos
-- • cases.create_own - Crear casos propios
-- • cases.delete_own - Eliminar solo sus propios casos
-- • cases.read_own - Ver solo sus propios casos
-- • cases.update_own - Editar solo sus propios casos
--
-- ARCHIVO:
-- • archive.analytics_own - Ver análisis de elementos archivados propios
-- • archive.delete_own - Eliminar permanentemente elementos archivados propios
-- • archive.export_own - Exportar elementos archivados propios
-- • archive.read_own - Leer elementos archivados propios
-- • archive.restore_own - Restaurar elementos archivados propios
-- • archive.view_own - Ver elementos archivados propios
--
-- DASHBOARD Y MÉTRICAS:
-- • dashboard.export_own - Exportar sus propios datos
-- • dashboard.read_own - Ver sus propias métricas y estadísticas
-- • performance.read_own - Ver métricas de rendimiento propias
--
-- DISPOSICIONES:
-- • disposiciones.create_own - Crear disposiciones propias
-- • disposiciones.delete_own - Eliminar solo sus propias disposiciones
-- • disposiciones.export_own - Exportar sus propias disposiciones
-- • disposiciones.read_own - Ver solo sus propias disposiciones
-- • disposiciones.update_own - Editar solo sus propias disposiciones
--
-- TIPOS DE DOCUMENTOS:
-- • document_types.create_own - Crear tipos de documentos personales
-- • document_types.delete_own - Eliminar tipos de documentos que creó
-- • document_types.read_own - Ver tipos de documentos que creó
-- • document_types.update_own - Actualizar tipos de documentos que creó
--
-- DOCUMENTACIÓN:
-- • documentation.analytics_own - Ver analytics propios
-- • documentation.archive_own - Archivar documentos propios
-- • documentation.category_own - Gestionar categorías propias
-- • documentation.create_own - Crear documentos propios
-- • documentation.delete_own - Eliminar documentos propios
-- • documentation.export_own - Exportar documentos propios
-- • documentation.feedback_own - Gestionar feedback propio
-- • documentation.publish_own - Publicar documentos propios
-- • documentation.read_own - Ver documentos propios
-- • documentation.template_own - Gestionar templates propios
-- • documentation.update_own - Actualizar documentos propios
--
-- NOTAS:
-- • notes.archive_own - Archivar notas propias
-- • notes.assign_own - Asignarse notas a sí mismo
-- • notes.associate_cases_own - Asociar notas propias con casos
-- • notes.create_own - Crear notas propias
-- • notes.delete_own - Eliminar notas propias
-- • notes.export_own - Exportar notas propias
-- • notes.manage_tags_own - Gestionar tags propios
-- • notes.read_own - Ver notas propias
-- • notes.update_own - Actualizar notas propias
--
-- NOTIFICACIONES:
-- • notification_settings.read_own - Ver configuración de notificaciones propias
-- • notification_settings.update_own - Actualizar configuración de notificaciones propias
-- • notifications.create_own - Crear notificaciones propias
-- • notifications.delete_own - Eliminar notificaciones propias
-- • notifications.read_own - Ver notificaciones propias
-- • notifications.update_own - Actualizar notificaciones propias
--
-- SOLUCIONES:
-- • solution_categories.create_own - Crear categorías de soluciones propias
-- • solution_categories.delete_own - Eliminar categorías de soluciones propias
-- • solution_categories.read_own - Ver categorías de soluciones propias
-- • solution_categories.update_own - Actualizar categorías de soluciones propias
-- • solution_documents.create_own - Crear documentos de soluciones propios
-- • solution_documents.delete_own - Eliminar documentos de soluciones propios
-- • solution_documents.publish_own - Publicar documentos de soluciones propios
-- • solution_documents.read_own - Ver documentos de soluciones propios
-- • solution_documents.update_own - Actualizar documentos de soluciones propios
-- • solution_feedback.create_own - Crear feedback en soluciones propias
-- • solution_feedback.moderate_own - Moderar feedback en soluciones propias
-- • solution_feedback.read_own - Ver feedback de soluciones propias
--
-- ETIQUETAS:
-- • tags.create_own - Crear etiquetas personales
-- • tags.delete_own - Eliminar sus propias etiquetas
-- • tags.read_own - Ver sus propias etiquetas
-- • tags.update_own - Actualizar sus propias etiquetas
--
-- PLANTILLAS:
-- • templates.create_own - Crear plantillas propias
-- • templates.delete_own - Eliminar plantillas propias
-- • templates.read_own - Ver plantillas propias
-- • templates.update_own - Actualizar plantillas propias
--
-- TODOS:
-- • todos.assign_own - Asignarse TODOs a sí mismo
-- • todos.control_own - Controlar propios TODOs
-- • todos.create_own - Crear TODOs propios
-- • todos.delete_own - Eliminar propios TODOs
-- • todos.read_own - Ver propios TODOs
-- • todos.update_own - Actualizar propios TODOs
--
-- WORKFLOWS:
-- • workflows.execute_own - Ejecutar workflows en recursos propios
--
-- ❌ PERMISOS EXCLUIDOS (NO DISPONIBLES PARA ANALISTA):
-- • Todos los permisos con action = 'admin' (administración)
-- • Gestión de roles, permisos y usuarios
-- • Configuraciones del sistema
-- • Backups y mantenimiento
-- • API Keys y integraciones
-- • Webhooks y análisis del sistema
-- • Auditoría y logs del sistema

COMMIT;
