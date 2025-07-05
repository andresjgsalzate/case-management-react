# 🔧 Solución: Formulario de Casos No Carga Orígenes y Aplicaciones

## 🔍 Problema Identificado

El formulario de nuevos casos no estaba cargando los datos de origen y aplicación porque:

1. **Hooks incorrectos**: Estaba usando hooks de debug (`@/hooks/debug`) en lugar de hooks reales
2. **Datos faltantes**: Posiblemente las tablas de origen y aplicación están vacías

## ✅ Cambios Realizados

### 1. Actualización de Hooks
Se cambiaron las importaciones en estos archivos:

**`src/pages/NewCase.tsx`**:
```typescript
// Antes (debug)
import { useCreateCase, useUpdateCase, useCase } from '@/hooks/debug';

// Ahora (real)
import { useCreateCase, useUpdateCase, useCase } from '@/hooks/useCases';
```

**`src/components/CaseForm.tsx`**:
```typescript
// Antes (debug)
import { useOrigenes, useAplicaciones } from '@/hooks/debug';

// Ahora (real)  
import { useOrigenes, useAplicaciones } from '@/hooks/useOrigenesAplicaciones';
```

**`src/pages/Cases.tsx`**:
```typescript
// Antes (debug)
import { useCases, useDeleteCase } from '@/hooks/debug';
import { useOrigenes, useAplicaciones } from '@/hooks/debug';

// Ahora (real)
import { useCases, useDeleteCase } from '@/hooks/useCases';
import { useOrigenes, useAplicaciones } from '@/hooks/useOrigenesAplicaciones';
```

### 2. Nueva Página de Diagnóstico
- **Ruta**: `/data-test`
- **Función**: Verificar carga de orígenes y aplicaciones
- **Acceso**: Desde el menú de desarrollo

### 3. Script SQL para Datos Iniciales
Se creó `supabase/migrations/002_seed_data.sql` con datos de ejemplo.

## 🧪 Cómo Verificar la Solución

### Paso 1: Ir a la Página de Diagnóstico
1. Ve a tu aplicación: `http://localhost:5173`
2. Navega a `/data-test` o usa el enlace "Test Datos" en el menú
3. Verifica el estado de carga de orígenes y aplicaciones

### Paso 2: Si las Tablas Están Vacías
Ejecuta el script SQL en Supabase Dashboard:

1. Ve a tu proyecto de Supabase
2. Ve a "SQL Editor"
3. Ejecuta el contenido de `supabase/migrations/002_seed_data.sql`

**O inserta datos manualmente:**
```sql
-- Insertar orígenes
INSERT INTO public.origenes (nombre, descripcion, activo) VALUES
('Mesa de Ayuda', 'Casos de soporte técnico', true),
('Email Soporte', 'Casos recibidos por email', true),
('Portal Web', 'Casos del portal web', true);

-- Insertar aplicaciones
INSERT INTO public.aplicaciones (nombre, descripcion, activo) VALUES
('CRM Principal', 'Sistema de gestión de clientes', true),
('ERP Financiero', 'Sistema financiero', true),
('Portal Cliente', 'Portal de autoservicio', true);
```

### Paso 3: Verificar el Formulario
1. Ve a "Nuevo Caso" (`/cases/new`)
2. Verifica que los dropdowns de "Origen" y "Aplicación" se llenen con datos
3. Los datos deben cargarse automáticamente desde la base de datos

## 🔧 Posibles Problemas y Soluciones

### Problema: "No hay datos en los dropdowns"
**Solución**: 
- Ve a `/data-test` para diagnosticar
- Ejecuta el script SQL para insertar datos
- Verifica permisos RLS en las tablas

### Problema: "Error de conexión"
**Solución**:
- Verifica variables de entorno
- Confirma que el usuario está autenticado
- Revisa la consola para errores específicos

### Problema: "Loading infinito"
**Solución**:
- Verifica la configuración RLS
- Confirma que las tablas existen
- Revisa logs de Supabase

## 📊 Verificación de RLS (Row Level Security)

Si sigues teniendo problemas, verifica las políticas RLS:

```sql
-- Verificar políticas existentes
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('origenes', 'aplicaciones');

-- Si no hay políticas, crear políticas básicas
CREATE POLICY "Usuarios autenticados pueden leer origenes" ON public.origenes
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Usuarios autenticados pueden leer aplicaciones" ON public.aplicaciones  
FOR SELECT TO authenticated USING (true);
```

## ✅ Estado Esperado

Después de aplicar estas correcciones:

1. ✅ Los hooks reales se conectan a Supabase
2. ✅ Los dropdowns se llenan con datos reales
3. ✅ El formulario funciona completamente
4. ✅ Los casos se guardan en la base de datos
5. ✅ La página de diagnóstico muestra el estado

## 🆘 Si Aún No Funciona

1. **Revisa la consola del navegador** para errores específicos
2. **Ve a `/data-test`** para ver el diagnóstico detallado  
3. **Ejecuta el script SQL** si las tablas están vacías
4. **Verifica autenticación** - debes estar logueado
5. **Comprueba RLS** - las políticas deben permitir lectura

---
**Próximo paso**: Ve a `/data-test` para verificar el estado actual de tus datos.
