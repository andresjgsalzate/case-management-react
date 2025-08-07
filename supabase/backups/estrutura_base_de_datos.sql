-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.aplicaciones (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL UNIQUE,
  descripcion text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT aplicaciones_pkey PRIMARY KEY (id)
);
CREATE TABLE public.archive_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  action_type character varying NOT NULL CHECK (action_type::text = ANY (ARRAY['ARCHIVE'::character varying, 'RESTORE'::character varying]::text[])),
  item_type character varying NOT NULL CHECK (item_type::text = ANY (ARRAY['CASE'::character varying, 'TODO'::character varying]::text[])),
  item_id uuid NOT NULL,
  user_id uuid NOT NULL,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT archive_audit_log_pkey PRIMARY KEY (id),
  CONSTRAINT archive_audit_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.archive_deletion_log (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item_type character varying NOT NULL CHECK (item_type::text = ANY (ARRAY['case'::character varying, 'todo'::character varying]::text[])),
  item_id uuid NOT NULL,
  item_identifier character varying NOT NULL,
  deleted_by uuid NOT NULL,
  deleted_at timestamp with time zone NOT NULL DEFAULT now(),
  deletion_reason text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT archive_deletion_log_pkey PRIMARY KEY (id),
  CONSTRAINT archive_deletion_log_deleted_by_fkey FOREIGN KEY (deleted_by) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.archived_cases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  original_case_id uuid NOT NULL,
  case_number character varying NOT NULL,
  description text,
  classification character varying NOT NULL,
  total_time_minutes integer DEFAULT 0,
  completed_at timestamp with time zone,
  archived_at timestamp with time zone DEFAULT now(),
  archived_by uuid NOT NULL,
  original_data jsonb NOT NULL,
  control_data jsonb NOT NULL,
  restored_at timestamp with time zone,
  restored_by uuid,
  is_restored boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  archive_reason text,
  CONSTRAINT archived_cases_pkey PRIMARY KEY (id),
  CONSTRAINT archived_cases_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.user_profiles(id),
  CONSTRAINT archived_cases_restored_by_fkey FOREIGN KEY (restored_by) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.archived_todos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  original_todo_id uuid NOT NULL,
  title character varying NOT NULL,
  description text,
  priority character varying NOT NULL,
  total_time_minutes integer DEFAULT 0,
  completed_at timestamp with time zone,
  archived_at timestamp with time zone DEFAULT now(),
  archived_by uuid NOT NULL,
  original_data jsonb NOT NULL,
  control_data jsonb NOT NULL,
  restored_at timestamp with time zone,
  restored_by uuid,
  is_restored boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  archive_reason text,
  CONSTRAINT archived_todos_pkey PRIMARY KEY (id),
  CONSTRAINT archived_todos_restored_by_fkey FOREIGN KEY (restored_by) REFERENCES public.user_profiles(id),
  CONSTRAINT archived_todos_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.case_control (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  case_id uuid NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  status_id uuid NOT NULL,
  total_time_minutes integer DEFAULT 0,
  timer_start_at timestamp with time zone,
  is_timer_active boolean DEFAULT false,
  assigned_at timestamp with time zone DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT case_control_pkey PRIMARY KEY (id),
  CONSTRAINT case_control_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id),
  CONSTRAINT case_control_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.case_status_control(id),
  CONSTRAINT case_control_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.case_status_control (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  description text,
  color character varying DEFAULT '#6B7280'::character varying,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT case_status_control_pkey PRIMARY KEY (id)
);
CREATE TABLE public.cases (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  numero_caso character varying NOT NULL UNIQUE,
  descripcion text NOT NULL,
  fecha date NOT NULL,
  origen_id uuid,
  aplicacion_id uuid,
  historial_caso integer NOT NULL CHECK (historial_caso >= 1 AND historial_caso <= 3),
  conocimiento_modulo integer NOT NULL CHECK (conocimiento_modulo >= 1 AND conocimiento_modulo <= 3),
  manipulacion_datos integer NOT NULL CHECK (manipulacion_datos >= 1 AND manipulacion_datos <= 3),
  claridad_descripcion integer NOT NULL CHECK (claridad_descripcion >= 1 AND claridad_descripcion <= 3),
  causa_fallo integer NOT NULL CHECK (causa_fallo >= 1 AND causa_fallo <= 3),
  puntuacion integer NOT NULL CHECK (puntuacion >= 5 AND puntuacion <= 15),
  clasificacion character varying NOT NULL CHECK (clasificacion::text = ANY (ARRAY['Baja Complejidad'::character varying, 'Media Complejidad'::character varying, 'Alta Complejidad'::character varying]::text[])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid,
  CONSTRAINT cases_pkey PRIMARY KEY (id),
  CONSTRAINT cases_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT cases_aplicacion_id_fkey FOREIGN KEY (aplicacion_id) REFERENCES public.aplicaciones(id),
  CONSTRAINT cases_origen_id_fkey FOREIGN KEY (origen_id) REFERENCES public.origenes(id)
);
CREATE TABLE public.disposiciones_scripts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  fecha date NOT NULL,
  case_id uuid,
  nombre_script text NOT NULL,
  numero_revision_svn text,
  aplicacion_id uuid NOT NULL,
  observaciones text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  user_profile_id uuid,
  case_number character varying NOT NULL CHECK (case_number::text ~ '^[A-Z0-9-]+$'::text),
  CONSTRAINT disposiciones_scripts_pkey PRIMARY KEY (id),
  CONSTRAINT disposiciones_scripts_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id),
  CONSTRAINT disposiciones_scripts_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT disposiciones_scripts_aplicacion_id_fkey FOREIGN KEY (aplicacion_id) REFERENCES public.aplicaciones(id),
  CONSTRAINT disposiciones_scripts_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id),
  CONSTRAINT disposiciones_scripts_user_profile_id_fkey FOREIGN KEY (user_profile_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.document_attachments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  document_id uuid,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  mime_type text NOT NULL,
  file_type character varying CHECK (file_type::text = ANY (ARRAY['image'::character varying, 'document'::character varying, 'spreadsheet'::character varying, 'other'::character varying]::text[])),
  is_embedded boolean DEFAULT false,
  uploaded_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT document_attachments_pkey PRIMARY KEY (id),
  CONSTRAINT document_attachments_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES auth.users(id),
  CONSTRAINT document_attachments_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.solution_documents(id)
);
CREATE TABLE public.manual_time_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  case_control_id uuid NOT NULL,
  user_id uuid NOT NULL,
  date date NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  description text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid NOT NULL,
  CONSTRAINT manual_time_entries_pkey PRIMARY KEY (id),
  CONSTRAINT manual_time_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id),
  CONSTRAINT manual_time_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id),
  CONSTRAINT manual_time_entries_case_control_id_fkey FOREIGN KEY (case_control_id) REFERENCES public.case_control(id)
);
CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  content text NOT NULL,
  tags ARRAY DEFAULT '{}'::text[],
  case_id uuid,
  created_by uuid NOT NULL,
  assigned_to uuid,
  is_important boolean DEFAULT false,
  is_archived boolean DEFAULT false,
  archived_at timestamp with time zone,
  archived_by uuid,
  reminder_date timestamp with time zone,
  is_reminder_sent boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notes_pkey PRIMARY KEY (id),
  CONSTRAINT notes_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.user_profiles(id),
  CONSTRAINT notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id),
  CONSTRAINT notes_archived_by_fkey FOREIGN KEY (archived_by) REFERENCES public.user_profiles(id),
  CONSTRAINT notes_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id)
);
CREATE TABLE public.origenes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL UNIQUE,
  descripcion text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT origenes_pkey PRIMARY KEY (id)
);
CREATE TABLE public.permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  description text,
  resource character varying NOT NULL,
  action character varying NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  scope character varying CHECK (scope::text = ANY (ARRAY['own'::character varying, 'team'::character varying, 'all'::character varying]::text[])),
  CONSTRAINT permissions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.role_permissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL,
  permission_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT role_permissions_pkey PRIMARY KEY (id),
  CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id),
  CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id)
);
CREATE TABLE public.roles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT roles_pkey PRIMARY KEY (id)
);
CREATE TABLE public.solution_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  color text DEFAULT '#6B7280'::text,
  icon text,
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT solution_categories_pkey PRIMARY KEY (id),
  CONSTRAINT solution_categories_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.solution_document_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT solution_document_tags_pkey PRIMARY KEY (id),
  CONSTRAINT solution_document_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.solution_tags(id),
  CONSTRAINT solution_document_tags_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.solution_documents(id)
);
CREATE TABLE public.solution_document_types (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  code character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  description text,
  icon character varying,
  color character varying DEFAULT '#6B7280'::character varying,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT solution_document_types_pkey PRIMARY KEY (id),
  CONSTRAINT solution_document_types_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.solution_document_versions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  document_id uuid,
  content jsonb NOT NULL,
  version integer NOT NULL,
  created_by uuid NOT NULL,
  change_summary text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT solution_document_versions_pkey PRIMARY KEY (id),
  CONSTRAINT solution_document_versions_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.solution_documents(id),
  CONSTRAINT solution_document_versions_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.solution_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content jsonb NOT NULL,
  case_id uuid,
  created_by uuid NOT NULL,
  updated_by uuid,
  tags ARRAY DEFAULT '{}'::text[],
  category text,
  difficulty_level integer DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  estimated_solution_time integer,
  is_template boolean DEFAULT false,
  is_published boolean DEFAULT false,
  version integer DEFAULT 1,
  view_count integer DEFAULT 0,
  helpful_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  case_reference_type character varying DEFAULT 'active'::character varying CHECK (case_reference_type::text = ANY (ARRAY['active'::character varying, 'archived'::character varying, 'both'::character varying]::text[])),
  archived_case_id uuid,
  solution_type character varying DEFAULT 'solution'::character varying CHECK (solution_type::text = ANY (ARRAY['solution'::character varying, 'guide'::character varying, 'faq'::character varying, 'template'::character varying, 'procedure'::character varying]::text[])),
  complexity_notes text,
  prerequisites text,
  related_applications ARRAY DEFAULT '{}'::uuid[],
  last_reviewed_at timestamp with time zone,
  last_reviewed_by uuid,
  is_deprecated boolean DEFAULT false,
  deprecation_reason text,
  replacement_document_id uuid,
  document_type_id uuid,
  CONSTRAINT solution_documents_pkey PRIMARY KEY (id),
  CONSTRAINT solution_documents_replacement_document_id_fkey FOREIGN KEY (replacement_document_id) REFERENCES public.solution_documents(id),
  CONSTRAINT solution_documents_document_type_id_fkey FOREIGN KEY (document_type_id) REFERENCES public.solution_document_types(id),
  CONSTRAINT solution_documents_last_reviewed_by_fkey FOREIGN KEY (last_reviewed_by) REFERENCES auth.users(id),
  CONSTRAINT solution_documents_archived_case_id_fkey FOREIGN KEY (archived_case_id) REFERENCES public.archived_cases(id),
  CONSTRAINT solution_documents_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id),
  CONSTRAINT solution_documents_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id),
  CONSTRAINT solution_documents_case_id_fkey FOREIGN KEY (case_id) REFERENCES public.cases(id)
);
CREATE TABLE public.solution_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  document_id uuid,
  user_id uuid NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  comment text,
  was_helpful boolean,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT solution_feedback_pkey PRIMARY KEY (id),
  CONSTRAINT solution_feedback_document_id_fkey FOREIGN KEY (document_id) REFERENCES public.solution_documents(id),
  CONSTRAINT solution_feedback_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.solution_tags (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  description text,
  color character varying DEFAULT '#6B7280'::character varying,
  category character varying,
  usage_count integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT solution_tags_pkey PRIMARY KEY (id),
  CONSTRAINT solution_tags_created_by_fkey FOREIGN KEY (created_by) REFERENCES auth.users(id)
);
CREATE TABLE public.time_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  case_control_id uuid NOT NULL,
  user_id uuid NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  duration_minutes integer,
  entry_type character varying NOT NULL CHECK (entry_type::text = ANY (ARRAY['automatic'::character varying, 'manual'::character varying]::text[])),
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT time_entries_pkey PRIMARY KEY (id),
  CONSTRAINT time_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id),
  CONSTRAINT time_entries_case_control_id_fkey FOREIGN KEY (case_control_id) REFERENCES public.case_control(id)
);
CREATE TABLE public.todo_control (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  todo_id uuid NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  status_id uuid NOT NULL,
  total_time_minutes integer DEFAULT 0,
  timer_start_at timestamp with time zone,
  is_timer_active boolean DEFAULT false,
  assigned_at timestamp with time zone DEFAULT now(),
  started_at timestamp with time zone,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT todo_control_pkey PRIMARY KEY (id),
  CONSTRAINT todo_control_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id),
  CONSTRAINT todo_control_status_id_fkey FOREIGN KEY (status_id) REFERENCES public.case_status_control(id),
  CONSTRAINT todo_control_todo_id_fkey FOREIGN KEY (todo_id) REFERENCES public.todos(id)
);
CREATE TABLE public.todo_manual_time_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  todo_control_id uuid NOT NULL,
  user_id uuid NOT NULL,
  date date NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  description text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid NOT NULL,
  CONSTRAINT todo_manual_time_entries_pkey PRIMARY KEY (id),
  CONSTRAINT todo_manual_time_entries_todo_control_id_fkey FOREIGN KEY (todo_control_id) REFERENCES public.todo_control(id),
  CONSTRAINT todo_manual_time_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id),
  CONSTRAINT todo_manual_time_entries_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.todo_priorities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL UNIQUE,
  description text,
  color character varying DEFAULT '#6B7280'::character varying,
  level integer NOT NULL UNIQUE CHECK (level >= 1 AND level <= 5),
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT todo_priorities_pkey PRIMARY KEY (id)
);
CREATE TABLE public.todo_time_entries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  todo_control_id uuid NOT NULL,
  user_id uuid NOT NULL,
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone,
  duration_minutes integer,
  entry_type character varying NOT NULL CHECK (entry_type::text = ANY (ARRAY['automatic'::character varying, 'manual'::character varying]::text[])),
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT todo_time_entries_pkey PRIMARY KEY (id),
  CONSTRAINT todo_time_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.user_profiles(id),
  CONSTRAINT todo_time_entries_todo_control_id_fkey FOREIGN KEY (todo_control_id) REFERENCES public.todo_control(id)
);
CREATE TABLE public.todos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title character varying NOT NULL,
  description text,
  priority_id uuid NOT NULL,
  assigned_user_id uuid,
  created_by_user_id uuid NOT NULL,
  due_date date,
  estimated_minutes integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  completed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT todos_pkey PRIMARY KEY (id),
  CONSTRAINT todos_priority_id_fkey FOREIGN KEY (priority_id) REFERENCES public.todo_priorities(id),
  CONSTRAINT todos_created_by_user_id_fkey FOREIGN KEY (created_by_user_id) REFERENCES public.user_profiles(id),
  CONSTRAINT todos_assigned_user_id_fkey FOREIGN KEY (assigned_user_id) REFERENCES public.user_profiles(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  email character varying NOT NULL,
  full_name character varying,
  role_id uuid,
  is_active boolean DEFAULT true,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  role_name text DEFAULT 'user'::text,
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);