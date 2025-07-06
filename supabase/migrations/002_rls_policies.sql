-- Datos semilla y configuración RLS
-- Versión: 2.1.0

-- Habilitar RLS en todas las tablas
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_status_control ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_time_entries ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_profiles
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los admins y supervisores pueden ver todos los perfiles" ON user_profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role_name IN ('admin', 'supervisor')
            AND up.is_active = true
        )
    );

CREATE POLICY "Los admins pueden actualizar perfiles" ON user_profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.role_name = 'admin'
            AND up.is_active = true
        )
    );

CREATE POLICY "Permitir inserción de nuevos perfiles durante registro" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas RLS para cases
CREATE POLICY "Los analistas solo pueden ver sus propios casos" ON cases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND (
                (up.role_name = 'analista' AND cases.created_by = auth.uid()) OR
                up.role_name IN ('admin', 'supervisor')
            )
            AND up.is_active = true
        )
    );

CREATE POLICY "Los usuarios pueden crear casos" ON cases
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
    );

CREATE POLICY "Los usuarios pueden actualizar casos según su rol" ON cases
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND (
                (up.role_name = 'analista' AND cases.created_by = auth.uid()) OR
                up.role_name IN ('admin', 'supervisor')
            )
            AND up.is_active = true
        )
    );

-- Políticas RLS para case_status_control
CREATE POLICY "Ver control de casos según rol" ON case_status_control
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN cases c ON case_status_control.case_id = c.id
            WHERE up.id = auth.uid() 
            AND (
                (up.role_name = 'analista' AND (c.created_by = auth.uid() OR case_status_control.assigned_user_id = auth.uid())) OR
                up.role_name IN ('admin', 'supervisor')
            )
            AND up.is_active = true
        )
    );

CREATE POLICY "Crear control de casos" ON case_status_control
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
    );

CREATE POLICY "Actualizar control de casos según rol" ON case_status_control
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN cases c ON case_status_control.case_id = c.id
            WHERE up.id = auth.uid() 
            AND (
                (up.role_name = 'analista' AND (c.created_by = auth.uid() OR case_status_control.assigned_user_id = auth.uid())) OR
                up.role_name IN ('admin', 'supervisor')
            )
            AND up.is_active = true
        )
    );

-- Políticas RLS para case_time_entries
CREATE POLICY "Ver entradas de tiempo según rol" ON case_time_entries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN case_status_control csc ON case_time_entries.case_control_id = csc.id
            JOIN cases c ON csc.case_id = c.id
            WHERE up.id = auth.uid() 
            AND (
                (up.role_name = 'analista' AND (c.created_by = auth.uid() OR csc.assigned_user_id = auth.uid())) OR
                up.role_name IN ('admin', 'supervisor')
            )
            AND up.is_active = true
        )
    );

CREATE POLICY "Crear entradas de tiempo" ON case_time_entries
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            WHERE up.id = auth.uid() 
            AND up.is_active = true
        )
    );

CREATE POLICY "Actualizar entradas de tiempo según rol" ON case_time_entries
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM user_profiles up 
            JOIN case_status_control csc ON case_time_entries.case_control_id = csc.id
            JOIN cases c ON csc.case_id = c.id
            WHERE up.id = auth.uid() 
            AND (
                (up.role_name = 'analista' AND (c.created_by = auth.uid() OR csc.assigned_user_id = auth.uid())) OR
                up.role_name IN ('admin', 'supervisor')
            )
            AND up.is_active = true
        )
    );
