-- =============================================
-- CORREGIR RECURSIÓN INFINITA EN POLÍTICAS RLS
-- =============================================

-- El problema es que las políticas RLS están intentando consultar user_profiles
-- para verificar permisos, lo que crea una recursión infinita.
-- Necesitamos políticas más simples que no dependan de joins complejos.

-- 1. Eliminar todas las políticas problemáticas
DROP POLICY IF EXISTS "user_profiles_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_policy" ON user_profiles;

-- 2. Crear políticas RLS ULTRA SIMPLES (sin recursión)

-- IMPORTANTE: Para evitar recursión, NO consultamos user_profiles para verificar roles
-- Los admins tendrán acceso a través de bypass de RLS o políticas especiales

-- Política básica: Los usuarios pueden ver y modificar SOLO su propio perfil
CREATE POLICY "user_profiles_own_access" ON user_profiles FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política especial: Permitir INSERT para nuevos usuarios (necesario para registro)
CREATE POLICY "user_profiles_allow_insert" ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 3. SOLUCIÓN TEMPORAL: Dar acceso completo a ciertos usuarios admin por UUID
-- (Esto evita la recursión mientras configuramos los roles correctamente)

-- Política básica: Los usuarios pueden ver y modificar SOLO su propio perfil
CREATE POLICY "user_profiles_own_access" ON user_profiles FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política especial para admin específico (evita recursión)
-- Reemplaza este UUID con el UUID real de tu usuario admin
CREATE POLICY "user_profiles_admin_access" ON user_profiles FOR ALL
USING (auth.uid() = '5413c98b-df84-41ec-bd77-5ea321bc6922'::uuid)
WITH CHECK (auth.uid() = '5413c98b-df84-41ec-bd77-5ea321bc6922'::uuid);

-- 4. Nota importante para después
-- Una vez que tengamos acceso, crearemos una función especial para verificar admin
-- que no cause recursión, usando una tabla separada o método diferente

-- 4. Mensaje de confirmación
SELECT 'RLS policies fixed - recursion eliminated' as status;
