-- =====================================================
-- CORRECCIÓN: Permisos Completos para Rol de Auditor
-- =====================================================
-- Problema: El rol de auditor no tiene todos los permisos necesarios
-- para hacer auditorías completas del sistema
-- Solución: Asignar todos los permisos de solo lectura necesarios

-- Obtener el ID del rol de auditor y asignar permisos faltantes
DO $$
DECLARE
  auditor_role_id uuid;
  current_permission_id uuid;
  permisos_auditoria text[] := ARRAY[
    -- Permisos de casos (lectura)
    'cases.read.own',
    'cases.read.all',
    
    -- Permisos de usuarios (lectura)
    'users.read',
    
    -- Permisos de orígenes y aplicaciones (lectura)
    'origenes.read',
    'aplicaciones.read',
    
    -- Permisos de roles y permisos (lectura)
    'roles.read',
    'permissions.read',
    
    -- Permisos de acceso administrativo (solo lectura)
    'admin.access',
    'admin.dashboard',
    
    -- Permisos de control de casos (lectura)
    'case_control.view',
    'case_control.view_all',
    'case_control.view_reports',
    'case_control.export_reports',
    'case_control.view_team_reports',
    'case_control.view_dashboard',
    'case_control.view_team_stats',
    
    -- Permisos de sistema
    'system.access',
    
    -- Permisos de TODOs (lectura)
    'view_todos',
    'view_all_todos',
    'export_todos',
    
    -- Permisos de notificaciones (lectura)
    'notifications.view',
    
    -- Permisos de notas (lectura)
    'notes.view',
    'notes.view_all',
    'notes.view_team',
    'notes.export'
  ];
  permiso text;
BEGIN
  -- Obtener el ID del rol auditor
  SELECT id INTO auditor_role_id FROM roles WHERE name = 'auditor';
  
  IF auditor_role_id IS NULL THEN
    RAISE EXCEPTION 'Rol de auditor no encontrado';
  END IF;
  
  -- Asignar cada permiso al rol de auditor
  FOREACH permiso IN ARRAY permisos_auditoria
  LOOP
    -- Buscar el permiso
    SELECT id INTO current_permission_id FROM permissions WHERE name = permiso;
    
    IF current_permission_id IS NOT NULL THEN
      -- Verificar si ya existe la asignación
      IF NOT EXISTS (
        SELECT 1 FROM role_permissions 
        WHERE role_id = auditor_role_id AND permission_id = current_permission_id
      ) THEN
        -- Insertar la asignación
        INSERT INTO role_permissions (role_id, permission_id) 
        VALUES (auditor_role_id, current_permission_id);
        
        RAISE NOTICE 'Permiso asignado: %', permiso;
      ELSE
        RAISE NOTICE 'Permiso ya asignado: %', permiso;
      END IF;
    ELSE
      RAISE NOTICE 'Permiso no encontrado: %', permiso;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Permisos de auditoría asignados correctamente al rol auditor';
END $$;

-- Verificar los permisos asignados al rol auditor
DO $$
DECLARE
  auditor_role_id uuid;
  total_permisos integer;
BEGIN
  SELECT id INTO auditor_role_id FROM roles WHERE name = 'auditor';
  
  SELECT COUNT(*) INTO total_permisos 
  FROM role_permissions rp
  JOIN permissions p ON rp.permission_id = p.id
  WHERE rp.role_id = auditor_role_id AND p.is_active = true;
  
  RAISE NOTICE 'Total de permisos asignados al auditor: %', total_permisos;
END $$;

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'ROL DE AUDITOR - PERMISOS COMPLETADOS';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'El auditor ahora tiene acceso completo de solo lectura a:';
  RAISE NOTICE '✅ Casos: Ver todos los casos del sistema';
  RAISE NOTICE '✅ TODOs: Ver todos los TODOs y exportar datos';
  RAISE NOTICE '✅ Notas: Ver todas las notas y exportar';
  RAISE NOTICE '✅ Control de Casos: Ver reportes y estadísticas';
  RAISE NOTICE '✅ Usuarios: Ver perfiles y actividad';
  RAISE NOTICE '✅ Roles y Permisos: Ver configuración del sistema';
  RAISE NOTICE '✅ Orígenes y Aplicaciones: Ver catálogos';
  RAISE NOTICE '✅ Dashboard: Acceso a métricas administrativas';
  RAISE NOTICE '✅ Notificaciones: Ver notificaciones del sistema';
  RAISE NOTICE '✅ Sistema: Acceso básico completo';
  RAISE NOTICE '=====================================================';
END $$;
