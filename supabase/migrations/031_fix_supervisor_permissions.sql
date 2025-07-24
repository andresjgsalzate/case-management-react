-- Migración para ajustar permisos del rol supervisor
-- Fecha: 2025-07-24
-- Descripción: Quitar permisos de gestión del supervisor para aplicaciones, dejando solo lectura

-- Eliminar permisos de gestión específicos del rol supervisor para aplicaciones  
DELETE FROM "public"."role_permissions"
WHERE role_id = (SELECT id FROM "public"."roles" WHERE name = 'supervisor')
  AND permission_id IN (
    -- Quitar específicamente los permisos que tiene actualmente
    SELECT id FROM "public"."permissions" 
    WHERE name IN ('aplicaciones.create', 'aplicaciones.update')
  );
