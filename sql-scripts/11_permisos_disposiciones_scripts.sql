-- ================================================================
-- PERMISOS PARA MÓDULO DE DISPOSICIONES DE SCRIPTS
-- ================================================================
-- Descripción: Permisos faltantes para el módulo de disposiciones de scripts
-- Sistema: Permisos granulares con formato "disposiciones.accion_scope"
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- VERIFICACIÓN INICIAL
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  AGREGANDO PERMISOS PARA MÓDULO';
    RAISE NOTICE '  DE DISPOSICIONES DE SCRIPTS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE '';
END $$;

-- ================================================================
-- PERMISOS PARA DISPOSICIONES DE SCRIPTS
-- ================================================================
INSERT INTO permissions (name, description, resource, action, scope, is_active) VALUES
-- Permisos de lectura
('disposiciones.read_own', 'Ver disposiciones de scripts propias', 'disposiciones', 'read', 'own', true),
('disposiciones.read_team', 'Ver disposiciones de scripts del equipo', 'disposiciones', 'read', 'team', true),
('disposiciones.read_all', 'Ver todas las disposiciones de scripts', 'disposiciones', 'read', 'all', true),

-- Permisos de creación
('disposiciones.create_own', 'Crear disposiciones de scripts propias', 'disposiciones', 'create', 'own', true),
('disposiciones.create_team', 'Crear disposiciones de scripts para el equipo', 'disposiciones', 'create', 'team', true),
('disposiciones.create_all', 'Crear disposiciones de scripts globales', 'disposiciones', 'create', 'all', true),

-- Permisos de actualización
('disposiciones.update_own', 'Actualizar disposiciones de scripts propias', 'disposiciones', 'update', 'own', true),
('disposiciones.update_team', 'Actualizar disposiciones de scripts del equipo', 'disposiciones', 'update', 'team', true),
('disposiciones.update_all', 'Actualizar todas las disposiciones de scripts', 'disposiciones', 'update', 'all', true),

-- Permisos de eliminación
('disposiciones.delete_own', 'Eliminar disposiciones de scripts propias', 'disposiciones', 'delete', 'own', true),
('disposiciones.delete_team', 'Eliminar disposiciones de scripts del equipo', 'disposiciones', 'delete', 'team', true),
('disposiciones.delete_all', 'Eliminar todas las disposiciones de scripts', 'disposiciones', 'delete', 'all', true),

-- Permisos de exportación
('disposiciones.export_own', 'Exportar disposiciones de scripts propias', 'disposiciones', 'export', 'own', true),
('disposiciones.export_team', 'Exportar disposiciones de scripts del equipo', 'disposiciones', 'export', 'team', true),
('disposiciones.export_all', 'Exportar todas las disposiciones de scripts', 'disposiciones', 'export', 'all', true),

-- Permisos administrativos
('disposiciones.admin_own', 'Administración completa de disposiciones propias', 'disposiciones', 'admin', 'own', true),
('disposiciones.admin_team', 'Administración completa de disposiciones del equipo', 'disposiciones', 'admin', 'team', true),
('disposiciones.admin_all', 'Administración completa de todas las disposiciones', 'disposiciones', 'admin', 'all', true);

-- ================================================================
-- ASIGNAR PERMISOS AL ROL DE ADMINISTRADOR
-- ================================================================
DO $$
DECLARE
    admin_role_id UUID;
    disposicion_permission_id UUID;
    permission_record RECORD;
BEGIN
    -- Obtener el ID del rol de administrador
    SELECT id INTO admin_role_id 
    FROM roles 
    WHERE name = 'Administrador' 
    LIMIT 1;
    
    IF admin_role_id IS NULL THEN
        RAISE NOTICE 'ADVERTENCIA: No se encontró el rol "Administrador"';
        RETURN;
    END IF;
    
    -- Asignar todos los permisos de disposiciones al administrador
    FOR permission_record IN 
        SELECT id, name 
        FROM permissions 
        WHERE name LIKE 'disposiciones.%'
    LOOP
        -- Verificar si ya existe la asignación
        IF NOT EXISTS (
            SELECT 1 FROM role_permissions 
            WHERE role_id = admin_role_id 
            AND permission_id = permission_record.id
        ) THEN
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (admin_role_id, permission_record.id);
            
            RAISE NOTICE 'Asignado permiso % al rol Administrador', permission_record.name;
        ELSE
            RAISE NOTICE 'Permiso % ya estaba asignado al rol Administrador', permission_record.name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Permisos de disposiciones asignados correctamente al rol Administrador';
END $$;

-- ================================================================
-- VERIFICACIÓN Y RESUMEN
-- ================================================================
DO $$
DECLARE
    total_permisos_disposiciones INTEGER;
    total_asignaciones_admin INTEGER;
BEGIN
    -- Contar permisos de disposiciones
    SELECT COUNT(*) INTO total_permisos_disposiciones 
    FROM permissions 
    WHERE name LIKE 'disposiciones.%';
    
    -- Contar asignaciones al administrador
    SELECT COUNT(*) INTO total_asignaciones_admin
    FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    JOIN roles r ON rp.role_id = r.id
    WHERE p.name LIKE 'disposiciones.%' 
    AND r.name = 'Administrador';
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  RESUMEN DE PERMISOS DE DISPOSICIONES';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total de permisos creados: %', total_permisos_disposiciones;
    RAISE NOTICE 'Permisos asignados al Administrador: %', total_asignaciones_admin;
    RAISE NOTICE '';
    RAISE NOTICE 'Módulo de Disposiciones configurado correctamente!';
    RAISE NOTICE '';
END $$;
