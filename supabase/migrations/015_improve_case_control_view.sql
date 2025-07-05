-- Migración 015: Mejorar la vista case_control_detailed para incluir información de aplicación
-- Añadir información de la aplicación del caso

-- Eliminar la vista existente primero para evitar conflictos de columnas
DROP VIEW IF EXISTS case_control_detailed;

-- Crear la vista nuevamente con información de aplicación
CREATE VIEW case_control_detailed AS
SELECT 
    cc.id,
    cc.case_id,
    cc.user_id,
    cc.status_id,
    cc.total_time_minutes,
    cc.timer_start_at,
    cc.is_timer_active,
    cc.assigned_at,
    cc.started_at,
    cc.completed_at,
    cc.created_at,
    cc.updated_at,
    
    -- Información del usuario asignado
    up.full_name as assigned_user_name,
    up.email as assigned_user_email,
    
    -- Información del caso
    c.numero_caso as case_number,
    c.descripcion as case_description,
    c.clasificacion as case_classification,
    c.puntuacion as case_score,
    
    -- Información de la aplicación
    a.nombre as application_name,
    a.descripcion as application_description,
    
    -- Información del estado
    csc.name as status_name,
    csc.description as status_description,
    csc.color as status_color
FROM case_control cc
LEFT JOIN user_profiles up ON cc.user_id = up.id
LEFT JOIN cases c ON cc.case_id = c.id
LEFT JOIN aplicaciones a ON c.aplicacion_id = a.id
LEFT JOIN case_status_control csc ON cc.status_id = csc.id;

-- Otorgar permisos a la vista
GRANT SELECT ON case_control_detailed TO authenticated;

-- Comentario actualizado
COMMENT ON VIEW case_control_detailed IS 'Vista desnormalizada para consultas complejas del control de casos, incluyendo información de aplicación';

-- Verificar que la vista funciona correctamente
DO $$
DECLARE
    test_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO test_count FROM case_control_detailed LIMIT 1;
    RAISE NOTICE 'Vista case_control_detailed actualizada correctamente. Test count: %', test_count;
END $$;
