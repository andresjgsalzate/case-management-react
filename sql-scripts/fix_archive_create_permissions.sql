-- Script para agregar los permisos archive.create faltantes
-- Estos permisos son necesarios para que el sistema de archivo funcione correctamente

-- Agregar permisos archive.create que faltan
INSERT INTO permissions (id, name, description, resource, action, scope, is_active) VALUES
  (gen_random_uuid(), 'archive.create_own', 'Crear/archivar elementos propios', 'archive', 'create', 'own', true),
  (gen_random_uuid(), 'archive.create_team', 'Crear/archivar elementos del equipo', 'archive', 'create', 'team', true),
  (gen_random_uuid(), 'archive.create_all', 'Crear/archivar todos los elementos', 'archive', 'create', 'all', true)
ON CONFLICT (name) DO NOTHING;

-- Asignar los nuevos permisos al rol Admin
WITH admin_role AS (
  SELECT id FROM roles WHERE name = 'Admin' LIMIT 1
)
INSERT INTO role_permissions (id, role_id, permission_id)
SELECT 
  gen_random_uuid(),
  admin_role.id,
  p.id
FROM admin_role, permissions p
WHERE p.name IN ('archive.create_own', 'archive.create_team', 'archive.create_all')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Verificar que los permisos se crearon correctamente
SELECT 
  p.name,
  p.description,
  p.resource,
  p.action,
  p.scope,
  CASE WHEN rp.id IS NOT NULL THEN 'Asignado al Admin' ELSE 'NO asignado' END as admin_status
FROM permissions p
LEFT JOIN role_permissions rp ON p.id = rp.permission_id 
LEFT JOIN roles r ON rp.role_id = r.id AND r.name = 'Admin'
WHERE p.resource = 'archive' AND p.action = 'create'
ORDER BY p.scope;