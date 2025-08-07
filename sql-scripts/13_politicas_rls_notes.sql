-- ================================================================
-- POLÍTICAS RLS PARA TABLA NOTES
-- ================================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "notes_select_granular" ON notes;
DROP POLICY IF EXISTS "notes_insert_granular" ON notes;
DROP POLICY IF EXISTS "notes_update_granular" ON notes;
DROP POLICY IF EXISTS "notes_delete_granular" ON notes;

-- Habilitar RLS en la tabla notes
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- POLÍTICAS RLS GRANULARES PARA NOTES
-- ================================================================

-- Política de lectura de notas (granular)
CREATE POLICY "notes_select_granular" ON notes
    FOR SELECT USING (
        CASE 
            WHEN has_permission(auth.uid(), 'notes.read_all') THEN true
            WHEN has_permission(auth.uid(), 'notes.read_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'notes.read_own') THEN 
                (created_by = auth.uid() OR assigned_to = auth.uid())
            ELSE false
        END
    );

-- Política de inserción de notas (granular)
CREATE POLICY "notes_insert_granular" ON notes
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'notes.create_own') OR
        has_permission(auth.uid(), 'notes.create_team') OR
        has_permission(auth.uid(), 'notes.create_all')
    );

-- Política de actualización de notas (granular)
CREATE POLICY "notes_update_granular" ON notes
    FOR UPDATE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'notes.update_all') THEN true
            WHEN has_permission(auth.uid(), 'notes.update_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'notes.update_own') THEN 
                (created_by = auth.uid() OR assigned_to = auth.uid())
            ELSE false
        END
    );

-- Política de eliminación de notas (granular)
CREATE POLICY "notes_delete_granular" ON notes
    FOR DELETE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'notes.delete_all') THEN true
            WHEN has_permission(auth.uid(), 'notes.delete_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'notes.delete_own') THEN 
                (created_by = auth.uid() OR assigned_to = auth.uid())
            ELSE false
        END
    );
