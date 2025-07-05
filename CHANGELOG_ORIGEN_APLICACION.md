# 📋 Actualización: Campos Origen y Aplicación

## 🎯 Resumen
Se han agregado dos nuevos campos al sistema de gestión de casos: **Origen** y **Aplicación** (anteriormente "Destino"). Estos campos se implementaron como tablas independientes para mejorar la normalización de datos y facilitar el mantenimiento futuro.

## 📊 Tablas Creadas

### 1. Tabla `origenes`
```sql
- id (UUID, Primary Key)
- nombre (VARCHAR(100), UNIQUE)
- descripcion (TEXT, opcional)
- activo (BOOLEAN, default: true)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 2. Tabla `aplicaciones` (anteriormente `destinos`)
```sql
- id (UUID, Primary Key)
- nombre (VARCHAR(100), UNIQUE)
- descripcion (TEXT, opcional)
- activo (BOOLEAN, default: true)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## 🔄 Cambios en la Tabla `cases`

Se agregaron dos nuevos campos opcionales:
```sql
+ origen_id (UUID, Foreign Key a origenes.id)
+ aplicacion_id (UUID, Foreign Key a aplicaciones.id)
```

## 🎨 Tipos TypeScript Actualizados

### Interface Case
```typescript
interface Case {
  // ...campos existentes...
  origenId?: string;
  aplicacionId?: string;
  // Relaciones pobladas
  origen?: Origen;
  aplicacion?: Aplicacion;
}
```

### Nuevas Interfaces
```typescript
interface Origen {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Aplicacion {
  id: string;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}
```

## 🔧 Hooks Nuevos

- `useOrigenes()`        // Obtener todos los orígenes activos
- `useAplicaciones()`    // Obtener todas las aplicaciones activas  
- `useOrigen(id)`        // Obtener origen específico
- `useAplicacion(id)`    // Obtener aplicación específica

## ✨ Características

- **Campos opcionales** de Origen y Aplicación
- **Validación automática** en formularios  
- **Exportación** incluye datos de origen/aplicación
- **Normalización** de datos para mejor mantenimiento
- **RLS (Row Level Security)** configurado
- **Índices** optimizados para consultas
- **Triggers** automáticos para `updated_at`
- **Fácil agregar** nuevos orígenes/aplicaciones

## 📦 Datos Iniciales

### Orígenes
- BACKLOG
- PRIORIZADA  
- CON_CAMBIOS
- ACTIVIDAD

### Aplicaciones
- SISLOG
- SIGLA
- AGD
- ACTIVIDAD
- GARANTIAS
- KOMPENDIUM
- SYON
- WSM LAB

## 🔄 Migración de Datos Existentes

Para casos existentes sin origen/aplicación:
```sql
UPDATE cases 
SET 
    origen_id = (SELECT id FROM origenes WHERE nombre = 'BACKLOG' LIMIT 1),
    aplicacion_id = (SELECT id FROM aplicaciones WHERE nombre = 'SISLOG' LIMIT 1)
WHERE origen_id IS NULL OR aplicacion_id IS NULL;
```

## 📝 Consultas de Ejemplo

### Casos con relaciones:
```sql
SELECT c.*, o.nombre as origen_nombre, a.nombre as aplicacion_nombre
FROM cases c 
LEFT JOIN origenes o ON c.origen_id = o.id
LEFT JOIN aplicaciones a ON c.aplicacion_id = a.id
WHERE c.user_id = auth.uid()
ORDER BY c.created_at DESC;
```

## 🚀 Próximas Mejoras

### Análisis y Reportes
- **Filtros avanzados** por origen/aplicación
- **Estadísticas** por origen/aplicación  
   - Casos por origen
   - Complejidad por aplicación
   - Gráficos por origen/aplicación

### Funcionalidades Adicionales
- **Rutas comunes** origen → aplicación
   - Combinación origen + aplicación
   - Patrones de casos frecuentes

### Administración
   - CRUD de orígenes/aplicaciones
   - Activar/desactivar opciones
   
### Inteligencia
   - Reportes por rutas (origen → aplicación)
   - Predicción de complejidad por ruta
   - Recomendaciones automáticas

## 📋 Checklist de Migración

- [x] ✅ Crear tablas `origenes` y `aplicaciones`
- [x] ✅ Actualizar tabla `cases` con foreign keys
- [x] ✅ Configurar RLS y políticas de seguridad
- [x] ✅ Crear índices para optimización
- [x] ✅ Insertar datos iniciales
- [x] ✅ Actualizar tipos TypeScript
- [x] ✅ Crear hooks para origenes/aplicaciones
- [x] ✅ Actualizar formularios (CaseForm)
- [x] ✅ Actualizar validaciones Zod
- [x] ✅ Actualizar exports (Excel/CSV)
- [x] ✅ Actualizar consultas de casos
- [x] ✅ Configurar triggers para updated_at
- [x] ✅ Renombrar "destinos" a "aplicaciones"
- [x] ✅ Actualizar todas las referencias en el código
- [x] ✅ Pruebas de integración

¡La migración está completa! El sistema ahora soporta los campos de Origen y Aplicación de manera totalmente normalizada y escalable.
