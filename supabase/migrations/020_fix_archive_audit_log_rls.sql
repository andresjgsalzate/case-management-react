-- =====================================================
-- Corrección de RLS para archive_audit_log
-- =====================================================
-- Fecha: 2025-07-31
-- Descripción: Corrige el problema de RLS en archive_audit_log
--             cuando se ejecuta el trigger archive_audit_trigger
--             haciendo la función SECURITY DEFINER

-- =====================================================
-- CORREGIR FUNCIÓN archive_audit_trigger
-- =====================================================

CREATE OR REPLACE FUNCTION "public"."archive_audit_trigger"() 
RETURNS "trigger"
LANGUAGE "plpgsql" 
SECURITY DEFINER  -- Esto permite que la función se ejecute con los privilegios del dueño (postgres)
AS $$
BEGIN
  -- Para casos archivados
  IF TG_TABLE_NAME = 'archived_cases' THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO archive_audit_log (action_type, item_type, item_id, user_id)
      VALUES ('ARCHIVE', 'CASE', NEW.original_case_id, NEW.archived_by);
    ELSIF TG_OP = 'UPDATE' AND OLD.is_restored = false AND NEW.is_restored = true THEN
      INSERT INTO archive_audit_log (action_type, item_type, item_id, user_id)
      VALUES ('RESTORE', 'CASE', NEW.original_case_id, NEW.restored_by);
    END IF;
  END IF;
  
  -- Para TODOs archivados
  IF TG_TABLE_NAME = 'archived_todos' THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO archive_audit_log (action_type, item_type, item_id, user_id)
      VALUES ('ARCHIVE', 'TODO', NEW.original_todo_id, NEW.archived_by);
    ELSIF TG_OP = 'UPDATE' AND OLD.is_restored = false AND NEW.is_restored = true THEN
      INSERT INTO archive_audit_log (action_type, item_type, item_id, user_id)
      VALUES ('RESTORE', 'TODO', NEW.original_todo_id, NEW.restored_by);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Asegurar que la función es propiedad de postgres
ALTER FUNCTION "public"."archive_audit_trigger"() OWNER TO "postgres";

-- Comentario explicativo
COMMENT ON FUNCTION "public"."archive_audit_trigger"() IS 'Trigger de auditoría para archivo/restauración - SECURITY DEFINER para bypass RLS';
