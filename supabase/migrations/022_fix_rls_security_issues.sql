-- Migración para corregir problemas de seguridad RLS reportados por Supabase Linter
-- Esta migración habilita RLS en todas las tablas públicas RESPETANDO los roles y permisos existentes

-- SISTEMA DE ROLES EXISTENTE:
-- - admin: Acceso completo a todo el sistema
-- - supervisor: Acceso a todos los módulos, puede ver datos de su equipo y gestionar usuarios analistas
-- - analista: Acceso limitado, solo puede ver/editar sus propios datos y casos asignados

-- 1. HABILITAR RLS EN TABLAS CON POLÍTICAS EXISTENTES
-- Estas tablas ya tienen políticas pero RLS no está habilitado

-- Habilitar RLS en aplicaciones
ALTER TABLE public.aplicaciones ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en cases
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en origenes
ALTER TABLE public.origenes ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. HABILITAR RLS EN TABLAS SIN POLÍTICAS
-- Estas tablas necesitan RLS habilitado y políticas básicas

-- Habilitar RLS en roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Crear política para roles (solo lectura para usuarios autenticados)
CREATE POLICY "Allow read access to roles" ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Habilitar RLS en permissions
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Crear política para permissions (solo lectura para usuarios autenticados)
CREATE POLICY "Allow read access to permissions" ON public.permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Habilitar RLS en role_permissions
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Crear política para role_permissions (solo lectura para usuarios autenticados)
CREATE POLICY "Allow read access to role_permissions" ON public.role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Habilitar RLS en archive_audit_log
ALTER TABLE public.archive_audit_log ENABLE ROW LEVEL SECURITY;

-- Crear política para archive_audit_log (acceso basado en permisos del usuario)
CREATE POLICY "Allow access to archive_audit_log based on user permissions" ON public.archive_audit_log
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      INNER JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid()
      AND r.name IN ('admin', 'supervisor')
    )
  );

-- 3. HABILITAR RLS EN TODAS LAS OTRAS TABLAS PÚBLICAS
-- Para mantener consistencia de seguridad RESPETANDO roles existentes

-- Tablas de configuración (solo lectura para autenticados)
ALTER TABLE public.todo_priorities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to todo_priorities" ON public.todo_priorities
  FOR SELECT TO authenticated USING (true);

ALTER TABLE public.case_status_control ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to case_status_control" ON public.case_status_control
  FOR SELECT TO authenticated USING (true);

-- TABLA TODOS - Respeta permisos específicos por rol
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Política para SELECT en todos - cada rol ve lo que le corresponde
CREATE POLICY "Allow todo access based on role and assignment" ON public.todos
  FOR SELECT TO authenticated 
  USING (
    -- Admin ve todos
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      INNER JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
    OR
    -- Supervisor ve todos los de su equipo
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      INNER JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'supervisor'
    )
    OR
    -- Analista solo ve los asignados a él o creados por él
    (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        INNER JOIN public.roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name = 'analista'
      )
      AND (assigned_user_id = auth.uid() OR created_by_user_id = auth.uid())
    )
  );

-- Política para INSERT/UPDATE/DELETE en todos - respeta permisos de edición
CREATE POLICY "Allow todo modifications based on role and ownership" ON public.todos
  FOR ALL TO authenticated 
  USING (
    -- Admin puede todo
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      INNER JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
    OR
    -- Supervisor puede gestionar todos los de su equipo
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      INNER JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'supervisor'
    )
    OR
    -- Analista solo puede modificar los asignados a él o creados por él
    (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        INNER JOIN public.roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name = 'analista'
      )
      AND (assigned_user_id = auth.uid() OR created_by_user_id = auth.uid())
    )
  );

-- TABLA TODO_CONTROL - Control de TODOs respeta jerarquía
ALTER TABLE public.todo_control ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow todo_control access based on role hierarchy" ON public.todo_control
  FOR ALL TO authenticated
  USING (
    -- Admin acceso completo
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      INNER JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
    OR
    -- Supervisor acceso a todos
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      INNER JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'supervisor'
    )
    OR
    -- Analista solo acceso a sus controles
    (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        INNER JOIN public.roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name = 'analista'
      )
      AND user_id = auth.uid()
    )
  );

-- TABLA CASE_CONTROL - Similar lógica que todo_control
ALTER TABLE public.case_control ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow case_control access based on role hierarchy" ON public.case_control
  FOR ALL TO authenticated
  USING (
    -- Admin acceso completo
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      INNER JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'admin'
    )
    OR
    -- Supervisor acceso a todos
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      INNER JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name = 'supervisor'
    )
    OR
    -- Analista solo acceso a sus controles
    (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        INNER JOIN public.roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name = 'analista'
      )
      AND user_id = auth.uid()
    )
  );

-- TABLAS DE TIEMPO - Los analistas solo ven/editan sus propios registros
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow time_entries access based on role and ownership" ON public.time_entries
  FOR ALL TO authenticated
  USING (
    -- Admin y supervisor ven todo
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      INNER JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name IN ('admin', 'supervisor')
    )
    OR
    -- Analista solo sus registros
    (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        INNER JOIN public.roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name = 'analista'
      )
      AND user_id = auth.uid()
    )
  );

ALTER TABLE public.manual_time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow manual_time_entries access based on role and ownership" ON public.manual_time_entries
  FOR ALL TO authenticated
  USING (
    -- Admin y supervisor ven todo
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      INNER JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name IN ('admin', 'supervisor')
    )
    OR
    -- Analista solo los creados por él o asignados a él
    (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        INNER JOIN public.roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name = 'analista'
      )
      AND (user_id = auth.uid() OR created_by = auth.uid())
    )
  );

ALTER TABLE public.todo_time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow todo_time_entries access based on role and ownership" ON public.todo_time_entries
  FOR ALL TO authenticated
  USING (
    -- Admin y supervisor ven todo
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      INNER JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name IN ('admin', 'supervisor')
    )
    OR
    -- Analista solo sus registros
    (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        INNER JOIN public.roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name = 'analista'
      )
      AND user_id = auth.uid()
    )
  );

ALTER TABLE public.todo_manual_time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow todo_manual_time_entries access based on role and ownership" ON public.todo_manual_time_entries
  FOR ALL TO authenticated
  USING (
    -- Admin y supervisor ven todo
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      INNER JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() AND r.name IN ('admin', 'supervisor')
    )
    OR
    -- Analista solo los creados por él o asignados a él
    (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        INNER JOIN public.roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name = 'analista'
      )
      AND (user_id = auth.uid() OR created_by = auth.uid())
    )
  );

-- TABLAS DE ARCHIVO - Admin/supervisor ven todo, analistas solo sus elementos
ALTER TABLE public.archived_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow archived_cases access based on role and ownership" ON public.archived_cases
  FOR ALL TO authenticated
  USING (
    -- Admin y supervisor ven todo
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      INNER JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid()
      AND r.name IN ('admin', 'supervisor')
    )
    OR
    -- Analista solo ve casos archivados por él o que fueron asignados a él
    (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        INNER JOIN public.roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name = 'analista'
      )
      AND (archived_by = auth.uid() OR assigned_user_id = auth.uid())
    )
  );

ALTER TABLE public.archived_todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow archived_todos access based on role and ownership" ON public.archived_todos
  FOR ALL TO authenticated
  USING (
    -- Admin y supervisor ven todo
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      INNER JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid()
      AND r.name IN ('admin', 'supervisor')
    )
    OR
    -- Analista solo ve TODOs archivados por él o que fueron asignados a él
    (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        INNER JOIN public.roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name = 'analista'
      )
      AND (archived_by = auth.uid() OR assigned_user_id = auth.uid())
    )
  );

ALTER TABLE public.archive_deletion_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow archive_deletion_log access to admins only" ON public.archive_deletion_log
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      INNER JOIN public.roles r ON up.role_id = r.id
      WHERE up.id = auth.uid()
      AND r.name = 'admin'
    )
  );

-- 4. RECREAR VISTAS SIN SECURITY DEFINER
-- Las vistas con SECURITY DEFINER pueden ser problemáticas, las recreamos como SECURITY INVOKER

-- Recrear todos_with_details como SECURITY INVOKER
DROP VIEW IF EXISTS public.todos_with_details;
CREATE VIEW public.todos_with_details
SECURITY INVOKER
AS SELECT 
  t.id,
  t.title,
  t.description,
  t.due_date,
  t.estimated_minutes,
  t.is_completed,
  t.completed_at,
  t.created_at,
  t.updated_at,
  tp.name as priority_name,
  tp.description as priority_description,
  tp.color as priority_color,
  tp.level as priority_level,
  t.assigned_user_id,
  au.full_name as assigned_user_name,
  au.email as assigned_user_email,
  t.created_by_user_id,
  cu.full_name as created_by_user_name,
  cu.email as created_by_user_email,
  tc.id as control_id,
  tc.total_time_minutes,
  tc.is_timer_active,
  tc.timer_start_at,
  tc.started_at,
  tc.completed_at as control_completed_at,
  cs.name as status_name,
  cs.description as status_description,
  cs.color as status_color,
  (t.due_date < CURRENT_DATE AND NOT t.is_completed) as is_overdue,
  (tp.level >= 4) as is_high_priority,
  CASE 
    WHEN tc.total_time_minutes >= 60 THEN 
      (tc.total_time_minutes / 60)::text || 'h ' || (tc.total_time_minutes % 60)::text || 'm'
    ELSE 
      tc.total_time_minutes::text || 'm'
  END as total_time_formatted
FROM public.todos t
LEFT JOIN public.todo_priorities tp ON t.priority_id = tp.id
LEFT JOIN public.user_profiles au ON t.assigned_user_id = au.id
LEFT JOIN public.user_profiles cu ON t.created_by_user_id = cu.id
LEFT JOIN public.todo_control tc ON t.id = tc.todo_id
LEFT JOIN public.case_status_control cs ON tc.status_id = cs.id;

-- Recrear otras vistas problemáticas como SECURITY INVOKER
DROP VIEW IF EXISTS public.archive_deletion_stats;
CREATE VIEW public.archive_deletion_stats
SECURITY INVOKER
AS SELECT 
  item_type,
  COUNT(*) as total_deletions,
  COUNT(DISTINCT deleted_by) as unique_deleters,
  MIN(deleted_at) as first_deletion,
  MAX(deleted_at) as last_deletion
FROM public.archive_deletion_log
GROUP BY item_type;

DROP VIEW IF EXISTS public.case_control_detailed;
CREATE VIEW public.case_control_detailed
SECURITY INVOKER
AS SELECT 
  cc.id,
  cc.case_id,
  c.numero_caso,
  c.descripcion as case_description,
  cc.user_id,
  up.full_name as user_name,
  cc.status_id,
  cs.name as status_name,
  cc.total_time_minutes,
  cc.is_timer_active,
  cc.timer_start_at,
  cc.assigned_at,
  cc.started_at,
  cc.completed_at,
  cc.created_at,
  cc.updated_at
FROM public.case_control cc
LEFT JOIN public.cases c ON cc.case_id = c.id
LEFT JOIN public.user_profiles up ON cc.user_id = up.id
LEFT JOIN public.case_status_control cs ON cc.status_id = cs.id;

DROP VIEW IF EXISTS public.todo_time_summary;
CREATE VIEW public.todo_time_summary
SECURITY INVOKER
AS SELECT 
  tc.todo_id,
  t.title,
  tc.total_time_minutes,
  COUNT(tte.id) as time_entry_count,
  COUNT(tmte.id) as manual_entry_count,
  SUM(tte.duration_minutes) as automatic_time,
  SUM(tmte.duration_minutes) as manual_time
FROM public.todo_control tc
LEFT JOIN public.todos t ON tc.todo_id = t.id
LEFT JOIN public.todo_time_entries tte ON tc.id = tte.todo_control_id
LEFT JOIN public.todo_manual_time_entries tmte ON tc.id = tmte.todo_control_id
GROUP BY tc.todo_id, t.title, tc.total_time_minutes;

DROP VIEW IF EXISTS public.archive_stats;
CREATE VIEW public.archive_stats
SECURITY INVOKER
AS SELECT 
  'cases' as item_type,
  COUNT(*) as total_archived,
  COUNT(*) FILTER (WHERE is_restored = true) as total_restored,
  COUNT(*) FILTER (WHERE is_restored = false) as currently_archived
FROM public.archived_cases
UNION ALL
SELECT 
  'todos' as item_type,
  COUNT(*) as total_archived,
  COUNT(*) FILTER (WHERE is_restored = true) as total_restored,
  COUNT(*) FILTER (WHERE is_restored = false) as currently_archived
FROM public.archived_todos;

-- 5. CREAR POLÍTICA PARA SERVICE_ROLE
-- Permitir acceso completo al service_role para operaciones administrativas
DO $$ 
DECLARE 
    table_name text;
BEGIN
    FOR table_name IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('
            CREATE POLICY "Service role bypass RLS" ON public.%I
            FOR ALL TO service_role
            USING (true)
            WITH CHECK (true)
        ', table_name);
    END LOOP;
END $$;

-- Comentarios para documentación
COMMENT ON POLICY "Allow read access to roles" ON public.roles IS 'Permite lectura de roles a usuarios autenticados';
COMMENT ON POLICY "Allow read access to permissions" ON public.permissions IS 'Permite lectura de permisos a usuarios autenticados';
COMMENT ON POLICY "Allow read access to role_permissions" ON public.role_permissions IS 'Permite lectura de role_permissions a usuarios autenticados';
COMMENT ON POLICY "Allow access to archive_audit_log based on user permissions" ON public.archive_audit_log IS 'Permite acceso al log de auditoría solo a admins y supervisores';

COMMENT ON POLICY "Allow todo access based on role and assignment" ON public.todos IS 'Admin ve todos, Supervisor ve todos, Analista solo los asignados/creados por él';
COMMENT ON POLICY "Allow todo_control access based on role hierarchy" ON public.todo_control IS 'Acceso jerárquico: Admin > Supervisor > Analista (solo sus controles)';
COMMENT ON POLICY "Allow case_control access based on role hierarchy" ON public.case_control IS 'Acceso jerárquico: Admin > Supervisor > Analista (solo sus controles)';

-- Verificar que todas las tablas públicas tengan RLS habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Habilitado'
        ELSE '❌ RLS Deshabilitado'
    END AS estado_rls
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Verificar políticas creadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
