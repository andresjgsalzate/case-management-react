-- ================================================================
-- ACTUALIZACIÓN DE FUNCIONES PARA MANEJAR TAGS
-- ================================================================
-- Descripción: Actualiza las funciones create_solution_document_final 
--              y update_solution_document_final para manejar tags
-- Fecha: 11 de Agosto, 2025
-- ================================================================

-- Eliminar funciones existentes primero
DROP FUNCTION IF EXISTS create_solution_document_final CASCADE;
DROP FUNCTION IF EXISTS update_solution_document_final CASCADE;

-- Función mejorada para crear documentos con tags
CREATE OR REPLACE FUNCTION create_solution_document_final(
    p_title text,
    p_content jsonb,
    p_solution_type text DEFAULT NULL,
    p_difficulty_level integer DEFAULT 1,
    p_case_id uuid DEFAULT NULL,
    p_archived_case_id uuid DEFAULT NULL,
    p_case_reference_type text DEFAULT 'active',
    p_complexity_notes text DEFAULT NULL,
    p_prerequisites text DEFAULT NULL,
    p_estimated_solution_time integer DEFAULT NULL,
    p_is_template boolean DEFAULT false,
    p_is_published boolean DEFAULT false,
    p_tags text[] DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_document_id uuid;
    v_created_by uuid;
    v_tag_id uuid;
    v_tag_name text;
BEGIN
    -- Obtener usuario actual
    v_created_by := auth.uid();
    
    IF v_created_by IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;

    -- Insertar el documento con todos los campos
    INSERT INTO solution_documents (
        title,
        content,
        solution_type,
        difficulty_level,
        case_id,
        archived_case_id,
        case_reference_type,
        complexity_notes,
        prerequisites,
        estimated_solution_time,
        is_template,
        is_published,
        tags,
        created_by,
        updated_by
    ) VALUES (
        p_title,
        p_content,
        p_solution_type,
        p_difficulty_level,
        p_case_id,
        p_archived_case_id,
        p_case_reference_type,
        p_complexity_notes,
        p_prerequisites,
        p_estimated_solution_time,
        p_is_template,
        p_is_published,
        COALESCE(p_tags, ARRAY[]::text[]),
        v_created_by,
        v_created_by
    ) RETURNING id INTO v_document_id;

    -- ✅ CREAR RELACIONES EN solution_document_tags
    IF p_tags IS NOT NULL AND array_length(p_tags, 1) > 0 THEN
        FOREACH v_tag_name IN ARRAY p_tags
        LOOP
            -- Buscar el ID del tag por nombre
            SELECT id INTO v_tag_id
            FROM solution_tags
            WHERE name = v_tag_name AND is_active = true;
            
            -- Si existe el tag, crear la relación
            IF v_tag_id IS NOT NULL THEN
                INSERT INTO solution_document_tags (document_id, tag_id)
                VALUES (v_document_id, v_tag_id)
                ON CONFLICT DO NOTHING;
                
                -- Incrementar contador de uso
                UPDATE solution_tags 
                SET usage_count = usage_count + 1
                WHERE id = v_tag_id;
            END IF;
        END LOOP;
    END IF;

    RETURN v_document_id;
END;
$$;

-- Función mejorada para actualizar documentos con tags
CREATE OR REPLACE FUNCTION update_solution_document_final(
    p_document_id uuid,
    p_title text DEFAULT NULL,
    p_content jsonb DEFAULT NULL,
    p_solution_type text DEFAULT NULL,
    p_difficulty_level integer DEFAULT NULL,
    p_case_id uuid DEFAULT NULL,
    p_archived_case_id uuid DEFAULT NULL,
    p_case_reference_type text DEFAULT NULL,
    p_complexity_notes text DEFAULT NULL,
    p_prerequisites text DEFAULT NULL,
    p_estimated_solution_time integer DEFAULT NULL,
    p_is_template boolean DEFAULT NULL,
    p_is_published boolean DEFAULT NULL,
    p_tags text[] DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_updated_by uuid;
    v_tag_id uuid;
    v_tag_name text;
BEGIN
    -- Obtener usuario actual
    v_updated_by := auth.uid();
    
    IF v_updated_by IS NULL THEN
        RAISE EXCEPTION 'Usuario no autenticado';
    END IF;

    -- Actualizar solo los campos que no son NULL
    UPDATE solution_documents 
    SET 
        title = COALESCE(p_title, title),
        content = COALESCE(p_content, content),
        solution_type = COALESCE(p_solution_type, solution_type),
        difficulty_level = COALESCE(p_difficulty_level, difficulty_level),
        case_id = COALESCE(p_case_id, case_id),
        archived_case_id = COALESCE(p_archived_case_id, archived_case_id),
        case_reference_type = COALESCE(p_case_reference_type, case_reference_type),
        complexity_notes = COALESCE(p_complexity_notes, complexity_notes),
        prerequisites = COALESCE(p_prerequisites, prerequisites),
        estimated_solution_time = COALESCE(p_estimated_solution_time, estimated_solution_time),
        is_template = COALESCE(p_is_template, is_template),
        is_published = COALESCE(p_is_published, is_published),
        tags = CASE 
            WHEN p_tags IS NOT NULL THEN p_tags 
            ELSE tags 
        END,
        updated_at = now(),
        updated_by = v_updated_by
    WHERE id = p_document_id;

    -- ✅ ACTUALIZAR RELACIONES EN solution_document_tags
    IF p_tags IS NOT NULL THEN
        -- Eliminar relaciones existentes
        DELETE FROM solution_document_tags WHERE document_id = p_document_id;
        
        -- Crear nuevas relaciones si hay tags
        IF array_length(p_tags, 1) > 0 THEN
            FOREACH v_tag_name IN ARRAY p_tags
            LOOP
                -- Buscar el ID del tag por nombre
                SELECT id INTO v_tag_id
                FROM solution_tags
                WHERE name = v_tag_name AND is_active = true;
                
                -- Si existe el tag, crear la relación
                IF v_tag_id IS NOT NULL THEN
                    INSERT INTO solution_document_tags (document_id, tag_id)
                    VALUES (p_document_id, v_tag_id)
                    ON CONFLICT DO NOTHING;
                    
                    -- Incrementar contador de uso
                    UPDATE solution_tags 
                    SET usage_count = usage_count + 1
                    WHERE id = v_tag_id;
                END IF;
            END LOOP;
        END IF;
    END IF;

    RETURN FOUND;
END;
$$;

-- Comentarios para documentar las funciones
COMMENT ON FUNCTION create_solution_document_final IS 'Crear nuevo documento de solución con todos los campos incluyendo tags';
COMMENT ON FUNCTION update_solution_document_final IS 'Actualizar documento existente con todos los campos incluyendo tags';

-- Otorgar permisos a usuarios autenticados
GRANT EXECUTE ON FUNCTION create_solution_document_final TO authenticated;
GRANT EXECUTE ON FUNCTION update_solution_document_final TO authenticated;
