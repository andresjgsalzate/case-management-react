-- Script para limpiar políticas RLS duplicadas y legacy
-- Elimina políticas antiguas que hardcodean roles, manteniendo solo las dinámicas basadas en permisos

-- ELIMINAR POLÍTICAS LEGACY/DUPLICADAS EN TABLAS DE ARCHIVO

-- archived_cases: eliminar políticas legacy que hardcodean roles
DROP POLICY IF EXISTS "Users can view archived cases based on permissions" ON public.archived_cases;
DROP POLICY IF EXISTS "Users can update archived cases based on permissions" ON public.archived_cases;
DROP POLICY IF EXISTS "Authenticated users can archive cases" ON public.archived_cases;
DROP POLICY IF EXISTS "Only admins can delete archived cases" ON public.archived_cases;

-- archived_todos: eliminar políticas legacy que hardcodean roles  
DROP POLICY IF EXISTS "Users can view archived todos based on permissions" ON public.archived_todos;
DROP POLICY IF EXISTS "Users can update archived todos based on permissions" ON public.archived_todos;
DROP POLICY IF EXISTS "Authenticated users can archive todos" ON public.archived_todos;
DROP POLICY IF EXISTS "Only admins can delete archived todos" ON public.archived_todos;

-- archive_deletion_log: eliminar políticas legacy
DROP POLICY IF EXISTS "Only admins can view deletion log" ON public.archive_deletion_log;
DROP POLICY IF EXISTS "System can insert deletion log" ON public.archive_deletion_log;

-- ELIMINAR POLÍTICAS LEGACY EN OTRAS TABLAS QUE HARDCODEAN ROLES

-- todos: eliminar políticas que hardcodean roles específicos
DROP POLICY IF EXISTS "Ver TODOs según rol y asignación" ON public.todos;
DROP POLICY IF EXISTS "Actualizar TODOs según rol y permisos" ON public.todos;
DROP POLICY IF EXISTS "Eliminar TODOs propios y asignados" ON public.todos;
DROP POLICY IF EXISTS "Usuarios activos pueden crear TODOs" ON public.todos;

-- todo_control: eliminar políticas legacy
DROP POLICY IF EXISTS "Ver control de TODOs según rol" ON public.todo_control;
DROP POLICY IF EXISTS "Actualizar control de TODOs según rol" ON public.todo_control;
DROP POLICY IF EXISTS "Crear control de TODOs" ON public.todo_control;

-- todo_time_entries: eliminar políticas legacy
DROP POLICY IF EXISTS "Ver entradas de tiempo de TODOs según rol" ON public.todo_time_entries;
DROP POLICY IF EXISTS "Actualizar entradas de tiempo de TODOs según rol" ON public.todo_time_entries;
DROP POLICY IF EXISTS "Eliminar entradas de tiempo automático según rol" ON public.todo_time_entries;
DROP POLICY IF EXISTS "Crear entradas de tiempo para TODOs" ON public.todo_time_entries;

-- todo_manual_time_entries: eliminar políticas legacy
DROP POLICY IF EXISTS "Ver entradas manuales de tiempo de TODOs según rol" ON public.todo_manual_time_entries;
DROP POLICY IF EXISTS "Actualizar entradas manuales de tiempo de TODOs según rol" ON public.todo_manual_time_entries;
DROP POLICY IF EXISTS "Eliminar entradas de tiempo manual según rol" ON public.todo_manual_time_entries;
DROP POLICY IF EXISTS "Crear entradas manuales de tiempo para TODOs" ON public.todo_manual_time_entries;

-- todo_priorities: eliminar políticas legacy
DROP POLICY IF EXISTS "Solo admins pueden gestionar prioridades de TODO" ON public.todo_priorities;
DROP POLICY IF EXISTS "Todos pueden ver prioridades de TODO" ON public.todo_priorities;

-- cases: eliminar políticas legacy que hardcodean roles
DROP POLICY IF EXISTS "Supervisor cases access" ON public.cases;
DROP POLICY IF EXISTS "System access required for cases" ON public.cases;

-- case_control: eliminar políticas legacy
DROP POLICY IF EXISTS "System access required for case_control" ON public.case_control;
DROP POLICY IF EXISTS "case_control_select_policy" ON public.case_control;
DROP POLICY IF EXISTS "case_control_insert_policy" ON public.case_control;
DROP POLICY IF EXISTS "case_control_update_policy" ON public.case_control;
DROP POLICY IF EXISTS "case_control_delete_policy" ON public.case_control;

-- case_status_control: eliminar políticas legacy
DROP POLICY IF EXISTS "case_status_control_select_policy" ON public.case_status_control;
DROP POLICY IF EXISTS "case_status_control_insert_policy" ON public.case_status_control;
DROP POLICY IF EXISTS "case_status_control_update_policy" ON public.case_status_control;
DROP POLICY IF EXISTS "case_status_control_delete_policy" ON public.case_status_control;

-- time_entries: eliminar políticas legacy
DROP POLICY IF EXISTS "time_entries_select_policy" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_insert_policy" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_update_policy" ON public.time_entries;
DROP POLICY IF EXISTS "time_entries_delete_policy" ON public.time_entries;

-- manual_time_entries: eliminar políticas legacy
DROP POLICY IF EXISTS "manual_time_entries_select_policy" ON public.manual_time_entries;
DROP POLICY IF EXISTS "manual_time_entries_insert_policy" ON public.manual_time_entries;
DROP POLICY IF EXISTS "manual_time_entries_update_policy" ON public.manual_time_entries;
DROP POLICY IF EXISTS "manual_time_entries_delete_policy" ON public.manual_time_entries;

-- ELIMINAR POLÍTICAS ANTIGUAS EN APLICACIONES Y ORIGENES QUE PERMITEN ACCESO PÚBLICO
DROP POLICY IF EXISTS "Anyone can view aplicaciones" ON public.aplicaciones;
DROP POLICY IF EXISTS "Anyone can view origenes" ON public.origenes;

-- CREAR POLÍTICAS MEJORADAS PARA APLICACIONES Y ORÍGENES (deben usar permisos)
CREATE POLICY "Allow aplicaciones access based on permissions" ON public.aplicaciones
  FOR SELECT TO authenticated 
  USING (
    has_permission(auth.uid(), 'admin.access') OR
    has_permission(auth.uid(), 'system.access') OR
    has_permission(auth.uid(), 'cases.create') OR
    has_permission(auth.uid(), 'cases.read.own') OR
    has_permission(auth.uid(), 'cases.read.all')
  );

CREATE POLICY "Allow origenes access based on permissions" ON public.origenes
  FOR SELECT TO authenticated 
  USING (
    has_permission(auth.uid(), 'admin.access') OR
    has_permission(auth.uid(), 'system.access') OR
    has_permission(auth.uid(), 'cases.create') OR
    has_permission(auth.uid(), 'cases.read.own') OR
    has_permission(auth.uid(), 'cases.read.all')
  );

-- ELIMINAR FUNCIONES LEGACY QUE YA NO SE USAN
DROP FUNCTION IF EXISTS has_system_access();
DROP FUNCTION IF EXISTS has_case_control_permission(text);

-- VERIFICAR RESULTADO: Mostrar solo las políticas dinámicas restantes
SELECT 
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%has_permission%' THEN '✅ Dinámica'
        WHEN qual LIKE '%service_role%' THEN '🔧 Service Role'
        WHEN qual LIKE '%admin.access%' THEN '✅ Usa admin.access'
        WHEN qual LIKE '%r.name%' THEN '❌ Hardcoded Role'
        ELSE '⚠️ Revisar'
    END AS tipo_politica
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('cases', 'todos', 'archived_cases', 'archived_todos', 'case_control', 'todo_control')
ORDER BY tablename, policyname;

-- Comentarios de documentación
COMMENT ON SCHEMA public IS 'Schema público con políticas RLS dinámicas basadas en el sistema de permisos';

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Limpieza de políticas RLS completada.';
    RAISE NOTICE '🔧 Se eliminaron políticas legacy que hardcodeaban roles.';
    RAISE NOTICE '✅ Se mantuvieron solo las políticas dinámicas basadas en permisos.';
    RAISE NOTICE '🔒 Las políticas de service_role se conservaron para operaciones administrativas.';
END $$;
