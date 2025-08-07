-- ================================================================
-- CORRECCIÓN: GET_ACTIVE_DOCUMENT_TYPES - AGREGAR CAMPO CODE
-- ================================================================
-- Descripción: Corregir función para incluir el campo code necesario
-- Módulo: Documentación
-- Fecha: 6 de Agosto, 2025
-- Versión: 1.1
-- ================================================================

-- Eliminar función existente para actualizar el tipo de retorno
DROP FUNCTION IF EXISTS get_active_document_types();

-- Función corregida para obtener tipos de documentos activos CON campo code
CREATE OR REPLACE FUNCTION get_active_document_types()
RETURNS TABLE (
    id UUID,
    code CHARACTER VARYING,
    name CHARACTER VARYING,
    description TEXT,
    icon CHARACTER VARYING,
    color CHARACTER VARYING,
    is_active BOOLEAN,
    display_order INTEGER,
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
    
    -- Retornar tipos de documentos activos CON TODOS LOS CAMPOS NECESARIOS
    RETURN QUERY
    SELECT 
        sdt.id,
        sdt.code,           -- ✅ CAMPO CODE AGREGADO
        sdt.name,
        sdt.description,
        sdt.icon,
        sdt.color,
        sdt.is_active,
        sdt.display_order,  -- ✅ CAMPO DISPLAY_ORDER AGREGADO
        sdt.created_at,
        sdt.updated_at
    FROM solution_document_types sdt
    WHERE sdt.is_active = true
    ORDER BY sdt.display_order ASC, sdt.name ASC;  -- ✅ ORDEN MEJORADO
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentario actualizado
COMMENT ON FUNCTION get_active_document_types() IS 'Obtiene todos los tipos de documentos activos con campo code incluido';

-- Verificar que la función retorna datos correctos
-- SELECT * FROM get_active_document_types() LIMIT 5;
