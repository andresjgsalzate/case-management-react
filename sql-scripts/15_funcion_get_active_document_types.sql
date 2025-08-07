-- ================================================================
-- FUNCIÓN FALTANTE: GET_ACTIVE_DOCUMENT_TYPES
-- ================================================================
-- Descripción: Función para obtener tipos de documentos activos
-- Módulo: Documentación
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- Eliminar función existente si existe (para cambiar tipo de retorno)
DROP FUNCTION IF EXISTS get_active_document_types();

-- Función para obtener tipos de documentos activos
CREATE OR REPLACE FUNCTION get_active_document_types()
RETURNS TABLE (
    id UUID,
    name CHARACTER VARYING,
    description TEXT,
    icon CHARACTER VARYING,
    color CHARACTER VARYING,
    is_active BOOLEAN,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Verificar si el usuario tiene permisos para leer tipos de documentos
    IF NOT user_has_permission(auth.uid(), 'documentation.read_own') 
       AND NOT user_has_permission(auth.uid(), 'documentation.read_team')
       AND NOT user_has_permission(auth.uid(), 'documentation.read_all') THEN
        RAISE EXCEPTION 'Sin permisos para leer tipos de documentos';
    END IF;
    
    -- Retornar tipos de documentos activos (ORDER CORRECTO DE CAMPOS)
    RETURN QUERY
    SELECT 
        sdt.id,
        sdt.name,
        sdt.description,
        sdt.icon,
        sdt.color,
        sdt.is_active,
        sdt.created_at,
        sdt.updated_at
    FROM solution_document_types sdt
    WHERE sdt.is_active = true
    ORDER BY sdt.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario
COMMENT ON FUNCTION get_active_document_types() IS 'Obtiene todos los tipos de documentos activos respetando permisos granulares';
