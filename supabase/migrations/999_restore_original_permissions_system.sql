-- ================================================================
-- SCRIPT DE RESTAURACIÓN: SISTEMA DE PERMISOS ORIGINAL
-- ================================================================
-- Descripción: Restaura las políticas RLS originales del sistema
-- Fecha: 4 de Agosto, 2025
-- Versión: 1.0.0
-- ================================================================
-- IMPORTANTE: Este script elimina todas las políticas RLS existentes
-- y restaura las políticas básicas originales del sistema
-- ================================================================

-- ================================================================
-- DESACTIVAR TEMPORALMENTE RLS PARA LIMPIEZA
-- ================================================================

ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE case_status_control DISABLE ROW LEVEL SECURITY;
ALTER TABLE case_time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;
ALTER TABLE todo_control DISABLE ROW LEVEL SECURITY;
ALTER TABLE todo_time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE todo_manual_time_entries DISABLE ROW LEVEL SECURITY;
ALTER TABLE todo_priorities DISABLE ROW LEVEL SECURITY;
ALTER TABLE notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE archived_cases DISABLE ROW LEVEL SECURITY;
ALTER TABLE archived_todos DISABLE ROW LEVEL SECURITY;
ALTER TABLE archive_deletion_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE solution_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE solution_document_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE solution_feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE solution_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE document_attachments DISABLE ROW LEVEL SECURITY;
ALTER TABLE disposiciones_scripts DISABLE ROW LEVEL SECURITY;

-- ================================================================
-- ELIMINAR TODAS LAS POLÍTICAS RLS EXISTENTES
-- ================================================================

-- Políticas de user_profiles
DROP POLICY IF EXISTS "Los usuarios pueden ver su propio perfil" ON user_profiles;
DROP POLICY IF EXISTS "Los admins y supervisores pueden ver todos los perfiles" ON user_profiles;
DROP POLICY IF EXISTS "Los admins pueden actualizar perfiles" ON user_profiles;
DROP POLICY IF EXISTS "Permitir inserción de nuevos perfiles durante registro" ON user_profiles;
DROP POLICY IF EXISTS "Users can view profiles based on role" ON user_profiles;

-- Políticas de cases
DROP POLICY IF EXISTS "Los analistas solo pueden ver sus propios casos" ON cases;
DROP POLICY IF EXISTS "Los usuarios pueden crear casos" ON cases;
DROP POLICY IF EXISTS "Los usuarios pueden actualizar casos según su rol" ON cases;
DROP POLICY IF EXISTS "Users can view cases based on role" ON cases;
DROP POLICY IF EXISTS "Allow case validation for documentation" ON cases;

-- Políticas de case_status_control
DROP POLICY IF EXISTS "Ver control de casos según rol" ON case_status_control;
DROP POLICY IF EXISTS "Crear control de casos" ON case_status_control;
DROP POLICY IF EXISTS "Actualizar control de casos según rol" ON case_status_control;

-- Políticas de case_time_entries
DROP POLICY IF EXISTS "Ver entradas de tiempo según rol" ON case_time_entries;
DROP POLICY IF EXISTS "Crear entradas de tiempo" ON case_time_entries;
DROP POLICY IF EXISTS "Actualizar entradas de tiempo según rol" ON case_time_entries;

-- Políticas de todos
DROP POLICY IF EXISTS "Ver TODOs según rol y asignación" ON todos;
DROP POLICY IF EXISTS "Usuarios activos pueden crear TODOs" ON todos;
DROP POLICY IF EXISTS "Actualizar TODOs según rol y permisos" ON todos;
DROP POLICY IF EXISTS "Solo admins pueden eliminar TODOs" ON todos;
DROP POLICY IF EXISTS "Users can view todos based on role" ON todos;

-- Políticas de todo_control
DROP POLICY IF EXISTS "Ver control TODO según rol y asignación" ON todo_control;
DROP POLICY IF EXISTS "Crear control TODO" ON todo_control;
DROP POLICY IF EXISTS "Actualizar control TODO según rol y permisos" ON todo_control;

-- Políticas de todo_time_entries
DROP POLICY IF EXISTS "Ver entradas de tiempo TODO según rol" ON todo_time_entries;
DROP POLICY IF EXISTS "Crear entradas de tiempo TODO" ON todo_time_entries;
DROP POLICY IF EXISTS "Actualizar entradas de tiempo TODO según rol" ON todo_time_entries;

-- Políticas de todo_manual_time_entries
DROP POLICY IF EXISTS "Ver entradas manuales TODO según rol" ON todo_manual_time_entries;
DROP POLICY IF EXISTS "Crear entradas manuales TODO" ON todo_manual_time_entries;
DROP POLICY IF EXISTS "Actualizar entradas manuales TODO según rol" ON todo_manual_time_entries;

-- Políticas de todo_priorities
DROP POLICY IF EXISTS "Todos pueden ver prioridades de TODO" ON todo_priorities;
DROP POLICY IF EXISTS "Solo admins pueden gestionar prioridades de TODO" ON todo_priorities;

-- Políticas de notes
DROP POLICY IF EXISTS "Ver notas según rol y permisos" ON notes;
DROP POLICY IF EXISTS "Crear notas (usuarios autenticados)" ON notes;
DROP POLICY IF EXISTS "Actualizar notas según rol y permisos" ON notes;
DROP POLICY IF EXISTS "Eliminar notas según rol y permisos" ON notes;
DROP POLICY IF EXISTS "Users can view notes based on role" ON notes;

-- Políticas de archived_cases
DROP POLICY IF EXISTS "Ver casos archivados según rol" ON archived_cases;
DROP POLICY IF EXISTS "Solo admins pueden archivar casos" ON archived_cases;
DROP POLICY IF EXISTS "Solo admins pueden restaurar casos" ON archived_cases;
DROP POLICY IF EXISTS "Solo admins pueden eliminar casos archivados" ON archived_cases;
DROP POLICY IF EXISTS "Users can view archived cases based on role" ON archived_cases;
DROP POLICY IF EXISTS "Allow archived case validation for documentation" ON archived_cases;

-- Políticas de archived_todos
DROP POLICY IF EXISTS "Ver TODOs archivados según rol" ON archived_todos;
DROP POLICY IF EXISTS "Solo admins pueden archivar TODOs" ON archived_todos;
DROP POLICY IF EXISTS "Solo admins pueden restaurar TODOs" ON archived_todos;
DROP POLICY IF EXISTS "Solo admins pueden eliminar TODOs archivados" ON archived_todos;
DROP POLICY IF EXISTS "Users can view archived todos based on role" ON archived_todos;

-- Políticas de archive_deletion_log
DROP POLICY IF EXISTS "Solo admins pueden ver log de eliminaciones" ON archive_deletion_log;
DROP POLICY IF EXISTS "Sistema puede registrar eliminaciones" ON archive_deletion_log;

-- Políticas de solution_documents
DROP POLICY IF EXISTS "allow_read_published_and_own" ON solution_documents;
DROP POLICY IF EXISTS "allow_insert_authenticated" ON solution_documents;
DROP POLICY IF EXISTS "allow_update_own_documents" ON solution_documents;
DROP POLICY IF EXISTS "allow_delete_own_documents" ON solution_documents;
DROP POLICY IF EXISTS "Users can view published documents" ON solution_documents;
DROP POLICY IF EXISTS "Users can view own documents" ON solution_documents;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON solution_documents;
DROP POLICY IF EXISTS "Enable read access for public" ON solution_documents;
DROP POLICY IF EXISTS "solution_documents_select_policy" ON solution_documents;

-- Políticas de solution_document_versions
DROP POLICY IF EXISTS "Users can view versions of accessible documents" ON solution_document_versions;
DROP POLICY IF EXISTS "System can create document versions" ON solution_document_versions;

-- Políticas de solution_feedback
DROP POLICY IF EXISTS "Users can view feedback of accessible documents" ON solution_feedback;
DROP POLICY IF EXISTS "Users can create feedback on published documents" ON solution_feedback;

-- Políticas de solution_categories
DROP POLICY IF EXISTS "Users can view solution categories" ON solution_categories;
DROP POLICY IF EXISTS "Admins can manage solution categories" ON solution_categories;

-- Políticas de document_attachments
DROP POLICY IF EXISTS "Users can view document attachments" ON document_attachments;
DROP POLICY IF EXISTS "Users can create attachments" ON document_attachments;
DROP POLICY IF EXISTS "Users can update own attachments" ON document_attachments;
DROP POLICY IF EXISTS "Users can delete own attachments" ON document_attachments;

-- Políticas de disposiciones_scripts
DROP POLICY IF EXISTS "Users can view all disposiciones_scripts" ON disposiciones_scripts;
DROP POLICY IF EXISTS "Users can create disposiciones_scripts" ON disposiciones_scripts;
DROP POLICY IF EXISTS "Users can update their own disposiciones_scripts or with permission" ON disposiciones_scripts;
DROP POLICY IF EXISTS "Users can delete their own disposiciones_scripts or with permission" ON disposiciones_scripts;

-- ================================================================
-- REACTIVAR RLS EN TODAS LAS TABLAS
-- ================================================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_status_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_manual_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE todo_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE archived_todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE archive_deletion_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE disposiciones_scripts ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - USER PROFILES
-- ================================================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Los admins y supervisores pueden ver todos los perfiles
CREATE POLICY "Los admins y supervisores pueden ver todos los perfiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role_name IN ('admin', 'supervisor')
            AND up.is_active = true
        )
    );

-- Los admins pueden actualizar perfiles
CREATE POLICY "Los admins pueden actualizar perfiles" ON user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role_name = 'admin'
            AND up.is_active = true
        )
    );

-- Permitir inserción de nuevos perfiles durante registro
CREATE POLICY "Permitir inserción de nuevos perfiles durante registro" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - CASES
-- ================================================================

-- Los analistas solo pueden ver sus propios casos
CREATE POLICY "Los analistas solo pueden ver sus propios casos" ON cases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND (
                (up.role_name = 'analista' AND cases.created_by = auth.uid()) OR
                up.role_name IN ('admin', 'supervisor')
            )
            AND up.is_active = true
        )
    );

-- Los usuarios pueden crear casos
CREATE POLICY "Los usuarios pueden crear casos" ON cases
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
    );

-- Los usuarios pueden actualizar casos según su rol
CREATE POLICY "Los usuarios pueden actualizar casos según su rol" ON cases
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND (
                (up.role_name = 'analista' AND cases.created_by = auth.uid()) OR
                up.role_name IN ('admin', 'supervisor')
            )
            AND up.is_active = true
        )
    );

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - CASE STATUS CONTROL
-- ================================================================

-- Ver control de casos según rol
CREATE POLICY "Ver control de casos según rol" ON case_status_control
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN cases c ON case_status_control.case_id = c.id
            WHERE up.id = auth.uid() 
            AND (
                (up.role_name = 'analista' AND (c.created_by = auth.uid() OR case_status_control.assigned_user_id = auth.uid())) OR
                up.role_name IN ('admin', 'supervisor')
            )
            AND up.is_active = true
        )
    );

-- Crear control de casos
CREATE POLICY "Crear control de casos" ON case_status_control
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
    );

-- Actualizar control de casos según rol
CREATE POLICY "Actualizar control de casos según rol" ON case_status_control
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN cases c ON case_status_control.case_id = c.id
            WHERE up.id = auth.uid() 
            AND (
                (up.role_name = 'analista' AND (c.created_by = auth.uid() OR case_status_control.assigned_user_id = auth.uid())) OR
                up.role_name IN ('admin', 'supervisor')
            )
            AND up.is_active = true
        )
    );

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - CASE TIME ENTRIES
-- ================================================================

-- Ver entradas de tiempo según rol
CREATE POLICY "Ver entradas de tiempo según rol" ON case_time_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN case_status_control csc ON case_time_entries.case_control_id = csc.id
            JOIN cases c ON csc.case_id = c.id
            WHERE up.id = auth.uid() 
            AND (
                (up.role_name = 'analista' AND (c.created_by = auth.uid() OR csc.assigned_user_id = auth.uid())) OR
                up.role_name IN ('admin', 'supervisor')
            )
            AND up.is_active = true
        )
    );

-- Crear entradas de tiempo
CREATE POLICY "Crear entradas de tiempo" ON case_time_entries
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
    );

-- Actualizar entradas de tiempo según rol
CREATE POLICY "Actualizar entradas de tiempo según rol" ON case_time_entries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN case_status_control csc ON case_time_entries.case_control_id = csc.id
            JOIN cases c ON csc.case_id = c.id
            WHERE up.id = auth.uid() 
            AND (
                (up.role_name = 'analista' AND (c.created_by = auth.uid() OR csc.assigned_user_id = auth.uid())) OR
                up.role_name IN ('admin', 'supervisor')
            )
            AND up.is_active = true
        )
    );

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - TODO PRIORITIES
-- ================================================================

-- Todos pueden ver las prioridades (son datos de referencia)
CREATE POLICY "Todos pueden ver prioridades de TODO" ON todo_priorities
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
    );

-- Solo admins pueden gestionar prioridades
CREATE POLICY "Solo admins pueden gestionar prioridades de TODO" ON todo_priorities
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role_name = 'admin'
            AND up.is_active = true
        )
    );

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - TODOS
-- ================================================================

-- Ver TODOs según rol
CREATE POLICY "Ver TODOs según rol y asignación" ON todos
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores ven todos
                up.role_name IN ('admin', 'supervisor') OR
                -- Analistas ven solo los asignados a ellos o creados por ellos
                (up.role_name = 'analista' AND (todos.assigned_user_id = auth.uid() OR todos.created_by_user_id = auth.uid()))
            )
        )
    );

-- Crear TODOs (usuarios activos)
CREATE POLICY "Usuarios activos pueden crear TODOs" ON todos
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
        AND created_by_user_id = auth.uid()
    );

-- Actualizar TODOs según rol
CREATE POLICY "Actualizar TODOs según rol y permisos" ON todos
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores pueden editar todos
                up.role_name IN ('admin', 'supervisor') OR
                -- Analistas pueden editar solo los asignados a ellos o creados por ellos
                (up.role_name = 'analista' AND (todos.assigned_user_id = auth.uid() OR todos.created_by_user_id = auth.uid()))
            )
        )
    );

-- Eliminar TODOs (solo admins)
CREATE POLICY "Solo admins pueden eliminar TODOs" ON todos
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role_name = 'admin'
            AND up.is_active = true
        )
    );

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - TODO CONTROL
-- ================================================================

-- Ver control TODO según rol y asignación
CREATE POLICY "Ver control TODO según rol y asignación" ON todo_control
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN todos t ON todo_control.todo_id = t.id
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores ven todos
                up.role_name IN ('admin', 'supervisor') OR
                -- Analistas ven solo los asignados a ellos o creados por ellos
                (up.role_name = 'analista' AND (t.assigned_user_id = auth.uid() OR t.created_by_user_id = auth.uid() OR todo_control.assigned_user_id = auth.uid()))
            )
        )
    );

-- Crear control TODO
CREATE POLICY "Crear control TODO" ON todo_control
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
    );

-- Actualizar control TODO según rol y permisos
CREATE POLICY "Actualizar control TODO según rol y permisos" ON todo_control
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN todos t ON todo_control.todo_id = t.id
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores pueden editar todos
                up.role_name IN ('admin', 'supervisor') OR
                -- Analistas pueden editar solo los asignados a ellos o creados por ellos
                (up.role_name = 'analista' AND (t.assigned_user_id = auth.uid() OR t.created_by_user_id = auth.uid() OR todo_control.assigned_user_id = auth.uid()))
            )
        )
    );

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - TODO TIME ENTRIES
-- ================================================================

-- Ver entradas de tiempo TODO según rol
CREATE POLICY "Ver entradas de tiempo TODO según rol" ON todo_time_entries
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN todo_control tc ON todo_time_entries.todo_control_id = tc.id
            JOIN todos t ON tc.todo_id = t.id
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores ven todos
                up.role_name IN ('admin', 'supervisor') OR
                -- Analistas ven solo los relacionados a sus TODOs
                (up.role_name = 'analista' AND (t.assigned_user_id = auth.uid() OR t.created_by_user_id = auth.uid() OR tc.assigned_user_id = auth.uid()))
            )
        )
    );

-- Crear entradas de tiempo TODO
CREATE POLICY "Crear entradas de tiempo TODO" ON todo_time_entries
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
    );

-- Actualizar entradas de tiempo TODO según rol
CREATE POLICY "Actualizar entradas de tiempo TODO según rol" ON todo_time_entries
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN todo_control tc ON todo_time_entries.todo_control_id = tc.id
            JOIN todos t ON tc.todo_id = t.id
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores pueden editar todos
                up.role_name IN ('admin', 'supervisor') OR
                -- Analistas pueden editar solo los relacionados a sus TODOs
                (up.role_name = 'analista' AND (t.assigned_user_id = auth.uid() OR t.created_by_user_id = auth.uid() OR tc.assigned_user_id = auth.uid()))
            )
        )
    );

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - TODO MANUAL TIME ENTRIES
-- ================================================================

-- Ver entradas manuales TODO según rol
CREATE POLICY "Ver entradas manuales TODO según rol" ON todo_manual_time_entries
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN todos t ON todo_manual_time_entries.todo_id = t.id
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores ven todos
                up.role_name IN ('admin', 'supervisor') OR
                -- Analistas ven solo los relacionados a sus TODOs
                (up.role_name = 'analista' AND (t.assigned_user_id = auth.uid() OR t.created_by_user_id = auth.uid()))
            )
        )
    );

-- Crear entradas manuales TODO
CREATE POLICY "Crear entradas manuales TODO" ON todo_manual_time_entries
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
    );

-- Actualizar entradas manuales TODO según rol
CREATE POLICY "Actualizar entradas manuales TODO según rol" ON todo_manual_time_entries
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN todos t ON todo_manual_time_entries.todo_id = t.id
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores pueden editar todos
                up.role_name IN ('admin', 'supervisor') OR
                -- Analistas pueden editar solo los relacionados a sus TODOs
                (up.role_name = 'analista' AND (t.assigned_user_id = auth.uid() OR t.created_by_user_id = auth.uid()))
            )
        )
    );

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - NOTES
-- ================================================================

-- Ver notas según rol y permisos
CREATE POLICY "Ver notas según rol y permisos" ON notes
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores ven todas las notas
                up.role_name IN ('admin', 'supervisor') OR
                -- Analistas ven solo sus notas o notas públicas
                (up.role_name = 'analista' AND (notes.created_by = auth.uid() OR notes.is_public = true))
            )
        )
    );

-- Crear notas (usuarios autenticados)
CREATE POLICY "Crear notas (usuarios autenticados)" ON notes
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
        AND created_by = auth.uid()
    );

-- Actualizar notas según rol y permisos
CREATE POLICY "Actualizar notas según rol y permisos" ON notes
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins pueden editar todas las notas
                up.role_name = 'admin' OR
                -- Usuarios pueden editar solo sus propias notas
                notes.created_by = auth.uid()
            )
        )
    );

-- Eliminar notas según rol y permisos
CREATE POLICY "Eliminar notas según rol y permisos" ON notes
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins pueden eliminar todas las notas
                up.role_name = 'admin' OR
                -- Usuarios pueden eliminar solo sus propias notas
                notes.created_by = auth.uid()
            )
        )
    );

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - ARCHIVED CASES
-- ================================================================

-- Ver casos archivados según rol
CREATE POLICY "Ver casos archivados según rol" ON archived_cases
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores ven todos los casos archivados
                up.role_name IN ('admin', 'supervisor') OR
                -- Analistas ven solo casos archivados que crearon originalmente
                (up.role_name = 'analista' AND archived_cases.original_created_by = auth.uid())
            )
        )
    );

-- Solo admins pueden archivar casos
CREATE POLICY "Solo admins pueden archivar casos" ON archived_cases
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role_name = 'admin'
            AND up.is_active = true
        )
    );

-- Solo admins pueden restaurar casos
CREATE POLICY "Solo admins pueden restaurar casos" ON archived_cases
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role_name = 'admin'
            AND up.is_active = true
        )
    );

-- Solo admins pueden eliminar casos archivados
CREATE POLICY "Solo admins pueden eliminar casos archivados" ON archived_cases
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role_name = 'admin'
            AND up.is_active = true
        )
    );

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - ARCHIVED TODOS
-- ================================================================

-- Ver TODOs archivados según rol
CREATE POLICY "Ver TODOs archivados según rol" ON archived_todos
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                -- Admins y supervisores ven todos los TODOs archivados
                up.role_name IN ('admin', 'supervisor') OR
                -- Analistas ven solo TODOs archivados que crearon originalmente
                (up.role_name = 'analista' AND archived_todos.original_created_by_user_id = auth.uid())
            )
        )
    );

-- Solo admins pueden archivar TODOs
CREATE POLICY "Solo admins pueden archivar TODOs" ON archived_todos
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role_name = 'admin'
            AND up.is_active = true
        )
    );

-- Solo admins pueden restaurar TODOs
CREATE POLICY "Solo admins pueden restaurar TODOs" ON archived_todos
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role_name = 'admin'
            AND up.is_active = true
        )
    );

-- Solo admins pueden eliminar TODOs archivados
CREATE POLICY "Solo admins pueden eliminar TODOs archivados" ON archived_todos
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role_name = 'admin'
            AND up.is_active = true
        )
    );

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - ARCHIVE DELETION LOG
-- ================================================================

-- Solo admins pueden ver log de eliminaciones
CREATE POLICY "Solo admins pueden ver log de eliminaciones" ON archive_deletion_log
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role_name = 'admin'
            AND up.is_active = true
        )
    );

-- Sistema puede registrar eliminaciones
CREATE POLICY "Sistema puede registrar eliminaciones" ON archive_deletion_log
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
    );

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - SOLUTION DOCUMENTS
-- ================================================================

-- Permitir leer documentos publicados o propios
CREATE POLICY "Permitir leer documentos publicados o propios" ON solution_documents
    FOR SELECT 
    USING (
        is_published = true 
        OR created_by = auth.uid()
    );

-- Permitir a usuarios autenticados crear documentos
CREATE POLICY "Permitir crear documentos autenticados" ON solution_documents
    FOR INSERT 
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND created_by = auth.uid()
    );

-- Permitir actualizar solo documentos propios
CREATE POLICY "Permitir actualizar documentos propios" ON solution_documents
    FOR UPDATE 
    USING (created_by = auth.uid())
    WITH CHECK (created_by = auth.uid());

-- Permitir eliminar solo documentos propios
CREATE POLICY "Permitir eliminar documentos propios" ON solution_documents
    FOR DELETE 
    USING (created_by = auth.uid());

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - SOLUTION DOCUMENT VERSIONS
-- ================================================================

-- Ver versiones de documentos accesibles
CREATE POLICY "Ver versiones de documentos accesibles" ON solution_document_versions
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM solution_documents sd 
            WHERE sd.id = solution_document_versions.document_id 
            AND (sd.is_published = true OR sd.created_by = auth.uid())
        )
    );

-- Sistema puede crear versiones de documentos
CREATE POLICY "Sistema puede crear versiones de documentos" ON solution_document_versions
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM solution_documents sd 
            WHERE sd.id = solution_document_versions.document_id 
            AND sd.created_by = auth.uid()
        )
    );

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - SOLUTION FEEDBACK
-- ================================================================

-- Ver feedback de documentos accesibles
CREATE POLICY "Ver feedback de documentos accesibles" ON solution_feedback
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM solution_documents sd 
            WHERE sd.id = solution_feedback.document_id 
            AND (sd.is_published = true OR sd.created_by = auth.uid())
        )
    );

-- Crear feedback en documentos publicados
CREATE POLICY "Crear feedback en documentos publicados" ON solution_feedback
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM solution_documents sd 
            WHERE sd.id = solution_feedback.document_id 
            AND sd.is_published = true
        )
        AND created_by = auth.uid()
    );

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - SOLUTION CATEGORIES
-- ================================================================

-- Ver categorías de soluciones
CREATE POLICY "Ver categorías de soluciones" ON solution_categories
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
    );

-- Admins pueden gestionar categorías
CREATE POLICY "Admins pueden gestionar categorías" ON solution_categories
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role_name = 'admin'
            AND up.is_active = true
        )
    );

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - DOCUMENT ATTACHMENTS
-- ================================================================

-- Ver adjuntos de documentos
CREATE POLICY "Ver adjuntos de documentos" ON document_attachments
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM solution_documents sd 
            WHERE sd.id = document_attachments.document_id 
            AND (sd.is_published = true OR sd.created_by = auth.uid())
        )
    );

-- Crear adjuntos
CREATE POLICY "Crear adjuntos" ON document_attachments
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM solution_documents sd 
            WHERE sd.id = document_attachments.document_id 
            AND sd.created_by = auth.uid()
        )
        AND uploaded_by = auth.uid()
    );

-- Actualizar propios adjuntos
CREATE POLICY "Actualizar propios adjuntos" ON document_attachments
    FOR UPDATE 
    USING (uploaded_by = auth.uid())
    WITH CHECK (uploaded_by = auth.uid());

-- Eliminar propios adjuntos
CREATE POLICY "Eliminar propios adjuntos" ON document_attachments
    FOR DELETE 
    USING (uploaded_by = auth.uid());

-- ================================================================
-- POLÍTICAS RLS ORIGINALES - DISPOSICIONES SCRIPTS
-- ================================================================

-- Ver todas las disposiciones scripts
CREATE POLICY "Ver todas las disposiciones scripts" ON disposiciones_scripts
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
    );

-- Crear disposiciones scripts
CREATE POLICY "Crear disposiciones scripts" ON disposiciones_scripts
    FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
        AND created_by_user_id = auth.uid()
    );

-- Actualizar propias disposiciones scripts o con permisos
CREATE POLICY "Actualizar propias disposiciones scripts o con permisos" ON disposiciones_scripts
    FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                up.role_name IN ('admin', 'supervisor') OR
                disposiciones_scripts.created_by_user_id = auth.uid()
            )
        )
    );

-- Eliminar propias disposiciones scripts o con permisos
CREATE POLICY "Eliminar propias disposiciones scripts o con permisos" ON disposiciones_scripts
    FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
            AND (
                up.role_name IN ('admin', 'supervisor') OR
                disposiciones_scripts.created_by_user_id = auth.uid()
            )
        )
    );

-- ================================================================
-- OTORGAR PERMISOS BÁSICOS
-- ================================================================

-- Permisos para tablas principales
GRANT SELECT ON user_profiles TO authenticated;
GRANT SELECT ON cases TO authenticated;
GRANT SELECT ON case_status_control TO authenticated;
GRANT SELECT ON case_time_entries TO authenticated;
GRANT SELECT ON todos TO authenticated;
GRANT SELECT ON todo_control TO authenticated;
GRANT SELECT ON todo_time_entries TO authenticated;
GRANT SELECT ON todo_manual_time_entries TO authenticated;
GRANT SELECT ON todo_priorities TO authenticated;
GRANT SELECT ON notes TO authenticated;
GRANT SELECT ON archived_cases TO authenticated;
GRANT SELECT ON archived_todos TO authenticated;
GRANT SELECT ON archive_deletion_log TO authenticated;
GRANT SELECT ON solution_documents TO authenticated;
GRANT SELECT ON solution_document_versions TO authenticated;
GRANT SELECT ON solution_feedback TO authenticated;
GRANT SELECT ON solution_categories TO authenticated;
GRANT SELECT ON document_attachments TO authenticated;
GRANT SELECT ON disposiciones_scripts TO authenticated;

-- Permisos de inserción
GRANT INSERT ON user_profiles TO authenticated;
GRANT INSERT ON cases TO authenticated;
GRANT INSERT ON case_status_control TO authenticated;
GRANT INSERT ON case_time_entries TO authenticated;
GRANT INSERT ON todos TO authenticated;
GRANT INSERT ON todo_control TO authenticated;
GRANT INSERT ON todo_time_entries TO authenticated;
GRANT INSERT ON todo_manual_time_entries TO authenticated;
GRANT INSERT ON notes TO authenticated;
GRANT INSERT ON solution_documents TO authenticated;
GRANT INSERT ON solution_feedback TO authenticated;
GRANT INSERT ON document_attachments TO authenticated;
GRANT INSERT ON disposiciones_scripts TO authenticated;

-- Permisos de actualización
GRANT UPDATE ON user_profiles TO authenticated;
GRANT UPDATE ON cases TO authenticated;
GRANT UPDATE ON case_status_control TO authenticated;
GRANT UPDATE ON case_time_entries TO authenticated;
GRANT UPDATE ON todos TO authenticated;
GRANT UPDATE ON todo_control TO authenticated;
GRANT UPDATE ON todo_time_entries TO authenticated;
GRANT UPDATE ON todo_manual_time_entries TO authenticated;
GRANT UPDATE ON notes TO authenticated;
GRANT UPDATE ON solution_documents TO authenticated;
GRANT UPDATE ON document_attachments TO authenticated;
GRANT UPDATE ON disposiciones_scripts TO authenticated;

-- Permisos de eliminación
GRANT DELETE ON todos TO authenticated;
GRANT DELETE ON notes TO authenticated;
GRANT DELETE ON solution_documents TO authenticated;
GRANT DELETE ON document_attachments TO authenticated;
GRANT DELETE ON disposiciones_scripts TO authenticated;

-- ================================================================
-- VERIFICACIÓN FINAL
-- ================================================================

-- Mostrar resumen de políticas creadas
SELECT 
    schemaname,
    tablename,
    COUNT(*) as politicas_activas
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY tablename;

-- ================================================================
-- FIN DEL SCRIPT DE RESTAURACIÓN
-- ================================================================
-- El sistema de permisos RLS original ha sido restaurado
-- Todas las políticas complejas y roles adicionales han sido eliminados
-- Se han restaurado las políticas básicas de:
-- - admin: Acceso completo
-- - supervisor: Ver todo, modificar asignaciones
-- - analista: Ver/modificar solo registros propios o asignados
-- ================================================================
