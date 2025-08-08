# Configuración de Variables de Entorno para Email

## 🔧 Variables de Entorno Requeridas

Crea un archivo `.env.local` en la raíz de tu proyecto con las siguientes variables:

```env
# Configuración de Supabase
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase

# URLs de la aplicación (se configuran automáticamente según el entorno)
# En desarrollo: http://localhost:5173
# En producción: https://case-management-ctl.netlify.app
```

## 🌐 Configuración de URLs por Entorno

El sistema detecta automáticamente el entorno y configura las URLs correspondientes:

### Desarrollo (localhost)
- **Base URL**: `http://localhost:5173`
- **Callback URL**: `http://localhost:5173/auth/callback`
- **Reset Password URL**: `http://localhost:5173/reset-password`

### Producción (Netlify)
- **Base URL**: `https://case-management-ctl.netlify.app`
- **Callback URL**: `https://case-management-ctl.netlify.app/auth/callback`
- **Reset Password URL**: `https://case-management-ctl.netlify.app/reset-password`

## 📧 Configuración SMTP en Supabase

En tu proyecto de Supabase, ve a **Authentication > Settings > Email Settings** y configura:

### Custom SMTP
- **Enable Custom SMTP**: ✅ Activado
- **Sender Details**:
  - **Sender email**: `case-management@andrejgalzate.com`
  - **Sender name**: `Case Management`

### SMTP Provider Settings
- **Host**: `smtp.hostinger.com`
- **Port number**: `465`
- **Minimum interval between emails**: `60` segundos
- **Username**: `case-management@andrejgalzate.com`
- **Password**: `[tu_contraseña_de_email]` (configurada en Supabase)

## 🔗 URLs de Redirección en Supabase

En **Authentication > URL Configuration**, configura:

### Site URL
```
https://case-management-ctl.netlify.app
```

### Redirect URLs
```
https://case-management-ctl.netlify.app/auth/callback
https://case-management-ctl.netlify.app/reset-password
http://localhost:5173/auth/callback
http://localhost:5173/reset-password
```

## 🛠️ Configuración en Netlify

### Variables de Entorno en Netlify

Ve a tu dashboard de Netlify > Site Settings > Environment Variables y agrega:

```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### Build Settings
Asegúrate de que el comando de build sea:
```
npm run build
```

Y el directorio de publicación sea:
```
dist
```

## 🔒 Seguridad

### Rate Limiting
El sistema incluye limitaciones de envío configuradas en `SMTP_CONFIG`:
- **Confirmación de email**: 5 máximo por hora
- **Magic Links**: 3 máximo por hora  
- **Reset de contraseña**: 3 máximo por hora
- **Invitaciones**: 10 máximo por hora (para admins)

### Validaciones
- Validación de formato de email
- Verificación de dominios existentes
- Tokens con expiración automática
- URLs de callback seguras (solo HTTPS en producción)

## 🧪 Testing

### Desarrollo Local
1. Usa emails válidos para testing
2. Revisa la consola del navegador para logs de debugging
3. Los emails se envían usando el SMTP configurado

### Producción
1. Verifica que las URLs de callback estén correctas
2. Revisa los logs de Supabase Dashboard
3. Confirma que los emails lleguen correctamente

## 📞 Troubleshooting

### Error: "Invalid redirect URL"
- Verifica que las URLs estén configuradas en Supabase
- Asegúrate de usar HTTPS en producción

### Error: "SMTP authentication failed"
- Verifica las credenciales SMTP en Supabase
- Confirma que el servidor SMTP esté disponible

### Emails no llegan
- Revisa la carpeta de spam
- Verifica la configuración SMTP
- Confirma los logs en Supabase Dashboard

### URLs incorrectas en desarrollo
- Asegúrate de estar ejecutando en `localhost:5173`
- Verifica que `import.meta.env.PROD` funcione correctamente
