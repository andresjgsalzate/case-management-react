-- ================================================================
-- MIGRACIÓN: Corregir rol de usuario administrador usando role_id
-- ================================================================
-- Problema: Usuario admin no tiene role_id correcto, el sistema usa role_name en lugar de role_id

-- Verificar el estado actual del usuario admin
SELECT 
  id,
  email,
  full_name,
  role_id,
  role_name,
  is_active,
  created_at
FROM user_profiles 
WHERE email = 'andresjgsalzate@gmail.com';

-- Verificar qué roles existen en la tabla roles
SELECT id, name, description, is_active 
FROM roles 
WHERE is_active = true
ORDER BY name;

-- Buscar el role_id del rol 'admin'
DO $$
DECLARE
  admin_role_id UUID;
BEGIN
  -- Obtener el ID del rol admin
  SELECT id INTO admin_role_id 
  FROM roles 
  WHERE name = 'admin' OR name = 'administrador' 
  LIMIT 1;
  
  -- Si no existe, crear el rol admin
  IF admin_role_id IS NULL THEN
    INSERT INTO roles (name, description, is_active)
    VALUES ('admin', 'Administrador del sistema', true)
    RETURNING id INTO admin_role_id;
    
    RAISE NOTICE 'Rol admin creado con ID: %', admin_role_id;
  ELSE
    RAISE NOTICE 'Rol admin encontrado con ID: %', admin_role_id;
  END IF;
  
  -- Actualizar usuario administrador principal con role_id correcto
  UPDATE user_profiles 
  SET 
    role_id = admin_role_id,
    role_name = 'admin',  -- También actualizamos role_name para consistencia
    is_active = true,
    updated_at = NOW()
  WHERE email = 'andresjgsalzate@gmail.com';
  
  RAISE NOTICE 'Usuario admin actualizado con role_id: %', admin_role_id;
END $$;

-- Verificar el cambio
SELECT 
  up.id,
  up.email,
  up.full_name,
  up.role_id,
  up.role_name,
  up.is_active,
  r.name as role_table_name,
  r.description as role_description
FROM user_profiles up
LEFT JOIN roles r ON up.role_id = r.id
WHERE email = 'andresjgsalzate@gmail.com';

-- También actualizar otros usuarios admin conocidos si existen
DO $$
DECLARE
  admin_role_id UUID;
BEGIN
  -- Obtener el ID del rol admin
  SELECT id INTO admin_role_id 
  FROM roles 
  WHERE name = 'admin' OR name = 'administrador' 
  LIMIT 1;
  
  -- Actualizar otros usuarios admin
  UPDATE user_profiles 
  SET 
    role_id = admin_role_id,
    role_name = 'admin',
    is_active = true,
    updated_at = NOW()
  WHERE email IN (
    'hjurgensen@todosistemassti.co',
    'juegosjgsalza@gmail.com'
  ) AND (role_id != admin_role_id OR role_id IS NULL);
END $$;

-- Verificar todos los usuarios admin
SELECT 
  up.email,
  up.full_name,
  up.role_id,
  up.role_name,
  up.is_active,
  r.name as role_table_name
FROM user_profiles up
LEFT JOIN roles r ON up.role_id = r.id
WHERE r.name = 'admin' OR up.role_name = 'admin'
ORDER BY up.email;

-- Mostrar todos los usuarios para verificar el estado
SELECT 
  up.email,
  up.full_name,
  up.role_id,
  up.role_name,
  up.is_active,
  r.name as role_table_name,
  CASE 
    WHEN r.name = 'admin' AND up.is_active = true THEN '✅ Admin con acceso completo'
    WHEN up.role_name = 'admin' AND up.is_active = true THEN '⚠️ Admin solo por role_name'
    WHEN up.role_name = 'user' AND up.is_active = true THEN '❌ Sin acceso (rol user)'
    WHEN up.is_active = false THEN '❌ Usuario inactivo'
    ELSE '❓ Estado desconocido'
  END as status
FROM user_profiles up
LEFT JOIN roles r ON up.role_id = r.id
ORDER BY 
  CASE 
    WHEN r.name = 'admin' THEN 1 
    WHEN up.role_name = 'admin' THEN 2
    WHEN up.role_name = 'user' THEN 3 
    ELSE 4 
  END,
  up.email;
