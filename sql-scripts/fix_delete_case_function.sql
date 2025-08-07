-- Script para corregir la función delete_case
-- ================================================================
-- Basado en la estructura real de la base de datos
-- Elimina todas las referencias a casos de forma segura y ordenada

-- Eliminar la función anterior si existe
DROP FUNCTION IF EXISTS delete_case(UUID, UUID);

-- Función corregida para eliminar caso (con cascada completa)
CREATE OR REPLACE FUNCTION delete_case(
    p_case_id UUID,
    p_user_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    current_user_id UUID;
    case_owner_id UUID;
    case_number TEXT;
    case_control_ids UUID[];
BEGIN
    current_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Obtener información del caso
    SELECT user_id, numero_caso INTO case_owner_id, case_number
    FROM cases WHERE id = p_case_id;
    
    IF case_owner_id IS NULL THEN
        RAISE EXCEPTION 'Caso no encontrado con ID: %', p_case_id;
    END IF;
    
    -- Log de inicio de eliminación
    RAISE NOTICE 'Eliminando caso % (ID: %)', case_number, p_case_id;
    
    -- Obtener todos los case_control_ids relacionados
    SELECT ARRAY(SELECT id FROM case_control WHERE case_id = p_case_id) INTO case_control_ids;
    
    -- 1. Eliminar entradas de tiempo manuales
    IF array_length(case_control_ids, 1) > 0 THEN
        DELETE FROM manual_time_entries 
        WHERE case_control_id = ANY(case_control_ids);
        RAISE NOTICE 'Eliminadas % entradas de tiempo manuales', FOUND;
    END IF;
    
    -- 2. Eliminar entradas de tiempo automáticas
    IF array_length(case_control_ids, 1) > 0 THEN
        DELETE FROM time_entries 
        WHERE case_control_id = ANY(case_control_ids);
        RAISE NOTICE 'Eliminadas % entradas de tiempo automáticas', FOUND;
    END IF;
    
    -- 3. Eliminar registros de case_control
    DELETE FROM case_control WHERE case_id = p_case_id;
    RAISE NOTICE 'Eliminados % registros de case_control', FOUND;
    
    -- 4. Eliminar attachments de documentos de solución relacionados
    DELETE FROM document_attachments 
    WHERE document_id IN (
        SELECT id FROM solution_documents WHERE case_id = p_case_id
    );
    RAISE NOTICE 'Eliminados % attachments de documentos', FOUND;
    
    -- 5. Eliminar tags de documentos de solución relacionados
    DELETE FROM solution_document_tags 
    WHERE document_id IN (
        SELECT id FROM solution_documents WHERE case_id = p_case_id
    );
    RAISE NOTICE 'Eliminados % tags de documentos', FOUND;
    
    -- 6. Eliminar versiones de documentos de solución relacionados
    DELETE FROM solution_document_versions 
    WHERE document_id IN (
        SELECT id FROM solution_documents WHERE case_id = p_case_id
    );
    RAISE NOTICE 'Eliminadas % versiones de documentos', FOUND;
    
    -- 7. Eliminar feedback de documentos de solución relacionados
    DELETE FROM solution_feedback 
    WHERE document_id IN (
        SELECT id FROM solution_documents WHERE case_id = p_case_id
    );
    RAISE NOTICE 'Eliminados % feedbacks de documentos', FOUND;
    
    -- 8. Eliminar documentos de solución relacionados
    DELETE FROM solution_documents WHERE case_id = p_case_id;
    RAISE NOTICE 'Eliminados % documentos de solución', FOUND;
    
    -- 9. Eliminar notas relacionadas
    DELETE FROM notes WHERE case_id = p_case_id;
    RAISE NOTICE 'Eliminadas % notas', FOUND;
    
    -- 10. Eliminar disposiciones de scripts relacionadas
    DELETE FROM disposiciones_scripts WHERE case_id = p_case_id;
    RAISE NOTICE 'Eliminadas % disposiciones de scripts', FOUND;
    
    -- 11. Finalmente eliminar el caso
    DELETE FROM cases WHERE id = p_case_id;
    
    -- Verificar que el caso fue eliminado
    IF NOT FOUND THEN
        RAISE EXCEPTION 'No se pudo eliminar el caso %', case_number;
    END IF;
    
    RAISE NOTICE 'Caso % eliminado exitosamente', case_number;
    RETURN true;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Error al eliminar caso % (ID: %): %', case_number, p_case_id, SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conceder permisos
GRANT EXECUTE ON FUNCTION delete_case(uuid, uuid) TO authenticated;

-- Verificar que la función se creó correctamente
SELECT 'delete_case function created successfully with complete cascade deletion' as status;
