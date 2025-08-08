-- =========================================================================
-- Script para corregir el cálculo automático de duration_minutes
-- =========================================================================

-- Función para calcular y actualizar la duración automáticamente
CREATE OR REPLACE FUNCTION calculate_duration_minutes()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo calcular la duración si tenemos start_time y end_time válidos
    IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
        -- Calcular duración en minutos usando EXTRACT(EPOCH ...)
        NEW.duration_minutes := EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
        
        -- Redondear a entero más cercano
        NEW.duration_minutes := ROUND(NEW.duration_minutes);
        
        -- Asegurar que la duración no sea negativa
        IF NEW.duration_minutes < 0 THEN
            NEW.duration_minutes := 0;
        END IF;
    ELSE
        -- Si no tenemos ambos tiempos, limpiar la duración
        NEW.duration_minutes := NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para time_entries
DROP TRIGGER IF EXISTS trigger_calculate_duration_time_entries ON time_entries;
CREATE TRIGGER trigger_calculate_duration_time_entries
    BEFORE INSERT OR UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_duration_minutes();

-- Crear trigger para todo_time_entries (si existe)
DROP TRIGGER IF EXISTS trigger_calculate_duration_todo_time_entries ON todo_time_entries;
CREATE TRIGGER trigger_calculate_duration_todo_time_entries
    BEFORE INSERT OR UPDATE ON todo_time_entries
    FOR EACH ROW
    EXECUTE FUNCTION calculate_duration_minutes();

-- Recalcular duraciones existentes para time_entries
UPDATE time_entries 
SET duration_minutes = CASE 
    WHEN start_time IS NOT NULL AND end_time IS NOT NULL THEN
        GREATEST(0, ROUND(EXTRACT(EPOCH FROM (end_time - start_time)) / 60))
    ELSE 
        NULL 
    END
WHERE start_time IS NOT NULL AND end_time IS NOT NULL;

-- Recalcular duraciones existentes para todo_time_entries
UPDATE todo_time_entries 
SET duration_minutes = CASE 
    WHEN start_time IS NOT NULL AND end_time IS NOT NULL THEN
        GREATEST(0, ROUND(EXTRACT(EPOCH FROM (end_time - start_time)) / 60))
    ELSE 
        NULL 
    END
WHERE start_time IS NOT NULL AND end_time IS NOT NULL;

-- Verificación: mostrar algunos casos para verificar el cálculo
SELECT 'Verificación de duraciones actualizadas para time_entries:' as info;
SELECT 
    te.id,
    te.start_time,
    te.end_time,
    te.duration_minutes as duration_calculated,
    ROUND(EXTRACT(EPOCH FROM (te.end_time - te.start_time)) / 60) as duration_manual_check,
    cc.case_id,
    c.numero_caso
FROM time_entries te
JOIN case_control cc ON cc.id = te.case_control_id
JOIN cases c ON c.id = cc.case_id
WHERE te.start_time IS NOT NULL AND te.end_time IS NOT NULL
ORDER BY te.created_at DESC
LIMIT 10;

-- Verificar el total de time_entries que fueron actualizadas
SELECT 
    COUNT(*) as total_time_entries_with_duration,
    SUM(duration_minutes) as total_minutes_calculated
FROM time_entries 
WHERE duration_minutes IS NOT NULL AND duration_minutes > 0;

SELECT 'Script completado - Triggers de duración configurados y duraciones recalculadas' as status;
