# Documentación de Migraciones

## Estado Actual de la Base de Datos

La base de datos ha sido reseteada completamente el 5 de agosto de 2025.

### Estado Inicial
- ✅ Base de datos limpia después del reset
- ✅ Configuración de Supabase local funcionando
- ✅ Estructura de archivos de migración preparada

### Próximos Pasos
1. Crear migraciones para las tablas principales del sistema
2. Implementar sistema de permisos y roles
3. Configurar policies de RLS (Row Level Security)
4. Crear funciones y triggers necesarios

### Estructura de Migraciones Planificada

#### 1. Sistema de Usuarios y Autenticación
- Extensión de la tabla `auth.users` con perfiles
- Tabla de equipos/organizaciones
- Sistema de roles y permisos

#### 2. Gestión de Casos
- Tabla principal de casos
- Estados y categorías
- Historial de cambios
- Archivos adjuntos

#### 3. Gestión de Tareas
- Tabla de tareas
- Asignaciones
- Dependencias entre tareas
- Time tracking

#### 4. Sistema de Documentación/Knowledge Base
- Artículos y documentos
- Categorías
- Versioning
- Búsqueda full-text

#### 5. Analytics y Reportes
- Métricas de rendimiento
- Logs de actividad
- Dashboards

### Comandos Útiles

```bash
# Crear nueva migración
npx supabase migration new nombre_descriptivo

# Aplicar migraciones
npx supabase db push

# Reset completo
npx supabase db reset

# Ver diferencias
npx supabase db diff

# Ver estado actual
npx supabase status
```

### URLs del Entorno Local
- API URL: http://127.0.0.1:54321
- DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- Studio URL: http://127.0.0.1:54323
- Inbucket URL: http://127.0.0.1:54324
