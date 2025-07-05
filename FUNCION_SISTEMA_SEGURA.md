# 🔧 FUNCIÓN SEGURA has_system_access

## ⚡ CÓDIGO ADICIONAL PARA SUPABASE

Después de aplicar las políticas RLS, ejecuta también esto:

```sql
-- =============================================
-- FUNCIÓN SEGURA has_system_access (SIN RECURSIÓN)
-- =============================================

CREATE OR REPLACE FUNCTION has_system_access()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_uuid uuid;
  user_role_name text;
  user_is_active boolean;
BEGIN
  -- Obtener el UUID del usuario actual
  user_uuid := auth.uid();
  
  -- Si no hay usuario autenticado, no tiene acceso
  IF user_uuid IS NULL THEN
    RETURN false;
  END IF;
  
  -- Admin principal siempre tiene acceso (evita recursión)
  IF user_uuid = '5413c98b-df84-41ec-bd77-5ea321bc6922'::uuid THEN
    RETURN true;
  END IF;
  
  -- Para otros usuarios, verificar rol y estado
  -- Usar SELECT directo con bypass implícito de RLS por SECURITY DEFINER
  SELECT 
    r.name,
    up.is_active
  INTO 
    user_role_name,
    user_is_active
  FROM user_profiles up
  JOIN roles r ON r.id = up.role_id
  WHERE up.id = user_uuid;
  
  -- Si no tiene perfil, no tiene acceso
  IF user_role_name IS NULL THEN
    RETURN false;
  END IF;
  
  -- Solo usuarios activos con roles diferentes a 'user' tienen acceso
  IF user_is_active = true AND user_role_name != 'user' THEN
    RETURN true;
  END IF;
  
  -- Por defecto, no tiene acceso
  RETURN false;
END;
$$;

-- Verificar que la función se creó
SELECT 'FUNCIÓN has_system_access ACTUALIZADA' as status;
```

## 🎯 QUÉ HACE ESTA FUNCIÓN

1. **Admin hardcodeado:** Tu UUID siempre retorna `true`
2. **Usuarios normales:** Verifica rol y estado activo
3. **Sin recursión:** Usa `SECURITY DEFINER` para bypass RLS
4. **Lógica clara:** Solo activos con rol != 'user' tienen acceso

## ✅ FLUJO ESPERADO DESPUÉS

1. **Nuevos usuarios:** 
   - Se registran → perfil con rol 'user' 
   - `has_system_access()` retorna `false`
   - Ven mensaje "Acceso Restringido"

2. **Admin activa usuario:**
   - Cambia rol a 'analista' o 'supervisor'
   - `has_system_access()` retorna `true`
   - Usuario obtiene acceso completo

3. **Admin siempre:**
   - `has_system_access()` retorna `true`
   - Acceso total sin restricciones

---
**🚀 Ejecuta ambos bloques de código en Supabase SQL Editor**
