-- Verificar roles existentes
SELECT * FROM roles;

-- Verificar perfiles de usuario
SELECT * FROM user_profiles;

-- Obtener el ID del rol admin
SELECT id, name FROM roles WHERE name = 'admin';
