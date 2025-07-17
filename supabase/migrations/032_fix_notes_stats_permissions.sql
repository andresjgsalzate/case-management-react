-- =====================================================
-- CORRECCIÓN: Función get_notes_stats sin can_view_note
-- =====================================================
-- Problema: La función get_notes_stats usa can_view_note con UUID dummy
-- que falla para analistas porque busca una nota que no existe
-- Solución: Verificar permisos directamente en get_notes_stats

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
  user_role_name text;
BEGIN
  -- Obtener el rol del usuario
  SELECT r.name INTO user_role_name
  FROM user_profiles up
  JOIN roles r ON up.role_id = r.id
  WHERE up.id = user_id 
  AND up.is_active = true;
  
  -- Verificar que el usuario existe y está activo
  IF user_role_name IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado o inactivo';
  END IF;
  
  -- Obtener estadísticas según el rol
  IF user_role_name IN ('admin', 'supervisor') THEN
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

-- Actualizar comentario
COMMENT ON FUNCTION get_notes_stats(uuid) IS 'Obtiene estadísticas de notas según permisos del usuario - CORREGIDO: Verifica permisos directamente sin can_view_note';
