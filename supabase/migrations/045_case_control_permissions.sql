-- ================================================================
-- PERMISOS DEL MÓDULO CASE CONTROL CON SCOPES
-- ================================================================
-- Descripción: Agrega permisos específicos para el módulo Case Control
-- Fecha: 4 de Agosto, 2025
-- Modelo: case_control.accion_scope (own/team/all)
-- ================================================================

-- ================================================================
-- MÓDULO: CASE CONTROL (/case-control)
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES 
-- Permisos de lectura/visualización de control de casos
('case_control.read_own', 'Ver control de sus propios casos', 'case_control', 'read', 'own', true),
('case_control.read_team', 'Ver control de casos de su equipo', 'case_control', 'read', 'team', true),
('case_control.read_all', 'Ver control de todos los casos', 'case_control', 'read', 'all', true),

-- Permisos de asignación de casos al control
('case_control.assign_own', 'Asignar sus propios casos al control', 'case_control', 'assign', 'own', true),
('case_control.assign_team', 'Asignar casos del equipo al control', 'case_control', 'assign', 'team', true),
('case_control.assign_all', 'Asignar cualquier caso al control', 'case_control', 'assign', 'all', true),

-- Permisos de actualización de estado
('case_control.update_status_own', 'Actualizar estado de sus propios casos', 'case_control', 'update_status', 'own', true),
('case_control.update_status_team', 'Actualizar estado de casos del equipo', 'case_control', 'update_status', 'team', true),
('case_control.update_status_all', 'Actualizar estado de cualquier caso', 'case_control', 'update_status', 'all', true),

-- Permisos de control de tiempo (timer)
('case_control.timer_own', 'Controlar timer de sus propios casos', 'case_control', 'timer', 'own', true),
('case_control.timer_team', 'Controlar timer de casos del equipo', 'case_control', 'timer', 'team', true),
('case_control.timer_all', 'Controlar timer de cualquier caso', 'case_control', 'timer', 'all', true),

-- Permisos de tiempo manual
('case_control.manual_time_own', 'Gestionar tiempo manual de sus propios casos', 'case_control', 'manual_time', 'own', true),
('case_control.manual_time_team', 'Gestionar tiempo manual de casos del equipo', 'case_control', 'manual_time', 'team', true),
('case_control.manual_time_all', 'Gestionar tiempo manual de cualquier caso', 'case_control', 'manual_time', 'all', true),

-- Permisos de reportes y estadísticas
('case_control.reports_own', 'Ver reportes de sus propios casos', 'case_control', 'reports', 'own', true),
('case_control.reports_team', 'Ver reportes de casos del equipo', 'case_control', 'reports', 'team', true),
('case_control.reports_all', 'Ver reportes de todos los casos', 'case_control', 'reports', 'all', true)

ON CONFLICT (name) DO UPDATE SET 
description = EXCLUDED.description,
resource = EXCLUDED.resource,
action = EXCLUDED.action,
scope = EXCLUDED.scope,
is_active = EXCLUDED.is_active;

-- ================================================================
-- ASIGNAR PERMISOS BÁSICOS AL ROL ANALISTA
-- ================================================================
-- Los analistas pueden gestionar completamente sus propios casos en control
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Analista' 
  AND p.name IN (
    'case_control.read_own',
    'case_control.assign_own', 
    'case_control.update_status_own',
    'case_control.timer_own',
    'case_control.manual_time_own',
    'case_control.reports_own'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ================================================================
-- ASIGNAR PERMISOS AVANZADOS AL ROL ADMIN
-- ================================================================
-- Los admins pueden gestionar control de casos de toda la organización
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Admin' 
  AND p.name IN (
    'case_control.read_own', 'case_control.read_team', 'case_control.read_all',
    'case_control.assign_own', 'case_control.assign_team', 'case_control.assign_all',
    'case_control.update_status_own', 'case_control.update_status_team', 'case_control.update_status_all',
    'case_control.timer_own', 'case_control.timer_team', 'case_control.timer_all',
    'case_control.manual_time_own', 'case_control.manual_time_team', 'case_control.manual_time_all',
    'case_control.reports_own', 'case_control.reports_team', 'case_control.reports_all'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ================================================================
-- LOGGING DE CONFIRMACIÓN
-- ================================================================
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Case Control Permissions: Permisos de case control creados con scopes';
  RAISE NOTICE '✅ Case Control Permissions: Analista puede gestionar sus propios casos';
  RAISE NOTICE '✅ Case Control Permissions: Admin puede gestionar todos los casos';
END $$;
