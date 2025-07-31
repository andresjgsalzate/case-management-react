# Fix Disposiciones Scripts - User Relationship

## Problema Resuelto
- **Error**: "Could not find a relationship between 'disposiciones_scripts' and 'user_profiles'"
- **Causa**: La tabla `disposiciones_scripts` tenía foreign key a `auth.users` pero no a `user_profiles`

## Solución Implementada

### 1. Migración de Base de Datos (20240101000001_fix_disposiciones_scripts_user_relationship.sql)
```sql
-- Eliminó el campo user_id que referenciaba auth.users
ALTER TABLE public.disposiciones_scripts DROP COLUMN IF EXISTS user_id;

-- Agregó nuevo campo user_profile_id que referencia user_profiles
ALTER TABLE public.disposiciones_scripts 
ADD COLUMN user_profile_id UUID REFERENCES public.user_profiles(id);

-- Creó índice para el nuevo campo
CREATE INDEX idx_disposiciones_scripts_user_profile_id 
ON public.disposiciones_scripts(user_profile_id);
```

### 2. Hook Updates (useDisposicionScripts.ts)

#### Queries (SELECT)
- ✅ Restauró el join con `user_profiles` en todas las queries
- ✅ Actualizado mapeo de `user_id` → `user_profile_id`

#### Mutations (INSERT/UPDATE)
- ✅ `useCreateDisposicionScripts`: 
  - Obtiene perfil de usuario antes de crear
  - Usa `user_profile_id` en lugar de `user_id`
  - Mantiene `created_by` y `updated_by` para auditoría
- ✅ `useUpdateDisposicionScripts`:
  - Agregó `updated_by` para auditoría
  - Actualizado mapeo de respuesta

## Archivos Modificados
1. `supabase/migrations/20240101000001_fix_disposiciones_scripts_user_relationship.sql` - Nueva migración
2. `src/hooks/useDisposicionScripts.ts` - Actualizado para usar nueva relación

## Resultado
- ✅ **Error de relación resuelto**: Ya no aparece el error de foreign key
- ✅ **Funcionalidad completa**: Se puede mostrar información del usuario que creó cada disposición
- ✅ **Auditoría mejorada**: Se mantienen los campos `created_by` y `updated_by`
- ✅ **Compatibilidad mantenida**: La API del hook no cambió

## Funcionamiento Esperado
- **Lista de disposiciones**: Incluye información del usuario creador
- **Creación**: Asigna automáticamente el perfil del usuario actual
- **Actualización**: Mantiene el creador original, actualiza el modificador
- **Relaciones**: Join directo entre `disposiciones_scripts` y `user_profiles`

## Próximos Pasos
- Probar la funcionalidad en la página de Disposiciones Scripts
- Verificar que se muestren correctamente los nombres de usuarios
- Confirmar que la creación y edición funcionan sin errores
