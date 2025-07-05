-- Migración 012: Corregir referencias de tablas de control de casos

-- Eliminar y recrear foreign keys para usar user_profiles en lugar de auth.users

-- Eliminar constraints existentes si existen
ALTER TABLE case_control DROP CONSTRAINT IF EXISTS case_control_user_id_fkey;
ALTER TABLE time_entries DROP CONSTRAINT IF EXISTS time_entries_user_id_fkey;
ALTER TABLE manual_time_entries DROP CONSTRAINT IF EXISTS manual_time_entries_user_id_fkey;
ALTER TABLE manual_time_entries DROP CONSTRAINT IF EXISTS manual_time_entries_created_by_fkey;

-- Recrear las foreign keys correctas
ALTER TABLE case_control 
ADD CONSTRAINT case_control_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE time_entries 
ADD CONSTRAINT time_entries_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE manual_time_entries 
ADD CONSTRAINT manual_time_entries_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE manual_time_entries 
ADD CONSTRAINT manual_time_entries_created_by_fkey 
FOREIGN KEY (created_by) REFERENCES user_profiles(id);
