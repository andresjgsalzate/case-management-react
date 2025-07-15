-- Migración para sincronizar el campo is_completed en la tabla todos
-- con el estado de completado en todo_control

-- Actualizar TODOs que están completados en el control pero no marcados como completados
UPDATE todos 
SET 
  is_completed = true,
  updated_at = now()
WHERE id IN (
  SELECT DISTINCT tc.todo_id 
  FROM todo_control tc
  INNER JOIN case_status_control csc ON tc.status_id = csc.id
  WHERE csc.name = 'TERMINADA' 
    AND tc.completed_at IS NOT NULL
    AND todos.is_completed = false
);

-- Actualizar TODOs que NO están completados en el control pero están marcados como completados
UPDATE todos 
SET 
  is_completed = false,
  updated_at = now()
WHERE id IN (
  SELECT DISTINCT tc.todo_id 
  FROM todo_control tc
  INNER JOIN case_status_control csc ON tc.status_id = csc.id
  WHERE csc.name != 'TERMINADA' 
    AND tc.completed_at IS NULL
    AND todos.is_completed = true
);

-- Crear trigger para mantener sincronizado is_completed automáticamente
-- cuando se actualiza todo_control
CREATE OR REPLACE FUNCTION sync_todo_completion_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se marca como completado el control
  IF NEW.completed_at IS NOT NULL AND (OLD.completed_at IS NULL OR OLD.completed_at IS DISTINCT FROM NEW.completed_at) THEN
    UPDATE todos 
    SET is_completed = true, updated_at = now()
    WHERE id = NEW.todo_id;
  END IF;
  
  -- Si se desmarca como completado el control
  IF NEW.completed_at IS NULL AND OLD.completed_at IS NOT NULL THEN
    UPDATE todos 
    SET is_completed = false, updated_at = now()
    WHERE id = NEW.todo_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar el trigger
DROP TRIGGER IF EXISTS trigger_sync_todo_completion ON todo_control;
CREATE TRIGGER trigger_sync_todo_completion
  AFTER UPDATE ON todo_control
  FOR EACH ROW
  EXECUTE FUNCTION sync_todo_completion_status();

-- Comentarios para documentación
COMMENT ON FUNCTION sync_todo_completion_status() IS 'Mantiene sincronizado el campo is_completed de la tabla todos con el estado de completado en todo_control';
COMMENT ON TRIGGER trigger_sync_todo_completion ON todo_control IS 'Trigger que sincroniza automáticamente el estado de completado entre todo_control y todos';
