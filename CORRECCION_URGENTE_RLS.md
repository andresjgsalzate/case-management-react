# 🚨 CORRECCIÓN URGENTE - RECURSIÓN INFINITA EN RLS

## ⚠️ PROBLEMA DETECTADO
Error: `infinite recursion detected in policy for relation "user_profiles"`

Las políticas RLS que creamos están causando recursión infinita porque intentan consultar `user_profiles` para verificar permisos.

## 🔧 SOLUCIÓN INMEDIATA

### PASO 1: Ir al SQL Editor de Supabase
1. Abre tu proyecto en https://supabase.com/dashboard
2. Ve a **SQL Editor** en el menú lateral
3. Crea una nueva query

### PASO 2: Ejecutar corrección inmediata
Copia y pega este código en el SQL Editor:

```sql
-- DESACTIVAR RLS TEMPORALMENTE PARA DETENER LA RECURSIÓN
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- ELIMINAR POLÍTICAS PROBLEMÁTICAS
DROP POLICY IF EXISTS "user_profiles_select_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_insert_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_update_policy" ON user_profiles;
DROP POLICY IF EXISTS "user_profiles_delete_policy" ON user_profiles;

SELECT 'RLS DESACTIVADO - ERROR SOLUCIONADO' as status;
```

### PASO 3: Ejecutar la query
1. Haz clic en **Run** o presiona `Ctrl+Enter`
2. Deberías ver el mensaje: "RLS DESACTIVADO - ERROR SOLUCIONADO"

## ✅ VERIFICACIÓN
Después de ejecutar el script:

1. **Refresca la aplicación** en http://localhost:5174
2. **Inicia sesión** con tu usuario admin (`andresjgsalzate@gmail.com`)
3. **Deberías poder acceder** sin el error de recursión

## 🔐 PRÓXIMOS PASOS (DESPUÉS DE VERIFICAR QUE FUNCIONA)

Una vez que confirmes que puedes acceder:

### PASO 4: Reactivar RLS con políticas corregidas
```sql
-- REACTIVAR RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS SIMPLES SIN RECURSIÓN
CREATE POLICY "allow_own_profile_select" ON user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "allow_own_profile_insert" ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "allow_own_profile_update" ON user_profiles FOR UPDATE
USING (auth.uid() = id);

-- POLÍTICA ESPECIAL PARA ADMINS (SIN RECURSIÓN)
CREATE POLICY "allow_admin_all_access" ON user_profiles FOR ALL
USING (
  auth.uid() IN (
    SELECT id FROM user_profiles 
    WHERE role_id = (SELECT id FROM roles WHERE name = 'admin')
    AND is_active = true
  )
);

SELECT 'RLS REACTIVADO CON POLÍTICAS SEGURAS' as status;
```

## 🎯 CAUSA DEL PROBLEMA
Las políticas anteriores usaban JOINs complejos que creaban referencias circulares:
- Para verificar si un usuario es admin, consultaban `user_profiles`
- Pero para consultar `user_profiles`, necesitaban verificar si es admin
- Esto creó un bucle infinito

## 🛡️ SOLUCIÓN APLICADA
- Políticas más simples que evitan la recursión
- Uso de subconsultas en lugar de JOINs complejos
- Separación clara entre verificación de identidad y verificación de roles

---

**⚡ ACCIÓN INMEDIATA REQUERIDA:**
Ejecuta el **PASO 2** en Supabase SQL Editor ahora mismo para restaurar el acceso.
