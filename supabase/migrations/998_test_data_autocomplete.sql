-- =====================================================
-- DATOS DE PRUEBA: CASOS PARA AUTOCOMPLETADO
-- =====================================================
-- Descripción: Datos de prueba para probar la funcionalidad
-- de autocompletado de casos
-- Fecha: 4 de Agosto, 2025
-- =====================================================

-- Insertar casos activos de prueba
INSERT INTO casos (
  id,
  numero_caso,
  descripcion,
  classification,
  status,
  priority,
  created_by,
  created_at
) VALUES
  (
    gen_random_uuid(),
    'CASO-2025-001',
    'Problema con el sistema de autenticación de usuarios',
    'technical',
    'active',
    'high',
    (SELECT id FROM auth.users LIMIT 1),
    NOW()
  ),
  (
    gen_random_uuid(),
    'CASO-2025-002',
    'Error en la generación de reportes mensuales',
    'bug',
    'active',
    'medium',
    (SELECT id FROM auth.users LIMIT 1),
    NOW()
  ),
  (
    gen_random_uuid(),
    'CASO-2025-003',
    'Solicitud de nueva funcionalidad para el módulo de casos',
    'feature',
    'active',
    'low',
    (SELECT id FROM auth.users LIMIT 1),
    NOW()
  ),
  (
    gen_random_uuid(),
    'HELP-2025-001',
    'Usuario no puede acceder al sistema después del cambio de contraseña',
    'support',
    'active',
    'high',
    (SELECT id FROM auth.users LIMIT 1),
    NOW()
  ),
  (
    gen_random_uuid(),
    'BUG-2025-001',
    'La página se queda en blanco al cargar la documentación',
    'bug',
    'active',
    'critical',
    (SELECT id FROM auth.users LIMIT 1),
    NOW()
  ),
  (
    gen_random_uuid(),
    'FEAT-2025-001',
    'Implementar búsqueda avanzada con filtros múltiples',
    'feature',
    'active',
    'medium',
    (SELECT id FROM auth.users LIMIT 1),
    NOW()
  )
ON CONFLICT (numero_caso) DO NOTHING;

-- Insertar casos archivados de prueba
INSERT INTO archived_cases (
  id,
  case_number,
  description,
  classification,
  status,
  priority,
  archive_reason,
  created_by,
  archived_by,
  created_at,
  archived_at
) VALUES
  (
    gen_random_uuid(),
    'CASO-2024-100',
    'Migración de base de datos completada exitosamente',
    'maintenance',
    'completed',
    'high',
    'completed',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    NOW() - INTERVAL '6 months',
    NOW() - INTERVAL '3 months'
  ),
  (
    gen_random_uuid(),
    'CASO-2024-099',
    'Actualización del sistema de seguridad',
    'security',
    'completed',
    'critical',
    'completed',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    NOW() - INTERVAL '8 months',
    NOW() - INTERVAL '4 months'
  ),
  (
    gen_random_uuid(),
    'HELP-2024-050',
    'Capacitación de usuarios nuevos en el sistema',
    'training',
    'completed',
    'medium',
    'completed',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    NOW() - INTERVAL '1 year',
    NOW() - INTERVAL '6 months'
  ),
  (
    gen_random_uuid(),
    'BUG-2024-025',
    'Corrección de error en el cálculo de tiempos',
    'bug',
    'completed',
    'high',
    'completed',
    (SELECT id FROM auth.users LIMIT 1),
    (SELECT id FROM auth.users LIMIT 1),
    NOW() - INTERVAL '10 months',
    NOW() - INTERVAL '8 months'
  )
ON CONFLICT (case_number) DO NOTHING;

-- Comentario sobre los datos insertados
COMMENT ON TABLE casos IS 'Tabla actualizada con datos de prueba para autocompletado';
COMMENT ON TABLE archived_cases IS 'Tabla actualizada con datos de prueba para autocompletado';
