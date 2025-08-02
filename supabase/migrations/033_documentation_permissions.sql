-- ================================================================
-- MIGRACIÓN: Permisos para Módulo de Documentación
-- Descripción: Nuevos permisos y asignación a roles
-- Versión: 1.0
-- Fecha: 1 de Agosto, 2025
-- ================================================================

-- Insertar nuevos permisos para documentación
INSERT INTO permissions (name, description, resource, action) VALUES
('documentation:read', 'Ver documentación publicada', 'documentation', 'read'),
('documentation:create', 'Crear nueva documentación', 'documentation', 'create'),
('documentation:update', 'Editar documentación propia', 'documentation', 'update'),
('documentation:delete', 'Eliminar documentación propia', 'documentation', 'delete'),
('documentation:manage', 'Gestionar toda la documentación', 'documentation', 'manage'),
('documentation:feedback', 'Dar feedback en documentos', 'documentation', 'feedback'),
('documentation:categories', 'Gestionar categorías', 'documentation', 'categories'),
('documentation:templates', 'Crear y gestionar templates', 'documentation', 'templates'),
('documentation:versions', 'Ver historial de versiones', 'documentation', 'versions'),
('documentation:publish', 'Publicar/despublicar documentos', 'documentation', 'publish');

-- Asignar permisos básicos a roles existentes

-- Usuarios normales (user): pueden leer, crear, dar feedback
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'user' 
AND p.name IN (
  'documentation:read', 
  'documentation:create', 
  'documentation:feedback',
  'documentation:templates',
  'documentation:versions'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Analistas (analista): mismos permisos que usuarios + actualizar sus documentos
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'analista'
AND p.name IN (
  'documentation:read', 
  'documentation:create', 
  'documentation:update',
  'documentation:delete',
  'documentation:feedback',
  'documentation:templates',
  'documentation:versions',
  'documentation:publish'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Supervisores (supervisor): pueden gestionar documentación de su área
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'supervisor'
AND p.name IN (
  'documentation:read', 
  'documentation:create', 
  'documentation:update', 
  'documentation:delete', 
  'documentation:feedback',
  'documentation:templates',
  'documentation:versions',
  'documentation:publish'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Auditores (auditor): solo lectura para supervisión
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'auditor'
AND p.name IN (
  'documentation:read',
  'documentation:versions'
)
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Administradores (admin): acceso completo
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'admin'
AND p.resource = 'documentation'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Verificar que los permisos se insertaron correctamente
DO $$
DECLARE
  perm_count integer;
BEGIN
  SELECT COUNT(*) INTO perm_count
  FROM permissions
  WHERE resource = 'documentation';
  
  IF perm_count < 10 THEN
    RAISE EXCEPTION 'Error: No se insertaron todos los permisos de documentación. Esperados: 10, Encontrados: %', perm_count;
  END IF;
  
  RAISE NOTICE 'Permisos de documentación insertados correctamente: % permisos', perm_count;
END $$;
