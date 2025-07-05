-- Migración 014: Verificar y agregar datos de prueba para time_entries
-- Para comprobar que los registros de tiempo se muestren correctamente

-- Primero verificar si hay registros en time_entries
DO $$
BEGIN
    RAISE NOTICE 'Verificando registros existentes...';
    
    -- Mostrar información de case_control
    RAISE NOTICE 'Case controls existentes: %', (SELECT COUNT(*) FROM case_control);
    
    -- Mostrar información de time_entries  
    RAISE NOTICE 'Time entries existentes: %', (SELECT COUNT(*) FROM time_entries);
    
    -- Mostrar información de manual_time_entries
    RAISE NOTICE 'Manual time entries existentes: %', (SELECT COUNT(*) FROM manual_time_entries);
END $$;

-- Agregar algunos datos de prueba si no existen time_entries para el caso de prueba
INSERT INTO time_entries (
    case_control_id,
    user_id,
    start_time,
    end_time,
    duration_minutes,
    entry_type,
    description,
    created_at,
    updated_at
)
SELECT 
    cc.id,
    cc.user_id,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour 58 minutes',
    2,
    'automatic',
    'Tiempo de trabajo automático de prueba',
    NOW(),
    NOW()
FROM case_control cc
WHERE NOT EXISTS (
    SELECT 1 FROM time_entries te WHERE te.case_control_id = cc.id
)
LIMIT 1;

-- Agregar entrada manual de prueba
INSERT INTO manual_time_entries (
    case_control_id,
    user_id,
    date,
    duration_minutes,
    description,
    created_at,
    created_by
)
SELECT 
    cc.id,
    cc.user_id,
    CURRENT_DATE,
    60,
    'Tiempo manual de revisión de código',
    NOW(),
    cc.user_id
FROM case_control cc
WHERE NOT EXISTS (
    SELECT 1 FROM manual_time_entries mte WHERE mte.case_control_id = cc.id
)
LIMIT 1;

-- Agregar entrada manual para día diferente
INSERT INTO manual_time_entries (
    case_control_id,
    user_id,
    date,
    duration_minutes,
    description,
    created_at,
    created_by
)
SELECT 
    cc.id,
    cc.user_id,
    CURRENT_DATE - INTERVAL '1 day',
    30,
    'Tiempo manual de documentación (día anterior)',
    NOW(),
    cc.user_id
FROM case_control cc
LIMIT 1;

-- Verificar los datos después de la inserción
DO $$
DECLARE
    cc_record RECORD;
    total_timer_time INTEGER;
    total_manual_time INTEGER;
BEGIN
    FOR cc_record IN SELECT id FROM case_control LOOP
        -- Calcular tiempo de timer
        SELECT COALESCE(SUM(duration_minutes), 0) INTO total_timer_time
        FROM time_entries WHERE case_control_id = cc_record.id;
        
        -- Calcular tiempo manual
        SELECT COALESCE(SUM(duration_minutes), 0) INTO total_manual_time
        FROM manual_time_entries WHERE case_control_id = cc_record.id;
        
        RAISE NOTICE 'Case Control ID: %, Timer: % min, Manual: % min, Total: % min', 
            cc_record.id, 
            total_timer_time, 
            total_manual_time,
            total_timer_time + total_manual_time;
    END LOOP;
END $$;
