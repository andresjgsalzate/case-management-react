# PRUEBA COMPLETA DEL SISTEMA DE REGISTRO Y ROLES

## 🎯 OBJETIVO
Verificar que el flujo completo de registro y asignación de roles funciona correctamente después de las correcciones de RLS.

## 📋 CHECKLIST PRE-PRUEBA

### 1. Verificar Estado del Sistema
- [x] RLS reactivado en `user_profiles`
- [x] Políticas RLS configuradas correctamente
- [x] Función `has_system_access` existe
- [x] Función `has_case_control_permission` existe
- [x] Hook `useSystemAccess` implementado con auto-creación de perfil
- [x] Servidor de desarrollo funcionando en http://localhost:5174

## 🧪 PRUEBAS A REALIZAR

### FASE 1: Registro de Nuevo Usuario

1. **Abrir aplicación en navegador**
   - URL: http://localhost:5174
   - Debería mostrar formulario de login/registro

2. **Registrar nuevo usuario**
   - Email: `test-nuevo-usuario@test.com`
   - Password: `Test123456!`
   - Verificar que el registro se completa sin errores

3. **Verificar estado después del registro**
   - ✅ Usuario debería estar autenticado
   - ✅ Debería ver mensaje de "Sin acceso al sistema" 
   - ✅ Se debería crear automáticamente un perfil con rol 'user'
   - ✅ `is_active` debería ser `false`

### FASE 2: Verificar Auto-creación de Perfil

4. **Verificar en la consola del navegador**
   - Abrir DevTools > Console
   - Buscar mensajes como:
     - "👤 Usuario sin perfil detectado, creando automáticamente..."
     - "✅ Perfil creado exitosamente:"

5. **Verificar estado del hook `useSystemAccess`**
   - `hasAccess` debería ser `false`
   - `userRole` debería ser `'user'`
   - `userEmail` debería mostrar el email del usuario

### FASE 3: Activación por Admin

6. **Iniciar sesión como admin**
   - Cerrar sesión del usuario test
   - Iniciar sesión con usuario admin existente
   - Navegar a "Administración" > "Usuarios"

7. **Activar usuario test**
   - Buscar `test-nuevo-usuario@test.com` en la lista
   - Verificar que aparece con rol 'user' e inactivo
   - Cambiar rol a 'analista' o 'supervisor'
   - Activar el usuario

### FASE 4: Verificar Acceso del Usuario Activado

8. **Volver a iniciar sesión como usuario test**
   - Cerrar sesión del admin
   - Iniciar sesión con `test-nuevo-usuario@test.com`

9. **Verificar acceso completo**
   - ✅ Debería poder acceder al dashboard
   - ✅ Debería ver opciones según su rol asignado
   - ✅ `useSystemAccess` debería retornar `hasAccess: true`

## 🔍 PUNTOS DE VERIFICACIÓN

### En la Base de Datos
```sql
-- Verificar que el perfil se creó
SELECT 
  up.id,
  up.email,
  up.full_name,
  r.name as role_name,
  up.is_active,
  up.created_at
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
WHERE up.email = 'test-nuevo-usuario@test.com';
```

### En el Frontend (Console.log)
- Buscar mensajes de debug del hook `useSystemAccess`
- Verificar que no hay errores en la consola
- Comprobar llamadas a la API de Supabase

### En Supabase Dashboard
- Ir a Authentication > Users
- Verificar que el usuario aparece en la tabla `auth.users`
- Verificar que el perfil aparece en `public.user_profiles`

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### Si el registro falla:
1. Verificar que RLS permite INSERT en `user_profiles`
2. Revisar políticas RLS en Supabase Dashboard
3. Comprobar logs en la consola del navegador

### Si no se crea el perfil automáticamente:
1. Verificar que `useSystemAccess` se está ejecutando
2. Comprobar que la función `createUserProfile` no tiene errores
3. Verificar que el rol 'user' existe en la base de datos

### Si el admin no puede ver usuarios:
1. Verificar que el admin tiene el permiso `system.admin`
2. Comprobar políticas RLS para SELECT en `user_profiles`

## ✅ CRITERIOS DE ÉXITO

**El sistema está funcionando correctamente si:**

1. ✅ Los nuevos usuarios pueden registrarse sin errores
2. ✅ Se crea automáticamente un perfil con rol 'user' (inactivo)
3. ✅ Los usuarios sin acceso ven el mensaje apropiado
4. ✅ Los admins pueden ver y activar nuevos usuarios
5. ✅ Los usuarios activados pueden acceder al sistema según su rol
6. ✅ No hay errores en la consola del navegador
7. ✅ Todas las políticas RLS funcionan correctamente

## 📝 REPORTE DE RESULTADOS

Después de realizar las pruebas, documenta:

- [ ] ¿Se registró el usuario sin errores?
- [ ] ¿Se creó automáticamente el perfil?
- [ ] ¿Funcionó la activación por parte del admin?
- [ ] ¿El usuario activado puede acceder correctamente?
- [ ] ¿Hay algún error o problema detectado?

---

**Servidor de desarrollo:** http://localhost:5174
**Estado:** ✅ Sistema listo para pruebas
**Última actualización:** Después de reactivar RLS con políticas seguras
