-- ================================================================
-- BACKUP DE ESTRUCTURA COMPLETA - SISTEMA DE GESTIÓN DE CASOS
-- Fecha: 2025-08-05 11:09:54
-- Proyecto: case-management-react
-- Versión: Sistema de Permisos con Scopes v2.0
-- Generado por: GENERAR_BACKUP_ESTRUCTURA.ps1
-- ================================================================

-- ================================================================
-- INFORMACIÓN DEL PROYECTO
-- ================================================================
-- Proyecto: Sistema de Gestión de Casos
-- Tecnología: React + TypeScript + Supabase
-- Base de Datos: PostgreSQL 15+
-- Sistema de Permisos: Basado en Scopes (own/team/all)
-- Módulos: 15 módulos principales
-- Permisos: 204 permisos únicos
-- Roles: 4 roles predefinidos

-- ================================================================
-- ORDEN DE RESTAURACIÓN RECOMENDADO
-- ================================================================
-- 1. Ejecutar este archivo completo (estructura)
-- 2. Ejecutar datos_esenciales_permisos.sql (datos)
-- 3. Verificar migraciones aplicadas
-- 4. Configurar RLS según necesidades

-- ================================================================
-- EXTENSIONES REQUERIDAS
-- ================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ================================================================
-- ESQUEMA COMPLETO DE TABLAS
-- ================================================================

-- Eliminar tablas existentes en orden correcto (respetando dependencias)
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS case_control CASCADE;
DROP TABLE IF EXISTS todos CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS solution_documents CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS case_statuses CASCADE;
DROP TABLE IF EXISTS origenes CASCADE;
DROP TABLE IF EXISTS aplicaciones CASCADE;

-- ================================================================
-- TABLA: roles (crear primero por dependencias)
-- ================================================================
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE roles IS 'Roles del sistema (Administrador, Supervisor, Analista, Auditor)';
COMMENT ON COLUMN roles.name IS 'Nombre único del rol';
COMMENT ON COLUMN roles.description IS 'Descripción detallada del rol';

-- ================================================================
-- TABLA: permissions
-- ================================================================
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    scope VARCHAR(50) NOT NULL CHECK (scope IN ('own', 'team', 'all')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE permissions IS 'Sistema de permisos con formato modulo.accion_scope';
COMMENT ON COLUMN permissions.name IS 'Nombre único del permiso (ej: users.read_own)';
COMMENT ON COLUMN permissions.resource IS 'Recurso/módulo del sistema';
COMMENT ON COLUMN permissions.action IS 'Acción permitida (read, create, update, delete, admin)';
COMMENT ON COLUMN permissions.scope IS 'Alcance del permiso (own=propio, team=equipo, all=todos)';

-- ================================================================
-- TABLA: role_permissions (asignaciones)
-- ================================================================
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

COMMENT ON TABLE role_permissions IS 'Asignación de permisos a roles';

-- ================================================================
-- TABLA: user_profiles
-- ================================================================
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role_id UUID REFERENCES roles(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE user_profiles IS 'Perfiles de usuarios del sistema';

-- ================================================================
-- TABLA: case_statuses
-- ================================================================
CREATE TABLE case_statuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    is_default BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE case_statuses IS 'Estados de casos (abierto, en_progreso, resuelto, etc.)';

-- ================================================================
-- TABLA: origenes
-- ================================================================
CREATE TABLE origenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE origenes IS 'Orígenes de los casos (Sistema, Usuario, Monitoreo, etc.)';

-- ================================================================
-- TABLA: aplicaciones
-- ================================================================
CREATE TABLE aplicaciones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    version VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE aplicaciones IS 'Aplicaciones del sistema donde ocurren los casos';

-- ================================================================
-- TABLA: cases (principal)
-- ================================================================
CREATE TABLE cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status_id UUID REFERENCES case_statuses(id),
    priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5),
    assigned_to UUID REFERENCES user_profiles(id),
    created_by UUID REFERENCES user_profiles(id),
    origen_id UUID REFERENCES origenes(id),
    aplicacion_id UUID REFERENCES aplicaciones(id),
    due_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE cases IS 'Casos principales del sistema de gestión';
COMMENT ON COLUMN cases.priority_level IS 'Prioridad del 1 (más alta) al 5 (más baja)';

-- ================================================================
-- TABLA: case_control (control de tiempo)
-- ================================================================
CREATE TABLE case_control (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES user_profiles(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    timer_start TIMESTAMP WITH TIME ZONE,
    timer_end TIMESTAMP WITH TIME ZONE,
    total_time_seconds INTEGER DEFAULT 0,
    manual_time_seconds INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE case_control IS 'Control de tiempo y seguimiento de casos';

-- ================================================================
-- TABLA: todos (tareas)
-- ================================================================
CREATE TABLE todos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_completed BOOLEAN DEFAULT false,
    priority_level INTEGER DEFAULT 3 CHECK (priority_level BETWEEN 1 AND 5),
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to UUID REFERENCES user_profiles(id),
    created_by UUID REFERENCES user_profiles(id),
    case_id UUID REFERENCES cases(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE todos IS 'Sistema de tareas y recordatorios';

-- ================================================================
-- TABLA: notes (notas)
-- ================================================================
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_archived BOOLEAN DEFAULT false,
    tags TEXT[],
    created_by UUID REFERENCES user_profiles(id),
    case_id UUID REFERENCES cases(id),
    todo_id UUID REFERENCES todos(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE notes IS 'Sistema de notas y documentación personal';

-- ================================================================
-- TABLA: solution_documents (documentación)
-- ================================================================
CREATE TABLE solution_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    tags TEXT[],
    is_published BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_by UUID REFERENCES user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON TABLE solution_documents IS 'Documentación y base de conocimiento';

-- ================================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- ================================================================

-- Índices para roles
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_is_active ON roles(is_active);

-- Índices para permissions
CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_action ON permissions(action);
CREATE INDEX idx_permissions_scope ON permissions(scope);
CREATE INDEX idx_permissions_is_active ON permissions(is_active);
CREATE INDEX idx_permissions_resource_action_scope ON permissions(resource, action, scope);

-- Índices para role_permissions
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Índices para user_profiles
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_role_id ON user_profiles(role_id);
CREATE INDEX idx_user_profiles_is_active ON user_profiles(is_active);

-- Índices para cases
CREATE INDEX idx_cases_case_number ON cases(case_number);
CREATE INDEX idx_cases_status_id ON cases(status_id);
CREATE INDEX idx_cases_assigned_to ON cases(assigned_to);
CREATE INDEX idx_cases_created_by ON cases(created_by);
CREATE INDEX idx_cases_priority_level ON cases(priority_level);
CREATE INDEX idx_cases_created_at ON cases(created_at);
CREATE INDEX idx_cases_due_date ON cases(due_date);

-- Índices para case_statuses
CREATE INDEX idx_case_statuses_name ON case_statuses(name);
CREATE INDEX idx_case_statuses_order_index ON case_statuses(order_index);

-- Índices para case_control
CREATE INDEX idx_case_control_case_id ON case_control(case_id);
CREATE INDEX idx_case_control_user_id ON case_control(user_id);
CREATE INDEX idx_case_control_status ON case_control(status);

-- Índices para todos
CREATE INDEX idx_todos_assigned_to ON todos(assigned_to);
CREATE INDEX idx_todos_created_by ON todos(created_by);
CREATE INDEX idx_todos_case_id ON todos(case_id);
CREATE INDEX idx_todos_is_completed ON todos(is_completed);
CREATE INDEX idx_todos_priority_level ON todos(priority_level);
CREATE INDEX idx_todos_due_date ON todos(due_date);

-- Índices para notes
CREATE INDEX idx_notes_created_by ON notes(created_by);
CREATE INDEX idx_notes_case_id ON notes(case_id);
CREATE INDEX idx_notes_todo_id ON notes(todo_id);
CREATE INDEX idx_notes_is_archived ON notes(is_archived);
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);

-- Índices para solution_documents
CREATE INDEX idx_solution_documents_created_by ON solution_documents(created_by);
CREATE INDEX idx_solution_documents_category ON solution_documents(category);
CREATE INDEX idx_solution_documents_is_published ON solution_documents(is_published);
CREATE INDEX idx_solution_documents_tags ON solution_documents USING GIN(tags);

-- ================================================================
-- TRIGGERS PARA UPDATED_AT
-- ================================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers a todas las tablas
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_case_statuses_updated_at BEFORE UPDATE ON case_statuses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_origenes_updated_at BEFORE UPDATE ON origenes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_aplicaciones_updated_at BEFORE UPDATE ON aplicaciones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cases_updated_at BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_case_control_updated_at BEFORE UPDATE ON case_control FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_todos_updated_at BEFORE UPDATE ON todos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_solution_documents_updated_at BEFORE UPDATE ON solution_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- FUNCIONES DEL SISTEMA
-- ================================================================

-- Función para obtener estadísticas del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats(user_id UUID)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_cases', (SELECT COUNT(*) FROM cases WHERE assigned_to = user_id),
        'open_cases', (SELECT COUNT(*) FROM cases WHERE assigned_to = user_id AND status_id IN (SELECT id FROM case_statuses WHERE name = 'abierto')),
        'completed_todos', (SELECT COUNT(*) FROM todos WHERE assigned_to = user_id AND is_completed = true),
        'pending_todos', (SELECT COUNT(*) FROM todos WHERE assigned_to = user_id AND is_completed = false),
        'total_notes', (SELECT COUNT(*) FROM notes WHERE created_by = user_id AND NOT is_archived),
        'published_documents', (SELECT COUNT(*) FROM solution_documents WHERE created_by = user_id AND is_published = true)
    ) INTO stats;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar permisos del usuario
CREATE OR REPLACE FUNCTION user_has_permission(user_id UUID, permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := false;
BEGIN
    SELECT EXISTS(
        SELECT 1 
        FROM user_profiles up
        JOIN role_permissions rp ON up.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE up.id = user_id 
        AND p.name = permission_name 
        AND p.is_active = true
        AND up.is_active = true
    ) INTO has_permission;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para generar número de caso único
CREATE OR REPLACE FUNCTION generate_case_number()
RETURNS TEXT AS $$
DECLARE
    new_number TEXT;
    prefix TEXT := 'CASE';
    year_suffix TEXT := to_char(NOW(), 'YY');
    sequence_num INTEGER;
BEGIN
    -- Obtener el siguiente número de secuencia para este año
    SELECT COALESCE(MAX(CAST(SUBSTRING(case_number FROM '\d+$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM cases
    WHERE case_number LIKE prefix || year_suffix || '%';
    
    -- Formatear con ceros a la izquierda
    new_number := prefix || year_suffix || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- VISTAS DEL SISTEMA
-- ================================================================

-- Vista completa de casos
CREATE OR REPLACE VIEW cases_with_details AS
SELECT 
    c.id,
    c.case_number,
    c.title,
    c.description,
    c.priority_level,
    c.due_date,
    c.created_at,
    c.updated_at,
    cs.name as status_name,
    cs.color as status_color,
    COALESCE(up_assigned.first_name || ' ' || up_assigned.last_name, 'Sin asignar') as assigned_to_name,
    COALESCE(up_created.first_name || ' ' || up_created.last_name, 'Sistema') as created_by_name,
    o.name as origen_name,
    a.name as aplicacion_name,
    a.version as aplicacion_version
FROM cases c
LEFT JOIN case_statuses cs ON c.status_id = cs.id
LEFT JOIN user_profiles up_assigned ON c.assigned_to = up_assigned.id
LEFT JOIN user_profiles up_created ON c.created_by = up_created.id
LEFT JOIN origenes o ON c.origen_id = o.id
LEFT JOIN aplicaciones a ON c.aplicacion_id = a.id;

-- Vista completa de TODOs
CREATE OR REPLACE VIEW todos_with_details AS
SELECT 
    t.id,
    t.title,
    t.description,
    t.is_completed,
    t.priority_level,
    t.due_date,
    t.created_at,
    t.updated_at,
    COALESCE(up_assigned.first_name || ' ' || up_assigned.last_name, 'Sin asignar') as assigned_to_name,
    COALESCE(up_created.first_name || ' ' || up_created.last_name, 'Sistema') as created_by_name,
    c.case_number,
    c.title as case_title
FROM todos t
LEFT JOIN user_profiles up_assigned ON t.assigned_to = up_assigned.id
LEFT JOIN user_profiles up_created ON t.created_by = up_created.id
LEFT JOIN cases c ON t.case_id = c.id;

-- Vista de permisos por usuario
CREATE OR REPLACE VIEW user_permissions AS
SELECT 
    up.id as user_id,
    up.email,
    up.first_name || ' ' || up.last_name as full_name,
    r.name as role_name,
    p.name as permission_name,
    p.resource,
    p.action,
    p.scope,
    p.description as permission_description
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
WHERE up.is_active = true 
AND r.is_active = true 
AND p.is_active = true;

-- ================================================================
-- CONFIGURACIÓN RLS (ROW LEVEL SECURITY)
-- ================================================================

-- Habilitar RLS en todas las tablas principales
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE origenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE aplicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_documents ENABLE ROW LEVEL SECURITY;

-- ================================================================
-- POLÍTICAS RLS BÁSICAS
-- ================================================================

-- Política para usuarios: pueden ver su propio perfil
CREATE POLICY "users_own_profile" ON user_profiles
    FOR ALL USING (auth.uid()::text = id::text);

-- Política para casos: depende de permisos del usuario
CREATE POLICY "cases_access_policy" ON cases
    FOR ALL USING (
        user_has_permission(auth.uid(), 'cases.read_all') OR
        (user_has_permission(auth.uid(), 'cases.read_team') AND assigned_to IN (
            SELECT id FROM user_profiles WHERE role_id = (
                SELECT role_id FROM user_profiles WHERE id = auth.uid()
            )
        )) OR
        (user_has_permission(auth.uid(), 'cases.read_own') AND assigned_to = auth.uid())
    );

-- ================================================================
-- CONFIGURACIÓN DE SEGURIDAD
-- ================================================================

-- Revocar permisos públicos por defecto
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

-- Otorgar permisos específicos según sea necesario
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON user_permissions TO authenticated;

-- ================================================================
-- INFORMACIÓN FINAL
-- ================================================================

-- Crear tabla de información del sistema
CREATE TABLE IF NOT EXISTS system_info (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar información del sistema
INSERT INTO system_info (key, value, description) VALUES 
('version', '2.0.0', 'Versión del sistema de gestión de casos'),
('backup_date', '2025-08-05 11:09:54', 'Fecha de este backup'),
('permission_system', 'scope_based', 'Sistema de permisos basado en scopes'),
('total_modules', '15', 'Número total de módulos del sistema'),
('total_permissions', '204', 'Número total de permisos únicos'),
('default_roles', '4', 'Número de roles predefinidos')
ON CONFLICT (key) DO UPDATE SET 
    value = EXCLUDED.value,
    updated_at = NOW();

-- ================================================================
-- FIN DEL BACKUP COMPLETO
-- ================================================================

-- SIGUIENTE PASO: Ejecutar datos_esenciales_permisos.sql para cargar datos base

COMMENT ON DATABASE postgres IS 'Sistema de Gestión de Casos - Backup completo generado el 2025-08-05 11:09:54';

