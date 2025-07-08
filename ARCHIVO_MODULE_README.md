# Módulo de Archivo - Sistema de Gestión de Casos

## Descripción

El módulo de archivo permite a los usuarios enviar manualmente casos y TODOs en estado terminado a un archivo, manteniendo toda la información de tiempos y datos. Los elementos archivados pueden ser restaurados si es necesario.

## Características Principales

### 🗃️ Funcionalidades de Archivo
- **Archivo Manual**: Los usuarios pueden archivar casos y TODOs terminados manualmente
- **Conservación de Datos**: Se mantiene toda la información original y de tiempos
- **Restauración**: Posibilidad de restaurar elementos archivados (para administradores y supervisores)
- **Auditoría**: Log completo de todas las acciones de archivo y restauración

### 📊 Estadísticas y Reportes
- **Dashboard de Estadísticas**: Métricas de elementos archivados, tiempo total, etc.
- **Estadísticas por Usuario**: Desglose de archivos por usuario
- **Estadísticas Mensuales**: Tendencias de archivo en los últimos 12 meses
- **Filtros Avanzados**: Búsqueda y filtrado por tipo, usuario, fecha, etc.

### 🔐 Permisos y Seguridad
- **Control de Acceso**: Diferentes niveles de permisos según el rol del usuario
- **RLS (Row Level Security)**: Políticas de seguridad a nivel de base de datos
- **Auditoría Completa**: Registro de todas las acciones para trazabilidad

## Estructura del Módulo

### Base de Datos

#### Tablas Principales
- `archived_cases`: Casos archivados con datos completos
- `archived_todos`: TODOs archivados con datos completos
- `archive_audit_log`: Log de auditoría de acciones

#### Funciones y Procedimientos
- `archive_case()`: Archivar un caso completado
- `archive_todo()`: Archivar un TODO completado
- `restore_case()`: Restaurar un caso archivado
- `restore_todo()`: Restaurar un TODO archivado
- `get_archive_stats_by_user()`: Estadísticas por usuario
- `get_archive_stats_monthly()`: Estadísticas mensuales
- `get_archivable_cases()`: Obtener casos archivables
- `get_archivable_todos()`: Obtener TODOs archivables

### Frontend

#### Componentes
- `ArchiveModal`: Modal para confirmar archivado
- `RestoreModal`: Modal para confirmar restauración
- `ArchiveDetailsModal`: Ver detalles de elementos archivados

#### Páginas
- `ArchivePage`: Página principal del módulo de archivo
- `ArchivableItemsPage`: Lista de elementos listos para archivar

#### Hooks
- `useArchive`: Hook principal para gestión de archivo

## Flujo de Trabajo

### 1. Identificación de Elementos Archivables
```
Caso/TODO Completado → Aparece en lista archivable → Usuario puede archivar
```

### 2. Proceso de Archivado
```
Seleccionar elemento → Confirmar archivo → Datos se guardan → Elemento se elimina de vista principal
```

### 3. Proceso de Restauración
```
Buscar en archivo → Seleccionar elemento → Confirmar restauración → Elemento marcado como restaurado
```

## Permisos por Rol

### Administrador
- ✅ Ver todos los elementos archivados
- ✅ Archivar cualquier elemento terminado
- ✅ Restaurar cualquier elemento archivado
- ✅ Eliminar elementos archivados
- ✅ Ver todas las estadísticas

### Supervisor
- ✅ Ver todos los elementos archivados
- ✅ Archivar cualquier elemento terminado
- ✅ Restaurar cualquier elemento archivado
- ✅ Ver todas las estadísticas

### Analista
- ✅ Ver elementos archivados propios o asignados
- ✅ Archivar elementos propios terminados
- ❌ Restaurar elementos
- ✅ Ver estadísticas propias

## Configuración

### Variables de Entorno
No se requieren variables adicionales para el módulo de archivo.

### Migraciones
- `016_archive_module.sql`: Estructura principal del módulo
- `017_archive_rls_policies.sql`: Políticas de seguridad
- `018_archive_functions.sql`: Funciones auxiliares y estadísticas

## Uso del Módulo

### Para Archivar un Elemento

1. **Desde Control de Casos**: 
   - Ir a Control de Casos
   - Buscar casos con estado "TERMINADA"
   - Hacer clic en el botón de archivo (📦)

2. **Desde TODOs**:
   - Ir a la página de TODOs
   - Buscar TODOs completados
   - Hacer clic en el botón de archivo (📦)

3. **Desde Elementos Archivables**:
   - Ir a "Archivo" → "Elementos Archivables"
   - Ver lista de elementos listos para archivar
   - Hacer clic en "Archivar"

### Para Ver Elementos Archivados

1. Ir a la página "Archivo" en el menú principal
2. Usar filtros para encontrar elementos específicos
3. Hacer clic en el ojo (👁️) para ver detalles completos

### Para Restaurar un Elemento (Solo Admins/Supervisores)

1. Ir a la página "Archivo"
2. Encontrar el elemento archivado
3. Hacer clic en el botón de restaurar (🔄)
4. Confirmar la restauración

## Consideraciones Técnicas

### Rendimiento
- Los elementos archivados se almacenan en tablas separadas para optimizar consultas
- Índices optimizados para búsquedas frecuentes
- Funciones de limpieza para elementos restaurados antiguos

### Integridad de Datos
- Toda la información original se guarda en formato JSON
- Validaciones para evitar archivar elementos no terminados
- Auditoría completa de todas las acciones

### Seguridad
- RLS habilitado en todas las tablas de archivo
- Permisos granulares según rol de usuario
- Log de auditoría para trazabilidad

## Mantenimiento

### Limpieza Automática
```sql
-- Limpiar elementos restaurados antiguos (>24 meses)
SELECT cleanup_old_archive_entries(24);
```

### Consultas Útiles
```sql
-- Ver estadísticas generales
SELECT * FROM archive_stats;

-- Ver auditoría de acciones
SELECT * FROM archive_audit_log ORDER BY created_at DESC;

-- Ver elementos archivables para un usuario
SELECT * FROM get_archivable_cases('user-uuid');
SELECT * FROM get_archivable_todos('user-uuid');
```

## Próximas Mejoras

- [ ] Exportación de elementos archivados a Excel/CSV
- [ ] Programación automática de archivado después de X días
- [ ] Notificaciones de elementos listos para archivar
- [ ] Dashboard avanzado con gráficos de tendencias
- [ ] Compresión de datos archivados antiguos
- [ ] API para integración con sistemas externos

## Soporte

Para reportar errores o solicitar nuevas funcionalidades relacionadas con el módulo de archivo, crear un issue en el repositorio del proyecto.
