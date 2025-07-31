-- Create disposiciones_scripts table
CREATE TABLE public.disposiciones_scripts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    fecha DATE NOT NULL,
    case_id UUID NOT NULL REFERENCES public.cases(id) ON DELETE CASCADE,
    nombre_script TEXT NOT NULL,
    numero_revision_svn TEXT,
    aplicacion_id UUID NOT NULL REFERENCES public.aplicaciones(id) ON DELETE RESTRICT,
    observaciones TEXT,
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes
CREATE INDEX idx_disposiciones_scripts_fecha ON public.disposiciones_scripts(fecha);
CREATE INDEX idx_disposiciones_scripts_case_id ON public.disposiciones_scripts(case_id);
CREATE INDEX idx_disposiciones_scripts_aplicacion_id ON public.disposiciones_scripts(aplicacion_id);
CREATE INDEX idx_disposiciones_scripts_created_at ON public.disposiciones_scripts(created_at);
CREATE INDEX idx_disposiciones_scripts_year_month ON public.disposiciones_scripts(DATE_PART('year', fecha), DATE_PART('month', fecha));

-- Create updated_at trigger (only if function doesn't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE OR REPLACE FUNCTION public.update_updated_at_column()
        RETURNS TRIGGER AS $trigger$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $trigger$ language 'plpgsql';
    END IF;
END $$;

CREATE TRIGGER update_disposiciones_scripts_updated_at 
    BEFORE UPDATE ON public.disposiciones_scripts 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert new permissions for disposiciones Scripts
INSERT INTO public.permissions (name, resource, action, description) VALUES
('disposiciones_scripts:create', 'disposiciones_scripts', 'create', 'Crear disposiciones Scripts'),
('disposiciones_scripts:read', 'disposiciones_scripts', 'read', 'Ver disposiciones Scripts'),
('disposiciones_scripts:update', 'disposiciones_scripts', 'update', 'Actualizar disposiciones Scripts'),
('disposiciones_scripts:delete', 'disposiciones_scripts', 'delete', 'Eliminar disposiciones Scripts'),
('disposiciones_scripts:export', 'disposiciones_scripts', 'export', 'Exportar disposiciones Scripts');

-- Grant permissions to admin role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin'
  AND p.resource = 'disposiciones_scripts'
  AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Grant read and create permissions to user role
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT 
    r.id as role_id,
    p.id as permission_id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'user'
  AND p.resource = 'disposiciones_scripts'
  AND p.action IN ('create', 'read')
  AND NOT EXISTS (
    SELECT 1 FROM public.role_permissions rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Enable RLS
ALTER TABLE public.disposiciones_scripts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all disposiciones_scripts" ON public.disposiciones_scripts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.role_permissions rp ON up.role_id = rp.role_id
            JOIN public.permissions p ON rp.permission_id = p.id
            WHERE up.id = auth.uid()
              AND p.resource = 'disposiciones_scripts'
              AND p.action = 'read'
        )
    );

CREATE POLICY "Users can create disposiciones_scripts" ON public.disposiciones_scripts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.role_permissions rp ON up.role_id = rp.role_id
            JOIN public.permissions p ON rp.permission_id = p.id
            WHERE up.id = auth.uid()
              AND p.resource = 'disposiciones_scripts'
              AND p.action = 'create'
        )
    );

CREATE POLICY "Users can update their own disposiciones_scripts or with permission" ON public.disposiciones_scripts
    FOR UPDATE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.role_permissions rp ON up.role_id = rp.role_id
            JOIN public.permissions p ON rp.permission_id = p.id
            WHERE up.id = auth.uid()
              AND p.resource = 'disposiciones_scripts'
              AND p.action = 'update'
        )
    );

CREATE POLICY "Users can delete their own disposiciones_scripts or with permission" ON public.disposiciones_scripts
    FOR DELETE USING (
        created_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.user_profiles up
            JOIN public.role_permissions rp ON up.role_id = rp.role_id
            JOIN public.permissions p ON rp.permission_id = p.id
            WHERE up.id = auth.uid()
              AND p.resource = 'disposiciones_scripts'
              AND p.action = 'delete'
        )
    );

-- Add comments for documentation
COMMENT ON TABLE public.disposiciones_scripts IS 'Tabla para gestionar solicitudes de disposición de scripts en aplicaciones';
COMMENT ON COLUMN public.disposiciones_scripts.fecha IS 'Fecha de la disposición';
COMMENT ON COLUMN public.disposiciones_scripts.case_id IS 'Referencia al caso relacionado';
COMMENT ON COLUMN public.disposiciones_scripts.nombre_script IS 'Nombre del script a desplegar';
COMMENT ON COLUMN public.disposiciones_scripts.numero_revision_svn IS 'Número de revisión SVN del script';
COMMENT ON COLUMN public.disposiciones_scripts.aplicacion_id IS 'Referencia a la aplicación donde se aplica';
COMMENT ON COLUMN public.disposiciones_scripts.observaciones IS 'Observaciones adicionales sobre la disposición';
