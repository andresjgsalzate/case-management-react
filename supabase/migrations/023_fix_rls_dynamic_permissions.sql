-- Migración para corregir problemas de seguridad RLS reportados por Supabase Linter
-- Esta migración habilita RLS en todas las tablas públicas usando el SISTEMA DE PERMISOS DINÁMICO

-- SISTEMA DINÁMICO BASADO EN PERMISOS:
-- Basado en los permisos reales de la BD: admin.access, cases.create, cases.read.all, etc.
-- Esto permite agregar nuevos roles sin modificar las políticas RLS

-- FUNCIONES HELPER PARA VERIFICAR PERMISOS
-- Estas funciones verifican permisos dinámicamente basándose en la tabla permissions

-- Función para verificar si un usuario tiene un permiso específico
CREATE OR REPLACE FUNCTION has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_profiles up
    INNER JOIN public.roles r ON up.role_id = r.id
    INNER JOIN public.role_permissions rp ON r.id = rp.role_id
    INNER JOIN public.permissions p ON rp.permission_id = p.id
    WHERE up.id = user_id
    AND p.name = permission_name
    AND p.is_active = true
    AND up.is_active = true
    AND r.is_active = true
  );
END;
$$;

-- Función para verificar permisos de recursos con comodín (ej: "cases.*")
CREATE OR REPLACE FUNCTION has_resource_permission(user_id UUID, resource_pattern TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_profiles up
    INNER JOIN public.roles r ON up.role_id = r.id
    INNER JOIN public.role_permissions rp ON r.id = rp.role_id
    INNER JOIN public.permissions p ON rp.permission_id = p.id
    WHERE up.id = user_id
    AND p.name LIKE resource_pattern
    AND p.is_active = true
    AND up.is_active = true
    AND r.is_active = true
  );
END;
$$;

-- Función para verificar si es admin (basado en el permiso admin.access real)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN has_permission(user_id, 'admin.access');
END;
$$;

-- 1. HABILITAR RLS EN TABLAS CON POLÍTICAS EXISTENTES
-- Estas tablas ya tienen políticas pero RLS no está habilitado

-- Habilitar RLS en aplicaciones
ALTER TABLE public.aplicaciones ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en origenes
ALTER TABLE public.origenes ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS en user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. HABILITAR RLS EN TABLAS SIN POLÍTICAS
-- Estas tablas necesitan RLS habilitado y políticas básicas

-- Habilitar RLS en roles
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Crear política para roles (acceso basado en permisos reales)
CREATE POLICY "Allow roles access based on permissions" ON public.roles
  FOR SELECT
  TO authenticated
  USING (
    has_permission(auth.uid(), 'admin.access') OR
    has_permission(auth.uid(), 'system.access')
  );

-- Habilitar RLS en permissions
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Crear política para permissions (acceso basado en permisos reales)
CREATE POLICY "Allow permissions access based on permissions" ON public.permissions
  FOR SELECT
  TO authenticated
  USING (
    has_permission(auth.uid(), 'admin.access') OR
    has_permission(auth.uid(), 'system.access')
  );

-- Habilitar RLS en role_permissions
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Crear política para role_permissions (acceso para administración)
CREATE POLICY "Allow role_permissions access" ON public.role_permissions
  FOR SELECT
  TO authenticated
  USING (
    has_permission(auth.uid(), 'admin.access') OR
    has_permission(auth.uid(), 'system.access')
  );

-- Habilitar RLS en archive_audit_log
ALTER TABLE public.archive_audit_log ENABLE ROW LEVEL SECURITY;

-- Crear política para archive_audit_log (solo admins)
CREATE POLICY "Allow archive_audit_log access to admins" ON public.archive_audit_log
  FOR ALL
  TO authenticated
  USING (has_permission(auth.uid(), 'admin.access'));

-- 3. HABILITAR RLS EN TODAS LAS OTRAS TABLAS PÚBLICAS
-- Para mantener consistencia de seguridad RESPETANDO permisos dinámicos

-- Tablas de configuración (acceso basado en permisos específicos)
ALTER TABLE public.todo_priorities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow todo_priorities access" ON public.todo_priorities
  FOR ALL TO authenticated 
  USING (
    has_permission(auth.uid(), 'admin.access') OR
    has_permission(auth.uid(), 'system.access') OR
    has_permission(auth.uid(), 'manage_todo_priorities') OR
    has_permission(auth.uid(), 'view_todos') OR
    has_permission(auth.uid(), 'create_todos')
  );

ALTER TABLE public.case_status_control ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow case_status_control access" ON public.case_status_control
  FOR ALL TO authenticated 
  USING (
    has_permission(auth.uid(), 'admin.access') OR
    has_permission(auth.uid(), 'system.access') OR
    has_permission(auth.uid(), 'case_control.view') OR
    has_permission(auth.uid(), 'case_control.manage_status') OR
    has_permission(auth.uid(), 'cases.read.own') OR
    has_permission(auth.uid(), 'cases.read.all')
  );

-- TABLA CASES - Basado en permisos reales de casos
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Política para SELECT en cases
CREATE POLICY "Allow cases read based on permissions" ON public.cases
  FOR SELECT TO authenticated 
  USING (
    -- Puede ver todos los casos
    has_permission(auth.uid(), 'cases.read.all')
    OR
    -- Puede ver solo sus propios casos Y el caso le pertenece
    (has_permission(auth.uid(), 'cases.read.own') AND user_id = auth.uid())
    OR
    -- Es admin
    has_permission(auth.uid(), 'admin.access')
  );

-- Política para INSERT en cases
CREATE POLICY "Allow cases create based on permissions" ON public.cases
  FOR INSERT TO authenticated 
  WITH CHECK (
    has_permission(auth.uid(), 'cases.create') OR
    has_permission(auth.uid(), 'admin.access')
  );

-- Política para UPDATE en cases
CREATE POLICY "Allow cases update based on permissions" ON public.cases
  FOR UPDATE TO authenticated 
  USING (
    -- Puede actualizar todos los casos
    has_permission(auth.uid(), 'cases.update.all')
    OR
    -- Puede actualizar solo sus casos Y es el creador
    (has_permission(auth.uid(), 'cases.update.own') AND user_id = auth.uid())
    OR
    -- Es admin
    has_permission(auth.uid(), 'admin.access')
  )
  WITH CHECK (
    -- Mismas condiciones para WITH CHECK
    has_permission(auth.uid(), 'cases.update.all')
    OR
    (has_permission(auth.uid(), 'cases.update.own') AND user_id = auth.uid())
    OR
    has_permission(auth.uid(), 'admin.access')
  );

-- Política para DELETE en cases
CREATE POLICY "Allow cases delete based on permissions" ON public.cases
  FOR DELETE TO authenticated 
  USING (
    -- Puede eliminar todos los casos
    has_permission(auth.uid(), 'cases.delete.all')
    OR
    -- Puede eliminar solo sus casos Y es el creador
    (has_permission(auth.uid(), 'cases.delete.own') AND user_id = auth.uid())
    OR
    -- Es admin
    has_permission(auth.uid(), 'admin.access')
  );

-- TABLA TODOS - Basado en permisos reales de TODOs
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- Política para SELECT en todos
CREATE POLICY "Allow todos read based on permissions" ON public.todos
  FOR SELECT TO authenticated 
  USING (
    -- Puede ver todos los TODOs
    has_permission(auth.uid(), 'view_all_todos')
    OR
    -- Puede ver TODOs Y (es asignado O es creador)
    (has_permission(auth.uid(), 'view_todos') AND 
     (assigned_user_id = auth.uid() OR created_by_user_id = auth.uid()))
    OR
    -- Es admin
    has_permission(auth.uid(), 'admin.access')
  );

-- Política para INSERT en todos
CREATE POLICY "Allow todos create based on permissions" ON public.todos
  FOR INSERT TO authenticated 
  WITH CHECK (
    has_permission(auth.uid(), 'create_todos') OR
    has_permission(auth.uid(), 'admin.access')
  );

-- Política para UPDATE en todos
CREATE POLICY "Allow todos update based on permissions" ON public.todos
  FOR UPDATE TO authenticated 
  USING (
    -- Puede editar TODOs Y (es asignado O es creador)
    (has_permission(auth.uid(), 'edit_todos') AND 
     (assigned_user_id = auth.uid() OR created_by_user_id = auth.uid()))
    OR
    -- Es admin
    has_permission(auth.uid(), 'admin.access')
  )
  WITH CHECK (
    -- Mismas condiciones para WITH CHECK
    (has_permission(auth.uid(), 'edit_todos') AND 
     (assigned_user_id = auth.uid() OR created_by_user_id = auth.uid()))
    OR
    has_permission(auth.uid(), 'admin.access')
  );

-- Política para DELETE en todos
CREATE POLICY "Allow todos delete based on permissions" ON public.todos
  FOR DELETE TO authenticated 
  USING (
    -- Puede eliminar TODOs Y (es asignado O es creador)
    (has_permission(auth.uid(), 'delete_todos') AND 
     (assigned_user_id = auth.uid() OR created_by_user_id = auth.uid()))
    OR
    -- Es admin
    has_permission(auth.uid(), 'admin.access')
  );

-- TABLA TODO_CONTROL - Basado en permisos de control de TODOs
ALTER TABLE public.todo_control ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow todo_control access based on permissions" ON public.todo_control
  FOR ALL TO authenticated
  USING (
    -- Tiene permisos de tiempo de TODO Y es su control
    (has_permission(auth.uid(), 'todo_time_tracking') AND user_id = auth.uid())
    OR
    -- Tiene permisos de ver todos los TODOs
    has_permission(auth.uid(), 'view_all_todos')
    OR
    -- Es admin
    has_permission(auth.uid(), 'admin.access')
  );

-- TABLA CASE_CONTROL - Basado en permisos de control de casos
ALTER TABLE public.case_control ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow case_control access based on permissions" ON public.case_control
  FOR ALL TO authenticated
  USING (
    -- Tiene permisos específicos de control de casos Y es su control
    ((has_permission(auth.uid(), 'case_control.view_own') OR
      has_permission(auth.uid(), 'case_control.start_timer') OR
      has_permission(auth.uid(), 'case_control.add_manual_time') OR
      has_permission(auth.uid(), 'case_control.update_status')) AND user_id = auth.uid())
    OR
    -- Tiene permisos de ver todos los controles de casos
    has_permission(auth.uid(), 'case_control.view_all')
    OR
    -- Es admin
    has_permission(auth.uid(), 'admin.access')
  );

-- TABLAS DE TIEMPO - Basado en permisos de tiempo reales
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow time_entries access based on permissions" ON public.time_entries
  FOR ALL TO authenticated
  USING (
    -- Tiene permisos de control de casos Y es su entrada
    ((has_permission(auth.uid(), 'case_control.start_timer') OR
      has_permission(auth.uid(), 'case_control.view_own')) AND user_id = auth.uid())
    OR
    -- Puede ver todos los casos
    has_permission(auth.uid(), 'cases.read.all')
    OR
    -- Puede ver todos los controles de casos
    has_permission(auth.uid(), 'case_control.view_all')
    OR
    -- Es admin
    has_permission(auth.uid(), 'admin.access')
  );

ALTER TABLE public.manual_time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow manual_time_entries access based on permissions" ON public.manual_time_entries
  FOR ALL TO authenticated
  USING (
    -- Tiene permisos de agregar tiempo manual Y (es su entrada O la creó)
    ((has_permission(auth.uid(), 'case_control.add_manual_time') OR
      has_permission(auth.uid(), 'case_control.edit_time')) AND 
     (user_id = auth.uid() OR created_by = auth.uid()))
    OR
    -- Puede ver todos los casos
    has_permission(auth.uid(), 'cases.read.all')
    OR
    -- Puede ver todos los controles de casos
    has_permission(auth.uid(), 'case_control.view_all')
    OR
    -- Es admin
    has_permission(auth.uid(), 'admin.access')
  );

ALTER TABLE public.todo_time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow todo_time_entries access based on permissions" ON public.todo_time_entries
  FOR ALL TO authenticated
  USING (
    -- Tiene permisos de tiempo de TODO Y es su entrada
    (has_permission(auth.uid(), 'todo_time_tracking') AND user_id = auth.uid())
    OR
    -- Puede ver todos los TODOs
    has_permission(auth.uid(), 'view_all_todos')
    OR
    -- Es admin
    has_permission(auth.uid(), 'admin.access')
  );

ALTER TABLE public.todo_manual_time_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow todo_manual_time_entries access based on permissions" ON public.todo_manual_time_entries
  FOR ALL TO authenticated
  USING (
    -- Tiene permisos de tiempo de TODO Y (es su entrada O la creó)
    (has_permission(auth.uid(), 'todo_time_tracking') AND 
     (user_id = auth.uid() OR created_by = auth.uid()))
    OR
    -- Puede ver todos los TODOs
    has_permission(auth.uid(), 'view_all_todos')
    OR
    -- Es admin
    has_permission(auth.uid(), 'admin.access')
  );

-- TABLAS DE ARCHIVO - CRÍTICO: Los analistas deben poder ver sus elementos archivados
ALTER TABLE public.archived_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow archived_cases access based on permissions and ownership" ON public.archived_cases
  FOR ALL TO authenticated
  USING (
    -- Puede ver todos los casos archivados
    has_permission(auth.uid(), 'cases.read.all')
    OR
    -- Puede ver casos Y (lo archivó O era el creador original en original_data)
    (has_permission(auth.uid(), 'cases.read.own') AND 
     (archived_by = auth.uid() OR (original_data->>'user_id')::uuid = auth.uid()))
    OR
    -- Es admin
    has_permission(auth.uid(), 'admin.access')
  );

ALTER TABLE public.archived_todos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow archived_todos access based on permissions and ownership" ON public.archived_todos
  FOR ALL TO authenticated
  USING (
    -- Puede ver todos los TODOs archivados
    has_permission(auth.uid(), 'view_all_todos')
    OR
    -- Puede ver TODOs Y (lo archivó O era el creador/asignado original en original_data)
    (has_permission(auth.uid(), 'view_todos') AND 
     (archived_by = auth.uid() OR 
      (original_data->>'created_by_user_id')::uuid = auth.uid() OR 
      (original_data->>'assigned_user_id')::uuid = auth.uid()))
    OR
    -- Es admin
    has_permission(auth.uid(), 'admin.access')
  );

ALTER TABLE public.archive_deletion_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow archive_deletion_log access to admins only" ON public.archive_deletion_log
  FOR ALL TO authenticated
  USING (has_permission(auth.uid(), 'admin.access'));

-- 4. RECREAR VISTAS SIN SECURITY DEFINER
-- Las vistas con SECURITY DEFINER pueden ser problemáticas, las recreamos como SECURITY INVOKER

-- Recrear todos_with_details como SECURITY INVOKER
DROP VIEW IF EXISTS public.todos_with_details;
CREATE VIEW public.todos_with_details
WITH (security_invoker = true)
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
WITH (security_invoker = true)
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
WITH (security_invoker = true)
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
WITH (security_invoker = true)
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
WITH (security_invoker = true)
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
COMMENT ON FUNCTION has_permission(UUID, TEXT) IS 'Verifica si un usuario tiene un permiso específico basado en el sistema dinámico de permisos';
COMMENT ON FUNCTION has_resource_permission(UUID, TEXT) IS 'Verifica permisos usando patrones de recursos (ej: cases.*)';
COMMENT ON FUNCTION is_admin(UUID) IS 'Verifica si un usuario tiene permisos de administrador (admin.access)';

COMMENT ON POLICY "Allow roles access based on permissions" ON public.roles IS 'Acceso a roles basado en permisos dinámicos';
COMMENT ON POLICY "Allow permissions access based on permissions" ON public.permissions IS 'Acceso a permisos basado en permisos dinámicos';
COMMENT ON POLICY "Allow cases read based on permissions" ON public.cases IS 'Lectura basada en cases.read.all o cases.read.own según permisos específicos';
COMMENT ON POLICY "Allow cases create based on permissions" ON public.cases IS 'Creación basada en permiso cases.create';
COMMENT ON POLICY "Allow cases update based on permissions" ON public.cases IS 'Actualización basada en cases.update.all o cases.update.own según permisos';
COMMENT ON POLICY "Allow cases delete based on permissions" ON public.cases IS 'Eliminación basada en cases.delete.all o cases.delete.own según permisos';

COMMENT ON POLICY "Allow todos read based on permissions" ON public.todos IS 'Lectura basada en view_all_todos o view_todos según permisos específicos';
COMMENT ON POLICY "Allow todos create based on permissions" ON public.todos IS 'Creación basada en permiso create_todos';
COMMENT ON POLICY "Allow todos update based on permissions" ON public.todos IS 'Actualización basada en permiso edit_todos';
COMMENT ON POLICY "Allow todos delete based on permissions" ON public.todos IS 'Eliminación basada en permiso delete_todos';

COMMENT ON POLICY "Allow todo_control access based on permissions" ON public.todo_control IS 'Acceso basado en todo_time_tracking y view_all_todos';
COMMENT ON POLICY "Allow case_control access based on permissions" ON public.case_control IS 'Acceso basado en permisos case_control.* específicos';

COMMENT ON POLICY "Allow archived_cases access based on permissions and ownership" ON public.archived_cases IS 'Analistas ven casos archivados propios o que crearon originalmente, otros según cases.read.all';
COMMENT ON POLICY "Allow archived_todos access based on permissions and ownership" ON public.archived_todos IS 'Analistas ven TODOs archivados propios o que crearon/asignaron originalmente, otros según view_all_todos';

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
