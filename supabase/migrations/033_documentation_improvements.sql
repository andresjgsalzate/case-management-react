-- =====================================================
-- MIGRACIÓN: MEJORAS AL MÓDULO DE DOCUMENTACIÓN
-- =====================================================
-- Descripción: Implementa sistema de etiquetas reutilizables,
-- validación de casos archivados, y mejoras en metadatos
-- Fecha: 1 de Agosto, 2025
-- =====================================================

-- 1. CREAR TABLA DE ETIQUETAS REUTILIZABLES
-- =====================================================
CREATE TABLE IF NOT EXISTS solution_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7) DEFAULT '#6B7280', -- Color hex para la UI
  category VARCHAR(50), -- Categoría de la etiqueta (ej: 'technical', 'priority', 'module')
  usage_count INTEGER DEFAULT 0, -- Contador de uso para analytics
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREAR TABLA DE RELACIÓN DOCUMENTOS-ETIQUETAS
-- =====================================================
CREATE TABLE IF NOT EXISTS solution_document_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES solution_documents(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES solution_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, tag_id) -- Evitar duplicados
);

-- 3. MEJORAR TABLA solution_documents CON NUEVOS CAMPOS
-- =====================================================
ALTER TABLE solution_documents 
  ADD COLUMN IF NOT EXISTS case_reference_type VARCHAR(20) DEFAULT 'active' 
    CHECK (case_reference_type IN ('active', 'archived', 'both')),
  ADD COLUMN IF NOT EXISTS archived_case_id UUID REFERENCES archived_cases(id),
  ADD COLUMN IF NOT EXISTS solution_type VARCHAR(30) DEFAULT 'solution' 
    CHECK (solution_type IN ('solution', 'guide', 'faq', 'template', 'procedure')),
  ADD COLUMN IF NOT EXISTS complexity_notes TEXT,
  ADD COLUMN IF NOT EXISTS prerequisites TEXT, -- Prerrequisitos para aplicar la solución
  ADD COLUMN IF NOT EXISTS related_applications UUID[] DEFAULT '{}', -- IDs de aplicaciones relacionadas
  ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS last_reviewed_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS is_deprecated BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deprecation_reason TEXT,
  ADD COLUMN IF NOT EXISTS replacement_document_id UUID REFERENCES solution_documents(id);

-- 4. CREAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_solution_tags_name ON solution_tags(name);
CREATE INDEX IF NOT EXISTS idx_solution_tags_category ON solution_tags(category);
CREATE INDEX IF NOT EXISTS idx_solution_tags_active ON solution_tags(is_active);

CREATE INDEX IF NOT EXISTS idx_solution_document_tags_document ON solution_document_tags(document_id);
CREATE INDEX IF NOT EXISTS idx_solution_document_tags_tag ON solution_document_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_solution_documents_case_reference ON solution_documents(case_reference_type);
CREATE INDEX IF NOT EXISTS idx_solution_documents_archived_case ON solution_documents(archived_case_id);
CREATE INDEX IF NOT EXISTS idx_solution_documents_solution_type ON solution_documents(solution_type);
CREATE INDEX IF NOT EXISTS idx_solution_documents_deprecated ON solution_documents(is_deprecated);

-- 5. CREAR FUNCIÓN PARA VALIDAR REFERENCIA DE CASOS
-- =====================================================
CREATE OR REPLACE FUNCTION validate_case_reference()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se especifica case_id, validar que exista
  IF NEW.case_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM cases WHERE id = NEW.case_id) THEN
      RAISE EXCEPTION 'El caso referenciado (%) no existe en casos activos', NEW.case_id;
    END IF;
  END IF;
  
  -- Si se especifica archived_case_id, validar que exista
  IF NEW.archived_case_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM archived_cases WHERE id = NEW.archived_case_id) THEN
      RAISE EXCEPTION 'El caso archivado referenciado (%) no existe', NEW.archived_case_id;
    END IF;
  END IF;
  
  -- Validar que no se referencien ambos tipos de caso a la vez
  IF NEW.case_id IS NOT NULL AND NEW.archived_case_id IS NOT NULL THEN
    RAISE EXCEPTION 'No se puede referenciar un caso activo y un caso archivado al mismo tiempo';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. CREAR TRIGGER PARA VALIDACIÓN DE CASOS
-- =====================================================
DROP TRIGGER IF EXISTS trg_validate_case_reference ON solution_documents;
CREATE TRIGGER trg_validate_case_reference
  BEFORE INSERT OR UPDATE ON solution_documents
  FOR EACH ROW
  EXECUTE FUNCTION validate_case_reference();

-- 7. CREAR FUNCIÓN PARA ACTUALIZAR CONTADOR DE ETIQUETAS
-- =====================================================
CREATE OR REPLACE FUNCTION update_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Incrementar contador al agregar etiqueta
    UPDATE solution_tags 
    SET usage_count = usage_count + 1,
        updated_at = NOW()
    WHERE id = NEW.tag_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrementar contador al remover etiqueta
    UPDATE solution_tags 
    SET usage_count = GREATEST(usage_count - 1, 0),
        updated_at = NOW()
    WHERE id = OLD.tag_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 8. CREAR TRIGGERS PARA CONTADOR DE ETIQUETAS
-- =====================================================
DROP TRIGGER IF EXISTS trg_update_tag_usage_insert ON solution_document_tags;
CREATE TRIGGER trg_update_tag_usage_insert
  AFTER INSERT ON solution_document_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage_count();

DROP TRIGGER IF EXISTS trg_update_tag_usage_delete ON solution_document_tags;
CREATE TRIGGER trg_update_tag_usage_delete
  AFTER DELETE ON solution_document_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_tag_usage_count();

-- 9. CREAR FUNCIÓN PARA PROTEGER DOCUMENTACIÓN AL ARCHIVAR CASOS
-- =====================================================
CREATE OR REPLACE FUNCTION preserve_documentation_on_case_archive()
RETURNS TRIGGER AS $$
BEGIN
  -- Cuando se archiva un caso, actualizar documentos relacionados
  UPDATE solution_documents 
  SET case_reference_type = 'archived',
      archived_case_id = NEW.id,
      case_id = NULL,
      updated_at = NOW()
  WHERE case_id = NEW.original_case_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. CREAR TRIGGER PARA PRESERVAR DOCUMENTACIÓN
-- =====================================================
DROP TRIGGER IF EXISTS trg_preserve_documentation ON archived_cases;
CREATE TRIGGER trg_preserve_documentation
  AFTER INSERT ON archived_cases
  FOR EACH ROW
  EXECUTE FUNCTION preserve_documentation_on_case_archive();

-- 11. CREAR FUNCIÓN PARA RESTAURAR REFERENCIAS AL RESTAURAR CASOS
-- =====================================================
CREATE OR REPLACE FUNCTION restore_documentation_on_case_restore()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actuar cuando is_restored cambia a true
  IF OLD.is_restored = false AND NEW.is_restored = true THEN
    -- Restaurar referencias de documentación
    UPDATE solution_documents 
    SET case_reference_type = 'active',
        case_id = NEW.original_case_id,
        archived_case_id = NULL,
        updated_at = NOW()
    WHERE archived_case_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. CREAR TRIGGER PARA RESTAURAR REFERENCIAS
-- =====================================================
DROP TRIGGER IF EXISTS trg_restore_documentation ON archived_cases;
CREATE TRIGGER trg_restore_documentation
  AFTER UPDATE ON archived_cases
  FOR EACH ROW
  EXECUTE FUNCTION restore_documentation_on_case_restore();

-- 13. POBLAR ETIQUETAS PREDETERMINADAS
-- =====================================================
INSERT INTO solution_tags (name, description, color, category, created_by) 
SELECT 
  tag_name,
  tag_description,
  tag_color,
  tag_category,
  (SELECT id FROM auth.users LIMIT 1) -- Usuario del sistema
FROM (
  VALUES
    ('Crítico', 'Soluciones para problemas críticos', '#EF4444', 'priority'),
    ('Alto', 'Soluciones de alta prioridad', '#F97316', 'priority'),
    ('Medio', 'Soluciones de prioridad media', '#EAB308', 'priority'),
    ('Bajo', 'Soluciones de baja prioridad', '#22C55E', 'priority'),
    
    ('Frontend', 'Relacionado con interfaz de usuario', '#3B82F6', 'technical'),
    ('Backend', 'Relacionado con servidor y APIs', '#8B5CF6', 'technical'),
    ('Base de Datos', 'Relacionado con almacenamiento de datos', '#06B6D4', 'technical'),
    ('Infraestructura', 'Relacionado con servidores e infraestructura', '#64748B', 'technical'),
    
    ('Bug Fix', 'Corrección de errores', '#DC2626', 'type'),
    ('Feature', 'Nueva funcionalidad', '#16A34A', 'type'),
    ('Mejora', 'Optimización o mejora', '#2563EB', 'type'),
    ('Documentación', 'Actualización de documentación', '#7C3AED', 'type'),
    
    ('SQL Server', 'Específico para SQL Server', '#CC2927', 'technology'),
    ('React', 'Específico para React', '#61DAFB', 'technology'),
    ('Node.js', 'Específico para Node.js', '#339933', 'technology'),
    ('TypeScript', 'Específico para TypeScript', '#3178C6', 'technology')
) AS tags(tag_name, tag_description, tag_color, tag_category)
WHERE NOT EXISTS (
  SELECT 1 FROM solution_tags WHERE name = tag_name
);

-- 14. COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================
COMMENT ON TABLE solution_tags IS 'Etiquetas reutilizables para clasificar documentos de solución';
COMMENT ON TABLE solution_document_tags IS 'Relación muchos a muchos entre documentos y etiquetas';

COMMENT ON COLUMN solution_documents.case_reference_type IS 'Tipo de referencia: active (caso activo), archived (caso archivado), both (ambos)';
COMMENT ON COLUMN solution_documents.archived_case_id IS 'Referencia a caso archivado si aplica';
COMMENT ON COLUMN solution_documents.solution_type IS 'Tipo de documento: solution, guide, faq, template, procedure';
COMMENT ON COLUMN solution_documents.complexity_notes IS 'Notas adicionales sobre la complejidad';
COMMENT ON COLUMN solution_documents.prerequisites IS 'Prerrequisitos necesarios para aplicar la solución';
COMMENT ON COLUMN solution_documents.related_applications IS 'Array de IDs de aplicaciones relacionadas';
COMMENT ON COLUMN solution_documents.is_deprecated IS 'Indica si el documento está obsoleto';
COMMENT ON COLUMN solution_documents.replacement_document_id IS 'Documento que reemplaza este si está obsoleto';
