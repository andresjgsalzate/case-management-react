# Módulo de Disposiciones Scripts

## Descripción
El módulo de Disposiciones Scripts permite gestionar solicitudes de disposición de scripts en aplicaciones para el sistema Scripts. Es similar a un formulario de Google Forms pero integrado completamente con el sistema de gestión de casos.

## Características

### ✅ Implementadas
- **Formulario de creación/edición** de disposiciones
- **Vista de tarjetas mensuales** agrupando disposiciones por mes/año
- **Sistema de permisos** integrado con roles existentes
- **Exportación a CSV** por mes y completa
- **Filtros** por año, aplicación y búsqueda de texto
- **Validación de formularios** con Zod schemas
- **Integración con casos y aplicaciones** existentes
- **Responsive design** compatible con el tema oscuro/claro

### 🔄 Campos del Formulario
1. **Fecha** - Fecha de la disposición (requerido)
2. **Caso** - Búsqueda y selección de caso existente (requerido)
3. **Nombre del Script** - Nombre del archivo/script a desplegar (requerido)
4. **Número de Revisión SVN** - Número de revisión del control de versiones (requerido)
5. **Aplicación** - Selección de la aplicación destino (requerido)
6. **Observaciones** - Comentarios adicionales (opcional)

### 📊 Vista Principal
- **Tarjetas mensuales** que muestran:
  - Mes y año
  - Número total de disposiciones
  - Lista de casos únicos con:
    - Número de caso
    - Nombre de aplicación
    - Frecuencia de uso
  - Botón de exportación por mes

### 🔐 Sistema de Permisos
- `disposiciones_Scripts:create` - Crear disposiciones
- `disposiciones_Scripts:read` - Ver disposiciones
- `disposiciones_Scripts:update` - Actualizar disposiciones
- `disposiciones_Scripts:delete` - Eliminar disposiciones
- `disposiciones_Scripts:export` - Exportar disposiciones

### 📈 Exportación
- **Por mes**: CSV con disposiciones específicas del mes
- **Completa**: CSV con todas las disposiciones
- Incluye todos los campos y relaciones

## Archivos Creados/Modificados

### 🆕 Nuevos Archivos
```
src/
├── components/
│   ├── DisposicionScriptsForm.tsx      # Formulario principal
│   └── DisposicionMensualCard.tsx        # Tarjeta de resumen mensual
├── hooks/
│   ├── useDisposicionScripts.ts        # Hook principal de datos
│   └── useDisposicionPermissions.ts      # Hook de permisos
├── pages/
│   └── DisposicionScriptsPage.tsx      # Página principal del módulo
└── utils/
    └── disposicionExportUtils.ts         # Utilidades de exportación

supabase/migrations/
└── 20240101000000_create_disposiciones_Scripts.sql  # Migración DB
```

### ✏️ Archivos Modificados
```
src/
├── App.tsx                    # + Ruta del módulo
├── components/Layout.tsx      # + Navegación del módulo
├── types/index.ts            # + Tipos TypeScript
└── lib/validations.ts        # + Esquemas de validación
```

## Instalación

### 1. Base de Datos
```sql
-- Ejecutar la migración
psql -h [host] -U [usuario] -d [database] -f supabase/migrations/20240101000000_create_disposiciones_Scripts.sql
```

### 2. Permisos por Rol
**Admin**: Todos los permisos (CRUD + export)
**User**: Solo lectura y creación

### 3. Navegación
El módulo aparece automáticamente en la navegación lateral como "Disposiciones" si el usuario tiene permisos.

## Uso

### Para Usuarios
1. **Crear disposición**: Botón "Nueva Disposición" en la página principal
2. **Ver disposiciones**: Tarjetas mensuales con resúmenes automáticos
3. **Filtrar**: Por año, aplicación o búsqueda de texto
4. **Exportar**: Botón en cada tarjeta mensual o exportación completa

### Para Administradores
- Gestión completa de disposiciones (CRUD)
- Asignación de permisos a roles
- Acceso a todas las funciones de exportación

## Dependencias
- **React Query**: Gestión de estado del servidor
- **React Hook Form**: Manejo de formularios
- **Zod**: Validación de esquemas
- **Heroicons**: Iconografía
- **Supabase**: Base de datos y autenticación

## Futuras Mejoras
- [ ] Vista de tabla detallada con paginación
- [ ] Funciones de edición/eliminación inline
- [ ] Reportes avanzados con gráficos
- [ ] Notificaciones automáticas
- [ ] Historial de cambios
- [ ] API para integraciones externas
- [ ] Exportación a Excel/PDF

## Soporte
Para soporte técnico o preguntas sobre el módulo, contactar al equipo de desarrollo del sistema de gestión de casos.
