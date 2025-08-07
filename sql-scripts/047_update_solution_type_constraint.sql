-- ================================================================
-- CORRECCIÓN: REEMPLAZAR CHECK CONSTRAINT CON FOREIGN KEY
-- ================================================================
-- Descripción: Reemplazar constraint hardcodeado con referencia a solution_document_types
-- Módulo: Documentación  
-- Fecha: 6 de Agosto, 2025
-- Versión: 2.0
-- Beneficios: Permite crear cualquier tipo de documento sin modificar constraints
-- ================================================================

-- Paso 1: Eliminar el CHECK constraint existente (hardcodeado)
ALTER TABLE solution_documents DROP CONSTRAINT IF EXISTS solution_documents_solution_type_check;

-- Paso 2: Agregar columna de referencia a solution_document_types (si no existe)
DO $$
BEGIN
    -- Verificar si la columna solution_type_code ya existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'solution_documents' 
        AND column_name = 'solution_type_code'
    ) THEN
        -- Agregar nueva columna para el código del tipo
        ALTER TABLE solution_documents 
        ADD COLUMN solution_type_code VARCHAR REFERENCES solution_document_types(code);
        
        RAISE NOTICE 'Columna solution_type_code agregada';
    ELSE
        RAISE NOTICE 'Columna solution_type_code ya existe';
    END IF;
END $$;

-- Paso 3: Migrar datos existentes de solution_type a solution_type_code
-- Mapear valores del enum antiguo a códigos de la nueva tabla
UPDATE solution_documents SET solution_type_code = 
    CASE 
        WHEN solution_type = 'solution' THEN 'SOLUTION'
        WHEN solution_type = 'guide' THEN 'GUIDE'  
        WHEN solution_type = 'faq' THEN 'FAQ'
        WHEN solution_type = 'template' THEN 'TEMPLATE'
        WHEN solution_type = 'procedure' THEN 'PROCEDURE'
        ELSE 'SOLUTION' -- Default fallback
    END
WHERE solution_type_code IS NULL;

-- Paso 4: Cambiar solution_type para permitir cualquier valor (eliminar restricciones)
-- Esto permitirá usar los códigos directamente de solution_document_types
ALTER TABLE solution_documents ALTER COLUMN solution_type DROP DEFAULT;
ALTER TABLE solution_documents ALTER COLUMN solution_type TYPE VARCHAR;

-- Paso 5: Crear constraint de validación dinámico usando función
CREATE OR REPLACE FUNCTION validate_solution_type() 
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar que el solution_type existe en solution_document_types y está activo
    IF NOT EXISTS (
        SELECT 1 FROM solution_document_types 
        WHERE code = NEW.solution_type 
        AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Tipo de solución inválido: %. Debe ser un código válido de solution_document_types activo.', NEW.solution_type;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para validación automática
DROP TRIGGER IF EXISTS trigger_validate_solution_type ON solution_documents;
CREATE TRIGGER trigger_validate_solution_type
    BEFORE INSERT OR UPDATE ON solution_documents
    FOR EACH ROW
    EXECUTE FUNCTION validate_solution_type();

-- Paso 6: Verificar la configuración
SELECT 'Configuración completada' as status;

-- Mostrar tipos de documentos disponibles
SELECT 
    code,
    name,
    description,
    is_active
FROM solution_document_types 
ORDER BY display_order, name;
