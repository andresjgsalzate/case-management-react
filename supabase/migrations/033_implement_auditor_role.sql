-- =====================================================
-- IMPLEMENTACIÓN: Rol de Auditor para el Sistema
-- =====================================================
-- Descripción: Rol con permisos de solo lectura para supervisión y auditoría
-- Características: Ver todo, modificar nada
-- Aplicable a: Casos, TODOs, Notas, Archivo, Usuarios

-- =====================================================
-- 1. CREAR ROL DE AUDITOR
-- =====================================================

-- Insertar rol de auditor
INSERT INTO roles (id, name, description, is_active) 
VALUES (
  gen_random_uuid(),
  'auditor',
  'Auditor del Sistema - Solo lectura para supervisión y control',
  true
);

-- Obtener el ID del rol de auditor
DO $$
DECLARE
  auditor_role_id uuid;
  permission_id uuid;
BEGIN
  -- Obtener el ID del rol auditor
  SELECT id INTO auditor_role_id FROM roles WHERE name = 'auditor';
  
  -- Asignar permisos de solo lectura para casos
  SELECT id INTO permission_id FROM permissions WHERE name = 'cases.read.all';
  IF permission_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) 
    VALUES (auditor_role_id, permission_id);
  END IF;
  
  -- Asignar permisos de solo lectura para TODOs
  SELECT id INTO permission_id FROM permissions WHERE name = 'view_all_todos';
  IF permission_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) 
    VALUES (auditor_role_id, permission_id);
  END IF;
  
  SELECT id INTO permission_id FROM permissions WHERE name = 'view_todos';
  IF permission_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) 
    VALUES (auditor_role_id, permission_id);
  END IF;
  
  -- Asignar permisos de solo lectura para notas
  SELECT id INTO permission_id FROM permissions WHERE name = 'notes.view_all';
  IF permission_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) 
    VALUES (auditor_role_id, permission_id);
  END IF;
  
  -- Asignar permisos de solo lectura para usuarios
  SELECT id INTO permission_id FROM permissions WHERE name = 'users.read';
  IF permission_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) 
    VALUES (auditor_role_id, permission_id);
  END IF;
  
  -- Asignar permisos de solo lectura para roles
  SELECT id INTO permission_id FROM permissions WHERE name = 'roles.read';
  IF permission_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) 
    VALUES (auditor_role_id, permission_id);
  END IF;
  
  -- Asignar permisos de solo lectura para permisos
  SELECT id INTO permission_id FROM permissions WHERE name = 'permissions.read';
  IF permission_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) 
    VALUES (auditor_role_id, permission_id);
  END IF;
  
  -- Asignar permisos de solo lectura para archivo
  SELECT id INTO permission_id FROM permissions WHERE name = 'archive.view_all';
  IF permission_id IS NOT NULL THEN
    INSERT INTO role_permissions (role_id, permission_id) 
    VALUES (auditor_role_id, permission_id);
  END IF;
  
  RAISE NOTICE 'Rol de auditor creado y permisos asignados correctamente';
END $$;

-- =====================================================
-- 2. ACTUALIZAR POLÍTICAS RLS PARA CASOS
-- =====================================================

-- Política para ver casos (incluir auditor)
DROP POLICY IF EXISTS "Users can view cases based on role" ON cases;
CREATE POLICY "Users can view cases based on role" ON cases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = auth.uid()
    AND up.is_active = true
    AND (
      r.name IN ('admin', 'supervisor', 'auditor') OR
      (r.name = 'analyst' AND user_id = auth.uid())
    )
  )
);

-- =====================================================
-- 3. ACTUALIZAR POLÍTICAS RLS PARA TODOS
-- =====================================================

-- Política para ver todos (incluir auditor)
DROP POLICY IF EXISTS "Users can view todos based on role" ON todos;
CREATE POLICY "Users can view todos based on role" ON todos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = auth.uid()
    AND up.is_active = true
    AND (
      r.name IN ('admin', 'supervisor', 'auditor') OR
      (r.name = 'analyst' AND (created_by_user_id = auth.uid() OR assigned_user_id = auth.uid()))
    )
  )
);

-- =====================================================
-- 4. ACTUALIZAR POLÍTICAS RLS PARA NOTAS
-- =====================================================

-- Política para ver notas (incluir auditor)
DROP POLICY IF EXISTS "Users can view notes based on role" ON notes;
CREATE POLICY "Users can view notes based on role" ON notes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = auth.uid()
    AND up.is_active = true
    AND (
      r.name IN ('admin', 'supervisor', 'auditor') OR
      (r.name = 'analyst' AND (created_by = auth.uid() OR assigned_to = auth.uid()))
    )
  )
);

-- =====================================================
-- 5. ACTUALIZAR POLÍTICAS RLS PARA ARCHIVO
-- =====================================================

-- Política para ver casos archivados (incluir auditor)
DROP POLICY IF EXISTS "Users can view archived cases based on role" ON archived_cases;
CREATE POLICY "Users can view archived cases based on role" ON archived_cases FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = auth.uid()
    AND up.is_active = true
    AND (
      r.name IN ('admin', 'supervisor', 'auditor') OR
      (r.name = 'analyst' AND archived_by = auth.uid())
    )
  )
);

-- Política para ver todos archivados (incluir auditor)
DROP POLICY IF EXISTS "Users can view archived todos based on role" ON archived_todos;
CREATE POLICY "Users can view archived todos based on role" ON archived_todos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = auth.uid()
    AND up.is_active = true
    AND (
      r.name IN ('admin', 'supervisor', 'auditor') OR
      (r.name = 'analyst' AND archived_by = auth.uid())
    )
  )
);

-- =====================================================
-- 6. ACTUALIZAR POLÍTICAS RLS PARA USER_PROFILES
-- =====================================================

-- Política para ver perfiles (incluir auditor)
DROP POLICY IF EXISTS "Users can view profiles based on role" ON user_profiles;
CREATE POLICY "Users can view profiles based on role" ON user_profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = auth.uid()
    AND up.is_active = true
    AND (
      r.name IN ('admin', 'supervisor', 'auditor') OR
      (r.name = 'analyst' AND up.id = auth.uid())
    )
  )
);

-- =====================================================
-- 7. ACTUALIZAR FUNCIÓN can_view_note
-- =====================================================

CREATE OR REPLACE FUNCTION can_view_note(note_id uuid, user_id uuid)
RETURNS boolean AS $$
BEGIN
  -- Admin, supervisor y auditor pueden ver todas
  IF EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = user_id 
    AND r.name IN ('admin', 'supervisor', 'auditor')
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

-- =====================================================
-- 8. ACTUALIZAR FUNCIÓN get_notes_stats
-- =====================================================

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
  user_role_name text;
BEGIN
  -- Obtener el rol del usuario
  SELECT r.name INTO user_role_name
  FROM user_profiles up
  JOIN roles r ON up.role_id = r.id
  WHERE up.id = user_id 
  AND up.is_active = true;
  
  -- Verificar que el usuario existe y está activo
  IF user_role_name IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado o inactivo';
  END IF;
  
  -- Obtener estadísticas según el rol
  IF user_role_name IN ('admin', 'supervisor', 'auditor') THEN
    -- Admin/Supervisor/Auditor ven todas las notas
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
    -- Analistas solo ven sus notas (creadas por él o asignadas a él)
    SELECT 
      COUNT(*) FILTER (WHERE is_archived = false),
      -- "Mis notas" para analistas incluye tanto las creadas como las asignadas
      COUNT(*) FILTER (WHERE (created_by = user_id OR assigned_to = user_id) AND is_archived = false),
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
-- 9. ACTUALIZAR FUNCIÓN search_notes
-- =====================================================

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

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

COMMENT ON FUNCTION can_view_note(uuid, uuid) IS 'Verifica si un usuario puede ver una nota específica - ACTUALIZADO: Incluye rol auditor';
COMMENT ON FUNCTION get_notes_stats(uuid) IS 'Obtiene estadísticas de notas según permisos del usuario - ACTUALIZADO: Incluye rol auditor';
COMMENT ON FUNCTION search_notes(text, uuid, integer) IS 'Busca notas por texto con información adicional - ACTUALIZADO: Incluye rol auditor';

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Rol de Auditor implementado exitosamente';
  RAISE NOTICE 'Permisos: Solo lectura en todos los módulos';
  RAISE NOTICE 'Acceso: Casos, TODOs, Notas, Archivo, Usuarios';
END $$;
