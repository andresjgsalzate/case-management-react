-- Script simplificado para corregir políticas DELETE de TODOs

-- 1. Ver políticas actuales de DELETE para todos
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'todos' 
AND cmd = 'DELETE';

-- 2. Si hay políticas problemáticas, eliminarlas primero:
-- DROP POLICY IF EXISTS "nombre_de_la_politica" ON todos;

-- 3. Crear nueva política mejorada para DELETE
-- Esta política permite eliminar TODOs si:
-- - El usuario es admin, O
-- - El usuario creó el TODO, O  
-- - El TODO está asignado al usuario Y tiene permiso delete_todos

/*
CREATE POLICY "delete_own_todos_policy" ON todos
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM user_profiles up
    LEFT JOIN user_role_permissions urp ON up.role_id = urp.role_id
    LEFT JOIN permissions p ON urp.permission_id = p.id
    WHERE up.user_id = auth.uid()
    AND (
      -- Admin puede eliminar cualquier TODO
      up.role = 'admin'
      OR
      -- Usuario que creó el TODO puede eliminarlo
      todos.created_by = auth.uid()
      OR
      -- Usuario asignado con permiso delete_todos puede eliminarlo
      (todos.assigned_user_id = up.id AND p.name = 'delete_todos')
      OR
      -- Usuario con permiso manage_todos puede eliminar cualquier TODO
      p.name = 'manage_todos'
    )
  )
);
*/
