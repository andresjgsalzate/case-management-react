-- Crear tabla de orígenes
CREATE TABLE IF NOT EXISTS origenes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de aplicaciones
CREATE TABLE IF NOT EXISTS aplicaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar datos iniciales para orígenes
INSERT INTO origenes (nombre, descripcion) VALUES 
('BACKLOG', 'Casos provenientes del backlog'),
('PRIORIZADA', 'Casos con priorización establecida'),
('CON_CAMBIOS', 'Casos que requieren cambios'),
('ACTIVIDAD', 'Casos de actividades regulares')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar datos iniciales para aplicaciones
INSERT INTO aplicaciones (nombre, descripcion) VALUES 
('SISLOG', 'Sistema de logística'),
('SIGLA', 'Sistema de gestión legal y administrativa'),
('AGD', 'Archivo General de Datos'),
('ACTIVIDAD', 'Procesos de actividad'),
('GARANTIAS', 'Sistema de garantías'),
('KOMPENDIUM', 'Base de conocimientos Kompendium'),
('SYON', 'Sistema SYON'),
('WSM LAB', 'Laboratorio WSM')
ON CONFLICT (nombre) DO NOTHING;

-- Crear tabla de casos en Supabase
CREATE TABLE IF NOT EXISTS cases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_caso VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    fecha DATE NOT NULL,
    origen_id UUID REFERENCES origenes(id),
    aplicacion_id UUID REFERENCES aplicaciones(id),
    historial_caso INTEGER NOT NULL CHECK (historial_caso BETWEEN 1 AND 3),
    conocimiento_modulo INTEGER NOT NULL CHECK (conocimiento_modulo BETWEEN 1 AND 3),
    manipulacion_datos INTEGER NOT NULL CHECK (manipulacion_datos BETWEEN 1 AND 3),
    claridad_descripcion INTEGER NOT NULL CHECK (claridad_descripcion BETWEEN 1 AND 3),
    causa_fallo INTEGER NOT NULL CHECK (causa_fallo BETWEEN 1 AND 3),
    puntuacion INTEGER NOT NULL CHECK (puntuacion BETWEEN 5 AND 15),
    clasificacion VARCHAR(20) NOT NULL CHECK (clasificacion IN ('Baja Complejidad', 'Media Complejidad', 'Alta Complejidad')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE origenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE aplicaciones ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo vean sus propios casos
CREATE POLICY "Users can view own cases" ON cases
    FOR SELECT USING (auth.uid() = user_id);

-- Política para que los usuarios solo puedan insertar sus propios casos
CREATE POLICY "Users can insert own cases" ON cases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para que los usuarios solo puedan actualizar sus propios casos
CREATE POLICY "Users can update own cases" ON cases
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para que los usuarios solo puedan eliminar sus propios casos
CREATE POLICY "Users can delete own cases" ON cases
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para orígenes (lectura pública, solo admins pueden modificar)
CREATE POLICY "Anyone can view origenes" ON origenes
    FOR SELECT USING (true);

-- Políticas para aplicaciones (lectura pública, solo admins pueden modificar)  
CREATE POLICY "Anyone can view aplicaciones" ON aplicaciones
    FOR SELECT USING (true);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_fecha ON cases(fecha);
CREATE INDEX IF NOT EXISTS idx_cases_clasificacion ON cases(clasificacion);
CREATE INDEX IF NOT EXISTS idx_cases_numero_caso ON cases(numero_caso);
-- Crear índices adicionales para orígenes y aplicaciones
CREATE INDEX IF NOT EXISTS idx_origenes_nombre ON origenes(nombre);
CREATE INDEX IF NOT EXISTS idx_origenes_activo ON origenes(activo);
CREATE INDEX IF NOT EXISTS idx_aplicaciones_nombre ON aplicaciones(nombre);
CREATE INDEX IF NOT EXISTS idx_aplicaciones_activo ON aplicaciones(activo);
CREATE INDEX IF NOT EXISTS idx_cases_origen_id ON cases(origen_id);
CREATE INDEX IF NOT EXISTS idx_cases_aplicacion_id ON cases(aplicacion_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_cases_updated_at
    BEFORE UPDATE ON cases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers para actualizar updated_at en orígenes y aplicaciones
CREATE TRIGGER update_origenes_updated_at
    BEFORE UPDATE ON origenes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aplicaciones_updated_at
    BEFORE UPDATE ON aplicaciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
