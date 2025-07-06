-- Funciones para el dashboard y métricas
-- Versión: 2.1.0

-- Función para obtener métricas del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_metrics(user_id UUID DEFAULT NULL)
RETURNS JSON AS $$
DECLARE
    result JSON;
    total_cases INTEGER;
    completed_cases INTEGER;
    pending_cases INTEGER;
    in_progress_cases INTEGER;
    user_role TEXT;
    is_user_active BOOLEAN;
BEGIN
    -- Obtener rol y estado del usuario
    SELECT role_name, is_active INTO user_role, is_user_active
    FROM user_profiles 
    WHERE id = COALESCE(user_id, auth.uid());
    
    -- Si el usuario no está activo, devolver métricas vacías
    IF NOT is_user_active THEN
        RETURN json_build_object(
            'totalCases', 0,
            'completedCases', 0,
            'pendingCases', 0,
            'inProgressCases', 0,
            'userRole', user_role,
            'isActive', is_user_active
        );
    END IF;
    
    -- Contar casos según el rol del usuario
    IF user_role IN ('admin', 'supervisor') THEN
        -- Admin y supervisor ven todos los casos
        SELECT COUNT(*) INTO total_cases FROM cases;
        
        SELECT COUNT(*) INTO completed_cases 
        FROM case_status_control csc 
        WHERE csc.status = 'Terminada';
        
        SELECT COUNT(*) INTO pending_cases 
        FROM case_status_control csc 
        WHERE csc.status = 'Pendiente';
        
        SELECT COUNT(*) INTO in_progress_cases 
        FROM case_status_control csc 
        WHERE csc.status = 'En Curso';
        
    ELSE
        -- Analistas solo ven sus casos
        SELECT COUNT(*) INTO total_cases 
        FROM cases c 
        WHERE c.created_by = COALESCE(user_id, auth.uid());
        
        SELECT COUNT(*) INTO completed_cases 
        FROM case_status_control csc 
        JOIN cases c ON csc.case_id = c.id
        WHERE csc.status = 'Terminada' 
        AND (c.created_by = COALESCE(user_id, auth.uid()) OR csc.assigned_user_id = COALESCE(user_id, auth.uid()));
        
        SELECT COUNT(*) INTO pending_cases 
        FROM case_status_control csc 
        JOIN cases c ON csc.case_id = c.id
        WHERE csc.status = 'Pendiente' 
        AND (c.created_by = COALESCE(user_id, auth.uid()) OR csc.assigned_user_id = COALESCE(user_id, auth.uid()));
        
        SELECT COUNT(*) INTO in_progress_cases 
        FROM case_status_control csc 
        JOIN cases c ON csc.case_id = c.id
        WHERE csc.status = 'En Curso' 
        AND (c.created_by = COALESCE(user_id, auth.uid()) OR csc.assigned_user_id = COALESCE(user_id, auth.uid()));
    END IF;
    
    -- Construir resultado JSON
    result := json_build_object(
        'totalCases', COALESCE(total_cases, 0),
        'completedCases', COALESCE(completed_cases, 0),
        'pendingCases', COALESCE(pending_cases, 0),
        'inProgressCases', COALESCE(in_progress_cases, 0),
        'userRole', user_role,
        'isActive', is_user_active
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Vista para casos con información del usuario asignado
CREATE OR REPLACE VIEW cases_with_assigned_user AS
SELECT 
    c.*,
    csc.status,
    csc.assigned_user_id,
    up_assigned.full_name as assigned_user_name,
    up_created.full_name as created_by_name
FROM cases c
LEFT JOIN case_status_control csc ON c.id = csc.case_id
LEFT JOIN user_profiles up_assigned ON csc.assigned_user_id = up_assigned.id
LEFT JOIN user_profiles up_created ON c.created_by = up_created.id;
