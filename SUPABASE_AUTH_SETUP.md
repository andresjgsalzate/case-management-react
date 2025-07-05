# 🔐 Configuración de Supabase Auth - Guía Paso a Paso

Este documento te guía para configurar correctamente Supabase Auth en tu proyecto.

## 🎯 Configuraciones Necesarias

### 1. Configuración Básica en Supabase Dashboard

#### Ve a tu proyecto de Supabase:
```
https://app.supabase.com/project/vpazyvtcypmgtlrnycnl
```

#### Configuración de Authentication → Settings:

**📧 Email Settings:**
- **Site URL**: `http://localhost:5173` (desarrollo)
- **Redirect URLs**: 
  ```
  http://localhost:5173/**
  https://tu-dominio-produccion.com/**
  ```

**🔑 Email Confirmations:**
- Para **desarrollo**: ❌ Desactivar "Enable email confirmations"
- Para **producción**: ✅ Activar "Enable email confirmations"

**⚙️ Session Settings:**
- JWT expiry: `3600` segundos (1 hora) - valor por defecto
- Refresh token expiry: `604800` segundos (7 días) - valor por defecto

### 2. Variables de Entorno

Asegúrate de que tu archivo `.env` esté configurado:

```env
VITE_SUPABASE_URL=https://vpazyvtcypmgtlrnycnl.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwYXp5dnRjeXBtZ3Rscm55Y25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTk2OTEsImV4cCI6MjA2NzI5NTY5MX0.ZIDH4rCqrM3XH37iUkHvxy2_vRdn1MQTmzKrxEFX4Wk
```

### 3. Configuración RLS (Row Level Security)

Las migraciones ya incluyen RLS configurado. Si necesitas verificar:

```sql
-- Verificar que RLS esté habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('cases', 'origenes', 'aplicaciones');
```

## 🧪 Diagnóstico y Testing

### 1. Ejecutar el Diagnóstico

1. Inicia la aplicación: `npm run dev`
2. Ve a la página de diagnóstico: `/auth-test`
3. Haz clic en "🔍 Ejecutar Diagnóstico"
4. Haz clic en "🧪 Probar Auth Flow"

### 2. Interpretación de Resultados

**✅ Todo correcto:**
- Conexión a Supabase: ✅
- Auth habilitado: ✅
- Registro: ✅
- Inicio de sesión: ✅
- Cerrar sesión: ✅

**⚠️ Problemas comunes:**

1. **"Email not confirmed"**
   - **Solución**: Desactiva email confirmations en Supabase Dashboard
   - **Ubicación**: Authentication → Settings → "Enable email confirmations"

2. **"Invalid login credentials"**
   - **Posible causa**: Usuario no existe o contraseña incorrecta
   - **Solución**: Verificar que el registro se completó correctamente

3. **"Signup is disabled"**
   - **Solución**: Activar signup en Authentication → Settings

## 🚀 Pasos para Cambiar a Modo Producción

### 1. Actualizar Variables de Entorno
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

### 2. Actualizar Hooks de Auth
Cambiar importaciones en los componentes:

**Archivo:** `src/App.tsx`
```tsx
// Cambiar esta línea:
import { ProtectedRoute } from '@/components/ProtectedRoute.debug';

// Por esta:
import { ProtectedRoute } from '@/components/ProtectedRoute';
```

**Archivo:** `src/components/Layout.tsx`
```tsx
// Cambiar esta línea:
import { useAuth } from '@/hooks/useAuth.debug';

// Por esta:
import { useAuth } from '@/hooks/useAuth';
```

### 3. Actualizar useAuth Principal
**Archivo:** `src/hooks/useAuth.ts`
```tsx
// Cambiar la exportación al final del archivo:
// export { useAuth } from './useAuth.debug';

// Por:
export { useAuth } from './useAuth.real';
```

### 4. Configurar Email Confirmations
En Supabase Dashboard:
- ✅ Activar "Enable email confirmations"
- Configurar templates de email personalizados
- Configurar Site URL de producción

### 5. Configurar Dominios de Producción
- **Site URL**: `https://tu-dominio.com`
- **Redirect URLs**: `https://tu-dominio.com/**`

## 🔧 Troubleshooting

### Problema: La aplicación no inicia
**Solución**: Verifica las variables de entorno en `.env`

### Problema: No se puede registrar usuario
**Verificar**:
1. ¿Está habilitado el signup?
2. ¿Las credenciales cumplen los requisitos?
3. ¿Hay limitaciones de rate limiting?

### Problema: Usuario no puede hacer login después del registro
**Solución**: Desactiva email confirmations para desarrollo

### Problema: Errores de CORS
**Solución**: Verificar que las URLs estén configuradas correctamente en Supabase

## 📋 Checklist de Configuración

### Desarrollo ✅
- [ ] Variables de entorno configuradas
- [ ] Email confirmations desactivadas
- [ ] Site URL: `http://localhost:5173`
- [ ] Redirect URLs configuradas
- [ ] Diagnóstico pasa todos los tests
- [ ] Usando hooks debug (`useAuth.debug`)

### Producción ✅
- [ ] Variables de entorno de producción
- [ ] Email confirmations activadas
- [ ] Site URL de producción configurada
- [ ] Templates de email personalizados
- [ ] Hooks reales (`useAuth.real`)
- [ ] RLS configurado correctamente
- [ ] SSL/HTTPS configurado

## 🆘 Soporte

Si tienes problemas:

1. **Revisa los logs** en la consola del navegador
2. **Ejecuta el diagnóstico** en `/auth-test`
3. **Verifica la configuración** en Supabase Dashboard
4. **Consulta la documentación** de Supabase Auth

---
**Última actualización**: Enero 2025
