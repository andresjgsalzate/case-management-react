-- =====================================================
-- MIGRACIÓN: Permisos del módulo de Notas con scopes
-- Autor: GitHub Copilot  
-- Fecha: 2025-08-04
-- Descripción: Crea todos los permisos CRUD para el módulo de Notas con sistema de scopes
-- =====================================================

-- PERMISOS DE LECTURA (READ)
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES
('notes.read_own', 'Ver notas propias', 'notes', 'read', 'own', true),
('notes.read_team', 'Ver notas del equipo', 'notes', 'read', 'team', true),
('notes.read_all', 'Ver todas las notas', 'notes', 'read', 'all', true),

-- PERMISOS DE CREACIÓN (CREATE)
('notes.create_own', 'Crear notas propias', 'notes', 'create', 'own', true),
('notes.create_team', 'Crear notas para el equipo', 'notes', 'create', 'team', true),
('notes.create_all', 'Crear notas para cualquier usuario', 'notes', 'create', 'all', true),

-- PERMISOS DE ACTUALIZACIÓN (UPDATE)
('notes.update_own', 'Actualizar notas propias', 'notes', 'update', 'own', true),
('notes.update_team', 'Actualizar notas del equipo', 'notes', 'update', 'team', true),
('notes.update_all', 'Actualizar todas las notas', 'notes', 'update', 'all', true),

-- PERMISOS DE ELIMINACIÓN (DELETE)
('notes.delete_own', 'Eliminar notas propias', 'notes', 'delete', 'own', true),
('notes.delete_team', 'Eliminar notas del equipo', 'notes', 'delete', 'team', true),
('notes.delete_all', 'Eliminar todas las notas', 'notes', 'delete', 'all', true),

-- PERMISOS DE ARCHIVO (ARCHIVE)
('notes.archive_own', 'Archivar notas propias', 'notes', 'archive', 'own', true),
('notes.archive_team', 'Archivar notas del equipo', 'notes', 'archive', 'team', true),
('notes.archive_all', 'Archivar todas las notas', 'notes', 'archive', 'all', true),

-- PERMISOS DE ASIGNACIÓN (ASSIGN)
('notes.assign_own', 'Asignarse notas a sí mismo', 'notes', 'assign', 'own', true),
('notes.assign_team', 'Asignar notas dentro del equipo', 'notes', 'assign', 'team', true),
('notes.assign_all', 'Asignar notas a cualquier usuario', 'notes', 'assign', 'all', true),

-- PERMISOS ESPECIALES
('notes.manage_tags_own', 'Gestionar tags propios', 'notes', 'manage_tags', 'own', true),
('notes.manage_tags_team', 'Gestionar tags del equipo', 'notes', 'manage_tags', 'team', true),
('notes.manage_tags_all', 'Gestionar todos los tags', 'notes', 'manage_tags', 'all', true),

('notes.export_own', 'Exportar notas propias', 'notes', 'export', 'own', true),
('notes.export_team', 'Exportar notas del equipo', 'notes', 'export', 'team', true),
('notes.export_all', 'Exportar todas las notas', 'notes', 'export', 'all', true),

('notes.associate_cases_own', 'Asociar notas propias con casos', 'notes', 'associate_cases', 'own', true),
('notes.associate_cases_team', 'Asociar notas del equipo con casos', 'notes', 'associate_cases', 'team', true),
('notes.associate_cases_all', 'Asociar cualquier nota con casos', 'notes', 'associate_cases', 'all', true);

-- =====================================================
-- ASIGNAR PERMISOS A ROLES
-- =====================================================

-- ANALISTA: Permisos propios únicamente (scope own)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'Analista' 
AND p.name IN (
    'notes.read_own',
    'notes.create_own',
    'notes.update_own',
    'notes.delete_own',
    'notes.archive_own',
    'notes.assign_own',
    'notes.manage_tags_own',
    'notes.export_own',
    'notes.associate_cases_own'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ADMIN: Permisos completos (scope all)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'Admin' 
AND p.name IN (
    'notes.read_all',
    'notes.create_all',
    'notes.update_all',
    'notes.delete_all',
    'notes.archive_all',
    'notes.assign_all',
    'notes.manage_tags_all',
    'notes.export_all',
    'notes.associate_cases_all'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Verificar que los permisos se han creado correctamente
DO $$
DECLARE
    notes_permissions_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO notes_permissions_count 
    FROM permissions 
    WHERE resource = 'notes' AND scope IS NOT NULL;
    
    IF notes_permissions_count = 24 THEN
        RAISE NOTICE '✅ NOTAS: Se crearon correctamente % permisos para el módulo de notas con scopes', notes_permissions_count;
    ELSE
        RAISE NOTICE '⚠️ NOTAS: Se esperaban 24 permisos, se crearon %', notes_permissions_count;
    END IF;
END $$;
