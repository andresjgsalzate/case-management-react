# 🚀 GUÍA RÁPIDA DE PRUEBAS

## 📋 **PASO A PASO PARA VERIFICAR EL SISTEMA**

### **1️⃣ VERIFICAR EN BASE DE DATOS** 
Ejecuta en Supabase SQL Editor:
```sql
-- Verificar roles
SELECT name, description FROM roles ORDER BY name;

-- Verificar que 'user' no tiene system.access
SELECT r.name, COUNT(p.name) as permisos 
FROM roles r 
LEFT JOIN role_permissions rp ON r.id = rp.role_id 
LEFT JOIN permissions p ON rp.permission_id = p.id AND p.name = 'system.access'
WHERE r.name IN ('admin', 'supervisor', 'analista', 'user')
GROUP BY r.name ORDER BY r.name;
```

**✅ Resultado esperado:**
- admin: 1 permiso (system.access)
- analista: 1 permiso (system.access) 
- supervisor: 1 permiso (system.access)
- user: 0 permisos (sin system.access)

---

### **2️⃣ CREAR USUARIO DE PRUEBA**

1. **Abrir otra ventana/navegador en incógnito**
2. **Ir a tu aplicación** (`http://localhost:5173`)
3. **Hacer clic en "Registrarse"** 
4. **Crear cuenta con email**: `test-user-roles@ejemplo.com`
5. **Completar registro**

**✅ Resultado esperado:**
- Usuario se registra exitosamente
- Al intentar hacer login, ve pantalla "Acceso Restringido"
- La pantalla muestra su email y rol "user"

---

### **3️⃣ ACTIVAR USUARIO COMO ADMIN**

1. **En tu ventana principal, login como admin**
2. **Ir a**: Menú → Admin → Gestión de Usuarios
3. **Buscar** el usuario `test-user-roles@ejemplo.com`
4. **Verificar que aparece**:
   - Rol: "Pendiente" (color ámbar)
   - Columna "Activación" con 2 botones:
     - 🔵 "Analista" 
     - 🟢 "Supervisor"

5. **Hacer clic en "Analista"**

**✅ Resultado esperado:**
- Toast: "Usuario activado como analista"
- Rol cambia de "Pendiente" a "analista" (azul)
- Columna activación muestra "Activado"

---

### **4️⃣ PROBAR USUARIO ACTIVADO**

1. **En la ventana incógnito, refrescar página**
2. **Hacer login** con `test-user-roles@ejemplo.com`

**✅ Resultado esperado:**
- ✅ Accede al dashboard (no ve pantalla de bloqueo)
- ✅ Puede navegar normalmente
- ✅ En "Casos" solo ve sus propios casos (estará vacío si es nuevo)
- ❌ NO puede acceder a `/admin/users` (debe redirigir o mostrar error)

---

### **5️⃣ PROBAR SUPERVISOR**

1. **Crear segundo usuario de prueba**: `test-supervisor@ejemplo.com`
2. **Como admin, activarlo como "Supervisor"**
3. **Login con el supervisor**

**✅ Resultado esperado:**
- ✅ Ve todos los casos del sistema
- ✅ Puede editar casos
- ❌ NO ve botones de eliminar casos
- ❌ NO puede acceder a gestión de usuarios

---

## 🎯 **CHECKS RÁPIDOS**

### **Para verificar que funciona correctamente:**

- [ ] **Usuario nuevo** → Pantalla "Acceso Restringido"
- [ ] **Admin puede activar** → Botones funcionan
- [ ] **Analista** → Solo sus casos, no eliminar
- [ ] **Supervisor** → Todos los casos, no eliminar
- [ ] **Usuario sin activar** → Bloqueado totalmente

### **Si algo no funciona:**

1. **Verificar en Network tab** del navegador si hay errores
2. **Revisar console** para errores JavaScript
3. **Comprobar en Supabase** que la función `has_system_access` existe
4. **Verificar políticas RLS** están activas

---

## 🔧 **COMANDOS ÚTILES PARA DEBUG**

```sql
-- Ver todos los usuarios y sus roles
SELECT up.email, r.name as rol 
FROM user_profiles up 
LEFT JOIN roles r ON up.role_id = r.id 
ORDER BY up.created_at DESC;

-- Probar función has_system_access para un usuario específico
-- (cambiar 'email@ejemplo.com' por el email real)
SELECT has_system_access() 
FROM user_profiles 
WHERE email = 'email@ejemplo.com';
```

---

## 📞 **¿TODO FUNCIONANDO?**

Si todos los checks pasan ✅, el sistema está **completamente funcional** y listo para producción.

Si encuentras algún problema ❌, anótalo en el archivo `PRUEBAS_SISTEMA_ROLES.md` para que podamos solucionarlo.
