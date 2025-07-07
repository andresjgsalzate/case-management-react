-- Corrección de políticas RLS para TODOs
-- Permitir que usuarios eliminen sus propios TODOs y TODOs asignados a ellos

-- Eliminar políticas existentes de DELETE (si existen)
DROP POLICY IF EXISTS "Users can delete assigned todos" ON todos;
DROP POLICY IF EXISTS "Users can delete own todos" ON todos;
DROP POLICY IF EXISTS "delete_todos_policy" ON todos;

-- Crear nueva política de DELETE para TODOs
-- Permitir DELETE si:
-- 1. El usuario es administrador (role = 'admin')
-- 2. El usuario creó el TODO (created_by = auth.uid())
-- 3. El TODO está asignado al usuario (assigned_user_id = get_user_profile_id())
-- 4. El usuario tiene el permiso delete_todos

CREATE POLICY "Enhanced delete todos policy" ON todos
FOR DELETE 
TO authenticated 
USING (
  -- Verificar si el usuario tiene permisos
  EXISTS (
    SELECT 1 
    FROM user_profiles up
    JOIN user_role_permissions urp ON up.role_id = urp.role_id
    JOIN permissions p ON urp.permission_id = p.id
    WHERE up.user_id = auth.uid()
    AND (
      -- Admin puede eliminar cualquier TODO
      up.role = 'admin'
      OR
      -- Usuario con permiso delete_todos puede eliminar sus propios TODOs
      (p.name = 'delete_todos' AND (
        todos.created_by = auth.uid() 
        OR 
        todos.assigned_user_id = up.id
      ))
      OR
      -- Usuario con permiso manage_todos puede eliminar cualquier TODO
      p.name = 'manage_todos'
    )
  )
);

-- Verificar que la política fue creada correctamente
SELECT 
    policyname,
    cmd,
    permissive,
    qual
FROM pg_policies 
WHERE tablename = 'todos' 
AND cmd = 'DELETE';

-- Test query para verificar qué TODOs puede eliminar un usuario específico
-- (Ejecutar después de conectarse como un analista)
/*
SELECT 
    t.id,
    t.title,
    t.created_by,
    t.assigned_user_id,
    up.user_id as current_user,
    up.role as current_role
FROM todos t, user_profiles up
WHERE up.user_id = auth.uid()
AND (
    EXISTS (
        SELECT 1 
        FROM user_profiles up2
        JOIN user_role_permissions urp ON up2.role_id = urp.role_id
        JOIN permissions p ON urp.permission_id = p.id
        WHERE up2.user_id = auth.uid()
        AND (
            up2.role = 'admin'
            OR
            (p.name = 'delete_todos' AND (
                t.created_by = auth.uid() 
                OR 
                t.assigned_user_id = up2.id
            ))
            OR
            p.name = 'manage_todos'
        )
    )
);
*/
