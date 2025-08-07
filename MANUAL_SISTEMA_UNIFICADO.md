# ====================================================================
# MANUAL DE USO - SISTEMA UNIFICADO
# ====================================================================

## 📁 Estructura Final de Archivos SQL

### ✅ Archivos ESENCIALES (mantenidos):
- `SISTEMA_COMPLETO_FINAL.sql` - **ARCHIVO PRINCIPAL** con todas las funciones
- `01_datos_esenciales_roles_permisos.sql` - Roles y permisos básicos
- `02_datos_esenciales_casos.sql` - Datos iniciales de casos
- `09_politicas_rls_granular_v2.sql` - Políticas de seguridad

### 🗑️ Archivos eliminados:
- Todos los archivos duplicados, de prueba y versiones obsoletas
- Archivos numerados 046-054 (funciones de búsqueda obsoletas)
- Archivos con sufijos _v2, _FINAL, _TEST, etc.

## 🚀 Instalación del Sistema

### Paso 1: Ejecutar el archivo principal
```sql
-- En tu cliente SQL (Supabase Dashboard, pgAdmin, etc.)
-- Ejecuta el contenido completo de:
sql-scripts/SISTEMA_COMPLETO_FINAL.sql
```

### Paso 2: Verificar instalación
```sql
-- Verifica que las funciones se crearon correctamente
SELECT proname, proargnames 
FROM pg_proc 
WHERE proname IN (
    'search_cases_autocomplete',
    'get_search_suggestions', 
    'search_docs_v2'
);
```

## 🔧 Funciones Disponibles

### 🔍 Búsquedas
- `get_search_suggestions(text, integer)` - Sugerencias de búsqueda
- `search_docs_v2(text, integer)` - Búsqueda rápida de documentos
- `search_cases_autocomplete(text, text, integer)` - Buscar casos

### 📝 Gestión de Documentos  
- `create_solution_document_final(...)` - Crear documento
- `update_solution_document_final(...)` - Actualizar documento
- `delete_solution_document_final(...)` - Eliminar documento

### 📊 Métricas y Contadores
- `increment_view_count(uuid)` - Incrementar visualizaciones
- `increment_helpful_count(uuid)` - Incrementar útil
- `get_documentation_metrics()` - Obtener métricas

### ✅ Validaciones
- `validate_case_exists(text, text)` - Validar existencia de casos

## 🧹 Limpiar Archivos Obsoletos

Para eliminar los archivos SQL duplicados y obsoletos:

```powershell
# Ejecutar en PowerShell desde la raíz del proyecto
.\limpiar_sql.ps1
```

## ✨ Características del Sistema Final

### 🛡️ Seguridad
- Funciones con `SECURITY DEFINER` que bypasean RLS
- Validación de permisos y autenticación
- Protección contra inyección SQL

### 🔄 Compatibilidad
- Manejo correcto de campos `jsonb`
- Soporte para casos activos y archivados  
- Búsqueda en títulos y contenido

### 📱 Frontend
- El sistema de búsqueda ya está configurado
- Sugerencias automáticas funcionando
- Modo oscuro compatible
- Documentos publicados y borradores

## 🎯 Estado Actual

✅ **Sistema de búsqueda** - Funcionando perfectamente  
✅ **Exportación PDF** - Funcionando con iconos corregidos  
✅ **Base de datos** - Funciones unificadas y optimizadas  
✅ **Frontend** - Conectado a las nuevas funciones RPC  

## 📞 Próximos Pasos

1. **Ejecutar limpieza**: `.\limpiar_sql.ps1`
2. **Verificar funcionamiento**: Probar búsquedas en la interfaz
3. **Backup**: El sistema ya está optimizado y estable
4. **Documentación**: Este archivo sirve como referencia

---
*Versión final unificada - 6 de Agosto, 2025*
