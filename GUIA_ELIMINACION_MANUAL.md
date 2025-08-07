# 🗑️ GUÍA DE ELIMINACIÓN MANUAL SEGURA DE ARCHIVOS SQL
# ================================================================

## ✅ ARCHIVOS A MANTENER (NO ELIMINAR)
# Estos son los archivos esenciales del sistema

### 📋 Archivos principales:
- SISTEMA_COMPLETO_FINAL.sql          # ← ARCHIVO PRINCIPAL (contiene todo)
- 03_sistema_permisos_granular.sql    # ← Permisos del sistema
- 04_funciones_triggers_globales.sql  # ← Triggers necesarios  
- 05_funciones_casos.sql              # ← Funciones de casos activas
- 06_funciones_todos.sql              # ← Funciones de TODOs
- 07_funciones_archivo.sql            # ← Funciones de archivo
- 08_funciones_documentacion.sql      # ← Funciones de documentación base
- 09_politicas_rls.sql                # ← Políticas RLS principales
- 10_permisos_adicionales_sistema.sql # ← Permisos adicionales
- create_complete_schema.sql          # ← Esquema base completo

### 📊 Archivos de configuración específica:
- 11_permisos_disposiciones_scripts.sql
- 12_politicas_rls_disposiciones.sql  
- 13_politicas_rls_notes.sql
- 14_permisos_notas.sql
- 15_funcion_get_active_document_types.sql
- 16_datos_iniciales_document_types.sql
- 17_configuracion_storage.sql
- 20_politicas_storage_final.sql
- 21_actualizar_tipos_mime_bucket.sql
- 22_permisos_bucket_lectura.sql

## 🗑️ ARCHIVOS SEGUROS PARA ELIMINAR
# Estos son duplicados, pruebas o versiones obsoletas

### 🔄 Archivos duplicados/versiones obsoletas:
- 01_datos_esenciales_roles_permisos.sql   # (0 bytes - vacío)
- 02_datos_esenciales_casos.sql            # (0 bytes - vacío)  
- 03_datos_esenciales_usuario_admin.sql    # (0 bytes - vacío)
- 04_funciones_triggers_globales_v2.sql    # (0 bytes - vacío)
- 05_funciones_casos_v2.sql                # (0 bytes - vacío)
- 05_modulo_casos_funciones.sql            # (0 bytes - vacío)
- 06_funciones_todos_v2.sql                # (0 bytes - vacío)
- 06_modulo_todos_funciones.sql            # (0 bytes - vacío)
- 07_funciones_archivo_v2.sql              # (0 bytes - vacío)
- 07_modulo_archivo_funciones.sql          # (0 bytes - vacío)
- 08_funciones_documentacion_v2.sql        # (0 bytes - vacío)
- 08_modulo_documentacion_funciones.sql    # (0 bytes - vacío)
- 09_politicas_rls_basicas.sql             # (0 bytes - vacío)
- 09_politicas_rls_granular_v2.sql         # (0 bytes - vacío)
- 99_ejecutar_todo_permisos_granulares.sql # (0 bytes - vacío)

### 🔧 Archivos de correcciones ya aplicadas:
- 08_funciones_documentacion_FINAL.sql
- 08_funciones_documentacion_LIMPIEZA_FINAL.sql
- 08_funciones_documentacion_CORRECCION_FINAL.sql
- 046_fix_get_active_document_types.sql
- 047_update_solution_type_constraint.sql

### 🧪 Archivos de prueba y temporales:
- 026_funciones_busqueda_documentacion.sql
- 027_fix_search_suggestions.sql
- 050_test_search_simple.sql
- 051_fix_search_docs_simple.sql
- 052_verificar_publicar_documentos.sql
- 053_verificar_estructura_solution_documents.sql
- 054_funciones_busqueda_corregidas.sql      # ← YA INTEGRADO en SISTEMA_COMPLETO_FINAL.sql

### 👥 Archivos de correcciones de permisos aplicadas:
- 23_funciones_busqueda_casos_validacion.sql
- 24_funciones_corregidas_sin_deleted_at.sql
- 25_funciones_finales_con_verificacion.sql
- 26_funciones_tipos_exactos.sql
- 27_drop_y_recrear_funciones.sql
- 99_configurar_permisos_analista.sql
- 99_ejecutar_todo_completo.sql
- 99_fix_archive_permissions.sql
- 99_fix_archive_sql_functions.sql
- 100_corregir_acceso_analista.sql
- 101_solucion_rapida_analista.sql
- 102_rediseñar_sistema_permisos_analista.sql
- 103_correccion_rapida_analista.sql

### 🏪 Archivos de storage ya configurados:
- 18_verificacion_storage.sql
- 19_admin_storage_setup.sql
- 21_actualizar_tipos_mime_bucket_blocknote.sql

## 📝 COMANDOS PARA ELIMINACIÓN MANUAL

```powershell
# Eliminar archivos vacíos (0 bytes)
Remove-Item "sql-scripts\01_datos_esenciales_roles_permisos.sql"
Remove-Item "sql-scripts\02_datos_esenciales_casos.sql"
Remove-Item "sql-scripts\03_datos_esenciales_usuario_admin.sql"
Remove-Item "sql-scripts\04_funciones_triggers_globales_v2.sql"
Remove-Item "sql-scripts\05_funciones_casos_v2.sql"
Remove-Item "sql-scripts\05_modulo_casos_funciones.sql"
Remove-Item "sql-scripts\06_funciones_todos_v2.sql"
Remove-Item "sql-scripts\06_modulo_todos_funciones.sql"
Remove-Item "sql-scripts\07_funciones_archivo_v2.sql"
Remove-Item "sql-scripts\07_modulo_archivo_funciones.sql"
Remove-Item "sql-scripts\08_funciones_documentacion_v2.sql"
Remove-Item "sql-scripts\08_modulo_documentacion_funciones.sql"
Remove-Item "sql-scripts\09_politicas_rls_basicas.sql"
Remove-Item "sql-scripts\09_politicas_rls_granular_v2.sql"
Remove-Item "sql-scripts\99_ejecutar_todo_permisos_granulares.sql"

# Eliminar versiones FINAL duplicadas
Remove-Item "sql-scripts\08_funciones_documentacion_FINAL.sql"
Remove-Item "sql-scripts\08_funciones_documentacion_LIMPIEZA_FINAL.sql"
Remove-Item "sql-scripts\08_funciones_documentacion_CORRECCION_FINAL.sql"

# Eliminar archivos de búsqueda obsoletos (ya integrados)
Remove-Item "sql-scripts\026_funciones_busqueda_documentacion.sql"
Remove-Item "sql-scripts\027_fix_search_suggestions.sql"
Remove-Item "sql-scripts\050_test_search_simple.sql"
Remove-Item "sql-scripts\051_fix_search_docs_simple.sql"
Remove-Item "sql-scripts\052_verificar_publicar_documentos.sql"
Remove-Item "sql-scripts\053_verificar_estructura_solution_documents.sql"
Remove-Item "sql-scripts\054_funciones_busqueda_corregidas.sql"

# Eliminar fixes ya aplicados
Remove-Item "sql-scripts\046_fix_get_active_document_types.sql"
Remove-Item "sql-scripts\047_update_solution_type_constraint.sql"
Remove-Item "sql-scripts\18_verificacion_storage.sql"
Remove-Item "sql-scripts\19_admin_storage_setup.sql"
Remove-Item "sql-scripts\21_actualizar_tipos_mime_bucket_blocknote.sql"

# Eliminar correcciones de permisos aplicadas
Remove-Item "sql-scripts\23_funciones_busqueda_casos_validacion.sql"
Remove-Item "sql-scripts\24_funciones_corregidas_sin_deleted_at.sql"
Remove-Item "sql-scripts\25_funciones_finales_con_verificacion.sql"
Remove-Item "sql-scripts\26_funciones_tipos_exactos.sql"
Remove-Item "sql-scripts\27_drop_y_recrear_funciones.sql"
Remove-Item "sql-scripts\99_configurar_permisos_analista.sql"
Remove-Item "sql-scripts\99_ejecutar_todo_completo.sql"
Remove-Item "sql-scripts\99_fix_archive_permissions.sql"
Remove-Item "sql-scripts\99_fix_archive_sql_functions.sql"
Remove-Item "sql-scripts\100_corregir_acceso_analista.sql"
Remove-Item "sql-scripts\101_solucion_rapida_analista.sql"
Remove-Item "sql-scripts\102_rediseñar_sistema_permisos_analista.sql"
Remove-Item "sql-scripts\103_correccion_rapida_analista.sql"
```

## 📊 RESULTADO ESPERADO

### Después de la limpieza tendrás solo ~15 archivos esenciales:
- SISTEMA_COMPLETO_FINAL.sql (principal)
- create_complete_schema.sql
- Archivos 03-22 (los activos y necesarios)

### Se eliminarán ~40 archivos obsoletos:
- Todos los archivos vacíos (0 bytes)
- Versiones duplicadas (_v2, _FINAL)
- Fixes ya aplicados (046-054, 99+)
- Archivos de prueba (050-053)

## ✅ VERIFICACIÓN FINAL

Después de eliminar, verifica que tienes estos archivos clave:
- ✅ SISTEMA_COMPLETO_FINAL.sql
- ✅ create_complete_schema.sql  
- ✅ 03_sistema_permisos_granular.sql
- ✅ Los archivos 04-22 (funcionales)

🎯 **Objetivo**: De ~60 archivos a ~15 archivos esenciales
💾 **Espacio liberado**: ~600KB de archivos redundantes
