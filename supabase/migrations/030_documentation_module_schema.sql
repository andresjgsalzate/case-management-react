-- ================================================================
-- MIGRACIÓN: Módulo de Documentación tipo Notion
-- Descripción: Creación de tablas para el sistema de documentación
-- Versión: 1.0
-- Fecha: 1 de Agosto, 2025
-- ================================================================

-- 1. Tabla principal de documentos de solución
CREATE TABLE solution_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content JSONB NOT NULL, -- Contenido estructurado en bloques
  case_id UUID REFERENCES cases(id),
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  updated_by UUID REFERENCES auth.users(id),
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5) DEFAULT 1,
  estimated_solution_time INTEGER, -- en minutos
  is_template BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  version INTEGER DEFAULT 1,
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimización
CREATE INDEX idx_solution_documents_case_id ON solution_documents(case_id);
CREATE INDEX idx_solution_documents_created_by ON solution_documents(created_by);
CREATE INDEX idx_solution_documents_tags ON solution_documents USING GIN(tags);
CREATE INDEX idx_solution_documents_category ON solution_documents(category);
CREATE INDEX idx_solution_documents_published ON solution_documents(is_published);
CREATE INDEX idx_solution_documents_is_template ON solution_documents(is_template);
CREATE INDEX idx_solution_documents_difficulty ON solution_documents(difficulty_level);

-- 2. Tabla de versiones de documentos
CREATE TABLE solution_document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES solution_documents(id) ON DELETE CASCADE,
  content JSONB NOT NULL,
  version INTEGER NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para versiones
CREATE INDEX idx_versions_document_id ON solution_document_versions(document_id);
CREATE INDEX idx_versions_version ON solution_document_versions(document_id, version);

-- 3. Tabla de feedback/calificaciones
CREATE TABLE solution_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES solution_documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  was_helpful BOOLEAN,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevenir múltiples feedbacks del mismo usuario por documento
  UNIQUE(document_id, user_id)
);

-- Índices para feedback
CREATE INDEX idx_feedback_document_id ON solution_feedback(document_id);
CREATE INDEX idx_feedback_user_id ON solution_feedback(user_id);
CREATE INDEX idx_feedback_rating ON solution_feedback(rating);
CREATE INDEX idx_feedback_helpful ON solution_feedback(was_helpful);

-- 4. Tabla de categorías de soluciones
CREATE TABLE solution_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#6B7280', -- Color hex para UI
  icon TEXT, -- Nombre del ícono de Heroicons
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para categorías
CREATE INDEX idx_solution_categories_active ON solution_categories(is_active);

-- Datos iniciales para categorías
INSERT INTO solution_categories (name, description, color, icon, created_by) 
SELECT 
  unnest(ARRAY[
    'Errores de Sistema',
    'Configuración',
    'Integración',
    'Performance',
    'Seguridad',
    'Datos'
  ]),
  unnest(ARRAY[
    'Problemas técnicos y bugs del sistema',
    'Procedimientos de configuración y setup',
    'Problemas de integración con sistemas externos',
    'Optimización y mejoras de rendimiento',
    'Procedimientos de seguridad y acceso',
    'Manipulación y corrección de datos'
  ]),
  unnest(ARRAY[
    '#EF4444',
    '#3B82F6',
    '#8B5CF6',
    '#10B981',
    '#F59E0B',
    '#6366F1'
  ]),
  unnest(ARRAY[
    'ExclamationTriangleIcon',
    'CogIcon',
    'LinkIcon',
    'BoltIcon',
    'ShieldCheckIcon',
    'CircleStackIcon'
  ]),
  (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);

-- Trigger para actualizar updated_at en solution_documents
CREATE OR REPLACE FUNCTION update_solution_document_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_solution_documents_updated_at
  BEFORE UPDATE ON solution_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_solution_document_updated_at();

-- Trigger para incrementar view_count
CREATE OR REPLACE FUNCTION increment_document_view_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE solution_documents 
  SET view_count = view_count + 1 
  WHERE id = NEW.document_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE solution_documents IS 'Documentos de soluciones tipo Notion con contenido estructurado en bloques';
COMMENT ON TABLE solution_document_versions IS 'Historial de versiones de documentos de solución';
COMMENT ON TABLE solution_feedback IS 'Feedback y calificaciones de usuarios sobre documentos';
COMMENT ON TABLE solution_categories IS 'Categorías para clasificar documentos de solución';
