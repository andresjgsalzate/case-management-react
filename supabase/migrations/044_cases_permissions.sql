-- ================================================================
-- PERMISOS DEL MÓDULO CASES CON SCOPES
-- ================================================================
-- Descripción: Agrega permisos específicos para el módulo Cases
-- Fecha: 4 de Agosto, 2025
-- Modelo: cases.accion_scope (own/team/all)
-- ================================================================

-- ================================================================
-- MÓDULO: CASES (/cases)
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES 
-- Permisos de lectura de casos
('cases.read_own', 'Ver solo sus propios casos', 'cases', 'read', 'own', true),
('cases.read_team', 'Ver casos de su equipo/subordinados', 'cases', 'read', 'team', true),
('cases.read_all', 'Ver todos los casos de la organización', 'cases', 'read', 'all', true),

-- Permisos de creación de casos
('cases.create_own', 'Crear casos propios', 'cases', 'create', 'own', true),
('cases.create_team', 'Crear casos para su equipo', 'cases', 'create', 'team', true),
('cases.create_all', 'Crear casos para cualquier usuario', 'cases', 'create', 'all', true),

-- Permisos de actualización de casos
('cases.update_own', 'Editar solo sus propios casos', 'cases', 'update', 'own', true),
('cases.update_team', 'Editar casos de su equipo', 'cases', 'update', 'team', true),
('cases.update_all', 'Editar cualquier caso', 'cases', 'update', 'all', true),

-- Permisos de eliminación de casos
('cases.delete_own', 'Eliminar solo sus propios casos', 'cases', 'delete', 'own', true),
('cases.delete_team', 'Eliminar casos de su equipo', 'cases', 'delete', 'team', true),
('cases.delete_all', 'Eliminar cualquier caso', 'cases', 'delete', 'all', true),

-- Permisos administrativos especiales
('cases.admin_own', 'Administración completa de sus casos', 'cases', 'admin', 'own', true),
('cases.admin_team', 'Administración completa de casos del equipo', 'cases', 'admin', 'team', true),
('cases.admin_all', 'Administración completa de todos los casos', 'cases', 'admin', 'all', true)

ON CONFLICT (name) DO UPDATE SET 
description = EXCLUDED.description,
resource = EXCLUDED.resource,
action = EXCLUDED.action,
scope = EXCLUDED.scope,
is_active = EXCLUDED.is_active;

-- ================================================================
-- ASIGNAR PERMISOS BÁSICOS AL ROL ANALISTA
-- ================================================================
-- Los analistas pueden gestionar completamente sus propios casos
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Analista' 
  AND p.name IN (
    'cases.read_own', 'cases.create_own', 'cases.update_own', 'cases.delete_own', 'cases.admin_own'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ================================================================
-- ASIGNAR PERMISOS AVANZADOS AL ROL ADMIN
-- ================================================================
-- Los admins pueden gestionar todos los casos de la organización
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Admin' 
  AND p.name IN (
    'cases.read_own', 'cases.read_team', 'cases.read_all',
    'cases.create_own', 'cases.create_team', 'cases.create_all',
    'cases.update_own', 'cases.update_team', 'cases.update_all',
    'cases.delete_own', 'cases.delete_team', 'cases.delete_all',
    'cases.admin_own', 'cases.admin_team', 'cases.admin_all'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ================================================================
-- LOGGING DE CONFIRMACIÓN
-- ================================================================
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Cases Permissions: Permisos de casos creados con scopes';
  RAISE NOTICE '✅ Cases Permissions: Analista puede gestionar casos propios';
  RAISE NOTICE '✅ Cases Permissions: Admin puede gestionar todos los casos';
END $$;
