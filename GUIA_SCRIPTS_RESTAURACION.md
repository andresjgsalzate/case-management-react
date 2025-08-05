# SCRIPTS DE RESTAURACIÓN DEL SISTEMA ORIGINAL

Este directorio contiene dos scripts complementarios para restaurar el sistema de control de casos a su estado original y simple:

## 📄 Script 1: `999_restore_original_permissions_system.sql`
**Función**: Restaura las políticas RLS originales del sistema

### ✨ Características:
- **2,024 líneas** de código SQL
- Elimina **todas las políticas RLS complejas** creadas posteriormente  
- Restaura las **políticas básicas originales** por rol
- Incluye **limpieza completa** de permisos granulares

### 🎯 Cobertura:
- ✅ Sistema de permisos de 3 roles: `admin`, `supervisor`, `analista`
- ✅ Políticas para: casos, TODOs, notas, archivo, documentación, disposiciones
- ✅ Eliminación de roles complejos (auditor, permisos específicos)

---

## 📄 Script 2: `998_cleanup_v2_functions.sql`
**Función**: Elimina funciones v2 y restaura solo funciones básicas originales

### ✨ Características:
- **715 líneas** de código SQL
- Elimina **todas las funciones v2** y avanzadas
- Restaura solo las **10 funciones básicas originales**
- Incluye **recreación de triggers** básicos

### 🗑️ Funciones Eliminadas:
#### Búsqueda Avanzada:
- `search_cases_autocomplete()` 
- `search_docs_v2()`
- `search_solution_documents_advanced()`
- `search_documents_simple/full()`
- `quick_search_documents()`
- `get_search_suggestions()`

#### Administración Avanzada:
- `admin_update_role()`, `admin_update_user()`, etc.
- `admin_create_*()`, `admin_delete_*()`

#### Archivo Avanzado:
- `delete_archived_*_permanently()`
- `get_archive_stats()`
- `can_delete_archived_items()`

#### Documentación:
- `get_solution_document_stats()`
- `increment_document_views()`
- `create_document_version()`
- Triggers de documentación

#### Notas Avanzadas:
- `can_view_note()`, `search_notes()`
- `get_notes_stats()`

#### Storage y Validación:
- `cleanup_orphaned_files()`
- `validate_case_number()`
- `has_system_access()`

### ✅ Funciones Restauradas (Solo Originales):
1. **`update_updated_at_column()`** - Trigger de timestamps
2. **`get_dashboard_metrics()`** - Métricas básicas del dashboard  
3. **`get_todo_metrics()`** - Métricas básicas de TODOs
4. **`initialize_todo_control()`** - Control básico de TODOs
5. **`toggle_todo_timer()`** - Timer básico de TODOs
6. **`complete_todo()`** - Completar TODO
7. **`archive_case()`** - Archivo básico de casos
8. **`archive_todo()`** - Archivo básico de TODOs  
9. **`restore_case()`** - Restauración básica de casos
10. **`restore_todo()`** - Restauración básica de TODOs

---

## 📋 Orden de Ejecución Recomendado:

### 1️⃣ **Primero**: `998_cleanup_v2_functions.sql`
```sql
-- Limpia funciones v2 y recientes
-- Restaura solo funciones básicas originales
-- Recrear triggers básicos
```

### 2️⃣ **Segundo**: `999_restore_original_permissions_system.sql` 
```sql
-- Limpia políticas RLS complejas
-- Restaura permisos básicos por rol
-- Configuración final del sistema
```

---

## 🎯 Resultado Final:

### Sistema Simplificado:
- **3 roles únicos**: admin, supervisor, analista
- **10 funciones básicas** (vs +50 anteriormente)
- **Políticas RLS simples** basadas en `role_name`
- **Sin dependencias complejas** entre tablas

### Ventajas:
- ✅ **Fácil mantenimiento**
- ✅ **Mejor rendimiento** 
- ✅ **Debugging simplificado**
- ✅ **Lógica clara** de permisos
- ✅ **Sin funcionalidades sobrecomplicadas**

### Sistema de Permisos Restaurado:
```
🔑 ADMIN: Acceso completo a todo
👁️ SUPERVISOR: Ver todo, modificar asignaciones
📝 ANALISTA: Ver/modificar solo registros propios o asignados
```

---

## ⚠️ Antes de Ejecutar:

1. **Realizar backup** completo de la base de datos
2. **Probar en entorno de desarrollo** primero
3. **Documentar** funcionalidades que dependían de características eliminadas
4. **Verificar** que la aplicación funciona después de la restauración

---

## 📊 Métricas de Limpieza:

| Categoría | Antes | Después | Reducción |
|-----------|--------|---------|-----------|
| **Funciones** | ~55 | 10 | -82% |
| **Políticas RLS** | ~150 | ~45 | -70% |
| **Roles** | 4+ | 3 | -25% |
| **Complejidad** | Alta | Baja | -90% |

¡El sistema queda restaurado a su simplicidad y eficiencia originales! 🎉
