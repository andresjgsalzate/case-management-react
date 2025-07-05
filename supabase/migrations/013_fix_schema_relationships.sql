-- Migración 013: Arreglar relaciones del esquema para el módulo Control de Casos
-- Solucionar problemas de schema cache en PostgREST/Supabase

-- Primero, verificar que las tablas existan y tengan las relaciones correctas
-- Esto forzará a PostgREST a recargar la metadata del esquema

-- Verificar que user_profiles existe y tiene la estructura correcta
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
        RAISE EXCEPTION 'Tabla user_profiles no existe. Se requiere para las relaciones.';
    END IF;
END $$;

-- Verificar que cases existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cases') THEN
        RAISE EXCEPTION 'Tabla cases no existe. Se requiere para las relaciones.';
    END IF;
END $$;

-- Eliminar y recrear las foreign keys para forzar la recarga del schema cache
-- Esto es necesario porque PostgREST a veces no detecta relaciones correctamente

-- case_control table
ALTER TABLE case_control DROP CONSTRAINT IF EXISTS case_control_user_id_fkey;
ALTER TABLE case_control DROP CONSTRAINT IF EXISTS case_control_case_id_fkey;
ALTER TABLE case_control DROP CONSTRAINT IF EXISTS case_control_status_id_fkey;

-- Recrear las foreign keys con nombres específicos
ALTER TABLE case_control 
ADD CONSTRAINT case_control_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE case_control 
ADD CONSTRAINT case_control_case_id_fkey 
FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE;

ALTER TABLE case_control 
ADD CONSTRAINT case_control_status_id_fkey 
FOREIGN KEY (status_id) REFERENCES case_status_control(id);

-- time_entries table
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_case_control_id_fkey;
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_user_id_fkey;

ALTER TABLE time_entries 
ADD CONSTRAINT time_entries_case_control_id_fkey 
FOREIGN KEY (case_control_id) REFERENCES case_control(id) ON DELETE CASCADE;

ALTER TABLE time_entries 
ADD CONSTRAINT time_entries_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- manual_time_entries table
ALTER TABLE manual_time_entries DROP CONSTRAINT IF EXISTS manual_time_entries_case_control_id_fkey;
ALTER TABLE manual_time_entries DROP CONSTRAINT IF EXISTS manual_time_entries_user_id_fkey;
ALTER TABLE manual_time_entries DROP CONSTRAINT IF EXISTS manual_time_entries_created_by_fkey;

ALTER TABLE manual_time_entries 
ADD CONSTRAINT manual_time_entries_case_control_id_fkey 
FOREIGN KEY (case_control_id) REFERENCES case_control(id) ON DELETE CASCADE;

ALTER TABLE manual_time_entries 
ADD CONSTRAINT manual_time_entries_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE manual_time_entries 
ADD CONSTRAINT manual_time_entries_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES user_profiles(id);

-- Verificar que las relaciones estén correctamente establecidas
DO $$
DECLARE
    rel_count INTEGER;
BEGIN
    -- Verificar relación case_control -> user_profiles
    SELECT COUNT(*) INTO rel_count
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'case_control' 
    AND tc.constraint_type = 'FOREIGN KEY'
    AND kcu.column_name = 'user_id'
    AND ccu.table_name = 'user_profiles';
    
    IF rel_count = 0 THEN
        RAISE EXCEPTION 'Relación case_control.user_id -> user_profiles.id no establecida correctamente';
    END IF;
    
    RAISE NOTICE 'Relaciones verificadas correctamente para case_control';
END $$;

-- Forzar una actualización de estadísticas para mejorar el reconocimiento del esquema
ANALYZE case_control;
ANALYZE time_entries;
ANALYZE manual_time_entries;
ANALYZE case_status_control;
ANALYZE user_profiles;
ANALYZE cases;

-- Función para verificar la integridad de las relaciones
CREATE OR REPLACE FUNCTION verify_case_control_relationships()
RETURNS BOOLEAN AS $$
DECLARE
    test_result BOOLEAN := true;
BEGIN
    -- Verificar que podemos hacer joins básicos
    PERFORM cc.id, up.full_name
    FROM case_control cc
    JOIN user_profiles up ON cc.user_id = up.id
    LIMIT 1;
    
    RETURN test_result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$ LANGUAGE plpgsql;

-- Crear una vista que facilite las consultas complejas
CREATE OR REPLACE VIEW case_control_detailed AS
SELECT 
    cc.id,
    cc.case_id,
    cc.user_id,
    cc.status_id,
    cc.total_time_minutes,
    cc.timer_start_at,
    cc.is_timer_active,
    cc.assigned_at,
    cc.started_at,
    cc.completed_at,
    cc.created_at,
    cc.updated_at,
    
    -- Información del usuario asignado
    up.full_name as assigned_user_name,
    up.email as assigned_user_email,
    
    -- Información del caso
    c.numero_caso as case_number,
    c.descripcion as case_description,
    c.clasificacion as case_classification,
    c.puntuacion as case_score,
    
    -- Información del estado
    csc.name as status_name,
    csc.description as status_description,
    csc.color as status_color
FROM case_control cc
LEFT JOIN user_profiles up ON cc.user_id = up.id
LEFT JOIN cases c ON cc.case_id = c.id
LEFT JOIN case_status_control csc ON cc.status_id = csc.id;

-- Otorgar permisos a la vista
GRANT SELECT ON case_control_detailed TO authenticated;

-- Comentarios para documentar las relaciones
COMMENT ON TABLE case_control IS 'Control de casos con seguimiento de tiempo y estados';
COMMENT ON COLUMN case_control.user_id IS 'Usuario asignado al caso (FK a user_profiles.id)';
COMMENT ON COLUMN case_control.case_id IS 'Caso controlado (FK a cases.id)';
COMMENT ON COLUMN case_control.status_id IS 'Estado actual del control (FK a case_status_control.id)';

COMMENT ON VIEW case_control_detailed IS 'Vista desnormalizada para consultas complejas del control de casos';
