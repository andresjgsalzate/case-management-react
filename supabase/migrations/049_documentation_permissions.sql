-- =====================================================
-- MIGRACIÓN: Permisos del módulo de Documentación con scopes
-- Autor: GitHub Copilot  
-- Fecha: 2025-08-04
-- Descripción: Crea todos los permisos CRUD para el módulo de Documentación con sistema de scopes
-- =====================================================

-- PERMISOS DE LECTURA (READ)
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES
('documentation.read_own', 'Ver documentos propios', 'documentation', 'read', 'own', true),
('documentation.read_team', 'Ver documentos del equipo', 'documentation', 'read', 'team', true),
('documentation.read_all', 'Ver todos los documentos', 'documentation', 'read', 'all', true),

-- PERMISOS DE CREACIÓN (CREATE)
('documentation.create_own', 'Crear documentos propios', 'documentation', 'create', 'own', true),
('documentation.create_team', 'Crear documentos para el equipo', 'documentation', 'create', 'team', true),
('documentation.create_all', 'Crear documentos para cualquier usuario', 'documentation', 'create', 'all', true),

-- PERMISOS DE ACTUALIZACIÓN (UPDATE)
('documentation.update_own', 'Actualizar documentos propios', 'documentation', 'update', 'own', true),
('documentation.update_team', 'Actualizar documentos del equipo', 'documentation', 'update', 'team', true),
('documentation.update_all', 'Actualizar todos los documentos', 'documentation', 'update', 'all', true),

-- PERMISOS DE ELIMINACIÓN (DELETE)
('documentation.delete_own', 'Eliminar documentos propios', 'documentation', 'delete', 'own', true),
('documentation.delete_team', 'Eliminar documentos del equipo', 'documentation', 'delete', 'team', true),
('documentation.delete_all', 'Eliminar todos los documentos', 'documentation', 'delete', 'all', true),

-- PERMISOS DE PUBLICACIÓN (PUBLISH)
('documentation.publish_own', 'Publicar documentos propios', 'documentation', 'publish', 'own', true),
('documentation.publish_team', 'Publicar documentos del equipo', 'documentation', 'publish', 'team', true),
('documentation.publish_all', 'Publicar todos los documentos', 'documentation', 'publish', 'all', true),

-- PERMISOS DE ARCHIVO (ARCHIVE)
('documentation.archive_own', 'Archivar documentos propios', 'documentation', 'archive', 'own', true),
('documentation.archive_team', 'Archivar documentos del equipo', 'documentation', 'archive', 'team', true),
('documentation.archive_all', 'Archivar todos los documentos', 'documentation', 'archive', 'all', true),

-- PERMISOS DE TEMPLATES (TEMPLATE)
('documentation.template_own', 'Gestionar templates propios', 'documentation', 'template', 'own', true),
('documentation.template_team', 'Gestionar templates del equipo', 'documentation', 'template', 'team', true),
('documentation.template_all', 'Gestionar todos los templates', 'documentation', 'template', 'all', true),

-- PERMISOS DE CATEGORÍAS (CATEGORY)
('documentation.category_own', 'Gestionar categorías propias', 'documentation', 'category', 'own', true),
('documentation.category_team', 'Gestionar categorías del equipo', 'documentation', 'category', 'team', true),
('documentation.category_all', 'Gestionar todas las categorías', 'documentation', 'category', 'all', true),

-- PERMISOS DE FEEDBACK (FEEDBACK)
('documentation.feedback_own', 'Gestionar feedback propio', 'documentation', 'feedback', 'own', true),
('documentation.feedback_team', 'Gestionar feedback del equipo', 'documentation', 'feedback', 'team', true),
('documentation.feedback_all', 'Gestionar todo el feedback', 'documentation', 'feedback', 'all', true),

-- PERMISOS DE EXPORTACIÓN (EXPORT)
('documentation.export_own', 'Exportar documentos propios', 'documentation', 'export', 'own', true),
('documentation.export_team', 'Exportar documentos del equipo', 'documentation', 'export', 'team', true),
('documentation.export_all', 'Exportar todos los documentos', 'documentation', 'export', 'all', true),

-- PERMISOS DE ANALYTICS (ANALYTICS)
('documentation.analytics_own', 'Ver analytics propios', 'documentation', 'analytics', 'own', true),
('documentation.analytics_team', 'Ver analytics del equipo', 'documentation', 'analytics', 'team', true),
('documentation.analytics_all', 'Ver todas las analytics', 'documentation', 'analytics', 'all', true);

-- =====================================================
-- ASIGNAR PERMISOS A ROLES
-- =====================================================

-- ANALISTA: Permisos propios únicamente (scope own)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'Analista' 
AND p.name IN (
    'documentation.read_own',
    'documentation.create_own',
    'documentation.update_own',
    'documentation.delete_own',
    'documentation.publish_own',
    'documentation.archive_own',
    'documentation.template_own',
    'documentation.category_own',
    'documentation.feedback_own',
    'documentation.export_own',
    'documentation.analytics_own'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ADMIN: Permisos completos (scope all)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'Admin' 
AND p.name IN (
    'documentation.read_all',
    'documentation.create_all',
    'documentation.update_all',
    'documentation.delete_all',
    'documentation.publish_all',
    'documentation.archive_all',
    'documentation.template_all',
    'documentation.category_all',
    'documentation.feedback_all',
    'documentation.export_all',
    'documentation.analytics_all'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Verificar que los permisos se han creado correctamente
DO $$
DECLARE
    documentation_permissions_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO documentation_permissions_count 
    FROM permissions 
    WHERE resource = 'documentation' AND scope IS NOT NULL;
    
    IF documentation_permissions_count = 33 THEN
        RAISE NOTICE '✅ DOCUMENTACIÓN: Se crearon correctamente % permisos para el módulo de documentación con scopes', documentation_permissions_count;
    ELSE
        RAISE NOTICE '⚠️ DOCUMENTACIÓN: Se esperaban 33 permisos, se crearon %', documentation_permissions_count;
    END IF;
END $$;
