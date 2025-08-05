-- ================================================================
-- PERMISOS DE ADMINISTRACIÓN CON MODELO DE SCOPES
-- ================================================================
-- Descripción: Crea todos los permisos CRUD para módulos de administración
-- Fecha: 4 de Agosto, 2025
-- Modelo: modulo.accion_scope (own/team/all)
-- ================================================================

-- ================================================================
-- MÓDULO: USUARIOS (/admin/users)
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES 
-- Permisos de lectura
('users.read_own', 'Ver su propio perfil de usuario', 'users', 'read', 'own', true),
('users.read_team', 'Ver usuarios de su equipo', 'users', 'read', 'team', true),
('users.read_all', 'Ver todos los usuarios del sistema', 'users', 'read', 'all', true),

-- Permisos de creación
('users.create_own', 'Crear su propio perfil (registro)', 'users', 'create', 'own', true),
('users.create_team', 'Crear usuarios en su equipo', 'users', 'create', 'team', true),
('users.create_all', 'Crear cualquier usuario en el sistema', 'users', 'create', 'all', true),

-- Permisos de actualización
('users.update_own', 'Actualizar su propio perfil', 'users', 'update', 'own', true),
('users.update_team', 'Actualizar usuarios de su equipo', 'users', 'update', 'team', true),
('users.update_all', 'Actualizar cualquier usuario', 'users', 'update', 'all', true),

-- Permisos de eliminación
('users.delete_own', 'Eliminar su propio perfil', 'users', 'delete', 'own', true),
('users.delete_team', 'Eliminar usuarios de su equipo', 'users', 'delete', 'team', true),
('users.delete_all', 'Eliminar cualquier usuario', 'users', 'delete', 'all', true),

-- Permisos administrativos especiales
('users.admin_own', 'Administración completa de su perfil', 'users', 'admin', 'own', true),
('users.admin_team', 'Administración completa de usuarios del equipo', 'users', 'admin', 'team', true),
('users.admin_all', 'Administración completa de todos los usuarios', 'users', 'admin', 'all', true)

ON CONFLICT (name) DO UPDATE SET 
description = EXCLUDED.description,
resource = EXCLUDED.resource,
action = EXCLUDED.action,
scope = EXCLUDED.scope,
is_active = EXCLUDED.is_active;

-- ================================================================
-- MÓDULO: ROLES (/admin/roles)
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES 
-- Permisos de lectura
('roles.read_own', 'Ver su propio rol', 'roles', 'read', 'own', true),
('roles.read_team', 'Ver roles de su equipo', 'roles', 'read', 'team', true),
('roles.read_all', 'Ver todos los roles del sistema', 'roles', 'read', 'all', true),

-- Permisos de creación
('roles.create_team', 'Crear roles para su equipo', 'roles', 'create', 'team', true),
('roles.create_all', 'Crear cualquier rol en el sistema', 'roles', 'create', 'all', true),

-- Permisos de actualización
('roles.update_team', 'Actualizar roles de su equipo', 'roles', 'update', 'team', true),
('roles.update_all', 'Actualizar cualquier rol', 'roles', 'update', 'all', true),

-- Permisos de eliminación
('roles.delete_team', 'Eliminar roles de su equipo', 'roles', 'delete', 'team', true),
('roles.delete_all', 'Eliminar cualquier rol', 'roles', 'delete', 'all', true),

-- Permisos administrativos
('roles.admin_team', 'Administración completa de roles del equipo', 'roles', 'admin', 'team', true),
('roles.admin_all', 'Administración completa de todos los roles', 'roles', 'admin', 'all', true)

ON CONFLICT (name) DO UPDATE SET 
description = EXCLUDED.description,
resource = EXCLUDED.resource,
action = EXCLUDED.action,
scope = EXCLUDED.scope,
is_active = EXCLUDED.is_active;

-- ================================================================
-- MÓDULO: PERMISOS (/admin/permissions)
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES 
-- Permisos de lectura
('permissions.read_own', 'Ver sus propios permisos', 'permissions', 'read', 'own', true),
('permissions.read_team', 'Ver permisos de su equipo', 'permissions', 'read', 'team', true),
('permissions.read_all', 'Ver todos los permisos del sistema', 'permissions', 'read', 'all', true),

-- Permisos de creación
('permissions.create_team', 'Crear permisos para su equipo', 'permissions', 'create', 'team', true),
('permissions.create_all', 'Crear cualquier permiso en el sistema', 'permissions', 'create', 'all', true),

-- Permisos de actualización
('permissions.update_team', 'Actualizar permisos de su equipo', 'permissions', 'update', 'team', true),
('permissions.update_all', 'Actualizar cualquier permiso', 'permissions', 'update', 'all', true),

-- Permisos de eliminación
('permissions.delete_team', 'Eliminar permisos de su equipo', 'permissions', 'delete', 'team', true),
('permissions.delete_all', 'Eliminar cualquier permiso', 'permissions', 'delete', 'all', true),

-- Permisos administrativos
('permissions.admin_team', 'Administración completa de permisos del equipo', 'permissions', 'admin', 'team', true),
('permissions.admin_all', 'Administración completa de todos los permisos', 'permissions', 'admin', 'all', true)

ON CONFLICT (name) DO UPDATE SET 
description = EXCLUDED.description,
resource = EXCLUDED.resource,
action = EXCLUDED.action,
scope = EXCLUDED.scope,
is_active = EXCLUDED.is_active;

-- ================================================================
-- MÓDULO: ASIGNACIÓN DE PERMISOS (/admin/role-permissions)
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES 
-- Permisos de lectura
('role_permissions.read_own', 'Ver asignaciones de sus propios roles', 'role_permissions', 'read', 'own', true),
('role_permissions.read_team', 'Ver asignaciones de roles de su equipo', 'role_permissions', 'read', 'team', true),
('role_permissions.read_all', 'Ver todas las asignaciones de permisos', 'role_permissions', 'read', 'all', true),

-- Permisos de creación/asignación
('role_permissions.create_team', 'Asignar permisos a roles de su equipo', 'role_permissions', 'create', 'team', true),
('role_permissions.create_all', 'Asignar permisos a cualquier rol', 'role_permissions', 'create', 'all', true),

-- Permisos de actualización
('role_permissions.update_team', 'Modificar asignaciones de su equipo', 'role_permissions', 'update', 'team', true),
('role_permissions.update_all', 'Modificar cualquier asignación de permisos', 'role_permissions', 'update', 'all', true),

-- Permisos de eliminación
('role_permissions.delete_team', 'Quitar asignaciones de su equipo', 'role_permissions', 'delete', 'team', true),
('role_permissions.delete_all', 'Quitar cualquier asignación de permisos', 'role_permissions', 'delete', 'all', true),

-- Permisos administrativos
('role_permissions.admin_team', 'Administración completa de asignaciones del equipo', 'role_permissions', 'admin', 'team', true),
('role_permissions.admin_all', 'Administración completa de todas las asignaciones', 'role_permissions', 'admin', 'all', true)

ON CONFLICT (name) DO UPDATE SET 
description = EXCLUDED.description,
resource = EXCLUDED.resource,
action = EXCLUDED.action,
scope = EXCLUDED.scope,
is_active = EXCLUDED.is_active;

-- ================================================================
-- MÓDULO: CONFIGURACIÓN (/admin/config)
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES 
-- Permisos de lectura
('config.read_own', 'Ver configuraciones personales', 'config', 'read', 'own', true),
('config.read_team', 'Ver configuraciones del equipo', 'config', 'read', 'team', true),
('config.read_all', 'Ver todas las configuraciones del sistema', 'config', 'read', 'all', true),

-- Permisos de creación
('config.create_own', 'Crear configuraciones personales', 'config', 'create', 'own', true),
('config.create_team', 'Crear configuraciones para el equipo', 'config', 'create', 'team', true),
('config.create_all', 'Crear cualquier configuración del sistema', 'config', 'create', 'all', true),

-- Permisos de actualización
('config.update_own', 'Actualizar configuraciones personales', 'config', 'update', 'own', true),
('config.update_team', 'Actualizar configuraciones del equipo', 'config', 'update', 'team', true),
('config.update_all', 'Actualizar cualquier configuración', 'config', 'update', 'all', true),

-- Permisos de eliminación
('config.delete_own', 'Eliminar configuraciones personales', 'config', 'delete', 'own', true),
('config.delete_team', 'Eliminar configuraciones del equipo', 'config', 'delete', 'team', true),
('config.delete_all', 'Eliminar cualquier configuración', 'config', 'delete', 'all', true),

-- Permisos administrativos
('config.admin_own', 'Administración completa de configuraciones personales', 'config', 'admin', 'own', true),
('config.admin_team', 'Administración completa de configuraciones del equipo', 'config', 'admin', 'team', true),
('config.admin_all', 'Administración completa de todas las configuraciones', 'config', 'admin', 'all', true)

ON CONFLICT (name) DO UPDATE SET 
description = EXCLUDED.description,
resource = EXCLUDED.resource,
action = EXCLUDED.action,
scope = EXCLUDED.scope,
is_active = EXCLUDED.is_active;

-- ================================================================
-- MÓDULO: ETIQUETAS (/admin/tags)
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES 
-- Permisos de lectura
('tags.read_own', 'Ver sus propias etiquetas', 'tags', 'read', 'own', true),
('tags.read_team', 'Ver etiquetas del equipo', 'tags', 'read', 'team', true),
('tags.read_all', 'Ver todas las etiquetas del sistema', 'tags', 'read', 'all', true),

-- Permisos de creación
('tags.create_own', 'Crear etiquetas personales', 'tags', 'create', 'own', true),
('tags.create_team', 'Crear etiquetas para el equipo', 'tags', 'create', 'team', true),
('tags.create_all', 'Crear etiquetas globales del sistema', 'tags', 'create', 'all', true),

-- Permisos de actualización
('tags.update_own', 'Actualizar sus propias etiquetas', 'tags', 'update', 'own', true),
('tags.update_team', 'Actualizar etiquetas del equipo', 'tags', 'update', 'team', true),
('tags.update_all', 'Actualizar cualquier etiqueta', 'tags', 'update', 'all', true),

-- Permisos de eliminación
('tags.delete_own', 'Eliminar sus propias etiquetas', 'tags', 'delete', 'own', true),
('tags.delete_team', 'Eliminar etiquetas del equipo', 'tags', 'delete', 'team', true),
('tags.delete_all', 'Eliminar cualquier etiqueta', 'tags', 'delete', 'all', true),

-- Permisos administrativos
('tags.admin_own', 'Administración completa de etiquetas personales', 'tags', 'admin', 'own', true),
('tags.admin_team', 'Administración completa de etiquetas del equipo', 'tags', 'admin', 'team', true),
('tags.admin_all', 'Administración completa de todas las etiquetas', 'tags', 'admin', 'all', true)

ON CONFLICT (name) DO UPDATE SET 
description = EXCLUDED.description,
resource = EXCLUDED.resource,
action = EXCLUDED.action,
scope = EXCLUDED.scope,
is_active = EXCLUDED.is_active;

-- ================================================================
-- MÓDULO: TIPOS DE DOCUMENTOS (/admin/document-types)
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES 
-- Permisos de lectura
('document_types.read_own', 'Ver tipos de documentos que creó', 'document_types', 'read', 'own', true),
('document_types.read_team', 'Ver tipos de documentos del equipo', 'document_types', 'read', 'team', true),
('document_types.read_all', 'Ver todos los tipos de documentos', 'document_types', 'read', 'all', true),

-- Permisos de creación
('document_types.create_own', 'Crear tipos de documentos personales', 'document_types', 'create', 'own', true),
('document_types.create_team', 'Crear tipos de documentos para el equipo', 'document_types', 'create', 'team', true),
('document_types.create_all', 'Crear tipos de documentos globales', 'document_types', 'create', 'all', true),

-- Permisos de actualización
('document_types.update_own', 'Actualizar tipos de documentos que creó', 'document_types', 'update', 'own', true),
('document_types.update_team', 'Actualizar tipos de documentos del equipo', 'document_types', 'update', 'team', true),
('document_types.update_all', 'Actualizar cualquier tipo de documento', 'document_types', 'update', 'all', true),

-- Permisos de eliminación
('document_types.delete_own', 'Eliminar tipos de documentos que creó', 'document_types', 'delete', 'own', true),
('document_types.delete_team', 'Eliminar tipos de documentos del equipo', 'document_types', 'delete', 'team', true),
('document_types.delete_all', 'Eliminar cualquier tipo de documento', 'document_types', 'delete', 'all', true),

-- Permisos administrativos
('document_types.admin_own', 'Administración completa de tipos de documentos propios', 'document_types', 'admin', 'own', true),
('document_types.admin_team', 'Administración completa de tipos de documentos del equipo', 'document_types', 'admin', 'team', true),
('document_types.admin_all', 'Administración completa de todos los tipos de documentos', 'document_types', 'admin', 'all', true)

ON CONFLICT (name) DO UPDATE SET 
description = EXCLUDED.description,
resource = EXCLUDED.resource,
action = EXCLUDED.action,
scope = EXCLUDED.scope,
is_active = EXCLUDED.is_active;

-- ================================================================
-- ASIGNAR TODOS LOS PERMISOS DE ADMINISTRACIÓN AL ROL ADMIN
-- ================================================================
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
    (SELECT id FROM roles WHERE name = 'Admin'),
    p.id
FROM permissions p
WHERE p.resource IN ('users', 'roles', 'permissions', 'role_permissions', 'config', 'tags', 'document_types')
AND p.is_active = true
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ================================================================
-- VERIFICAR PERMISOS CREADOS
-- ================================================================
SELECT 'RESUMEN DE PERMISOS DE ADMINISTRACIÓN CREADOS:' as info;
SELECT 
    resource,
    action,
    scope,
    COUNT(*) as cantidad_permisos
FROM permissions 
WHERE resource IN ('users', 'roles', 'permissions', 'role_permissions', 'config', 'tags', 'document_types')
AND is_active = true
GROUP BY resource, action, scope
ORDER BY resource, action, scope;

-- ================================================================
-- VERIFICAR PERMISOS ASIGNADOS AL ROL ADMIN
-- ================================================================
SELECT 'PERMISOS ASIGNADOS AL ROL ADMIN:' as info;
SELECT 
    p.resource,
    p.action,
    p.scope,
    COUNT(*) as cantidad
FROM roles r
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'Admin'
AND p.resource IN ('users', 'roles', 'permissions', 'role_permissions', 'config', 'tags', 'document_types')
GROUP BY p.resource, p.action, p.scope
ORDER BY p.resource, p.action, p.scope;
