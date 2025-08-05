-- ================================================================
-- PERMISOS DEL MÓDULO DASHBOARD CON SCOPES
-- ================================================================
-- Descripción: Agrega permisos específicos para el módulo Dashboard
-- Fecha: 4 de Agosto, 2025
-- Modelo: dashboard.accion_scope (own/team/all)
-- ================================================================

-- ================================================================
-- MÓDULO: DASHBOARD (/dashboard)
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES 
-- Permisos de lectura de métricas
('dashboard.read_own', 'Ver sus propias métricas y estadísticas', 'dashboard', 'read', 'own', true),
('dashboard.read_team', 'Ver métricas de su equipo/subordinados', 'dashboard', 'read', 'team', true),
('dashboard.read_all', 'Ver métricas de toda la organización', 'dashboard', 'read', 'all', true),

-- Permisos de exportación de datos
('dashboard.export_own', 'Exportar sus propios datos', 'dashboard', 'export', 'own', true),
('dashboard.export_team', 'Exportar datos de su equipo', 'dashboard', 'export', 'team', true),
('dashboard.export_all', 'Exportar datos de toda la organización', 'dashboard', 'export', 'all', true),

-- Permisos administrativos especiales
('dashboard.admin_own', 'Administración completa de sus métricas', 'dashboard', 'admin', 'own', true),
('dashboard.admin_team', 'Administración completa de métricas del equipo', 'dashboard', 'admin', 'team', true),
('dashboard.admin_all', 'Administración completa de todas las métricas', 'dashboard', 'admin', 'all', true)

ON CONFLICT (name) DO UPDATE SET 
description = EXCLUDED.description,
resource = EXCLUDED.resource,
action = EXCLUDED.action,
scope = EXCLUDED.scope,
is_active = EXCLUDED.is_active;

-- ================================================================
-- ASIGNAR PERMISOS BÁSICOS AL ROL ANALISTA
-- ================================================================
-- Los analistas pueden ver sus propias métricas
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Analista' 
  AND p.name IN ('dashboard.read_own', 'dashboard.export_own')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ================================================================
-- ASIGNAR PERMISOS AVANZADOS AL ROL ADMIN
-- ================================================================
-- Los admins pueden ver y exportar métricas de toda la organización
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'Admin' 
  AND p.name IN (
    'dashboard.read_own', 'dashboard.read_team', 'dashboard.read_all',
    'dashboard.export_own', 'dashboard.export_team', 'dashboard.export_all',
    'dashboard.admin_own', 'dashboard.admin_team', 'dashboard.admin_all'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ================================================================
-- LOGGING DE CONFIRMACIÓN
-- ================================================================
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Dashboard Permissions: Permisos de dashboard creados con scopes';
  RAISE NOTICE '✅ Dashboard Permissions: Analista puede ver métricas propias';
  RAISE NOTICE '✅ Dashboard Permissions: Admin puede ver todas las métricas';
END $$;
