// Ejemplo de uso del sistema de email actualizado
// Este archivo muestra cómo usar las nuevas funcionalidades de configuración

import { useEmailAuth, useEmailConfig } from '@/shared/hooks/useEmailAuth';

/**
 * Ejemplo 1: Uso básico con URLs automáticas
 */
export const ExampleBasicUsage = () => {
  const { sendMagicLink, sendConfirmationEmail, inviteUserByEmail } = useEmailAuth();
  const { createEmailOptions, smtpInfo } = useEmailConfig();

  const handleSendMagicLink = async (email: string) => {
    // URLs se configuran automáticamente según el entorno
    await sendMagicLink.mutateAsync({
      email,
      options: createEmailOptions('magicLink')
    });
  };

  const handleInviteUser = async (email: string, inviterName: string, teamName?: string) => {
    // Incluye información personalizada en la invitación
    await inviteUserByEmail.mutateAsync({
      email,
      options: createEmailOptions('confirmation', {
        inviter_name: inviterName,
        team_name: teamName,
        custom_message: 'Te esperamos en el equipo!'
      })
    });
  };

  return (
    <div>
      <h3>Configuración Actual:</h3>
      <p>Sender: {smtpInfo.senderName} ({smtpInfo.senderEmail})</p>
      <p>Entorno: {smtpInfo.isProduction ? 'Producción' : 'Desarrollo'}</p>
      
      {/* Resto del componente */}
    </div>
  );
};

/**
 * Ejemplo 2: Uso avanzado con URLs personalizadas
 */
export const ExampleAdvancedUsage = () => {
  const { sendPasswordResetEmail } = useEmailAuth();
  const { getCallbackUrl, getPasswordResetUrl } = useEmailConfig();

  const handleCustomPasswordReset = async (email: string) => {
    // Usar URLs específicas si es necesario
    await sendPasswordResetEmail.mutateAsync({
      email,
      options: {
        redirectTo: `${getPasswordResetUrl()}?from=admin-panel`,
        data: {
          reset_initiated_by: 'admin',
          timestamp: new Date().toISOString()
        }
      }
    });
  };

  // Log de configuración para debugging
  console.log('Callback URL:', getCallbackUrl());
  console.log('Reset URL:', getPasswordResetUrl());

  return null;
};

/**
 * Ejemplo 3: Manejo de verificación de email en callback page
 */
export const ExampleEmailCallback = () => {
  const { processEmailVerification } = useEmailVerification();

  useEffect(() => {
    const handleCallback = async () => {
      // URLs se detectan automáticamente del URL actual
      const result = await processEmailVerification();
      
      if (result.success) {
        // Redirección automática según el tipo
        switch (result.type) {
          case 'signup':
            window.location.href = '/dashboard';
            break;
          case 'recovery':
            window.location.href = '/reset-password';
            break;
          case 'invite':
            window.location.href = '/complete-registration';
            break;
        }
      }
    };

    handleCallback();
  }, []);

  return null;
};
