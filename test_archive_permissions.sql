-- Test para verificar que las políticas RLS del archivo funcionan correctamente
-- Este script debe ejecutarse para probar que:
-- 1. Admin y supervisor ven todos los elementos archivados
-- 2. Analistas solo ven elementos archivados por ellos o asignados a ellos

-- Verificar que RLS está habilitado en las tablas de archivo
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('archived_cases', 'archived_todos', 'archive_deletion_log')
AND schemaname = 'public';

-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename IN ('archived_cases', 'archived_todos', 'archive_deletion_log')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- Test de acceso para diferentes roles (estos queries deben ejecutarse autenticado como cada rol)

-- Como Admin - debe ver todos los elementos
SELECT 'admin_test' as test_type, 
       COUNT(*) as archived_cases_count
FROM archived_cases;

SELECT 'admin_test' as test_type,
       COUNT(*) as archived_todos_count  
FROM archived_todos;

-- Como Supervisor - debe ver todos los elementos
-- (mismo query que admin)

-- Como Analista - debe ver solo elementos propios
-- Este query debe ejecutarse autenticado como analista específico
SELECT 'analista_test' as test_type,
       COUNT(*) as my_archived_cases_count
FROM archived_cases 
WHERE archived_by = auth.uid() OR assigned_user_id = auth.uid();

SELECT 'analista_test' as test_type,
       COUNT(*) as my_archived_todos_count
FROM archived_todos
WHERE archived_by = auth.uid() OR assigned_user_id = auth.uid();

-- Verificar que las vistas de estadísticas funcionan
SELECT * FROM archive_stats LIMIT 1;
