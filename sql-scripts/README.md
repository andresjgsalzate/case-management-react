# 🚀 SISTEMA DE GESTIÓN DE CASOS - SQL SCRIPTS
# Versión 3.0 Unificada y Organizada

## 📋 INSTALACIÓN RÁPIDA

### ✅ **NUEVA INSTALACIÓN COMPLETA**
```sql
-- 1. Esquema base (tablas, tipos, etc.)
\i create_complete_schema.sql

-- 2. Permisos y roles del sistema
\i 01_unified_permissions.sql

-- 3. Políticas de seguridad RLS
\i 02_unified_rls_policies.sql

-- 4. Funciones y lógica de negocio
\i 03_unified_functions_procedures.sql

-- 5. (OPCIONAL) Configuración de Storage Supabase
\i specific/17_configuracion_storage.sql
\i specific/20_politicas_storage_final.sql
```

## 📁 ESTRUCTURA ORGANIZADA

### 🎯 **SCRIPTS PRINCIPALES (RAÍZ)**
| Archivo | Propósito | Líneas | Dependencias |
|---------|-----------|--------|--------------|
| `create_complete_schema.sql` | 🏗️ Esquema base (tablas) | ~500 | Ninguna |
| `01_unified_permissions.sql` | 🔐 Roles y permisos | 400+ | Schema |
| `02_unified_rls_policies.sql` | 🛡️ Políticas de seguridad | 600+ | Permisos |
| `03_unified_functions_procedures.sql` | ⚙️ Funciones y triggers | 800+ | Schema + Permisos |

### 📂 **CONFIGURACIONES ESPECÍFICAS (`specific/`)**
- **Storage Supabase**: `17_configuracion_storage.sql`, `20_politicas_storage_final.sql`
- **Configuración Emails**: `25_sistema_configuracion_emails.sql`
- **Datos Iniciales**: `16_datos_iniciales_document_types.sql`
- **Configuraciones SMTP**: `32_update_smtp_password.sql`, `34_secure_smtp_credentials.sql`

### 🧪 **SCRIPTS DE TESTING (`testing/`)**
- `36_test_password_recovery_system.sql` - Test del sistema de recuperación
- `37_verificar_sistema_email_completo.sql` - Verificación del sistema de emails
- `verificar_sistema_emails.sql` - Verificación general de emails

### 📚 **ARCHIVOS HISTÓRICOS (`archived/`)**
- Todos los archivos originales (30+ archivos)
- Solo para referencia histórica
- **NO USAR** para nuevas instalaciones

## ✅ **VERIFICACIÓN POST-INSTALACIÓN**

### 1. Verificar Roles
```sql
SELECT name, description FROM roles ORDER BY name;
-- Debe devolver: Administrador, Supervisor, Técnico, Invitado
```

### 2. Verificar Permisos
```sql
SELECT COUNT(*) as total_permisos FROM permissions;
-- Debe devolver: 100+ permisos
```

### 3. Verificar Funciones
```sql
SELECT COUNT(*) as total_funciones 
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' AND p.prokind = 'f';
-- Debe devolver: 30+ funciones
```

### 4. Test Funcional
```sql
-- Test de permisos
SELECT has_permission(
    (SELECT id FROM user_profiles WHERE email = 'admin@sistema.com' LIMIT 1),
    'system.update_configs'
) as admin_permisos;

-- Test de métricas
SELECT get_dashboard_metrics() as metricas;
```

## 🎯 **CASOS DE USO COMUNES**

### 🆕 **Nuevo Entorno de Desarrollo**
```bash
# Configurar base de datos local
psql -d mi_db -f create_complete_schema.sql
psql -d mi_db -f 01_unified_permissions.sql
psql -d mi_db -f 02_unified_rls_policies.sql
psql -d mi_db -f 03_unified_functions_procedures.sql
```

### 🚀 **Deploy a Producción**
```bash
# Con Supabase CLI
supabase db reset
supabase db push
```

### 🧪 **Entorno de Testing**
```bash
# Setup automático + verificaciones
npm run db:setup
npm run db:verify
```

### ⚡ **Solo Actualizar Funciones**
```sql
-- Si solo cambió lógica de negocio
\i 03_unified_functions_procedures.sql
```

## 📊 **ESTADÍSTICAS DEL SISTEMA**

| Componente | Cantidad | Estado |
|------------|----------|--------|
| **Roles** | 4 principales | ✅ Completo |
| **Permisos** | 100+ granulares | ✅ Completo |
| **Políticas RLS** | 50+ tablas | ✅ Completo |
| **Funciones** | 30+ procedimientos | ✅ Completo |
| **Triggers** | 15+ automáticos | ✅ Completo |
| **Archivos Unificados** | 3 principales | ✅ Completo |
| **Archivos Organizados** | 50+ históricos | ✅ Archivado |

## 🔧 **MANTENIMIENTO**

### ✅ **Ventajas de la Nueva Organización**
- **🎯 Instalación en 4 pasos** vs 40+ archivos antes
- **📋 Documentación integrada** en cada script
- **🔄 Fácil mantenimiento** y actualización
- **📂 Estructura clara** por funcionalidad
- **💾 Historial preservado** en `archived/`
- **🧪 Testing organizado** en `testing/`

### 🚫 **Evitar**
- **NO usar archivos de `archived/`** para nuevas instalaciones
- **NO mezclar** scripts viejos con nuevos
- **NO saltar** el orden de instalación
- **NO modificar** directamente los unificados sin documentar

## 📞 **SOPORTE**

### 🐛 **Problemas Comunes**
1. **"relation does not exist"** → Ejecutar `create_complete_schema.sql` primero
2. **"function does not exist"** → Re-ejecutar `03_unified_functions_procedures.sql`
3. **"permission denied"** → Verificar RLS y permisos en `01_unified_permissions.sql`

### 📚 **Documentación Adicional**
- `README_UNIFIED_SCRIPTS.md` - Guía detallada de instalación
- `README_RESTAURACION_COMPLETA.md` - Guía de restauración
- `archived/README_ARCHIVED.md` - Información sobre archivos históricos

## 🎉 **SISTEMA COMPLETAMENTE FUNCIONAL**

✅ Control de tiempo automatizado  
✅ Gestión completa de TODOs  
✅ Sistema de permisos granular  
✅ Seguridad RLS completa  
✅ Métricas y dashboard  
✅ Búsqueda global  
✅ Sistema de emails  
✅ Recuperación de contraseñas  
✅ Triggers automáticos  
✅ **¡TODO FUNCIONANDO!** 🚀

---
*Organizado automáticamente el 8 de agosto de 2025*
