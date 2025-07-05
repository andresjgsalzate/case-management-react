# 🔐 POLÍTICAS RLS SEGURAS - EJECUTAR EN SUPABASE

## ⚡ CÓDIGO PARA SUPABASE SQL EDITOR

```sql
-- =============================================
-- ACTIVAR RLS CON POLÍTICAS SEGURAS
-- =============================================

-- 1. Activar RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Política básica: Usuarios ven solo su propio perfil
CREATE POLICY "user_profiles_own_select" ON user_profiles FOR SELECT
USING (auth.uid() = id);

-- 3. Política de INSERT: Permite auto-registro
CREATE POLICY "user_profiles_own_insert" ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- 4. Política de UPDATE: Usuarios pueden actualizar su perfil
CREATE POLICY "user_profiles_own_update" ON user_profiles FOR UPDATE
USING (auth.uid() = id);

-- 5. Política ADMIN: Hardcodeada para evitar recursión
-- (Reemplaza el UUID con el de tu usuario admin)
CREATE POLICY "user_profiles_admin_full" ON user_profiles FOR ALL
USING (
  auth.uid() = '5413c98b-df84-41ec-bd77-5ea321bc6922'::uuid OR 
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = '5413c98b-df84-41ec-bd77-5ea321bc6922'::uuid OR 
  auth.uid() = id
);

SELECT 'POLÍTICAS RLS APLICADAS CORRECTAMENTE' as status;
```

## ✅ DESPUÉS DE EJECUTAR

1. **Refresca la aplicación** en http://localhost:5174
2. **Prueba el flujo completo:**
   - ✅ Admin puede acceder normalmente
   - ✅ Nuevos usuarios pueden registrarse
   - ✅ Aparece mensaje "Acceso Restringido" para usuarios nuevos
   - ✅ Admin puede activar usuarios desde panel de administración

## 🧪 PRÓXIMO PASO: PROBAR REGISTRO NUEVO

1. Cierra sesión de tu admin
2. Registra un nuevo usuario (ej: `test-usuario@test.com`)
3. Deberías ver el mensaje "Acceso Restringido"
4. Vuelve como admin y activa el usuario
5. El usuario activado debería poder acceder

## 🔧 CARACTERÍSTICAS DE ESTAS POLÍTICAS

- ✅ **Sin recursión:** No consultan `user_profiles` para verificar roles
- ✅ **Admin hardcodeado:** Tu UUID específico tiene acceso completo
- ✅ **Auto-registro:** Nuevos usuarios pueden crear su perfil
- ✅ **Seguras:** Cada usuario solo ve su propio perfil
- ✅ **Flexibles:** Fácil de expandir después

---
**🎯 Ejecuta el código SQL arriba y luego prueba el registro completo**
