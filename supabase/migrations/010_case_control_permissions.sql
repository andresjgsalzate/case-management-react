-- Migración 010: Permisos para el módulo Control de Casos

-- Insertar nuevos permisos para el módulo de control de casos
INSERT INTO permissions (name, description, resource, action) VALUES
-- Permisos generales del módulo
('case_control.view', 'Ver módulo de control de casos', 'case_control', 'read'),
('case_control.view_all', 'Ver todos los controles de casos (admin)', 'case_control', 'read'),
('case_control.view_own', 'Ver solo sus propios controles de casos', 'case_control', 'read'),

-- Permisos de gestión de estados
('case_control.manage_status', 'Gestionar estados de casos en control', 'case_control', 'manage'),
('case_control.update_status', 'Actualizar estado de casos', 'case_control', 'update'),

-- Permisos de tiempo
('case_control.start_timer', 'Iniciar/pausar timer de casos', 'case_control', 'create'),
('case_control.add_manual_time', 'Agregar tiempo manual a casos', 'case_control', 'create'),
('case_control.edit_time', 'Editar entradas de tiempo', 'case_control', 'update'),
('case_control.delete_time', 'Eliminar entradas de tiempo', 'case_control', 'delete'),

-- Permisos de asignación
('case_control.assign_cases', 'Asignar casos a usuarios', 'case_control', 'create'),
('case_control.reassign_cases', 'Reasignar casos entre usuarios', 'case_control', 'update'),

-- Permisos de reportes
('case_control.view_reports', 'Ver reportes de tiempo', 'case_control', 'read'),
('case_control.export_reports', 'Exportar reportes de tiempo', 'case_control', 'read'),
('case_control.view_team_reports', 'Ver reportes del equipo', 'case_control', 'read'),

-- Permisos de dashboard
('case_control.view_dashboard', 'Ver dashboard de control de casos', 'case_control', 'read'),
('case_control.view_team_stats', 'Ver estadísticas del equipo', 'case_control', 'read')

ON CONFLICT (name) DO NOTHING;

-- Asignar permisos al rol admin (todos los permisos)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'admin' 
AND p.resource = 'case_control'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Asignar permisos básicos al rol user
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'user' 
AND p.name IN (
    'case_control.view',
    'case_control.view_own',
    'case_control.update_status',
    'case_control.start_timer',
    'case_control.add_manual_time',
    'case_control.view_reports',
    'case_control.export_reports',
    'case_control.view_dashboard'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;
