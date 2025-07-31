# Instrucciones para Ejecutar la Migración Corregida

## Cambios Realizados en la Migración

✅ **Error Corregido**: Agregado el campo obligatorio `name` en los permisos
✅ **Tipo Corregido**: `numero_revision_svn` cambiado de INTEGER a TEXT (opcional)
✅ **Campo Agregado**: `user_id` para rastrear el usuario que crea la disposición
✅ **Comentario Corregido**: Eliminada duplicación en comentarios

## Cómo Ejecutar la Migración

### Opción 1: Usando psql (Línea de comandos)
```bash
psql -h [host] -U [usuario] -d [database] -f "supabase/migrations/20240101000000_create_disposiciones_scripts.sql"
```

### Opción 2: Usando Supabase CLI
```bash
supabase db push
```

### Opción 3: Desde el Dashboard de Supabase
1. Ve a tu proyecto en https://supabase.com/dashboard
2. Ir a "SQL Editor"
3. Copiar y pegar el contenido del archivo de migración
4. Ejecutar

## Verificación Post-Migración

Después de ejecutar la migración, verifica que se creó correctamente:

```sql
-- Verificar que la tabla existe
\d disposiciones_scripts

-- Verificar los permisos
SELECT name, resource, action, description 
FROM permissions 
WHERE resource = 'disposiciones_scripts';

-- Verificar las políticas RLS
\dp disposiciones_scripts
```

## Estructura de la Tabla Creada

```sql
CREATE TABLE public.disposiciones_scripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha DATE NOT NULL,
    case_id UUID NOT NULL REFERENCES cases(id),
    nombre_script TEXT NOT NULL,
    numero_revision_svn TEXT,                    -- ✅ Opcional, tipo TEXT
    aplicacion_id UUID NOT NULL REFERENCES aplicaciones(id),
    observaciones TEXT,
    user_id UUID REFERENCES auth.users(id),     -- ✅ Nuevo campo agregado
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_by UUID REFERENCES auth.users(id)
);
```

## Permisos Creados

- `disposiciones_scripts:create` - Crear disposiciones
- `disposiciones_scripts:read` - Ver disposiciones  
- `disposiciones_scripts:update` - Actualizar disposiciones
- `disposiciones_scripts:delete` - Eliminar disposiciones
- `disposiciones_scripts:export` - Exportar disposiciones

## Roles y Permisos Asignados

- **Admin**: Todos los permisos (CRUD + export)
- **User**: Solo lectura y creación

## Próximo Paso

Una vez ejecutada la migración exitosamente, el módulo estará disponible en:
- URL: `http://localhost:3000/disposiciones`
- Menú: "Disposiciones" en la navegación lateral

¡La migración está lista para ejecutarse sin errores!
