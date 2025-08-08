-- ================================================================
-- PERMISOS PARA MÓDULO DE NOTAS
-- ================================================================
-- Descripción: Permisos granulares para el módulo de notas
-- Sistema: Permisos con formato "notes.accion_scope"
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- VERIFICACIÓN INICIAL
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  AGREGANDO PERMISOS PARA NOTAS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE '';
END $$;

-- ================================================================
-- PERMISOS PARA MÓDULO DE NOTAS
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES
-- Permisos de lectura
('notes.read_own', 'Ver notas propias (creadas o asignadas al usuario)', 'notes', 'read', 'own', true),
('notes.read_team', 'Ver notas del equipo', 'notes', 'read', 'team', true),
('notes.read_all', 'Ver todas las notas del sistema', 'notes', 'read', 'all', true),

-- Permisos de creación
('notes.create_own', 'Crear notas propias', 'notes', 'create', 'own', true),
('notes.create_team', 'Crear notas para el equipo', 'notes', 'create', 'team', true),
('notes.create_all', 'Crear notas para cualquier usuario', 'notes', 'create', 'all', true),

-- Permisos de actualización
('notes.update_own', 'Actualizar notas propias (creadas o asignadas al usuario)', 'notes', 'update', 'own', true),
('notes.update_team', 'Actualizar notas del equipo', 'notes', 'update', 'team', true),
('notes.update_all', 'Actualizar todas las notas del sistema', 'notes', 'update', 'all', true),

-- Permisos de eliminación
('notes.delete_own', 'Eliminar notas propias', 'notes', 'delete', 'own', true),
('notes.delete_team', 'Eliminar notas del equipo', 'notes', 'delete', 'team', true),
('notes.delete_all', 'Eliminar todas las notas del sistema', 'notes', 'delete', 'all', true),

-- Permisos de exportación
('notes.export_own', 'Exportar notas propias', 'notes', 'export', 'own', true),
('notes.export_team', 'Exportar notas del equipo', 'notes', 'export', 'team', true),
('notes.export_all', 'Exportar todas las notas del sistema', 'notes', 'export', 'all', true),

-- Permisos de administración
('notes.admin_own', 'Administración completa de notas propias', 'notes', 'admin', 'own', true),
('notes.admin_team', 'Administración completa de notas del equipo', 'notes', 'admin', 'team', true),
('notes.admin_all', 'Administración completa de todas las notas', 'notes', 'admin', 'all', true)

ON CONFLICT (name) DO NOTHING;

-- ================================================================
-- ASIGNAR PERMISOS AL ROL ADMIN
-- ================================================================
DO $$
DECLARE
    admin_role_id UUID;
    permission_record RECORD;
    total_permissions INTEGER := 0;
    assigned_permissions INTEGER := 0;
BEGIN
    -- Obtener el ID del rol admin
    SELECT id INTO admin_role_id FROM roles WHERE name = 'admin';
    
    IF admin_role_id IS NULL THEN
        RAISE NOTICE '⚠ Rol admin no encontrado, creándolo...';
        INSERT INTO roles (name, description, is_active) 
        VALUES ('admin', 'Administrador del sistema', true) 
        RETURNING id INTO admin_role_id;
        RAISE NOTICE '✓ Rol admin creado con ID: %', admin_role_id;
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE 'ASIGNANDO PERMISOS DE NOTAS AL ROL ADMIN:';
    
    -- Asignar todos los permisos de notas al rol admin
    FOR permission_record IN 
        SELECT id, name FROM permissions 
        WHERE resource = 'notes' 
        AND is_active = true
        ORDER BY name
    LOOP
        total_permissions := total_permissions + 1;
        
        -- Verificar si ya existe la asignación
        IF NOT EXISTS (
            SELECT 1 FROM role_permissions 
            WHERE role_id = admin_role_id 
            AND permission_id = permission_record.id
        ) THEN
            INSERT INTO role_permissions (role_id, permission_id) 
            VALUES (admin_role_id, permission_record.id);
            
            assigned_permissions := assigned_permissions + 1;
            RAISE NOTICE '  ✓ Asignado: %', permission_record.name;
        ELSE
            RAISE NOTICE '  ⚠ Ya existe: %', permission_record.name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE 'RESUMEN DE ASIGNACIÓN:';
    RAISE NOTICE '  Total permisos de notas: %', total_permissions;
    RAISE NOTICE '  Permisos asignados: %', assigned_permissions;
    RAISE NOTICE '  Permisos ya existentes: %', total_permissions - assigned_permissions;
    RAISE NOTICE '';
END $$;

-- ================================================================
-- VERIFICACIÓN FINAL
-- ================================================================
DO $$
DECLARE
    permission_count INTEGER;
    admin_permission_count INTEGER;
BEGIN
    -- Contar permisos de notas
    SELECT COUNT(*) INTO permission_count
    FROM permissions 
    WHERE resource = 'notes' AND is_active = true;
    
    -- Contar permisos asignados al admin
    SELECT COUNT(*) INTO admin_permission_count
    FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    JOIN roles r ON rp.role_id = r.id
    WHERE r.name = 'admin' AND p.resource = 'notes' AND p.is_active = true;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE '  VERIFICACIÓN FINAL - PERMISOS NOTAS';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '✓ Permisos de notas creados: %', permission_count;
    RAISE NOTICE '✓ Permisos asignados a admin: %', admin_permission_count;
    RAISE NOTICE '';
    
    IF permission_count = admin_permission_count THEN
        RAISE NOTICE '✅ TODOS LOS PERMISOS DE NOTAS ESTÁN CORRECTAMENTE ASIGNADOS';
    ELSE
        RAISE NOTICE '⚠️ FALTAN PERMISOS POR ASIGNAR AL ROL ADMIN';
    END IF;
    
    RAISE NOTICE '';
END $$;
