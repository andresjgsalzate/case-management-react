-- =====================================================
-- MIGRACIÓN: Permisos del módulo de TODOs con scopes
-- Autor: GitHub Copilot  
-- Fecha: 2025-08-04
-- Descripción: Crea todos los permisos CRUD para el módulo de TODOs
-- =====================================================

-- PERMISOS DE LECTURA
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES
('todos.read_own', 'Ver propios TODOs', 'todos', 'read', 'own', true),
('todos.read_team', 'Ver TODOs del equipo', 'todos', 'read', 'team', true),
('todos.read_all', 'Ver todos los TODOs', 'todos', 'read', 'all', true),

-- PERMISOS DE CREACIÓN
('todos.create_own', 'Crear TODOs propios', 'todos', 'create', 'own', true),
('todos.create_team', 'Crear TODOs para el equipo', 'todos', 'create', 'team', true),
('todos.create_all', 'Crear TODOs para cualquier usuario', 'todos', 'create', 'all', true),

-- PERMISOS DE ACTUALIZACIÓN
('todos.update_own', 'Actualizar propios TODOs', 'todos', 'update', 'own', true),
('todos.update_team', 'Actualizar TODOs del equipo', 'todos', 'update', 'team', true),
('todos.update_all', 'Actualizar todos los TODOs', 'todos', 'update', 'all', true),

-- PERMISOS DE ELIMINACIÓN
('todos.delete_own', 'Eliminar propios TODOs', 'todos', 'delete', 'own', true),
('todos.delete_team', 'Eliminar TODOs del equipo', 'todos', 'delete', 'team', true),
('todos.delete_all', 'Eliminar todos los TODOs', 'todos', 'delete', 'all', true),

-- PERMISOS DE CONTROL
('todos.control_own', 'Controlar propios TODOs', 'todos', 'control', 'own', true),
('todos.control_team', 'Controlar TODOs del equipo', 'todos', 'control', 'team', true),
('todos.control_all', 'Controlar todos los TODOs', 'todos', 'control', 'all', true),

-- PERMISOS DE ASIGNACIÓN
('todos.assign_own', 'Asignarse TODOs a sí mismo', 'todos', 'assign', 'own', true),
('todos.assign_team', 'Asignar TODOs dentro del equipo', 'todos', 'assign', 'team', true),
('todos.assign_all', 'Asignar TODOs a cualquier usuario', 'todos', 'assign', 'all', true);

-- =====================================================
-- ASIGNAR PERMISOS A ROLES
-- =====================================================

-- ANALISTA: Permisos propios únicamente (scope own)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'Analista' 
AND p.name IN (
    'todos.read_own',
    'todos.create_own', 
    'todos.update_own',
    'todos.delete_own',
    'todos.control_own',
    'todos.assign_own'
);

-- ADMIN: Permisos completos (scope all)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'Admin' 
AND p.name IN (
    'todos.read_all',
    'todos.create_all',
    'todos.update_all', 
    'todos.delete_all',
    'todos.control_all',
    'todos.assign_all'
);

-- Mensaje de confirmación
DO $$ 
BEGIN
    RAISE NOTICE '✅ Permisos de TODOs creados exitosamente';
    RAISE NOTICE '📋 TODOs: 18 permisos creados con scopes (own/team/all)';
    RAISE NOTICE '👤 Analista: Permisos own para todos los TODOs';
    RAISE NOTICE '🔧 Admin: Permisos all para todos los TODOs';
END $$;
