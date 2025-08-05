-- ================================================================
-- PERMISOS DEL MÓDULO DISPOSICIONES CON SCOPES
-- ================================================================
-- Descripción: Agrega permisos específicos para el módulo Disposiciones
-- Fecha: 4 de Agosto, 2025
-- Modelo: disposiciones.accion_scope (own/team/all)
-- ================================================================

-- ================================================================
-- MÓDULO: DISPOSICIONES (/disposiciones)
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES 
-- Permisos de lectura/visualización de disposiciones
('disposiciones.read_own', 'Ver solo sus propias disposiciones', 'disposiciones', 'read', 'own', true),
('disposiciones.read_team', 'Ver disposiciones de su equipo', 'disposiciones', 'read', 'team', true),
('disposiciones.read_all', 'Ver todas las disposiciones', 'disposiciones', 'read', 'all', true),

-- Permisos de creación de disposiciones
('disposiciones.create_own', 'Crear disposiciones propias', 'disposiciones', 'create', 'own', true),
('disposiciones.create_team', 'Crear disposiciones para su equipo', 'disposiciones', 'create', 'team', true),
('disposiciones.create_all', 'Crear disposiciones para cualquier usuario', 'disposiciones', 'create', 'all', true),

-- Permisos de actualización de disposiciones
('disposiciones.update_own', 'Editar solo sus propias disposiciones', 'disposiciones', 'update', 'own', true),
('disposiciones.update_team', 'Editar disposiciones de su equipo', 'disposiciones', 'update', 'team', true),
('disposiciones.update_all', 'Editar cualquier disposición', 'disposiciones', 'update', 'all', true),

-- Permisos de eliminación de disposiciones
('disposiciones.delete_own', 'Eliminar solo sus propias disposiciones', 'disposiciones', 'delete', 'own', true),
('disposiciones.delete_team', 'Eliminar disposiciones de su equipo', 'disposiciones', 'delete', 'team', true),
('disposiciones.delete_all', 'Eliminar cualquier disposición', 'disposiciones', 'delete', 'all', true),

-- Permisos de exportación y reportes
('disposiciones.export_own', 'Exportar sus propias disposiciones', 'disposiciones', 'export', 'own', true),
('disposiciones.export_team', 'Exportar disposiciones del equipo', 'disposiciones', 'export', 'team', true),
('disposiciones.export_all', 'Exportar todas las disposiciones', 'disposiciones', 'export', 'all', true),

-- Permisos administrativos especiales
('disposiciones.admin_own', 'Administración completa de sus disposiciones', 'disposiciones', 'admin', 'own', true),
('disposiciones.admin_team', 'Administración completa de disposiciones del equipo', 'disposiciones', 'admin', 'team', true),
('disposiciones.admin_all', 'Administración completa de todas las disposiciones', 'disposiciones', 'admin', 'all', true)

ON CONFLICT (name) DO UPDATE SET 
description = EXCLUDED.description,
resource = EXCLUDED.resource,
action = EXCLUDED.action,
scope = EXCLUDED.scope,
is_active = EXCLUDED.is_active;

-- ================================================================
-- ASIGNAR PERMISOS BÁSICOS AL ROL ANALISTA
-- ================================================================
-- Los analistas pueden gestionar completamente sus propias disposiciones
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Analista' 
  AND p.name IN (
    'disposiciones.read_own',
    'disposiciones.create_own', 
    'disposiciones.update_own',
    'disposiciones.delete_own',
    'disposiciones.export_own'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ================================================================
-- ASIGNAR PERMISOS AVANZADOS AL ROL ADMIN
-- ================================================================
-- Los admins pueden gestionar disposiciones de toda la organización
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Admin' 
  AND p.name IN (
    'disposiciones.read_own', 'disposiciones.read_team', 'disposiciones.read_all',
    'disposiciones.create_own', 'disposiciones.create_team', 'disposiciones.create_all',
    'disposiciones.update_own', 'disposiciones.update_team', 'disposiciones.update_all',
    'disposiciones.delete_own', 'disposiciones.delete_team', 'disposiciones.delete_all',
    'disposiciones.export_own', 'disposiciones.export_team', 'disposiciones.export_all',
    'disposiciones.admin_own', 'disposiciones.admin_team', 'disposiciones.admin_all'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ================================================================
-- LOGGING DE CONFIRMACIÓN
-- ================================================================
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Disposiciones Permissions: Permisos de disposiciones creados con scopes';
  RAISE NOTICE '✅ Disposiciones Permissions: Analista puede gestionar sus propias disposiciones';
  RAISE NOTICE '✅ Disposiciones Permissions: Admin puede gestionar todas las disposiciones';
END $$;
