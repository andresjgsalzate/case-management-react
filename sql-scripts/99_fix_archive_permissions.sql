-- ================================================================
-- CORRECCIÓN DE PERMISOS DE ARCHIVO
-- ================================================================
-- Descripción: Agrega permisos faltantes para el módulo de archivo
-- Problema: Las funciones buscan archive.read_* pero están configurados archive.view_*
-- Solución: Agregar los permisos que las funciones esperan
-- Fecha: 6 de Agosto, 2025
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  CORRECCIÓN PERMISOS DE ARCHIVO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE '';
END $$;

-- ================================================================
-- VERIFICAR Y CREAR CONSTRAINT ÚNICO EN ROLE_PERMISSIONS
-- ================================================================

DO $$
BEGIN
    -- Verificar si existe el constraint único
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'role_permissions' 
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%role_id%permission_id%'
    ) THEN
        -- Crear constraint único para evitar duplicados
        ALTER TABLE role_permissions 
        ADD CONSTRAINT role_permissions_role_id_permission_id_unique 
        UNIQUE (role_id, permission_id);
        
        RAISE NOTICE '✅ Constraint único agregado a role_permissions';
    ELSE
        RAISE NOTICE '⚠️  Constraint único ya existe en role_permissions';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '⚠️  No se pudo agregar constraint único: %', SQLERRM;
END $$;

-- ================================================================
-- AGREGAR PERMISOS DE LECTURA DE ARCHIVO (archive.read_*)
-- ================================================================

-- Verificar si los permisos ya existen
DO $$
BEGIN
    -- archive.read_own
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'archive.read_own') THEN
        INSERT INTO permissions (name, description, resource, action, scope) 
        VALUES ('archive.read_own', 'Leer elementos archivados propios', 'archive', 'read', 'own');
        RAISE NOTICE '✅ Permiso archive.read_own creado';
    ELSE
        RAISE NOTICE '⚠️  Permiso archive.read_own ya existe';
    END IF;

    -- archive.read_team
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'archive.read_team') THEN
        INSERT INTO permissions (name, description, resource, action, scope) 
        VALUES ('archive.read_team', 'Leer elementos archivados del equipo', 'archive', 'read', 'team');
        RAISE NOTICE '✅ Permiso archive.read_team creado';
    ELSE
        RAISE NOTICE '⚠️  Permiso archive.read_team ya existe';
    END IF;

    -- archive.read_all
    IF NOT EXISTS (SELECT 1 FROM permissions WHERE name = 'archive.read_all') THEN
        INSERT INTO permissions (name, description, resource, action, scope) 
        VALUES ('archive.read_all', 'Leer todos los elementos archivados', 'archive', 'read', 'all');
        RAISE NOTICE '✅ Permiso archive.read_all creado';
    ELSE
        RAISE NOTICE '⚠️  Permiso archive.read_all ya existe';
    END IF;
END $$;

-- ================================================================
-- ASIGNAR PERMISOS AL ROL ADMINISTRADOR
-- ================================================================

DO $$
DECLARE
    admin_role_id UUID;
    perm_read_own_id UUID;
    perm_read_team_id UUID;
    perm_read_all_id UUID;
BEGIN
    -- Mostrar roles disponibles para debugging
    RAISE NOTICE 'Roles disponibles en el sistema:';
    FOR admin_role_id IN 
        SELECT id FROM roles ORDER BY name
    LOOP
        RAISE NOTICE '  - Role ID: %, Nombre: %', 
            admin_role_id, 
            (SELECT name FROM roles WHERE id = admin_role_id);
    END LOOP;

    -- Intentar obtener ID del rol administrador con diferentes nombres posibles
    SELECT id INTO admin_role_id FROM roles 
    WHERE LOWER(name) IN ('administrador', 'admin', 'administrator', 'superadmin') 
    LIMIT 1;
    
    IF admin_role_id IS NULL THEN
        -- Si no existe ningún rol de administrador, crear uno
        INSERT INTO roles (name, description) 
        VALUES ('Administrador', 'Rol de administrador del sistema')
        RETURNING id INTO admin_role_id;
        
        RAISE NOTICE '✅ Rol Administrador creado con ID: %', admin_role_id;
    ELSE
        RAISE NOTICE '✅ Rol encontrado con ID: %', admin_role_id;
    END IF;

    -- Obtener IDs de los permisos
    SELECT id INTO perm_read_own_id FROM permissions WHERE name = 'archive.read_own';
    SELECT id INTO perm_read_team_id FROM permissions WHERE name = 'archive.read_team';
    SELECT id INTO perm_read_all_id FROM permissions WHERE name = 'archive.read_all';

    -- Verificar que los permisos existen
    IF perm_read_own_id IS NULL OR perm_read_team_id IS NULL OR perm_read_all_id IS NULL THEN
        RAISE EXCEPTION 'Algunos permisos de archivo no fueron creados correctamente';
    END IF;

    -- Asignar permisos al rol administrador
    -- Verificar y insertar cada permiso individualmente para evitar duplicados
    IF NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = admin_role_id AND permission_id = perm_read_own_id) THEN
        INSERT INTO role_permissions (role_id, permission_id) VALUES (admin_role_id, perm_read_own_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = admin_role_id AND permission_id = perm_read_team_id) THEN
        INSERT INTO role_permissions (role_id, permission_id) VALUES (admin_role_id, perm_read_team_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM role_permissions WHERE role_id = admin_role_id AND permission_id = perm_read_all_id) THEN
        INSERT INTO role_permissions (role_id, permission_id) VALUES (admin_role_id, perm_read_all_id);
    END IF;

    RAISE NOTICE '✅ Permisos de lectura de archivo asignados al rol Administrador (ID: %)', admin_role_id;
END $$;

-- ================================================================
-- VERIFICACIÓN FINAL
-- ================================================================

DO $$
DECLARE
    admin_role_id UUID;
    total_permisos INTEGER;
    role_name TEXT;
BEGIN
    -- Obtener el rol de administrador
    SELECT id, name INTO admin_role_id, role_name FROM roles 
    WHERE LOWER(name) IN ('administrador', 'admin', 'administrator', 'superadmin') 
    LIMIT 1;
    
    IF admin_role_id IS NULL THEN
        RAISE NOTICE '❌ No se encontró rol de administrador';
        RETURN;
    END IF;
    
    SELECT COUNT(*) INTO total_permisos 
    FROM role_permissions rp
    JOIN permissions p ON rp.permission_id = p.id
    WHERE rp.role_id = admin_role_id 
    AND p.name IN ('archive.read_own', 'archive.read_team', 'archive.read_all');
    
    RAISE NOTICE '';
    RAISE NOTICE '📊 VERIFICACIÓN FINAL:';
    RAISE NOTICE '   - Rol usado: % (ID: %)', role_name, admin_role_id;
    RAISE NOTICE '   - Permisos de lectura de archivo: %', total_permisos;
    RAISE NOTICE '   - Esperados: 3';
    
    IF total_permisos = 3 THEN
        RAISE NOTICE '✅ Todos los permisos configurados correctamente';
    ELSE
        RAISE NOTICE '❌ Faltan permisos por configurar';
    END IF;
    RAISE NOTICE '';
END $$;

-- ================================================================
-- MENSAJE FINAL
-- ================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '  CORRECCIÓN COMPLETADA';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Ahora el módulo de archivo debería funcionar';
    RAISE NOTICE 'correctamente con los permisos agregados.';
    RAISE NOTICE '';
    RAISE NOTICE 'Para verificar, actualiza la página web';
    RAISE NOTICE 'y ve al módulo de Archivo.';
    RAISE NOTICE '';
END $$;
