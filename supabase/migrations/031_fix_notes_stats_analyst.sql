-- =====================================================
-- CORRECCIÓN: Estadísticas de notas para analistas
-- =====================================================
-- Problema: Los analistas no ven métricas correctas de sus notas
-- Solución: Ajustar la función get_notes_stats para mostrar correctamente 
-- las estadísticas según el rol del usuario

-- Corregir función get_notes_stats
CREATE OR REPLACE FUNCTION get_notes_stats(user_id uuid)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_notes integer;
  my_notes integer;
  assigned_notes integer;
  important_notes integer;
  with_reminders integer;
  archived_notes integer;
BEGIN
  -- Verificar permisos
  IF NOT can_view_note('00000000-0000-0000-0000-000000000000'::uuid, user_id) THEN
    RAISE EXCEPTION 'Sin permisos para ver estadísticas';
  END IF;
  
  -- Obtener estadísticas según el rol
  IF EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = user_id 
    AND r.name IN ('admin', 'supervisor')
    AND up.is_active = true
  ) THEN
    -- Admin/Supervisor ven todas las notas
    SELECT 
      COUNT(*) FILTER (WHERE is_archived = false),
      COUNT(*) FILTER (WHERE created_by = user_id AND is_archived = false),
      COUNT(*) FILTER (WHERE assigned_to = user_id AND is_archived = false),
      COUNT(*) FILTER (WHERE is_important = true AND is_archived = false),
      COUNT(*) FILTER (WHERE reminder_date IS NOT NULL AND is_archived = false),
      COUNT(*) FILTER (WHERE is_archived = true)
    INTO total_notes, my_notes, assigned_notes, important_notes, with_reminders, archived_notes
    FROM notes;
  ELSE
    -- Analistas solo ven sus notas (creadas por él o asignadas a él)
    SELECT 
      COUNT(*) FILTER (WHERE is_archived = false),
      -- "Mis notas" para analistas incluye tanto las creadas como las asignadas
      COUNT(*) FILTER (WHERE (created_by = user_id OR assigned_to = user_id) AND is_archived = false),
      COUNT(*) FILTER (WHERE assigned_to = user_id AND is_archived = false),
      COUNT(*) FILTER (WHERE is_important = true AND is_archived = false),
      COUNT(*) FILTER (WHERE reminder_date IS NOT NULL AND is_archived = false),
      COUNT(*) FILTER (WHERE is_archived = true)
    INTO total_notes, my_notes, assigned_notes, important_notes, with_reminders, archived_notes
    FROM notes
    WHERE (created_by = user_id OR assigned_to = user_id);
  END IF;
  
  SELECT json_build_object(
    'total_notes', total_notes,
    'my_notes', my_notes,
    'assigned_notes', assigned_notes,
    'important_notes', important_notes,
    'with_reminders', with_reminders,
    'archived_notes', archived_notes
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Agregar comentario sobre la corrección
COMMENT ON FUNCTION get_notes_stats(uuid) IS 'Obtiene estadísticas de notas según permisos del usuario - CORREGIDO: Analistas ven correctamente sus notas creadas y asignadas';
