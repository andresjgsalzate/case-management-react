-- Verificar y crear prioridades TODO si no existen
-- Ejecutar en la consola SQL de Supabase

-- 1. Verificar si existen prioridades
SELECT * FROM todo_priorities ORDER BY display_order;

-- 2. Si no hay prioridades, insertarlas
INSERT INTO todo_priorities (name, description, color, level, display_order) VALUES 
('Muy Baja', 'Tareas de muy baja prioridad - pueden esperar', '#10B981', 1, 10),
('Baja', 'Tareas de baja prioridad - sin urgencia', '#3B82F6', 2, 20),
('Media', 'Tareas de prioridad media - atención normal', '#F59E0B', 3, 30),
('Alta', 'Tareas de alta prioridad - requieren atención pronto', '#EF4444', 4, 40),
('Crítica', 'Tareas críticas - atención inmediata requerida', '#DC2626', 5, 50)
ON CONFLICT (name) DO NOTHING;

-- 3. Verificar nuevamente
SELECT * FROM todo_priorities ORDER BY display_order;
