# 🔒 SISTEMA DE PERMISOS Y ACCESO A CASOS

## 📋 **NUEVO MODELO DE ROLES IMPLEMENTADO**

**🎯 OBJETIVO**: Control estricto de acceso donde nuevos usuarios no pueden usar el sistema hasta ser activados por un administrador.

## � **ROLES DEL SISTEMA**

### 👑 **ADMINISTRADOR** 
- **✅ Acceso completo** al sistema
- **✅ Ve y gestiona TODOS los casos**
- **✅ Puede crear, editar y eliminar** cualquier cosa
- **✅ Gestiona usuarios** y roles
- **✅ Acceso al panel de administración**

### 👁️ **SUPERVISOR**
- **✅ Ve TODO** el sistema (casos, usuarios, reportes)
- **✅ Puede crear y editar** casos de cualquier usuario
- **❌ NO puede eliminar** nada (casos, usuarios, etc.)
- **✅ Dashboard global** con métricas de todos
- **✅ Reportes completos** del equipo

### � **ANALISTA**
- **🔒 Ve SOLO sus propios casos** (casos donde `user_id = auth.uid()`)
- **✅ Puede crear y editar** sus propios casos
- **❌ NO puede eliminar** sus casos
- **🔒 Dashboard personal** con solo sus métricas
- **🔒 Reportes limitados** a su propio trabajo

### 🚫 **USUARIO**
- **❌ SIN ACCESO** al sistema
- **🕒 Estado de espera** para activación
- **🔒 Bloqueo total** hasta que un admin lo active
- **📧 Solo puede cerrar sesión** y contactar al admin

## � **CONTROL DE ACCESO AL SISTEMA**

### �️ **Función Principal: `has_system_access()`**

```sql
CREATE OR REPLACE FUNCTION has_system_access()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM user_profiles up
        JOIN roles r ON up.role_id = r.id
        JOIN role_permissions rp ON r.id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE up.id = auth.uid() 
        AND p.name = 'system.access'
        AND up.is_active = true
        AND r.is_active = true
        AND p.is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### � **Política de Acceso Básico**

```sql
-- Solo usuarios con permiso 'system.access' pueden acceder
CREATE POLICY "System access required for cases" ON cases
    FOR ALL USING (has_system_access());
```

## 📊 **PERMISOS POR ROL**

### 👑 **ADMINISTRADOR - Permisos Completos**
- ✅ **Todos los permisos** del sistema
- ✅ `system.access` - Acceso básico al sistema
- ✅ `cases.*` - Gestión completa de casos
- ✅ `users.*` - Gestión completa de usuarios
- ✅ `admin.*` - Acceso a panel de administración

### 👁️ **SUPERVISOR - Solo Lectura/Edición**
- ✅ `system.access` - Acceso básico al sistema
- ✅ `cases.create`, `cases.read.all`, `cases.update.all`
- ❌ `cases.delete.*` - NO puede eliminar casos
- ✅ `users.read` - Solo ver usuarios
- ✅ `case_control.view_all` - Ve todos los controles
- ✅ `case_control.view_team_reports` - Reportes del equipo

### 📝 **ANALISTA - Solo Sus Casos**
- ✅ `system.access` - Acceso básico al sistema
- ✅ `cases.create`, `cases.read.own`, `cases.update.own`
- ❌ `cases.delete.*` - NO puede eliminar casos
- ❌ `cases.read.all` - NO ve casos de otros
- ✅ `case_control.view_own` - Solo sus controles
- ✅ `case_control.view_reports` - Solo sus reportes

### 🚫 **USUARIO - Sin Permisos**
- ❌ NO tiene `system.access`
- ❌ NO tiene permisos en el sistema
- ❌ Bloqueado hasta activación por admin

## � **FLUJO DE ACTIVACIÓN DE USUARIOS**

### � **1. Registro Inicial**
- Usuario se registra en el sistema
- Automáticamente asignado al rol **"Usuario"** (sin acceso)
- Estado: **Pendiente de activación**

### 🕒 **2. Estado de Espera**
- Usuario ve pantalla de **"Acceso Restringido"**
- No puede acceder a ninguna funcionalidad del sistema
- Solo puede cerrar sesión

### � **3. Activación por Admin**
- Admin ve usuarios pendientes en la gestión de usuarios
- **Indicador visual**: rol "Pendiente" en color ámbar
- **Botones de activación rápida**:
  - 🟢 **Activar como Analista**
  - 🔵 **Activar como Supervisor**

### ✅ **4. Usuario Activado**
- Usuario puede acceder según su nuevo rol
- Permisos aplicados inmediatamente
- Dashboard personalizado según rol

## � **IMPACTO EN DASHBOARDS**

### 👑 **Dashboard ADMINISTRADOR**
- **Métricas globales**: Ve tiempo de TODOS los usuarios
- **Casos completos**: Lista todos los casos del sistema
- **Gestión de usuarios**: Panel para activar nuevos usuarios
- **Reportes completos**: Datos de todo el equipo

### �️ **Dashboard SUPERVISOR**
- **Métricas del equipo**: Ve datos de todos excepto gestión de usuarios
- **Casos de todos**: Puede ver y editar cualquier caso
- **Reportes del equipo**: Acceso a métricas globales
- **Sin eliminación**: No puede borrar datos

### 📝 **Dashboard ANALISTA**
- **Métricas personales**: Solo su tiempo y casos
- **Casos propios**: Solo casos asignados a él
- **Reportes limitados**: Solo sus métricas
- **Sin eliminación**: No puede borrar sus casos

### 🚫 **Usuario Sin Activar**
- **Pantalla de bloqueo**: No accede a dashboards
- **Mensaje de activación**: Instrucciones claras
- **Contacto admin**: Información para activación

## 🎯 **RESUMEN FINAL**

| Aspecto | ADMIN | SUPERVISOR | ANALISTA | USUARIO |
|---------|-------|------------|----------|---------|
| **Acceso al sistema** | ✅ Completo | ✅ Completo | ✅ Limitado | ❌ Bloqueado |
| **Ver casos** | ✅ Todos | ✅ Todos | 🔒 Solo propios | ❌ Ninguno |
| **Eliminar** | ✅ Todo | ❌ Nada | ❌ Nada | ❌ Nada |
| **Dashboard** | ✅ Global | ✅ Global | 🔒 Personal | ❌ Bloqueado |
| **Gestión usuarios** | ✅ Completa | ❌ Solo ver | ❌ Nada | ❌ Nada |
| **Activación requerida** | ❌ No | ❌ No | ❌ No | ✅ Sí |

## 🔧 **IMPLEMENTACIÓN TÉCNICA**

### **Frontend**: 
- Hook `useSystemAccess()` verifica acceso al cargar la app
- Componente `AccessDenied` para usuarios sin acceso
- Panel de administración con activación rápida

### **Backend**: 
- Función `has_system_access()` en PostgreSQL
- Políticas RLS que verifican acceso básico
- Permiso especial `system.access` para control granular

### **Seguridad**:
- **Bloqueo por defecto**: Nuevos usuarios sin acceso
- **Activación manual**: Solo admin puede activar
- **Control granular**: Permisos específicos por rol
- **Políticas RLS**: Aplicadas automáticamente en BD
