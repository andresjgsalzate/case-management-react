-- Migración para asegurar que los orígenes tengan colores válidos
-- Esta migración corrige el problema de colores faltantes en las métricas del dashboard

-- Actualizar orígenes existentes con colores si no los tienen
UPDATE origenes 
SET color = CASE 
  WHEN UPPER(nombre) = 'PRIORIZADA' THEN '#3B82F6'
  WHEN UPPER(nombre) = 'ACTIVIDAD' THEN '#10B981'
  WHEN UPPER(nombre) = 'BACKLOG' THEN '#F59E0B'
  WHEN UPPER(nombre) = 'CON_CAMBIOS' THEN '#EF4444'
  ELSE '#6B7280'
END
WHERE color IS NULL OR color = '' OR color = 'undefined';

-- Verificar que todos los orígenes tengan color
SELECT id, nombre, color FROM origenes;

-- Crear algunas entradas de tiempo de ejemplo si no existen (para testing)
INSERT INTO time_entries (case_control_id, duration_minutes, description, created_at)
SELECT 
    cc.id,
    (RANDOM() * 120 + 15)::INTEGER, -- Entre 15 y 135 minutos
    'Tiempo de trabajo de prueba',
    NOW() - (RANDOM() * INTERVAL '7 days')
FROM case_control cc
WHERE NOT EXISTS (
    SELECT 1 FROM time_entries te WHERE te.case_control_id = cc.id
)
AND EXISTS (SELECT 1 FROM cases c WHERE c.id = cc.case_id)
LIMIT 5; -- Solo 5 entradas de prueba

-- Verificar las entradas creadas
SELECT 
    te.duration_minutes,
    c.numero_caso,
    o.nombre as origen,
    o.color,
    a.nombre as aplicacion
FROM time_entries te
JOIN case_control cc ON te.case_control_id = cc.id
JOIN cases c ON cc.case_id = c.id
LEFT JOIN origenes o ON c.origen_id = o.id
LEFT JOIN aplicaciones a ON c.aplicacion_id = a.id
ORDER BY te.created_at DESC
LIMIT 10;
