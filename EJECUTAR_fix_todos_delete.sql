-- SOLUCIÓN: Corregir política DELETE de TODOs
-- El problema es que solo los admins pueden eliminar TODOs
-- Necesitamos permitir que usuarios eliminen sus propios TODOs

-- 1. ELIMINAR la política restrictiva actual
DROP POLICY "Solo admins pueden eliminar TODOs" ON todos;

-- 2. CREAR nueva política que permite:
-- - Admins pueden eliminar cualquier TODO
-- - Usuarios pueden eliminar TODOs que crearon
-- - Usuarios pueden eliminar TODOs asignados a ellos (si tienen permiso delete_todos)
CREATE POLICY "Eliminar TODOs propios y asignados" ON todos
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 
    FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    LEFT JOIN role_permissions rp ON up.role_id = rp.role_id
    LEFT JOIN permissions p ON rp.permission_id = p.id
    WHERE up.id = auth.uid()
    AND up.is_active = true
    AND (
      -- Admins pueden eliminar cualquier TODO
      r.name = 'admin'
      OR
      -- Usuario que creó el TODO puede eliminarlo
      todos.created_by_user_id = up.id
      OR
      -- Usuario asignado con permiso delete_todos puede eliminarlo  
      (todos.assigned_user_id = up.id AND p.name = 'delete_todos')
      OR
      -- Usuario con permiso manage_todos puede eliminar cualquier TODO
      p.name = 'manage_todos'
    )
  )
);

-- 3. VERIFICAR que la nueva política se creó correctamente
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies 
WHERE tablename = 'todos' 
  AND cmd = 'DELETE';
