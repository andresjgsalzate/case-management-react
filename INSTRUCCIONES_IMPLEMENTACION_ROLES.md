# 🚀 INSTRUCCIONES PARA IMPLEMENTAR NUEVOS ROLES

## 📋 **QUÉ SE HA IMPLEMENTADO**

### ✅ **Completado en el Frontend:**
1. **Hook `useSystemAccess`** - Verifica si el usuario tiene acceso al sistema
2. **Componente `AccessDenied`** - Pantalla para usuarios sin acceso
3. **App.tsx actualizado** - Integrado el control de acceso en el flujo principal
4. **UsersPage mejorado** - Botones de activación rápida para administradores
5. **Documentación actualizada** - SISTEMA-PERMISOS-CASOS.md con todos los detalles

### ✅ **Roles Definidos:**
- 👑 **Administrador**: Acceso completo (sin cambios)
- 👁️ **Supervisor**: Ve todo, puede editar, NO puede eliminar
- 📝 **Analista**: Solo sus casos, NO puede eliminar  
- 🚫 **Usuario**: Sin acceso hasta activación por admin

## 🛠️ **PASOS PARA COMPLETAR LA IMPLEMENTACIÓN**

### 1️⃣ **EJECUTAR MIGRACIÓN EN SUPABASE** ⚠️ **CRÍTICO**

```bash
# Ir al SQL Editor de Supabase y ejecutar:
```

**📁 Archivo**: `run_migration_019.sql`

Este script:
- ✅ Crea roles `supervisor` y `analista` 
- ✅ Redefine `user` como rol sin acceso
- ✅ Asigna permisos específicos a cada rol
- ✅ Crea función `has_system_access()`
- ✅ Actualiza políticas RLS para verificar acceso

### 2️⃣ **VERIFICAR EN BASE DE DATOS**

Después de ejecutar la migración, verificar:

```sql
-- Ver roles creados
SELECT name, description FROM roles ORDER BY name;

-- Ver función creada
SELECT proname FROM pg_proc WHERE proname = 'has_system_access';

-- Verificar permisos por rol
SELECT r.name as role, COUNT(*) as permissions_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.name
ORDER BY r.name;
```

### 3️⃣ **PROBAR EL SISTEMA**

#### **Test 1: Usuario sin acceso**
1. Crear una cuenta nueva (se asignará rol 'user')
2. Intentar hacer login
3. ✅ **Debe mostrar**: Pantalla "Acceso Restringido"

#### **Test 2: Activación por admin**
1. Login como admin
2. Ir a Gestión de Usuarios
3. Ver usuario con rol "Pendiente" 
4. Usar botones "Analista" o "Supervisor"
5. ✅ **Debe**: Cambiar el rol del usuario

#### **Test 3: Usuario activado**
1. Login con usuario activado como analista
2. ✅ **Debe**: Ver solo sus propios casos
3. ✅ **Debe**: NO poder eliminar casos

#### **Test 4: Supervisor**
1. Login con usuario supervisor
2. ✅ **Debe**: Ver todos los casos
3. ✅ **Debe**: NO poder eliminar nada

## 🔧 **CONFIGURACIÓN ADICIONAL**

### **Si hay errores al ejecutar la migración:**

1. **Verificar roles existentes:**
```sql
SELECT * FROM roles WHERE name IN ('admin', 'user');
```

2. **Si faltan permisos base:**
```sql
-- Ver todos los permisos
SELECT name, resource, action FROM permissions ORDER BY resource, action;
```

3. **Aplicar migración paso a paso** si es necesario

### **Para desarrollo local:**
```bash
# Asegurar que el servidor esté corriendo
npm run dev

# La aplicación debe:
# - Compilar sin errores
# - Mostrar pantalla de acceso restringido para usuarios nuevos
# - Permitir activación desde panel de admin
```

## 📊 **RESULTADOS ESPERADOS**

### **Nuevos usuarios:**
- ❌ No pueden acceder al sistema
- ✅ Ven pantalla informativa de activación
- ✅ Pueden cerrar sesión

### **Administradores:**
- ✅ Panel mejorado para gestionar usuarios
- ✅ Botones de activación rápida
- ✅ Indicadores visuales de usuarios pendientes

### **Supervisores (después de activación):**
- ✅ Acceso completo de lectura/edición
- ❌ Sin permisos de eliminación
- ✅ Dashboard con métricas globales

### **Analistas (después de activación):**
- ✅ Acceso solo a sus casos
- ❌ Sin permisos de eliminación
- ✅ Dashboard personal

## 🚨 **PROBLEMAS COMUNES Y SOLUCIONES**

### **Error: "has_system_access function not found"**
- ✅ Ejecutar la migración completa
- ✅ Verificar que la función se creó en Supabase

### **Usuario activado sigue sin acceso**
- ✅ Verificar que tiene el permiso 'system.access'
- ✅ Comprobar que el rol está activo
- ✅ Refrescar la página/limpiar caché

### **Políticas RLS no funcionan**
- ✅ Verificar que RLS está habilitado en las tablas
- ✅ Comprobar que las políticas se crearon correctamente

## 📞 **SOPORTE TÉCNICO**

Si hay problemas:
1. **Verificar logs** en console del navegador
2. **Revisar Network tab** para errores de API
3. **Comprobar Supabase logs** en el dashboard
4. **Verificar políticas RLS** en Supabase

---

## ✅ **CHECKLIST FINAL**

- [ ] Migración ejecutada en Supabase
- [ ] Función `has_system_access()` creada
- [ ] Roles supervisor/analista existen  
- [ ] Permisos asignados correctamente
- [ ] Usuario nuevo muestra pantalla de bloqueo
- [ ] Admin puede activar usuarios
- [ ] Supervisor ve todo pero no elimina
- [ ] Analista solo ve sus casos
- [ ] Documentación actualizada

**🎉 Una vez completado este checklist, el sistema de roles estará completamente funcional.**
