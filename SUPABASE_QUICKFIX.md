# 🚀 Guía Rápida de Configuración de Supabase

## ⚠️ Problema Actual
La aplicación se está quedando cargando porque Supabase no está configurado correctamente. Esta guía te ayudará a solucionarlo.

## 📋 Pasos para Solucionar

### 1. Verificar el Proyecto de Supabase

1. **Ir a Supabase Dashboard**
   - Ve a [https://app.supabase.com](https://app.supabase.com)
   - Inicia sesión con tu cuenta

2. **Verificar que el proyecto existe**
   - El proyecto debe estar en: `https://vpazyvtcypmgtlrnycnl.supabase.co`
   - Si no existe, puedes crear uno nuevo

### 2. Crear las Tablas en Supabase

**Opción A: Via SQL Editor (Recomendado)**

1. Ve al **SQL Editor** en Supabase
2. Copia y pega el contenido de `supabase/migrations/001_initial.sql`
3. Ejecuta el script

**Opción B: Crear manualmente**

1. Ve a **Table Editor**
2. Crea las tablas: `origenes`, `aplicaciones`, `cases`

### 3. Verificar Autenticación

1. Ve a **Authentication** > **Settings**
2. Verifica que esté habilitado:
   - ✅ Email Auth
   - ✅ Allow new users to sign up

### 4. Configurar Row Level Security

1. Ve a **Authentication** > **Policies**
2. Verifica que existan políticas para las tablas

## 🛠️ Solución Rápida (Temporal)

Si quieres usar la aplicación **SIN** Supabase (solo para testing):

1. **Mantén el modo debug actual**
   - La aplicación ya está configurada para funcionar con datos simulados
   - Puedes probar todas las funcionalidades

2. **Desactivar el modo debug**
   - Una vez que configures Supabase correctamente
   - Cambia las importaciones de vuelta a los hooks originales

## 📝 Script SQL Completo

Si no tienes el archivo `supabase/migrations/001_initial.sql`, aquí está el script básico:

```sql
-- Habilitar Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Crear tabla origenes
CREATE TABLE IF NOT EXISTS origenes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla aplicaciones
CREATE TABLE IF NOT EXISTS aplicaciones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Crear tabla cases
CREATE TABLE IF NOT EXISTS cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  numero_caso TEXT NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  fecha DATE NOT NULL,
  clasificacion TEXT NOT NULL,
  puntuacion INTEGER NOT NULL,
  origen_id UUID REFERENCES origenes(id),
  aplicacion_id UUID REFERENCES aplicaciones(id),
  historial_caso INTEGER NOT NULL,
  conocimiento_modulo INTEGER NOT NULL,
  manipulacion_datos INTEGER NOT NULL,
  claridad_descripcion INTEGER NOT NULL,
  causa_fallo INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE origenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE aplicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can read all origenes" ON origenes FOR SELECT USING (true);
CREATE POLICY "Users can read all aplicaciones" ON aplicaciones FOR SELECT USING (true);
CREATE POLICY "Users can manage their own cases" ON cases FOR ALL USING (auth.uid() = user_id);

-- Datos iniciales
INSERT INTO origenes (nombre) VALUES 
  ('Sistema Principal'),
  ('Base de Datos'),
  ('API Externa'),
  ('Interfaz Web'),
  ('Servicio Externo')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO aplicaciones (nombre) VALUES 
  ('Facturación'),
  ('Inventario'),
  ('Reportes'),
  ('Contabilidad'),
  ('CRM')
ON CONFLICT (nombre) DO NOTHING;
```

## ✅ Verificación

Una vez configurado, ve a `/test` en la aplicación y:

1. Haz clic en "🔍 Ejecutar Diagnóstico de Supabase"
2. Verifica que todas las comprobaciones aparezcan en ✅
3. Si hay errores, revisa la consola del navegador

## 🔄 Volver al Modo Normal

Cuando Supabase esté funcionando:

1. Cambia las importaciones en los archivos:
   - `ProtectedRoute` → usa `@/components/ProtectedRoute`
   - `useAuth` → usa `@/hooks/useAuth`
   - `useCases` → usa `@/hooks/useCases`
   - etc.

2. Reinicia el servidor de desarrollo

---

**💡 Tip**: Si tienes problemas, puedes trabajar en modo debug hasta tener tiempo de configurar Supabase correctamente.
