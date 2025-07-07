-- Verificar y corregir políticas RLS para TODOs
-- Especialmente para la operación DELETE

-- Verificar políticas existentes
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'todos'
ORDER BY cmd, policyname;

-- Verificar si RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    forcerowsecurity
FROM pg_tables 
WHERE tablename = 'todos';

-- Verificar permisos de roles para la tabla todos
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'todos' 
AND table_schema = 'public';

-- Verificar las políticas DELETE específicamente
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'todos' 
AND cmd = 'DELETE';
