-- Migración 009: Módulo Control de Casos
-- Crear tablas para el control de tiempo y estados de casos

-- Tabla para estados de casos en el control
CREATE TABLE IF NOT EXISTS case_status_control (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280', -- Color hex para UI
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla principal para el control de casos
CREATE TABLE IF NOT EXISTS case_control (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    status_id UUID NOT NULL REFERENCES case_status_control(id),
    
    -- Tiempos
    total_time_minutes INTEGER DEFAULT 0, -- Tiempo total acumulado en minutos
    timer_start_at TIMESTAMP WITH TIME ZONE, -- Cuando se inició el timer actual
    is_timer_active BOOLEAN DEFAULT false,
    
    -- Metadatos
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Restricciones
    UNIQUE(case_id) -- Un caso solo puede tener un control activo
);

-- Tabla para el historial de tiempo (time tracking)
CREATE TABLE IF NOT EXISTS time_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_control_id UUID NOT NULL REFERENCES case_control(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Información del tiempo
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER, -- Calculado al finalizar
    
    -- Tipo de entrada
    entry_type VARCHAR(20) NOT NULL CHECK (entry_type IN ('automatic', 'manual')),
    description TEXT, -- Para entradas manuales
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para entradas manuales de tiempo
CREATE TABLE IF NOT EXISTS manual_time_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    case_control_id UUID NOT NULL REFERENCES case_control(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
    
    -- Información del tiempo manual
    date DATE NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    description TEXT NOT NULL,
    
    -- Metadatos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES user_profiles(id)
);

-- Insertar estados predefinidos
INSERT INTO case_status_control (name, description, color, display_order) VALUES
('PENDIENTE', 'Caso asignado pero no iniciado', '#6B7280', 1),
('EN CURSO', 'Caso en proceso de resolución', '#3B82F6', 2),
('ESCALADA', 'Caso escalado a nivel superior', '#F59E0B', 3),
('TERMINADA', 'Caso completado y cerrado', '#10B981', 4)
ON CONFLICT (name) DO NOTHING;

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_case_control_case_id ON case_control(case_id);
CREATE INDEX IF NOT EXISTS idx_case_control_user_id ON case_control(user_id);
CREATE INDEX IF NOT EXISTS idx_case_control_status_id ON case_control(status_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_case_control_id ON time_entries(case_control_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_manual_time_entries_case_control_id ON manual_time_entries(case_control_id);
CREATE INDEX IF NOT EXISTS idx_manual_time_entries_date ON manual_time_entries(date);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_case_status_control_updated_at 
    BEFORE UPDATE ON case_status_control 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_case_control_updated_at 
    BEFORE UPDATE ON case_control 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at 
    BEFORE UPDATE ON time_entries 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular duración automáticamente en time_entries
CREATE OR REPLACE FUNCTION calculate_time_entry_duration()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER calculate_duration_trigger
    BEFORE INSERT OR UPDATE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION calculate_time_entry_duration();

-- Función para actualizar tiempo total en case_control
CREATE OR REPLACE FUNCTION update_case_control_total_time()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el tiempo total del case_control
    UPDATE case_control 
    SET total_time_minutes = (
        SELECT COALESCE(SUM(duration_minutes), 0) 
        FROM time_entries 
        WHERE case_control_id = COALESCE(NEW.case_control_id, OLD.case_control_id)
        AND duration_minutes IS NOT NULL
    ) + (
        SELECT COALESCE(SUM(duration_minutes), 0)
        FROM manual_time_entries
        WHERE case_control_id = COALESCE(NEW.case_control_id, OLD.case_control_id)
    )
    WHERE id = COALESCE(NEW.case_control_id, OLD.case_control_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Triggers para actualizar tiempo total
CREATE TRIGGER update_total_time_on_time_entry
    AFTER INSERT OR UPDATE OR DELETE ON time_entries
    FOR EACH ROW EXECUTE FUNCTION update_case_control_total_time();

CREATE TRIGGER update_total_time_on_manual_entry
    AFTER INSERT OR UPDATE OR DELETE ON manual_time_entries
    FOR EACH ROW EXECUTE FUNCTION update_case_control_total_time();
