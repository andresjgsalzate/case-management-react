-- ================================================================
-- POLÍTICAS RLS CON SISTEMA DE PERMISOS GRANULAR
-- ================================================================
-- Descripción: Políticas de Row Level Security usando permisos granulares
-- Actualización del script 09 para usar sistema de permisos
-- Sistema: Basado en has_permission(auth.uid(), "modulo.accion_scope")
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- VERIFICACIÓN INICIAL
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  POLÍTICAS RLS CON PERMISOS';
    RAISE NOTICE '  GRANULARES';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE '';
END $$;

-- ================================================================
-- 1. HABILITAR RLS EN TODAS LAS TABLAS PRINCIPALES
-- ================================================================
DO $$
DECLARE
    current_table TEXT;
    tables_with_rls TEXT[] := ARRAY[
        'user_profiles', 'cases', 'case_control', 'time_entries', 'manual_time_entries',
        'todos', 'todo_control', 'todo_time_entries', 'todo_manual_time_entries',
        'notes', 'solution_documents', 'solution_document_versions', 'solution_feedback',
        'archived_cases', 'archived_todos', 'disposiciones_scripts'
    ];
BEGIN
    RAISE NOTICE 'HABILITANDO RLS EN TABLAS:';
    
    FOREACH current_table IN ARRAY tables_with_rls
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', current_table);
            RAISE NOTICE '  ✓ RLS habilitado en: %', current_table;
        EXCEPTION
            WHEN undefined_table THEN
                RAISE NOTICE '  ⚠ Tabla no encontrada: %', current_table;
            WHEN OTHERS THEN
                RAISE NOTICE '  ⚠ Error en tabla %: %', current_table, SQLERRM;
        END;
    END LOOP;
    
    RAISE NOTICE '';
END $$;

-- ================================================================
-- 2. POLÍTICAS PARA USER_PROFILES
-- ================================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "users_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "users_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "users_insert_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_select_granular" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_granular" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_granular" ON user_profiles;

-- Política de lectura de perfiles (granular)
CREATE POLICY "user_profiles_select_granular" ON user_profiles
    FOR SELECT USING (
        -- Puede leer según su scope de permisos
        CASE 
            WHEN has_permission(auth.uid(), 'users.read_all') THEN true
            WHEN has_permission(auth.uid(), 'users.read_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'users.read_own') THEN id = auth.uid()
            ELSE false
        END
    );

-- Política de actualización de perfiles (granular)
CREATE POLICY "user_profiles_update_granular" ON user_profiles
    FOR UPDATE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'users.update_all') THEN true
            WHEN has_permission(auth.uid(), 'users.update_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'users.update_own') THEN id = auth.uid()
            ELSE false
        END
    );

-- Política de inserción de perfiles (granular)
CREATE POLICY "user_profiles_insert_granular" ON user_profiles
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'users.create_own') OR
        has_permission(auth.uid(), 'users.create_team') OR
        has_permission(auth.uid(), 'users.create_all')
    );

-- ================================================================
-- 3. POLÍTICAS PARA CASES
-- ================================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "cases_select_policy" ON cases;
DROP POLICY IF EXISTS "cases_insert_policy" ON cases;
DROP POLICY IF EXISTS "cases_update_policy" ON cases;
DROP POLICY IF EXISTS "cases_delete_policy" ON cases;
DROP POLICY IF EXISTS "cases_select_granular" ON cases;
DROP POLICY IF EXISTS "cases_insert_granular" ON cases;
DROP POLICY IF EXISTS "cases_update_granular" ON cases;
DROP POLICY IF EXISTS "cases_delete_granular" ON cases;

-- Política de lectura de casos (granular)
CREATE POLICY "cases_select_granular" ON cases
    FOR SELECT USING (
        CASE 
            WHEN has_permission(auth.uid(), 'cases.read_all') THEN true
            WHEN has_permission(auth.uid(), 'cases.read_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'cases.read_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de inserción de casos (granular)
CREATE POLICY "cases_insert_granular" ON cases
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'cases.create_own') OR
        has_permission(auth.uid(), 'cases.create_team') OR
        has_permission(auth.uid(), 'cases.create_all')
    );

-- Política de actualización de casos (granular)
CREATE POLICY "cases_update_granular" ON cases
    FOR UPDATE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'cases.update_all') THEN true
            WHEN has_permission(auth.uid(), 'cases.update_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'cases.update_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de eliminación de casos (granular)
CREATE POLICY "cases_delete_granular" ON cases
    FOR DELETE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'cases.delete_all') THEN true
            WHEN has_permission(auth.uid(), 'cases.delete_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'cases.delete_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- ================================================================
-- 4. POLÍTICAS PARA CASE_CONTROL
-- ================================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "case_control_select_policy" ON case_control;
DROP POLICY IF EXISTS "case_control_insert_policy" ON case_control;
DROP POLICY IF EXISTS "case_control_select_granular" ON case_control;
DROP POLICY IF EXISTS "case_control_insert_granular" ON case_control;

-- Política de lectura de control de casos (granular)
CREATE POLICY "case_control_select_granular" ON case_control
    FOR SELECT USING (
        -- Puede ver controles de casos a los que tiene acceso
        EXISTS (
            SELECT 1 FROM cases c 
            WHERE c.id = case_control.case_id 
            AND (
                CASE 
                    WHEN has_permission(auth.uid(), 'cases.read_all') THEN true
                    WHEN has_permission(auth.uid(), 'cases.read_team') THEN true
                    WHEN has_permission(auth.uid(), 'cases.read_own') THEN c.user_id = auth.uid()
                    ELSE false
                END
            )
        )
    );

-- Política de inserción de control de casos (granular)
CREATE POLICY "case_control_insert_granular" ON case_control
    FOR INSERT WITH CHECK (
        -- Puede agregar control a casos que puede controlar
        EXISTS (
            SELECT 1 FROM cases c 
            WHERE c.id = case_control.case_id 
            AND (
                CASE 
                    WHEN has_permission(auth.uid(), 'cases.control_all') THEN true
                    WHEN has_permission(auth.uid(), 'cases.control_team') THEN true
                    WHEN has_permission(auth.uid(), 'cases.control_own') THEN c.user_id = auth.uid()
                    ELSE false
                END
            )
        )
    );

-- ================================================================
-- 5. POLÍTICAS PARA TODOS
-- ================================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "todos_select_policy" ON todos;
DROP POLICY IF EXISTS "todos_insert_policy" ON todos;
DROP POLICY IF EXISTS "todos_update_policy" ON todos;
DROP POLICY IF EXISTS "todos_delete_policy" ON todos;
DROP POLICY IF EXISTS "todos_select_granular" ON todos;
DROP POLICY IF EXISTS "todos_insert_granular" ON todos;
DROP POLICY IF EXISTS "todos_update_granular" ON todos;
DROP POLICY IF EXISTS "todos_delete_granular" ON todos;

-- Política de lectura de TODOs (granular)
CREATE POLICY "todos_select_granular" ON todos
    FOR SELECT USING (
        CASE 
            WHEN has_permission(auth.uid(), 'todos.read_all') THEN true
            WHEN has_permission(auth.uid(), 'todos.read_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'todos.read_own') THEN 
                (created_by_user_id = auth.uid() OR assigned_user_id = auth.uid())
            ELSE false
        END
    );

-- Política de inserción de TODOs (granular)
CREATE POLICY "todos_insert_granular" ON todos
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'todos.create_own') OR
        has_permission(auth.uid(), 'todos.create_team') OR
        has_permission(auth.uid(), 'todos.create_all')
    );

-- Política de actualización de TODOs (granular)
CREATE POLICY "todos_update_granular" ON todos
    FOR UPDATE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'todos.update_all') THEN true
            WHEN has_permission(auth.uid(), 'todos.update_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'todos.update_own') THEN 
                (created_by_user_id = auth.uid() OR assigned_user_id = auth.uid())
            ELSE false
        END
    );

-- Política de eliminación de TODOs (granular)
CREATE POLICY "todos_delete_granular" ON todos
    FOR DELETE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'todos.delete_all') THEN true
            WHEN has_permission(auth.uid(), 'todos.delete_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'todos.delete_own') THEN created_by_user_id = auth.uid()
            ELSE false
        END
    );

-- ================================================================
-- 6. POLÍTICAS PARA TODO_CONTROL
-- ================================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "todo_control_select_policy" ON todo_control;
DROP POLICY IF EXISTS "todo_control_insert_policy" ON todo_control;
DROP POLICY IF EXISTS "todo_control_select_granular" ON todo_control;
DROP POLICY IF EXISTS "todo_control_insert_granular" ON todo_control;

-- Política de lectura de control de TODOs (granular)
CREATE POLICY "todo_control_select_granular" ON todo_control
    FOR SELECT USING (
        -- Puede ver controles de TODOs a los que tiene acceso
        EXISTS (
            SELECT 1 FROM todos t 
            WHERE t.id = todo_control.todo_id 
            AND (
                CASE 
                    WHEN has_permission(auth.uid(), 'todos.read_all') THEN true
                    WHEN has_permission(auth.uid(), 'todos.read_team') THEN true
                    WHEN has_permission(auth.uid(), 'todos.read_own') THEN 
                        (t.created_by_user_id = auth.uid() OR t.assigned_user_id = auth.uid())
                    ELSE false
                END
            )
        )
    );

-- Política de inserción de control de TODOs (granular)
CREATE POLICY "todo_control_insert_granular" ON todo_control
    FOR INSERT WITH CHECK (
        -- Puede agregar control a TODOs que puede controlar
        EXISTS (
            SELECT 1 FROM todos t 
            WHERE t.id = todo_control.todo_id 
            AND (
                CASE 
                    WHEN has_permission(auth.uid(), 'todos.control_all') THEN true
                    WHEN has_permission(auth.uid(), 'todos.control_team') THEN true
                    WHEN has_permission(auth.uid(), 'todos.control_own') THEN 
                        (t.created_by_user_id = auth.uid() OR t.assigned_user_id = auth.uid())
                    ELSE false
                END
            )
        )
    );

-- ================================================================
-- 7. POLÍTICAS PARA SOLUTION_DOCUMENTS
-- ================================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "solution_documents_select_policy" ON solution_documents;
DROP POLICY IF EXISTS "solution_documents_insert_policy" ON solution_documents;
DROP POLICY IF EXISTS "solution_documents_update_policy" ON solution_documents;
DROP POLICY IF EXISTS "solution_documents_delete_policy" ON solution_documents;
DROP POLICY IF EXISTS "solution_documents_select_granular" ON solution_documents;
DROP POLICY IF EXISTS "solution_documents_insert_granular" ON solution_documents;
DROP POLICY IF EXISTS "solution_documents_update_granular" ON solution_documents;
DROP POLICY IF EXISTS "solution_documents_delete_granular" ON solution_documents;

-- Política de lectura de documentos (granular)
CREATE POLICY "solution_documents_select_granular" ON solution_documents
    FOR SELECT USING (
        CASE 
            WHEN has_permission(auth.uid(), 'documentation.read_all') THEN 
                (is_published = true OR created_by = auth.uid())
            WHEN has_permission(auth.uid(), 'documentation.read_team') THEN 
                (is_published = true OR created_by = auth.uid()) -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'documentation.read_own') THEN 
                created_by = auth.uid()
            ELSE false
        END
    );

-- Política de inserción de documentos (granular)
CREATE POLICY "solution_documents_insert_granular" ON solution_documents
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'documentation.create_own') OR
        has_permission(auth.uid(), 'documentation.create_team') OR
        has_permission(auth.uid(), 'documentation.create_all')
    );

-- Política de actualización de documentos (granular)
CREATE POLICY "solution_documents_update_granular" ON solution_documents
    FOR UPDATE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'documentation.update_all') THEN true
            WHEN has_permission(auth.uid(), 'documentation.update_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'documentation.update_own') THEN created_by = auth.uid()
            ELSE false
        END
    );

-- Política de eliminación de documentos (granular)
CREATE POLICY "solution_documents_delete_granular" ON solution_documents
    FOR DELETE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'documentation.delete_all') THEN true
            WHEN has_permission(auth.uid(), 'documentation.delete_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'documentation.delete_own') THEN created_by = auth.uid()
            ELSE false
        END
    );

-- ================================================================
-- 8. POLÍTICAS PARA SOLUTION_FEEDBACK
-- ================================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "solution_feedback_select_policy" ON solution_feedback;
DROP POLICY IF EXISTS "solution_feedback_insert_policy" ON solution_feedback;
DROP POLICY IF EXISTS "solution_feedback_update_policy" ON solution_feedback;
DROP POLICY IF EXISTS "solution_feedback_select_granular" ON solution_feedback;
DROP POLICY IF EXISTS "solution_feedback_insert_granular" ON solution_feedback;
DROP POLICY IF EXISTS "solution_feedback_update_granular" ON solution_feedback;

-- Política de lectura de feedback (granular)
CREATE POLICY "solution_feedback_select_granular" ON solution_feedback
    FOR SELECT USING (
        -- Puede ver feedback si puede ver el documento
        EXISTS (
            SELECT 1 FROM solution_documents sd 
            WHERE sd.id = solution_feedback.document_id 
            AND (
                CASE 
                    WHEN has_permission(auth.uid(), 'documentation.read_all') THEN 
                        (sd.is_published = true OR sd.created_by = auth.uid())
                    WHEN has_permission(auth.uid(), 'documentation.read_team') THEN 
                        (sd.is_published = true OR sd.created_by = auth.uid())
                    WHEN has_permission(auth.uid(), 'documentation.read_own') THEN 
                        sd.created_by = auth.uid()
                    ELSE false
                END
            )
        )
    );

-- Política de inserción de feedback (granular)
CREATE POLICY "solution_feedback_insert_granular" ON solution_feedback
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'documentation.feedback_own') OR
        has_permission(auth.uid(), 'documentation.feedback_team') OR
        has_permission(auth.uid(), 'documentation.feedback_all')
    );

-- Política de actualización de feedback (granular)
CREATE POLICY "solution_feedback_update_granular" ON solution_feedback
    FOR UPDATE USING (
        user_id = auth.uid() -- Solo puede editar su propio feedback
    );

-- ================================================================
-- 9. POLÍTICAS PARA ARCHIVED_CASES
-- ================================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "archived_cases_select_policy" ON archived_cases;
DROP POLICY IF EXISTS "archived_cases_insert_policy" ON archived_cases;
DROP POLICY IF EXISTS "archived_cases_delete_policy" ON archived_cases;
DROP POLICY IF EXISTS "archived_cases_select_granular" ON archived_cases;
DROP POLICY IF EXISTS "archived_cases_insert_granular" ON archived_cases;
DROP POLICY IF EXISTS "archived_cases_delete_granular" ON archived_cases;

-- Política de lectura de casos archivados (granular)
CREATE POLICY "archived_cases_select_granular" ON archived_cases
    FOR SELECT USING (
        CASE 
            WHEN has_permission(auth.uid(), 'archive.read_all') THEN true
            WHEN has_permission(auth.uid(), 'archive.read_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'archive.read_own') THEN 
                (archived_by = auth.uid() OR restored_by = auth.uid())
            ELSE false
        END
    );

-- Política de inserción de casos archivados (granular)
CREATE POLICY "archived_cases_insert_granular" ON archived_cases
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'archive.create_own') OR
        has_permission(auth.uid(), 'archive.create_team') OR
        has_permission(auth.uid(), 'archive.create_all')
    );

-- Política de eliminación de casos archivados (granular)
CREATE POLICY "archived_cases_delete_granular" ON archived_cases
    FOR DELETE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'archive.delete_all') THEN true
            WHEN has_permission(auth.uid(), 'archive.delete_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'archive.delete_own') THEN archived_by = auth.uid()
            ELSE false
        END
    );

-- ================================================================
-- 10. POLÍTICAS PARA ARCHIVED_TODOS
-- ================================================================

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "archived_todos_select_policy" ON archived_todos;
DROP POLICY IF EXISTS "archived_todos_insert_policy" ON archived_todos;
DROP POLICY IF EXISTS "archived_todos_delete_policy" ON archived_todos;
DROP POLICY IF EXISTS "archived_todos_select_granular" ON archived_todos;
DROP POLICY IF EXISTS "archived_todos_insert_granular" ON archived_todos;
DROP POLICY IF EXISTS "archived_todos_delete_granular" ON archived_todos;

-- Política de lectura de TODOs archivados (granular)
CREATE POLICY "archived_todos_select_granular" ON archived_todos
    FOR SELECT USING (
        CASE 
            WHEN has_permission(auth.uid(), 'archive.read_all') THEN true
            WHEN has_permission(auth.uid(), 'archive.read_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'archive.read_own') THEN 
                (archived_by = auth.uid() OR restored_by = auth.uid())
            ELSE false
        END
    );

-- Política de inserción de TODOs archivados (granular)
CREATE POLICY "archived_todos_insert_granular" ON archived_todos
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'archive.create_own') OR
        has_permission(auth.uid(), 'archive.create_team') OR
        has_permission(auth.uid(), 'archive.create_all')
    );

-- Política de eliminación de TODOs archivados (granular)
CREATE POLICY "archived_todos_delete_granular" ON archived_todos
    FOR DELETE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'archive.delete_all') THEN true
            WHEN has_permission(auth.uid(), 'archive.delete_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'archive.delete_own') THEN archived_by = auth.uid()
            ELSE false
        END
    );

-- ================================================================
-- 11. POLÍTICAS PARA TIME_ENTRIES
-- ================================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "time_entries_select_policy" ON time_entries;
DROP POLICY IF EXISTS "time_entries_insert_policy" ON time_entries;
DROP POLICY IF EXISTS "time_entries_update_policy" ON time_entries;
DROP POLICY IF EXISTS "time_entries_delete_policy" ON time_entries;
DROP POLICY IF EXISTS "time_entries_select_granular" ON time_entries;
DROP POLICY IF EXISTS "time_entries_insert_granular" ON time_entries;
DROP POLICY IF EXISTS "time_entries_update_granular" ON time_entries;
DROP POLICY IF EXISTS "time_entries_delete_granular" ON time_entries;

-- Política de lectura de entradas de tiempo (granular)
CREATE POLICY "time_entries_select_granular" ON time_entries
    FOR SELECT USING (
        CASE 
            WHEN has_permission(auth.uid(), 'case_control.manual_time_all') THEN true
            WHEN has_permission(auth.uid(), 'case_control.manual_time_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'case_control.manual_time_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de inserción de entradas de tiempo (granular)
CREATE POLICY "time_entries_insert_granular" ON time_entries
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'case_control.manual_time_own') OR
        has_permission(auth.uid(), 'case_control.manual_time_team') OR
        has_permission(auth.uid(), 'case_control.manual_time_all')
    );

-- Política de actualización de entradas de tiempo (granular)
CREATE POLICY "time_entries_update_granular" ON time_entries
    FOR UPDATE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'case_control.manual_time_all') THEN true
            WHEN has_permission(auth.uid(), 'case_control.manual_time_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'case_control.manual_time_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de eliminación de entradas de tiempo (granular)
CREATE POLICY "time_entries_delete_granular" ON time_entries
    FOR DELETE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'case_control.manual_time_all') THEN true
            WHEN has_permission(auth.uid(), 'case_control.manual_time_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'case_control.manual_time_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- ================================================================
-- 12. POLÍTICAS PARA MANUAL_TIME_ENTRIES
-- ================================================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "manual_time_entries_select_policy" ON manual_time_entries;
DROP POLICY IF EXISTS "manual_time_entries_insert_policy" ON manual_time_entries;
DROP POLICY IF EXISTS "manual_time_entries_update_policy" ON manual_time_entries;
DROP POLICY IF EXISTS "manual_time_entries_delete_policy" ON manual_time_entries;
DROP POLICY IF EXISTS "manual_time_entries_select_granular" ON manual_time_entries;
DROP POLICY IF EXISTS "manual_time_entries_insert_granular" ON manual_time_entries;
DROP POLICY IF EXISTS "manual_time_entries_update_granular" ON manual_time_entries;
DROP POLICY IF EXISTS "manual_time_entries_delete_granular" ON manual_time_entries;

-- Política de lectura de entradas de tiempo manual (granular)
CREATE POLICY "manual_time_entries_select_granular" ON manual_time_entries
    FOR SELECT USING (
        CASE 
            WHEN has_permission(auth.uid(), 'case_control.manual_time_all') THEN true
            WHEN has_permission(auth.uid(), 'case_control.manual_time_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'case_control.manual_time_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de inserción de entradas de tiempo manual (granular)
CREATE POLICY "manual_time_entries_insert_granular" ON manual_time_entries
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'case_control.manual_time_own') OR
        has_permission(auth.uid(), 'case_control.manual_time_team') OR
        has_permission(auth.uid(), 'case_control.manual_time_all')
    );

-- Política de actualización de entradas de tiempo manual (granular)
CREATE POLICY "manual_time_entries_update_granular" ON manual_time_entries
    FOR UPDATE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'case_control.manual_time_all') THEN true
            WHEN has_permission(auth.uid(), 'case_control.manual_time_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'case_control.manual_time_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de eliminación de entradas de tiempo manual (granular)
CREATE POLICY "manual_time_entries_delete_granular" ON manual_time_entries
    FOR DELETE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'case_control.manual_time_all') THEN true
            WHEN has_permission(auth.uid(), 'case_control.manual_time_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'case_control.manual_time_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- ================================================================
-- 13. VERIFICACIÓN FINAL
-- ================================================================
DO $$
DECLARE
    policy_count INTEGER;
    table_name TEXT;
    tables_with_rls TEXT[] := ARRAY[
        'user_profiles', 'cases', 'case_control', 'time_entries', 'manual_time_entries',
        'todos', 'todo_control', 'todo_time_entries', 'todo_manual_time_entries',
        'solution_documents', 'solution_feedback', 'archived_cases', 'archived_todos'
    ];
BEGIN
    -- Contar políticas creadas
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND policyname LIKE '%_granular';
    
    RAISE NOTICE 'VERIFICACIÓN FINAL - POLÍTICAS RLS:';
    RAISE NOTICE '- Políticas granulares creadas: %', policy_count;
    
    -- Verificar RLS habilitado en tablas
    RAISE NOTICE '- Tablas con RLS habilitado:';
    FOREACH table_name IN ARRAY tables_with_rls
    LOOP
        IF EXISTS (
            SELECT 1 FROM pg_class c 
            JOIN pg_namespace n ON c.relnamespace = n.oid 
            WHERE n.nspname = 'public' 
            AND c.relname = table_name 
            AND c.relrowsecurity = true
        ) THEN
            RAISE NOTICE '  ✓ %', table_name;
        ELSE
            RAISE NOTICE '  ✗ %', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '🔒 POLÍTICAS RLS CON PERMISOS GRANULARES COMPLETADAS';
    RAISE NOTICE '';
    RAISE NOTICE 'NOTA: Las políticas implementan scope-based access control:';
    RAISE NOTICE '- scope "own": Solo recursos propios del usuario';
    RAISE NOTICE '- scope "team": Recursos del equipo (pendiente implementar)';
    RAISE NOTICE '- scope "all": Todos los recursos del sistema';
    RAISE NOTICE '';
END $$;
