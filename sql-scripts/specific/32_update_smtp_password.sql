-- Actualizar la contraseña SMTP con la contraseña real
-- IMPORTANTE: Reemplaza 'TU_CONTRASEÑA_REAL_AQUI' con la contraseña real de tu cuenta de email

UPDATE system_configurations 
SET 
    value = 'TU_CONTRASEÑA_REAL_AQUI',
    updated_at = NOW()
WHERE 
    category = 'smtp' 
    AND "key" = 'password'
    AND value = 'CHANGE_THIS_PASSWORD';

-- Verificar que la actualización fue exitosa
SELECT 
    id,
    category,
    "key",
    CASE 
        WHEN "key" = 'password' THEN '***OCULTA***'
        ELSE value 
    END as value_display,
    description,
    is_active,
    updated_at
FROM system_configurations 
WHERE category = 'smtp'
ORDER BY "key";
