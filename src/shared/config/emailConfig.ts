/**
 * Configuración de entorno para URLs y endpoints
 */

// Detectar si estamos en producción
export const isProduction = import.meta.env.PROD;

// URLs base según el entorno
export const APP_CONFIG = {
  development: {
    baseUrl: 'http://localhost:5173',
    callbackUrl: 'http://localhost:5173/auth/callback',
    resetPasswordUrl: 'http://localhost:5173/reset-password'
  },
  production: {
    baseUrl: 'https://case-management-ctl.netlify.app',
    callbackUrl: 'https://case-management-ctl.netlify.app/auth/callback', 
    resetPasswordUrl: 'https://case-management-ctl.netlify.app/reset-password'
  }
} as const;

// Configuración actual según el entorno
export const CURRENT_CONFIG = isProduction ? APP_CONFIG.production : APP_CONFIG.development;

/**
 * Obtiene la URL de callback para operaciones de email
 */
export const getEmailCallbackUrl = (): string => {
  return CURRENT_CONFIG.callbackUrl;
};

/**
 * Obtiene la URL de reset de contraseña
 */
export const getResetPasswordUrl = (): string => {
  return CURRENT_CONFIG.resetPasswordUrl;
};

/**
 * Obtiene la URL base de la aplicación
 */
export const getBaseUrl = (): string => {
  return CURRENT_CONFIG.baseUrl;
};

/**
 * Configuración SMTP personalizada
 * Estos valores deben coincidir con la configuración en Supabase
 */
export const SMTP_CONFIG = {
  // Información del remitente (configurada en Supabase)
  senderEmail: 'case-management@andrejgalzate.com',
  senderName: 'Case Management',
  
  // Configuración del servidor SMTP (solo para referencia, Supabase maneja esto)
  host: 'smtp.hostinger.com',
  port: 465,
  
  // Límites de envío
  minIntervalBetweenEmails: 60, // 60 segundos entre emails
  
  // Configuración de rate limiting
  rateLimits: {
    confirmationEmails: 5, // máximo 5 por hora
    magicLinks: 3, // máximo 3 por hora
    passwordResets: 3, // máximo 3 por hora
    invitations: 10 // máximo 10 por hora (para admins)
  }
} as const;

/**
 * Configuración específica para templates de email
 */
export const EMAIL_TEMPLATE_CONFIG = {
  // Tiempo de expiración por defecto para tokens
  defaultExpirationHours: {
    confirmation: 24,
    magicLink: 1,
    passwordReset: 1,
    emailChange: 1,
    invitation: 72 // 3 días para aceptar invitaciones
  },
  
  // Configuración de URLs de redirección
  redirectPaths: {
    confirmationSuccess: '/dashboard',
    confirmationError: '/auth/verification-error',
    magicLinkSuccess: '/dashboard', 
    passwordResetSuccess: '/dashboard',
    passwordResetError: '/auth/reset-error',
    invitationAccepted: '/auth/complete-registration',
    emailChangeSuccess: '/profile',
    emailChangeError: '/profile/email-error'
  }
} as const;

/**
 * Obtiene la URL completa de redirección para un tipo específico
 */
export const getRedirectUrl = (type: keyof typeof EMAIL_TEMPLATE_CONFIG.redirectPaths): string => {
  const path = EMAIL_TEMPLATE_CONFIG.redirectPaths[type];
  return `${getBaseUrl()}${path}`;
};
