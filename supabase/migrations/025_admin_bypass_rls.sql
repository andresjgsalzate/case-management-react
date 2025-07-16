-- =====================================================
-- MIGRACIÓN: Bypass RLS para operaciones administrativas
-- =====================================================
-- Permite a los administradores hacer operaciones CRUD sin restricciones

-- 1. Función para actualizar roles (bypass RLS)
CREATE OR REPLACE FUNCTION admin_update_role(
  role_id UUID,
  role_name TEXT,
  role_description TEXT,
  is_active BOOLEAN DEFAULT true,
  permission_ids UUID[] DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_role JSON;
  perm_id UUID;
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Actualizar el rol
  UPDATE roles 
  SET 
    name = role_name,
    description = role_description,
    is_active = admin_update_role.is_active,
    updated_at = NOW()
  WHERE id = role_id;
  
  -- Si se proporcionaron permisos, actualizar las asignaciones
  IF permission_ids IS NOT NULL THEN
    -- Eliminar permisos existentes
    DELETE FROM role_permissions WHERE role_id = role_id;
    
    -- Agregar nuevos permisos
    FOREACH perm_id IN ARRAY permission_ids
    LOOP
      INSERT INTO role_permissions (role_id, permission_id) 
      VALUES (role_id, perm_id);
    END LOOP;
  END IF;
  
  -- Retornar el rol actualizado con permisos
  SELECT json_build_object(
    'id', r.id,
    'name', r.name,
    'description', r.description,
    'is_active', r.is_active,
    'created_at', r.created_at,
    'updated_at', r.updated_at,
    'permissions', COALESCE(
      (SELECT json_agg(
        json_build_object(
          'id', p.id,
          'name', p.name,
          'description', p.description,
          'resource', p.resource,
          'action', p.action,
          'is_active', p.is_active
        )
      ) FROM role_permissions rp 
      JOIN permissions p ON rp.permission_id = p.id 
      WHERE rp.role_id = r.id), '[]'::json
    )
  ) INTO result_role
  FROM roles r WHERE r.id = role_id;
  
  RETURN result_role;
END;
$$;

-- 2. Función para actualizar aplicaciones (bypass RLS)
CREATE OR REPLACE FUNCTION admin_update_aplicacion(
  aplicacion_id UUID,
  aplicacion_name TEXT,
  aplicacion_description TEXT,
  is_active BOOLEAN DEFAULT true
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_aplicacion JSON;
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Actualizar la aplicación
  UPDATE aplicaciones 
  SET 
    nombre = aplicacion_name,
    descripcion = aplicacion_description,
    activo = admin_update_aplicacion.is_active,
    updated_at = NOW()
  WHERE id = aplicacion_id;
  
  -- Retornar la aplicación actualizada
  SELECT json_build_object(
    'id', id,
    'nombre', nombre,
    'descripcion', descripcion,
    'activo', activo,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO result_aplicacion
  FROM aplicaciones WHERE id = aplicacion_id;
  
  RETURN result_aplicacion;
END;
$$;

-- 3. Función para actualizar orígenes (bypass RLS)
CREATE OR REPLACE FUNCTION admin_update_origen(
  origen_id UUID,
  origen_name TEXT,
  origen_description TEXT,
  is_active BOOLEAN DEFAULT true
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_origen JSON;
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
   
  -- Actualizar el origen
  UPDATE origenes 
  SET 
    nombre = origen_name,
    descripcion = origen_description,
    activo = admin_update_origen.is_active,
    updated_at = NOW()
  WHERE id = origen_id;
  
  -- Retornar el origen actualizado
  SELECT json_build_object(
    'id', id,
    'nombre', nombre,
    'descripcion', descripcion,
    'activo', activo,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO result_origen
  FROM origenes WHERE id = origen_id;
  
  RETURN result_origen;
END;
$$;

-- 4. Función para actualizar usuarios (bypass RLS)
CREATE OR REPLACE FUNCTION admin_update_user(
  user_id UUID,
  user_email TEXT,
  user_full_name TEXT,
  user_role_id UUID,
  is_active BOOLEAN DEFAULT true
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_user JSON;
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Actualizar el usuario
  UPDATE user_profiles 
  SET 
    email = user_email,
    full_name = user_full_name,
    role_id = user_role_id,
    is_active = admin_update_user.is_active,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Retornar el usuario actualizado con rol
  SELECT json_build_object(
    'id', up.id,
    'email', up.email,
    'full_name', up.full_name,
    'role_id', up.role_id,
    'is_active', up.is_active,
    'last_login_at', up.last_login_at,
    'created_at', up.created_at,
    'updated_at', up.updated_at,
    'role', CASE 
      WHEN r.id IS NOT NULL THEN json_build_object(
        'id', r.id,
        'name', r.name,
        'description', r.description,
        'is_active', r.is_active,
        'created_at', r.created_at,
        'updated_at', r.updated_at
      )
      ELSE NULL
    END
  ) INTO result_user
  FROM user_profiles up
  LEFT JOIN roles r ON up.role_id = r.id
  WHERE up.id = user_id;
  
  RETURN result_user;
END;
$$;

-- 5. Función para eliminar usuarios (bypass RLS)
CREATE OR REPLACE FUNCTION admin_delete_user(
  user_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Eliminar el perfil de usuario
  DELETE FROM user_profiles WHERE id = user_id;
  
  RETURN TRUE;
END;
$$;

-- 6. Función para actualizar permisos (bypass RLS)
CREATE OR REPLACE FUNCTION admin_update_permission(
  permission_id UUID,
  permission_name TEXT,
  permission_description TEXT,
  permission_resource TEXT,
  permission_action TEXT,
  is_active BOOLEAN DEFAULT true
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_permission JSON;
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Actualizar el permiso
  UPDATE permissions 
  SET 
    name = permission_name,
    description = permission_description,
    resource = permission_resource,
    action = permission_action,
    is_active = admin_update_permission.is_active,
    updated_at = NOW()
  WHERE id = permission_id;
  
  -- Retornar el permiso actualizado
  SELECT json_build_object(
    'id', id,
    'name', name,
    'description', description,
    'resource', resource,
    'action', action,
    'is_active', is_active,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO result_permission
  FROM permissions WHERE id = permission_id;
  
  RETURN result_permission;
END;
$$;

-- 7. Función para eliminar permisos (bypass RLS)
CREATE OR REPLACE FUNCTION admin_delete_permission(
  permission_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Primero eliminar las asignaciones de roles
  DELETE FROM role_permissions WHERE permission_id = permission_id;
  
  -- Luego eliminar el permiso
  DELETE FROM permissions WHERE id = permission_id;
  
  RETURN TRUE;
END;
$$;

-- 8. Función para crear permisos (bypass RLS)
CREATE OR REPLACE FUNCTION admin_create_permission(
  permission_name TEXT,
  permission_description TEXT,
  permission_resource TEXT,
  permission_action TEXT,
  is_active BOOLEAN DEFAULT true
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_permission JSON;
  new_permission_id UUID;
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Insertar el nuevo permiso
  INSERT INTO permissions (name, description, resource, action, is_active)
  VALUES (permission_name, permission_description, permission_resource, permission_action, admin_create_permission.is_active)
  RETURNING id INTO new_permission_id;
  
  -- Retornar el permiso creado
  SELECT json_build_object(
    'id', id,
    'name', name,
    'description', description,
    'resource', resource,
    'action', action,
    'is_active', is_active,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO result_permission
  FROM permissions WHERE id = new_permission_id;
  
  RETURN result_permission;
END;
$$;

-- 9. Función para crear orígenes (bypass RLS)
CREATE OR REPLACE FUNCTION admin_create_origen(
  origen_name TEXT,
  origen_description TEXT,
  is_active BOOLEAN DEFAULT true
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_origen JSON;
  new_origen_id UUID;
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Insertar el nuevo origen
  INSERT INTO origenes (nombre, descripcion, activo)
  VALUES (origen_name, origen_description, admin_create_origen.is_active)
  RETURNING id INTO new_origen_id;
  
  -- Retornar el origen creado
  SELECT json_build_object(
    'id', id,
    'nombre', nombre,
    'descripcion', descripcion,
    'activo', activo,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO result_origen
  FROM origenes WHERE id = new_origen_id;
  
  RETURN result_origen;
END;
$$;

-- 10. Función para eliminar orígenes (bypass RLS)
CREATE OR REPLACE FUNCTION admin_delete_origen(
  origen_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Eliminar el origen
  DELETE FROM origenes WHERE id = origen_id;
  
  RETURN TRUE;
END;
$$;

-- 11. Función para crear aplicaciones (bypass RLS)
CREATE OR REPLACE FUNCTION admin_create_aplicacion(
  aplicacion_name TEXT,
  aplicacion_description TEXT,
  is_active BOOLEAN DEFAULT true
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result_aplicacion JSON;
  new_aplicacion_id UUID;
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Insertar la nueva aplicación
  INSERT INTO aplicaciones (nombre, descripcion, activo)
  VALUES (aplicacion_name, aplicacion_description, admin_create_aplicacion.is_active)
  RETURNING id INTO new_aplicacion_id;
  
  -- Retornar la aplicación creada
  SELECT json_build_object(
    'id', id,
    'nombre', nombre,
    'descripcion', descripcion,
    'activo', activo,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO result_aplicacion
  FROM aplicaciones WHERE id = new_aplicacion_id;
  
  RETURN result_aplicacion;
END;
$$;

-- 12. Función para eliminar aplicaciones (bypass RLS)
CREATE OR REPLACE FUNCTION admin_delete_aplicacion(
  aplicacion_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Eliminar la aplicación
  DELETE FROM aplicaciones WHERE id = aplicacion_id;
  
  RETURN TRUE;
END;
$$;
