-- Migración para verificar y corregir políticas RLS del módulo de archivo
-- Esta migración asegura que los analistas puedan ver sus propios elementos archivados

-- Primero, verificar y corregir las políticas de archived_cases
DROP POLICY IF EXISTS "Allow archived_cases access based on role and ownership" ON public.archived_cases;

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
    -- Analista ve casos archivados por él mismo o casos que fueron asignados a él
    (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        INNER JOIN public.roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name = 'analista'
      )
      AND (
        archived_by = auth.uid() 
        OR assigned_user_id = auth.uid()
        OR user_id = auth.uid()  -- En caso de que el caso original fuera creado por él
      )
    )
  );

-- Corregir las políticas de archived_todos
DROP POLICY IF EXISTS "Allow archived_todos access based on role and ownership" ON public.archived_todos;

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
    -- Analista ve TODOs archivados por él mismo o TODOs que fueron asignados a él
    (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        INNER JOIN public.roles r ON up.role_id = r.id
        WHERE up.id = auth.uid() AND r.name = 'analista'
      )
      AND (
        archived_by = auth.uid() 
        OR assigned_user_id = auth.uid()
        OR user_id = auth.uid()  -- En caso de que el TODO original fuera creado por él
      )
    )
  );

-- Asegurar que las vistas de estadísticas son SECURITY INVOKER
DROP VIEW IF EXISTS public.archive_stats CASCADE;
CREATE VIEW public.archive_stats
WITH (security_invoker = true)
AS
SELECT 
  (SELECT COUNT(*) FROM public.archived_cases WHERE NOT is_restored) as total_archived_cases,
  (SELECT COUNT(*) FROM public.archived_todos WHERE NOT is_restored) as total_archived_todos,
  (SELECT COUNT(*) FROM public.archived_cases WHERE is_restored) as total_restored_cases,
  (SELECT COUNT(*) FROM public.archived_todos WHERE is_restored) as total_restored_todos,
  (SELECT COUNT(*) FROM public.archived_cases WHERE archived_at >= CURRENT_DATE - INTERVAL '30 days') as cases_archived_last_30_days,
  (SELECT COUNT(*) FROM public.archived_todos WHERE archived_at >= CURRENT_DATE - INTERVAL '30 days') as todos_archived_last_30_days;

-- Comentario: Esta migración corrige las políticas RLS del módulo de archivo para garantizar que:
-- 1. Admin y supervisor pueden ver todos los elementos archivados
-- 2. Analistas pueden ver solo elementos archivados por ellos mismos o asignados a ellos
-- 3. Las vistas de estadísticas respetan las políticas RLS (SECURITY INVOKER)
