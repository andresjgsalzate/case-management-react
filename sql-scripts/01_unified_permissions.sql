-- =========================================
-- SCRIPT UNIFICADO: PERMISOS Y ROLES
-- Sistema de Gestión de Casos - Case Management
-- Fecha: 2025-08-08
-- Versión: 3.0 Unificado
-- =========================================

-- DESCRIPCIÓN:
-- Este script contiene TODOS los permisos, roles y configuraciones de acceso
-- necesarios para el sistema de gestión de casos.
-- 
-- PRERREQUISITOS:
-- - Las tablas del esquema base deben existir (ejecutar create_complete_schema.sql primero)
-- - El sistema de autenticación de Supabase debe estar configurado
--
-- USO:
-- Ejecutar este script completo en el editor SQL de Supabase/PostgreSQL

-- =========================================
-- 1. CREACIÓN DE ROLES BÁSICOS
-- =========================================

-- Eliminar roles existentes si existen (para reinstalación limpia)
DELETE FROM role_permissions WHERE role_id IN (
    SELECT id FROM roles WHERE name IN ('Administrador', 'Supervisor', 'Técnico', 'Invitado')
);
DELETE FROM roles WHERE name IN ('Administrador', 'Supervisor', 'Técnico', 'Invitado');

-- Insertar roles básicos del sistema
INSERT INTO roles (id, name, description, is_active) VALUES
('d5c8f4a2-1b3e-4f6a-8c9d-2e5f6a7b8c9d', 'Administrador', 'Acceso completo al sistema', true),
('e6d9f5b3-2c4f-5g7b-9d0e-3f6g7b8c9d0e', 'Supervisor', 'Supervisión de equipos y casos', true),
('f7e0g6c4-3d5g-6h8c-0e1f-4g7h8c9d0e1f', 'Técnico', 'Gestión de casos asignados', true),
('g8f1h7d5-4e6h-7i9d-1f2g-5h8i9d0e1f2g', 'Invitado', 'Solo lectura de información básica', true)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- =========================================
-- 2. PERMISOS BÁSICOS DEL SISTEMA
-- =========================================

-- Limpiar permisos existentes para reinstalación
DELETE FROM permissions WHERE resource IN (
    'cases', 'todos', 'time_entries', 'documentation', 'users', 'system', 
    'dashboard', 'reports', 'archive', 'search', 'disposiciones', 'notes',
    'solution_documents', 'workflows', 'webhooks', 'file_storage', 'emails'
);

-- PERMISOS DE CASOS
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES
-- Casos - Lectura
('cases.read_own', 'Ver casos propios', 'cases', 'read', 'own', true),
('cases.read_team', 'Ver casos del equipo', 'cases', 'read', 'team', true),
('cases.read_all', 'Ver todos los casos', 'cases', 'read', 'all', true),

-- Casos - Creación
('cases.create_own', 'Crear casos propios', 'cases', 'create', 'own', true),
('cases.create_team', 'Crear casos para el equipo', 'cases', 'create', 'team', true),
('cases.create_all', 'Crear casos para cualquiera', 'cases', 'create', 'all', true),

-- Casos - Actualización
('cases.update_own', 'Actualizar casos propios', 'cases', 'update', 'own', true),
('cases.update_team', 'Actualizar casos del equipo', 'cases', 'update', 'team', true),
('cases.update_all', 'Actualizar todos los casos', 'cases', 'update', 'all', true),

-- Casos - Eliminación
('cases.delete_own', 'Eliminar casos propios', 'cases', 'delete', 'own', true),
('cases.delete_team', 'Eliminar casos del equipo', 'cases', 'delete', 'team', true),
('cases.delete_all', 'Eliminar todos los casos', 'cases', 'delete', 'all', true),

-- Casos - Control especial
('cases.assign', 'Asignar casos a usuarios', 'cases', 'assign', 'team', true),
('cases.escalate', 'Escalar casos', 'cases', 'escalate', 'own', true),
('cases.archive', 'Archivar casos', 'cases', 'archive', 'own', true),
('cases.restore', 'Restaurar casos archivados', 'cases', 'restore', 'team', true),

-- PERMISOS DE TODOS/TAREAS
('todos.read_own', 'Ver TODOs propios', 'todos', 'read', 'own', true),
('todos.read_team', 'Ver TODOs del equipo', 'todos', 'read', 'team', true),
('todos.read_all', 'Ver todos los TODOs', 'todos', 'read', 'all', true),

('todos.create_own', 'Crear TODOs propios', 'todos', 'create', 'own', true),
('todos.create_team', 'Crear TODOs para el equipo', 'todos', 'create', 'team', true),
('todos.create_all', 'Crear TODOs para cualquiera', 'todos', 'create', 'all', true),

('todos.update_own', 'Actualizar TODOs propios', 'todos', 'update', 'own', true),
('todos.update_team', 'Actualizar TODOs del equipo', 'todos', 'update', 'team', true),
('todos.update_all', 'Actualizar todos los TODOs', 'todos', 'update', 'all', true),

('todos.delete_own', 'Eliminar TODOs propios', 'todos', 'delete', 'own', true),
('todos.delete_team', 'Eliminar TODOs del equipo', 'todos', 'delete', 'team', true),
('todos.delete_all', 'Eliminar todos los TODOs', 'todos', 'delete', 'all', true),

('todos.assign', 'Asignar TODOs a usuarios', 'todos', 'assign', 'team', true),
('todos.complete', 'Completar TODOs', 'todos', 'complete', 'own', true),
('todos.archive', 'Archivar TODOs', 'todos', 'archive', 'own', true),

-- PERMISOS DE CONTROL DE TIEMPO
('time_entries.read_own', 'Ver registros de tiempo propios', 'time_entries', 'read', 'own', true),
('time_entries.read_team', 'Ver registros de tiempo del equipo', 'time_entries', 'read', 'team', true),
('time_entries.read_all', 'Ver todos los registros de tiempo', 'time_entries', 'read', 'all', true),

('time_entries.create_own', 'Crear registros de tiempo propios', 'time_entries', 'create', 'own', true),
('time_entries.create_team', 'Crear registros de tiempo del equipo', 'time_entries', 'create', 'team', true),
('time_entries.create_all', 'Crear registros de tiempo para cualquiera', 'time_entries', 'create', 'all', true),

('time_entries.update_own', 'Actualizar registros de tiempo propios', 'time_entries', 'update', 'own', true),
('time_entries.update_team', 'Actualizar registros de tiempo del equipo', 'time_entries', 'update', 'team', true),
('time_entries.update_all', 'Actualizar todos los registros de tiempo', 'time_entries', 'update', 'all', true),

('time_entries.delete_own', 'Eliminar registros de tiempo propios', 'time_entries', 'delete', 'own', true),
('time_entries.delete_team', 'Eliminar registros de tiempo del equipo', 'time_entries', 'delete', 'team', true),
('time_entries.delete_all', 'Eliminar todos los registros de tiempo', 'time_entries', 'delete', 'all', true),

-- PERMISOS DE DOCUMENTACIÓN
('documentation.read_all', 'Ver toda la documentación', 'documentation', 'read', 'all', true),
('documentation.create_all', 'Crear documentación', 'documentation', 'create', 'all', true),
('documentation.update_all', 'Actualizar documentación', 'documentation', 'update', 'all', true),
('documentation.delete_all', 'Eliminar documentación', 'documentation', 'delete', 'all', true),
('documentation.publish', 'Publicar documentación', 'documentation', 'publish', 'all', true),
('documentation.feedback', 'Dar feedback en documentación', 'documentation', 'feedback', 'all', true),

-- PERMISOS DE USUARIOS Y ADMINISTRACIÓN
('users.read_all', 'Ver todos los usuarios', 'users', 'read', 'all', true),
('users.create_all', 'Crear usuarios', 'users', 'create', 'all', true),
('users.update_all', 'Actualizar usuarios', 'users', 'update', 'all', true),
('users.delete_all', 'Eliminar usuarios', 'users', 'delete', 'all', true),
('users.assign_roles', 'Asignar roles a usuarios', 'users', 'assign_roles', 'all', true),

-- PERMISOS DE SISTEMA
('system.read_configs', 'Ver configuraciones del sistema', 'system', 'read', 'all', true),
('system.update_configs', 'Actualizar configuraciones del sistema', 'system', 'update', 'all', true),
('system.backup', 'Realizar respaldos', 'system', 'backup', 'all', true),
('system.restore', 'Restaurar respaldos', 'system', 'restore', 'all', true),

-- PERMISOS DE DASHBOARD Y REPORTES
('dashboard.view_metrics', 'Ver métricas del dashboard', 'dashboard', 'view', 'team', true),
('dashboard.view_all_metrics', 'Ver todas las métricas', 'dashboard', 'view', 'all', true),

('reports.generate_own', 'Generar reportes propios', 'reports', 'generate', 'own', true),
('reports.generate_team', 'Generar reportes del equipo', 'reports', 'generate', 'team', true),
('reports.generate_all', 'Generar todos los reportes', 'reports', 'generate', 'all', true),
('reports.export', 'Exportar reportes', 'reports', 'export', 'team', true),

-- PERMISOS DE ARCHIVO
('archive.view_own', 'Ver archivo propio', 'archive', 'view', 'own', true),
('archive.view_team', 'Ver archivo del equipo', 'archive', 'view', 'team', true),
('archive.view_all', 'Ver todo el archivo', 'archive', 'view', 'all', true),
('archive.create_own', 'Archivar elementos propios', 'archive', 'create', 'own', true),
('archive.create_team', 'Archivar elementos del equipo', 'archive', 'create', 'team', true),
('archive.create_all', 'Archivar cualquier elemento', 'archive', 'create', 'all', true),
('archive.restore_own', 'Restaurar elementos propios', 'archive', 'restore', 'own', true),
('archive.restore_team', 'Restaurar elementos del equipo', 'archive', 'restore', 'team', true),
('archive.restore_all', 'Restaurar cualquier elemento', 'archive', 'restore', 'all', true),

-- PERMISOS DE BÚSQUEDA
('search.basic', 'Búsqueda básica', 'search', 'basic', 'own', true),
('search.advanced', 'Búsqueda avanzada', 'search', 'advanced', 'team', true),
('search.global', 'Búsqueda global', 'search', 'global', 'all', true),

-- PERMISOS DE DISPOSICIONES
('disposiciones.read_own', 'Ver disposiciones propias', 'disposiciones', 'read', 'own', true),
('disposiciones.read_team', 'Ver disposiciones del equipo', 'disposiciones', 'read', 'team', true),
('disposiciones.read_all', 'Ver todas las disposiciones', 'disposiciones', 'read', 'all', true),
('disposiciones.create_own', 'Crear disposiciones propias', 'disposiciones', 'create', 'own', true),
('disposiciones.create_team', 'Crear disposiciones del equipo', 'disposiciones', 'create', 'team', true),
('disposiciones.create_all', 'Crear disposiciones para cualquiera', 'disposiciones', 'create', 'all', true),
('disposiciones.update_own', 'Actualizar disposiciones propias', 'disposiciones', 'update', 'own', true),
('disposiciones.update_team', 'Actualizar disposiciones del equipo', 'disposiciones', 'update', 'team', true),
('disposiciones.update_all', 'Actualizar todas las disposiciones', 'disposiciones', 'update', 'all', true),
('disposiciones.delete_own', 'Eliminar disposiciones propias', 'disposiciones', 'delete', 'own', true),
('disposiciones.delete_team', 'Eliminar disposiciones del equipo', 'disposiciones', 'delete', 'team', true),
('disposiciones.delete_all', 'Eliminar todas las disposiciones', 'disposiciones', 'delete', 'all', true),

-- PERMISOS DE NOTAS
('notes.read_own', 'Ver notas propias', 'notes', 'read', 'own', true),
('notes.read_team', 'Ver notas del equipo', 'notes', 'read', 'team', true),
('notes.read_all', 'Ver todas las notas', 'notes', 'read', 'all', true),
('notes.create_own', 'Crear notas propias', 'notes', 'create', 'own', true),
('notes.create_team', 'Crear notas del equipo', 'notes', 'create', 'team', true),
('notes.create_all', 'Crear notas para cualquiera', 'notes', 'create', 'all', true),
('notes.update_own', 'Actualizar notas propias', 'notes', 'update', 'own', true),
('notes.update_team', 'Actualizar notas del equipo', 'notes', 'update', 'team', true),
('notes.update_all', 'Actualizar todas las notas', 'notes', 'update', 'all', true),
('notes.delete_own', 'Eliminar notas propias', 'notes', 'delete', 'own', true),
('notes.delete_team', 'Eliminar notas del equipo', 'notes', 'delete', 'team', true),
('notes.delete_all', 'Eliminar todas las notas', 'notes', 'delete', 'all', true),

-- PERMISOS ADICIONALES DEL SISTEMA
('solution_documents.read_all', 'Ver todos los documentos de soluciones', 'solution_documents', 'read', 'all', true),
('solution_documents.create_all', 'Crear documentos de soluciones', 'solution_documents', 'create', 'all', true),
('solution_documents.update_all', 'Actualizar todos los documentos de soluciones', 'solution_documents', 'update', 'all', true),
('solution_documents.delete_all', 'Eliminar documentos de soluciones', 'solution_documents', 'delete', 'all', true),

('workflows.read_all', 'Ver todos los workflows', 'workflows', 'read', 'all', true),
('workflows.create_all', 'Crear workflows', 'workflows', 'create', 'all', true),
('workflows.update_all', 'Actualizar todos los workflows', 'workflows', 'update', 'all', true),
('workflows.delete_all', 'Eliminar workflows', 'workflows', 'delete', 'all', true),
('workflows.execute', 'Ejecutar workflows', 'workflows', 'execute', 'team', true),

('webhooks.read_all', 'Ver todos los webhooks', 'webhooks', 'read', 'all', true),
('webhooks.create_all', 'Crear webhooks', 'webhooks', 'create', 'all', true),
('webhooks.update_all', 'Actualizar todos los webhooks', 'webhooks', 'update', 'all', true),
('webhooks.delete_all', 'Eliminar webhooks', 'webhooks', 'delete', 'all', true),

-- PERMISOS DE ALMACENAMIENTO DE ARCHIVOS
('file_storage.upload_own', 'Subir archivos propios', 'file_storage', 'upload', 'own', true),
('file_storage.upload_team', 'Subir archivos del equipo', 'file_storage', 'upload', 'team', true),
('file_storage.upload_all', 'Subir archivos para cualquiera', 'file_storage', 'upload', 'all', true),
('file_storage.download_own', 'Descargar archivos propios', 'file_storage', 'download', 'own', true),
('file_storage.download_team', 'Descargar archivos del equipo', 'file_storage', 'download', 'team', true),
('file_storage.download_all', 'Descargar todos los archivos', 'file_storage', 'download', 'all', true),
('file_storage.delete_own', 'Eliminar archivos propios', 'file_storage', 'delete', 'own', true),
('file_storage.delete_team', 'Eliminar archivos del equipo', 'file_storage', 'delete', 'team', true),
('file_storage.delete_all', 'Eliminar todos los archivos', 'file_storage', 'delete', 'all', true),

-- PERMISOS DE EMAILS
('emails.send_own', 'Enviar emails propios', 'emails', 'send', 'own', true),
('emails.send_team', 'Enviar emails del equipo', 'emails', 'send', 'team', true),
('emails.send_all', 'Enviar emails para cualquiera', 'emails', 'send', 'all', true),
('emails.read_logs', 'Ver logs de emails', 'emails', 'read_logs', 'team', true),
('emails.configure', 'Configurar sistema de emails', 'emails', 'configure', 'all', true);

-- =========================================
-- 3. ASIGNACIÓN DE PERMISOS A ROLES
-- =========================================

-- Limpiar asignaciones existentes
DELETE FROM role_permissions;

-- ADMINISTRADOR - Acceso completo a todo
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'Administrador'),
    id
FROM permissions 
WHERE scope = 'all' OR name IN (
    'cases.read_all', 'cases.create_all', 'cases.update_all', 'cases.delete_all',
    'todos.read_all', 'todos.create_all', 'todos.update_all', 'todos.delete_all',
    'time_entries.read_all', 'time_entries.create_all', 'time_entries.update_all', 'time_entries.delete_all',
    'users.read_all', 'users.create_all', 'users.update_all', 'users.delete_all', 'users.assign_roles',
    'system.read_configs', 'system.update_configs', 'system.backup', 'system.restore',
    'dashboard.view_all_metrics', 'reports.generate_all', 'reports.export',
    'archive.view_all', 'archive.create_all', 'archive.restore_all', 'search.global',
    'emails.configure'
);

-- SUPERVISOR - Gestión de equipo
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'Supervisor'),
    id
FROM permissions 
WHERE scope IN ('own', 'team') OR name IN (
    'cases.read_team', 'cases.create_team', 'cases.update_team', 'cases.assign',
    'todos.read_team', 'todos.create_team', 'todos.update_team', 'todos.assign',
    'time_entries.read_team', 'time_entries.create_team', 'time_entries.update_team',
    'dashboard.view_metrics', 'reports.generate_team', 'reports.export',
    'archive.view_team', 'archive.restore_team', 'search.advanced',
    'workflows.execute', 'emails.send_team', 'emails.read_logs'
);

-- TÉCNICO - Gestión de casos asignados
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'Técnico'),
    id
FROM permissions 
WHERE scope = 'own' OR name IN (
    'cases.read_own', 'cases.update_own', 'cases.escalate', 'cases.archive',
    'todos.read_own', 'todos.create_own', 'todos.update_own', 'todos.complete',
    'time_entries.read_own', 'time_entries.create_own', 'time_entries.update_own',
    'documentation.read_all', 'documentation.feedback',
    'reports.generate_own', 'search.basic',
    'archive.view_own', 'archive.restore_own',
    'disposiciones.read_own', 'disposiciones.create_own', 'disposiciones.update_own',
    'notes.read_own', 'notes.create_own', 'notes.update_own',
    'file_storage.upload_own', 'file_storage.download_own',
    'emails.send_own'
);

-- INVITADO - Solo lectura básica
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'Invitado'),
    id
FROM permissions 
WHERE name IN (
    'cases.read_own', 'todos.read_own', 'time_entries.read_own',
    'documentation.read_all', 'search.basic',
    'disposiciones.read_own', 'notes.read_own',
    'file_storage.download_own'
);

-- =========================================
-- 4. CONFIGURACIONES INICIALES DE EMAIL
-- =========================================

-- Configuración SMTP segura
INSERT INTO system_configurations (key, value, description, is_encrypted, created_at, updated_at) VALUES
('smtp_host', 'smtp.gmail.com', 'Servidor SMTP para envío de emails', false, NOW(), NOW()),
('smtp_port', '587', 'Puerto SMTP', false, NOW(), NOW()),
('smtp_secure', 'true', 'Usar conexión segura TLS', false, NOW(), NOW()),
('smtp_user', '', 'Usuario SMTP (configurar manualmente)', true, NOW(), NOW()),
('smtp_password', '', 'Contraseña SMTP (configurar manualmente)', true, NOW(), NOW()),
('email_from', 'noreply@tu-dominio.com', 'Email remitente por defecto', false, NOW(), NOW()),
('email_from_name', 'Sistema de Gestión de Casos', 'Nombre del remitente', false, NOW(), NOW())
ON CONFLICT (key) DO UPDATE SET
    value = EXCLUDED.value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =========================================
-- 5. DATOS INICIALES DEL SISTEMA
-- =========================================

-- Estados de control de casos
INSERT INTO case_status_control (id, name, description, color, display_order) VALUES
('c743231b-ebed-4534-a74e-1b94e69353a5', 'PENDIENTE', 'Caso asignado pero no iniciado.', '#EF4444', 1),
('a25d089f-d69e-4dce-bf70-a2c1528a6bd2', 'EN CURSO', 'Caso en proceso de resolución', '#3B82F6', 2),
('67166b33-b7c2-41d3-bff7-cb1c6a0f6707', 'ESCALADA', 'Caso escalado a nivel superior', '#F59E0B', 3),
('6d371a8f-52cd-48fa-9576-1e978ce2ef29', 'TERMINADA', 'Caso completado y cerrado.', '#10B981', 4),
('8e9aed74-1a34-47ae-bd3c-217b5291a909', 'CDC', 'Estado para saber los casos que están en Control de Cambios', '#06B6D4', 5)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

-- Prioridades de TODOs
INSERT INTO todo_priorities (id, name, description, color, level, display_order) VALUES
('p1-urgent', 'Urgente', 'Requiere atención inmediata', '#DC2626', 1, 1),
('p2-high', 'Alta', 'Prioridad alta', '#EA580C', 2, 2),
('p3-medium', 'Media', 'Prioridad media', '#D97706', 3, 3),
('p4-low', 'Baja', 'Prioridad baja', '#65A30D', 4, 4),
('p5-info', 'Informativo', 'Solo informativo', '#6B7280', 5, 5)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    level = EXCLUDED.level,
    display_order = EXCLUDED.display_order,
    updated_at = NOW();

-- Tipos de documentos activos
INSERT INTO document_types (name, description, is_active) VALUES
('manual', 'Manual de usuario', true),
('tutorial', 'Tutorial paso a paso', true),
('faq', 'Preguntas frecuentes', true),
('api', 'Documentación de API', true),
('troubleshooting', 'Solución de problemas', true),
('changelog', 'Registro de cambios', true)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- =========================================
-- SCRIPT COMPLETADO EXITOSAMENTE
-- =========================================

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ PERMISOS Y ROLES CONFIGURADOS EXITOSAMENTE';
    RAISE NOTICE '📊 Roles creados: % ', (SELECT COUNT(*) FROM roles WHERE is_active = true);
    RAISE NOTICE '🔑 Permisos creados: %', (SELECT COUNT(*) FROM permissions WHERE is_active = true);
    RAISE NOTICE '🔗 Asignaciones creadas: %', (SELECT COUNT(*) FROM role_permissions);
    RAISE NOTICE '⚙️  Configuraciones de email: %', (SELECT COUNT(*) FROM system_configurations WHERE key LIKE 'smtp_%' OR key LIKE 'email_%');
    RAISE NOTICE '';
    RAISE NOTICE '🚀 El sistema está listo para asignar usuarios a roles.';
    RAISE NOTICE '📝 Recuerda configurar las credenciales SMTP en system_configurations';
END $$;
