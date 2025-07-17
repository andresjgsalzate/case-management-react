-- =====================================================
-- MÓDULO DE NOTAS - SISTEMA DE GESTIÓN DE CASOS
-- =====================================================
-- Fecha: 2025-07-17
-- Descripción: Implementa el sistema de notas para permitir a los usuarios
--             crear recordatorios, documentar eventos y asociar notas a casos

-- =====================================================
-- TABLA DE NOTAS
-- =====================================================

CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying(255) NOT NULL,
  content text NOT NULL,
  tags text[] DEFAULT '{}',
  
  -- Asociación opcional con casos
  case_id uuid,
  
  -- Metadatos de usuario
  created_by uuid NOT NULL,
  assigned_to uuid, -- Nota puede ser asignada a otro usuario
  
  -- Fechas y estado
  is_important boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  archived_at timestamp with time zone,
  archived_by uuid,
  
  -- Fechas de recordatorio
  reminder_date timestamp with time zone,
  is_reminder_sent boolean DEFAULT false,
  
  -- Metadatos de seguimiento
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Constraints
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id),
  CONSTRAINT notes_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.user_profiles(id),
  CONSTRAINT notes_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id) ON DELETE SET NULL,
  CONSTRAINT notes_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.user_profiles(id)
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================

-- Índice para búsquedas por usuario creador
CREATE INDEX idx_notes_created_by ON public.notes(created_by);

-- Índice para búsquedas por usuario asignado
CREATE INDEX idx_notes_assigned_to ON public.notes(assigned_to);

-- Índice para búsquedas por caso asociado
CREATE INDEX idx_notes_case_id ON public.notes(case_id);

-- Índice para búsquedas por fecha de creación
CREATE INDEX idx_notes_created_at ON public.notes(created_at);

-- Índice para búsquedas por fecha de recordatorio
CREATE INDEX idx_notes_reminder_date ON public.notes(reminder_date) WHERE reminder_date IS NOT NULL;

-- Índice para búsquedas por tags usando GIN
CREATE INDEX idx_notes_tags ON public.notes USING gin(tags);

-- Índice para búsquedas de texto completo
CREATE INDEX idx_notes_text_search ON public.notes USING gin(
  to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(content, ''))
);

-- Índice para notas no archivadas
CREATE INDEX idx_notes_active ON public.notes(created_at) WHERE is_archived = false;

-- =====================================================
-- TRIGGER PARA ACTUALIZAR FECHA DE MODIFICACIÓN
-- =====================================================

CREATE OR REPLACE FUNCTION update_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notes_updated_at_trigger
  BEFORE UPDATE ON public.notes
  FOR EACH ROW
  EXECUTE FUNCTION update_notes_updated_at();

-- =====================================================
-- PERMISOS PARA EL MÓDULO DE NOTAS
-- =====================================================

-- Permisos básicos para el módulo
INSERT INTO permissions (name, description, resource, action) VALUES 
('notes.view', 'Ver notas propias', 'notes', 'view'),
('notes.view_all', 'Ver todas las notas del sistema', 'notes', 'view_all'),
('notes.create', 'Crear nuevas notas', 'notes', 'create'),
('notes.edit', 'Editar notas propias', 'notes', 'edit'),
('notes.edit_all', 'Editar todas las notas', 'notes', 'edit_all'),
('notes.delete', 'Eliminar notas propias', 'notes', 'delete'),
('notes.delete_all', 'Eliminar todas las notas', 'notes', 'delete_all'),
('notes.assign', 'Asignar notas a otros usuarios', 'notes', 'assign'),
('notes.archive', 'Archivar notas', 'notes', 'archive'),
('notes.manage_tags', 'Gestionar tags del sistema', 'notes', 'manage_tags'),
('notes.associate_cases', 'Asociar notas con casos', 'notes', 'associate_cases'),
('notes.view_team', 'Ver notas del equipo', 'notes', 'view_team'),
('notes.export', 'Exportar notas', 'notes', 'export')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- ASIGNACIÓN DE PERMISOS A ROLES
-- =====================================================

-- Permisos para ADMIN (acceso completo)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'admin' 
AND p.name IN (
    'notes.view',
    'notes.view_all',
    'notes.create',
    'notes.edit',
    'notes.edit_all',
    'notes.delete',
    'notes.delete_all',
    'notes.assign',
    'notes.archive',
    'notes.manage_tags',
    'notes.associate_cases',
    'notes.view_team',
    'notes.export'
)
ON CONFLICT DO NOTHING;

-- Permisos para SUPERVISOR (casi completo)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'supervisor' 
AND p.name IN (
    'notes.view',
    'notes.view_all',
    'notes.create',
    'notes.edit',
    'notes.edit_all',
    'notes.delete',
    'notes.assign',
    'notes.archive',
    'notes.associate_cases',
    'notes.view_team',
    'notes.export'
)
ON CONFLICT DO NOTHING;

-- Permisos para ANALISTA (limitado a notas propias)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id 
FROM roles r, permissions p 
WHERE r.name = 'analista' 
AND p.name IN (
    'notes.view',
    'notes.create',
    'notes.edit',
    'notes.delete',
    'notes.associate_cases',
    'notes.archive'
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS en la tabla
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Política para administradores (acceso completo)
CREATE POLICY "Admin can manage all notes" ON public.notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name = 'admin'
      AND up.is_active = true
    )
  );

-- Política para supervisores (acceso completo)
CREATE POLICY "Supervisor can manage all notes" ON public.notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name = 'supervisor'
      AND up.is_active = true
    )
  );

-- Política para analistas (solo notas propias o asignadas)
CREATE POLICY "Analista can view own and assigned notes" ON public.notes
  FOR SELECT USING (
    (created_by = auth.uid() OR assigned_to = auth.uid()) 
    AND EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name = 'analista'
      AND up.is_active = true
    )
  );

-- Política para crear notas (analistas pueden crear)
CREATE POLICY "Analista can create notes" ON public.notes
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name = 'analista'
      AND up.is_active = true
    )
  );

-- Política para actualizar notas (analistas solo las propias)
CREATE POLICY "Analista can update own notes" ON public.notes
  FOR UPDATE USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name = 'analista'
      AND up.is_active = true
    )
  );

-- Política para eliminar notas (analistas solo las propias)
CREATE POLICY "Analista can delete own notes" ON public.notes
  FOR DELETE USING (
    created_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE up.id = auth.uid() 
      AND r.name = 'analista'
      AND up.is_active = true
    )
  );

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para verificar si un usuario puede ver una nota específica
CREATE OR REPLACE FUNCTION can_view_note(note_id uuid, user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Admin y supervisor pueden ver todas
  IF EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = user_id 
    AND r.name IN ('admin', 'supervisor')
    AND up.is_active = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Analistas pueden ver solo las propias o asignadas
  IF EXISTS (
    SELECT 1 FROM notes n
    WHERE n.id = note_id
    AND (n.created_by = user_id OR n.assigned_to = user_id)
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para buscar notas por texto
CREATE OR REPLACE FUNCTION search_notes(
  search_term text,
  user_id uuid,
  limit_count integer DEFAULT 50
)
RETURNS TABLE(
  id uuid,
  title varchar,
  content text,
  tags text[],
  case_id uuid,
  created_by uuid,
  assigned_to uuid,
  is_important boolean,
  is_archived boolean,
  created_at timestamptz,
  updated_at timestamptz,
  case_number varchar,
  creator_name varchar,
  assigned_name varchar
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.content,
    n.tags,
    n.case_id,
    n.created_by,
    n.assigned_to,
    n.is_important,
    n.is_archived,
    n.created_at,
    n.updated_at,
    c.numero_caso as case_number,
    creator.full_name as creator_name,
    assigned.full_name as assigned_name
  FROM notes n
  LEFT JOIN cases c ON n.case_id = c.id
  LEFT JOIN user_profiles creator ON n.created_by = creator.id
  LEFT JOIN user_profiles assigned ON n.assigned_to = assigned.id
  WHERE 
    can_view_note(n.id, user_id)
    AND (
      n.title ILIKE '%' || search_term || '%'
      OR n.content ILIKE '%' || search_term || '%'
      OR search_term = ANY(n.tags)
      OR to_tsvector('spanish', n.title || ' ' || n.content) @@ plainto_tsquery('spanish', search_term)
    )
    AND n.is_archived = false
  ORDER BY 
    n.is_important DESC,
    n.updated_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de notas
CREATE OR REPLACE FUNCTION get_notes_stats(user_id uuid)
RETURNS JSON AS $$
DECLARE
  result JSON;
  total_notes integer;
  my_notes integer;
  assigned_notes integer;
  important_notes integer;
  with_reminders integer;
  archived_notes integer;
BEGIN
  -- Verificar permisos
  IF NOT can_view_note('00000000-0000-0000-0000-000000000000'::uuid, user_id) THEN
    RAISE EXCEPTION 'Sin permisos para ver estadísticas';
  END IF;
  
  -- Obtener estadísticas según el rol
  IF EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = user_id 
    AND r.name IN ('admin', 'supervisor')
    AND up.is_active = true
  ) THEN
    -- Admin/Supervisor ven todas las notas
    SELECT 
      COUNT(*) FILTER (WHERE is_archived = false),
      COUNT(*) FILTER (WHERE created_by = user_id AND is_archived = false),
      COUNT(*) FILTER (WHERE assigned_to = user_id AND is_archived = false),
      COUNT(*) FILTER (WHERE is_important = true AND is_archived = false),
      COUNT(*) FILTER (WHERE reminder_date IS NOT NULL AND is_archived = false),
      COUNT(*) FILTER (WHERE is_archived = true)
    INTO total_notes, my_notes, assigned_notes, important_notes, with_reminders, archived_notes
    FROM notes;
  ELSE
    -- Analistas solo ven sus notas
    SELECT 
      COUNT(*) FILTER (WHERE is_archived = false),
      COUNT(*) FILTER (WHERE created_by = user_id AND is_archived = false),
      COUNT(*) FILTER (WHERE assigned_to = user_id AND is_archived = false),
      COUNT(*) FILTER (WHERE is_important = true AND is_archived = false),
      COUNT(*) FILTER (WHERE reminder_date IS NOT NULL AND is_archived = false),
      COUNT(*) FILTER (WHERE is_archived = true)
    INTO total_notes, my_notes, assigned_notes, important_notes, with_reminders, archived_notes
    FROM notes
    WHERE (created_by = user_id OR assigned_to = user_id);
  END IF;
  
  SELECT json_build_object(
    'total_notes', total_notes,
    'my_notes', my_notes,
    'assigned_notes', assigned_notes,
    'important_notes', important_notes,
    'with_reminders', with_reminders,
    'archived_notes', archived_notes
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON TABLE public.notes IS 'Tabla para almacenar notas del sistema - permite recordatorios y asociación con casos';
COMMENT ON COLUMN public.notes.title IS 'Título de la nota';
COMMENT ON COLUMN public.notes.content IS 'Contenido completo de la nota';
COMMENT ON COLUMN public.notes.tags IS 'Array de etiquetas para categorizar la nota';
COMMENT ON COLUMN public.notes.case_id IS 'ID del caso asociado (opcional)';
COMMENT ON COLUMN public.notes.created_by IS 'Usuario que creó la nota';
COMMENT ON COLUMN public.notes.assigned_to IS 'Usuario al que se asignó la nota (opcional)';
COMMENT ON COLUMN public.notes.is_important IS 'Marca si la nota es importante/urgente';
COMMENT ON COLUMN public.notes.is_archived IS 'Marca si la nota está archivada';
COMMENT ON COLUMN public.notes.reminder_date IS 'Fecha para mostrar recordatorio';
COMMENT ON COLUMN public.notes.is_reminder_sent IS 'Marca si ya se envió el recordatorio';

COMMENT ON FUNCTION can_view_note(uuid, uuid) IS 'Verifica si un usuario puede ver una nota específica';
COMMENT ON FUNCTION search_notes(text, uuid, integer) IS 'Busca notas por texto con información adicional';
COMMENT ON FUNCTION get_notes_stats(uuid) IS 'Obtiene estadísticas de notas según permisos del usuario';
