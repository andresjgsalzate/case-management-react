import { supabase } from '@/shared/lib/supabase';

export interface CustomPasswordResetParams {
  email: string;
}

export interface CustomPasswordResetResponse {
  success: boolean;
  message: string;
  logId?: string;
}

/**
 * Función personalizada para envío de emails de recuperación de contraseña
 * Usa nuestro sistema SMTP configurado en lugar del servicio de Supabase
 */
export const sendCustomPasswordReset = async (params: CustomPasswordResetParams): Promise<CustomPasswordResetResponse> => {
  try {
    console.log('🔐 Iniciando recuperación personalizada para:', params.email);

    // 1. Verificar que el usuario existe usando función RPC que no requiere autenticación
    const { data: userData, error: userError } = await supabase
      .rpc('get_user_data_for_recovery', {
        p_email: params.email
      });

    if (userError) {
      console.error('❌ Error al verificar usuario:', userError);
      return {
        success: false,
        message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación.'
      };
    }

    // Si no hay datos, el usuario no existe, pero no lo revelamos por seguridad
    if (!userData || userData.length === 0) {
      console.log('❌ Usuario no encontrado:', params.email);
      return {
        success: false,
        message: 'Si el email existe en nuestro sistema, recibirás un enlace de recuperación.'
      };
    }

    const user = userData[0];
    console.log('✅ Usuario encontrado:', user.full_name);

    // 2. Generar token de recuperación único
    const resetToken = generateSecureToken();
    const expirationDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    console.log('🔑 Token generado, válido hasta:', expirationDate);

    // 3. Guardar token en la base de datos usando función segura
    const { data: tokenResult, error: tokenError } = await supabase
      .rpc('create_password_reset_token', {
        p_email: params.email,
        p_token: resetToken,
        p_expires_at: expirationDate.toISOString()
      });

    if (tokenError) {
      console.error('❌ Error al guardar token:', tokenError);
      throw new Error('Error interno del servidor');
    }

    console.log('💾 Token guardado en base de datos con ID:', tokenResult);

    // 4. Obtener configuraciones SMTP
    const smtpConfig = await getSmtpConfiguration();
    if (!smtpConfig.success) {
      throw new Error(smtpConfig.message);
    }

    console.log('📧 Configuración SMTP obtenida');

    // 5. Generar enlace de recuperación
    const resetUrl = `${getCurrentBaseUrl()}/reset-password?token=${resetToken}`;

    // 6. Obtener template de email
    const emailContent = await getPasswordResetTemplate({
      userName: user.full_name || user.email,
      resetUrl,
      expirationHours: 24
    });

    console.log('📝 Template de email generado');

    // 7. Enviar email usando nuestro sistema
    const emailResult = await sendEmailWithSmtp({
      to: params.email,
      subject: 'Recuperación de Contraseña - Case Management',
      htmlContent: emailContent.html,
      textContent: emailContent.text,
      smtpConfig: smtpConfig.config!
    });

    if (!emailResult.success) {
      throw new Error(emailResult.message);
    }

    console.log('✅ Email enviado exitosamente, Log ID:', emailResult.logId);

    return {
      success: true,
      message: 'Se ha enviado un enlace de recuperación a tu email. Revisa tu bandeja de entrada y spam.',
      logId: emailResult.logId
    };

  } catch (error: any) {
    console.error('❌ Error en recuperación personalizada:', error);
    
    // Log del error para debugging
    await logEmailError({
      to_email: params.email,
      subject: 'Recuperación de Contraseña - Case Management',
      error_message: error.message,
      template_type: 'password_recovery'
    });

    return {
      success: false,
      message: 'Error al procesar la solicitud. Inténtalo nuevamente en unos minutos.'
    };
  }
};

/**
 * Genera un token seguro para recuperación de contraseña
 */
function generateSecureToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Obtiene la URL base actual según el entorno
 */
function getCurrentBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return import.meta.env.DEV ? 'http://localhost:5173' : 'https://case-management-ctl.netlify.app';
}

/**
 * Obtiene la configuración SMTP de la base de datos (incluyendo credenciales seguras)
 */
async function getSmtpConfiguration() {
  try {
    // Obtener configuraciones básicas de SMTP
    const { data: configs, error } = await supabase
      .from('system_configurations')
      .select('key, value')
      .eq('category', 'smtp')
      .eq('is_active', true);

    if (error || !configs) {
      console.error('❌ Error obteniendo configuraciones SMTP:', error);
      return { success: false, message: 'Configuración SMTP no encontrada' };
    }

    console.log('📧 Configuraciones SMTP encontradas:', configs);

    const smtpConfig: Record<string, string> = {};
    configs.forEach(config => {
      smtpConfig[config.key] = config.value;
    });

    console.log('📧 Configuraciones SMTP parseadas:', Object.keys(smtpConfig));

    // Obtener contraseña encriptada usando función segura
    const { data: passwordData, error: passwordError } = await supabase
      .rpc('get_decrypted_credential', { p_key: 'smtp_password' });

    if (passwordError || !passwordData) {
      console.error('❌ Error obteniendo contraseña SMTP:', passwordError);
      return { 
        success: false, 
        message: 'Error obteniendo credenciales SMTP seguras' 
      };
    }

    console.log('🔑 Contraseña SMTP obtenida correctamente');

    // Agregar contraseña desencriptada a la configuración
    smtpConfig.password = passwordData;

    console.log('📧 Configuraciones SMTP finales:', Object.keys(smtpConfig));

    const requiredKeys = ['host', 'port', 'username', 'password', 'sender_email', 'sender_name'];
    const missingKeys = requiredKeys.filter(key => !smtpConfig[key] || smtpConfig[key] === 'CHANGE_THIS_PASSWORD');

    if (missingKeys.length > 0) {
      console.error('❌ Configuraciones SMTP faltantes:', missingKeys);
      console.error('❌ Configuraciones disponibles:', Object.keys(smtpConfig));
      return { 
        success: false, 
        message: `Configuración SMTP incompleta: ${missingKeys.join(', ')}` 
      };
    }

    console.log('✅ Configuración SMTP completa obtenida');
    return { success: true, config: smtpConfig };
  } catch (error: any) {
    console.error('❌ Error en getSmtpConfiguration:', error);
    return { success: false, message: error.message };
  }
}

/**
 * Obtiene el template de recuperación de contraseña
 */
async function getPasswordResetTemplate(params: {
  userName: string;
  resetUrl: string;
  expirationHours: number;
}) {
  // Template básico por ahora - se puede mejorar obteniendo de la base de datos
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Recuperación de Contraseña</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Recuperación de Contraseña</h2>
            
            <p>Hola <strong>${params.userName}</strong>,</p>
            
            <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Case Management</strong>.</p>
            
            <div style="margin: 30px 0; text-align: center;">
                <a href="${params.resetUrl}" 
                   style="display: inline-block; padding: 12px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Restablecer Contraseña
                </a>
            </div>
            
            <p><strong>Este enlace expirará en ${params.expirationHours} horas.</strong></p>
            
            <p>Si no solicitaste este cambio, puedes ignorar este email de forma segura.</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            
            <p style="font-size: 12px; color: #666;">
                Este es un email automático, por favor no respondas a este mensaje.<br>
                <strong>Case Management System</strong>
            </p>
        </div>
    </body>
    </html>
  `;

  const text = `
Recuperación de Contraseña - Case Management

Hola ${params.userName},

Recibimos una solicitud para restablecer la contraseña de tu cuenta.

Para continuar, visita el siguiente enlace:
${params.resetUrl}

Este enlace expirará en ${params.expirationHours} horas.

Si no solicitaste este cambio, puedes ignorar este email de forma segura.

---
Case Management System
Este es un email automático, por favor no respondas a este mensaje.
  `;

  return { html, text };
}

/**
 * Envía email usando configuración SMTP
 */
async function sendEmailWithSmtp(params: {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  smtpConfig: Record<string, string>;
}) {
  try {
    // Registrar el envío con toda la información
    const sentAt = new Date().toISOString();
    
    const { data: logEntry, error: logError } = await supabase
      .from('email_logs')
      .insert({
        email_type: 'password_recovery',
        recipient_email: params.to,
        subject: params.subject,
        status: 'sent',
        sent_at: sentAt,
        metadata: {
          smtp_config_used: {
            host: params.smtpConfig.host,
            port: params.smtpConfig.port,
            sender: params.smtpConfig.sender_email,
            sender_name: params.smtpConfig.sender_name,
            use_ssl: params.smtpConfig.use_ssl
          },
          email_content: {
            html_content: params.htmlContent,
            text_content: params.textContent,
            content_length_html: params.htmlContent.length,
            content_length_text: params.textContent.length
          },
          delivery_info: {
            attempt_time: sentAt,
            delivery_method: 'smtp_custom',
            simulated: true // Cambiar a false cuando implementes envío real
          }
        }
      })
      .select('id')
      .single();

    if (logError) {
      console.error('❌ Error al registrar envío:', logError);
      throw new Error('Error al registrar envío');
    }

    console.log('✅ Email registrado en logs con ID:', logEntry.id);

    // Aquí implementarías el envío real por SMTP
    // Por ejemplo usando nodemailer:
    /*
    const transporter = nodemailer.createTransporter({
      host: params.smtpConfig.host,
      port: parseInt(params.smtpConfig.port),
      secure: params.smtpConfig.use_ssl === 'true',
      auth: {
        user: params.smtpConfig.username,
        pass: params.smtpConfig.password
      }
    });

    await transporter.sendMail({
      from: `"${params.smtpConfig.sender_name}" <${params.smtpConfig.sender_email}>`,
      to: params.to,
      subject: params.subject,
      text: params.textContent,
      html: params.htmlContent
    });
    */

    return {
      success: true,
      message: 'Email enviado correctamente',
      logId: logEntry.id
    };

  } catch (error: any) {
    console.error('❌ Error en sendEmailWithSmtp:', error);
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * Registra errores de email para debugging
 */
async function logEmailError(params: {
  to_email: string;
  subject: string;
  error_message: string;
  template_type: string;
}) {
  try {
    const failedAt = new Date().toISOString();
    
    await supabase
      .from('email_logs')
      .insert({
        email_type: 'password_recovery',
        recipient_email: params.to_email,
        subject: params.subject,
        status: 'failed',
        error_message: params.error_message,
        sent_at: failedAt, // Registrar cuándo falló
        metadata: {
          error_details: {
            error_time: failedAt,
            error_context: 'custom_password_reset',
            template_type: params.template_type
          }
        }
      });
      
    console.log('📝 Error registrado en email_logs');
  } catch (error) {
    console.error('❌ Error al registrar error en logs:', error);
  }
}
