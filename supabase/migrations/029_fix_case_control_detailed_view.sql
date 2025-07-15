-- =====================================================
-- MIGRACIÓN 029: Corregir vista case_control_detailed
-- =====================================================
-- Esta migración corrige la vista case_control_detailed para que
-- incluya todas las columnas que el frontend está esperando,
-- basándose en la estructura real de la base de datos.
-- =====================================================

-- Eliminar la vista actual problemática
DROP VIEW IF EXISTS public.case_control_detailed CASCADE;

-- Recrear la vista con las columnas correctas
CREATE VIEW public.case_control_detailed
WITH (security_invoker = true)
AS SELECT 
  cc.id,
  cc.case_id,
  c.numero_caso as case_number,  -- Alias para compatibilidad con frontend
  c.descripcion as case_description,
  c.clasificacion,
  c.puntuacion,
  cc.user_id,
  up.full_name as assigned_user_name,  -- Nombre del usuario asignado
  cc.status_id,
  cs.name as status_name,
  cs.color as status_color,  -- Color del estado
  cs.description as status_description,
  cc.total_time_minutes,
  cc.is_timer_active,
  cc.timer_start_at,
  cc.assigned_at,
  cc.started_at,
  cc.completed_at,
  cc.created_at,
  cc.updated_at,
  -- Información adicional de origen y aplicación
  o.nombre as origen_name,
  a.nombre as application_name,  -- Nombre de la aplicación
  -- Información del creador del caso
  creator.full_name as created_by_name,
  -- Fechas importantes
  c.fecha as case_date
FROM public.case_control cc
LEFT JOIN public.cases c ON cc.case_id = c.id
LEFT JOIN public.user_profiles up ON cc.user_id = up.id
LEFT JOIN public.case_status_control cs ON cc.status_id = cs.id
LEFT JOIN public.origenes o ON c.origen_id = o.id
LEFT JOIN public.aplicaciones a ON c.aplicacion_id = a.id
LEFT JOIN public.user_profiles creator ON c.user_id = creator.id;

-- Asegurar que la vista tenga las políticas RLS apropiadas
-- La vista heredará los permisos de las tablas subyacentes
COMMENT ON VIEW public.case_control_detailed IS 'Vista detallada del control de casos con información completa de casos, usuarios, estados, orígenes y aplicaciones';

-- Verificar la estructura de la vista
DO $$
BEGIN
    -- Log para confirmar la estructura
    RAISE NOTICE 'Vista case_control_detailed recreada con todas las columnas necesarias';
    RAISE NOTICE 'Incluye: case_number, application_name, assigned_user_name, status_color y más campos';
END $$;
