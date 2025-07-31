# Renombrado de Módulo: DisposicionAlpopular → DisposicionScripts

## Resumen de Cambios

Se ha realizado un renombrado completo del módulo de "Disposición Alpopular" a "Disposición de Scripts", eliminando todas las referencias a "Alpopular" en el código y la documentación.

## Archivos Renombrados

### Hooks
- `src/hooks/useDisposicionAlpopular.ts` → `src/hooks/useDisposicionScripts.ts`
- `src/hooks/useDisposicionPermissions.ts` → `src/hooks/useDisposicionScriptsPermissions.ts`

### Componentes
- `src/components/DisposicionAlpopularForm.tsx` → `src/components/DisposicionScriptsForm.tsx`
- `src/components/DisposicionMensualCard.tsx` → `src/components/DisposicionScriptsMensualCard.tsx`

### Páginas
- `src/pages/DisposicionAlpopularPage.tsx` → `src/pages/DisposicionScriptsPage.tsx`

### Utilidades
- `src/utils/disposicionExportUtils.ts` → `src/utils/disposicionScriptsExportUtils.ts`

### Base de Datos
- `supabase/migrations/20240101000000_create_disposiciones_alpopular.sql` → `supabase/migrations/20240101000000_create_disposiciones_scripts.sql`

### Documentación
- `docs/DISPOSICIONES_ALPOPULAR.md` → `docs/DISPOSICIONES_SCRIPTS.md`

## Cambios en Tipos (src/types/index.ts)

### Antes:
```typescript
export interface DisposicionAlpopular {
  // ... propiedades
}

export interface DisposicionAlpopularFormData {
  // ... propiedades
}
```

### Después:
```typescript
export interface DisposicionScripts {
  // ... propiedades
}

export interface DisposicionScriptsFormData {
  // ... propiedades
}
```

## Cambios en Validaciones (src/lib/validations.ts)

### Antes:
```typescript
export const disposicionAlpopularSchema = z.object({
  // ... validaciones
});

export type DisposicionAlpopularSchema = z.infer<typeof disposicionAlpopularSchema>;
```

### Después:
```typescript
export const disposicionScriptsSchema = z.object({
  // ... validaciones
});

export type DisposicionScriptsSchema = z.infer<typeof disposicionScriptsSchema>;
```

## Funciones Renombradas

### Hooks (useDisposicionScripts.ts):
- `useDisposicionesAlpopular` → `useDisposicionesScripts`
- `useDisposicionesPorMes` → `useDisposicionScriptsPorMes`
- `useCreateDisposicionAlpopular` → `useCreateDisposicionScripts`
- `useUpdateDisposicionAlpopular` → `useUpdateDisposicionScripts`
- `useDeleteDisposicionAlpopular` → `useDeleteDisposicionScripts`

### Permisos (useDisposicionScriptsPermissions.ts):
- `useDisposicionPermissions` → `useDisposicionScriptsPermissions`

### Componentes:
- `DisposicionAlpopularForm` → `DisposicionScriptsForm`
- `DisposicionMensualCard` → `DisposicionScriptsMensualCard`

### Página:
- `DisposicionAlpopularPage` → `DisposicionScriptsPage`

### Utilidades (disposicionScriptsExportUtils.ts):
- `exportDisposicionesPorMes` → `exportDisposicionScriptsPorMes`
- `exportAllDisposiciones` → `exportAllDisposicionScripts`

## Cambios en Base de Datos

### Tabla:
- `disposiciones_alpopular` → `disposiciones_scripts`

### Permisos:
- Recurso: `disposiciones_alpopular` → `disposiciones_scripts`

### Comentarios y Descripciones:
- Todas las referencias a "Alpopular" se cambiaron por "Scripts"

## Cambios en Navegación

### Layout.tsx:
- Nombre del menú: "Disposiciones" (sin referencia a Alpopular)
- Ícono: `DocumentArrowUpIcon`
- URL: `/disposiciones`

### App.tsx:
- Ruta: `/disposiciones` → `<DisposicionScriptsPage />`
- Comentario: "Disposicion Scripts Module"

## Cambios en Textos de Usuario

### Títulos y Etiquetas:
- "Disposiciones Alpopular" → "Disposiciones de Scripts"
- "Solicitud de Disposición Alpopular" → "Solicitud de Disposición de Scripts"
- "disposición alpopular" → "disposición de scripts"
- "módulo de Disposiciones Alpopular" → "módulo de Disposiciones de Scripts"

### Mensajes y Descripciones:
- "Gestión de solicitudes de disposición para scripts en aplicaciones alpopular" → "Gestión de solicitudes de disposición para scripts en aplicaciones"
- "solicitudes de disposición de scripts en aplicaciones alpopular" → "solicitudes de disposición de scripts en aplicaciones"

## Archivos de Exportación CSV

### Nombres de archivos:
- `Disposiciones_Alpopular_` → `Disposiciones_Scripts_`
- `disposiciones-alpopular-` → `disposiciones-scripts-`

## Estado del Módulo

✅ **Completado**: Todos los archivos han sido renombrados y actualizados
✅ **Compilación**: No hay errores de TypeScript
✅ **Consistencia**: Todas las referencias internas han sido actualizadas
✅ **Navegación**: El módulo aparece correctamente en el menú como "Disposiciones"
✅ **Base de Datos**: La migración ha sido actualizada con los nuevos nombres

## Próximos Pasos

1. **Ejecutar la migración actualizada**:
   ```sql
   \i supabase/migrations/20240101000000_create_disposiciones_scripts.sql
   ```

2. **Verificar que el módulo funcione correctamente** navegando a `/disposiciones`

3. **Actualizar cualquier documentación adicional** que pueda hacer referencia al nombre anterior

4. **Informar a los usuarios** sobre el cambio de nombre si es necesario

## Notas Importantes

- **URLs**: La URL del módulo sigue siendo `/disposiciones` para mantener la compatibilidad
- **Permisos**: Los permisos se actualizaron en la base de datos pero manteniendo la misma estructura
- **Funcionalidad**: Toda la funcionalidad permanece exactamente igual, solo cambió la nomenclatura
- **Migración**: Es necesario ejecutar la nueva migración en la base de datos
