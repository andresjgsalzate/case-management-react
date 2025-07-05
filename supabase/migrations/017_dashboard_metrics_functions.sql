-- Migración 017: Funciones para métricas del dashboard
-- Crear funciones PostgreSQL para obtener métricas de tiempo y estados

-- Función para obtener métricas generales de tiempo
CREATE OR REPLACE FUNCTION get_time_metrics()
RETURNS TABLE (
    total_time_minutes INTEGER,
    total_hours NUMERIC,
    average_time_per_case NUMERIC,
    active_timers INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(te.duration_minutes), 0)::INTEGER as total_time_minutes,
        ROUND(COALESCE(SUM(te.duration_minutes), 0) / 60.0, 2) as total_hours,
        ROUND(
            CASE 
                WHEN COUNT(DISTINCT cc.case_id) > 0 
                THEN COALESCE(SUM(te.duration_minutes), 0)::NUMERIC / COUNT(DISTINCT cc.case_id)
                ELSE 0 
            END, 2
        ) as average_time_per_case,
        COUNT(cc.id) FILTER (WHERE cc.is_timer_active = true)::INTEGER as active_timers
    FROM time_entries te
    RIGHT JOIN case_control cc ON te.case_control_id = cc.id;
END;
$$;

-- Función para obtener métricas de tiempo por usuario
CREATE OR REPLACE FUNCTION get_user_time_metrics()
RETURNS TABLE (
    user_id UUID,
    user_name TEXT,
    total_time_minutes INTEGER,
    cases_worked INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id as user_id,
        COALESCE(up.full_name, up.email, 'Usuario sin nombre') as user_name,
        COALESCE(SUM(te.duration_minutes), 0)::INTEGER as total_time_minutes,
        COUNT(DISTINCT cc.case_id)::INTEGER as cases_worked
    FROM user_profiles up
    LEFT JOIN case_control cc ON cc.user_id = up.id
    LEFT JOIN time_entries te ON te.case_control_id = cc.id
    WHERE EXISTS (
        SELECT 1 FROM time_entries te2 
        JOIN case_control cc2 ON te2.case_control_id = cc2.id 
        WHERE cc2.user_id = up.id
    )
    GROUP BY up.id, up.full_name, up.email
    ORDER BY total_time_minutes DESC;
END;
$$;

-- Función para obtener métricas de tiempo por caso
CREATE OR REPLACE FUNCTION get_case_time_metrics()
RETURNS TABLE (
    case_id UUID,
    case_number VARCHAR,
    description TEXT,
    total_time_minutes INTEGER,
    status VARCHAR,
    status_color VARCHAR
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as case_id,
        c.numero_caso as case_number,
        c.descripcion as description,
        COALESCE(SUM(te.duration_minutes), 0)::INTEGER as total_time_minutes,
        COALESCE(csc.name, 'Sin estado') as status,
        COALESCE(csc.color, '#6B7280') as status_color
    FROM cases c
    LEFT JOIN case_control cc ON cc.case_id = c.id
    LEFT JOIN time_entries te ON te.case_control_id = cc.id
    LEFT JOIN case_status_control csc ON cc.status_id = csc.id
    WHERE EXISTS (
        SELECT 1 FROM time_entries te2 
        JOIN case_control cc2 ON te2.case_control_id = cc2.id 
        WHERE cc2.case_id = c.id
    )
    GROUP BY c.id, c.numero_caso, c.descripcion, csc.name, csc.color
    ORDER BY total_time_minutes DESC;
END;
$$;

-- Función para obtener métricas por estado
CREATE OR REPLACE FUNCTION get_status_metrics()
RETURNS TABLE (
    status_id UUID,
    status_name VARCHAR,
    status_color VARCHAR,
    cases_count INTEGER,
    total_time_minutes INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        csc.id as status_id,
        csc.name as status_name,
        csc.color as status_color,
        COUNT(DISTINCT cc.case_id)::INTEGER as cases_count,
        COALESCE(SUM(te.duration_minutes), 0)::INTEGER as total_time_minutes
    FROM case_status_control csc
    LEFT JOIN case_control cc ON cc.status_id = csc.id
    LEFT JOIN time_entries te ON te.case_control_id = cc.id
    WHERE csc.is_active = true
    GROUP BY csc.id, csc.name, csc.color
    ORDER BY total_time_minutes DESC;
END;
$$;

-- Función para obtener métricas por aplicación
CREATE OR REPLACE FUNCTION get_application_time_metrics()
RETURNS TABLE (
    application_id UUID,
    application_name VARCHAR,
    total_time_minutes INTEGER,
    cases_count INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        oa.id as application_id,
        oa.name as application_name,
        COALESCE(SUM(te.duration_minutes), 0)::INTEGER as total_time_minutes,
        COUNT(DISTINCT cc.case_id)::INTEGER as cases_count
    FROM origenes_aplicaciones oa
    LEFT JOIN cases c ON c.origen_aplicacion_id = oa.id
    LEFT JOIN case_control cc ON cc.case_id = c.id
    LEFT JOIN time_entries te ON te.case_control_id = cc.id
    WHERE EXISTS (
        SELECT 1 FROM cases c2 
        JOIN case_control cc2 ON cc2.case_id = c2.id
        JOIN time_entries te2 ON te2.case_control_id = cc2.id
        WHERE c2.origen_aplicacion_id = oa.id
    )
    GROUP BY oa.id, oa.name
    ORDER BY total_time_minutes DESC;
END;
$$;

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION get_time_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_time_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_case_time_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_status_metrics() TO authenticated;
GRANT EXECUTE ON FUNCTION get_application_time_metrics() TO authenticated;

-- Comentarios para documentar las funciones
COMMENT ON FUNCTION get_time_metrics() IS 'Obtiene métricas generales de tiempo del sistema';
COMMENT ON FUNCTION get_user_time_metrics() IS 'Obtiene métricas de tiempo agrupadas por usuario';
COMMENT ON FUNCTION get_case_time_metrics() IS 'Obtiene métricas de tiempo agrupadas por caso';
COMMENT ON FUNCTION get_status_metrics() IS 'Obtiene métricas agrupadas por estado de control';
COMMENT ON FUNCTION get_application_time_metrics() IS 'Obtiene métricas de tiempo agrupadas por aplicación de origen';
