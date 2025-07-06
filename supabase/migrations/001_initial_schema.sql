-- Migración inicial del sistema de gestión de casos
-- Versión: 2.1.0

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (perfiles)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role_name TEXT DEFAULT 'analista' CHECK (role_name IN ('admin', 'supervisor', 'analista')),
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de casos
CREATE TABLE IF NOT EXISTS cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    radicado_simat TEXT NOT NULL UNIQUE,
    nombre_caso TEXT NOT NULL,
    origen_aplicacion TEXT NOT NULL,
    destino_aplicacion TEXT NOT NULL,
    descripcion TEXT,
    puntuacion INTEGER DEFAULT 0,
    clasificacion TEXT GENERATED ALWAYS AS (
        CASE 
            WHEN puntuacion <= 3 THEN 'Baja'
            WHEN puntuacion <= 6 THEN 'Media'
            ELSE 'Alta'
        END
    ) STORED,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de control de casos
CREATE TABLE IF NOT EXISTS case_status_control (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    assigned_user_id UUID REFERENCES user_profiles(id),
    status TEXT DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'En Curso', 'Escalada', 'Terminada')),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    total_time_minutes INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de registro de tiempo
CREATE TABLE IF NOT EXISTS case_time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_control_id UUID NOT NULL REFERENCES case_status_control(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    description TEXT,
    entry_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_cases_created_by ON cases(created_by);
CREATE INDEX IF NOT EXISTS idx_case_status_control_case_id ON case_status_control(case_id);
CREATE INDEX IF NOT EXISTS idx_case_status_control_assigned_user ON case_status_control(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_case_time_entries_case_control ON case_time_entries(case_control_id);
CREATE INDEX IF NOT EXISTS idx_case_time_entries_date ON case_time_entries(entry_date);

-- Funciones de actualización automática de timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualización automática
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_case_status_control_updated_at BEFORE UPDATE ON case_status_control FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
