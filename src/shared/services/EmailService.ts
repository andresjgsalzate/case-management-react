import { supabase } from '../lib/supabase';
import { 
  getEmailCallbackUrl, 
  getResetPasswordUrl, 
  SMTP_CONFIG,
  isProduction
} from '../config/emailConfig';

export interface EmailTemplate {
  type: 'confirm_signup' | 'invite_user' | 'magic_link' | 'reset_password' | 'change_email' | 'reauthentication';
  subject: string;
  htmlContent: string;
  textContent?: string;
}

export interface EmailConfigOptions {
  redirectTo?: string;
  data?: Record<string, any>;
}

/**
 * Servicio para gestionar emails de autenticación con Supabase
 * Implementa todas las funcionalidades de email según la documentación de Supabase Auth
 */
export class EmailService {
  
  /**
   * Configurar las plantillas de email en Supabase
   * Esta función debe ser ejecutada por un administrador para configurar las plantillas
   */
  static async configureEmailTemplates(accessToken: string, projectRef: string): Promise<void> {
    const emailTemplates = {
      // Configuración de asuntos
      "mailer_subjects_confirmation": "Confirma tu cuenta - Sistema de Gestión de Casos",
      "mailer_subjects_magic_link": "Enlace de acceso - Sistema de Gestión de Casos", 
      "mailer_subjects_recovery": "Recuperar contraseña - Sistema de Gestión de Casos",
      "mailer_subjects_invite": "Invitación al sistema - Sistema de Gestión de Casos",
      "mailer_subjects_email_change": "Confirmar cambio de email - Sistema de Gestión de Casos",

      // Plantillas HTML para confirmar registro
      "mailer_templates_confirmation_content": `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin-bottom: 10px;">Sistema de Gestión de Casos</h1>
            <p style="color: #6b7280; font-size: 16px;">Confirma tu cuenta para comenzar</p>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #1f2937; margin-bottom: 15px;">¡Bienvenido{{#if .Data.name}}, {{.Data.name}}{{/if}}!</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Gracias por registrarte en nuestro Sistema de Gestión de Casos. Para completar tu registro y acceder a todas las funcionalidades, necesitas confirmar tu dirección de email.
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="{{ .ConfirmationURL }}" 
                 style="background: #1e40af; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Confirmar mi cuenta
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Si el botón no funciona, puedes copiar y pegar este enlace en tu navegador:<br>
              <span style="word-break: break-all; color: #1e40af;">{{ .ConfirmationURL }}</span>
            </p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Si no te registraste en nuestro sistema, puedes ignorar este email.<br>
              Este enlace expirará en 24 horas por seguridad.
            </p>
          </div>
        </div>
      `,

      // Plantilla para Magic Link
      "mailer_templates_magic_link_content": `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin-bottom: 10px;">Sistema de Gestión de Casos</h1>
            <p style="color: #6b7280; font-size: 16px;">Tu enlace de acceso está listo</p>
          </div>
          
          <div style="background: #f0f9ff; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #0ea5e9;">
            <h2 style="color: #1f2937; margin-bottom: 15px;">🔐 Acceso Rápido</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Haz clic en el siguiente enlace para acceder de forma segura a tu cuenta sin necesidad de contraseña:
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="{{ .ConfirmationURL }}" 
                 style="background: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Acceder ahora
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Si prefieres, también puedes usar este código de verificación: <strong style="background: #e0f2fe; padding: 2px 8px; border-radius: 4px; color: #0c4a6e;">{{ .Token }}</strong>
            </p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Este enlace es válido por 1 hora y solo puede usarse una vez.<br>
              Si no solicitaste este acceso, puedes ignorar este email.
            </p>
          </div>
        </div>
      `,

      // Plantilla para recuperación de contraseña
      "mailer_templates_recovery_content": `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin-bottom: 10px;">Sistema de Gestión de Casos</h1>
            <p style="color: #6b7280; font-size: 16px;">Recuperación de contraseña</p>
          </div>
          
          <div style="background: #fef3c7; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
            <h2 style="color: #1f2937; margin-bottom: 15px;">🔑 Restablecer contraseña</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el siguiente enlace para crear una nueva contraseña:
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="{{ .ConfirmationURL }}" 
                 style="background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Restablecer contraseña
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Si el botón no funciona, copia y pega este enlace en tu navegador:<br>
              <span style="word-break: break-all; color: #d97706;">{{ .ConfirmationURL }}</span>
            </p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Si no solicitaste este cambio, puedes ignorar este email.<br>
              Tu contraseña actual permanecerá sin cambios. Este enlace expira en 1 hora.
            </p>
          </div>
        </div>
      `,

      // Plantilla para invitación de usuarios
      "mailer_templates_invite_content": `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin-bottom: 10px;">Sistema de Gestión de Casos</h1>
            <p style="color: #6b7280; font-size: 16px;">Has sido invitado a unirte</p>
          </div>
          
          <div style="background: #f0fdf4; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #22c55e;">
            <h2 style="color: #1f2937; margin-bottom: 15px;">🎉 ¡Bienvenido al equipo!</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Has sido invitado a formar parte del Sistema de Gestión de Casos en <strong>{{ .SiteURL }}</strong>. 
              Tu nueva cuenta te permitirá colaborar en la gestión de casos y acceder a todas nuestras herramientas.
            </p>
            
            {{#if .Data.inviter_name}}
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              <strong>Invitado por:</strong> {{.Data.inviter_name}}<br>
              {{#if .Data.team_name}}<strong>Equipo:</strong> {{.Data.team_name}}{{/if}}
            </p>
            {{/if}}
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="{{ .ConfirmationURL }}" 
                 style="background: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Aceptar invitación
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              Al aceptar la invitación, podrás configurar tu contraseña y comenzar a usar el sistema.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Esta invitación es válida por 7 días.<br>
              Si no esperabas esta invitación, puedes ignorar este email.
            </p>
          </div>
        </div>
      `,

      // Plantilla para cambio de email
      "mailer_templates_email_change_content": `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1e40af; margin-bottom: 10px;">Sistema de Gestión de Casos</h1>
            <p style="color: #6b7280; font-size: 16px;">Confirmar cambio de email</p>
          </div>
          
          <div style="background: #fef3f2; padding: 25px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #ef4444;">
            <h2 style="color: #1f2937; margin-bottom: 15px;">📧 Cambio de dirección de email</h2>
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Se ha solicitado cambiar la dirección de email de tu cuenta:
            </p>
            
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 15px 0;">
              <p style="margin: 0; color: #4b5563;">
                <strong>Email anterior:</strong> {{ .Email }}<br>
                <strong>Nuevo email:</strong> {{ .NewEmail }}
              </p>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Para confirmar este cambio y comenzar a usar tu nueva dirección de email, haz clic en el siguiente enlace:
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="{{ .ConfirmationURL }}" 
                 style="background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Confirmar cambio de email
              </a>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">
              Si no solicitaste este cambio, contacta inmediatamente a soporte.<br>
              Este enlace expira en 24 horas por seguridad.
            </p>
          </div>
        </div>
      `
    };

    try {
      const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailTemplates)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Plantillas de email configuradas exitosamente:', result);
    } catch (error) {
      console.error('❌ Error configurando plantillas de email:', error);
      throw error;
    }
  }

  /**
   * Enviar email de confirmación de registro
   */
  static async sendConfirmationEmail(email: string, options?: EmailConfigOptions): Promise<void> {
    try {
      const redirectTo = options?.redirectTo || getEmailCallbackUrl();
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: redirectTo
        }
      });

      if (error) throw error;
      
      // Log para debugging en desarrollo
      if (!isProduction) {
        console.log('📧 Email de confirmación enviado a:', email);
        console.log('🔗 Redirect URL:', redirectTo);
      }
    } catch (error) {
      console.error('❌ Error enviando email de confirmación:', error);
      throw error;
    }
  }

  /**
   * Enviar Magic Link para login sin contraseña
   */
  static async sendMagicLink(email: string, options?: EmailConfigOptions): Promise<void> {
    try {
      const redirectTo = options?.redirectTo || getEmailCallbackUrl();
      
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: redirectTo,
          data: options?.data
        }
      });

      if (error) throw error;
      
      // Log para debugging en desarrollo
      if (!isProduction) {
        console.log('🔗 Magic link enviado a:', email);
        console.log('🔗 Redirect URL:', redirectTo);
      }
    } catch (error) {
      console.error('❌ Error enviando magic link:', error);
      throw error;
    }
  }

  /**
   * Enviar email de recuperación de contraseña
   */
  static async sendPasswordResetEmail(email: string, options?: EmailConfigOptions): Promise<void> {
    try {
      const redirectTo = options?.redirectTo || getResetPasswordUrl();
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectTo
      });

      if (error) throw error;
      
      // Log para debugging en desarrollo
      if (!isProduction) {
        console.log('🔑 Email de reset enviado a:', email);
        console.log('🔗 Redirect URL:', redirectTo);
      }
    } catch (error) {
      console.error('❌ Error enviando email de recuperación:', error);
      throw error;
    }
  }

  /**
   * Invitar usuario por email
   */
  static async inviteUserByEmail(email: string, options?: EmailConfigOptions): Promise<void> {
    try {
      const redirectTo = options?.redirectTo || getEmailCallbackUrl();
      
      const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
        redirectTo: redirectTo,
        data: {
          ...options?.data,
          // Agregar información del remitente de la configuración SMTP
          sender_email: SMTP_CONFIG.senderEmail,
          sender_name: SMTP_CONFIG.senderName
        }
      });

      if (error) throw error;
      
      // Log para debugging en desarrollo
      if (!isProduction) {
        console.log('👥 Invitación enviada a:', email);
        console.log('🔗 Redirect URL:', redirectTo);
        console.log('📝 Datos adicionales:', options?.data);
      }
    } catch (error) {
      console.error('❌ Error enviando invitación:', error);
      throw error;
    }
  }

  /**
   * Solicitar cambio de email
   */
  static async requestEmailChange(newEmail: string, options?: EmailConfigOptions): Promise<void> {
    try {
      const redirectTo = options?.redirectTo || getEmailCallbackUrl();
      
      const { error } = await supabase.auth.updateUser(
        { email: newEmail },
        {
          emailRedirectTo: redirectTo
        }
      );

      if (error) throw error;
      
      // Log para debugging en desarrollo
      if (!isProduction) {
        console.log('📧 Cambio de email solicitado a:', newEmail);
        console.log('🔗 Redirect URL:', redirectTo);
      }
    } catch (error) {
      console.error('❌ Error solicitando cambio de email:', error);
      throw error;
    }
  }

  /**
   * Verificar OTP (código de 6 dígitos) en lugar de usar enlaces
   */
  static async verifyOTP(email: string, token: string, type: 'signup' | 'recovery' | 'email_change' | 'email'): Promise<void> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type
      });

      if (error) throw error;
    } catch (error) {
      console.error('❌ Error verificando OTP:', error);
      throw error;
    }
  }

  /**
   * Verificar con token hash (para enlaces personalizados)
   */
  static async verifyTokenHash(tokenHash: string, type: string): Promise<any> {
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as any
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('❌ Error verificando token hash:', error);
      throw error;
    }
  }

  /**
   * Reautenticación - Solicitar confirmación de identidad
   */
  static async requestReauthentication(): Promise<void> {
    try {
      const { error } = await supabase.auth.reauthenticate();
      if (error) throw error;
    } catch (error) {
      console.error('❌ Error en reautenticación:', error);
      throw error;
    }
  }

  /**
   * Configurar URLs de redirección permitidas
   */
  static getRedirectURL(path: string = ''): string {
    const baseURL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    return `${baseURL}${path}`;
  }

  /**
   * Obtener configuración de email templates actual
   */
  static async getEmailTemplatesConfig(accessToken: string, projectRef: string): Promise<any> {
    try {
      const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const config = await response.json();
      
      // Filtrar solo configuraciones de email templates
      const emailTemplates = Object.entries(config)
        .filter(([key]) => key.startsWith('mailer_'))
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      return emailTemplates;
    } catch (error) {
      console.error('❌ Error obteniendo configuración de templates:', error);
      throw error;
    }
  }
}
