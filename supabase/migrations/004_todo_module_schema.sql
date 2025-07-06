-- Migración: Módulo TODO con Timer
-- Versión: 2.1.1
-- Fecha: 2025-07-05

-- =====================================================
-- TABLA DE PRIORIDADES PARA TODO
-- =====================================================

CREATE TABLE IF NOT EXISTS todo_priorities (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR DEFAULT '#6B7280',
    level INTEGER NOT NULL UNIQUE CHECK (level >= 1 AND level <= 5),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT todo_priorities_pkey PRIMARY KEY (id)
);

-- =====================================================
-- TABLA PRINCIPAL DE TODOS
-- =====================================================

CREATE TABLE IF NOT EXISTS todos (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    title VARCHAR NOT NULL,
    description TEXT,
    priority_id uuid NOT NULL,
    assigned_user_id uuid,
    created_by_user_id uuid NOT NULL,
    due_date DATE,
    estimated_minutes INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT todos_pkey PRIMARY KEY (id),
    CONSTRAINT todos_priority_id_fkey FOREIGN KEY (priority_id) REFERENCES todo_priorities(id),
    CONSTRAINT todos_assigned_user_id_fkey FOREIGN KEY (assigned_user_id) REFERENCES user_profiles(id),
    CONSTRAINT todos_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES user_profiles(id)
);

-- =====================================================
-- TABLA DE CONTROL DE TODO (Reutiliza los estados de casos)
-- =====================================================

CREATE TABLE IF NOT EXISTS todo_control (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    todo_id uuid NOT NULL UNIQUE,
    user_id uuid NOT NULL,
    status_id uuid NOT NULL, -- Reutiliza case_status_control
    total_time_minutes INTEGER DEFAULT 0,
    timer_start_at TIMESTAMPTZ,
    is_timer_active BOOLEAN DEFAULT false,
    assigned_at TIMESTAMPTZ DEFAULT now(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT todo_control_pkey PRIMARY KEY (id),
    CONSTRAINT todo_control_todo_id_fkey FOREIGN KEY (todo_id) REFERENCES todos(id) ON DELETE CASCADE,
    CONSTRAINT todo_control_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id),
    CONSTRAINT todo_control_status_id_fkey FOREIGN KEY (status_id) REFERENCES case_status_control(id)
);

-- =====================================================
-- TABLA DE ENTRADAS DE TIEMPO PARA TODO
-- =====================================================

CREATE TABLE IF NOT EXISTS todo_time_entries (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    todo_control_id uuid NOT NULL,
    user_id uuid NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER,
    entry_type VARCHAR NOT NULL CHECK (entry_type IN ('automatic', 'manual')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT todo_time_entries_pkey PRIMARY KEY (id),
    CONSTRAINT todo_time_entries_todo_control_id_fkey FOREIGN KEY (todo_control_id) REFERENCES todo_control(id) ON DELETE CASCADE,
    CONSTRAINT todo_time_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id)
);

-- =====================================================
-- TABLA DE ENTRADAS MANUALES DE TIEMPO PARA TODO
-- =====================================================

CREATE TABLE IF NOT EXISTS todo_manual_time_entries (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    todo_control_id uuid NOT NULL,
    user_id uuid NOT NULL,
    date DATE NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    created_by uuid NOT NULL,
    CONSTRAINT todo_manual_time_entries_pkey PRIMARY KEY (id),
    CONSTRAINT todo_manual_time_entries_todo_control_id_fkey FOREIGN KEY (todo_control_id) REFERENCES todo_control(id) ON DELETE CASCADE,
    CONSTRAINT todo_manual_time_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES user_profiles(id),
    CONSTRAINT todo_manual_time_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES user_profiles(id)
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_todos_assigned_user ON todos(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_todos_created_by ON todos(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON todos(priority_id);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos(is_completed);

CREATE INDEX IF NOT EXISTS idx_todo_control_todo_id ON todo_control(todo_id);
CREATE INDEX IF NOT EXISTS idx_todo_control_user_id ON todo_control(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_control_status_id ON todo_control(status_id);
CREATE INDEX IF NOT EXISTS idx_todo_control_timer_active ON todo_control(is_timer_active);

CREATE INDEX IF NOT EXISTS idx_todo_time_entries_control_id ON todo_time_entries(todo_control_id);
CREATE INDEX IF NOT EXISTS idx_todo_time_entries_user_id ON todo_time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_todo_time_entries_start_time ON todo_time_entries(start_time);

CREATE INDEX IF NOT EXISTS idx_todo_manual_time_entries_control_id ON todo_manual_time_entries(todo_control_id);
CREATE INDEX IF NOT EXISTS idx_todo_manual_time_entries_date ON todo_manual_time_entries(date);

-- =====================================================
-- TRIGGERS PARA ACTUALIZACIÓN AUTOMÁTICA
-- =====================================================

-- Trigger para actualizar updated_at en todos
CREATE TRIGGER update_todos_updated_at 
    BEFORE UPDATE ON todos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en todo_priorities
CREATE TRIGGER update_todo_priorities_updated_at 
    BEFORE UPDATE ON todo_priorities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en todo_control
CREATE TRIGGER update_todo_control_updated_at 
    BEFORE UPDATE ON todo_control 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar updated_at en todo_time_entries
CREATE TRIGGER update_todo_time_entries_updated_at 
    BEFORE UPDATE ON todo_time_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
