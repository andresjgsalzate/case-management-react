-- Script para poblar datos iniciales de origen y aplicación
-- Ejecutar en el Editor SQL de Supabase

-- Insertar orígenes de ejemplo
INSERT INTO public.origenes (nombre, descripcion, activo) VALUES
('Mesa de Ayuda', 'Casos reportados a través de la mesa de ayuda', true),
('Email Soporte', 'Casos recibidos por email de soporte', true),
('Chat en Vivo', 'Casos iniciados desde el chat en vivo', true),
('Teléfono', 'Casos reportados por llamada telefónica', true),
('Portal Web', 'Casos creados desde el portal web', true),
('Aplicación Móvil', 'Casos reportados desde la app móvil', true),
('Sistema Interno', 'Casos generados internamente', true),
('Redes Sociales', 'Casos reportados en redes sociales', true)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar aplicaciones de ejemplo
INSERT INTO public.aplicaciones (nombre, descripcion, activo) VALUES
('CRM Principal', 'Sistema de gestión de clientes principal', true),
('ERP Financiero', 'Sistema de planificación de recursos empresariales', true),
('Portal Cliente', 'Portal de autoservicio para clientes', true),
('App Móvil', 'Aplicación móvil para clientes', true),
('Sistema Contable', 'Sistema de contabilidad y facturación', true),
('Base de Datos', 'Problemas relacionados con la base de datos', true),
('Servidor Web', 'Problemas del servidor web y aplicaciones', true),
('Sistema de Pagos', 'Pasarela de pagos y procesamiento', true),
('Reportes BI', 'Sistema de business intelligence y reportes', true),
('Sistema de Inventario', 'Control de inventario y almacén', true),
('HR Management', 'Sistema de recursos humanos', true),
('Sistema de Backup', 'Sistema de respaldos y recuperación', true)
ON CONFLICT (nombre) DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT 'Orígenes insertados:' as tipo, count(*) as cantidad FROM public.origenes WHERE activo = true
UNION ALL
SELECT 'Aplicaciones insertadas:' as tipo, count(*) as cantidad FROM public.aplicaciones WHERE activo = true;
