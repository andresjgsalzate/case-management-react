

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'Schema público con políticas RLS dinámicas basadas en el sistema de permisos';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."admin_create_aplicacion"("aplicacion_name" "text", "aplicacion_description" "text", "is_active" boolean DEFAULT true) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result_aplicacion JSON;
  new_aplicacion_id UUID;
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Insertar la nueva aplicación
  INSERT INTO aplicaciones (nombre, descripcion, activo)
  VALUES (aplicacion_name, aplicacion_description, is_active)
  RETURNING id INTO new_aplicacion_id;
  
  -- Retornar la aplicación creada
  SELECT json_build_object(
    'id', id,
    'nombre', nombre,
    'descripcion', descripcion,
    'activo', activo,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO result_aplicacion
  FROM aplicaciones WHERE id = new_aplicacion_id;
  
  RETURN result_aplicacion;
END;
$$;


ALTER FUNCTION "public"."admin_create_aplicacion"("aplicacion_name" "text", "aplicacion_description" "text", "is_active" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_create_origen"("origen_name" "text", "origen_description" "text", "is_active" boolean DEFAULT true) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result_origen JSON;
  new_origen_id UUID;
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Insertar el nuevo origen
  INSERT INTO origenes (nombre, descripcion, activo)
  VALUES (origen_name, origen_description, is_active)
  RETURNING id INTO new_origen_id;
  
  -- Retornar el origen creado
  SELECT json_build_object(
    'id', id,
    'nombre', nombre,
    'descripcion', descripcion,
    'activo', activo,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO result_origen
  FROM origenes WHERE id = new_origen_id;
  
  RETURN result_origen;
END;
$$;


ALTER FUNCTION "public"."admin_create_origen"("origen_name" "text", "origen_description" "text", "is_active" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_create_permission"("permission_name" "text", "permission_description" "text", "permission_resource" "text", "permission_action" "text", "is_active" boolean DEFAULT true) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result_permission JSON;
  new_permission_id UUID;
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Insertar el nuevo permiso
  INSERT INTO permissions (name, description, resource, action, is_active)
  VALUES (permission_name, permission_description, permission_resource, permission_action, is_active)
  RETURNING id INTO new_permission_id;
  
  -- Retornar el permiso creado
  SELECT json_build_object(
    'id', id,
    'name', name,
    'description', description,
    'resource', resource,
    'action', action,
    'is_active', is_active,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO result_permission
  FROM permissions WHERE id = new_permission_id;
  
  RETURN result_permission;
END;
$$;


ALTER FUNCTION "public"."admin_create_permission"("permission_name" "text", "permission_description" "text", "permission_resource" "text", "permission_action" "text", "is_active" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_delete_aplicacion"("aplicacion_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Eliminar la aplicación
  DELETE FROM aplicaciones WHERE id = aplicacion_id;
  
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."admin_delete_aplicacion"("aplicacion_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_delete_origen"("origen_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Eliminar el origen
  DELETE FROM origenes WHERE id = origen_id;
  
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."admin_delete_origen"("origen_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_delete_permission"("permission_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Primero eliminar las asignaciones de roles
  DELETE FROM role_permissions WHERE permission_id = permission_id;
  
  -- Luego eliminar el permiso
  DELETE FROM permissions WHERE id = permission_id;
  
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."admin_delete_permission"("permission_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_delete_user"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Eliminar el perfil de usuario
  DELETE FROM user_profiles WHERE id = user_id;
  
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."admin_delete_user"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_update_aplicacion"("aplicacion_id" "uuid", "aplicacion_name" "text", "aplicacion_description" "text", "is_active" boolean DEFAULT true) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result_aplicacion JSON;
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Actualizar la aplicación (resolver ambiguedad con nombre de función)
  UPDATE aplicaciones 
  SET 
    nombre = aplicacion_name,
    descripcion = aplicacion_description,
    activo = admin_update_aplicacion.is_active,
    updated_at = NOW()
  WHERE id = aplicacion_id;
  
  -- Retornar la aplicación actualizada
  SELECT json_build_object(
    'id', id,
    'nombre', nombre,
    'descripcion', descripcion,
    'activo', activo,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO result_aplicacion
  FROM aplicaciones WHERE id = aplicacion_id;
  
  RETURN result_aplicacion;
END;
$$;


ALTER FUNCTION "public"."admin_update_aplicacion"("aplicacion_id" "uuid", "aplicacion_name" "text", "aplicacion_description" "text", "is_active" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_update_origen"("origen_id" "uuid", "origen_name" "text", "origen_description" "text", "is_active" boolean DEFAULT true) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result_origen JSON;
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
   
  -- Actualizar el origen (resolver ambiguedad con nombre de función)
  UPDATE origenes 
  SET 
    nombre = origen_name,
    descripcion = origen_description,
    activo = admin_update_origen.is_active,
    updated_at = NOW()
  WHERE id = origen_id;
  
  -- Retornar el origen actualizado
  SELECT json_build_object(
    'id', id,
    'nombre', nombre,
    'descripcion', descripcion,
    'activo', activo,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO result_origen
  FROM origenes WHERE id = origen_id;
  
  RETURN result_origen;
END;
$$;


ALTER FUNCTION "public"."admin_update_origen"("origen_id" "uuid", "origen_name" "text", "origen_description" "text", "is_active" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_update_permission"("permission_id" "uuid", "permission_name" "text", "permission_description" "text", "permission_resource" "text", "permission_action" "text", "is_active" boolean DEFAULT true) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result_permission JSON;
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Actualizar el permiso (resolver ambiguedad con nombre de función)
  UPDATE permissions 
  SET 
    name = permission_name,
    description = permission_description,
    resource = permission_resource,
    action = permission_action,
    is_active = admin_update_permission.is_active,
    updated_at = NOW()
  WHERE id = permission_id;
  
  -- Retornar el permiso actualizado
  SELECT json_build_object(
    'id', id,
    'name', name,
    'description', description,
    'resource', resource,
    'action', action,
    'is_active', is_active,
    'created_at', created_at,
    'updated_at', updated_at
  ) INTO result_permission
  FROM permissions WHERE id = permission_id;
  
  RETURN result_permission;
END;
$$;


ALTER FUNCTION "public"."admin_update_permission"("permission_id" "uuid", "permission_name" "text", "permission_description" "text", "permission_resource" "text", "permission_action" "text", "is_active" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_update_role"("role_id" "uuid", "role_name" "text", "role_description" "text", "is_active" boolean DEFAULT true, "permission_ids" "uuid"[] DEFAULT NULL::"uuid"[]) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result_role JSON;
  perm_id UUID;
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Actualizar el rol (resolver ambiguedad con nombre de función)
  UPDATE roles 
  SET 
    name = role_name,
    description = role_description,
    is_active = admin_update_role.is_active,
    updated_at = NOW()
  WHERE id = role_id;
  
  -- Si se proporcionaron permisos, actualizar las asignaciones
  IF permission_ids IS NOT NULL THEN
    -- Eliminar permisos existentes
    DELETE FROM role_permissions WHERE role_permissions.role_id = admin_update_role.role_id;
    
    -- Agregar nuevos permisos
    FOREACH perm_id IN ARRAY permission_ids
    LOOP
      INSERT INTO role_permissions (role_id, permission_id) 
      VALUES (admin_update_role.role_id, perm_id);
    END LOOP;
  END IF;
  
  -- Retornar el rol actualizado con permisos
  SELECT json_build_object(
    'id', r.id,
    'name', r.name,
    'description', r.description,
    'is_active', r.is_active,
    'created_at', r.created_at,
    'updated_at', r.updated_at,
    'permissions', COALESCE(
      (SELECT json_agg(
        json_build_object(
          'id', p.id,
          'name', p.name,
          'description', p.description,
          'resource', p.resource,
          'action', p.action,
          'is_active', p.is_active
        )
      ) FROM role_permissions rp 
      JOIN permissions p ON rp.permission_id = p.id 
      WHERE rp.role_id = r.id), '[]'::json
    )
  ) INTO result_role
  FROM roles r WHERE r.id = role_id;
  
  RETURN result_role;
END;
$$;


ALTER FUNCTION "public"."admin_update_role"("role_id" "uuid", "role_name" "text", "role_description" "text", "is_active" boolean, "permission_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."admin_update_user"("user_id" "uuid", "user_email" "text", "user_full_name" "text", "user_role_id" "uuid", "is_active" boolean DEFAULT true) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result_user JSON;
BEGIN
  -- Verificar que el usuario actual sea admin
  IF NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Solo los administradores pueden ejecutar esta función';
  END IF;
  
  -- Actualizar el usuario (resolver ambiguedad con nombre de función)
  UPDATE user_profiles 
  SET 
    email = user_email,
    full_name = user_full_name,
    role_id = user_role_id,
    is_active = admin_update_user.is_active,
    updated_at = NOW()
  WHERE id = user_id;
  
  -- Retornar el usuario actualizado con rol
  SELECT json_build_object(
    'id', up.id,
    'email', up.email,
    'full_name', up.full_name,
    'role_id', up.role_id,
    'is_active', up.is_active,
    'last_login_at', up.last_login_at,
    'created_at', up.created_at,
    'updated_at', up.updated_at,
    'role', CASE 
      WHEN r.id IS NOT NULL THEN json_build_object(
        'id', r.id,
        'name', r.name,
        'description', r.description,
        'is_active', r.is_active,
        'created_at', r.created_at,
        'updated_at', r.updated_at
      )
      ELSE NULL
    END
  ) INTO result_user
  FROM user_profiles up
  LEFT JOIN roles r ON up.role_id = r.id
  WHERE up.id = user_id;
  
  RETURN result_user;
END;
$$;


ALTER FUNCTION "public"."admin_update_user"("user_id" "uuid", "user_email" "text", "user_full_name" "text", "user_role_id" "uuid", "is_active" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."archive_audit_trigger"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Para casos archivados
  IF TG_TABLE_NAME = 'archived_cases' THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO archive_audit_log (action_type, item_type, item_id, user_id)
      VALUES ('ARCHIVE', 'CASE', NEW.original_case_id, NEW.archived_by);
    ELSIF TG_OP = 'UPDATE' AND OLD.is_restored = false AND NEW.is_restored = true THEN
      INSERT INTO archive_audit_log (action_type, item_type, item_id, user_id)
      VALUES ('RESTORE', 'CASE', NEW.original_case_id, NEW.restored_by);
    END IF;
  END IF;
  
  -- Para TODOs archivados
  IF TG_TABLE_NAME = 'archived_todos' THEN
    IF TG_OP = 'INSERT' THEN
      INSERT INTO archive_audit_log (action_type, item_type, item_id, user_id)
      VALUES ('ARCHIVE', 'TODO', NEW.original_todo_id, NEW.archived_by);
    ELSIF TG_OP = 'UPDATE' AND OLD.is_restored = false AND NEW.is_restored = true THEN
      INSERT INTO archive_audit_log (action_type, item_type, item_id, user_id)
      VALUES ('RESTORE', 'TODO', NEW.original_todo_id, NEW.restored_by);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."archive_audit_trigger"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."archive_case"("p_case_id" "uuid", "p_archived_by" "uuid", "p_reason" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_archived_id uuid;
    v_case_data JSONB;
    v_control_data JSONB;
    v_case_number character varying;
    v_description TEXT;
    v_classification character varying;
    v_total_time INTEGER;
    v_completed_at TIMESTAMPTZ;
    v_control_id uuid;
    v_time_entries JSONB;
    v_manual_entries JSONB;
BEGIN
    -- Obtener datos del caso y control
    SELECT 
        c.numero_caso,
        c.descripcion,
        c.clasificacion,
        COALESCE(cc.total_time_minutes, 0),
        cc.completed_at,
        cc.id,
        row_to_json(c.*),
        row_to_json(cc.*)
    INTO 
        v_case_number,
        v_description,
        v_classification,
        v_total_time,
        v_completed_at,
        v_control_id,
        v_case_data,
        v_control_data
    FROM cases c
    LEFT JOIN case_control cc ON c.id = cc.case_id
    WHERE c.id = p_case_id;
    
    -- Verificar que el caso existe y está terminado
    IF NOT FOUND OR v_completed_at IS NULL THEN
        RAISE EXCEPTION 'Case not found or not completed';
    END IF;
    
    -- Obtener entradas de tiempo automáticas si existe control
    IF v_control_id IS NOT NULL THEN
        SELECT COALESCE(jsonb_agg(te.*), '[]'::jsonb)
        INTO v_time_entries
        FROM time_entries te
        WHERE te.case_control_id = v_control_id;
        
        -- Obtener entradas de tiempo manual
        SELECT COALESCE(jsonb_agg(mte.*), '[]'::jsonb)
        INTO v_manual_entries
        FROM manual_time_entries mte
        WHERE mte.case_control_id = v_control_id;
        
        -- Agregar las entradas de tiempo al control_data
        v_control_data = v_control_data || jsonb_build_object(
            'time_entries', v_time_entries,
            'manual_time_entries', v_manual_entries
        );
    END IF;
    
    -- Insertar en archivo
    INSERT INTO archived_cases (
        original_case_id,
        case_number,
        description,
        classification,
        total_time_minutes,
        completed_at,
        archived_by,
        archive_reason,
        original_data,
        control_data
    ) VALUES (
        p_case_id,
        v_case_number,
        v_description,
        v_classification,
        v_total_time,
        v_completed_at,
        p_archived_by,
        p_reason,
        v_case_data,
        v_control_data
    ) RETURNING id INTO v_archived_id;
    
    -- Eliminar el caso original y sus datos relacionados (CASCADE se encarga del resto)
    DELETE FROM cases WHERE id = p_case_id;
    
    RETURN v_archived_id;
END;
$$;


ALTER FUNCTION "public"."archive_case"("p_case_id" "uuid", "p_archived_by" "uuid", "p_reason" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."archive_case"("p_case_id" "uuid", "p_archived_by" "uuid", "p_reason" "text") IS 'Archiva un caso terminado con todos sus datos incluyendo historial completo de tiempo';



CREATE OR REPLACE FUNCTION "public"."archive_case"("p_case_id" "uuid", "p_user_id" "uuid", "p_reason" character varying DEFAULT 'manual'::character varying, "p_retention_days" integer DEFAULT NULL::integer) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_archived_item_id uuid;
    v_case_data jsonb;
    v_case_control_data jsonb;
    v_time_entry record;
    v_manual_entry record;
    v_scheduled_deletion timestamp with time zone;
BEGIN
    -- Verificar que el caso existe y está terminado
    SELECT 
        to_jsonb(c.*) as case_data,
        to_jsonb(cc.*) as control_data
    INTO v_case_data, v_case_control_data
    FROM cases c
    JOIN case_control cc ON c.id = cc.case_id
    JOIN case_status_control csc ON cc.status_id = csc.id
    WHERE c.id = p_case_id AND csc.name = 'Terminada';
    
    IF v_case_data IS NULL THEN
        RAISE EXCEPTION 'Caso no encontrado o no está terminado';
    END IF;
    
    -- Calcular fecha de eliminación si aplica
    IF p_retention_days IS NOT NULL THEN
        v_scheduled_deletion := now() + interval '1 day' * p_retention_days;
    END IF;
    
    -- Crear registro de archivo
    INSERT INTO archived_items (
        item_type, 
        original_item_id, 
        archived_by_user_id, 
        archive_reason,
        scheduled_deletion_date,
        metadata
    )
    VALUES (
        'case', 
        p_case_id, 
        p_user_id, 
        p_reason,
        v_scheduled_deletion,
        jsonb_build_object(
            'case_data', v_case_data,
            'control_data', v_case_control_data
        )
    )
    RETURNING id INTO v_archived_item_id;
    
    -- Archivar entradas de tiempo automáticas
    FOR v_time_entry IN
        SELECT * FROM time_entries WHERE case_control_id = (
            SELECT id FROM case_control WHERE case_id = p_case_id
        )
    LOOP
        INSERT INTO archived_time_entries (
            archived_item_id,
            original_time_entry_id,
            entry_type,
            time_data
        )
        VALUES (
            v_archived_item_id,
            v_time_entry.id,
            'case_time',
            to_jsonb(v_time_entry)
        );
    END LOOP;
    
    -- Archivar entradas de tiempo manual
    FOR v_manual_entry IN
        SELECT * FROM manual_time_entries WHERE case_control_id = (
            SELECT id FROM case_control WHERE case_id = p_case_id
        )
    LOOP
        INSERT INTO archived_time_entries (
            archived_item_id,
            original_time_entry_id,
            entry_type,
            time_data
        )
        VALUES (
            v_archived_item_id,
            v_manual_entry.id,
            'manual_time',
            to_jsonb(v_manual_entry)
        );
    END LOOP;
    
    -- Eliminar datos originales (soft delete manteniendo referencias)
    UPDATE cases SET updated_at = now() WHERE id = p_case_id;
    
    RETURN v_archived_item_id;
END;
$$;


ALTER FUNCTION "public"."archive_case"("p_case_id" "uuid", "p_user_id" "uuid", "p_reason" character varying, "p_retention_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."archive_todo"("p_todo_id" "uuid", "p_archived_by" "uuid", "p_reason" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_archived_id uuid;
    v_todo_data JSONB;
    v_control_data JSONB;
    v_title character varying;
    v_description TEXT;
    v_priority character varying;
    v_total_time INTEGER;
    v_completed_at TIMESTAMPTZ;
    v_control_id uuid;
    v_time_entries JSONB;
    v_manual_entries JSONB;
BEGIN
    -- Obtener datos del TODO y control
    SELECT 
        t.title,
        t.description,
        tp.name,
        COALESCE(tc.total_time_minutes, 0),
        tc.completed_at,
        tc.id,
        row_to_json(t.*),
        row_to_json(tc.*)
    INTO 
        v_title,
        v_description,
        v_priority,
        v_total_time,
        v_completed_at,
        v_control_id,
        v_todo_data,
        v_control_data
    FROM todos t
    LEFT JOIN todo_control tc ON t.id = tc.todo_id
    LEFT JOIN todo_priorities tp ON t.priority_id = tp.id
    WHERE t.id = p_todo_id;
    
    -- Verificar que el TODO existe y está completado
    IF NOT FOUND OR v_completed_at IS NULL THEN
        RAISE EXCEPTION 'TODO not found or not completed';
    END IF;
    
    -- Obtener entradas de tiempo automáticas si existe control
    IF v_control_id IS NOT NULL THEN
        SELECT COALESCE(jsonb_agg(tte.*), '[]'::jsonb)
        INTO v_time_entries
        FROM todo_time_entries tte
        WHERE tte.todo_control_id = v_control_id;
        
        -- Obtener entradas de tiempo manual
        SELECT COALESCE(jsonb_agg(tmte.*), '[]'::jsonb)
        INTO v_manual_entries
        FROM todo_manual_time_entries tmte
        WHERE tmte.todo_control_id = v_control_id;
        
        -- Agregar las entradas de tiempo al control_data
        v_control_data = v_control_data || jsonb_build_object(
            'time_entries', v_time_entries,
            'manual_time_entries', v_manual_entries
        );
    END IF;
    
    -- Insertar en archivo
    INSERT INTO archived_todos (
        original_todo_id,
        title,
        description,
        priority,
        total_time_minutes,
        completed_at,
        archived_by,
        archive_reason,
        original_data,
        control_data
    ) VALUES (
        p_todo_id,
        v_title,
        v_description,
        v_priority,
        v_total_time,
        v_completed_at,
        p_archived_by,
        p_reason,
        v_todo_data,
        v_control_data
    ) RETURNING id INTO v_archived_id;
    
    -- Eliminar el TODO original y sus datos relacionados (CASCADE se encarga del resto)
    DELETE FROM todos WHERE id = p_todo_id;
    
    RETURN v_archived_id;
END;
$$;


ALTER FUNCTION "public"."archive_todo"("p_todo_id" "uuid", "p_archived_by" "uuid", "p_reason" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."archive_todo"("p_todo_id" "uuid", "p_archived_by" "uuid", "p_reason" "text") IS 'Archiva un TODO terminado con todos sus datos incluyendo historial completo de tiempo';



CREATE OR REPLACE FUNCTION "public"."archive_todo"("p_todo_id" "uuid", "p_user_id" "uuid", "p_reason" character varying DEFAULT 'manual'::character varying, "p_retention_days" integer DEFAULT NULL::integer) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_archived_item_id uuid;
    v_todo_data jsonb;
    v_todo_control_data jsonb;
    v_time_entry record;
    v_manual_entry record;
    v_scheduled_deletion timestamp with time zone;
BEGIN
    -- Verificar que el TODO existe y está terminado
    SELECT 
        to_jsonb(t.*) as todo_data,
        to_jsonb(tc.*) as control_data
    INTO v_todo_data, v_todo_control_data
    FROM todos t
    JOIN todo_control tc ON t.id = tc.todo_id
    JOIN case_status_control csc ON tc.status_id = csc.id
    WHERE t.id = p_todo_id AND csc.name = 'Terminada';
    
    IF v_todo_data IS NULL THEN
        RAISE EXCEPTION 'TODO no encontrado o no está terminado';
    END IF;
    
    -- Calcular fecha de eliminación si aplica
    IF p_retention_days IS NOT NULL THEN
        v_scheduled_deletion := now() + interval '1 day' * p_retention_days;
    END IF;
    
    -- Crear registro de archivo
    INSERT INTO archived_items (
        item_type, 
        original_item_id, 
        archived_by_user_id, 
        archive_reason,
        scheduled_deletion_date,
        metadata
    )
    VALUES (
        'todo', 
        p_todo_id, 
        p_user_id, 
        p_reason,
        v_scheduled_deletion,
        jsonb_build_object(
            'todo_data', v_todo_data,
            'control_data', v_todo_control_data
        )
    )
    RETURNING id INTO v_archived_item_id;
    
    -- Archivar entradas de tiempo automáticas
    FOR v_time_entry IN
        SELECT * FROM todo_time_entries WHERE todo_control_id = (
            SELECT id FROM todo_control WHERE todo_id = p_todo_id
        )
    LOOP
        INSERT INTO archived_time_entries (
            archived_item_id,
            original_time_entry_id,
            entry_type,
            time_data
        )
        VALUES (
            v_archived_item_id,
            v_time_entry.id,
            'todo_time',
            to_jsonb(v_time_entry)
        );
    END LOOP;
    
    -- Archivar entradas de tiempo manual
    FOR v_manual_entry IN
        SELECT * FROM todo_manual_time_entries WHERE todo_control_id = (
            SELECT id FROM todo_control WHERE todo_id = p_todo_id
        )
    LOOP
        INSERT INTO archived_time_entries (
            archived_item_id,
            original_time_entry_id,
            entry_type,
            time_data
        )
        VALUES (
            v_archived_item_id,
            v_manual_entry.id,
            'manual_time',
            to_jsonb(v_manual_entry)
        );
    END LOOP;
    
    -- Eliminar datos originales (soft delete manteniendo referencias)
    UPDATE todos SET updated_at = now() WHERE id = p_todo_id;
    
    RETURN v_archived_item_id;
END;
$$;


ALTER FUNCTION "public"."archive_todo"("p_todo_id" "uuid", "p_user_id" "uuid", "p_reason" character varying, "p_retention_days" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."calculate_time_entry_duration"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.end_time IS NOT NULL AND NEW.start_time IS NOT NULL THEN
        NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."calculate_time_entry_duration"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_archive_items"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = user_id 
    AND up.is_active = true
    AND r.name IN ('admin', 'supervisor', 'analista')
  );
END;
$$;


ALTER FUNCTION "public"."can_archive_items"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_delete_archived_items"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS(
        SELECT 1 FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.id = user_id 
        AND up.is_active = true
        AND r.name = 'admin'
    );
END;
$$;


ALTER FUNCTION "public"."can_delete_archived_items"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_delete_archived_items"("user_id" "uuid") IS 'Verifica si un usuario puede eliminar elementos archivados permanentemente';



CREATE OR REPLACE FUNCTION "public"."can_restore_items"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS(
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = user_id 
    AND up.is_active = true
    AND r.name IN ('admin', 'supervisor', 'analista')
  );
END;
$$;


ALTER FUNCTION "public"."can_restore_items"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_restore_items"("user_id" "uuid") IS 'Verifica si un usuario puede restaurar elementos - Admin/Supervisor: todos, Analista: solo los suyos';



CREATE OR REPLACE FUNCTION "public"."can_view_all_case_controls"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN has_case_control_permission('case_control.view_all');
END;
$$;


ALTER FUNCTION "public"."can_view_all_case_controls"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_view_note"("note_id" "uuid", "user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Admin, supervisor y auditor pueden ver todas
  IF EXISTS (
    SELECT 1 FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = user_id 
    AND r.name IN ('admin', 'supervisor', 'auditor')
    AND up.is_active = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Analistas pueden ver solo las propias o asignadas
  IF EXISTS (
    SELECT 1 FROM notes n
    WHERE n.id = note_id
    AND (n.created_by = user_id OR n.assigned_to = user_id)
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;


ALTER FUNCTION "public"."can_view_note"("note_id" "uuid", "user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."can_view_note"("note_id" "uuid", "user_id" "uuid") IS 'Verifica si un usuario puede ver una nota específica - ACTUALIZADO: Incluye rol auditor';



CREATE OR REPLACE FUNCTION "public"."can_view_own_case_controls"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN has_case_control_permission('case_control.view_own') OR 
           has_case_control_permission('case_control.view_all');
END;
$$;


ALTER FUNCTION "public"."can_view_own_case_controls"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_old_archive_entries"("p_months_old" integer DEFAULT 24) RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  deleted_count integer := 0;
  additional_count integer := 0;
  cleanup_date timestamptz;
BEGIN
  cleanup_date := NOW() - (p_months_old || ' months')::interval;
  
  -- Eliminar casos archivados muy antiguos (solo los restaurados)
  DELETE FROM archived_cases 
  WHERE archived_at < cleanup_date 
  AND is_restored = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Eliminar TODOs archivados muy antiguos (solo los restaurados)
  DELETE FROM archived_todos 
  WHERE archived_at < cleanup_date 
  AND is_restored = true;
  
  GET DIAGNOSTICS additional_count = ROW_COUNT;
  
  RETURN deleted_count + additional_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_old_archive_entries"("p_months_old" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."cleanup_old_archive_entries"("p_months_old" integer) IS 'Limpia entradas de archivo restauradas antiguas';



CREATE OR REPLACE FUNCTION "public"."complete_todo"("p_todo_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_control_id UUID;
    v_is_timer_active BOOLEAN;
    result JSON;
BEGIN
    -- Verificar si hay timer activo y detenerlo
    SELECT id, is_timer_active
    INTO v_control_id, v_is_timer_active
    FROM todo_control
    WHERE todo_id = p_todo_id;
    
    -- Si hay timer activo, detenerlo primero
    IF v_is_timer_active THEN
        PERFORM toggle_todo_timer(p_todo_id, 'stop');
    END IF;
    
    -- Marcar TODO como completado
    UPDATE todos 
    SET 
        is_completed = true,
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = p_todo_id;
    
    -- Actualizar estado del control a "Terminada"
    UPDATE todo_control 
    SET 
        status_id = (
            SELECT id FROM case_status_control 
            WHERE name = 'Terminada' 
            LIMIT 1
        ),
        completed_at = NOW(),
        updated_at = NOW()
    WHERE todo_id = p_todo_id;
    
    result := json_build_object(
        'action', 'completed',
        'completed_at', NOW(),
        'todo_id', p_todo_id
    );
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."complete_todo"("p_todo_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_case_management_board"("p_user_id" "uuid", "p_board_name" "text" DEFAULT 'Gestión de Casos'::"text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_board_id uuid;
    list_todo_id uuid;
    list_progress_id uuid;
    list_review_id uuid;
    list_done_id uuid;
BEGIN
    -- Crear el tablero
    INSERT INTO public.kanban_boards (
        name,
        description,
        background_color,
        visibility,
        created_by,
        settings
    ) VALUES (
        p_board_name,
        'Tablero para gestión de casos del sistema',
        '#4f46e5',
        'private',
        p_user_id,
        jsonb_build_object(
            'allowComments', true,
            'allowAttachments', true,
            'allowDueDates', true,
            'enableTimeTracking', true,
            'caseIntegration', true
        )
    ) RETURNING id INTO new_board_id;
    
    -- Agregar al usuario como owner
    INSERT INTO public.kanban_board_members (
        board_id,
        user_id,
        role
    ) VALUES (
        new_board_id,
        p_user_id,
        'owner'
    );
    
    -- Crear listas predefinidas para casos
    INSERT INTO public.kanban_lists (name, board_id, position, color, list_type, created_by)
    VALUES 
        ('Por Asignar', new_board_id, 0, '#6b7280', 'todo', p_user_id),
        ('En Progreso', new_board_id, 1, '#f59e0b', 'in_progress', p_user_id),
        ('En Revisión', new_board_id, 2, '#8b5cf6', 'review', p_user_id),
        ('Completado', new_board_id, 3, '#10b981', 'done', p_user_id)
    RETURNING id INTO list_todo_id, list_progress_id, list_review_id, list_done_id;
    
    RETURN new_board_id;
END;
$$;


ALTER FUNCTION "public"."create_case_management_board"("p_user_id" "uuid", "p_board_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_invited_user_profile"("user_id" "uuid", "user_email" "text", "user_metadata" "jsonb" DEFAULT '{}'::"jsonb") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Insertar o actualizar perfil con datos de la invitación
  INSERT INTO public.user_profiles (
    id,
    email,
    full_name,
    role_id,
    is_active,
    created_at,
    updated_at
  )
  VALUES (
    user_id,
    user_email,
    COALESCE(user_metadata->>'full_name', ''),
    COALESCE(user_metadata->>'role_id', (SELECT id FROM roles WHERE name = 'user' LIMIT 1)),
    COALESCE((user_metadata->>'is_active')::boolean, true),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    role_id = COALESCE(EXCLUDED.role_id, user_profiles.role_id),
    is_active = EXCLUDED.is_active,
    updated_at = NOW();
END;
$$;


ALTER FUNCTION "public"."create_invited_user_profile"("user_id" "uuid", "user_email" "text", "user_metadata" "jsonb") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."create_invited_user_profile"("user_id" "uuid", "user_email" "text", "user_metadata" "jsonb") IS 'Crea o actualiza un perfil de usuario para usuarios invitados por admin. Puede ser llamada desde el frontend después del signup.';



CREATE OR REPLACE FUNCTION "public"."delete_archived_case_permanently"("p_archived_id" "uuid", "p_deleted_by" "uuid", "p_reason" "text" DEFAULT NULL::"text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_is_admin boolean := false;
    v_case_number varchar;
BEGIN
    -- Verificar que el usuario es administrador
    SELECT EXISTS(
        SELECT 1 FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.id = p_deleted_by 
        AND up.is_active = true
        AND r.name = 'admin'
    ) INTO v_is_admin;
    
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Only administrators can permanently delete archived cases';
    END IF;
    
    -- Obtener número de caso para logging
    SELECT case_number INTO v_case_number
    FROM archived_cases 
    WHERE id = p_archived_id;
    
    -- Verificar que el caso archivado existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Archived case not found';
    END IF;
    
    -- Registrar la eliminación en logs (opcional - crear tabla si no existe)
    BEGIN
        INSERT INTO archive_deletion_log (
            item_type,
            item_id,
            item_identifier,
            deleted_by,
            deleted_at,
            deletion_reason
        ) VALUES (
            'case',
            p_archived_id,
            v_case_number,
            p_deleted_by,
            now(),
            p_reason
        );
    EXCEPTION
        WHEN undefined_table THEN
            -- Si la tabla no existe, continuar sin registrar
            NULL;
    END;
    
    -- Eliminar permanentemente el caso archivado
    DELETE FROM archived_cases 
    WHERE id = p_archived_id;
    
    -- Verificar que se eliminó
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Failed to delete archived case';
    END IF;
    
    RETURN true;
END;
$$;


ALTER FUNCTION "public"."delete_archived_case_permanently"("p_archived_id" "uuid", "p_deleted_by" "uuid", "p_reason" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."delete_archived_case_permanently"("p_archived_id" "uuid", "p_deleted_by" "uuid", "p_reason" "text") IS 'Elimina permanentemente un caso archivado - Solo administradores';



CREATE OR REPLACE FUNCTION "public"."delete_archived_item_permanently"("p_archived_item_id" "uuid", "p_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_archived_item record;
BEGIN
    -- Obtener el elemento archivado
    SELECT * INTO v_archived_item 
    FROM archived_items 
    WHERE id = p_archived_item_id AND is_deleted = false;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Elemento archivado no encontrado';
    END IF;
    
    -- Marcar como eliminado permanentemente
    UPDATE archived_items 
    SET is_deleted = true, 
        deleted_at = now(),
        deleted_by_user_id = p_user_id
    WHERE id = p_archived_item_id;
    
    -- Crear notificación de eliminación
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        data
    ) VALUES (
        p_user_id,
        'deletion_completed',
        'Elemento Eliminado Permanentemente',
        'El elemento ha sido eliminado permanentemente del archivo',
        jsonb_build_object(
            'archived_item_id', p_archived_item_id,
            'item_type', v_archived_item.item_type,
            'original_item_id', v_archived_item.original_item_id
        )
    );
    
    RETURN true;
END;
$$;


ALTER FUNCTION "public"."delete_archived_item_permanently"("p_archived_item_id" "uuid", "p_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_archived_todo_permanently"("p_archived_id" "uuid", "p_deleted_by" "uuid", "p_reason" "text" DEFAULT NULL::"text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_is_admin boolean := false;
    v_todo_title varchar;
BEGIN
    -- Verificar que el usuario es administrador
    SELECT EXISTS(
        SELECT 1 FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        WHERE up.id = p_deleted_by 
        AND up.is_active = true
        AND r.name = 'admin'
    ) INTO v_is_admin;
    
    IF NOT v_is_admin THEN
        RAISE EXCEPTION 'Only administrators can permanently delete archived TODOs';
    END IF;
    
    -- Obtener título del TODO para logging
    SELECT title INTO v_todo_title
    FROM archived_todos 
    WHERE id = p_archived_id;
    
    -- Verificar que el TODO archivado existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Archived TODO not found';
    END IF;
    
    -- Registrar la eliminación en logs (opcional - crear tabla si no existe)
    BEGIN
        INSERT INTO archive_deletion_log (
            item_type,
            item_id,
            item_identifier,
            deleted_by,
            deleted_at,
            deletion_reason
        ) VALUES (
            'todo',
            p_archived_id,
            v_todo_title,
            p_deleted_by,
            now(),
            p_reason
        );
    EXCEPTION
        WHEN undefined_table THEN
            -- Si la tabla no existe, continuar sin registrar
            NULL;
    END;
    
    -- Eliminar permanentemente el TODO archivado
    DELETE FROM archived_todos 
    WHERE id = p_archived_id;
    
    -- Verificar que se eliminó
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Failed to delete archived TODO';
    END IF;
    
    RETURN true;
END;
$$;


ALTER FUNCTION "public"."delete_archived_todo_permanently"("p_archived_id" "uuid", "p_deleted_by" "uuid", "p_reason" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."delete_archived_todo_permanently"("p_archived_id" "uuid", "p_deleted_by" "uuid", "p_reason" "text") IS 'Elimina permanentemente un TODO archivado - Solo administradores';



CREATE OR REPLACE FUNCTION "public"."ensure_user_profile"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  SELECT NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  WHERE NOT EXISTS (SELECT 1 FROM user_profiles WHERE id = NEW.id);
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."ensure_user_profile"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_application_time_metrics"() RETURNS TABLE("application_id" "uuid", "application_name" character varying, "total_time_minutes" integer, "cases_count" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        oa.id as application_id,
        oa.name as application_name,
        COALESCE(SUM(te.duration_minutes), 0)::INTEGER as total_time_minutes,
        COUNT(DISTINCT cc.case_id)::INTEGER as cases_count
    FROM origenes_aplicaciones oa
    LEFT JOIN cases c ON c.origen_aplicacion_id = oa.id
    LEFT JOIN case_control cc ON cc.case_id = c.id
    LEFT JOIN time_entries te ON te.case_control_id = cc.id
    WHERE EXISTS (
        SELECT 1 FROM cases c2 
        JOIN case_control cc2 ON cc2.case_id = c2.id
        JOIN time_entries te2 ON te2.case_control_id = cc2.id
        WHERE c2.origen_aplicacion_id = oa.id
    )
    GROUP BY oa.id, oa.name
    ORDER BY total_time_minutes DESC;
END;
$$;


ALTER FUNCTION "public"."get_application_time_metrics"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_application_time_metrics"() IS 'Obtiene métricas de tiempo agrupadas por aplicación de origen';



CREATE OR REPLACE FUNCTION "public"."get_archivable_cases"("p_user_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("case_id" "uuid", "case_number" character varying, "description" "text", "classification" character varying, "total_time_minutes" integer, "completed_at" timestamp with time zone, "assigned_user" character varying)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as case_id,
    c.numero_caso as case_number,
    c.descripcion as description,
    c.clasificacion as classification,
    COALESCE(cc.total_time_minutes, 0) as total_time_minutes,
    cc.completed_at,
    up.full_name as assigned_user
  FROM cases c
  JOIN case_control cc ON c.id = cc.case_id
  LEFT JOIN user_profiles up ON cc.user_id = up.id
  WHERE cc.completed_at IS NOT NULL
  AND c.id NOT IN (SELECT original_case_id FROM archived_cases WHERE is_restored = false)
  AND (p_user_id IS NULL OR cc.user_id = p_user_id)
  ORDER BY cc.completed_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_archivable_cases"("p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_archivable_cases"("p_user_id" "uuid") IS 'Obtiene casos completados que pueden ser archivados - tipos corregidos';



CREATE OR REPLACE FUNCTION "public"."get_archivable_todos"("p_user_id" "uuid" DEFAULT NULL::"uuid") RETURNS TABLE("todo_id" "uuid", "title" character varying, "description" "text", "priority" character varying, "total_time_minutes" integer, "completed_at" timestamp with time zone, "assigned_user" character varying)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as todo_id,
    t.title,
    t.description,
    tp.name as priority,
    COALESCE(tc.total_time_minutes, 0) as total_time_minutes,
    tc.completed_at,
    up.full_name as assigned_user
  FROM todos t
  JOIN todo_control tc ON t.id = tc.todo_id
  LEFT JOIN todo_priorities tp ON t.priority_id = tp.id
  LEFT JOIN user_profiles up ON tc.user_id = up.id
  WHERE tc.completed_at IS NOT NULL
  AND t.id NOT IN (SELECT original_todo_id FROM archived_todos WHERE is_restored = false)
  AND (p_user_id IS NULL OR tc.user_id = p_user_id)
  ORDER BY tc.completed_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_archivable_todos"("p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_archivable_todos"("p_user_id" "uuid") IS 'Obtiene TODOs completados que pueden ser archivados - tipos corregidos';



CREATE OR REPLACE FUNCTION "public"."get_archive_stats_by_user"() RETURNS TABLE("user_id" "uuid", "user_name" character varying, "archived_cases" integer, "archived_todos" integer, "total_time_minutes" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(cases_stats.user_id, todos_stats.user_id) as user_id,
    COALESCE(cases_stats.user_name, todos_stats.user_name) as user_name,
    COALESCE(cases_stats.archived_cases, 0) as archived_cases,
    COALESCE(todos_stats.archived_todos, 0) as archived_todos,
    COALESCE(cases_stats.case_time, 0) + COALESCE(todos_stats.todo_time, 0) as total_time_minutes
  FROM 
    (
      SELECT 
        ac.archived_by as user_id,
        up.full_name as user_name,
        COUNT(*)::integer as archived_cases,
        COALESCE(SUM(ac.total_time_minutes), 0)::integer as case_time
      FROM archived_cases ac
      JOIN user_profiles up ON ac.archived_by = up.id
      WHERE ac.is_restored = false
      GROUP BY ac.archived_by, up.full_name
    ) cases_stats
  FULL OUTER JOIN 
    (
      SELECT 
        at.archived_by as user_id,
        up.full_name as user_name,
        COUNT(*)::integer as archived_todos,
        COALESCE(SUM(at.total_time_minutes), 0)::integer as todo_time
      FROM archived_todos at
      JOIN user_profiles up ON at.archived_by = up.id
      WHERE at.is_restored = false
      GROUP BY at.archived_by, up.full_name
    ) todos_stats ON cases_stats.user_id = todos_stats.user_id
  ORDER BY total_time_minutes DESC;
END;
$$;


ALTER FUNCTION "public"."get_archive_stats_by_user"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_archive_stats_by_user"() IS 'Obtiene estadísticas de archivo agrupadas por usuario - tipos bigint corregidos a integer';



CREATE OR REPLACE FUNCTION "public"."get_archive_stats_monthly"() RETURNS TABLE("month" "text", "archived_cases" integer, "archived_todos" integer, "total_time_minutes" integer)
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  WITH monthly_cases AS (
    SELECT 
      TO_CHAR(ac.archived_at, 'YYYY-MM') as month,
      COUNT(*)::integer as archived_cases,
      COALESCE(SUM(ac.total_time_minutes), 0)::integer as case_time
    FROM archived_cases ac
    WHERE ac.archived_at >= NOW() - INTERVAL '12 months'
    AND ac.is_restored = false
    GROUP BY TO_CHAR(ac.archived_at, 'YYYY-MM')
  ),
  monthly_todos AS (
    SELECT 
      TO_CHAR(at.archived_at, 'YYYY-MM') as month,
      COUNT(*)::integer as archived_todos,
      COALESCE(SUM(at.total_time_minutes), 0)::integer as todo_time
    FROM archived_todos at
    WHERE at.archived_at >= NOW() - INTERVAL '12 months'
    AND at.is_restored = false
    GROUP BY TO_CHAR(at.archived_at, 'YYYY-MM')
  ),
  all_months AS (
    SELECT TO_CHAR(generate_series(
      date_trunc('month', NOW() - INTERVAL '11 months'),
      date_trunc('month', NOW()),
      '1 month'::interval
    ), 'YYYY-MM') as month
  )
  SELECT 
    am.month,
    COALESCE(mc.archived_cases, 0) as archived_cases,
    COALESCE(mt.archived_todos, 0) as archived_todos,
    (COALESCE(mc.case_time, 0) + COALESCE(mt.todo_time, 0)) as total_time_minutes
  FROM all_months am
  LEFT JOIN monthly_cases mc ON am.month = mc.month
  LEFT JOIN monthly_todos mt ON am.month = mt.month
  ORDER BY am.month;
END;
$$;


ALTER FUNCTION "public"."get_archive_stats_monthly"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_archive_stats_monthly"() IS 'Obtiene estadísticas de archivo por mes (últimos 12 meses) - con alias específicos para evitar ambigüedad';



CREATE OR REPLACE FUNCTION "public"."get_archived_case_details"("p_archived_id" "uuid") RETURNS TABLE("id" "uuid", "original_case_id" "uuid", "case_number" character varying, "description" "text", "classification" character varying, "total_time_minutes" integer, "completed_at" timestamp with time zone, "archived_at" timestamp with time zone, "archived_by_name" character varying, "restored_at" timestamp with time zone, "restored_by_name" character varying, "is_restored" boolean, "original_data" "jsonb", "control_data" "jsonb")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ac.id,
        ac.original_case_id,
        ac.case_number,
        ac.description,
        ac.classification,
        ac.total_time_minutes,
        ac.completed_at,
        ac.archived_at,
        up1.full_name as archived_by_name,
        ac.restored_at,
        up2.full_name as restored_by_name,
        ac.is_restored,
        ac.original_data,
        ac.control_data
    FROM archived_cases ac
    LEFT JOIN user_profiles up1 ON ac.archived_by = up1.id
    LEFT JOIN user_profiles up2 ON ac.restored_by = up2.id
    WHERE ac.id = p_archived_id;
END;
$$;


ALTER FUNCTION "public"."get_archived_case_details"("p_archived_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_archived_case_details"("p_archived_id" "uuid") IS 'Obtiene detalles completos de un caso archivado - tipos corregidos';



CREATE OR REPLACE FUNCTION "public"."get_archived_todo_details"("p_archived_id" "uuid") RETURNS TABLE("id" "uuid", "original_todo_id" "uuid", "title" character varying, "description" "text", "priority" character varying, "total_time_minutes" integer, "completed_at" timestamp with time zone, "archived_at" timestamp with time zone, "archived_by_name" character varying, "restored_at" timestamp with time zone, "restored_by_name" character varying, "is_restored" boolean, "original_data" "jsonb", "control_data" "jsonb")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        at.id,
        at.original_todo_id,
        at.title,
        at.description,
        at.priority,
        at.total_time_minutes,
        at.completed_at,
        at.archived_at,
        up1.full_name as archived_by_name,
        at.restored_at,
        up2.full_name as restored_by_name,
        at.is_restored,
        at.original_data,
        at.control_data
    FROM archived_todos at
    LEFT JOIN user_profiles up1 ON at.archived_by = up1.id
    LEFT JOIN user_profiles up2 ON at.restored_by = up2.id
    WHERE at.id = p_archived_id;
END;
$$;


ALTER FUNCTION "public"."get_archived_todo_details"("p_archived_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_archived_todo_details"("p_archived_id" "uuid") IS 'Obtiene detalles completos de un TODO archivado - tipos corregidos';



CREATE OR REPLACE FUNCTION "public"."get_case_time_metrics"() RETURNS TABLE("case_id" "uuid", "case_number" character varying, "description" "text", "total_time_minutes" integer, "status" character varying, "status_color" character varying)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as case_id,
        c.numero_caso as case_number,
        c.descripcion as description,
        COALESCE(SUM(te.duration_minutes), 0)::INTEGER as total_time_minutes,
        COALESCE(csc.name, 'Sin estado') as status,
        COALESCE(csc.color, '#6B7280') as status_color
    FROM cases c
    LEFT JOIN case_control cc ON cc.case_id = c.id
    LEFT JOIN time_entries te ON te.case_control_id = cc.id
    LEFT JOIN case_status_control csc ON cc.status_id = csc.id
    WHERE EXISTS (
        SELECT 1 FROM time_entries te2 
        JOIN case_control cc2 ON te2.case_control_id = cc2.id 
        WHERE cc2.case_id = c.id
    )
    GROUP BY c.id, c.numero_caso, c.descripcion, csc.name, csc.color
    ORDER BY total_time_minutes DESC;
END;
$$;


ALTER FUNCTION "public"."get_case_time_metrics"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_case_time_metrics"() IS 'Obtiene métricas de tiempo agrupadas por caso';



CREATE OR REPLACE FUNCTION "public"."get_notes_stats"("user_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result JSON;
  total_notes integer;
  my_notes integer;
  assigned_notes integer;
  important_notes integer;
  with_reminders integer;
  archived_notes integer;
  user_role_name text;
BEGIN
  -- Obtener el rol del usuario
  SELECT r.name INTO user_role_name
  FROM user_profiles up
  JOIN roles r ON up.role_id = r.id
  WHERE up.id = user_id 
  AND up.is_active = true;
  
  -- Verificar que el usuario existe y está activo
  IF user_role_name IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado o inactivo';
  END IF;
  
  -- Obtener estadísticas según el rol
  IF user_role_name IN ('admin', 'supervisor', 'auditor') THEN
    -- Admin/Supervisor/Auditor ven todas las notas
    SELECT 
      COUNT(*) FILTER (WHERE is_archived = false),
      COUNT(*) FILTER (WHERE created_by = user_id AND is_archived = false),
      COUNT(*) FILTER (WHERE assigned_to = user_id AND is_archived = false),
      COUNT(*) FILTER (WHERE is_important = true AND is_archived = false),
      COUNT(*) FILTER (WHERE reminder_date IS NOT NULL AND is_archived = false),
      COUNT(*) FILTER (WHERE is_archived = true)
    INTO total_notes, my_notes, assigned_notes, important_notes, with_reminders, archived_notes
    FROM notes;
  ELSE
    -- Analistas solo ven sus notas (creadas por él o asignadas a él)
    SELECT 
      COUNT(*) FILTER (WHERE is_archived = false),
      -- "Mis notas" para analistas incluye tanto las creadas como las asignadas
      COUNT(*) FILTER (WHERE (created_by = user_id OR assigned_to = user_id) AND is_archived = false),
      COUNT(*) FILTER (WHERE assigned_to = user_id AND is_archived = false),
      COUNT(*) FILTER (WHERE is_important = true AND is_archived = false),
      COUNT(*) FILTER (WHERE reminder_date IS NOT NULL AND is_archived = false),
      COUNT(*) FILTER (WHERE is_archived = true)
    INTO total_notes, my_notes, assigned_notes, important_notes, with_reminders, archived_notes
    FROM notes
    WHERE (created_by = user_id OR assigned_to = user_id);
  END IF;
  
  SELECT json_build_object(
    'total_notes', total_notes,
    'my_notes', my_notes,
    'assigned_notes', assigned_notes,
    'important_notes', important_notes,
    'with_reminders', with_reminders,
    'archived_notes', archived_notes
  ) INTO result;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_notes_stats"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_notes_stats"("user_id" "uuid") IS 'Obtiene estadísticas de notas según permisos del usuario - ACTUALIZADO: Incluye rol auditor';



CREATE OR REPLACE FUNCTION "public"."get_status_metrics"() RETURNS TABLE("status_id" "uuid", "status_name" character varying, "status_color" character varying, "cases_count" integer, "total_time_minutes" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        csc.id as status_id,
        csc.name as status_name,
        csc.color as status_color,
        COUNT(DISTINCT cc.case_id)::INTEGER as cases_count,
        COALESCE(SUM(te.duration_minutes), 0)::INTEGER as total_time_minutes
    FROM case_status_control csc
    LEFT JOIN case_control cc ON cc.status_id = csc.id
    LEFT JOIN time_entries te ON te.case_control_id = cc.id
    WHERE csc.is_active = true
    GROUP BY csc.id, csc.name, csc.color
    ORDER BY total_time_minutes DESC;
END;
$$;


ALTER FUNCTION "public"."get_status_metrics"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_status_metrics"() IS 'Obtiene métricas agrupadas por estado de control';



CREATE OR REPLACE FUNCTION "public"."get_time_metrics"() RETURNS TABLE("total_time_minutes" integer, "total_hours" numeric, "average_time_per_case" numeric, "active_timers" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(SUM(te.duration_minutes), 0)::INTEGER as total_time_minutes,
        ROUND(COALESCE(SUM(te.duration_minutes), 0) / 60.0, 2) as total_hours,
        ROUND(
            CASE 
                WHEN COUNT(DISTINCT cc.case_id) > 0 
                THEN COALESCE(SUM(te.duration_minutes), 0)::NUMERIC / COUNT(DISTINCT cc.case_id)
                ELSE 0 
            END, 2
        ) as average_time_per_case,
        COUNT(cc.id) FILTER (WHERE cc.is_timer_active = true)::INTEGER as active_timers
    FROM time_entries te
    RIGHT JOIN case_control cc ON te.case_control_id = cc.id;
END;
$$;


ALTER FUNCTION "public"."get_time_metrics"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_time_metrics"() IS 'Obtiene métricas generales de tiempo del sistema';



CREATE OR REPLACE FUNCTION "public"."get_todo_metrics"("user_id" "uuid" DEFAULT NULL::"uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    result JSON;
    total_todos INTEGER;
    completed_todos INTEGER;
    pending_todos INTEGER;
    in_progress_todos INTEGER;
    overdue_todos INTEGER;
    high_priority_todos INTEGER;
    user_role TEXT;
    is_user_active BOOLEAN;
BEGIN
    -- Obtener rol y estado del usuario
    SELECT r.name, up.is_active INTO user_role, is_user_active
    FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = COALESCE(user_id, auth.uid());
    
    -- Si el usuario no está activo, devolver métricas vacías
    IF NOT is_user_active THEN
        RETURN json_build_object(
            'totalTodos', 0,
            'completedTodos', 0,
            'pendingTodos', 0,
            'inProgressTodos', 0,
            'overdueTodos', 0,
            'highPriorityTodos', 0,
            'userRole', user_role,
            'isActive', is_user_active
        );
    END IF;
    
    -- Contar TODOs según el rol del usuario
    IF user_role IN ('admin', 'supervisor') THEN
        -- Admin y supervisor ven todos los TODOs
        SELECT COUNT(*) INTO total_todos FROM todos;
        
        SELECT COUNT(*) INTO completed_todos FROM todos WHERE is_completed = true;
        
        SELECT COUNT(*) INTO pending_todos 
        FROM todos t
        JOIN todo_control tc ON t.id = tc.todo_id
        JOIN case_status_control csc ON tc.status_id = csc.id
        WHERE csc.name = 'Pendiente' AND t.is_completed = false;
        
        SELECT COUNT(*) INTO in_progress_todos 
        FROM todos t
        JOIN todo_control tc ON t.id = tc.todo_id
        JOIN case_status_control csc ON tc.status_id = csc.id
        WHERE csc.name = 'En Curso' AND t.is_completed = false;
        
        SELECT COUNT(*) INTO overdue_todos 
        FROM todos 
        WHERE due_date < CURRENT_DATE AND is_completed = false;
        
        SELECT COUNT(*) INTO high_priority_todos 
        FROM todos t
        JOIN todo_priorities tp ON t.priority_id = tp.id
        WHERE tp.level >= 4 AND t.is_completed = false;
        
    ELSE
        -- Analistas solo ven sus TODOs asignados
        SELECT COUNT(*) INTO total_todos 
        FROM todos 
        WHERE assigned_user_id = COALESCE(user_id, auth.uid()) 
        OR created_by_user_id = COALESCE(user_id, auth.uid());
        
        SELECT COUNT(*) INTO completed_todos 
        FROM todos 
        WHERE (assigned_user_id = COALESCE(user_id, auth.uid()) OR created_by_user_id = COALESCE(user_id, auth.uid()))
        AND is_completed = true;
        
        SELECT COUNT(*) INTO pending_todos 
        FROM todos t
        JOIN todo_control tc ON t.id = tc.todo_id
        JOIN case_status_control csc ON tc.status_id = csc.id
        WHERE (t.assigned_user_id = COALESCE(user_id, auth.uid()) OR t.created_by_user_id = COALESCE(user_id, auth.uid()))
        AND csc.name = 'Pendiente' AND t.is_completed = false;
        
        SELECT COUNT(*) INTO in_progress_todos 
        FROM todos t
        JOIN todo_control tc ON t.id = tc.todo_id
        JOIN case_status_control csc ON tc.status_id = csc.id
        WHERE (t.assigned_user_id = COALESCE(user_id, auth.uid()) OR t.created_by_user_id = COALESCE(user_id, auth.uid()))
        AND csc.name = 'En Curso' AND t.is_completed = false;
        
        SELECT COUNT(*) INTO overdue_todos 
        FROM todos 
        WHERE (assigned_user_id = COALESCE(user_id, auth.uid()) OR created_by_user_id = COALESCE(user_id, auth.uid()))
        AND due_date < CURRENT_DATE AND is_completed = false;
        
        SELECT COUNT(*) INTO high_priority_todos 
        FROM todos t
        JOIN todo_priorities tp ON t.priority_id = tp.id
        WHERE (t.assigned_user_id = COALESCE(user_id, auth.uid()) OR t.created_by_user_id = COALESCE(user_id, auth.uid()))
        AND tp.level >= 4 AND t.is_completed = false;
    END IF;
    
    -- Construir resultado JSON
    result := json_build_object(
        'totalTodos', COALESCE(total_todos, 0),
        'completedTodos', COALESCE(completed_todos, 0),
        'pendingTodos', COALESCE(pending_todos, 0),
        'inProgressTodos', COALESCE(in_progress_todos, 0),
        'overdueTodos', COALESCE(overdue_todos, 0),
        'highPriorityTodos', COALESCE(high_priority_todos, 0),
        'userRole', user_role,
        'isActive', is_user_active
    );
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_todo_metrics"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_role"() RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT r.name INTO user_role
    FROM user_profiles up
    JOIN roles r ON up.role_id = r.id
    WHERE up.id = auth.uid() AND up.is_active = true;
    
    RETURN COALESCE(user_role, 'user');
END;
$$;


ALTER FUNCTION "public"."get_user_role"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_time_metrics"() RETURNS TABLE("user_id" "uuid", "user_name" "text", "total_time_minutes" integer, "cases_worked" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN QUERY
    SELECT 
        up.id as user_id,
        COALESCE(up.full_name, up.email, 'Usuario sin nombre') as user_name,
        COALESCE(SUM(te.duration_minutes), 0)::INTEGER as total_time_minutes,
        COUNT(DISTINCT cc.case_id)::INTEGER as cases_worked
    FROM user_profiles up
    LEFT JOIN case_control cc ON cc.user_id = up.id
    LEFT JOIN time_entries te ON te.case_control_id = cc.id
    WHERE EXISTS (
        SELECT 1 FROM time_entries te2 
        JOIN case_control cc2 ON te2.case_control_id = cc2.id 
        WHERE cc2.user_id = up.id
    )
    GROUP BY up.id, up.full_name, up.email
    ORDER BY total_time_minutes DESC;
END;
$$;


ALTER FUNCTION "public"."get_user_time_metrics"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_time_metrics"() IS 'Obtiene métricas de tiempo agrupadas por usuario';



CREATE OR REPLACE FUNCTION "public"."has_permission"("permission_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE up.id = auth.uid() 
        AND p.name = permission_name
        AND up.is_active = true
        AND r.is_active = true
        AND p.is_active = true
    );
END;
$$;


ALTER FUNCTION "public"."has_permission"("permission_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_permission"("user_id" "uuid", "permission_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_profiles up
    INNER JOIN public.roles r ON up.role_id = r.id
    INNER JOIN public.role_permissions rp ON r.id = rp.role_id
    INNER JOIN public.permissions p ON rp.permission_id = p.id
    WHERE up.id = user_id
    AND p.name = permission_name
    AND p.is_active = true
    AND up.is_active = true
    AND r.is_active = true
  );
END;
$$;


ALTER FUNCTION "public"."has_permission"("user_id" "uuid", "permission_name" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."has_permission"("user_id" "uuid", "permission_name" "text") IS 'Verifica si un usuario tiene un permiso específico basado en el sistema dinámico de permisos';



CREATE OR REPLACE FUNCTION "public"."has_resource_permission"("user_id" "uuid", "resource_pattern" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_profiles up
    INNER JOIN public.roles r ON up.role_id = r.id
    INNER JOIN public.role_permissions rp ON r.id = rp.role_id
    INNER JOIN public.permissions p ON rp.permission_id = p.id
    WHERE up.id = user_id
    AND p.name LIKE resource_pattern
    AND p.is_active = true
    AND up.is_active = true
    AND r.is_active = true
  );
END;
$$;


ALTER FUNCTION "public"."has_resource_permission"("user_id" "uuid", "resource_pattern" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."has_resource_permission"("user_id" "uuid", "resource_pattern" "text") IS 'Verifica permisos usando patrones de recursos (ej: cases.*)';



CREATE OR REPLACE FUNCTION "public"."has_system_access"() RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_profile RECORD;
BEGIN
  -- Obtener el perfil del usuario actual
  SELECT 
    up.is_active,
    r.name as role_name
  INTO user_profile
  FROM public.user_profiles up
  LEFT JOIN public.roles r ON up.role_id = r.id
  WHERE up.id = auth.uid();
  
  -- Si no se encuentra el perfil, no tiene acceso
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Solo tiene acceso si está activo y tiene un rol válido
  RETURN (
    user_profile.is_active = true 
    AND user_profile.role_name IS NOT NULL 
    AND user_profile.role_name != 'user'
  );
END;
$$;


ALTER FUNCTION "public"."has_system_access"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."initialize_todo_control"("p_todo_id" "uuid", "p_user_id" "uuid" DEFAULT NULL::"uuid", "p_status_name" "text" DEFAULT 'Pendiente'::"text") RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_user_id UUID;
    v_status_id UUID;
    v_control_id UUID;
BEGIN
    -- Determinar el usuario (por defecto el usuario actual)
    v_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Obtener el ID del estado
    SELECT id INTO v_status_id
    FROM case_status_control
    WHERE name = p_status_name
    LIMIT 1;
    
    -- Si no existe el estado, usar el primero disponible
    IF v_status_id IS NULL THEN
        SELECT id INTO v_status_id
        FROM case_status_control
        WHERE is_active = true
        ORDER BY display_order
        LIMIT 1;
    END IF;
    
    -- Crear el control si no existe
    INSERT INTO todo_control (
        todo_id,
        user_id,
        status_id,
        assigned_at
    )
    VALUES (
        p_todo_id,
        v_user_id,
        v_status_id,
        NOW()
    )
    ON CONFLICT (todo_id) DO UPDATE SET
        user_id = v_user_id,
        status_id = v_status_id,
        updated_at = NOW()
    RETURNING id INTO v_control_id;
    
    RETURN v_control_id;
END;
$$;


ALTER FUNCTION "public"."initialize_todo_control"("p_todo_id" "uuid", "p_user_id" "uuid", "p_status_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_admin"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN has_permission(user_id, 'admin.access');
END;
$$;


ALTER FUNCTION "public"."is_admin"("user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."is_admin"("user_id" "uuid") IS 'Verifica si un usuario tiene permisos de administrador (admin.access)';



CREATE OR REPLACE FUNCTION "public"."is_case_control_owner"("case_control_user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    RETURN case_control_user_id = auth.uid();
END;
$$;


ALTER FUNCTION "public"."is_case_control_owner"("case_control_user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."restore_case"("p_archived_id" "uuid", "p_restored_by" "uuid", "p_reason" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_case_id uuid;
    v_original_data JSONB;
    v_control_data JSONB;
    v_original_case_id uuid;
    v_control_id uuid;
    v_time_entry JSONB;
    v_manual_entry JSONB;
BEGIN
    -- Obtener datos del caso archivado
    SELECT 
        original_case_id,
        original_data,
        control_data
    INTO 
        v_original_case_id,
        v_original_data,
        v_control_data
    FROM archived_cases 
    WHERE id = p_archived_id AND is_restored = false;
    
    -- Verificar que el caso archivado existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Archived case not found or already restored';
    END IF;
    
    -- Recrear el caso original usando los datos JSON (solo columnas que existen)
    INSERT INTO cases (
        id,
        numero_caso,
        descripcion,
        clasificacion,
        origen_id,
        aplicacion_id,
        puntuacion,
        historial_caso,
        conocimiento_modulo,
        manipulacion_datos,
        claridad_descripcion,
        causa_fallo,
        fecha,
        user_id,
        created_at,
        updated_at
    ) 
    SELECT 
        (v_original_data->>'id')::uuid,
        v_original_data->>'numero_caso',
        v_original_data->>'descripcion',
        v_original_data->>'clasificacion',
        (v_original_data->>'origen_id')::uuid,
        (v_original_data->>'aplicacion_id')::uuid,
        (v_original_data->>'puntuacion')::integer,
        (v_original_data->>'historial_caso')::integer,
        (v_original_data->>'conocimiento_modulo')::integer,
        (v_original_data->>'manipulacion_datos')::integer,
        (v_original_data->>'claridad_descripcion')::integer,
        (v_original_data->>'causa_fallo')::integer,
        COALESCE((v_original_data->>'fecha')::date, CURRENT_DATE),
        (v_original_data->>'user_id')::uuid,
        COALESCE((v_original_data->>'created_at')::timestamptz, now()),
        now() -- Actualizar fecha de modificación
    RETURNING id INTO v_case_id;
    
    -- Recrear el control de caso en estado PENDIENTE si existía
    IF v_control_data IS NOT NULL AND v_control_data != 'null'::jsonb THEN
        INSERT INTO case_control (
            case_id,
            user_id,
            status_id,
            total_time_minutes,
            started_at,
            created_at,
            updated_at
        ) VALUES (
            v_case_id,
            (v_control_data->>'user_id')::uuid,
            (SELECT id FROM case_status_control WHERE name = 'PENDIENTE' LIMIT 1), -- Estado pendiente para poder trabajar nuevamente
            COALESCE((v_control_data->>'total_time_minutes')::integer, 0), -- Preservar tiempo total
            NULL, -- Sin fecha de inicio activa
            now(),
            now()
        ) RETURNING id INTO v_control_id;
        
        -- Restaurar entradas de tiempo automáticas si existen
        IF v_control_data ? 'time_entries' AND jsonb_array_length(v_control_data->'time_entries') > 0 THEN
            FOR v_time_entry IN SELECT * FROM jsonb_array_elements(v_control_data->'time_entries')
            LOOP
                INSERT INTO time_entries (
                    case_control_id,
                    user_id,
                    start_time,
                    end_time,
                    duration_minutes,
                    entry_type,
                    description,
                    created_at
                ) VALUES (
                    v_control_id,
                    (v_time_entry->>'user_id')::uuid,
                    (v_time_entry->>'start_time')::timestamptz,
                    (v_time_entry->>'end_time')::timestamptz,
                    (v_time_entry->>'duration_minutes')::integer,
                    COALESCE(v_time_entry->>'entry_type', 'automatic'),
                    v_time_entry->>'description',
                    COALESCE((v_time_entry->>'created_at')::timestamptz, now())
                );
            END LOOP;
        END IF;
        
        -- Restaurar entradas de tiempo manual si existen
        IF v_control_data ? 'manual_time_entries' AND jsonb_array_length(v_control_data->'manual_time_entries') > 0 THEN
            FOR v_manual_entry IN SELECT * FROM jsonb_array_elements(v_control_data->'manual_time_entries')
            LOOP
                INSERT INTO manual_time_entries (
                    case_control_id,
                    user_id,
                    date,
                    duration_minutes,
                    description,
                    created_by,
                    created_at
                ) VALUES (
                    v_control_id,
                    (v_manual_entry->>'user_id')::uuid,
                    (v_manual_entry->>'date')::date,
                    (v_manual_entry->>'duration_minutes')::integer,
                    v_manual_entry->>'description',
                    (v_manual_entry->>'created_by')::uuid,
                    COALESCE((v_manual_entry->>'created_at')::timestamptz, now())
                );
            END LOOP;
        END IF;
    END IF;
    
    -- Marcar como restaurado en el archivo
    UPDATE archived_cases 
    SET 
        is_restored = true,
        restored_at = now(),
        restored_by = p_restored_by,
        updated_at = now()
    WHERE id = p_archived_id;
    
    RETURN v_case_id;
END;
$$;


ALTER FUNCTION "public"."restore_case"("p_archived_id" "uuid", "p_restored_by" "uuid", "p_reason" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."restore_case"("p_archived_id" "uuid", "p_restored_by" "uuid", "p_reason" "text") IS 'Restaura un caso archivado recreando los registros originales en estado PENDIENTE y preservando todo el historial de tiempo - Versión corregida sin columnas inexistentes';



CREATE OR REPLACE FUNCTION "public"."restore_todo"("p_archived_id" "uuid", "p_restored_by" "uuid", "p_reason" "text" DEFAULT NULL::"text") RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_todo_id uuid;
    v_original_data JSONB;
    v_control_data JSONB;
    v_original_todo_id uuid;
    v_control_id uuid;
    v_time_entry JSONB;
    v_manual_entry JSONB;
BEGIN
    -- Obtener datos del TODO archivado
    SELECT 
        original_todo_id,
        original_data,
        control_data
    INTO 
        v_original_todo_id,
        v_original_data,
        v_control_data
    FROM archived_todos 
    WHERE id = p_archived_id AND is_restored = false;
    
    -- Verificar que el TODO archivado existe
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Archived TODO not found or already restored';
    END IF;
    
    -- Recrear el TODO original usando los datos JSON
    INSERT INTO todos (
        id,
        title,
        description,
        priority_id,
        due_date,
        estimated_minutes,
        created_by_user_id,
        assigned_user_id,
        is_completed,
        completed_at,
        created_at,
        updated_at
    ) 
    SELECT 
        (v_original_data->>'id')::uuid,
        v_original_data->>'title',
        v_original_data->>'description',
        (v_original_data->>'priority_id')::uuid,
        CASE 
            WHEN v_original_data->>'due_date' IS NOT NULL 
            THEN (v_original_data->>'due_date')::date 
            ELSE NULL 
        END,
        (v_original_data->>'estimated_minutes')::integer,
        (v_original_data->>'created_by_user_id')::uuid,
        (v_original_data->>'assigned_user_id')::uuid,
        false, -- No completado para poder trabajar nuevamente
        NULL, -- Sin fecha de completado
        COALESCE((v_original_data->>'created_at')::timestamptz, now()),
        now() -- Actualizar fecha de modificación
    RETURNING id INTO v_todo_id;
    
    -- Recrear el control de TODO en estado PENDIENTE si existía
    IF v_control_data IS NOT NULL AND v_control_data != 'null'::jsonb THEN
        INSERT INTO todo_control (
            todo_id,
            user_id,
            status_id,
            total_time_minutes,
            started_at,
            created_at,
            updated_at
        ) VALUES (
            v_todo_id,
            (v_control_data->>'user_id')::uuid,
            (SELECT id FROM case_status_control WHERE name = 'PENDIENTE' LIMIT 1), -- Estado pendiente para poder trabajar nuevamente
            COALESCE((v_control_data->>'total_time_minutes')::integer, 0), -- Preservar tiempo total
            NULL, -- Sin fecha de inicio activa
            now(),
            now()
        ) RETURNING id INTO v_control_id;
        
        -- Restaurar entradas de tiempo automáticas si existen
        IF v_control_data ? 'time_entries' AND jsonb_array_length(v_control_data->'time_entries') > 0 THEN
            FOR v_time_entry IN SELECT * FROM jsonb_array_elements(v_control_data->'time_entries')
            LOOP
                INSERT INTO todo_time_entries (
                    todo_control_id,
                    user_id,
                    start_time,
                    end_time,
                    duration_minutes,
                    entry_type,
                    description,
                    created_at
                ) VALUES (
                    v_control_id,
                    (v_time_entry->>'user_id')::uuid,
                    (v_time_entry->>'start_time')::timestamptz,
                    (v_time_entry->>'end_time')::timestamptz,
                    (v_time_entry->>'duration_minutes')::integer,
                    COALESCE(v_time_entry->>'entry_type', 'automatic'),
                    v_time_entry->>'description',
                    COALESCE((v_time_entry->>'created_at')::timestamptz, now())
                );
            END LOOP;
        END IF;
        
        -- Restaurar entradas de tiempo manual si existen
        IF v_control_data ? 'manual_time_entries' AND jsonb_array_length(v_control_data->'manual_time_entries') > 0 THEN
            FOR v_manual_entry IN SELECT * FROM jsonb_array_elements(v_control_data->'manual_time_entries')
            LOOP
                INSERT INTO todo_manual_time_entries (
                    todo_control_id,
                    user_id,
                    date,
                    duration_minutes,
                    description,
                    created_by,
                    created_at
                ) VALUES (
                    v_control_id,
                    (v_manual_entry->>'user_id')::uuid,
                    (v_manual_entry->>'date')::date,
                    (v_manual_entry->>'duration_minutes')::integer,
                    v_manual_entry->>'description',
                    (v_manual_entry->>'created_by')::uuid,
                    COALESCE((v_manual_entry->>'created_at')::timestamptz, now())
                );
            END LOOP;
        END IF;
    END IF;
    
    -- Marcar como restaurado en el archivo
    UPDATE archived_todos 
    SET 
        is_restored = true,
        restored_at = now(),
        restored_by = p_restored_by,
        updated_at = now()
    WHERE id = p_archived_id;
    
    RETURN v_todo_id;
END;
$$;


ALTER FUNCTION "public"."restore_todo"("p_archived_id" "uuid", "p_restored_by" "uuid", "p_reason" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."restore_todo"("p_archived_id" "uuid", "p_restored_by" "uuid", "p_reason" "text") IS 'Restaura un TODO archivado recreando los registros originales en estado PENDIENTE y preservando todo el historial de tiempo';



CREATE OR REPLACE FUNCTION "public"."search_notes"("search_term" "text", "user_id" "uuid", "limit_count" integer DEFAULT 50) RETURNS TABLE("id" "uuid", "title" character varying, "content" "text", "tags" "text"[], "case_id" "uuid", "created_by" "uuid", "assigned_to" "uuid", "is_important" boolean, "is_archived" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "case_number" character varying, "creator_name" character varying, "assigned_name" character varying)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.content,
    n.tags,
    n.case_id,
    n.created_by,
    n.assigned_to,
    n.is_important,
    n.is_archived,
    n.created_at,
    n.updated_at,
    c.numero_caso as case_number,
    creator.full_name as creator_name,
    assigned.full_name as assigned_name
  FROM notes n
  LEFT JOIN cases c ON n.case_id = c.id
  LEFT JOIN user_profiles creator ON n.created_by = creator.id
  LEFT JOIN user_profiles assigned ON n.assigned_to = assigned.id
  WHERE 
    can_view_note(n.id, user_id)
    AND (
      n.title ILIKE '%' || search_term || '%'
      OR n.content ILIKE '%' || search_term || '%'
      OR search_term = ANY(n.tags)
      OR to_tsvector('spanish', n.title || ' ' || n.content) @@ plainto_tsquery('spanish', search_term)
    )
    AND n.is_archived = false
  ORDER BY 
    n.is_important DESC,
    n.updated_at DESC
  LIMIT limit_count;
END;
$$;


ALTER FUNCTION "public"."search_notes"("search_term" "text", "user_id" "uuid", "limit_count" integer) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."search_notes"("search_term" "text", "user_id" "uuid", "limit_count" integer) IS 'Busca notas por texto con información adicional - ACTUALIZADO: Incluye rol auditor';



CREATE OR REPLACE FUNCTION "public"."sync_todo_completion_status"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  -- Si se marca como completado el control
  IF NEW.completed_at IS NOT NULL AND (OLD.completed_at IS NULL OR OLD.completed_at IS DISTINCT FROM NEW.completed_at) THEN
    UPDATE todos 
    SET is_completed = true, updated_at = now()
    WHERE id = NEW.todo_id;
  END IF;
  
  -- Si se desmarca como completado el control
  IF NEW.completed_at IS NULL AND OLD.completed_at IS NOT NULL THEN
    UPDATE todos 
    SET is_completed = false, updated_at = now()
    WHERE id = NEW.todo_id;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_todo_completion_status"() OWNER TO "postgres";


COMMENT ON FUNCTION "public"."sync_todo_completion_status"() IS 'Mantiene sincronizado el campo is_completed de la tabla todos con el estado de completado en todo_control';



CREATE OR REPLACE FUNCTION "public"."toggle_todo_timer"("p_todo_id" "uuid", "p_action" "text" DEFAULT 'toggle'::"text") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_control_id UUID;
    v_is_active BOOLEAN;
    v_start_time TIMESTAMPTZ;
    v_entry_id UUID;
    v_duration INTEGER;
    result JSON;
BEGIN
    -- Obtener información del control
    SELECT id, is_timer_active, timer_start_at
    INTO v_control_id, v_is_active, v_start_time
    FROM todo_control
    WHERE todo_id = p_todo_id;
    
    -- Si no existe control, crearlo
    IF v_control_id IS NULL THEN
        v_control_id := initialize_todo_control(p_todo_id);
        v_is_active := false;
        v_start_time := NULL;
    END IF;
    
    -- Determinar acción a realizar
    IF p_action = 'start' OR (p_action = 'toggle' AND NOT v_is_active) THEN
        -- Iniciar timer
        UPDATE todo_control 
        SET 
            is_timer_active = true,
            timer_start_at = NOW(),
            started_at = COALESCE(started_at, NOW()),
            updated_at = NOW()
        WHERE id = v_control_id;
        
        -- Actualizar estado a "En Curso" si está en "Pendiente"
        UPDATE todo_control 
        SET status_id = (
            SELECT id FROM case_status_control 
            WHERE name = 'En Curso' 
            LIMIT 1
        )
        WHERE id = v_control_id 
        AND status_id = (
            SELECT id FROM case_status_control 
            WHERE name = 'Pendiente' 
            LIMIT 1
        );
        
        result := json_build_object(
            'action', 'started',
            'is_active', true,
            'start_time', NOW()
        );
        
    ELSIF p_action = 'stop' OR (p_action = 'toggle' AND v_is_active) THEN
        -- Calcular duración
        v_duration := EXTRACT(EPOCH FROM (NOW() - v_start_time)) / 60;
        
        -- Crear entrada de tiempo automática
        INSERT INTO todo_time_entries (
            todo_control_id,
            user_id,
            start_time,
            end_time,
            duration_minutes,
            entry_type,
            description
        )
        VALUES (
            v_control_id,
            auth.uid(),
            v_start_time,
            NOW(),
            v_duration,
            'automatic',
            'Sesión de trabajo automática'
        )
        RETURNING id INTO v_entry_id;
        
        -- Actualizar control
        UPDATE todo_control 
        SET 
            is_timer_active = false,
            timer_start_at = NULL,
            total_time_minutes = total_time_minutes + v_duration,
            updated_at = NOW()
        WHERE id = v_control_id;
        
        result := json_build_object(
            'action', 'stopped',
            'is_active', false,
            'duration_minutes', v_duration,
            'entry_id', v_entry_id
        );
    END IF;
    
    RETURN result;
END;
$$;


ALTER FUNCTION "public"."toggle_todo_timer"("p_todo_id" "uuid", "p_action" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_archive_policies_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_archive_policies_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_archived_items_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_archived_items_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_case_control_total_time"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Actualizar el tiempo total del case_control
    UPDATE case_control 
    SET total_time_minutes = (
        SELECT COALESCE(SUM(duration_minutes), 0) 
        FROM time_entries 
        WHERE case_control_id = COALESCE(NEW.case_control_id, OLD.case_control_id)
        AND duration_minutes IS NOT NULL
    ) + (
        SELECT COALESCE(SUM(duration_minutes), 0)
        FROM manual_time_entries
        WHERE case_control_id = COALESCE(NEW.case_control_id, OLD.case_control_id)
    )
    WHERE id = COALESCE(NEW.case_control_id, OLD.case_control_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."update_case_control_total_time"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_notes_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_notes_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_case_control_relationships"() RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    test_result BOOLEAN := true;
BEGIN
    -- Verificar que podemos hacer joins básicos
    PERFORM cc.id, up.full_name
    FROM case_control cc
    JOIN user_profiles up ON cc.user_id = up.id
    LIMIT 1;
    
    RETURN test_result;
EXCEPTION
    WHEN OTHERS THEN
        RETURN false;
END;
$$;


ALTER FUNCTION "public"."verify_case_control_relationships"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."aplicaciones" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" character varying(100) NOT NULL,
    "descripcion" "text",
    "activo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."aplicaciones" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."archive_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "action_type" character varying NOT NULL,
    "item_type" character varying NOT NULL,
    "item_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "archive_audit_log_action_type_check" CHECK ((("action_type")::"text" = ANY ((ARRAY['ARCHIVE'::character varying, 'RESTORE'::character varying])::"text"[]))),
    CONSTRAINT "archive_audit_log_item_type_check" CHECK ((("item_type")::"text" = ANY ((ARRAY['CASE'::character varying, 'TODO'::character varying])::"text"[])))
);


ALTER TABLE "public"."archive_audit_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."archive_audit_log" IS 'Log de auditoría para acciones de archivo y restauración';



CREATE TABLE IF NOT EXISTS "public"."archive_deletion_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "item_type" character varying(10) NOT NULL,
    "item_id" "uuid" NOT NULL,
    "item_identifier" character varying(255) NOT NULL,
    "deleted_by" "uuid" NOT NULL,
    "deleted_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "deletion_reason" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "archive_deletion_log_item_type_check" CHECK ((("item_type")::"text" = ANY ((ARRAY['case'::character varying, 'todo'::character varying])::"text"[])))
);


ALTER TABLE "public"."archive_deletion_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."archive_deletion_log" IS 'Log de eliminaciones permanentes de elementos archivados';



CREATE OR REPLACE VIEW "public"."archive_deletion_stats" WITH ("security_invoker"='true') AS
 SELECT "item_type",
    "count"(*) AS "total_deletions",
    "count"(DISTINCT "deleted_by") AS "unique_deleters",
    "min"("deleted_at") AS "first_deletion",
    "max"("deleted_at") AS "last_deletion"
   FROM "public"."archive_deletion_log"
  GROUP BY "item_type";


ALTER VIEW "public"."archive_deletion_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."archived_cases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "original_case_id" "uuid" NOT NULL,
    "case_number" character varying NOT NULL,
    "description" "text",
    "classification" character varying NOT NULL,
    "total_time_minutes" integer DEFAULT 0,
    "completed_at" timestamp with time zone,
    "archived_at" timestamp with time zone DEFAULT "now"(),
    "archived_by" "uuid" NOT NULL,
    "original_data" "jsonb" NOT NULL,
    "control_data" "jsonb" NOT NULL,
    "restored_at" timestamp with time zone,
    "restored_by" "uuid",
    "is_restored" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "archive_reason" "text"
);


ALTER TABLE "public"."archived_cases" OWNER TO "postgres";


COMMENT ON TABLE "public"."archived_cases" IS 'Casos archivados con todos sus datos y tiempos';



COMMENT ON COLUMN "public"."archived_cases"."completed_at" IS 'Fecha de completado del caso - NULL si no fue completado antes del archivado';



COMMENT ON COLUMN "public"."archived_cases"."original_data" IS 'Datos completos del caso original en formato JSON';



COMMENT ON COLUMN "public"."archived_cases"."control_data" IS 'Datos de control y tiempo en formato JSON';



COMMENT ON COLUMN "public"."archived_cases"."archive_reason" IS 'Razón opcional para archivar el caso';



CREATE TABLE IF NOT EXISTS "public"."archived_todos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "original_todo_id" "uuid" NOT NULL,
    "title" character varying NOT NULL,
    "description" "text",
    "priority" character varying NOT NULL,
    "total_time_minutes" integer DEFAULT 0,
    "completed_at" timestamp with time zone,
    "archived_at" timestamp with time zone DEFAULT "now"(),
    "archived_by" "uuid" NOT NULL,
    "original_data" "jsonb" NOT NULL,
    "control_data" "jsonb" NOT NULL,
    "restored_at" timestamp with time zone,
    "restored_by" "uuid",
    "is_restored" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "archive_reason" "text"
);


ALTER TABLE "public"."archived_todos" OWNER TO "postgres";


COMMENT ON TABLE "public"."archived_todos" IS 'TODOs archivados con todos sus datos y tiempos';



COMMENT ON COLUMN "public"."archived_todos"."completed_at" IS 'Fecha de completado del TODO - NULL si no fue completado antes del archivado';



COMMENT ON COLUMN "public"."archived_todos"."original_data" IS 'Datos completos del TODO original en formato JSON';



COMMENT ON COLUMN "public"."archived_todos"."control_data" IS 'Datos de control y tiempo en formato JSON';



COMMENT ON COLUMN "public"."archived_todos"."archive_reason" IS 'Razón opcional para archivar el TODO';



CREATE OR REPLACE VIEW "public"."archive_stats" WITH ("security_invoker"='true') AS
 SELECT ( SELECT "count"(*) AS "count"
           FROM "public"."archived_cases"
          WHERE ("archived_cases"."is_restored" = false)) AS "total_archived_cases",
    ( SELECT "count"(*) AS "count"
           FROM "public"."archived_todos"
          WHERE ("archived_todos"."is_restored" = false)) AS "total_archived_todos",
    (( SELECT COALESCE("sum"("archived_cases"."total_time_minutes"), (0)::bigint) AS "coalesce"
           FROM "public"."archived_cases"
          WHERE ("archived_cases"."is_restored" = false)) + ( SELECT COALESCE("sum"("archived_todos"."total_time_minutes"), (0)::bigint) AS "coalesce"
           FROM "public"."archived_todos"
          WHERE ("archived_todos"."is_restored" = false))) AS "total_archived_time_minutes",
    (( SELECT "count"(*) AS "count"
           FROM "public"."archived_cases"
          WHERE (("archived_cases"."archived_at" >= "date_trunc"('month'::"text", "now"())) AND ("archived_cases"."is_restored" = false))) + ( SELECT "count"(*) AS "count"
           FROM "public"."archived_todos"
          WHERE (("archived_todos"."archived_at" >= "date_trunc"('month'::"text", "now"())) AND ("archived_todos"."is_restored" = false)))) AS "archived_this_month",
    (( SELECT "count"(*) AS "count"
           FROM "public"."archived_cases"
          WHERE ("archived_cases"."restored_at" >= "date_trunc"('month'::"text", "now"()))) + ( SELECT "count"(*) AS "count"
           FROM "public"."archived_todos"
          WHERE ("archived_todos"."restored_at" >= "date_trunc"('month'::"text", "now"())))) AS "restored_this_month";


ALTER VIEW "public"."archive_stats" OWNER TO "postgres";


COMMENT ON VIEW "public"."archive_stats" IS 'Vista que devuelve estadísticas consolidadas de archivos en una sola fila';



CREATE TABLE IF NOT EXISTS "public"."case_control" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status_id" "uuid" NOT NULL,
    "total_time_minutes" integer DEFAULT 0,
    "timer_start_at" timestamp with time zone,
    "is_timer_active" boolean DEFAULT false,
    "assigned_at" timestamp with time zone DEFAULT "now"(),
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."case_control" OWNER TO "postgres";


COMMENT ON TABLE "public"."case_control" IS 'Control de casos con seguimiento de tiempo y estados';



COMMENT ON COLUMN "public"."case_control"."case_id" IS 'Caso controlado (FK a cases.id)';



COMMENT ON COLUMN "public"."case_control"."user_id" IS 'Usuario asignado al caso (FK a user_profiles.id)';



COMMENT ON COLUMN "public"."case_control"."status_id" IS 'Estado actual del control (FK a case_status_control.id)';



CREATE TABLE IF NOT EXISTS "public"."case_status_control" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(50) NOT NULL,
    "description" "text",
    "color" character varying(7) DEFAULT '#6B7280'::character varying,
    "is_active" boolean DEFAULT true,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."case_status_control" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."cases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "numero_caso" character varying(50) NOT NULL,
    "descripcion" "text" NOT NULL,
    "fecha" "date" NOT NULL,
    "origen_id" "uuid",
    "aplicacion_id" "uuid",
    "historial_caso" integer NOT NULL,
    "conocimiento_modulo" integer NOT NULL,
    "manipulacion_datos" integer NOT NULL,
    "claridad_descripcion" integer NOT NULL,
    "causa_fallo" integer NOT NULL,
    "puntuacion" integer NOT NULL,
    "clasificacion" character varying(20) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    CONSTRAINT "cases_causa_fallo_check" CHECK ((("causa_fallo" >= 1) AND ("causa_fallo" <= 3))),
    CONSTRAINT "cases_claridad_descripcion_check" CHECK ((("claridad_descripcion" >= 1) AND ("claridad_descripcion" <= 3))),
    CONSTRAINT "cases_clasificacion_check" CHECK ((("clasificacion")::"text" = ANY ((ARRAY['Baja Complejidad'::character varying, 'Media Complejidad'::character varying, 'Alta Complejidad'::character varying])::"text"[]))),
    CONSTRAINT "cases_conocimiento_modulo_check" CHECK ((("conocimiento_modulo" >= 1) AND ("conocimiento_modulo" <= 3))),
    CONSTRAINT "cases_historial_caso_check" CHECK ((("historial_caso" >= 1) AND ("historial_caso" <= 3))),
    CONSTRAINT "cases_manipulacion_datos_check" CHECK ((("manipulacion_datos" >= 1) AND ("manipulacion_datos" <= 3))),
    CONSTRAINT "cases_puntuacion_check" CHECK ((("puntuacion" >= 5) AND ("puntuacion" <= 15)))
);


ALTER TABLE "public"."cases" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."origenes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nombre" character varying(100) NOT NULL,
    "descripcion" "text",
    "activo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."origenes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" NOT NULL,
    "email" character varying(255) NOT NULL,
    "full_name" character varying(255),
    "role_id" "uuid",
    "is_active" boolean DEFAULT true,
    "last_login_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_profiles" IS 'Tabla de perfiles de usuario. RLS deshabilitado para evitar recursión infinita en validaciones de permisos. Acceso controlado por funciones has_system_access() y has_permission().';



CREATE OR REPLACE VIEW "public"."case_control_detailed" WITH ("security_invoker"='true') AS
 SELECT "cc"."id",
    "cc"."case_id",
    "c"."numero_caso" AS "case_number",
    "c"."descripcion" AS "case_description",
    "c"."clasificacion",
    "c"."puntuacion",
    "cc"."user_id",
    "up"."full_name" AS "assigned_user_name",
    "cc"."status_id",
    "cs"."name" AS "status_name",
    "cs"."color" AS "status_color",
    "cs"."description" AS "status_description",
    "cc"."total_time_minutes",
    "cc"."is_timer_active",
    "cc"."timer_start_at",
    "cc"."assigned_at",
    "cc"."started_at",
    "cc"."completed_at",
    "cc"."created_at",
    "cc"."updated_at",
    "o"."nombre" AS "origen_name",
    "a"."nombre" AS "application_name",
    "creator"."full_name" AS "created_by_name",
    "c"."fecha" AS "case_date"
   FROM (((((("public"."case_control" "cc"
     LEFT JOIN "public"."cases" "c" ON (("cc"."case_id" = "c"."id")))
     LEFT JOIN "public"."user_profiles" "up" ON (("cc"."user_id" = "up"."id")))
     LEFT JOIN "public"."case_status_control" "cs" ON (("cc"."status_id" = "cs"."id")))
     LEFT JOIN "public"."origenes" "o" ON (("c"."origen_id" = "o"."id")))
     LEFT JOIN "public"."aplicaciones" "a" ON (("c"."aplicacion_id" = "a"."id")))
     LEFT JOIN "public"."user_profiles" "creator" ON (("c"."user_id" = "creator"."id")));


ALTER VIEW "public"."case_control_detailed" OWNER TO "postgres";


COMMENT ON VIEW "public"."case_control_detailed" IS 'Vista detallada del control de casos con información completa de casos, usuarios, estados, orígenes y aplicaciones';



CREATE TABLE IF NOT EXISTS "public"."manual_time_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_control_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "duration_minutes" integer NOT NULL,
    "description" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid" NOT NULL,
    CONSTRAINT "manual_time_entries_duration_minutes_check" CHECK (("duration_minutes" > 0))
);


ALTER TABLE "public"."manual_time_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying(255) NOT NULL,
    "content" "text" NOT NULL,
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "case_id" "uuid",
    "created_by" "uuid" NOT NULL,
    "assigned_to" "uuid",
    "is_important" boolean DEFAULT false,
    "is_archived" boolean DEFAULT false,
    "archived_at" timestamp with time zone,
    "archived_by" "uuid",
    "reminder_date" timestamp with time zone,
    "is_reminder_sent" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."notes" OWNER TO "postgres";


COMMENT ON TABLE "public"."notes" IS 'Tabla para almacenar notas del sistema - permite recordatorios y asociación con casos';



COMMENT ON COLUMN "public"."notes"."title" IS 'Título de la nota';



COMMENT ON COLUMN "public"."notes"."content" IS 'Contenido completo de la nota';



COMMENT ON COLUMN "public"."notes"."tags" IS 'Array de etiquetas para categorizar la nota';



COMMENT ON COLUMN "public"."notes"."case_id" IS 'ID del caso asociado (opcional)';



COMMENT ON COLUMN "public"."notes"."created_by" IS 'Usuario que creó la nota';



COMMENT ON COLUMN "public"."notes"."assigned_to" IS 'Usuario al que se asignó la nota (opcional)';



COMMENT ON COLUMN "public"."notes"."is_important" IS 'Marca si la nota es importante/urgente';



COMMENT ON COLUMN "public"."notes"."is_archived" IS 'Marca si la nota está archivada';



COMMENT ON COLUMN "public"."notes"."reminder_date" IS 'Fecha para mostrar recordatorio';



COMMENT ON COLUMN "public"."notes"."is_reminder_sent" IS 'Marca si ya se envió el recordatorio';



CREATE TABLE IF NOT EXISTS "public"."permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(100) NOT NULL,
    "description" "text",
    "resource" character varying(50) NOT NULL,
    "action" character varying(20) NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."role_permissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role_id" "uuid" NOT NULL,
    "permission_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."role_permissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(50) NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL
);


ALTER TABLE "public"."roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."time_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "case_control_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone,
    "duration_minutes" integer,
    "entry_type" character varying(20) NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "time_entries_entry_type_check" CHECK ((("entry_type")::"text" = ANY ((ARRAY['automatic'::character varying, 'manual'::character varying])::"text"[])))
);


ALTER TABLE "public"."time_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."todo_control" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "todo_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "status_id" "uuid" NOT NULL,
    "total_time_minutes" integer DEFAULT 0,
    "timer_start_at" timestamp with time zone,
    "is_timer_active" boolean DEFAULT false,
    "assigned_at" timestamp with time zone DEFAULT "now"(),
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."todo_control" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."todo_manual_time_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "todo_control_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "date" "date" NOT NULL,
    "duration_minutes" integer NOT NULL,
    "description" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "created_by" "uuid" NOT NULL,
    CONSTRAINT "todo_manual_time_entries_duration_minutes_check" CHECK (("duration_minutes" > 0))
);


ALTER TABLE "public"."todo_manual_time_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."todo_priorities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying NOT NULL,
    "description" "text",
    "color" character varying DEFAULT '#6B7280'::character varying,
    "level" integer NOT NULL,
    "is_active" boolean DEFAULT true,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "todo_priorities_level_check" CHECK ((("level" >= 1) AND ("level" <= 5)))
);


ALTER TABLE "public"."todo_priorities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."todo_time_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "todo_control_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone,
    "duration_minutes" integer,
    "entry_type" character varying NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "todo_time_entries_entry_type_check" CHECK ((("entry_type")::"text" = ANY ((ARRAY['automatic'::character varying, 'manual'::character varying])::"text"[])))
);


ALTER TABLE "public"."todo_time_entries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."todos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" character varying NOT NULL,
    "description" "text",
    "priority_id" "uuid" NOT NULL,
    "assigned_user_id" "uuid",
    "created_by_user_id" "uuid" NOT NULL,
    "due_date" "date",
    "estimated_minutes" integer DEFAULT 0,
    "is_completed" boolean DEFAULT false,
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."todos" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."todo_time_summary" WITH ("security_invoker"='true') AS
 SELECT "tc"."todo_id",
    "t"."title",
    "tc"."total_time_minutes",
    "count"("tte"."id") AS "time_entry_count",
    "count"("tmte"."id") AS "manual_entry_count",
    "sum"("tte"."duration_minutes") AS "automatic_time",
    "sum"("tmte"."duration_minutes") AS "manual_time"
   FROM ((("public"."todo_control" "tc"
     LEFT JOIN "public"."todos" "t" ON (("tc"."todo_id" = "t"."id")))
     LEFT JOIN "public"."todo_time_entries" "tte" ON (("tc"."id" = "tte"."todo_control_id")))
     LEFT JOIN "public"."todo_manual_time_entries" "tmte" ON (("tc"."id" = "tmte"."todo_control_id")))
  GROUP BY "tc"."todo_id", "t"."title", "tc"."total_time_minutes";


ALTER VIEW "public"."todo_time_summary" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."todos_with_details" WITH ("security_invoker"='true') AS
 SELECT "t"."id",
    "t"."title",
    "t"."description",
    "t"."due_date",
    "t"."estimated_minutes",
    "t"."is_completed",
    "t"."completed_at",
    "t"."created_at",
    "t"."updated_at",
    "tp"."name" AS "priority_name",
    "tp"."description" AS "priority_description",
    "tp"."color" AS "priority_color",
    "tp"."level" AS "priority_level",
    "t"."assigned_user_id",
    "au"."full_name" AS "assigned_user_name",
    "au"."email" AS "assigned_user_email",
    "t"."created_by_user_id",
    "cu"."full_name" AS "created_by_user_name",
    "cu"."email" AS "created_by_user_email",
    "tc"."id" AS "control_id",
    "tc"."total_time_minutes",
    "tc"."is_timer_active",
    "tc"."timer_start_at",
    "tc"."started_at",
    "tc"."completed_at" AS "control_completed_at",
    "cs"."name" AS "status_name",
    "cs"."description" AS "status_description",
    "cs"."color" AS "status_color",
    (("t"."due_date" < CURRENT_DATE) AND (NOT "t"."is_completed")) AS "is_overdue",
    ("tp"."level" >= 4) AS "is_high_priority",
        CASE
            WHEN ("tc"."total_time_minutes" >= 60) THEN ((((("tc"."total_time_minutes" / 60))::"text" || 'h '::"text") || (("tc"."total_time_minutes" % 60))::"text") || 'm'::"text")
            ELSE (("tc"."total_time_minutes")::"text" || 'm'::"text")
        END AS "total_time_formatted"
   FROM ((((("public"."todos" "t"
     LEFT JOIN "public"."todo_priorities" "tp" ON (("t"."priority_id" = "tp"."id")))
     LEFT JOIN "public"."user_profiles" "au" ON (("t"."assigned_user_id" = "au"."id")))
     LEFT JOIN "public"."user_profiles" "cu" ON (("t"."created_by_user_id" = "cu"."id")))
     LEFT JOIN "public"."todo_control" "tc" ON (("t"."id" = "tc"."todo_id")))
     LEFT JOIN "public"."case_status_control" "cs" ON (("tc"."status_id" = "cs"."id")));


ALTER VIEW "public"."todos_with_details" OWNER TO "postgres";


ALTER TABLE ONLY "public"."aplicaciones"
    ADD CONSTRAINT "aplicaciones_nombre_key" UNIQUE ("nombre");



ALTER TABLE ONLY "public"."aplicaciones"
    ADD CONSTRAINT "aplicaciones_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."archive_audit_log"
    ADD CONSTRAINT "archive_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."archive_deletion_log"
    ADD CONSTRAINT "archive_deletion_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."archived_cases"
    ADD CONSTRAINT "archived_cases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."archived_todos"
    ADD CONSTRAINT "archived_todos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."case_control"
    ADD CONSTRAINT "case_control_case_id_key" UNIQUE ("case_id");



ALTER TABLE ONLY "public"."case_control"
    ADD CONSTRAINT "case_control_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."case_status_control"
    ADD CONSTRAINT "case_status_control_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."case_status_control"
    ADD CONSTRAINT "case_status_control_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."cases"
    ADD CONSTRAINT "cases_numero_caso_key" UNIQUE ("numero_caso");



ALTER TABLE ONLY "public"."cases"
    ADD CONSTRAINT "cases_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."manual_time_entries"
    ADD CONSTRAINT "manual_time_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."origenes"
    ADD CONSTRAINT "origenes_nombre_key" UNIQUE ("nombre");



ALTER TABLE ONLY "public"."origenes"
    ADD CONSTRAINT "origenes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."permissions"
    ADD CONSTRAINT "permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_permission_id_key" UNIQUE ("role_id", "permission_id");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."roles"
    ADD CONSTRAINT "roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."time_entries"
    ADD CONSTRAINT "time_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."todo_control"
    ADD CONSTRAINT "todo_control_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."todo_control"
    ADD CONSTRAINT "todo_control_todo_id_key" UNIQUE ("todo_id");



ALTER TABLE ONLY "public"."todo_manual_time_entries"
    ADD CONSTRAINT "todo_manual_time_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."todo_priorities"
    ADD CONSTRAINT "todo_priorities_level_key" UNIQUE ("level");



ALTER TABLE ONLY "public"."todo_priorities"
    ADD CONSTRAINT "todo_priorities_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."todo_priorities"
    ADD CONSTRAINT "todo_priorities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."todo_time_entries"
    ADD CONSTRAINT "todo_time_entries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."todos"
    ADD CONSTRAINT "todos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_aplicaciones_activo" ON "public"."aplicaciones" USING "btree" ("activo");



CREATE INDEX "idx_aplicaciones_nombre" ON "public"."aplicaciones" USING "btree" ("nombre");



CREATE INDEX "idx_archive_deletion_log_deleted_at" ON "public"."archive_deletion_log" USING "btree" ("deleted_at");



CREATE INDEX "idx_archive_deletion_log_deleted_by" ON "public"."archive_deletion_log" USING "btree" ("deleted_by");



CREATE INDEX "idx_archive_deletion_log_item_type" ON "public"."archive_deletion_log" USING "btree" ("item_type");



CREATE INDEX "idx_archived_cases_archived_at" ON "public"."archived_cases" USING "btree" ("archived_at");



CREATE INDEX "idx_archived_cases_archived_by" ON "public"."archived_cases" USING "btree" ("archived_by");



CREATE INDEX "idx_archived_cases_case_number" ON "public"."archived_cases" USING "btree" ("case_number");



CREATE INDEX "idx_archived_cases_classification" ON "public"."archived_cases" USING "btree" ("classification");



CREATE INDEX "idx_archived_cases_is_restored" ON "public"."archived_cases" USING "btree" ("is_restored");



CREATE INDEX "idx_archived_cases_original_case_id" ON "public"."archived_cases" USING "btree" ("original_case_id");



CREATE INDEX "idx_archived_todos_archived_at" ON "public"."archived_todos" USING "btree" ("archived_at");



CREATE INDEX "idx_archived_todos_archived_by" ON "public"."archived_todos" USING "btree" ("archived_by");



CREATE INDEX "idx_archived_todos_is_restored" ON "public"."archived_todos" USING "btree" ("is_restored");



CREATE INDEX "idx_archived_todos_original_todo_id" ON "public"."archived_todos" USING "btree" ("original_todo_id");



CREATE INDEX "idx_archived_todos_priority" ON "public"."archived_todos" USING "btree" ("priority");



CREATE INDEX "idx_archived_todos_title" ON "public"."archived_todos" USING "btree" ("title");



CREATE INDEX "idx_case_control_case_id" ON "public"."case_control" USING "btree" ("case_id");



CREATE INDEX "idx_case_control_status_id" ON "public"."case_control" USING "btree" ("status_id");



CREATE INDEX "idx_case_control_user_id" ON "public"."case_control" USING "btree" ("user_id");



CREATE INDEX "idx_cases_aplicacion_id" ON "public"."cases" USING "btree" ("aplicacion_id");



CREATE INDEX "idx_cases_clasificacion" ON "public"."cases" USING "btree" ("clasificacion");



CREATE INDEX "idx_cases_fecha" ON "public"."cases" USING "btree" ("fecha");



CREATE INDEX "idx_cases_numero_caso" ON "public"."cases" USING "btree" ("numero_caso");



CREATE INDEX "idx_cases_origen_id" ON "public"."cases" USING "btree" ("origen_id");



CREATE INDEX "idx_cases_user_id" ON "public"."cases" USING "btree" ("user_id");



CREATE INDEX "idx_manual_time_entries_case_control_id" ON "public"."manual_time_entries" USING "btree" ("case_control_id");



CREATE INDEX "idx_manual_time_entries_date" ON "public"."manual_time_entries" USING "btree" ("date");



CREATE INDEX "idx_notes_active" ON "public"."notes" USING "btree" ("created_at") WHERE ("is_archived" = false);



CREATE INDEX "idx_notes_assigned_to" ON "public"."notes" USING "btree" ("assigned_to");



CREATE INDEX "idx_notes_case_id" ON "public"."notes" USING "btree" ("case_id");



CREATE INDEX "idx_notes_created_at" ON "public"."notes" USING "btree" ("created_at");



CREATE INDEX "idx_notes_created_by" ON "public"."notes" USING "btree" ("created_by");



CREATE INDEX "idx_notes_reminder_date" ON "public"."notes" USING "btree" ("reminder_date") WHERE ("reminder_date" IS NOT NULL);



CREATE INDEX "idx_notes_tags" ON "public"."notes" USING "gin" ("tags");



CREATE INDEX "idx_notes_text_search" ON "public"."notes" USING "gin" ("to_tsvector"('"spanish"'::"regconfig", (((COALESCE("title", ''::character varying))::"text" || ' '::"text") || COALESCE("content", ''::"text"))));



CREATE INDEX "idx_origenes_activo" ON "public"."origenes" USING "btree" ("activo");



CREATE INDEX "idx_origenes_nombre" ON "public"."origenes" USING "btree" ("nombre");



CREATE INDEX "idx_permissions_resource_action" ON "public"."permissions" USING "btree" ("resource", "action");



CREATE INDEX "idx_role_permissions_permission_id" ON "public"."role_permissions" USING "btree" ("permission_id");



CREATE INDEX "idx_role_permissions_role_id" ON "public"."role_permissions" USING "btree" ("role_id");



CREATE INDEX "idx_time_entries_case_control_id" ON "public"."time_entries" USING "btree" ("case_control_id");



CREATE INDEX "idx_time_entries_start_time" ON "public"."time_entries" USING "btree" ("start_time");



CREATE INDEX "idx_time_entries_user_id" ON "public"."time_entries" USING "btree" ("user_id");



CREATE INDEX "idx_todo_control_status_id" ON "public"."todo_control" USING "btree" ("status_id");



CREATE INDEX "idx_todo_control_timer_active" ON "public"."todo_control" USING "btree" ("is_timer_active");



CREATE INDEX "idx_todo_control_todo_id" ON "public"."todo_control" USING "btree" ("todo_id");



CREATE INDEX "idx_todo_control_user_id" ON "public"."todo_control" USING "btree" ("user_id");



CREATE INDEX "idx_todo_manual_time_entries_control_id" ON "public"."todo_manual_time_entries" USING "btree" ("todo_control_id");



CREATE INDEX "idx_todo_manual_time_entries_date" ON "public"."todo_manual_time_entries" USING "btree" ("date");



CREATE INDEX "idx_todo_time_entries_control_id" ON "public"."todo_time_entries" USING "btree" ("todo_control_id");



CREATE INDEX "idx_todo_time_entries_start_time" ON "public"."todo_time_entries" USING "btree" ("start_time");



CREATE INDEX "idx_todo_time_entries_user_id" ON "public"."todo_time_entries" USING "btree" ("user_id");



CREATE INDEX "idx_todos_assigned_user" ON "public"."todos" USING "btree" ("assigned_user_id");



CREATE INDEX "idx_todos_completed" ON "public"."todos" USING "btree" ("is_completed");



CREATE INDEX "idx_todos_created_by" ON "public"."todos" USING "btree" ("created_by_user_id");



CREATE INDEX "idx_todos_due_date" ON "public"."todos" USING "btree" ("due_date");



CREATE INDEX "idx_todos_priority" ON "public"."todos" USING "btree" ("priority_id");



CREATE INDEX "idx_user_profiles_email" ON "public"."user_profiles" USING "btree" ("email");



CREATE INDEX "idx_user_profiles_role_id" ON "public"."user_profiles" USING "btree" ("role_id");



CREATE OR REPLACE TRIGGER "archive_cases_audit_trigger" AFTER INSERT OR UPDATE ON "public"."archived_cases" FOR EACH ROW EXECUTE FUNCTION "public"."archive_audit_trigger"();



CREATE OR REPLACE TRIGGER "archive_todos_audit_trigger" AFTER INSERT OR UPDATE ON "public"."archived_todos" FOR EACH ROW EXECUTE FUNCTION "public"."archive_audit_trigger"();



CREATE OR REPLACE TRIGGER "calculate_duration_trigger" BEFORE INSERT OR UPDATE ON "public"."time_entries" FOR EACH ROW EXECUTE FUNCTION "public"."calculate_time_entry_duration"();



CREATE OR REPLACE TRIGGER "notes_updated_at_trigger" BEFORE UPDATE ON "public"."notes" FOR EACH ROW EXECUTE FUNCTION "public"."update_notes_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_sync_todo_completion" AFTER UPDATE ON "public"."todo_control" FOR EACH ROW EXECUTE FUNCTION "public"."sync_todo_completion_status"();



COMMENT ON TRIGGER "trigger_sync_todo_completion" ON "public"."todo_control" IS 'Trigger que sincroniza automáticamente el estado de completado entre todo_control y todos';



CREATE OR REPLACE TRIGGER "update_aplicaciones_updated_at" BEFORE UPDATE ON "public"."aplicaciones" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_archived_cases_updated_at" BEFORE UPDATE ON "public"."archived_cases" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_archived_todos_updated_at" BEFORE UPDATE ON "public"."archived_todos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_case_control_updated_at" BEFORE UPDATE ON "public"."case_control" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_case_status_control_updated_at" BEFORE UPDATE ON "public"."case_status_control" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_cases_updated_at" BEFORE UPDATE ON "public"."cases" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_origenes_updated_at" BEFORE UPDATE ON "public"."origenes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_permissions_updated_at" BEFORE UPDATE ON "public"."permissions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_roles_updated_at" BEFORE UPDATE ON "public"."roles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_time_entries_updated_at" BEFORE UPDATE ON "public"."time_entries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_todo_control_updated_at" BEFORE UPDATE ON "public"."todo_control" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_todo_priorities_updated_at" BEFORE UPDATE ON "public"."todo_priorities" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_todo_time_entries_updated_at" BEFORE UPDATE ON "public"."todo_time_entries" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_todos_updated_at" BEFORE UPDATE ON "public"."todos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_total_time_on_manual_entry" AFTER INSERT OR DELETE OR UPDATE ON "public"."manual_time_entries" FOR EACH ROW EXECUTE FUNCTION "public"."update_case_control_total_time"();



CREATE OR REPLACE TRIGGER "update_total_time_on_time_entry" AFTER INSERT OR DELETE OR UPDATE ON "public"."time_entries" FOR EACH ROW EXECUTE FUNCTION "public"."update_case_control_total_time"();



CREATE OR REPLACE TRIGGER "update_user_profiles_updated_at" BEFORE UPDATE ON "public"."user_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."archive_audit_log"
    ADD CONSTRAINT "archive_audit_log_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."archive_deletion_log"
    ADD CONSTRAINT "archive_deletion_log_deleted_by_fkey" FOREIGN KEY ("deleted_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."archived_cases"
    ADD CONSTRAINT "archived_cases_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."archived_cases"
    ADD CONSTRAINT "archived_cases_restored_by_fkey" FOREIGN KEY ("restored_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."archived_todos"
    ADD CONSTRAINT "archived_todos_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."archived_todos"
    ADD CONSTRAINT "archived_todos_restored_by_fkey" FOREIGN KEY ("restored_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."case_control"
    ADD CONSTRAINT "case_control_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."case_control"
    ADD CONSTRAINT "case_control_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."case_status_control"("id");



ALTER TABLE ONLY "public"."case_control"
    ADD CONSTRAINT "case_control_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cases"
    ADD CONSTRAINT "cases_aplicacion_id_fkey" FOREIGN KEY ("aplicacion_id") REFERENCES "public"."aplicaciones"("id");



ALTER TABLE ONLY "public"."cases"
    ADD CONSTRAINT "cases_origen_id_fkey" FOREIGN KEY ("origen_id") REFERENCES "public"."origenes"("id");



ALTER TABLE ONLY "public"."cases"
    ADD CONSTRAINT "cases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."manual_time_entries"
    ADD CONSTRAINT "manual_time_entries_case_control_id_fkey" FOREIGN KEY ("case_control_id") REFERENCES "public"."case_control"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."manual_time_entries"
    ADD CONSTRAINT "manual_time_entries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."manual_time_entries"
    ADD CONSTRAINT "manual_time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_archived_by_fkey" FOREIGN KEY ("archived_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "public"."cases"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notes"
    ADD CONSTRAINT "notes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."time_entries"
    ADD CONSTRAINT "time_entries_case_control_id_fkey" FOREIGN KEY ("case_control_id") REFERENCES "public"."case_control"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."time_entries"
    ADD CONSTRAINT "time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."todo_control"
    ADD CONSTRAINT "todo_control_status_id_fkey" FOREIGN KEY ("status_id") REFERENCES "public"."case_status_control"("id");



ALTER TABLE ONLY "public"."todo_control"
    ADD CONSTRAINT "todo_control_todo_id_fkey" FOREIGN KEY ("todo_id") REFERENCES "public"."todos"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."todo_control"
    ADD CONSTRAINT "todo_control_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."todo_manual_time_entries"
    ADD CONSTRAINT "todo_manual_time_entries_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."todo_manual_time_entries"
    ADD CONSTRAINT "todo_manual_time_entries_todo_control_id_fkey" FOREIGN KEY ("todo_control_id") REFERENCES "public"."todo_control"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."todo_manual_time_entries"
    ADD CONSTRAINT "todo_manual_time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."todo_time_entries"
    ADD CONSTRAINT "todo_time_entries_todo_control_id_fkey" FOREIGN KEY ("todo_control_id") REFERENCES "public"."todo_control"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."todo_time_entries"
    ADD CONSTRAINT "todo_time_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."todos"
    ADD CONSTRAINT "todos_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."todos"
    ADD CONSTRAINT "todos_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "public"."user_profiles"("id");



ALTER TABLE ONLY "public"."todos"
    ADD CONSTRAINT "todos_priority_id_fkey" FOREIGN KEY ("priority_id") REFERENCES "public"."todo_priorities"("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE SET NULL;



CREATE POLICY "Admin can manage all notes" ON "public"."notes" USING ((EXISTS ( SELECT 1
   FROM ("public"."user_profiles" "up"
     JOIN "public"."roles" "r" ON (("up"."role_id" = "r"."id")))
  WHERE (("up"."id" = "auth"."uid"()) AND (("r"."name")::"text" = 'admin'::"text") AND ("up"."is_active" = true)))));



CREATE POLICY "Allow aplicaciones access based on permissions" ON "public"."aplicaciones" FOR SELECT TO "authenticated" USING (("public"."has_permission"("auth"."uid"(), 'admin.access'::"text") OR "public"."has_permission"("auth"."uid"(), 'system.access'::"text") OR "public"."has_permission"("auth"."uid"(), 'cases.create'::"text") OR "public"."has_permission"("auth"."uid"(), 'cases.read.own'::"text") OR "public"."has_permission"("auth"."uid"(), 'cases.read.all'::"text")));



CREATE POLICY "Allow archive_audit_log access to admins" ON "public"."archive_audit_log" TO "authenticated" USING ("public"."has_permission"("auth"."uid"(), 'admin.access'::"text"));



CREATE POLICY "Allow archive_deletion_log access to admins only" ON "public"."archive_deletion_log" TO "authenticated" USING ("public"."has_permission"("auth"."uid"(), 'admin.access'::"text"));



CREATE POLICY "Allow archived_cases access based on permissions and ownership" ON "public"."archived_cases" TO "authenticated" USING (("public"."has_permission"("auth"."uid"(), 'cases.read.all'::"text") OR ("public"."has_permission"("auth"."uid"(), 'cases.read.own'::"text") AND (("archived_by" = "auth"."uid"()) OR ((("original_data" ->> 'user_id'::"text"))::"uuid" = "auth"."uid"()))) OR "public"."has_permission"("auth"."uid"(), 'admin.access'::"text")));



COMMENT ON POLICY "Allow archived_cases access based on permissions and ownership" ON "public"."archived_cases" IS 'Analistas ven casos archivados propios o que crearon originalmente, otros según cases.read.all';



CREATE POLICY "Allow archived_todos access based on permissions and ownership" ON "public"."archived_todos" TO "authenticated" USING (("public"."has_permission"("auth"."uid"(), 'view_all_todos'::"text") OR ("public"."has_permission"("auth"."uid"(), 'view_todos'::"text") AND (("archived_by" = "auth"."uid"()) OR ((("original_data" ->> 'created_by_user_id'::"text"))::"uuid" = "auth"."uid"()) OR ((("original_data" ->> 'assigned_user_id'::"text"))::"uuid" = "auth"."uid"()))) OR "public"."has_permission"("auth"."uid"(), 'admin.access'::"text")));



COMMENT ON POLICY "Allow archived_todos access based on permissions and ownership" ON "public"."archived_todos" IS 'Analistas ven TODOs archivados propios o que crearon/asignaron originalmente, otros según view_all_todos';



CREATE POLICY "Allow case_control access based on permissions" ON "public"."case_control" TO "authenticated" USING (((("public"."has_permission"("auth"."uid"(), 'case_control.view_own'::"text") OR "public"."has_permission"("auth"."uid"(), 'case_control.start_timer'::"text") OR "public"."has_permission"("auth"."uid"(), 'case_control.add_manual_time'::"text") OR "public"."has_permission"("auth"."uid"(), 'case_control.update_status'::"text")) AND ("user_id" = "auth"."uid"())) OR "public"."has_permission"("auth"."uid"(), 'case_control.view_all'::"text") OR "public"."has_permission"("auth"."uid"(), 'admin.access'::"text")));



COMMENT ON POLICY "Allow case_control access based on permissions" ON "public"."case_control" IS 'Acceso basado en permisos case_control.* específicos';



CREATE POLICY "Allow case_status_control access" ON "public"."case_status_control" TO "authenticated" USING (("public"."has_permission"("auth"."uid"(), 'admin.access'::"text") OR "public"."has_permission"("auth"."uid"(), 'system.access'::"text") OR "public"."has_permission"("auth"."uid"(), 'case_control.view'::"text") OR "public"."has_permission"("auth"."uid"(), 'case_control.manage_status'::"text") OR "public"."has_permission"("auth"."uid"(), 'cases.read.own'::"text") OR "public"."has_permission"("auth"."uid"(), 'cases.read.all'::"text")));



CREATE POLICY "Allow cases create based on permissions" ON "public"."cases" FOR INSERT TO "authenticated" WITH CHECK (("public"."has_permission"("auth"."uid"(), 'cases.create'::"text") OR "public"."has_permission"("auth"."uid"(), 'admin.access'::"text")));



COMMENT ON POLICY "Allow cases create based on permissions" ON "public"."cases" IS 'Creación basada en permiso cases.create';



CREATE POLICY "Allow cases delete based on permissions" ON "public"."cases" FOR DELETE TO "authenticated" USING (("public"."has_permission"("auth"."uid"(), 'cases.delete.all'::"text") OR ("public"."has_permission"("auth"."uid"(), 'cases.delete.own'::"text") AND ("user_id" = "auth"."uid"())) OR "public"."has_permission"("auth"."uid"(), 'admin.access'::"text")));



COMMENT ON POLICY "Allow cases delete based on permissions" ON "public"."cases" IS 'Eliminación basada en cases.delete.all o cases.delete.own según permisos';



CREATE POLICY "Allow cases read based on permissions" ON "public"."cases" FOR SELECT TO "authenticated" USING (("public"."has_permission"("auth"."uid"(), 'cases.read.all'::"text") OR ("public"."has_permission"("auth"."uid"(), 'cases.read.own'::"text") AND ("user_id" = "auth"."uid"())) OR "public"."has_permission"("auth"."uid"(), 'admin.access'::"text")));



COMMENT ON POLICY "Allow cases read based on permissions" ON "public"."cases" IS 'Lectura basada en cases.read.all o cases.read.own según permisos específicos';



CREATE POLICY "Allow cases update based on permissions" ON "public"."cases" FOR UPDATE TO "authenticated" USING (("public"."has_permission"("auth"."uid"(), 'cases.update.all'::"text") OR ("public"."has_permission"("auth"."uid"(), 'cases.update.own'::"text") AND ("user_id" = "auth"."uid"())) OR "public"."has_permission"("auth"."uid"(), 'admin.access'::"text"))) WITH CHECK (("public"."has_permission"("auth"."uid"(), 'cases.update.all'::"text") OR ("public"."has_permission"("auth"."uid"(), 'cases.update.own'::"text") AND ("user_id" = "auth"."uid"())) OR "public"."has_permission"("auth"."uid"(), 'admin.access'::"text")));



COMMENT ON POLICY "Allow cases update based on permissions" ON "public"."cases" IS 'Actualización basada en cases.update.all o cases.update.own según permisos';



CREATE POLICY "Allow manual_time_entries access based on permissions" ON "public"."manual_time_entries" TO "authenticated" USING (((("public"."has_permission"("auth"."uid"(), 'case_control.add_manual_time'::"text") OR "public"."has_permission"("auth"."uid"(), 'case_control.edit_time'::"text")) AND (("user_id" = "auth"."uid"()) OR ("created_by" = "auth"."uid"()))) OR "public"."has_permission"("auth"."uid"(), 'cases.read.all'::"text") OR "public"."has_permission"("auth"."uid"(), 'case_control.view_all'::"text") OR "public"."has_permission"("auth"."uid"(), 'admin.access'::"text")));



CREATE POLICY "Allow origenes access based on permissions" ON "public"."origenes" FOR SELECT TO "authenticated" USING (("public"."has_permission"("auth"."uid"(), 'admin.access'::"text") OR "public"."has_permission"("auth"."uid"(), 'system.access'::"text") OR "public"."has_permission"("auth"."uid"(), 'cases.create'::"text") OR "public"."has_permission"("auth"."uid"(), 'cases.read.own'::"text") OR "public"."has_permission"("auth"."uid"(), 'cases.read.all'::"text")));



CREATE POLICY "Allow permissions access based on permissions" ON "public"."permissions" FOR SELECT TO "authenticated" USING (("public"."has_permission"("auth"."uid"(), 'admin.access'::"text") OR "public"."has_permission"("auth"."uid"(), 'system.access'::"text")));



COMMENT ON POLICY "Allow permissions access based on permissions" ON "public"."permissions" IS 'Acceso a permisos basado en permisos dinámicos';



CREATE POLICY "Allow role_permissions access" ON "public"."role_permissions" FOR SELECT TO "authenticated" USING (("public"."has_permission"("auth"."uid"(), 'admin.access'::"text") OR "public"."has_permission"("auth"."uid"(), 'system.access'::"text")));



CREATE POLICY "Allow roles access based on permissions" ON "public"."roles" FOR SELECT TO "authenticated" USING (("public"."has_permission"("auth"."uid"(), 'admin.access'::"text") OR "public"."has_permission"("auth"."uid"(), 'system.access'::"text")));



COMMENT ON POLICY "Allow roles access based on permissions" ON "public"."roles" IS 'Acceso a roles basado en permisos dinámicos';



CREATE POLICY "Allow time_entries access based on permissions" ON "public"."time_entries" TO "authenticated" USING (((("public"."has_permission"("auth"."uid"(), 'case_control.start_timer'::"text") OR "public"."has_permission"("auth"."uid"(), 'case_control.view_own'::"text")) AND ("user_id" = "auth"."uid"())) OR "public"."has_permission"("auth"."uid"(), 'cases.read.all'::"text") OR "public"."has_permission"("auth"."uid"(), 'case_control.view_all'::"text") OR "public"."has_permission"("auth"."uid"(), 'admin.access'::"text")));



CREATE POLICY "Allow todo_control access based on permissions" ON "public"."todo_control" TO "authenticated" USING ((("public"."has_permission"("auth"."uid"(), 'todo_time_tracking'::"text") AND ("user_id" = "auth"."uid"())) OR "public"."has_permission"("auth"."uid"(), 'view_all_todos'::"text") OR "public"."has_permission"("auth"."uid"(), 'admin.access'::"text")));



COMMENT ON POLICY "Allow todo_control access based on permissions" ON "public"."todo_control" IS 'Acceso basado en todo_time_tracking y view_all_todos';



CREATE POLICY "Allow todo_manual_time_entries access based on permissions" ON "public"."todo_manual_time_entries" TO "authenticated" USING ((("public"."has_permission"("auth"."uid"(), 'todo_time_tracking'::"text") AND (("user_id" = "auth"."uid"()) OR ("created_by" = "auth"."uid"()))) OR "public"."has_permission"("auth"."uid"(), 'view_all_todos'::"text") OR "public"."has_permission"("auth"."uid"(), 'admin.access'::"text")));



CREATE POLICY "Allow todo_priorities access" ON "public"."todo_priorities" TO "authenticated" USING (("public"."has_permission"("auth"."uid"(), 'admin.access'::"text") OR "public"."has_permission"("auth"."uid"(), 'system.access'::"text") OR "public"."has_permission"("auth"."uid"(), 'manage_todo_priorities'::"text") OR "public"."has_permission"("auth"."uid"(), 'view_todos'::"text") OR "public"."has_permission"("auth"."uid"(), 'create_todos'::"text")));



CREATE POLICY "Allow todo_time_entries access based on permissions" ON "public"."todo_time_entries" TO "authenticated" USING ((("public"."has_permission"("auth"."uid"(), 'todo_time_tracking'::"text") AND ("user_id" = "auth"."uid"())) OR "public"."has_permission"("auth"."uid"(), 'view_all_todos'::"text") OR "public"."has_permission"("auth"."uid"(), 'admin.access'::"text")));



CREATE POLICY "Allow todos create based on permissions" ON "public"."todos" FOR INSERT TO "authenticated" WITH CHECK (("public"."has_permission"("auth"."uid"(), 'create_todos'::"text") OR "public"."has_permission"("auth"."uid"(), 'admin.access'::"text")));



COMMENT ON POLICY "Allow todos create based on permissions" ON "public"."todos" IS 'Creación basada en permiso create_todos';



CREATE POLICY "Allow todos delete based on permissions" ON "public"."todos" FOR DELETE TO "authenticated" USING ((("public"."has_permission"("auth"."uid"(), 'delete_todos'::"text") AND (("assigned_user_id" = "auth"."uid"()) OR ("created_by_user_id" = "auth"."uid"()))) OR "public"."has_permission"("auth"."uid"(), 'admin.access'::"text")));



COMMENT ON POLICY "Allow todos delete based on permissions" ON "public"."todos" IS 'Eliminación basada en permiso delete_todos';



CREATE POLICY "Allow todos read based on permissions" ON "public"."todos" FOR SELECT TO "authenticated" USING (("public"."has_permission"("auth"."uid"(), 'view_all_todos'::"text") OR ("public"."has_permission"("auth"."uid"(), 'view_todos'::"text") AND (("assigned_user_id" = "auth"."uid"()) OR ("created_by_user_id" = "auth"."uid"()))) OR "public"."has_permission"("auth"."uid"(), 'admin.access'::"text")));



COMMENT ON POLICY "Allow todos read based on permissions" ON "public"."todos" IS 'Lectura basada en view_all_todos o view_todos según permisos específicos';



CREATE POLICY "Allow todos update based on permissions" ON "public"."todos" FOR UPDATE TO "authenticated" USING ((("public"."has_permission"("auth"."uid"(), 'edit_todos'::"text") AND (("assigned_user_id" = "auth"."uid"()) OR ("created_by_user_id" = "auth"."uid"()))) OR "public"."has_permission"("auth"."uid"(), 'admin.access'::"text"))) WITH CHECK ((("public"."has_permission"("auth"."uid"(), 'edit_todos'::"text") AND (("assigned_user_id" = "auth"."uid"()) OR ("created_by_user_id" = "auth"."uid"()))) OR "public"."has_permission"("auth"."uid"(), 'admin.access'::"text")));



COMMENT ON POLICY "Allow todos update based on permissions" ON "public"."todos" IS 'Actualización basada en permiso edit_todos';



CREATE POLICY "Analista can create notes" ON "public"."notes" FOR INSERT WITH CHECK ((("created_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."user_profiles" "up"
     JOIN "public"."roles" "r" ON (("up"."role_id" = "r"."id")))
  WHERE (("up"."id" = "auth"."uid"()) AND (("r"."name")::"text" = 'analista'::"text") AND ("up"."is_active" = true))))));



CREATE POLICY "Analista can delete own notes" ON "public"."notes" FOR DELETE USING ((("created_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."user_profiles" "up"
     JOIN "public"."roles" "r" ON (("up"."role_id" = "r"."id")))
  WHERE (("up"."id" = "auth"."uid"()) AND (("r"."name")::"text" = 'analista'::"text") AND ("up"."is_active" = true))))));



CREATE POLICY "Analista can update own notes" ON "public"."notes" FOR UPDATE USING ((("created_by" = "auth"."uid"()) AND (EXISTS ( SELECT 1
   FROM ("public"."user_profiles" "up"
     JOIN "public"."roles" "r" ON (("up"."role_id" = "r"."id")))
  WHERE (("up"."id" = "auth"."uid"()) AND (("r"."name")::"text" = 'analista'::"text") AND ("up"."is_active" = true))))));



CREATE POLICY "Analista can view own and assigned notes" ON "public"."notes" FOR SELECT USING (((("created_by" = "auth"."uid"()) OR ("assigned_to" = "auth"."uid"())) AND (EXISTS ( SELECT 1
   FROM ("public"."user_profiles" "up"
     JOIN "public"."roles" "r" ON (("up"."role_id" = "r"."id")))
  WHERE (("up"."id" = "auth"."uid"()) AND (("r"."name")::"text" = 'analista'::"text") AND ("up"."is_active" = true))))));



CREATE POLICY "Service role bypass RLS" ON "public"."aplicaciones" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass RLS" ON "public"."archive_audit_log" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass RLS" ON "public"."archive_deletion_log" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass RLS" ON "public"."archived_cases" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass RLS" ON "public"."archived_todos" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass RLS" ON "public"."case_control" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass RLS" ON "public"."case_status_control" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass RLS" ON "public"."cases" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass RLS" ON "public"."manual_time_entries" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass RLS" ON "public"."origenes" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass RLS" ON "public"."permissions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass RLS" ON "public"."role_permissions" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass RLS" ON "public"."roles" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass RLS" ON "public"."time_entries" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass RLS" ON "public"."todo_control" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass RLS" ON "public"."todo_manual_time_entries" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass RLS" ON "public"."todo_priorities" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass RLS" ON "public"."todo_time_entries" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Service role bypass RLS" ON "public"."todos" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Supervisor can manage all notes" ON "public"."notes" USING ((EXISTS ( SELECT 1
   FROM ("public"."user_profiles" "up"
     JOIN "public"."roles" "r" ON (("up"."role_id" = "r"."id")))
  WHERE (("up"."id" = "auth"."uid"()) AND (("r"."name")::"text" = 'supervisor'::"text") AND ("up"."is_active" = true)))));



CREATE POLICY "Users can view archived cases based on role" ON "public"."archived_cases" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_profiles" "up"
     JOIN "public"."roles" "r" ON (("up"."role_id" = "r"."id")))
  WHERE (("up"."id" = "auth"."uid"()) AND ("up"."is_active" = true) AND ((("r"."name")::"text" = ANY ((ARRAY['admin'::character varying, 'supervisor'::character varying, 'auditor'::character varying])::"text"[])) OR ((("r"."name")::"text" = 'analyst'::"text") AND ("archived_cases"."archived_by" = "auth"."uid"())))))));



CREATE POLICY "Users can view archived todos based on role" ON "public"."archived_todos" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_profiles" "up"
     JOIN "public"."roles" "r" ON (("up"."role_id" = "r"."id")))
  WHERE (("up"."id" = "auth"."uid"()) AND ("up"."is_active" = true) AND ((("r"."name")::"text" = ANY ((ARRAY['admin'::character varying, 'supervisor'::character varying, 'auditor'::character varying])::"text"[])) OR ((("r"."name")::"text" = 'analyst'::"text") AND ("archived_todos"."archived_by" = "auth"."uid"())))))));



CREATE POLICY "Users can view cases based on role" ON "public"."cases" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_profiles" "up"
     JOIN "public"."roles" "r" ON (("up"."role_id" = "r"."id")))
  WHERE (("up"."id" = "auth"."uid"()) AND ("up"."is_active" = true) AND ((("r"."name")::"text" = ANY ((ARRAY['admin'::character varying, 'supervisor'::character varying, 'auditor'::character varying])::"text"[])) OR ((("r"."name")::"text" = 'analyst'::"text") AND ("cases"."user_id" = "auth"."uid"())))))));



CREATE POLICY "Users can view notes based on role" ON "public"."notes" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_profiles" "up"
     JOIN "public"."roles" "r" ON (("up"."role_id" = "r"."id")))
  WHERE (("up"."id" = "auth"."uid"()) AND ("up"."is_active" = true) AND ((("r"."name")::"text" = ANY ((ARRAY['admin'::character varying, 'supervisor'::character varying, 'auditor'::character varying])::"text"[])) OR ((("r"."name")::"text" = 'analyst'::"text") AND (("notes"."created_by" = "auth"."uid"()) OR ("notes"."assigned_to" = "auth"."uid"()))))))));



CREATE POLICY "Users can view profiles based on role" ON "public"."user_profiles" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_profiles" "up"
     JOIN "public"."roles" "r" ON (("up"."role_id" = "r"."id")))
  WHERE (("up"."id" = "auth"."uid"()) AND ("up"."is_active" = true) AND ((("r"."name")::"text" = ANY ((ARRAY['admin'::character varying, 'supervisor'::character varying, 'auditor'::character varying])::"text"[])) OR ((("r"."name")::"text" = 'analyst'::"text") AND ("up"."id" = "auth"."uid"())))))));



CREATE POLICY "Users can view todos based on role" ON "public"."todos" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."user_profiles" "up"
     JOIN "public"."roles" "r" ON (("up"."role_id" = "r"."id")))
  WHERE (("up"."id" = "auth"."uid"()) AND ("up"."is_active" = true) AND ((("r"."name")::"text" = ANY ((ARRAY['admin'::character varying, 'supervisor'::character varying, 'auditor'::character varying])::"text"[])) OR ((("r"."name")::"text" = 'analyst'::"text") AND (("todos"."created_by_user_id" = "auth"."uid"()) OR ("todos"."assigned_user_id" = "auth"."uid"()))))))));



ALTER TABLE "public"."aplicaciones" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."archive_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."archive_deletion_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."archived_cases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."archived_todos" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."case_control" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."case_status_control" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."cases" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."manual_time_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."origenes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."role_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."time_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."todo_control" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."todo_manual_time_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."todo_priorities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."todo_time_entries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."todos" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."admin_create_aplicacion"("aplicacion_name" "text", "aplicacion_description" "text", "is_active" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_create_aplicacion"("aplicacion_name" "text", "aplicacion_description" "text", "is_active" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_create_aplicacion"("aplicacion_name" "text", "aplicacion_description" "text", "is_active" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_create_origen"("origen_name" "text", "origen_description" "text", "is_active" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_create_origen"("origen_name" "text", "origen_description" "text", "is_active" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_create_origen"("origen_name" "text", "origen_description" "text", "is_active" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_create_permission"("permission_name" "text", "permission_description" "text", "permission_resource" "text", "permission_action" "text", "is_active" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_create_permission"("permission_name" "text", "permission_description" "text", "permission_resource" "text", "permission_action" "text", "is_active" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_create_permission"("permission_name" "text", "permission_description" "text", "permission_resource" "text", "permission_action" "text", "is_active" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_delete_aplicacion"("aplicacion_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_delete_aplicacion"("aplicacion_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_delete_aplicacion"("aplicacion_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_delete_origen"("origen_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_delete_origen"("origen_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_delete_origen"("origen_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_delete_permission"("permission_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_delete_permission"("permission_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_delete_permission"("permission_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_delete_user"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."admin_delete_user"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_delete_user"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_update_aplicacion"("aplicacion_id" "uuid", "aplicacion_name" "text", "aplicacion_description" "text", "is_active" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_update_aplicacion"("aplicacion_id" "uuid", "aplicacion_name" "text", "aplicacion_description" "text", "is_active" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_update_aplicacion"("aplicacion_id" "uuid", "aplicacion_name" "text", "aplicacion_description" "text", "is_active" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_update_origen"("origen_id" "uuid", "origen_name" "text", "origen_description" "text", "is_active" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_update_origen"("origen_id" "uuid", "origen_name" "text", "origen_description" "text", "is_active" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_update_origen"("origen_id" "uuid", "origen_name" "text", "origen_description" "text", "is_active" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_update_permission"("permission_id" "uuid", "permission_name" "text", "permission_description" "text", "permission_resource" "text", "permission_action" "text", "is_active" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_update_permission"("permission_id" "uuid", "permission_name" "text", "permission_description" "text", "permission_resource" "text", "permission_action" "text", "is_active" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_update_permission"("permission_id" "uuid", "permission_name" "text", "permission_description" "text", "permission_resource" "text", "permission_action" "text", "is_active" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_update_role"("role_id" "uuid", "role_name" "text", "role_description" "text", "is_active" boolean, "permission_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_update_role"("role_id" "uuid", "role_name" "text", "role_description" "text", "is_active" boolean, "permission_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_update_role"("role_id" "uuid", "role_name" "text", "role_description" "text", "is_active" boolean, "permission_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."admin_update_user"("user_id" "uuid", "user_email" "text", "user_full_name" "text", "user_role_id" "uuid", "is_active" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."admin_update_user"("user_id" "uuid", "user_email" "text", "user_full_name" "text", "user_role_id" "uuid", "is_active" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."admin_update_user"("user_id" "uuid", "user_email" "text", "user_full_name" "text", "user_role_id" "uuid", "is_active" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."archive_audit_trigger"() TO "anon";
GRANT ALL ON FUNCTION "public"."archive_audit_trigger"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."archive_audit_trigger"() TO "service_role";



GRANT ALL ON FUNCTION "public"."archive_case"("p_case_id" "uuid", "p_archived_by" "uuid", "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."archive_case"("p_case_id" "uuid", "p_archived_by" "uuid", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."archive_case"("p_case_id" "uuid", "p_archived_by" "uuid", "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."archive_case"("p_case_id" "uuid", "p_user_id" "uuid", "p_reason" character varying, "p_retention_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."archive_case"("p_case_id" "uuid", "p_user_id" "uuid", "p_reason" character varying, "p_retention_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."archive_case"("p_case_id" "uuid", "p_user_id" "uuid", "p_reason" character varying, "p_retention_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."archive_todo"("p_todo_id" "uuid", "p_archived_by" "uuid", "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."archive_todo"("p_todo_id" "uuid", "p_archived_by" "uuid", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."archive_todo"("p_todo_id" "uuid", "p_archived_by" "uuid", "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."archive_todo"("p_todo_id" "uuid", "p_user_id" "uuid", "p_reason" character varying, "p_retention_days" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."archive_todo"("p_todo_id" "uuid", "p_user_id" "uuid", "p_reason" character varying, "p_retention_days" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."archive_todo"("p_todo_id" "uuid", "p_user_id" "uuid", "p_reason" character varying, "p_retention_days" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."calculate_time_entry_duration"() TO "anon";
GRANT ALL ON FUNCTION "public"."calculate_time_entry_duration"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."calculate_time_entry_duration"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can_archive_items"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_archive_items"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_archive_items"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_delete_archived_items"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_delete_archived_items"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_delete_archived_items"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_restore_items"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_restore_items"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_restore_items"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_view_all_case_controls"() TO "anon";
GRANT ALL ON FUNCTION "public"."can_view_all_case_controls"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_view_all_case_controls"() TO "service_role";



GRANT ALL ON FUNCTION "public"."can_view_note"("note_id" "uuid", "user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."can_view_note"("note_id" "uuid", "user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_view_note"("note_id" "uuid", "user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."can_view_own_case_controls"() TO "anon";
GRANT ALL ON FUNCTION "public"."can_view_own_case_controls"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."can_view_own_case_controls"() TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_archive_entries"("p_months_old" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_archive_entries"("p_months_old" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_archive_entries"("p_months_old" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."complete_todo"("p_todo_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."complete_todo"("p_todo_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."complete_todo"("p_todo_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_case_management_board"("p_user_id" "uuid", "p_board_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_case_management_board"("p_user_id" "uuid", "p_board_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_case_management_board"("p_user_id" "uuid", "p_board_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_invited_user_profile"("user_id" "uuid", "user_email" "text", "user_metadata" "jsonb") TO "anon";
GRANT ALL ON FUNCTION "public"."create_invited_user_profile"("user_id" "uuid", "user_email" "text", "user_metadata" "jsonb") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_invited_user_profile"("user_id" "uuid", "user_email" "text", "user_metadata" "jsonb") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_archived_case_permanently"("p_archived_id" "uuid", "p_deleted_by" "uuid", "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_archived_case_permanently"("p_archived_id" "uuid", "p_deleted_by" "uuid", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_archived_case_permanently"("p_archived_id" "uuid", "p_deleted_by" "uuid", "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_archived_item_permanently"("p_archived_item_id" "uuid", "p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_archived_item_permanently"("p_archived_item_id" "uuid", "p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_archived_item_permanently"("p_archived_item_id" "uuid", "p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_archived_todo_permanently"("p_archived_id" "uuid", "p_deleted_by" "uuid", "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_archived_todo_permanently"("p_archived_id" "uuid", "p_deleted_by" "uuid", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_archived_todo_permanently"("p_archived_id" "uuid", "p_deleted_by" "uuid", "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."ensure_user_profile"() TO "anon";
GRANT ALL ON FUNCTION "public"."ensure_user_profile"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."ensure_user_profile"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_application_time_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_application_time_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_application_time_metrics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_archivable_cases"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_archivable_cases"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_archivable_cases"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_archivable_todos"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_archivable_todos"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_archivable_todos"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_archive_stats_by_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_archive_stats_by_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_archive_stats_by_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_archive_stats_monthly"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_archive_stats_monthly"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_archive_stats_monthly"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_archived_case_details"("p_archived_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_archived_case_details"("p_archived_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_archived_case_details"("p_archived_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_archived_todo_details"("p_archived_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_archived_todo_details"("p_archived_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_archived_todo_details"("p_archived_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_case_time_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_case_time_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_case_time_metrics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_notes_stats"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_notes_stats"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_notes_stats"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_status_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_status_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_status_metrics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_time_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_time_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_time_metrics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_todo_metrics"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_todo_metrics"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_todo_metrics"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_role"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_role"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_time_metrics"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_time_metrics"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_time_metrics"() TO "service_role";



GRANT ALL ON FUNCTION "public"."has_permission"("permission_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_permission"("permission_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_permission"("permission_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_permission"("user_id" "uuid", "permission_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_permission"("user_id" "uuid", "permission_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_permission"("user_id" "uuid", "permission_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_resource_permission"("user_id" "uuid", "resource_pattern" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."has_resource_permission"("user_id" "uuid", "resource_pattern" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_resource_permission"("user_id" "uuid", "resource_pattern" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."has_system_access"() TO "anon";
GRANT ALL ON FUNCTION "public"."has_system_access"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."has_system_access"() TO "service_role";



GRANT ALL ON FUNCTION "public"."initialize_todo_control"("p_todo_id" "uuid", "p_user_id" "uuid", "p_status_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."initialize_todo_control"("p_todo_id" "uuid", "p_user_id" "uuid", "p_status_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."initialize_todo_control"("p_todo_id" "uuid", "p_user_id" "uuid", "p_status_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_admin"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."is_case_control_owner"("case_control_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."is_case_control_owner"("case_control_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."is_case_control_owner"("case_control_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."restore_case"("p_archived_id" "uuid", "p_restored_by" "uuid", "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."restore_case"("p_archived_id" "uuid", "p_restored_by" "uuid", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."restore_case"("p_archived_id" "uuid", "p_restored_by" "uuid", "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."restore_todo"("p_archived_id" "uuid", "p_restored_by" "uuid", "p_reason" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."restore_todo"("p_archived_id" "uuid", "p_restored_by" "uuid", "p_reason" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."restore_todo"("p_archived_id" "uuid", "p_restored_by" "uuid", "p_reason" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."search_notes"("search_term" "text", "user_id" "uuid", "limit_count" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."search_notes"("search_term" "text", "user_id" "uuid", "limit_count" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."search_notes"("search_term" "text", "user_id" "uuid", "limit_count" integer) TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_todo_completion_status"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_todo_completion_status"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_todo_completion_status"() TO "service_role";



GRANT ALL ON FUNCTION "public"."toggle_todo_timer"("p_todo_id" "uuid", "p_action" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."toggle_todo_timer"("p_todo_id" "uuid", "p_action" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."toggle_todo_timer"("p_todo_id" "uuid", "p_action" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_archive_policies_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_archive_policies_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_archive_policies_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_archived_items_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_archived_items_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_archived_items_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_case_control_total_time"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_case_control_total_time"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_case_control_total_time"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_notes_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_notes_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_notes_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_case_control_relationships"() TO "anon";
GRANT ALL ON FUNCTION "public"."verify_case_control_relationships"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_case_control_relationships"() TO "service_role";


















GRANT ALL ON TABLE "public"."aplicaciones" TO "anon";
GRANT ALL ON TABLE "public"."aplicaciones" TO "authenticated";
GRANT ALL ON TABLE "public"."aplicaciones" TO "service_role";



GRANT ALL ON TABLE "public"."archive_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."archive_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."archive_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."archive_deletion_log" TO "anon";
GRANT ALL ON TABLE "public"."archive_deletion_log" TO "authenticated";
GRANT ALL ON TABLE "public"."archive_deletion_log" TO "service_role";



GRANT ALL ON TABLE "public"."archive_deletion_stats" TO "anon";
GRANT ALL ON TABLE "public"."archive_deletion_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."archive_deletion_stats" TO "service_role";



GRANT ALL ON TABLE "public"."archived_cases" TO "anon";
GRANT ALL ON TABLE "public"."archived_cases" TO "authenticated";
GRANT ALL ON TABLE "public"."archived_cases" TO "service_role";



GRANT ALL ON TABLE "public"."archived_todos" TO "anon";
GRANT ALL ON TABLE "public"."archived_todos" TO "authenticated";
GRANT ALL ON TABLE "public"."archived_todos" TO "service_role";



GRANT ALL ON TABLE "public"."archive_stats" TO "anon";
GRANT ALL ON TABLE "public"."archive_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."archive_stats" TO "service_role";



GRANT ALL ON TABLE "public"."case_control" TO "anon";
GRANT ALL ON TABLE "public"."case_control" TO "authenticated";
GRANT ALL ON TABLE "public"."case_control" TO "service_role";



GRANT ALL ON TABLE "public"."case_status_control" TO "anon";
GRANT ALL ON TABLE "public"."case_status_control" TO "authenticated";
GRANT ALL ON TABLE "public"."case_status_control" TO "service_role";



GRANT ALL ON TABLE "public"."cases" TO "anon";
GRANT ALL ON TABLE "public"."cases" TO "authenticated";
GRANT ALL ON TABLE "public"."cases" TO "service_role";



GRANT ALL ON TABLE "public"."origenes" TO "anon";
GRANT ALL ON TABLE "public"."origenes" TO "authenticated";
GRANT ALL ON TABLE "public"."origenes" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."case_control_detailed" TO "anon";
GRANT ALL ON TABLE "public"."case_control_detailed" TO "authenticated";
GRANT ALL ON TABLE "public"."case_control_detailed" TO "service_role";



GRANT ALL ON TABLE "public"."manual_time_entries" TO "anon";
GRANT ALL ON TABLE "public"."manual_time_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."manual_time_entries" TO "service_role";



GRANT ALL ON TABLE "public"."notes" TO "anon";
GRANT ALL ON TABLE "public"."notes" TO "authenticated";
GRANT ALL ON TABLE "public"."notes" TO "service_role";



GRANT ALL ON TABLE "public"."permissions" TO "anon";
GRANT ALL ON TABLE "public"."permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."permissions" TO "service_role";



GRANT ALL ON TABLE "public"."role_permissions" TO "anon";
GRANT ALL ON TABLE "public"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "public"."role_permissions" TO "service_role";



GRANT ALL ON TABLE "public"."roles" TO "anon";
GRANT ALL ON TABLE "public"."roles" TO "authenticated";
GRANT ALL ON TABLE "public"."roles" TO "service_role";



GRANT ALL ON TABLE "public"."time_entries" TO "anon";
GRANT ALL ON TABLE "public"."time_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."time_entries" TO "service_role";



GRANT ALL ON TABLE "public"."todo_control" TO "anon";
GRANT ALL ON TABLE "public"."todo_control" TO "authenticated";
GRANT ALL ON TABLE "public"."todo_control" TO "service_role";



GRANT ALL ON TABLE "public"."todo_manual_time_entries" TO "anon";
GRANT ALL ON TABLE "public"."todo_manual_time_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."todo_manual_time_entries" TO "service_role";



GRANT ALL ON TABLE "public"."todo_priorities" TO "anon";
GRANT ALL ON TABLE "public"."todo_priorities" TO "authenticated";
GRANT ALL ON TABLE "public"."todo_priorities" TO "service_role";



GRANT ALL ON TABLE "public"."todo_time_entries" TO "anon";
GRANT ALL ON TABLE "public"."todo_time_entries" TO "authenticated";
GRANT ALL ON TABLE "public"."todo_time_entries" TO "service_role";



GRANT ALL ON TABLE "public"."todos" TO "anon";
GRANT ALL ON TABLE "public"."todos" TO "authenticated";
GRANT ALL ON TABLE "public"."todos" TO "service_role";



GRANT ALL ON TABLE "public"."todo_time_summary" TO "anon";
GRANT ALL ON TABLE "public"."todo_time_summary" TO "authenticated";
GRANT ALL ON TABLE "public"."todo_time_summary" TO "service_role";



GRANT ALL ON TABLE "public"."todos_with_details" TO "anon";
GRANT ALL ON TABLE "public"."todos_with_details" TO "authenticated";
GRANT ALL ON TABLE "public"."todos_with_details" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
