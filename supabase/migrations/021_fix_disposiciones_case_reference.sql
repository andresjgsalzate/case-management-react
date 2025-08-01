-- =====================================================
-- Corrección de Disposiciones Scripts - Preservar historial al archivar casos
-- =====================================================
-- Fecha: 2025-08-01
-- Descripción: Modifica el módulo de disposiciones para usar numero_caso
--             en lugar de case_id para preservar el historial cuando
--             se archivan los casos

-- =====================================================
-- PASO 1: AGREGAR NUEVA COLUMNA case_number
-- =====================================================

-- Agregar columna para número de caso
ALTER TABLE public.disposiciones_scripts 
ADD COLUMN case_number character varying;

-- =====================================================
-- PASO 2: MIGRAR DATOS EXISTENTES
-- =====================================================

-- Poblar la nueva columna con los números de caso existentes
UPDATE public.disposiciones_scripts 
SET case_number = (
    SELECT c.numero_caso 
    FROM public.cases c 
    WHERE c.id = disposiciones_scripts.case_id
)
WHERE case_id IS NOT NULL;

-- =====================================================
-- PASO 3: HACER LA COLUMNA REQUERIDA
-- =====================================================

-- Hacer la columna NOT NULL después de poblarla
ALTER TABLE public.disposiciones_scripts 
ALTER COLUMN case_number SET NOT NULL;

-- =====================================================
-- PASO 4: CREAR ÍNDICE PARA LA NUEVA COLUMNA
-- =====================================================

-- Crear índice para mejorar performance de búsquedas
CREATE INDEX idx_disposiciones_scripts_case_number 
ON public.disposiciones_scripts(case_number);

-- =====================================================
-- PASO 5: AGREGAR RESTRICCIÓN DE VALIDACIÓN
-- =====================================================

-- Agregar constraint para validar que el número de caso existe
-- (permitirá casos archivados también)
ALTER TABLE public.disposiciones_scripts 
ADD CONSTRAINT chk_case_number_format 
CHECK (case_number ~ '^[A-Z0-9-]+$');

-- =====================================================
-- PASO 6: REMOVER LA REFERENCIA FORÁNEA ACTUAL
-- =====================================================

-- Eliminar la restricción de clave foránea
ALTER TABLE public.disposiciones_scripts 
DROP CONSTRAINT IF EXISTS disposiciones_scripts_case_id_fkey;

-- =====================================================
-- PASO 7: HACER case_id OPCIONAL Y MANTENERLO PARA CASOS ACTIVOS
-- =====================================================

-- Hacer case_id opcional para permitir casos archivados
ALTER TABLE public.disposiciones_scripts 
ALTER COLUMN case_id DROP NOT NULL;

-- Agregar nueva clave foránea con SET NULL en lugar de CASCADE
-- Esto permitirá que cuando se archive un caso, el case_id se ponga en NULL
-- pero mantendremos el case_number para referencia histórica
ALTER TABLE public.disposiciones_scripts 
ADD CONSTRAINT disposiciones_scripts_case_id_fkey 
FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE SET NULL;

-- =====================================================
-- PASO 8: ACTUALIZAR COMENTARIOS DE DOCUMENTACIÓN
-- =====================================================

COMMENT ON COLUMN public.disposiciones_scripts.case_number IS 'Número de caso - se mantiene histórico incluso si el caso se archiva';
COMMENT ON COLUMN public.disposiciones_scripts.case_id IS 'ID del caso activo (NULL si el caso fue archivado)';

-- =====================================================
-- PASO 9: CREAR VISTA PARA COMPATIBILIDAD
-- =====================================================

-- Crear vista que facilite las consultas con información del caso
CREATE OR REPLACE VIEW disposiciones_scripts_with_case AS
SELECT 
    ds.*,
    CASE 
        WHEN ds.case_id IS NOT NULL THEN
            -- Caso activo: obtener info de la tabla cases
            (SELECT row_to_json(c) FROM (
                SELECT 
                    c.id,
                    c.numero_caso,
                    c.descripcion,
                    c.clasificacion,
                    c.created_at,
                    c.updated_at
                FROM cases c 
                WHERE c.id = ds.case_id
            ) c)
        ELSE
            -- Caso archivado: crear objeto con info básica
            json_build_object(
                'id', null,
                'numero_caso', ds.case_number,
                'descripcion', 'Caso Archivado',
                'clasificacion', 'N/A',
                'created_at', null,
                'updated_at', null,
                'is_archived', true
            )
    END as case_info,
    CASE WHEN ds.case_id IS NULL THEN true ELSE false END as is_case_archived
FROM disposiciones_scripts ds;

-- =====================================================
-- PASO 10: CREAR FUNCIÓN AUXILIAR PARA VALIDACIÓN
-- =====================================================

-- Función para validar que un número de caso existe (activo o archivado)
CREATE OR REPLACE FUNCTION validate_case_number(p_case_number text)
RETURNS boolean AS $$
BEGIN
    -- Verificar si existe en casos activos
    IF EXISTS (SELECT 1 FROM cases WHERE numero_caso = p_case_number) THEN
        RETURN true;
    END IF;
    
    -- Verificar si existe en casos archivados
    IF EXISTS (SELECT 1 FROM archived_cases WHERE case_number = p_case_number) THEN
        RETURN true;
    END IF;
    
    -- Verificar si ya existe en disposiciones (para casos que ya fueron archivados)
    IF EXISTS (SELECT 1 FROM disposiciones_scripts WHERE case_number = p_case_number) THEN
        RETURN true;
    END IF;
    
    RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTARIOS FINALES
-- =====================================================

COMMENT ON VIEW disposiciones_scripts_with_case IS 'Vista que incluye información del caso, incluso si está archivado';
COMMENT ON FUNCTION validate_case_number(text) IS 'Valida que un número de caso existe en casos activos o archivados';
