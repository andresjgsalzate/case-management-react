-- ========================================
-- SISTEMA DE CONFIGURACIÓN DE EMAILS
-- ========================================

-- 1. Tabla de configuraciones del sistema
CREATE TABLE IF NOT EXISTS system_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category VARCHAR(100) NOT NULL, -- 'email', 'smtp', 'urls', etc.
    key VARCHAR(255) NOT NULL,
    value TEXT NOT NULL,
    data_type VARCHAR(50) DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_editable BOOLEAN DEFAULT true, -- false para configs críticas
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    
    UNIQUE(category, key)
);

-- 2. Tabla de templates de email
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_type VARCHAR(100) NOT NULL, -- 'confirmation', 'invitation', 'magic_link', etc.
    template_name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables JSONB DEFAULT '[]', -- Array de variables disponibles
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false, -- Template por defecto para el tipo
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id),
    updated_by UUID REFERENCES user_profiles(id),
    
    UNIQUE(template_type, template_name)
);

-- 3. Tabla de historial de emails enviados
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email_type VARCHAR(100) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500),
    template_id UUID REFERENCES email_templates(id),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'delivered'
    error_message TEXT,
    metadata JSONB DEFAULT '{}', -- Datos adicionales como variables usadas
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES user_profiles(id)
);

-- ========================================
-- PERMISOS PARA CONFIGURACIÓN DE EMAILS
-- ========================================

-- Agregar permisos específicos para emails (adaptado a la estructura existente)
INSERT INTO permissions (name, description, resource, action, scope) VALUES
-- Configuraciones del sistema
('config.email.read_all', 'Ver todas las configuraciones de email', 'system_configurations', 'read', 'all'),
('config.email.write_all', 'Modificar todas las configuraciones de email', 'system_configurations', 'write', 'all'),
('config.email.delete_all', 'Eliminar configuraciones de email', 'system_configurations', 'delete', 'all'),

-- Templates de email
('email_templates.read_all', 'Ver todos los templates de email', 'email_templates', 'read', 'all'),
('email_templates.write_all', 'Crear y modificar templates de email', 'email_templates', 'write', 'all'),
('email_templates.delete_all', 'Eliminar templates de email', 'email_templates', 'delete', 'all'),

-- Envío de emails
('emails.send_all', 'Enviar emails usando el sistema', 'email_sending', 'send', 'all'),
('emails.send_invitations', 'Enviar invitaciones de usuario', 'email_sending', 'send_invitations', 'all'),
('emails.send_notifications', 'Enviar notificaciones por email', 'email_sending', 'send_notifications', 'all'),

-- Logs de email
('email_logs.read_all', 'Ver logs de emails enviados', 'email_logs', 'read', 'all')
ON CONFLICT (name) DO NOTHING;

-- ========================================
-- CONFIGURACIONES INICIALES
-- ========================================

-- Configuraciones SMTP
INSERT INTO system_configurations (category, key, value, data_type, description, is_editable) VALUES
('smtp', 'host', 'smtp.hostinger.com', 'string', 'Servidor SMTP', true),
('smtp', 'port', '465', 'number', 'Puerto SMTP', true),
('smtp', 'sender_email', 'case-management@andrejgalzate.com', 'string', 'Email remitente', true),
('smtp', 'sender_name', 'Case Management', 'string', 'Nombre del remitente', true),
('smtp', 'use_ssl', 'true', 'boolean', 'Usar SSL/TLS', true),

-- URLs de la aplicación
('urls', 'base_url_production', 'https://case-management-ctl.netlify.app', 'string', 'URL base en producción', true),
('urls', 'base_url_development', 'http://localhost:5173', 'string', 'URL base en desarrollo', true),
('urls', 'callback_path', '/auth/callback', 'string', 'Ruta de callback de autenticación', true),
('urls', 'reset_password_path', '/reset-password', 'string', 'Ruta de reset de contraseña', true),

-- Configuraciones de rate limiting
('email_limits', 'confirmation_emails_per_hour', '5', 'number', 'Máximo emails de confirmación por hora', true),
('email_limits', 'magic_links_per_hour', '3', 'number', 'Máximo magic links por hora', true),
('email_limits', 'password_resets_per_hour', '3', 'number', 'Máximo resets de contraseña por hora', true),
('email_limits', 'invitations_per_hour', '10', 'number', 'Máximo invitaciones por hora', true),
('email_limits', 'min_interval_seconds', '60', 'number', 'Intervalo mínimo entre emails (segundos)', true),

-- Configuraciones de templates
('template_config', 'default_expiration_hours', '24', 'number', 'Horas de expiración por defecto para tokens', true),
('template_config', 'magic_link_expiration_hours', '1', 'number', 'Horas de expiración para magic links', true),
('template_config', 'invitation_expiration_hours', '72', 'number', 'Horas de expiración para invitaciones', true)

ON CONFLICT (category, key) DO UPDATE SET
    value = EXCLUDED.value,
    updated_at = NOW();

-- ========================================
-- TEMPLATES DE EMAIL INICIALES
-- ========================================

-- Template de confirmación de registro
INSERT INTO email_templates (template_type, template_name, subject, html_content, text_content, variables, is_default) VALUES
(
    'confirmation',
    'default_confirmation',
    'Confirma tu cuenta - {{site_name}}',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirma tu cuenta</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e40af; margin-bottom: 10px;">{{site_name}}</h1>
        <p style="color: #6b7280; font-size: 16px;">Confirma tu cuenta para comenzar</p>
    </div>
    
    <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #1f2937; margin-bottom: 15px;">¡Bienvenido{{#if user_name}}, {{user_name}}{{/if}}!</h2>
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Gracias por registrarte en {{site_name}}. Para completar tu registro y acceder a todas las funcionalidades, necesitas confirmar tu dirección de email.
        </p>
        
        <div style="text-align: center; margin: 25px 0;">
            <a href="{{confirmation_url}}" 
               style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Confirmar mi cuenta
            </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:<br>
            <span style="word-break: break-all; color: #1e40af;">{{confirmation_url}}</span>
        </p>
    </div>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Si no te registraste en nuestro sistema, puedes ignorar este email.<br>
            Este enlace expirará en {{expiration_hours}} horas por seguridad.
        </p>
    </div>
</body>
</html>',
    'Confirma tu cuenta en {{site_name}}

¡Bienvenido{{#if user_name}}, {{user_name}}{{/if}}!

Para completar tu registro, haz clic en el siguiente enlace:
{{confirmation_url}}

Este enlace expirará en {{expiration_hours}} horas.

Si no te registraste en nuestro sistema, puedes ignorar este email.',
    '["site_name", "user_name", "confirmation_url", "expiration_hours"]',
    true
),

-- Template de invitación
(
    'invitation',
    'default_invitation',
    'Invitación a {{site_name}}{{#if team_name}} - Equipo {{team_name}}{{/if}}',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invitación al sistema</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e40af; margin-bottom: 10px;">{{site_name}}</h1>
        <p style="color: #6b7280; font-size: 16px;">Has sido invitado a unirte</p>
    </div>
    
    <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #22c55e;">
        <h2 style="color: #1f2937; margin-bottom: 15px;">🎉 ¡Bienvenido al equipo!</h2>
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Has sido invitado a formar parte de {{site_name}}. 
            Tu nueva cuenta te permitirá colaborar en la gestión de casos y acceder a todas nuestras herramientas.
        </p>
        
        {{#if inviter_name}}
        <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
            <p style="margin: 0; color: #4b5563;">
                <strong>Invitado por:</strong> {{inviter_name}}<br>
                {{#if team_name}}<strong>Equipo:</strong> {{team_name}}<br>{{/if}}
                {{#if custom_message}}<strong>Mensaje:</strong> {{custom_message}}{{/if}}
            </p>
        </div>
        {{/if}}
        
        <div style="text-align: center; margin: 25px 0;">
            <a href="{{invitation_url}}" 
               style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Aceptar invitación
            </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            Al aceptar la invitación, podrás configurar tu contraseña y comenzar a usar el sistema.
        </p>
    </div>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Esta invitación es válida por {{expiration_hours}} horas.<br>
            Si no esperabas esta invitación, puedes ignorar este email.
        </p>
    </div>
</body>
</html>',
    'Invitación a {{site_name}}

¡Bienvenido al equipo!

Has sido invitado a formar parte de {{site_name}}.

{{#if inviter_name}}
Invitado por: {{inviter_name}}
{{#if team_name}}Equipo: {{team_name}}{{/if}}
{{#if custom_message}}Mensaje: {{custom_message}}{{/if}}
{{/if}}

Para aceptar la invitación, haz clic en el siguiente enlace:
{{invitation_url}}

Esta invitación es válida por {{expiration_hours}} horas.',
    '["site_name", "inviter_name", "team_name", "custom_message", "invitation_url", "expiration_hours"]',
    true
),

-- Template de magic link
(
    'magic_link',
    'default_magic_link',
    'Tu enlace de acceso - {{site_name}}',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Enlace de acceso</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e40af; margin-bottom: 10px;">{{site_name}}</h1>
        <p style="color: #6b7280; font-size: 16px;">Tu enlace de acceso está listo</p>
    </div>
    
    <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #0ea5e9;">
        <h2 style="color: #1f2937; margin-bottom: 15px;">🔐 Acceso Rápido</h2>
        <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
            Haz clic en el siguiente enlace para acceder de forma segura a tu cuenta sin necesidad de contraseña:
        </p>
        
        <div style="text-align: center; margin: 25px 0;">
            <a href="{{magic_link_url}}" 
               style="background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Acceder ahora
            </a>
        </div>
        
        {{#if otp_code}}
        <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            También puedes usar este código de verificación: 
            <strong style="background: #e0f2fe; padding: 2px 8px; border-radius: 4px; color: #0c4a6e;">{{otp_code}}</strong>
        </p>
        {{/if}}
    </div>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
            Este enlace es válido por {{expiration_hours}} hora(s) y solo puede usarse una vez.<br>
            Si no solicitaste este acceso, puedes ignorar este email.
        </p>
    </div>
</body>
</html>',
    'Enlace de acceso para {{site_name}}

Para acceder a tu cuenta, haz clic en el siguiente enlace:
{{magic_link_url}}

{{#if otp_code}}
También puedes usar este código: {{otp_code}}
{{/if}}

Este enlace es válido por {{expiration_hours}} hora(s).',
    '["site_name", "magic_link_url", "otp_code", "expiration_hours"]',
    true
)

ON CONFLICT (template_type, template_name) DO UPDATE SET
    subject = EXCLUDED.subject,
    html_content = EXCLUDED.html_content,
    text_content = EXCLUDED.text_content,
    variables = EXCLUDED.variables,
    updated_at = NOW();

-- ========================================
-- FUNCIONES AUXILIARES
-- ========================================

-- Función para obtener configuración
CREATE OR REPLACE FUNCTION get_system_config(config_category TEXT, config_key TEXT)
RETURNS TEXT AS $$
DECLARE
    config_value TEXT;
BEGIN
    SELECT value INTO config_value
    FROM system_configurations
    WHERE category = config_category 
      AND key = config_key 
      AND is_active = true;
    
    RETURN config_value;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener template activo
CREATE OR REPLACE FUNCTION get_active_email_template(template_type_param TEXT)
RETURNS email_templates AS $$
DECLARE
    template_record email_templates;
BEGIN
    SELECT * INTO template_record
    FROM email_templates
    WHERE template_type = template_type_param 
      AND is_active = true 
      AND is_default = true
    LIMIT 1;
    
    RETURN template_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- NOTA: La función get_user_permissions ya existe en el sistema

-- ========================================
-- POLÍTICAS RLS
-- ========================================

-- Habilitar RLS
ALTER TABLE system_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para system_configurations
CREATE POLICY "system_configurations_read_all" ON system_configurations
    FOR SELECT USING (
        'config.email.read_all' = ANY(get_user_permissions(auth.uid()))
    );

CREATE POLICY "system_configurations_insert" ON system_configurations
    FOR INSERT WITH CHECK (
        'config.email.write_all' = ANY(get_user_permissions(auth.uid()))
    );

CREATE POLICY "system_configurations_update" ON system_configurations
    FOR UPDATE USING (
        'config.email.write_all' = ANY(get_user_permissions(auth.uid()))
    );

CREATE POLICY "system_configurations_delete" ON system_configurations
    FOR DELETE USING (
        'config.email.delete_all' = ANY(get_user_permissions(auth.uid()))
    );

-- Políticas para email_templates
CREATE POLICY "email_templates_read_all" ON email_templates
    FOR SELECT USING (
        'email_templates.read_all' = ANY(get_user_permissions(auth.uid()))
    );

CREATE POLICY "email_templates_insert" ON email_templates
    FOR INSERT WITH CHECK (
        'email_templates.write_all' = ANY(get_user_permissions(auth.uid()))
    );

CREATE POLICY "email_templates_update" ON email_templates
    FOR UPDATE USING (
        'email_templates.write_all' = ANY(get_user_permissions(auth.uid()))
    );

CREATE POLICY "email_templates_delete" ON email_templates
    FOR DELETE USING (
        'email_templates.delete_all' = ANY(get_user_permissions(auth.uid()))
    );

-- Políticas para email_logs
CREATE POLICY "email_logs_read_all" ON email_logs
    FOR SELECT USING (
        'email_logs.read_all' = ANY(get_user_permissions(auth.uid()))
    );

CREATE POLICY "email_logs_insert" ON email_logs
    FOR INSERT WITH CHECK (
        ARRAY['emails.send_all', 'emails.send_invitations', 'emails.send_notifications'] && get_user_permissions(auth.uid())
    );

-- ========================================
-- TRIGGERS
-- ========================================

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    -- Solo actualizar updated_by si existe en la tabla y el usuario está autenticado
    IF TG_TABLE_NAME IN ('system_configurations', 'email_templates') AND auth.uid() IS NOT NULL THEN
        -- Buscar el user_profile correspondiente al auth.uid()
        SELECT id INTO NEW.updated_by 
        FROM user_profiles 
        WHERE id = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para establecer created_by al insertar
CREATE OR REPLACE FUNCTION set_created_by_column()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo establecer created_by si existe en la tabla y el usuario está autenticado
    IF TG_TABLE_NAME IN ('system_configurations', 'email_templates', 'email_logs') AND auth.uid() IS NOT NULL THEN
        -- Buscar el user_profile correspondiente al auth.uid()
        SELECT id INTO NEW.created_by 
        FROM user_profiles 
        WHERE id = auth.uid();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_system_configurations_updated_at
    BEFORE UPDATE ON system_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers para establecer created_by
CREATE TRIGGER set_system_configurations_created_by
    BEFORE INSERT ON system_configurations
    FOR EACH ROW EXECUTE FUNCTION set_created_by_column();

CREATE TRIGGER set_email_templates_created_by
    BEFORE INSERT ON email_templates
    FOR EACH ROW EXECUTE FUNCTION set_created_by_column();

CREATE TRIGGER set_email_logs_created_by
    BEFORE INSERT ON email_logs
    FOR EACH ROW EXECUTE FUNCTION set_created_by_column();

-- ========================================
-- COMENTARIOS
-- ========================================

COMMENT ON TABLE system_configurations IS 'Configuraciones parametrizables del sistema de emails';
COMMENT ON TABLE email_templates IS 'Templates de email personalizables';
COMMENT ON TABLE email_logs IS 'Historial de emails enviados';

COMMENT ON COLUMN system_configurations.category IS 'Categoría de configuración: smtp, urls, email_limits, etc.';
COMMENT ON COLUMN system_configurations.key IS 'Clave única dentro de la categoría';
COMMENT ON COLUMN system_configurations.data_type IS 'Tipo de dato para validación: string, number, boolean, json';
COMMENT ON COLUMN system_configurations.is_editable IS 'Si false, no se puede modificar desde la interfaz';

COMMENT ON COLUMN email_templates.template_type IS 'Tipo de template: confirmation, invitation, magic_link, etc.';
COMMENT ON COLUMN email_templates.variables IS 'Array JSON de variables disponibles para el template';
COMMENT ON COLUMN email_templates.is_default IS 'Template por defecto para el tipo (solo uno puede ser default)';

-- Fin del script
SELECT 'Sistema de configuración de emails creado exitosamente' as status;
