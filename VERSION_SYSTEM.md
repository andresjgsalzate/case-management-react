# Sistema de Versiones - Case Management React

Este proyecto utiliza un sistema de versiones **Semantic Versioning (SemVer)** con formato `MAJOR.MINOR.PATCH`:

## Estructura de Versiones

- **MAJOR** (`X.0.0`): Cambios incompatibles que rompen la API existente
- **MINOR** (`0.X.0`): Nuevas funcionalidades compatibles hacia atrás
- **PATCH** (`0.0.X`): Correcciones de errores compatibles hacia atrás

## Tipos de Cambios

### 🆕 Feature (Nueva funcionalidad)
- Incrementa la versión **MINOR**
- Ejemplo: Nuevo módulo, nueva página, nueva funcionalidad

### 🔧 Improvement (Mejora)
- Incrementa la versión **PATCH**
- Ejemplo: Mejor UX, optimizaciones de rendimiento

### 🐛 Bugfix (Corrección de errores)
- Incrementa la versión **PATCH**
- Ejemplo: Arreglos de bugs, correcciones de funcionalidad

### ⚠️ Breaking (Cambio importante)
- Incrementa la versión **MAJOR**
- Ejemplo: Cambios en la API, refactorización mayor

## Archivos del Sistema de Versiones

```
src/
├── data/
│   └── changelog.ts         # Historial de versiones y cambios
├── components/
│   ├── VersionDisplay.tsx   # Componente que muestra la versión actual
│   └── VersionModal.tsx     # Modal con historial completo
└── utils/
    └── versionUtils.ts      # Utilidades para manejo de versiones
```

## Cómo Agregar una Nueva Versión

1. **Determinar el tipo de versión** basado en los cambios realizados
2. **Actualizar `package.json`** con la nueva versión
3. **Agregar entrada en `changelog.ts`** con los cambios realizados
4. **Verificar que todo funciona** ejecutando el proyecto

### Ejemplo de nueva entrada en changelog.ts:

```typescript
{
  version: "1.3.0",
  date: "2025-07-06",
  changes: [
    {
      type: "feature",
      description: "Nueva funcionalidad de reportes avanzados"
    },
    {
      type: "improvement", 
      description: "Mejor rendimiento en la carga de datos"
    },
    {
      type: "bugfix",
      description: "Corrección en la validación de formularios"
    }
  ]
}
```

## Visualización para el Usuario

- **Indicador de versión**: Aparece en la parte inferior del sidebar
- **Modal informativo**: Click en la versión para ver el historial completo
- **Filtros**: Posibilidad de filtrar cambios por tipo
- **Estadísticas**: Resumen de versiones y cambios

## Herramientas Disponibles

### Utilidades en `versionUtils.ts`:
- `incrementVersion()`: Incrementa automáticamente la versión
- `getVersionTypeFromChanges()`: Determina el tipo basado en cambios
- `createVersionEntry()`: Genera nueva entrada de changelog
- `getVersionStats()`: Calcula estadísticas del proyecto

### Comandos útiles:
```bash
# Ver versión actual
npm version

# Actualizar versión manualmente
npm version patch|minor|major
```

## Mejores Prácticas

1. **Mantener consistencia** en el formato de fechas (YYYY-MM-DD)
2. **Describir cambios claramente** para que los usuarios entiendan el valor
3. **Categorizar correctamente** cada cambio según su impacto
4. **Revisar regularmente** el historial para mantener calidad
5. **Actualizar ambos archivos** (package.json y changelog.ts) en sincronía

## Historial de Implementación

- **v1.2.3** (2025-07-05): Sistema de versiones implementado
- Componentes creados: VersionDisplay, VersionModal
- Utilidades para manejo automático de versiones
- Modal interactivo con filtros y estadísticas
