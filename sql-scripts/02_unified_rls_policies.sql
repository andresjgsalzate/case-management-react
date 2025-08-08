-- =========================================
-- SCRIPT UNIFICADO: POLÍTICAS RLS (ROW LEVEL SECURITY)
-- Sistema de Gestión de Casos - Case Management
-- Fecha: 2025-08-08
-- Versión: 3.0 Unificado
-- =========================================

-- DESCRIPCIÓN:
-- Este script contiene TODAS las políticas de seguridad a nivel de fila (RLS)
-- para controlar el acceso granular a los datos del sistema.
-- 
-- PRERREQUISITOS:
-- - Las tablas del esquema base deben existir
-- - Los permisos y roles deben estar configurados (01_unified_permissions.sql)
-- - Las funciones de soporte deben existir (03_unified_functions_procedures.sql)
--
-- IMPORTANTE:
-- Las políticas RLS están DESHABILITADAS por defecto para facilitar el desarrollo.
-- Para habilitar RLS en producción, descomenta las líneas "ALTER TABLE ... ENABLE ROW LEVEL SECURITY;"

-- =========================================
-- 1. HABILITAR RLS EN TABLAS PRINCIPALES
-- =========================================

-- NOTA: Comentado por defecto - descomenta para habilitar RLS en producción
-- ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE todo_time_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE todo_manual_time_entries ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE case_control ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE todo_control ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE disposiciones ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- =========================================
-- 2. POLÍTICAS RLS PARA CASOS (CASES)
-- =========================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "cases_select_granular" ON cases;
DROP POLICY IF EXISTS "cases_insert_granular" ON cases;
DROP POLICY IF EXISTS "cases_update_granular" ON cases;
DROP POLICY IF EXISTS "cases_delete_granular" ON cases;

-- Política de selección de casos (granular)
CREATE POLICY "cases_select_granular" ON cases
    FOR SELECT USING (
        CASE 
            WHEN has_permission(auth.uid(), 'cases.read_all') THEN true
            WHEN has_permission(auth.uid(), 'cases.read_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'cases.read_own') THEN 
                (created_by = auth.uid() OR assigned_user_id = auth.uid())
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
            WHEN has_permission(auth.uid(), 'cases.update_own') THEN 
                (created_by = auth.uid() OR assigned_user_id = auth.uid())
            ELSE false
        END
    );

-- Política de eliminación de casos (granular)
CREATE POLICY "cases_delete_granular" ON cases
    FOR DELETE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'cases.delete_all') THEN true
            WHEN has_permission(auth.uid(), 'cases.delete_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'cases.delete_own') THEN created_by = auth.uid()
            ELSE false
        END
    );

-- =========================================
-- 3. POLÍTICAS RLS PARA TODOS
-- =========================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "todos_select_granular" ON todos;
DROP POLICY IF EXISTS "todos_insert_granular" ON todos;
DROP POLICY IF EXISTS "todos_update_granular" ON todos;
DROP POLICY IF EXISTS "todos_delete_granular" ON todos;

-- Política de selección de TODOs (granular)
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

-- =========================================
-- 4. POLÍTICAS RLS PARA TIME_ENTRIES
-- =========================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "time_entries_select_granular" ON time_entries;
DROP POLICY IF EXISTS "time_entries_insert_granular" ON time_entries;
DROP POLICY IF EXISTS "time_entries_update_granular" ON time_entries;
DROP POLICY IF EXISTS "time_entries_delete_granular" ON time_entries;

-- Política de selección de time_entries (granular)
CREATE POLICY "time_entries_select_granular" ON time_entries
    FOR SELECT USING (
        CASE 
            WHEN has_permission(auth.uid(), 'time_entries.read_all') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.read_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'time_entries.read_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de inserción de time_entries (granular)
CREATE POLICY "time_entries_insert_granular" ON time_entries
    FOR INSERT WITH CHECK (
        CASE 
            WHEN has_permission(auth.uid(), 'time_entries.create_all') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.create_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'time_entries.create_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de actualización de time_entries (granular)
CREATE POLICY "time_entries_update_granular" ON time_entries
    FOR UPDATE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'time_entries.update_all') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.update_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'time_entries.update_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de eliminación de time_entries (granular)
CREATE POLICY "time_entries_delete_granular" ON time_entries
    FOR DELETE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'time_entries.delete_all') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.delete_team') THEN true -- TODO: implementar lógica de equipo
            WHEN has_permission(auth.uid(), 'time_entries.delete_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- =========================================
-- 5. POLÍTICAS RLS PARA TODO_TIME_ENTRIES
-- =========================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "todo_time_entries_select_granular" ON todo_time_entries;
DROP POLICY IF EXISTS "todo_time_entries_insert_granular" ON todo_time_entries;
DROP POLICY IF EXISTS "todo_time_entries_update_granular" ON todo_time_entries;
DROP POLICY IF EXISTS "todo_time_entries_delete_granular" ON todo_time_entries;

-- Política de selección (granular)
CREATE POLICY "todo_time_entries_select_granular" ON todo_time_entries
    FOR SELECT USING (
        CASE 
            WHEN has_permission(auth.uid(), 'time_entries.read_all') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.read_team') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.read_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de inserción (granular)
CREATE POLICY "todo_time_entries_insert_granular" ON todo_time_entries
    FOR INSERT WITH CHECK (
        CASE 
            WHEN has_permission(auth.uid(), 'time_entries.create_all') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.create_team') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.create_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de actualización (granular)
CREATE POLICY "todo_time_entries_update_granular" ON todo_time_entries
    FOR UPDATE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'time_entries.update_all') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.update_team') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.update_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de eliminación (granular)
CREATE POLICY "todo_time_entries_delete_granular" ON todo_time_entries
    FOR DELETE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'time_entries.delete_all') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.delete_team') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.delete_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- =========================================
-- 6. POLÍTICAS RLS PARA TODO_MANUAL_TIME_ENTRIES
-- =========================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "todo_manual_time_entries_select_granular" ON todo_manual_time_entries;
DROP POLICY IF EXISTS "todo_manual_time_entries_insert_granular" ON todo_manual_time_entries;
DROP POLICY IF EXISTS "todo_manual_time_entries_update_granular" ON todo_manual_time_entries;
DROP POLICY IF EXISTS "todo_manual_time_entries_delete_granular" ON todo_manual_time_entries;

-- Política de selección (granular)
CREATE POLICY "todo_manual_time_entries_select_granular" ON todo_manual_time_entries
    FOR SELECT USING (
        CASE 
            WHEN has_permission(auth.uid(), 'time_entries.read_all') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.read_team') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.read_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de inserción (granular)
CREATE POLICY "todo_manual_time_entries_insert_granular" ON todo_manual_time_entries
    FOR INSERT WITH CHECK (
        CASE 
            WHEN has_permission(auth.uid(), 'time_entries.create_all') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.create_team') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.create_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de actualización (granular)
CREATE POLICY "todo_manual_time_entries_update_granular" ON todo_manual_time_entries
    FOR UPDATE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'time_entries.update_all') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.update_team') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.update_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de eliminación (granular)
CREATE POLICY "todo_manual_time_entries_delete_granular" ON todo_manual_time_entries
    FOR DELETE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'time_entries.delete_all') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.delete_team') THEN true
            WHEN has_permission(auth.uid(), 'time_entries.delete_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- =========================================
-- 7. POLÍTICAS RLS PARA CASE_CONTROL
-- =========================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "case_control_select_granular" ON case_control;
DROP POLICY IF EXISTS "case_control_insert_granular" ON case_control;
DROP POLICY IF EXISTS "case_control_update_granular" ON case_control;
DROP POLICY IF EXISTS "case_control_delete_granular" ON case_control;

-- Política de selección (granular)
CREATE POLICY "case_control_select_granular" ON case_control
    FOR SELECT USING (
        CASE 
            WHEN has_permission(auth.uid(), 'cases.read_all') THEN true
            WHEN has_permission(auth.uid(), 'cases.read_team') THEN true
            WHEN has_permission(auth.uid(), 'cases.read_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de inserción (granular)
CREATE POLICY "case_control_insert_granular" ON case_control
    FOR INSERT WITH CHECK (
        CASE 
            WHEN has_permission(auth.uid(), 'cases.create_all') THEN true
            WHEN has_permission(auth.uid(), 'cases.create_team') THEN true
            WHEN has_permission(auth.uid(), 'cases.create_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de actualización (granular)
CREATE POLICY "case_control_update_granular" ON case_control
    FOR UPDATE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'cases.update_all') THEN true
            WHEN has_permission(auth.uid(), 'cases.update_team') THEN true
            WHEN has_permission(auth.uid(), 'cases.update_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de eliminación (granular)
CREATE POLICY "case_control_delete_granular" ON case_control
    FOR DELETE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'cases.delete_all') THEN true
            WHEN has_permission(auth.uid(), 'cases.delete_team') THEN true
            WHEN has_permission(auth.uid(), 'cases.delete_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- =========================================
-- 8. POLÍTICAS RLS PARA TODO_CONTROL
-- =========================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "todo_control_select_granular" ON todo_control;
DROP POLICY IF EXISTS "todo_control_insert_granular" ON todo_control;
DROP POLICY IF EXISTS "todo_control_update_granular" ON todo_control;
DROP POLICY IF EXISTS "todo_control_delete_granular" ON todo_control;

-- Política de selección (granular)
CREATE POLICY "todo_control_select_granular" ON todo_control
    FOR SELECT USING (
        CASE 
            WHEN has_permission(auth.uid(), 'todos.read_all') THEN true
            WHEN has_permission(auth.uid(), 'todos.read_team') THEN true
            WHEN has_permission(auth.uid(), 'todos.read_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de inserción (granular)
CREATE POLICY "todo_control_insert_granular" ON todo_control
    FOR INSERT WITH CHECK (
        CASE 
            WHEN has_permission(auth.uid(), 'todos.create_all') THEN true
            WHEN has_permission(auth.uid(), 'todos.create_team') THEN true
            WHEN has_permission(auth.uid(), 'todos.create_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de actualización (granular)
CREATE POLICY "todo_control_update_granular" ON todo_control
    FOR UPDATE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'todos.update_all') THEN true
            WHEN has_permission(auth.uid(), 'todos.update_team') THEN true
            WHEN has_permission(auth.uid(), 'todos.update_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- Política de eliminación (granular)
CREATE POLICY "todo_control_delete_granular" ON todo_control
    FOR DELETE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'todos.delete_all') THEN true
            WHEN has_permission(auth.uid(), 'todos.delete_team') THEN true
            WHEN has_permission(auth.uid(), 'todos.delete_own') THEN user_id = auth.uid()
            ELSE false
        END
    );

-- =========================================
-- 9. POLÍTICAS RLS PARA DISPOSICIONES
-- =========================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "disposiciones_select_granular" ON disposiciones;
DROP POLICY IF EXISTS "disposiciones_insert_granular" ON disposiciones;
DROP POLICY IF EXISTS "disposiciones_update_granular" ON disposiciones;
DROP POLICY IF EXISTS "disposiciones_delete_granular" ON disposiciones;

-- Política de selección (granular)
CREATE POLICY "disposiciones_select_granular" ON disposiciones
    FOR SELECT USING (
        CASE 
            WHEN has_permission(auth.uid(), 'disposiciones.read_all') THEN true
            WHEN has_permission(auth.uid(), 'disposiciones.read_team') THEN true
            WHEN has_permission(auth.uid(), 'disposiciones.read_own') THEN created_by = auth.uid()
            ELSE false
        END
    );

-- Política de inserción (granular)
CREATE POLICY "disposiciones_insert_granular" ON disposiciones
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'disposiciones.create_own') OR
        has_permission(auth.uid(), 'disposiciones.create_team') OR
        has_permission(auth.uid(), 'disposiciones.create_all')
    );

-- Política de actualización (granular)
CREATE POLICY "disposiciones_update_granular" ON disposiciones
    FOR UPDATE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'disposiciones.update_all') THEN true
            WHEN has_permission(auth.uid(), 'disposiciones.update_team') THEN true
            WHEN has_permission(auth.uid(), 'disposiciones.update_own') THEN created_by = auth.uid()
            ELSE false
        END
    );

-- Política de eliminación (granular)
CREATE POLICY "disposiciones_delete_granular" ON disposiciones
    FOR DELETE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'disposiciones.delete_all') THEN true
            WHEN has_permission(auth.uid(), 'disposiciones.delete_team') THEN true
            WHEN has_permission(auth.uid(), 'disposiciones.delete_own') THEN created_by = auth.uid()
            ELSE false
        END
    );

-- =========================================
-- 10. POLÍTICAS RLS PARA NOTES
-- =========================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "notes_select_granular" ON notes;
DROP POLICY IF EXISTS "notes_insert_granular" ON notes;
DROP POLICY IF EXISTS "notes_update_granular" ON notes;
DROP POLICY IF EXISTS "notes_delete_granular" ON notes;

-- Política de selección (granular)
CREATE POLICY "notes_select_granular" ON notes
    FOR SELECT USING (
        CASE 
            WHEN has_permission(auth.uid(), 'notes.read_all') THEN true
            WHEN has_permission(auth.uid(), 'notes.read_team') THEN true
            WHEN has_permission(auth.uid(), 'notes.read_own') THEN created_by = auth.uid()
            ELSE false
        END
    );

-- Política de inserción (granular)
CREATE POLICY "notes_insert_granular" ON notes
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'notes.create_own') OR
        has_permission(auth.uid(), 'notes.create_team') OR
        has_permission(auth.uid(), 'notes.create_all')
    );

-- Política de actualización (granular)
CREATE POLICY "notes_update_granular" ON notes
    FOR UPDATE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'notes.update_all') THEN true
            WHEN has_permission(auth.uid(), 'notes.update_team') THEN true
            WHEN has_permission(auth.uid(), 'notes.update_own') THEN created_by = auth.uid()
            ELSE false
        END
    );

-- Política de eliminación (granular)
CREATE POLICY "notes_delete_granular" ON notes
    FOR DELETE USING (
        CASE 
            WHEN has_permission(auth.uid(), 'notes.delete_all') THEN true
            WHEN has_permission(auth.uid(), 'notes.delete_team') THEN true
            WHEN has_permission(auth.uid(), 'notes.delete_own') THEN created_by = auth.uid()
            ELSE false
        END
    );

-- =========================================
-- 11. POLÍTICAS RLS PARA PASSWORD_RESET_TOKENS
-- =========================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "password_reset_tokens_select_policy" ON password_reset_tokens;
DROP POLICY IF EXISTS "password_reset_tokens_insert_policy" ON password_reset_tokens;
DROP POLICY IF EXISTS "password_reset_tokens_update_policy" ON password_reset_tokens;
DROP POLICY IF EXISTS "password_reset_tokens_delete_policy" ON password_reset_tokens;

-- Solo permitir ver los propios tokens
CREATE POLICY "password_reset_tokens_select_policy" ON password_reset_tokens
    FOR SELECT USING (user_id = auth.uid());

-- Solo permitir insertar tokens propios
CREATE POLICY "password_reset_tokens_insert_policy" ON password_reset_tokens
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Solo permitir actualizar tokens propios
CREATE POLICY "password_reset_tokens_update_policy" ON password_reset_tokens
    FOR UPDATE USING (user_id = auth.uid());

-- Solo permitir eliminar tokens propios
CREATE POLICY "password_reset_tokens_delete_policy" ON password_reset_tokens
    FOR DELETE USING (user_id = auth.uid());

-- =========================================
-- 12. POLÍTICAS RLS PARA EMAIL_LOGS
-- =========================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "email_logs_select_policy" ON email_logs;
DROP POLICY IF EXISTS "email_logs_insert_policy" ON email_logs;
DROP POLICY IF EXISTS "email_logs_update_policy" ON email_logs;

-- Solo usuarios con permisos pueden ver logs de email
CREATE POLICY "email_logs_select_policy" ON email_logs
    FOR SELECT USING (
        has_permission(auth.uid(), 'emails.read_logs') OR
        has_permission(auth.uid(), 'emails.configure')
    );

-- Solo el sistema puede insertar logs (via funciones)
CREATE POLICY "email_logs_insert_policy" ON email_logs
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'emails.send_own') OR
        has_permission(auth.uid(), 'emails.send_team') OR
        has_permission(auth.uid(), 'emails.send_all')
    );

-- Solo administradores pueden actualizar logs
CREATE POLICY "email_logs_update_policy" ON email_logs
    FOR UPDATE USING (
        has_permission(auth.uid(), 'emails.configure')
    );

-- =========================================
-- 13. POLÍTICAS RLS PARA SYSTEM_CONFIGURATIONS
-- =========================================

-- Limpiar políticas existentes
DROP POLICY IF EXISTS "system_configurations_select_policy" ON system_configurations;
DROP POLICY IF EXISTS "system_configurations_insert_policy" ON system_configurations;
DROP POLICY IF EXISTS "system_configurations_update_policy" ON system_configurations;
DROP POLICY IF EXISTS "system_configurations_delete_policy" ON system_configurations;

-- Solo administradores pueden ver configuraciones del sistema
CREATE POLICY "system_configurations_select_policy" ON system_configurations
    FOR SELECT USING (
        has_permission(auth.uid(), 'system.read_configs')
    );

-- Solo administradores pueden crear configuraciones
CREATE POLICY "system_configurations_insert_policy" ON system_configurations
    FOR INSERT WITH CHECK (
        has_permission(auth.uid(), 'system.update_configs')
    );

-- Solo administradores pueden actualizar configuraciones
CREATE POLICY "system_configurations_update_policy" ON system_configurations
    FOR UPDATE USING (
        has_permission(auth.uid(), 'system.update_configs')
    );

-- Solo administradores pueden eliminar configuraciones
CREATE POLICY "system_configurations_delete_policy" ON system_configurations
    FOR DELETE USING (
        has_permission(auth.uid(), 'system.update_configs')
    );

-- =========================================
-- 14. POLÍTICAS RLS PARA STORAGE (ARCHIVOS)
-- =========================================

-- Política para permitir subir archivos
CREATE POLICY "storage_upload_policy" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'case-files' AND
        (
            has_permission(auth.uid(), 'file_storage.upload_own') OR
            has_permission(auth.uid(), 'file_storage.upload_team') OR
            has_permission(auth.uid(), 'file_storage.upload_all')
        )
    );

-- Política para permitir ver archivos
CREATE POLICY "storage_select_policy" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'case-files' AND
        (
            has_permission(auth.uid(), 'file_storage.download_own') OR
            has_permission(auth.uid(), 'file_storage.download_team') OR
            has_permission(auth.uid(), 'file_storage.download_all')
        )
    );

-- Política para permitir actualizar archivos
CREATE POLICY "storage_update_policy" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'case-files' AND
        (
            has_permission(auth.uid(), 'file_storage.upload_own') OR
            has_permission(auth.uid(), 'file_storage.upload_team') OR
            has_permission(auth.uid(), 'file_storage.upload_all')
        )
    );

-- Política para permitir eliminar archivos
CREATE POLICY "storage_delete_policy" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'case-files' AND
        (
            has_permission(auth.uid(), 'file_storage.delete_own') OR
            has_permission(auth.uid(), 'file_storage.delete_team') OR
            has_permission(auth.uid(), 'file_storage.delete_all')
        )
    );

-- =========================================
-- 15. CONFIGURACIÓN DE BUCKETS DE STORAGE
-- =========================================

-- Crear bucket para archivos de casos si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'case-files',
    'case-files',
    false,
    52428800, -- 50MB
    ARRAY[
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'text/plain', 'text/csv',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip', 'application/x-rar-compressed'
    ]
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =========================================
-- SCRIPT COMPLETADO EXITOSAMENTE
-- =========================================

-- Mensaje de confirmación
DO $$
DECLARE
    total_policies INTEGER;
BEGIN
    -- Contar políticas creadas
    SELECT COUNT(*) INTO total_policies
    FROM pg_policies 
    WHERE schemaname = 'public';
    
    RAISE NOTICE '✅ POLÍTICAS RLS CONFIGURADAS EXITOSAMENTE';
    RAISE NOTICE '🔒 Total de políticas creadas: %', total_policies;
    RAISE NOTICE '📦 Bucket de storage configurado: case-files';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANTE: Las políticas RLS están DESHABILITADAS por defecto';
    RAISE NOTICE '🔧 Para habilitar RLS en producción, ejecuta:';
    RAISE NOTICE '   ALTER TABLE [tabla] ENABLE ROW LEVEL SECURITY;';
    RAISE NOTICE '';
    RAISE NOTICE '🚀 Las políticas están listas para usar cuando se habilite RLS';
END $$;
