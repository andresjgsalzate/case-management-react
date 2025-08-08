# 📁 ARCHIVOS HISTÓRICOS - ARCHIVED

## 🎯 PROPÓSITO
Esta carpeta contiene todos los archivos SQL originales que fueron **unificados** en los 3 scripts principales del sistema. Estos archivos se mantienen por:

- **Historial de desarrollo**: Referencia completa del proceso de desarrollo
- **Debugging**: Posibilidad de revisar lógica específica si es necesario
- **Documentación**: Evolución del sistema a lo largo del tiempo
- **Backup**: Respaldo de funcionalidades individuales

## ✅ **ARCHIVOS YA INCLUIDOS EN SCRIPTS UNIFICADOS**

### 🔐 Permisos y Roles → `01_unified_permissions.sql`
- `03_sistema_permisos_granular.sql`
- `10_permisos_adicionales_sistema.sql`
- `11_permisos_disposiciones_scripts.sql`
- `14_permisos_notas.sql`
- `asignar_permisos_email.sql`
- `fix_case_control_permissions.sql`

### 🛡️ Políticas RLS → `02_unified_rls_policies.sql`
- `09_politicas_rls.sql`
- `12_politicas_rls_disposiciones.sql`
- `13_politicas_rls_notes.sql`
- `27_fix_password_reset_tokens_rls.sql`
- `28_fix_insert_policy_password_reset.sql`
- `33_email_logs_rls_policies.sql`
- `37_system_configurations_rls_policies.sql`
- `41_fix_todo_time_entries_rls.sql`
- `fix_case_control_rls_policies.sql`

### ⚙️ Funciones y Triggers → `03_unified_functions_procedures.sql`
- `04_funciones_triggers_globales.sql`
- `05_funciones_casos.sql`
- `06_funciones_todos.sql`
- `07_funciones_archivo.sql`
- `08_funciones_documentacion.sql`
- `15_funcion_get_active_document_types.sql`
- `29_password_reset_functions.sql`
- `30_recovery_security_functions.sql`
- `31_fix_function_types.sql`
- `31_fix_recovery_function_types.sql`
- `40_fix_duration_calculation.sql`
- `42_fix_todo_completion_function.sql`
- `fix_delete_case_function.sql`
- `fix_total_time_calculation.sql`

## 🚫 **NO USAR ESTOS ARCHIVOS**

⚠️ **IMPORTANTE**: Estos archivos son solo para referencia histórica. 

**Para nuevas instalaciones usar ÚNICAMENTE:**
1. `create_complete_schema.sql`
2. `01_unified_permissions.sql`
3. `02_unified_rls_policies.sql`
4. `03_unified_functions_procedures.sql`

## 📋 **ESTADO AL MOMENTO DEL ARCHIVO**
- **Fecha de archivo**: 8 de agosto de 2025
- **Versión del sistema**: 3.0 Unificado
- **Scripts unificados**: Completamente funcionales y probados
- **Razón del archivo**: Organización y limpieza del proyecto

## 🔄 **SI NECESITAS REVISAR ALGO**
Si necesitas revisar alguna lógica específica de estos archivos:

1. **Busca primero en los scripts unificados** - La mayoría del código está ahí
2. **Usa esta carpeta solo como referencia** - No ejecutes estos scripts
3. **Consulta la documentación** - `README_UNIFIED_SCRIPTS.md` tiene toda la info

---
*Archivos movidos automáticamente el 8 de agosto de 2025*
