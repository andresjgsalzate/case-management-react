-- Migración 003: Sistema de Roles y Permisos
-- Fecha: 2025-07-05

-- Tabla de roles
CREATE TABLE roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de permisos
CREATE TABLE permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    resource VARCHAR(50) NOT NULL, -- casos, usuarios, origenes, aplicaciones, etc.
    action VARCHAR(20) NOT NULL,   -- create, read, update, delete, manage
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla de relación roles-permisos (many-to-many)
CREATE TABLE role_permissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(role_id, permission_id)
);

-- Tabla de perfiles de usuario (extensión de auth.users)
CREATE TABLE user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Índices para optimizar consultas
CREATE INDEX idx_user_profiles_role_id ON user_profiles(role_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil de usuario automáticamente
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    user_role_id UUID;
BEGIN
    -- Obtener el rol de usuario por defecto
    SELECT id INTO user_role_id FROM roles WHERE name = 'user' LIMIT 1;
    
    -- Crear perfil de usuario
    INSERT INTO user_profiles (id, email, full_name, role_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        user_role_id
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS (Row Level Security) Policies

-- Habilitar RLS en todas las tablas
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para roles (solo admins pueden gestionar)
CREATE POLICY "Admins can manage roles" ON roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() AND r.name = 'admin'
        )
    );

-- Políticas para permisos (solo admins pueden gestionar)
CREATE POLICY "Admins can manage permissions" ON permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() AND r.name = 'admin'
        )
    );

-- Políticas para role_permissions (solo admins pueden gestionar)
CREATE POLICY "Admins can manage role permissions" ON role_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() AND r.name = 'admin'
        )
    );

-- Políticas para user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON user_profiles
    FOR UPDATE USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can manage all user profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() AND r.name = 'admin'
        )
    );

-- Actualizar políticas de la tabla cases para filtrar por usuario
-- Eliminar todas las políticas existentes de la tabla cases
DROP POLICY IF EXISTS "Users can view all cases" ON cases;
DROP POLICY IF EXISTS "Users can insert cases" ON cases;
DROP POLICY IF EXISTS "Users can update cases" ON cases;
DROP POLICY IF EXISTS "Users can delete cases" ON cases;
DROP POLICY IF EXISTS "Users can view own cases" ON cases;
DROP POLICY IF EXISTS "Users can insert own cases" ON cases;
DROP POLICY IF EXISTS "Users can update own cases" ON cases;
DROP POLICY IF EXISTS "Users can delete own cases" ON cases;
DROP POLICY IF EXISTS "Users can view own cases or admins can view all" ON cases;
DROP POLICY IF EXISTS "Users can update own cases or admins can update all" ON cases;
DROP POLICY IF EXISTS "Users can delete own cases or admins can delete all" ON cases;

CREATE POLICY "Users can view own cases or admins can view all" ON cases
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() AND r.name = 'admin'
        )
    );

CREATE POLICY "Users can insert own cases" ON cases
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own cases or admins can update all" ON cases
    FOR UPDATE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() AND r.name = 'admin'
        )
    )
    WITH CHECK (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() AND r.name = 'admin'
        )
    );

CREATE POLICY "Users can delete own cases or admins can delete all" ON cases
    FOR DELETE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM user_profiles up
            JOIN roles r ON up.role_id = r.id
            WHERE up.id = auth.uid() AND r.name = 'admin'
        )
    );
