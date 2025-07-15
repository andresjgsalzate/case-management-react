# 🚨 SOLUCIÓN URGENTE: Recursión Infinita en user_profiles

## ⚠️ PROBLEMA CRÍTICO
Tu aplicación está fallando con el error:
```
infinite recursion detected in policy for relation "user_profiles"
```

## 🔧 CAUSA DEL PROBLEMA
Las funciones `has_permission()` y `get_user_role()` acceden a la tabla `user_profiles`, pero esta tabla tiene RLS habilitado sin políticas adecuadas, creando un bucle infinito.

## 🚑 SOLUCIÓN INMEDIATA

### **PASO 1: Ejecutar Script de Emergencia**
Ejecuta inmediatamente el archivo: **`025_fix_user_profiles_recursion.sql`**

### **PASO 2: Verificar que funciona**
Después de ejecutar el script, prueba esta consulta:
```sql
SELECT id, email, full_name FROM user_profiles WHERE id = auth.uid();
```

### **PASO 3: Reiniciar la aplicación**
1. Detén el servidor de desarrollo
2. Reinicia con `npm run dev` o `yarn dev`

## 📋 QUÉ HACE EL SCRIPT

### **1. Elimina la Recursión:**
- Desactiva temporalmente RLS en `user_profiles`
- Crea políticas que NO usan `has_permission()`
- Usa verificación directa de permisos sin recursión

### **2. Políticas Nuevas:**
```sql
-- Usuarios ven su propio perfil
id = auth.uid()

-- O tienen acceso de sistema (verificación directa)
EXISTS (SELECT ... FROM user_profiles ... WHERE p.name = 'system.access')
```

### **3. Sin Dependencias Circulares:**
- Las políticas de `user_profiles` NO llaman a `has_permission()`
- Las funciones `has_permission()` pueden acceder a `user_profiles` sin recursión

## 🔍 VERIFICACIÓN POST-SOLUCIÓN

Ejecuta estas consultas para confirmar que todo funciona:

```sql
-- 1. Verificar acceso a user_profiles
SELECT id, email, full_name FROM user_profiles LIMIT 5;

-- 2. Verificar función has_permission
SELECT has_permission(auth.uid(), 'admin.access');

-- 3. Verificar función get_user_role  
SELECT get_user_role(auth.uid());
```

## 🎯 RESULTADO ESPERADO

Después de aplicar la solución:
- ✅ La aplicación carga sin errores
- ✅ Los usuarios pueden acceder a sus perfiles
- ✅ Las funciones de permisos funcionan correctamente
- ✅ No hay más recursión infinita

## 📞 SI EL PROBLEMA PERSISTE

Si después de ejecutar el script el problema continúa:

1. **Revisa los logs** de Supabase para errores específicos
2. **Verifica las políticas** con:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'user_profiles';
   ```
3. **Proporciona el error específico** para diagnóstico adicional

## ⏰ URGENCIA

Este es un problema que bloquea completamente la aplicación. **Ejecuta el script inmediatamente** para restaurar la funcionalidad.
