# Sistema de Email - Supabase Auth

Este módulo implementa un sistema completo de autenticación por email usando Supabase Auth. Incluye todas las funcionalidades principales de email para la gestión de usuarios.

## 🚀 Funcionalidades Implementadas

### 1. **Confirmación de Registro (Confirm Signup)**
- ✅ Verificación por OTP (código de 6 dígitos)
- ✅ Verificación por enlace de email
- ✅ Reenvío de códigos/enlaces
- 📱 Modal: `EmailVerificationModal`

### 2. **Invitación de Usuarios (Invite User)**
- ✅ Invitación por email con personalización
- ✅ Campos: nombre del invitador, equipo, mensaje personalizado
- ✅ Vista previa del contenido de invitación
- 📱 Modal: `InviteUserModal`

### 3. **Enlace Mágico (Magic Link)**
- ✅ Autenticación sin contraseña
- ✅ Explicación de beneficios al usuario
- ✅ Interfaz educativa y clara
- 📱 Modal: `MagicLinkModal`

### 4. **Reseteo de Contraseña (Reset Password)**
- ✅ Solicitud de reseteo por email
- ✅ Validación de email existente
- ✅ Integración con página de reseteo existente

### 5. **Cambio de Email (Change Email)**
- ✅ Solicitud de cambio con confirmación de contraseña
- ✅ Validación de nueva dirección de email
- ✅ Medidas de seguridad implementadas
- 📱 Modal: `ChangeEmailModal`

### 6. **Re-autenticación (Reauthentication)**
- ✅ Verificación de identidad antes de acciones sensibles
- ✅ Soporte para OTP y enlaces de verificación
- ✅ Integración con flujos de seguridad

## 📁 Estructura de Archivos

```
src/shared/components/email/
├── README.md                     # Esta documentación
├── index.ts                      # Exports centralizados
├── services/
│   └── EmailService.ts           # Servicio principal de email
├── hooks/
│   └── useEmailAuth.ts           # Hook React para email auth
├── components/
│   ├── EmailVerificationModal.tsx  # Modal de verificación
│   ├── InviteUserModal.tsx         # Modal de invitación
│   ├── ChangeEmailModal.tsx        # Modal de cambio de email
│   ├── MagicLinkModal.tsx          # Modal de enlace mágico
│   └── EmailTemplateConfig.tsx     # Configuración de templates
└── pages/
    └── EmailCallbackPage.tsx       # Página de callback
```

## 🔧 Configuración

### 1. **Configuración de Supabase**
```typescript
// En tu proyecto de Supabase, configura las URLs de callback:
// Authentication > URL Configuration:
Site URL: https://tu-dominio.com
Redirect URLs: 
  - https://tu-dominio.com/auth/callback
  - http://localhost:5173/auth/callback (para desarrollo)
```

### 2. **Configuración de Templates de Email**
Los administradores pueden configurar los templates de email desde:
- **Ruta**: `/admin/email-templates` (agregar a routing si es necesario)
- **Componente**: `EmailTemplateConfig`
- **Permisos**: Solo administradores

### 3. **Variables de Entorno**
```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
```

## 🛠️ Uso del Sistema

### Hook Principal
```typescript
import { useEmailAuth } from '@/shared/components/email';

function MyComponent() {
  const {
    sendConfirmationEmail,
    sendMagicLink,
    sendPasswordReset,
    inviteUser,
    requestEmailChange,
    verifyOTP,
    verifyTokenHash
  } = useEmailAuth();

  // Usar las funciones según sea necesario
}
```

### Integración con Formularios
```typescript
// El sistema está integrado con AuthForm.tsx
// Incluye botones para:
// - Magic Link login
// - Verificación de email
// - Invitación de usuarios (admin)
```

## 🔒 Seguridad

- ✅ **Validación de Email**: Verificación de formato y dominio
- ✅ **Rate Limiting**: Implementado por Supabase
- ✅ **Tokens Seguros**: Generados y validados por Supabase
- ✅ **HTTPS Only**: URLs de callback seguras
- ✅ **Expiración**: Tokens y enlaces con tiempo límite

## 🎨 UX/UI

- ✅ **Modales Consistentes**: Diseño uniforme con Tailwind CSS
- ✅ **Feedback Visual**: Estados de carga y error claros
- ✅ **Iconografía**: Heroicons para consistencia
- ✅ **Responsive**: Adaptable a móviles y desktop
- ✅ **Notificaciones**: Integración con sistema de notificaciones

## 🚀 Routing

Las rutas están configuradas en `App.tsx`:

```typescript
// Ruta pública para callbacks de email
<Route path="/auth/callback" element={<EmailCallbackPage />} />
```

## 📱 Páginas y Componentes

### EmailCallbackPage
- **Propósito**: Maneja callbacks de verificación de email
- **URL**: `/auth/callback`
- **Funciones**: 
  - Verificación de tokens de confirmación
  - Verificación de recovery tokens
  - Verificación de invite tokens
  - Redirección post-verificación

### Modales de Email
Todos los modales siguen el mismo patrón:
- Estado de carga
- Manejo de errores
- Validación de formularios
- Feedback visual
- Integración con notificaciones

## 🔄 Estados y Flujos

### Flujo de Confirmación de Email
1. Usuario se registra
2. Se muestra `EmailVerificationModal`
3. Usuario elige OTP o enlace
4. Verificación en `EmailCallbackPage`
5. Redirección a dashboard

### Flujo de Magic Link
1. Usuario ingresa email
2. Se envía magic link
3. Usuario hace clic en email
4. Verificación en `EmailCallbackPage`
5. Autenticación automática

### Flujo de Invitación
1. Admin abre `InviteUserModal`
2. Personaliza invitación
3. Sistema envía email
4. Usuario hace clic en enlace
5. Redirección a registro/login

## 🧪 Testing

Para testing del sistema:
1. Configurar Supabase en modo desarrollo
2. Usar emails de testing válidos
3. Verificar logs en Supabase Dashboard
4. Probar todos los flujos de email

## 📞 Soporte

Para problemas con el sistema de email:
1. Verificar configuración de Supabase
2. Revisar logs de error en consola
3. Validar URLs de callback
4. Confirmar templates de email en Supabase
