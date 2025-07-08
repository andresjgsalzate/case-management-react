-- Migración 016: Módulo de Archivo Completo
-- Versión: 2.2.0
-- Fecha: 2025-07-07
-- Descripción: Módulo completo de archivo para casos y TODOs terminados
-- Incluye tablas, índices, triggers, políticas RLS, funciones y vistas

-- =====================================================
-- TABLA DE CASOS ARCHIVADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS archived_cases (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    original_case_id uuid NOT NULL, -- ID del caso original (puede no existir más)
    case_number character varying NOT NULL,
    description TEXT,
    classification character varying NOT NULL,
    total_time_minutes INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ NOT NULL,
    archived_at TIMESTAMPTZ DEFAULT now(),
    archived_by uuid NOT NULL,
    original_data JSONB NOT NULL, -- Datos completos del caso original
    control_data JSONB NOT NULL, -- Datos de control y tiempo
    restored_at TIMESTAMPTZ,
    restored_by uuid,
    is_restored BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT archived_cases_pkey PRIMARY KEY (id),
    CONSTRAINT archived_cases_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES user_profiles(id),
    CONSTRAINT archived_cases_restored_by_fkey FOREIGN KEY (restored_by) REFERENCES user_profiles(id)
);

-- =====================================================
-- TABLA DE TODOS ARCHIVADOS
-- =====================================================

CREATE TABLE IF NOT EXISTS archived_todos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    original_todo_id uuid NOT NULL, -- ID del TODO original (puede no existir más)
    title character varying NOT NULL,
    description TEXT,
    priority character varying NOT NULL,
    total_time_minutes INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ NOT NULL,
    archived_at TIMESTAMPTZ DEFAULT now(),
    archived_by uuid NOT NULL,
    original_data JSONB NOT NULL, -- Datos completos del TODO original
    control_data JSONB NOT NULL, -- Datos de control y tiempo
    restored_at TIMESTAMPTZ,
    restored_by uuid,
    is_restored BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT archived_todos_pkey PRIMARY KEY (id),
    CONSTRAINT archived_todos_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES user_profiles(id),
    CONSTRAINT archived_todos_restored_by_fkey FOREIGN KEY (restored_by) REFERENCES user_profiles(id)
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- =====================================================

-- Índices para archived_cases
CREATE INDEX IF NOT EXISTS idx_archived_cases_archived_by ON archived_cases(archived_by);
CREATE INDEX IF NOT EXISTS idx_archived_cases_archived_at ON archived_cases(archived_at);
CREATE INDEX IF NOT EXISTS idx_archived_cases_classification ON archived_cases(classification);
CREATE INDEX IF NOT EXISTS idx_archived_cases_is_restored ON archived_cases(is_restored);
CREATE INDEX IF NOT EXISTS idx_archived_cases_case_number ON archived_cases(case_number);
CREATE INDEX IF NOT EXISTS idx_archived_cases_original_case_id ON archived_cases(original_case_id);

-- Índices para archived_todos
CREATE INDEX IF NOT EXISTS idx_archived_todos_archived_by ON archived_todos(archived_by);
CREATE INDEX IF NOT EXISTS idx_archived_todos_archived_at ON archived_todos(archived_at);
CREATE INDEX IF NOT EXISTS idx_archived_todos_priority ON archived_todos(priority);
CREATE INDEX IF NOT EXISTS idx_archived_todos_is_restored ON archived_todos(is_restored);
CREATE INDEX IF NOT EXISTS idx_archived_todos_title ON archived_todos(title);
CREATE INDEX IF NOT EXISTS idx_archived_todos_original_todo_id ON archived_todos(original_todo_id);

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

CREATE TRIGGER update_archived_cases_updated_at 
    BEFORE UPDATE ON archived_cases 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_archived_todos_updated_at 
    BEFORE UPDATE ON archived_todos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- HABILITAR RLS EN LAS TABLAS DE ARCHIVO
-- =====================================================

ALTER TABLE archived_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_todos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS RLS PARA ARCHIVED_CASES
-- =====================================================

-- Política para SELECT - Los usuarios pueden ver casos archivados según sus permisos
CREATE POLICY "Users can view archived cases based on permissions" ON archived_cases
  FOR SELECT
  USING (
    -- Administradores pueden ver todos los casos archivados
    auth.uid() IN (
      SELECT up.id FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE r.name = 'admin' AND up.is_active = true
    )
    OR
    -- Supervisores pueden ver todos los casos archivados
    auth.uid() IN (
      SELECT up.id FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE r.name = 'supervisor' AND up.is_active = true
    )
    OR
    -- Analistas pueden ver casos archivados por ellos o asignados a ellos
    (
      auth.uid() IN (
        SELECT up.id FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE r.name = 'analista' AND up.is_active = true
      )
      AND
      (
        archived_by = auth.uid() OR
        (original_data->>'user_id')::uuid = auth.uid() OR
        (control_data->>'user_id')::uuid = auth.uid()
      )
    )
  );

-- Política para INSERT - Solo usuarios autenticados pueden archivar casos
CREATE POLICY "Authenticated users can archive cases" ON archived_cases
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() IN (
      SELECT id FROM user_profiles WHERE is_active = true
    )
    AND archived_by = auth.uid()
  );

-- Política para UPDATE - Admins, supervisores pueden actualizar todos, analistas solo los suyos
CREATE POLICY "Users can update archived cases based on permissions" ON archived_cases
  FOR UPDATE
  USING (
    -- Administradores y supervisores pueden actualizar todos los casos archivados
    auth.uid() IN (
      SELECT up.id FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE r.name IN ('admin', 'supervisor') AND up.is_active = true
    )
    OR
    -- Analistas pueden actualizar (restaurar) solo casos archivados por ellos
    (
      auth.uid() IN (
        SELECT up.id FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE r.name = 'analista' AND up.is_active = true
      )
      AND archived_by = auth.uid()
    )
  );

-- Política para DELETE - Solo administradores pueden eliminar casos archivados
CREATE POLICY "Only admins can delete archived cases" ON archived_cases
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT up.id FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE r.name = 'admin' AND up.is_active = true
    )
  );

-- =====================================================
-- POLÍTICAS RLS PARA ARCHIVED_TODOS
-- =====================================================

-- Política para SELECT - Los usuarios pueden ver TODOs archivados según sus permisos
CREATE POLICY "Users can view archived todos based on permissions" ON archived_todos
  FOR SELECT
  USING (
    -- Administradores pueden ver todos los TODOs archivados
    auth.uid() IN (
      SELECT up.id FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE r.name = 'admin' AND up.is_active = true
    )
    OR
    -- Supervisores pueden ver todos los TODOs archivados
    auth.uid() IN (
      SELECT up.id FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE r.name = 'supervisor' AND up.is_active = true
    )
    OR
    -- Analistas pueden ver TODOs archivados por ellos o asignados a ellos
    (
      auth.uid() IN (
        SELECT up.id FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE r.name = 'analista' AND up.is_active = true
      )
      AND
      (
        archived_by = auth.uid() OR
        (original_data->>'created_by_user_id')::uuid = auth.uid() OR
        (control_data->>'user_id')::uuid = auth.uid()
      )
    )
  );

-- Política para INSERT - Solo usuarios autenticados pueden archivar TODOs
CREATE POLICY "Authenticated users can archive todos" ON archived_todos
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND auth.uid() IN (
      SELECT id FROM user_profiles WHERE is_active = true
    )
    AND archived_by = auth.uid()
  );

-- Política para UPDATE - Admins, supervisores pueden actualizar todos, analistas solo los suyos
CREATE POLICY "Users can update archived todos based on permissions" ON archived_todos
  FOR UPDATE
  USING (
    -- Administradores y supervisores pueden actualizar todos los TODOs archivados
    auth.uid() IN (
      SELECT up.id FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE r.name IN ('admin', 'supervisor') AND up.is_active = true
    )
    OR
    -- Analistas pueden actualizar (restaurar) solo TODOs archivados por ellos
    (
      auth.uid() IN (
        SELECT up.id FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE r.name = 'analista' AND up.is_active = true
      )
      AND archived_by = auth.uid()
    )
  );

-- Política para DELETE - Solo administradores pueden eliminar TODOs archivados
CREATE POLICY "Only admins can delete archived todos" ON archived_todos
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT up.id FROM user_profiles up
      JOIN roles r ON up.role_id = r.id
      WHERE r.name = 'admin' AND up.is_active = true
    )
  );

-- =====================================================
-- FUNCIONES DE ARCHIVO Y RESTAURACIÓN
-- =====================================================

-- Función para archivar casos
CREATE OR REPLACE FUNCTION archive_case(
    p_case_id uuid,
    p_archived_by uuid,
    p_reason TEXT DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
    v_archived_id uuid;
    v_case_data JSONB;
    v_control_data JSONB;
    v_case_number character varying;
    v_description TEXT;
    v_classification character varying;
    v_total_time INTEGER;
    v_completed_at TIMESTAMPTZ;
BEGIN
    -- Obtener datos del caso
    SELECT 
        c.numero_caso,
        c.descripcion,
        c.clasificacion,
        COALESCE(cc.total_time_minutes, 0),
        cc.completed_at,
        row_to_json(c.*),
        row_to_json(cc.*)
    INTO 
        v_case_number,
        v_description,
        v_classification,
        v_total_time,
        v_completed_at,
        v_case_data,
        v_control_data
    FROM cases c
    LEFT JOIN case_control cc ON c.id = cc.case_id
    WHERE c.id = p_case_id;
    
    -- Verificar que el caso existe y está terminado
    IF NOT FOUND OR v_completed_at IS NULL THEN
        RAISE EXCEPTION 'Case not found or not completed';
    END IF;
    
    -- Insertar en archivo
    INSERT INTO archived_cases (
        original_case_id,
        case_number,
        description,
        classification,
        total_time_minutes,
        completed_at,
        archived_by,
        original_data,
        control_data
    ) VALUES (
        p_case_id,
        v_case_number,
        v_description,
        v_classification,
        v_total_time,
        v_completed_at,
        p_archived_by,
        v_case_data,
        v_control_data
    ) RETURNING id INTO v_archived_id;
    
    -- Eliminar el caso original y sus datos relacionados
    DELETE FROM cases WHERE id = p_case_id;
    
    RETURN v_archived_id;
END;
$$ LANGUAGE plpgsql;

-- Función para archivar TODOs
CREATE OR REPLACE FUNCTION archive_todo(
    p_todo_id uuid,
    p_archived_by uuid,
    p_reason TEXT DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
    v_archived_id uuid;
    v_todo_data JSONB;
    v_control_data JSONB;
    v_title character varying;
    v_description TEXT;
    v_priority character varying;
    v_total_time INTEGER;
    v_completed_at TIMESTAMPTZ;
BEGIN
    -- Obtener datos del TODO
    SELECT 
        t.title,
        t.description,
        tp.name,
        COALESCE(tc.total_time_minutes, 0),
        tc.completed_at,
        row_to_json(t.*),
        row_to_json(tc.*)
    INTO 
        v_title,
        v_description,
        v_priority,
        v_total_time,
        v_completed_at,
        v_todo_data,
        v_control_data
    FROM todos t
    LEFT JOIN todo_control tc ON t.id = tc.todo_id
    LEFT JOIN todo_priorities tp ON t.priority_id = tp.id
    WHERE t.id = p_todo_id;
    
    -- Verificar que el TODO existe y está terminado
    IF NOT FOUND OR v_completed_at IS NULL THEN
        RAISE EXCEPTION 'TODO not found or not completed';
    END IF;
    
    -- Insertar en archivo
    INSERT INTO archived_todos (
        original_todo_id,
        title,
        description,
        priority,
        total_time_minutes,
        completed_at,
        archived_by,
        original_data,
        control_data
    ) VALUES (
        p_todo_id,
        v_title,
        v_description,
        v_priority,
        v_total_time,
        v_completed_at,
        p_archived_by,
        v_todo_data,
        v_control_data
    ) RETURNING id INTO v_archived_id;
    
    -- Eliminar el TODO original y sus datos relacionados
    DELETE FROM todos WHERE id = p_todo_id;
    
    RETURN v_archived_id;
END;
$$ LANGUAGE plpgsql;

-- Función para restaurar casos
CREATE OR REPLACE FUNCTION restore_case(
    p_archived_id uuid,
    p_restored_by uuid,
    p_reason TEXT DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
    v_case_id uuid;
    v_original_data JSONB;
    v_control_data JSONB;
BEGIN
    -- Obtener datos del caso archivado
    SELECT 
        original_data,
        control_data
    INTO 
        v_original_data,
        v_control_data
    FROM archived_cases 
    WHERE id = p_archived_id AND is_restored = false;
    
    -- Verificar que el caso archivado existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Archived case not found or already restored';
    END IF;
    
    -- Marcar como restaurado
    UPDATE archived_cases 
    SET 
        is_restored = true,
        restored_at = now(),
        restored_by = p_restored_by,
        updated_at = now()
    WHERE id = p_archived_id;
    
    RETURN p_archived_id;
END;
$$ LANGUAGE plpgsql;

-- Función para restaurar TODOs
CREATE OR REPLACE FUNCTION restore_todo(
    p_archived_id uuid,
    p_restored_by uuid,
    p_reason TEXT DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
    v_todo_id uuid;
    v_original_data JSONB;
    v_control_data JSONB;
BEGIN
    -- Obtener datos del TODO archivado
    SELECT 
        original_data,
        control_data
    INTO 
        v_original_data,
        v_control_data
    FROM archived_todos 
    WHERE id = p_archived_id AND is_restored = false;
    
    -- Verificar que el TODO archivado existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Archived TODO not found or already restored';
    END IF;
    
    -- Marcar como restaurado
    UPDATE archived_todos 
    SET 
        is_restored = true,
        restored_at = now(),
        restored_by = p_restored_by,
        updated_at = now()
    WHERE id = p_archived_id;
    
    RETURN p_archived_id;
END;
$$ LANGUAGE plpgsql;

-- Función para limpiar registros huérfanos
CREATE OR REPLACE FUNCTION cleanup_orphaned_records()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER := 0;
    v_case_count INTEGER := 0;
    v_todo_count INTEGER := 0;
BEGIN
    -- Limpiar case_control huérfanos
    DELETE FROM case_control 
    WHERE case_id NOT IN (SELECT id FROM cases);
    
    GET DIAGNOSTICS v_case_count = ROW_COUNT;
    
    -- Limpiar todo_control huérfanos
    DELETE FROM todo_control 
    WHERE todo_id NOT IN (SELECT id FROM todos);
    
    GET DIAGNOSTICS v_todo_count = ROW_COUNT;
    
    v_deleted_count := v_case_count + v_todo_count;
    
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Función para estadísticas generales
CREATE OR REPLACE FUNCTION get_archive_stats()
RETURNS TABLE (
  total_archived_cases INTEGER,
  total_archived_todos INTEGER,
  total_time_minutes INTEGER,
  archived_this_month INTEGER,
  restored_this_month INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM archived_cases WHERE is_restored = false),
    (SELECT COUNT(*)::INTEGER FROM archived_todos WHERE is_restored = false),
    ((SELECT COALESCE(SUM(total_time_minutes), 0) FROM archived_cases WHERE is_restored = false) + 
     (SELECT COALESCE(SUM(total_time_minutes), 0) FROM archived_todos WHERE is_restored = false))::INTEGER,
    ((SELECT COUNT(*) FROM archived_cases WHERE archived_at >= date_trunc('month', now()) AND is_restored = false) +
     (SELECT COUNT(*) FROM archived_todos WHERE archived_at >= date_trunc('month', now()) AND is_restored = false))::INTEGER,
    ((SELECT COUNT(*) FROM archived_cases WHERE restored_at >= date_trunc('month', now())) +
     (SELECT COUNT(*) FROM archived_todos WHERE restored_at >= date_trunc('month', now())))::INTEGER;
END;
$$ LANGUAGE plpgsql;

-- Función para estadísticas mensuales
CREATE OR REPLACE FUNCTION get_archive_stats_monthly()
RETURNS TABLE (
  month text,
  archived_cases integer,
  archived_todos integer,
  total_time_minutes integer
) AS $$
BEGIN
  RETURN QUERY
  WITH monthly_cases AS (
    SELECT 
      TO_CHAR(ac.archived_at, 'YYYY-MM') as month,
      COUNT(*)::integer as archived_cases,
      COALESCE(SUM(ac.total_time_minutes), 0)::integer as case_time
    FROM archived_cases ac
    WHERE ac.archived_at >= NOW() - INTERVAL '12 months'
    AND ac.is_restored = false
    GROUP BY TO_CHAR(ac.archived_at, 'YYYY-MM')
  ),
  monthly_todos AS (
    SELECT 
      TO_CHAR(at.archived_at, 'YYYY-MM') as month,
      COUNT(*)::integer as archived_todos,
      COALESCE(SUM(at.total_time_minutes), 0)::integer as todo_time
    FROM archived_todos at
    WHERE at.archived_at >= NOW() - INTERVAL '12 months'
    AND at.is_restored = false
    GROUP BY TO_CHAR(at.archived_at, 'YYYY-MM')
  ),
  all_months AS (
    SELECT TO_CHAR(generate_series(
      date_trunc('month', NOW() - INTERVAL '11 months'),
      date_trunc('month', NOW()),
      '1 month'::interval
    ), 'YYYY-MM') as month
  )
  SELECT 
    am.month,
    COALESCE(mc.archived_cases, 0) as archived_cases,
    COALESCE(mt.archived_todos, 0) as archived_todos,
    (COALESCE(mc.case_time, 0) + COALESCE(mt.todo_time, 0)) as total_time_minutes
  FROM all_months am
  LEFT JOIN monthly_cases mc ON am.month = mc.month
  LEFT JOIN monthly_todos mt ON am.month = mt.month
  ORDER BY am.month;
END;
$$ LANGUAGE plpgsql;

-- Función para verificar permisos de archivo
CREATE OR REPLACE FUNCTION can_archive_items(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = user_id 
    AND up.is_active = true
    AND r.name IN ('admin', 'supervisor', 'analista')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar permisos de restauración
CREATE OR REPLACE FUNCTION can_restore_items(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = user_id 
    AND up.is_active = true
    AND r.name IN ('admin', 'supervisor', 'analista')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VISTA PARA ESTADÍSTICAS DE ARCHIVO
-- =====================================================

CREATE OR REPLACE VIEW archive_stats AS
SELECT 
    (SELECT COUNT(*) FROM archived_cases WHERE is_restored = false) as total_archived_cases,
    (SELECT COUNT(*) FROM archived_todos WHERE is_restored = false) as total_archived_todos,
    (SELECT COALESCE(SUM(total_time_minutes), 0) FROM archived_cases WHERE is_restored = false) + 
    (SELECT COALESCE(SUM(total_time_minutes), 0) FROM archived_todos WHERE is_restored = false) as total_archived_time_minutes,
    (SELECT COUNT(*) FROM archived_cases WHERE archived_at >= date_trunc('month', now()) AND is_restored = false) +
    (SELECT COUNT(*) FROM archived_todos WHERE archived_at >= date_trunc('month', now()) AND is_restored = false) as archived_this_month,
    (SELECT COUNT(*) FROM archived_cases WHERE restored_at >= date_trunc('month', now())) +
    (SELECT COUNT(*) FROM archived_todos WHERE restored_at >= date_trunc('month', now())) as restored_this_month;

-- =====================================================
-- COMENTARIOS EN TABLAS Y FUNCIONES
-- =====================================================

COMMENT ON TABLE archived_cases IS 'Casos archivados con todos sus datos y tiempos';
COMMENT ON TABLE archived_todos IS 'TODOs archivados con todos sus datos y tiempos';
COMMENT ON COLUMN archived_cases.original_data IS 'Datos completos del caso original en formato JSON';
COMMENT ON COLUMN archived_cases.control_data IS 'Datos de control y tiempo en formato JSON';
COMMENT ON COLUMN archived_todos.original_data IS 'Datos completos del TODO original en formato JSON';
COMMENT ON COLUMN archived_todos.control_data IS 'Datos de control y tiempo en formato JSON';

COMMENT ON FUNCTION archive_case(uuid, uuid, TEXT) IS 'Archiva un caso terminado con todos sus datos';
COMMENT ON FUNCTION archive_todo(uuid, uuid, TEXT) IS 'Archiva un TODO terminado con todos sus datos';
COMMENT ON FUNCTION restore_case(uuid, uuid, TEXT) IS 'Marca un caso archivado como restaurado';
COMMENT ON FUNCTION restore_todo(uuid, uuid, TEXT) IS 'Marca un TODO archivado como restaurado';
COMMENT ON FUNCTION cleanup_orphaned_records() IS 'Limpia registros huérfanos de control';
COMMENT ON FUNCTION get_archive_stats() IS 'Obtiene estadísticas generales de archivo';
COMMENT ON FUNCTION get_archive_stats_monthly() IS 'Obtiene estadísticas mensuales de archivo';
COMMENT ON FUNCTION can_archive_items(uuid) IS 'Verifica si un usuario puede archivar elementos';
COMMENT ON FUNCTION can_restore_items(uuid) IS 'Verifica si un usuario puede restaurar elementos';
