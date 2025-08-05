-- ================================================================
-- SCRIPT DE LIMPIEZA TOTAL: ELIMINACIÓN COMPLETA DE PERMISOS
-- ================================================================
-- Descripción: Elimina TODAS las políticas RLS, roles y permisos
-- Fecha: 4 de Agosto, 2025
-- Versión: 1.0.0
-- ================================================================
-- IMPORTANTE: Este script elimina COMPLETAMENTE el sistema de permisos
-- Todos los usuarios podrán ver y hacer TODO en el sistema
-- ================================================================

-- ================================================================
-- PASO 1: DESACTIVAR RLS EN TODAS LAS TABLAS
-- ================================================================

-- Tablas principales del sistema
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE case_status_control DISABLE ROW LEVEL SECURITY;
ALTER TABLE case_control DISABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE manual_time_entries DISABLE ROW LEVEL SECURITY;

-- Tablas de aplicaciones y orígenes
ALTER TABLE aplicaciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE origenes DISABLE ROW LEVEL SECURITY;

-- Tablas de TODO
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;
ALTER TABLE todo_control DISABLE ROW LEVEL SECURITY;
ALTER TABLE todo_time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE todo_manual_time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE todo_priorities DISABLE ROW LEVEL SECURITY;

-- Tablas de notas
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;

-- Tablas de archivo
ALTER TABLE archived_cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE archived_todos DISABLE ROW LEVEL SECURITY;
ALTER TABLE archive_deletion_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE archive_audit_log DISABLE ROW LEVEL SECURITY;

-- Tablas de documentación
ALTER TABLE solution_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE solution_document_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE solution_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE solution_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE solution_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE solution_document_tags DISABLE ROW LEVEL SECURITY;
ALTER TABLE solution_document_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_attachments DISABLE ROW LEVEL SECURITY;

-- Tablas de disposiciones
ALTER TABLE disposiciones_scripts DISABLE ROW LEVEL SECURITY;

-- Tablas de roles y permisos (si existen)
ALTER TABLE roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE permissions DISABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- PASO 2: ELIMINAR TODAS LAS POLÍTICAS RLS
-- ================================================================

-- Obtener y eliminar todas las políticas RLS del esquema public
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Iterar sobre todas las políticas RLS en el esquema public
    FOR policy_record IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        -- Ejecutar DROP POLICY para cada política encontrada
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
            policy_record.policyname,
            policy_record.schemaname,
            policy_record.tablename);
        
        RAISE NOTICE 'Eliminada política: % en tabla: %', 
            policy_record.policyname, policy_record.tablename;
    END LOOP;
END $$;

-- ================================================================
-- PASO 3: LIMPIAR TABLAS DE ROLES Y PERMISOS
-- ================================================================

-- Eliminar todas las relaciones de roles y permisos
DELETE FROM role_permissions WHERE TRUE;
DELETE FROM permissions WHERE TRUE;
DELETE FROM roles WHERE TRUE;

-- ================================================================
-- PASO 4: SIMPLIFICAR USER_PROFILES
-- ================================================================

-- Eliminar columnas relacionadas con roles complejos si existen
-- (role_id ya existe en la estructura actual, la mantendremos como NULL por ahora)

-- Agregar columna role_name si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_profiles' 
        AND column_name = 'role_name'
    ) THEN
        ALTER TABLE user_profiles ADD COLUMN role_name TEXT DEFAULT 'user';
    END IF;
END $$;

-- Simplificar roles basándose en la tabla roles existente
-- Primero actualizar role_name basado en el role_id actual
UPDATE user_profiles 
SET role_name = (
    SELECT CASE 
        WHEN r.name IN ('admin', 'administrador') THEN 'admin'
        WHEN r.name IN ('supervisor', 'coordinador') THEN 'admin' 
        ELSE 'user'
    END
    FROM roles r 
    WHERE r.id = user_profiles.role_id
)
WHERE role_id IS NOT NULL;

-- Para usuarios sin role_id, asignar 'user'
UPDATE user_profiles SET role_name = 'user' WHERE role_id IS NULL;

-- Activar todos los usuarios
UPDATE user_profiles SET is_active = true WHERE is_active IS NULL OR is_active = false;

-- Limpiar role_id (dejarlo en NULL para simplificar)
UPDATE user_profiles SET role_id = NULL;

-- ================================================================
-- PASO 5: ELIMINAR CONSTRAINTS COMPLEJOS Y AGREGAR SIMPLES
-- ================================================================

-- Agregar constraint simple para role_name
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_role_name_check 
    CHECK (role_name IN ('admin', 'user'));

-- ================================================================
-- PASO 6: OTORGAR PERMISOS COMPLETOS A TODOS
-- ================================================================

-- Otorgar todos los permisos a usuarios autenticados
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- También para usuarios anónimos (solo lectura)
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Permisos específicos para tablas principales
GRANT SELECT, INSERT, UPDATE, DELETE ON user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON case_status_control TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON case_control TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON time_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON manual_time_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON aplicaciones TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON origenes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON todos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON todo_control TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON todo_time_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON todo_manual_time_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON todo_priorities TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON notes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON archived_cases TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON archived_todos TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON archive_deletion_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON archive_audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON solution_documents TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON solution_document_versions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON solution_feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON solution_categories TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON solution_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON solution_document_tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON solution_document_types TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON document_attachments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON disposiciones_scripts TO authenticated;

-- ================================================================
-- PASO 7: ELIMINAR FUNCIONES COMPLEJAS DE PERMISOS
-- ================================================================

-- Eliminar todas las funciones relacionadas con permisos complejos
DROP FUNCTION IF EXISTS has_permission(uuid, text);
DROP FUNCTION IF EXISTS check_user_permission(uuid, text);
DROP FUNCTION IF EXISTS get_user_permissions(uuid);
DROP FUNCTION IF EXISTS assign_role_to_user(uuid, uuid);
DROP FUNCTION IF EXISTS remove_role_from_user(uuid, uuid);
DROP FUNCTION IF EXISTS has_role(uuid, text);
DROP FUNCTION IF EXISTS is_admin(uuid);
DROP FUNCTION IF EXISTS is_supervisor(uuid);
DROP FUNCTION IF EXISTS can_access_resource(uuid, text, text);

-- Funciones de validación de roles complejas
DROP FUNCTION IF EXISTS validate_user_role(uuid);
DROP FUNCTION IF EXISTS get_effective_permissions(uuid);
DROP FUNCTION IF EXISTS check_resource_access(uuid, text);

-- ================================================================
-- PASO 8: LIMPIAR VISTAS COMPLEJAS
-- ================================================================

-- Eliminar vistas que dependían del sistema de permisos complejo
DROP VIEW IF EXISTS user_permissions_view;
DROP VIEW IF EXISTS role_permissions_view;
DROP VIEW IF EXISTS effective_user_permissions;
DROP VIEW IF EXISTS user_roles_summary;

-- ================================================================
-- PASO 9: ELIMINAR TABLAS DE ROLES/PERMISOS (OPCIONAL)
-- ================================================================

-- Si queremos eliminar completamente las tablas de roles/permisos
-- Descomenta estas líneas si quieres eliminar las tablas:

-- DROP TABLE IF EXISTS user_role_permissions CASCADE;
-- DROP TABLE IF EXISTS role_permissions CASCADE;
-- DROP TABLE IF EXISTS permissions CASCADE;
-- DROP TABLE IF EXISTS roles CASCADE;

-- ================================================================
-- PASO 10: CREAR FUNCIONES BÁSICAS SIN RESTRICCIONES
-- ================================================================

-- Función de métricas del dashboard sin restricciones de permisos
CREATE OR REPLACE FUNCTION get_dashboard_metrics(user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_cases INTEGER;
    completed_cases INTEGER;
    pending_cases INTEGER;
    in_progress_cases INTEGER;
BEGIN
    -- Contar todos los casos (sin restricciones)
    SELECT COUNT(*) INTO total_cases FROM cases;
    
    SELECT COUNT(*) INTO completed_cases 
    FROM case_control cc 
    JOIN case_status_control csc ON cc.status_id = csc.id
    WHERE csc.name = 'Terminada';
    
    SELECT COUNT(*) INTO pending_cases 
    FROM case_control cc 
    JOIN case_status_control csc ON cc.status_id = csc.id
    WHERE csc.name = 'Pendiente';
    
    SELECT COUNT(*) INTO in_progress_cases 
    FROM case_control cc 
    JOIN case_status_control csc ON cc.status_id = csc.id
    WHERE csc.name = 'En Curso';
    
    -- Construir resultado JSON
    result := json_build_object(
        'totalCases', total_cases,
        'completedCases', completed_cases,
        'pendingCases', pending_cases,
        'inProgressCases', in_progress_cases,
        'userRole', 'all_access',
        'isActive', true
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función de métricas de TODOs sin restricciones
CREATE OR REPLACE FUNCTION get_todo_metrics(user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_todos INTEGER;
    completed_todos INTEGER;
    pending_todos INTEGER;
    in_progress_todos INTEGER;
    overdue_todos INTEGER;
BEGIN
    -- Contar todos los TODOs (sin restricciones)
    SELECT COUNT(*) INTO total_todos FROM todos;
    
    SELECT COUNT(*) INTO completed_todos FROM todos WHERE is_completed = true;
    
    SELECT COUNT(*) INTO pending_todos 
    FROM todos WHERE is_completed = false;
    
    SELECT COUNT(*) INTO in_progress_todos 
    FROM todos t
    JOIN todo_control tc ON t.id = tc.todo_id
    WHERE t.is_completed = false AND tc.started_at IS NOT NULL AND tc.completed_at IS NULL;
    
    SELECT COUNT(*) INTO overdue_todos 
    FROM todos 
    WHERE due_date < CURRENT_DATE AND is_completed = false;
    
    -- Construir resultado JSON
    result := json_build_object(
        'totalTodos', total_todos,
        'completedTodos', completed_todos,
        'pendingTodos', pending_todos,
        'inProgressTodos', in_progress_todos,
        'overdueTodos', overdue_todos,
        'userRole', 'all_access',
        'isActive', true
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- PASO 11: OTORGAR PERMISOS A FUNCIONES
-- ================================================================

GRANT EXECUTE ON FUNCTION get_dashboard_metrics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_todo_metrics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_dashboard_metrics(UUID) TO anon;
GRANT EXECUTE ON FUNCTION get_todo_metrics(UUID) TO anon;

-- ================================================================
-- VERIFICACIÓN FINAL
-- ================================================================

-- Mostrar estado de RLS (debe estar todo DISABLED)
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'user_profiles', 'cases', 'case_status_control', 'case_control', 'time_entries',
    'todos', 'todo_control', 'todo_time_entries', 'todo_manual_time_entries',
    'notes', 'archived_cases', 'archived_todos', 'solution_documents',
    'aplicaciones', 'origenes', 'disposiciones_scripts'
)
ORDER BY tablename;

-- Contar políticas RLS restantes (debe ser 0)
SELECT COUNT(*) as remaining_policies 
FROM pg_policies 
WHERE schemaname = 'public';

-- Mostrar roles simplificados en user_profiles
SELECT 
    role_name,
    COUNT(*) as user_count,
    COUNT(CASE WHEN is_active THEN 1 END) as active_count
FROM user_profiles 
GROUP BY role_name
ORDER BY role_name;

-- ================================================================
-- FIN DEL SCRIPT DE LIMPIEZA TOTAL
-- ================================================================
-- RESULTADO: Sistema completamente abierto
-- - Sin políticas RLS
-- - Sin restricciones de permisos
-- - Todos los usuarios pueden ver y hacer TODO
-- - Sistema listo para construir nuevo sistema de roles desde cero
-- ================================================================

-- Mensaje final
SELECT 'SISTEMA DE PERMISOS COMPLETAMENTE ELIMINADO - TODOS TIENEN ACCESO TOTAL' as status;
