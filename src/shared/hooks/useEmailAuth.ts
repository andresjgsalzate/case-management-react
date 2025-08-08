import { useMutation, useQuery } from '@tanstack/react-query';
import { EmailService, EmailConfigOptions } from '../services/EmailService';
import { useNotification } from '../components/notifications/NotificationSystem';
import { 
  getEmailCallbackUrl, 
  getResetPasswordUrl, 
  getRedirectUrl,
  SMTP_CONFIG,
  isProduction
} from '../config/emailConfig';

/**
 * Hook para gestionar todas las operaciones de email de autenticación
 */
export const useEmailAuth = () => {
  const { showSuccess, showError } = useNotification();

  // Mutation para enviar email de confirmación
  const sendConfirmationEmail = useMutation({
    mutationFn: async ({ email, options }: { email: string; options?: EmailConfigOptions }) => {
      await EmailService.sendConfirmationEmail(email, options);
    },
    onSuccess: () => {
      showSuccess('Email de confirmación enviado. Revisa tu bandeja de entrada.');
    },
    onError: (error: any) => {
      showError(`Error enviando email de confirmación: ${error.message}`);
    },
  });

  // Mutation para enviar Magic Link
  const sendMagicLink = useMutation({
    mutationFn: async ({ email, options }: { email: string; options?: EmailConfigOptions }) => {
      await EmailService.sendMagicLink(email, options);
    },
    onSuccess: () => {
      showSuccess('Enlace mágico enviado. Revisa tu email para acceder.');
    },
    onError: (error: any) => {
      showError(`Error enviando enlace mágico: ${error.message}`);
    },
  });

  // Mutation para enviar email de recuperación de contraseña
  const sendPasswordResetEmail = useMutation({
    mutationFn: async ({ email, options }: { email: string; options?: EmailConfigOptions }) => {
      await EmailService.sendPasswordResetEmail(email, options);
    },
    onSuccess: () => {
      showSuccess('Email de recuperación enviado. Revisa tu bandeja de entrada.');
    },
    onError: (error: any) => {
      showError(`Error enviando email de recuperación: ${error.message}`);
    },
  });

  // Mutation para invitar usuario
  const inviteUserByEmail = useMutation({
    mutationFn: async ({ email, options }: { email: string; options?: EmailConfigOptions }) => {
      await EmailService.inviteUserByEmail(email, options);
    },
    onSuccess: () => {
      showSuccess('Invitación enviada exitosamente.');
    },
    onError: (error: any) => {
      showError(`Error enviando invitación: ${error.message}`);
    },
  });

  // Mutation para solicitar cambio de email
  const requestEmailChange = useMutation({
    mutationFn: async ({ newEmail, options }: { newEmail: string; options?: EmailConfigOptions }) => {
      await EmailService.requestEmailChange(newEmail, options);
    },
    onSuccess: () => {
      showSuccess('Solicitud de cambio de email enviada. Revisa tu nueva dirección de email.');
    },
    onError: (error: any) => {
      showError(`Error solicitando cambio de email: ${error.message}`);
    },
  });

  // Mutation para verificar OTP
  const verifyOTP = useMutation({
    mutationFn: async ({ 
      email, 
      token, 
      type 
    }: { 
      email: string; 
      token: string; 
      type: 'signup' | 'recovery' | 'email_change' | 'email' 
    }) => {
      await EmailService.verifyOTP(email, token, type);
    },
    onSuccess: () => {
      showSuccess('Verificación exitosa.');
    },
    onError: (error: any) => {
      showError(`Error en verificación: ${error.message}`);
    },
  });

  // Mutation para verificar token hash
  const verifyTokenHash = useMutation({
    mutationFn: async ({ tokenHash, type }: { tokenHash: string; type: string }) => {
      return await EmailService.verifyTokenHash(tokenHash, type);
    },
    onSuccess: () => {
      showSuccess('Verificación exitosa.');
    },
    onError: (error: any) => {
      showError(`Error en verificación: ${error.message}`);
    },
  });

  // Mutation para reautenticación
  const requestReauthentication = useMutation({
    mutationFn: async () => {
      await EmailService.requestReauthentication();
    },
    onSuccess: () => {
      showSuccess('Solicitud de reautenticación enviada.');
    },
    onError: (error: any) => {
      showError(`Error en reautenticación: ${error.message}`);
    },
  });

  return {
    // Mutations
    sendConfirmationEmail,
    sendMagicLink,
    sendPasswordResetEmail,
    inviteUserByEmail,
    requestEmailChange,
    verifyOTP,
    verifyTokenHash,
    requestReauthentication,
    
    // Helper functions
    getRedirectURL: EmailService.getRedirectURL,
  };
};

/**
 * Hook para gestionar configuración de email templates (solo para administradores)
 */
export const useEmailTemplatesConfig = (accessToken?: string, projectRef?: string) => {
  // Query para obtener configuración actual
  const {
    data: currentConfig,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['email-templates-config', projectRef],
    queryFn: () => {
      if (!accessToken || !projectRef) {
        throw new Error('Access token y project ref son requeridos');
      }
      return EmailService.getEmailTemplatesConfig(accessToken, projectRef);
    },
    enabled: !!accessToken && !!projectRef,
  });

  // Mutation para configurar templates
  const configureTemplates = useMutation({
    mutationFn: async () => {
      if (!accessToken || !projectRef) {
        throw new Error('Access token y project ref son requeridos');
      }
      await EmailService.configureEmailTemplates(accessToken, projectRef);
    },
    onSuccess: () => {
      refetch(); // Refrescar la configuración después de actualizar
    },
  });

  return {
    currentConfig,
    isLoading,
    error,
    configureTemplates,
    refetch,
  };
};

/**
 * Hook para manejar la verificación de URLs con parámetros de email
 */
export const useEmailVerification = () => {
  const { showSuccess, showError } = useNotification();

  // Procesar parámetros de URL para verificación
  const processEmailVerification = async (searchParams: URLSearchParams) => {
    const token_hash = searchParams.get('token_hash');
    const type = searchParams.get('type');
    const error_code = searchParams.get('error_code');
    const error_description = searchParams.get('error_description');

    // Manejar errores en la URL
    if (error_code) {
      const errorMessage = error_description || 'Error en la verificación';
      showError(`Error ${error_code}: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }

    // Verificar token si está presente
    if (token_hash && type) {
      try {
        const result = await EmailService.verifyTokenHash(token_hash, type);
        
        switch (type) {
          case 'signup':
          case 'email':
            showSuccess('¡Email confirmado exitosamente! Ya puedes usar tu cuenta.');
            break;
          case 'recovery':
            showSuccess('Verificación exitosa. Ahora puedes cambiar tu contraseña.');
            break;
          case 'email_change':
            showSuccess('Cambio de email confirmado exitosamente.');
            break;
          case 'invite':
            showSuccess('Invitación aceptada. Configura tu contraseña para continuar.');
            break;
          default:
            showSuccess('Verificación exitosa.');
        }
        
        return { success: true, data: result, type };
      } catch (error: any) {
        showError(`Error en verificación: ${error.message}`);
        return { success: false, error: error.message };
      }
    }

    return { success: false, error: 'Parámetros de verificación no encontrados' };
  };

  return {
    processEmailVerification,
  };
};

/**
 * Hook para obtener información de configuración de email
 */
export const useEmailConfig = () => {
  // Funciones helper para obtener URLs
  const getCallbackUrl = () => getEmailCallbackUrl();
  const getPasswordResetUrl = () => getResetPasswordUrl();
  const getSuccessRedirectUrl = (type: 'confirmationSuccess' | 'magicLinkSuccess' | 'passwordResetSuccess' | 'emailChangeSuccess') => 
    getRedirectUrl(type);
  
  // Información SMTP para referencia
  const smtpInfo = {
    senderEmail: SMTP_CONFIG.senderEmail,
    senderName: SMTP_CONFIG.senderName,
    isProduction: isProduction
  };
  
  // Helper para crear opciones de email con URLs automáticas
  const createEmailOptions = (type: 'confirmation' | 'magicLink' | 'passwordReset' | 'emailChange', customData?: Record<string, any>): EmailConfigOptions => {
    const baseOptions: EmailConfigOptions = {
      data: customData
    };
    
    switch (type) {
      case 'confirmation':
        baseOptions.redirectTo = getCallbackUrl();
        break;
      case 'magicLink':
        baseOptions.redirectTo = getCallbackUrl();
        break;
      case 'passwordReset':
        baseOptions.redirectTo = getPasswordResetUrl();
        break;
      case 'emailChange':
        baseOptions.redirectTo = getCallbackUrl();
        break;
    }
    
    return baseOptions;
  };
  
  return {
    getCallbackUrl,
    getPasswordResetUrl,
    getSuccessRedirectUrl,
    createEmailOptions,
    smtpInfo
  };
};
