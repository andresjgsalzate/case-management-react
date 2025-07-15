-- =====================================================
-- MIGRACIÓN 028: Corregir vista archive_stats
-- =====================================================
-- Esta migración corrige la vista archive_stats para que
-- devuelva una sola fila con múltiples columnas en lugar
-- de múltiples filas, como espera el frontend.
-- =====================================================

-- Eliminar la vista actual problemática
DROP VIEW IF EXISTS public.archive_stats CASCADE;

-- Recrear la vista con el formato correcto (una sola fila)
CREATE VIEW public.archive_stats
WITH (security_invoker = true)
AS SELECT 
    (SELECT COUNT(*) FROM public.archived_cases WHERE is_restored = false) as total_archived_cases,
    (SELECT COUNT(*) FROM public.archived_todos WHERE is_restored = false) as total_archived_todos,
    (SELECT COALESCE(SUM(total_time_minutes), 0) FROM public.archived_cases WHERE is_restored = false) + 
    (SELECT COALESCE(SUM(total_time_minutes), 0) FROM public.archived_todos WHERE is_restored = false) as total_archived_time_minutes,
    (SELECT COUNT(*) FROM public.archived_cases WHERE archived_at >= date_trunc('month', now()) AND is_restored = false) +
    (SELECT COUNT(*) FROM public.archived_todos WHERE archived_at >= date_trunc('month', now()) AND is_restored = false) as archived_this_month,
    (SELECT COUNT(*) FROM public.archived_cases WHERE restored_at >= date_trunc('month', now())) +
    (SELECT COUNT(*) FROM public.archived_todos WHERE restored_at >= date_trunc('month', now())) as restored_this_month;

-- Asegurar que la vista tenga las políticas RLS apropiadas
-- La vista heredará los permisos de las tablas subyacentes
COMMENT ON VIEW public.archive_stats IS 'Vista que devuelve estadísticas consolidadas de archivos en una sola fila';

-- Verificar la estructura de la vista
DO $$
BEGIN
    -- Log para confirmar la estructura
    RAISE NOTICE 'Vista archive_stats recreada con formato de una sola fila';
    RAISE NOTICE 'Columnas: total_archived_cases, total_archived_todos, total_archived_time_minutes, archived_this_month, restored_this_month';
END $$;
