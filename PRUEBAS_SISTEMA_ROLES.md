# 📋 CHECKLIST DE PRUEBAS - SISTEMA DE ROLES

## ✅ **ESTADO ACTUAL**
- [x] Migración SQL ejecutada correctamente
- [x] Nuevos roles visibles en la aplicación
- [x] Permisos creados en la base de datos

## 🧪 **PRUEBAS PENDIENTES**

### **🔒 Test 1: Usuario Nuevo Sin Acceso**
- [ ] Crear una cuenta nueva (email de prueba)
- [ ] Intentar hacer login con la cuenta nueva
- [ ] ✅ **Debe mostrar**: Pantalla "Acceso Restringido"
- [ ] ✅ **Debe mostrar**: Email del usuario y rol "user"
- [ ] ✅ **Debe mostrar**: Instrucciones de activación
- [ ] ✅ **Debe funcionar**: Botón "Cerrar Sesión"

### **👑 Test 2: Panel de Administración**
- [ ] Login como administrador
- [ ] Ir a "Gestión de Usuarios" (`/admin/users`)
- [ ] ✅ **Debe mostrar**: Usuario nuevo con rol "Pendiente" (ámbar)
- [ ] ✅ **Debe mostrar**: Columna "Activación" con botones
- [ ] ✅ **Debe mostrar**: Botón azul "Analista"
- [ ] ✅ **Debe mostrar**: Botón verde "Supervisor"

### **📝 Test 3: Activar como Analista**
- [ ] Hacer clic en botón "Analista" del usuario de prueba
- [ ] ✅ **Debe mostrar**: Toast "Usuario activado como analista"
- [ ] ✅ **Debe cambiar**: Rol de "Pendiente" a "analista" (azul)
- [ ] ✅ **Debe cambiar**: Columna activación a "Activado"

### **🔓 Test 4: Usuario Analista Activado**
- [ ] Cerrar sesión del admin
- [ ] Login con el usuario activado como analista
- [ ] ✅ **Debe acceder**: Dashboard normal (no pantalla de bloqueo)
- [ ] ✅ **Debe ver**: Solo sus propios casos (si los tiene)
- [ ] ✅ **Debe poder**: Crear nuevos casos
- [ ] ❌ **NO debe poder**: Eliminar casos
- [ ] ❌ **NO debe ver**: Panel de administración

### **👁️ Test 5: Activar como Supervisor**
- [ ] Crear otro usuario de prueba
- [ ] Login como admin
- [ ] Activar el segundo usuario como "Supervisor"
- [ ] Login con el usuario supervisor
- [ ] ✅ **Debe ver**: Todos los casos del sistema
- [ ] ✅ **Debe poder**: Editar cualquier caso
- [ ] ❌ **NO debe poder**: Eliminar casos
- [ ] ✅ **Debe ver**: Dashboard con métricas globales

### **🚫 Test 6: Verificar Restricciones**
- [ ] Como Analista: Intentar acceder a `/admin/users`
- [ ] ✅ **Debe**: Mostrar "No tienes permisos" o redirigir
- [ ] Como Supervisor: Verificar que no aparecen botones de eliminar
- [ ] Como Usuario sin activar: Verificar bloqueo total

## 🐛 **PROBLEMAS ENCONTRADOS**
_(Anotar aquí cualquier error o comportamiento inesperado)_

- [ ] **Problema 1**: _Descripción del problema_
  - **Solución**: _Cómo se resolvió_
  
- [ ] **Problema 2**: _Descripción del problema_
  - **Solución**: _Cómo se resolvió_

## 📊 **RESULTADOS FINALES**
- [ ] ✅ **Sistema funcionando correctamente**
- [ ] ✅ **Todos los roles se comportan según especificación**
- [ ] ✅ **Seguridad verificada**
- [ ] ✅ **UX clara para usuarios**

---

## 📝 **NOTAS ADICIONALES**
_(Agregar observaciones, mejoras sugeridas, etc.)_
