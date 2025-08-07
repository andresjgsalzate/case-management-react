-- Script para agregar triggers que actualicen total_time_minutes automáticamente
-- =========================================================================

-- Función para actualizar el tiempo total de un case_control
CREATE OR REPLACE FUNCTION update_case_control_total_time()
RETURNS TRIGGER AS $$
DECLARE
    control_id UUID;
    total_timer_minutes INTEGER := 0;
    total_manual_minutes INTEGER := 0;
    final_total INTEGER := 0;
BEGIN
    -- Determinar el control_id según el tipo de operación
    IF TG_TABLE_NAME = 'time_entries' THEN
        IF TG_OP = 'DELETE' THEN
            control_id := OLD.case_control_id;
        ELSE
            control_id := NEW.case_control_id;
        END IF;
    ELSIF TG_TABLE_NAME = 'manual_time_entries' THEN
        IF TG_OP = 'DELETE' THEN
            control_id := OLD.case_control_id;
        ELSE
            control_id := NEW.case_control_id;
        END IF;
    END IF;

    -- Calcular total de tiempo automático (timer)
    SELECT COALESCE(SUM(duration_minutes), 0)
    INTO total_timer_minutes
    FROM time_entries
    WHERE case_control_id = control_id;

    -- Calcular total de tiempo manual
    SELECT COALESCE(SUM(duration_minutes), 0)
    INTO total_manual_minutes
    FROM manual_time_entries
    WHERE case_control_id = control_id;

    -- Sumar ambos tiempos
    final_total := total_timer_minutes + total_manual_minutes;

    -- Actualizar el total_time_minutes en case_control
    UPDATE case_control
    SET total_time_minutes = final_total,
        updated_at = NOW()
    WHERE id = control_id;

    -- Log para debugging (opcional)
    RAISE NOTICE 'Updated case_control % total_time_minutes: timer=%, manual=%, total=%', 
                 control_id, total_timer_minutes, total_manual_minutes, final_total;

    -- Retornar el registro apropiado
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Crear triggers para time_entries
DROP TRIGGER IF EXISTS trigger_update_total_time_on_time_entries_insert ON time_entries;
DROP TRIGGER IF EXISTS trigger_update_total_time_on_time_entries_update ON time_entries;
DROP TRIGGER IF EXISTS trigger_update_total_time_on_time_entries_delete ON time_entries;

CREATE TRIGGER trigger_update_total_time_on_time_entries_insert
    AFTER INSERT ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_case_control_total_time();

CREATE TRIGGER trigger_update_total_time_on_time_entries_update
    AFTER UPDATE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_case_control_total_time();

CREATE TRIGGER trigger_update_total_time_on_time_entries_delete
    AFTER DELETE ON time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_case_control_total_time();

-- Crear triggers para manual_time_entries
DROP TRIGGER IF EXISTS trigger_update_total_time_on_manual_entries_insert ON manual_time_entries;
DROP TRIGGER IF EXISTS trigger_update_total_time_on_manual_entries_update ON manual_time_entries;
DROP TRIGGER IF EXISTS trigger_update_total_time_on_manual_entries_delete ON manual_time_entries;

CREATE TRIGGER trigger_update_total_time_on_manual_entries_insert
    AFTER INSERT ON manual_time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_case_control_total_time();

CREATE TRIGGER trigger_update_total_time_on_manual_entries_update
    AFTER UPDATE ON manual_time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_case_control_total_time();

CREATE TRIGGER trigger_update_total_time_on_manual_entries_delete
    AFTER DELETE ON manual_time_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_case_control_total_time();

-- Script para recalcular todos los tiempos totales existentes
-- (ejecutar solo una vez para corregir datos existentes)
SELECT 'Recalculando tiempos totales existentes...' as status;

UPDATE case_control
SET total_time_minutes = (
    COALESCE((
        SELECT SUM(duration_minutes)
        FROM time_entries
        WHERE case_control_id = case_control.id
    ), 0) +
    COALESCE((
        SELECT SUM(duration_minutes)
        FROM manual_time_entries
        WHERE case_control_id = case_control.id
    ), 0)
),
updated_at = NOW();

-- Verificación: mostrar algunos casos con sus tiempos
SELECT 'Verificación de tiempos actualizados:' as info;
SELECT 
    cc.id,
    c.numero_caso,
    cc.total_time_minutes as total_en_db,
    COALESCE((
        SELECT SUM(te.duration_minutes)
        FROM time_entries te
        WHERE te.case_control_id = cc.id
    ), 0) as tiempo_timer,
    COALESCE((
        SELECT SUM(mte.duration_minutes)
        FROM manual_time_entries mte
        WHERE mte.case_control_id = cc.id
    ), 0) as tiempo_manual,
    (COALESCE((
        SELECT SUM(te.duration_minutes)
        FROM time_entries te
        WHERE te.case_control_id = cc.id
    ), 0) + COALESCE((
        SELECT SUM(mte.duration_minutes)
        FROM manual_time_entries mte
        WHERE mte.case_control_id = cc.id
    ), 0)) as total_calculado
FROM case_control cc
LEFT JOIN cases c ON c.id = cc.case_id
WHERE cc.total_time_minutes > 0 OR EXISTS (
    SELECT 1 FROM time_entries te WHERE te.case_control_id = cc.id
) OR EXISTS (
    SELECT 1 FROM manual_time_entries mte WHERE mte.case_control_id = cc.id
)
ORDER BY cc.updated_at DESC
LIMIT 10;

SELECT 'Script completado exitosamente - Triggers y recálculo de tiempos configurados' as status;
