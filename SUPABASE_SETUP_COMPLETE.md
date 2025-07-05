# 🚀 Guía de Configuración Completa de Supabase

## 1. Configuración del Proyecto Supabase

### 1.1 Crear Proyecto
1. Ve a [Supabase](https://supabase.com/dashboard)
2. Crea un nuevo proyecto
3. Anota la URL y la clave anónima

### 1.2 Configurar Autenticación
1. Ve a Authentication > Settings
2. Configurar lo siguiente:

#### Email Settings:
- **Site URL**: `http://localhost:5173` (desarrollo) / `https://tu-dominio.com` (producción)
- **Redirect URLs**: 
  ```
  http://localhost:5173/**
  https://tu-dominio.com/**
  ```

#### Email Templates (opcional):
- Personaliza los templates de confirmación, recuperación, etc.

#### Auth Providers:
- **Email**: Habilitado ✅
- **Confirm email**: Habilitado ✅ (recomendado)
- **Enable email confirmations**: true

### 1.3 Ejecutar Migraciones SQL

Ejecuta este SQL en el Editor SQL de Supabase:

```sql
-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear tabla de orígenes
CREATE TABLE IF NOT EXISTS public.origenes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de aplicaciones
CREATE TABLE IF NOT EXISTS public.aplicaciones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de casos
CREATE TABLE IF NOT EXISTS public.cases (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  numero_caso VARCHAR(255) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  fecha DATE NOT NULL,
  origen_id UUID REFERENCES public.origenes(id) ON DELETE SET NULL,
  aplicacion_id UUID REFERENCES public.aplicaciones(id) ON DELETE SET NULL,
  historial_caso INTEGER NOT NULL CHECK (historial_caso BETWEEN 1 AND 3),
  conocimiento_modulo INTEGER NOT NULL CHECK (conocimiento_modulo BETWEEN 1 AND 3),
  manipulacion_datos INTEGER NOT NULL CHECK (manipulacion_datos BETWEEN 1 AND 3),
  claridad_descripcion INTEGER NOT NULL CHECK (claridad_descripcion BETWEEN 1 AND 3),
  causa_fallo INTEGER NOT NULL CHECK (causa_fallo BETWEEN 1 AND 3),
  puntuacion INTEGER GENERATED ALWAYS AS (
    historial_caso + conocimiento_modulo + manipulacion_datos + 
    claridad_descripcion + causa_fallo
  ) STORED,
  clasificacion TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN (historial_caso + conocimiento_modulo + manipulacion_datos + 
            claridad_descripcion + causa_fallo) BETWEEN 5 AND 8 THEN 'Baja Complejidad'
      WHEN (historial_caso + conocimiento_modulo + manipulacion_datos + 
            claridad_descripcion + causa_fallo) BETWEEN 9 AND 12 THEN 'Media Complejidad'
      ELSE 'Alta Complejidad'
    END
  ) STORED,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para performance
CREATE INDEX IF NOT EXISTS idx_cases_user_id ON public.cases(user_id);
CREATE INDEX IF NOT EXISTS idx_cases_fecha ON public.cases(fecha);
CREATE INDEX IF NOT EXISTS idx_cases_clasificacion ON public.cases(clasificacion);
CREATE INDEX IF NOT EXISTS idx_cases_origen_id ON public.cases(origen_id);
CREATE INDEX IF NOT EXISTS idx_cases_aplicacion_id ON public.cases(aplicacion_id);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_origenes_updated_at 
  BEFORE UPDATE ON public.origenes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_aplicaciones_updated_at 
  BEFORE UPDATE ON public.aplicaciones 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at 
  BEFORE UPDATE ON public.cases 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.origenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aplicaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para origenes (acceso público de lectura)
CREATE POLICY "Todos pueden ver orígenes" ON public.origenes
  FOR SELECT USING (true);

CREATE POLICY "Usuarios autenticados pueden crear orígenes" ON public.origenes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar orígenes" ON public.origenes
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas RLS para aplicaciones (acceso público de lectura)
CREATE POLICY "Todos pueden ver aplicaciones" ON public.aplicaciones
  FOR SELECT USING (true);

CREATE POLICY "Usuarios autenticados pueden crear aplicaciones" ON public.aplicaciones
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuarios autenticados pueden actualizar aplicaciones" ON public.aplicaciones
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Políticas RLS para cases (acceso por usuario)
CREATE POLICY "Los usuarios solo ven sus casos" ON public.cases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios solo pueden crear sus casos" ON public.cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios solo pueden actualizar sus casos" ON public.cases
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Los usuarios solo pueden eliminar sus casos" ON public.cases
  FOR DELETE USING (auth.uid() = user_id);

-- Insertar datos de ejemplo para orígenes
INSERT INTO public.origenes (nombre, descripcion) VALUES
  ('Sistema Principal', 'Errores originados en el sistema principal'),
  ('Base de Datos', 'Problemas relacionados con la base de datos'),
  ('API Externa', 'Errores en integración con APIs externas'),
  ('Interfaz de Usuario', 'Problemas en la interfaz de usuario'),
  ('Servidor', 'Errores del servidor y infraestructura')
ON CONFLICT (nombre) DO NOTHING;

-- Insertar datos de ejemplo para aplicaciones
INSERT INTO public.aplicaciones (nombre, descripcion) VALUES
  ('Facturación', 'Módulo de facturación y cobros'),
  ('Inventario', 'Sistema de gestión de inventario'),
  ('Reportes', 'Módulo de reportes y analytics'),
  ('CRM', 'Sistema de gestión de clientes'),
  ('Recursos Humanos', 'Módulo de gestión de RRHH'),
  ('Contabilidad', 'Sistema contable y financiero')
ON CONFLICT (nombre) DO NOTHING;
```

## 2. Configurar Variables de Entorno

En tu archivo `.env`:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
```

## 3. Verificación

1. Ejecuta el SQL en Supabase
2. Verifica que las tablas se crearon en Database > Tables
3. Verifica que RLS está habilitado
4. Verifica la configuración de Auth en Authentication > Settings

## 4. Troubleshooting

Si hay errores:
1. Verifica que las extensiones estén habilitadas
2. Revisa que no haya conflictos de nombres en las tablas
3. Confirma que las políticas RLS se aplicaron correctamente
4. Verifica la configuración de URLs en Auth Settings
