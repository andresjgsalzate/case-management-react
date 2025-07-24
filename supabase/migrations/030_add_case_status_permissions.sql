-- Migración para agregar permisos específicos para gestión de estados de control
-- Fecha: 2025-07-24
-- Descripción: Agregar permisos granulares para la gestión de estados de control de casos

-- Insertar nuevos permisos para estados de control
INSERT INTO "public"."permissions" ("id", "name", "description", "resource", "action", "is_active", "created_at", "updated_at") VALUES
  (
    gen_random_uuid(),
    'case_statuses.read',
    'Ver estados de control de casos',
    'case_statuses',
    'read',
    true,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  ),
  (
    gen_random_uuid(),
    'case_statuses.create',
    'Crear nuevos estados de control',
    'case_statuses',
    'create',
    true,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  ),
  (
    gen_random_uuid(),
    'case_statuses.update',
    'Actualizar estados de control existentes',
    'case_statuses',
    'update',
    true,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  ),
  (
    gen_random_uuid(),
    'case_statuses.delete',
    'Eliminar estados de control',
    'case_statuses',
    'delete',
    true,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  ),
  (
    gen_random_uuid(),
    'case_statuses.manage',
    'Gestión completa de estados de control',
    'case_statuses',
    'manage',
    true,
    timezone('utc'::text, now()),
    timezone('utc'::text, now())
  );

-- Asignar permisos completos al rol admin
INSERT INTO "public"."role_permissions" ("role_id", "permission_id", "created_at")
SELECT 
  r.id as role_id,
  p.id as permission_id,
  timezone('utc'::text, now()) as created_at
FROM "public"."roles" r
CROSS JOIN "public"."permissions" p
WHERE r.name = 'admin' 
  AND p.resource = 'case_statuses'
  AND NOT EXISTS (
    SELECT 1 FROM "public"."role_permissions" rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Asignar permisos de solo lectura al rol supervisor por defecto
INSERT INTO "public"."role_permissions" ("role_id", "permission_id", "created_at")
SELECT 
  r.id as role_id,
  p.id as permission_id,
  timezone('utc'::text, now()) as created_at
FROM "public"."roles" r
CROSS JOIN "public"."permissions" p
WHERE r.name = 'supervisor' 
  AND p.name = 'case_statuses.read'
  AND NOT EXISTS (
    SELECT 1 FROM "public"."role_permissions" rp 
    WHERE rp.role_id = r.id AND rp.permission_id = p.id
  );

-- Comentarios para documentar los nuevos permisos
COMMENT ON TABLE "public"."permissions" IS 'Permisos del sistema incluyendo gestión de estados de control';

-- Verificar que se insertaron correctamente
DO $$
DECLARE
    perm_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO perm_count
    FROM "public"."permissions"
    WHERE resource = 'case_statuses';
    
    IF perm_count = 5 THEN
        RAISE NOTICE 'Permisos de estados de control creados exitosamente: % permisos', perm_count;
    ELSE
        RAISE WARNING 'Se esperaban 5 permisos pero se encontraron: %', perm_count;
    END IF;
END $$;
