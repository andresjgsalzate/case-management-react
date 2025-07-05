# 🧪 GUÍA DE PRUEBAS: SISTEMA DE INVITACIONES

## ✅ VERIFICACIÓN PREVIA

Antes de probar, asegúrate de que:
- ✅ La aplicación esté ejecutándose: `npm run dev`
- ✅ Tengas acceso como admin al sistema
- ✅ Tengas acceso a un email para recibir invitaciones

## 🚀 PRUEBA COMPLETA PASO A PASO

### **PASO 1: Acceder como Administrador**

1. **Abrir aplicación**: http://localhost:5175
2. **Iniciar sesión** con credenciales de admin
3. **Verificar acceso** al menú "Administración"

### **PASO 2: Invitar Nuevo Usuario**

1. **Navegar** a "Administración > Usuarios"
2. **Verificar botón** "Invitar Usuario" (no "Crear Usuario")
3. **Hacer clic** en "Invitar Usuario"
4. **Completar formulario**:
   - Email: `test@ejemplo.com`
   - Nombre: `Usuario Prueba`
   - Rol: `analista`
   - Estado: ✅ Activo
5. **Hacer clic** en "Enviar Invitación"
6. **Verificar mensaje**: "Invitación enviada por email correctamente"

### **PASO 3: Verificar Email de Invitación**

1. **Revisar bandeja** del email `test@ejemplo.com`
2. **Buscar email** de Supabase con subject "Confirm your signup"
3. **Verificar que contenga** link de activación
4. **NO hacer clic aún** (solo verificar que llegó)

### **PASO 4: Verificar Estado en Panel Admin**

1. **Regresar** al panel de usuarios
2. **Verificar** que NO aparece el usuario invitado
3. **Esto es normal**: Usuario aparecerá tras completar invitación

### **PASO 5: Completar Invitación (Como Usuario)**

1. **Abrir email** de invitación
2. **Hacer clic** en "Confirm your account"
3. **Verificar redirección** a `/complete-invitation`
4. **Completar formulario**:
   - Nombre: `Usuario Prueba` (ya pre-llenado)
   - Contraseña: `password123`
   - Confirmar: `password123`
5. **Hacer clic** en "Completar Registro"
6. **Verificar redirección** al dashboard
7. **Verificar mensaje**: "¡Registro completado exitosamente!"

### **PASO 6: Verificar Acceso del Nuevo Usuario**

1. **Verificar** que estás en el dashboard
2. **Verificar** menú limitado (sin opciones de admin)
3. **Revisar** nombre en header/perfil
4. **Hacer logout** para continuar pruebas

### **PASO 7: Verificar en Panel Admin**

1. **Iniciar sesión** nuevamente como admin
2. **Ir** a "Administración > Usuarios"
3. **Verificar** que ahora SÍ aparece el usuario:
   - Email: `test@ejemplo.com`
   - Nombre: `Usuario Prueba`
   - Rol: `analista`
   - Estado: `Activo`
   - Activación: "Activado" ✅

## 🔬 PRUEBAS ADICIONALES

### **Prueba A: Usuario Ya Registrado**

1. **Intentar invitar** el mismo email otra vez
2. **Verificar error**: "Este email ya está registrado..."

### **Prueba B: Activación Rápida**

1. **Crear otro usuario** con rol `user`
2. **Completar invitación** normalmente
3. **En panel admin**, usar botones "Analista" o "Supervisor"
4. **Verificar** cambio inmediato de rol

### **Prueba C: Email Inválido**

1. **Intentar invitar** con email inválido: `test@invalid`
2. **Verificar** validación de formulario

## ❌ POSIBLES PROBLEMAS Y SOLUCIONES

### **Error: "Missing or invalid Supabase environment variables"**
**Solución**: Configurar variables en `.env`:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima
```

### **Error: Email no llega**
**Posibles causas**:
- Revisar carpeta spam
- Verificar configuración SMTP en Supabase
- Email temporal/desechable bloqueado

### **Error: "Link de invitación inválido"**
**Posibles causas**:
- Link expirado (verificar tiempo)
- Token ya usado
- Error en URL

### **Error: Página no encontrada en `/complete-invitation`**
**Solución**: Verificar que las rutas estén actualizadas en App.tsx

## ✅ CRITERIOS DE ÉXITO

Una prueba es **exitosa** si:

- ✅ Admin puede enviar invitaciones sin errores
- ✅ Email de invitación se recibe correctamente
- ✅ Usuario puede completar registro con contraseña propia
- ✅ Perfil se crea automáticamente con rol correcto
- ✅ Usuario accede inmediatamente al sistema
- ✅ Usuario aparece en panel admin tras completar
- ✅ Manejo correcto de errores (emails duplicados, etc.)

## 🎯 RESULTADO ESPERADO

Al final de las pruebas deberías tener:

1. **Sistema de invitaciones** completamente funcional
2. **Usuario de prueba** activado con rol analista
3. **Confirmación** de que el flujo admin→invitación→activación funciona
4. **Verificación** de seguridad y usabilidad

---

**🎉 ¡Si todas las pruebas pasan, el sistema está listo para producción!**
