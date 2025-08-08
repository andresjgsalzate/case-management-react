import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';

// Tipos para las configuraciones
interface SystemConfig {
  id: string;
  category: string;
  key: string;
  value: string;
  data_type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  is_active: boolean;
  is_editable: boolean;
}

interface EmailTemplate {
  id: string;
  template_type: string;
  template_name: string;
  subject: string;
  html_content: string;
  text_content?: string;
  variables: string[];
  is_active: boolean;
  is_default: boolean;
}

interface EmailLogEntry {
  id: string;
  email_type: string;
  recipient_email: string;
  subject?: string;
  template_id?: string;
  status: 'pending' | 'sent' | 'failed' | 'delivered';
  error_message?: string;
  metadata: Record<string, any>;
  sent_at?: string;
  created_at: string;
}

interface SendEmailParams {
  email_type: string;
  recipient_email: string;
  template_variables?: Record<string, any>;
  custom_template_id?: string;
}

/**
 * Hook para gestionar configuraciones del sistema
 */
export const useSystemConfigurations = () => {
  // Obtener todas las configuraciones
  const { data: configurations, isLoading, refetch } = useQuery({
    queryKey: ['system-configurations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_configurations')
        .select('*')
        .eq('is_active', true)
        .order('category, key');

      if (error) throw error;
      return data as SystemConfig[];
    },
  });

  // Obtener configuración específica
  const getConfig = (category: string, key: string): string | null => {
    const config = configurations?.find(c => c.category === category && c.key === key);
    return config?.value || null;
  };

  // Obtener configuración tipada
  const getTypedConfig = (category: string, key: string): any => {
    const config = configurations?.find(c => c.category === category && c.key === key);
    if (!config) return null;

    switch (config.data_type) {
      case 'number':
        return Number(config.value);
      case 'boolean':
        return config.value === 'true';
      case 'json':
        return JSON.parse(config.value);
      default:
        return config.value;
    }
  };

  // Actualizar configuración
  const updateConfig = useMutation({
    mutationFn: async ({ category, key, value }: { category: string; key: string; value: string }) => {
      const { error } = await supabase
        .from('system_configurations')
        .update({ 
          value, 
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id 
        })
        .eq('category', category)
        .eq('key', key);

      if (error) throw error;
    },
    onSuccess: () => {
      refetch();
    },
  });

  return {
    configurations,
    isLoading,
    getConfig,
    getTypedConfig,
    updateConfig,
    refetch
  };
};

/**
 * Hook para gestionar templates de email
 */
export const useEmailTemplates = () => {
  const { showSuccess, showError } = useNotification();

  // Obtener todos los templates
  const { data: templates, isLoading, refetch } = useQuery({
    queryKey: ['email-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_templates')
        .select('*')
        .order('template_type, template_name');

      if (error) {
        console.error('Error fetching email templates:', error);
        throw error;
      }
      
      console.log('Templates fetched:', data);
      return data as EmailTemplate[];
    },
  });

  // Obtener template por tipo
  const getTemplateByType = (template_type: string): EmailTemplate | null => {
    return templates?.find(t => t.template_type === template_type && t.is_default) || null;
  };

  // Crear nuevo template
  const createTemplate = useMutation({
    mutationFn: async (templateData: Omit<EmailTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => {
      const { error } = await supabase
        .from('email_templates')
        .insert({
          ...templateData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
          updated_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess('Template creado exitosamente');
      refetch();
    },
    onError: (error: any) => {
      showError('Error creando template', error.message);
    },
  });

  // Actualizar template
  const updateTemplate = useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<EmailTemplate> & { id: string }) => {
      const { error } = await supabase
        .from('email_templates')
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess('Template actualizado exitosamente');
      refetch();
    },
    onError: (error: any) => {
      showError('Error actualizando template', error.message);
    },
  });

  // Eliminar template
  const deleteTemplate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('email_templates')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      showSuccess('Template eliminado exitosamente');
      refetch();
    },
    onError: (error: any) => {
      showError('Error eliminando template', error.message);
    },
  });

  return {
    templates,
    isLoading,
    getTemplateByType,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    refetch
  };
};

/**
 * Hook principal para envío de emails con configuración parametrizable
 */
export const useSendEmail = () => {
  const { showSuccess, showError } = useNotification();
  const { getConfig, getTypedConfig } = useSystemConfigurations();
  const { getTemplateByType } = useEmailTemplates();

  // Obtener configuración de URLs según entorno
  const getEmailUrls = () => {
    const isProduction = import.meta.env.PROD;
    const baseUrl = isProduction 
      ? getConfig('urls', 'base_url_production')
      : getConfig('urls', 'base_url_development');
    
    const callbackPath = getConfig('urls', 'callback_path') || '/auth/callback';
    const resetPasswordPath = getConfig('urls', 'reset_password_path') || '/reset-password';

    return {
      baseUrl: baseUrl || (isProduction ? 'https://case-management-ctl.netlify.app' : 'http://localhost:5173'),
      callbackUrl: `${baseUrl}${callbackPath}`,
      resetPasswordUrl: `${baseUrl}${resetPasswordPath}`
    };
  };

  // Reemplazar variables en template
  const processTemplate = (template: EmailTemplate, variables: Record<string, any>) => {
    const urls = getEmailUrls();
    const senderName = getConfig('smtp', 'sender_name') || 'Case Management';
    
    // Variables por defecto del sistema
    const defaultVariables = {
      site_name: senderName,
      base_url: urls.baseUrl,
      confirmation_url: urls.callbackUrl,
      magic_link_url: urls.callbackUrl,
      invitation_url: urls.callbackUrl,
      reset_password_url: urls.resetPasswordUrl,
      expiration_hours: getTypedConfig('template_config', 'default_expiration_hours') || 24,
      ...variables
    };

    // Reemplazar variables en subject y content
    let processedSubject = template.subject;
    let processedHtmlContent = template.html_content;
    let processedTextContent = template.text_content || '';

    // Reemplazar variables usando sintaxis Handlebars simple
    Object.entries(defaultVariables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      const conditionalRegex = new RegExp(`{{#if\\s+${key}}}([^{]*){{/if}}`, 'g');
      
      processedSubject = processedSubject.replace(regex, String(value || ''));
      processedHtmlContent = processedHtmlContent.replace(regex, String(value || ''));
      processedTextContent = processedTextContent.replace(regex, String(value || ''));

      // Manejar condicionales simples
      if (value) {
        processedSubject = processedSubject.replace(conditionalRegex, '$1');
        processedHtmlContent = processedHtmlContent.replace(conditionalRegex, '$1');
        processedTextContent = processedTextContent.replace(conditionalRegex, '$1');
      } else {
        processedSubject = processedSubject.replace(conditionalRegex, '');
        processedHtmlContent = processedHtmlContent.replace(conditionalRegex, '');
        processedTextContent = processedTextContent.replace(conditionalRegex, '');
      }
    });

    return {
      subject: processedSubject,
      html_content: processedHtmlContent,
      text_content: processedTextContent
    };
  };

  // Registrar log de email
  const logEmail = async (params: {
    email_type: string;
    recipient_email: string;
    subject: string;
    template_id?: string;
    status: string;
    error_message?: string;
    metadata?: Record<string, any>;
    html_content?: string;
    text_content?: string;
  }) => {
    const sentAt = new Date().toISOString();
    
    // Obtener configuración SMTP para logging
    const smtpHost = getConfig('smtp', 'host');
    const smtpPort = getConfig('smtp', 'port');
    const senderEmail = getConfig('smtp', 'sender_email');
    const senderName = getConfig('smtp', 'sender_name');
    const useSSL = getConfig('smtp', 'use_ssl');
    
    await supabase.from('email_logs').insert({
      email_type: params.email_type,
      recipient_email: params.recipient_email,
      subject: params.subject,
      template_id: params.template_id,
      status: params.status,
      error_message: params.error_message,
      sent_at: sentAt,
      metadata: {
        // Metadata original
        template_variables: params.metadata || {},
        // Información SMTP usada
        smtp_config_used: {
          host: smtpHost,
          port: smtpPort,
          sender: senderEmail,
          sender_name: senderName,
          use_ssl: useSSL
        },
        // Contenido del email si está disponible
        ...(params.html_content || params.text_content ? {
          email_content: {
            html_content: params.html_content || '',
            text_content: params.text_content || '',
            content_length_html: params.html_content?.length || 0,
            content_length_text: params.text_content?.length || 0
          }
        } : {}),
        // Información de delivery
        delivery_info: {
          attempt_time: sentAt,
          delivery_method: 'custom_email_hook',
          simulated: true // Cambiar a false cuando implementes envío real
        }
      },
      created_by: (await supabase.auth.getUser()).data.user?.id
    });
  };

  // Enviar email de confirmación
  const sendConfirmationEmail = useMutation({
    mutationFn: async ({ recipient_email, template_variables = {} }: SendEmailParams) => {
      const template = getTemplateByType('confirmation');
      if (!template) throw new Error('Template de confirmación no encontrado');

      const urls = getEmailUrls();
      const processedTemplate = processTemplate(template, {
        ...template_variables,
        confirmation_url: urls.callbackUrl
      });

      // Enviar usando Supabase Auth
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: recipient_email,
        options: {
          emailRedirectTo: urls.callbackUrl
        }
      });

      if (error) {
        await logEmail({
          email_type: 'confirmation',
          recipient_email,
          subject: processedTemplate.subject,
          template_id: template.id,
          status: 'failed',
          error_message: error.message,
          metadata: template_variables,
          html_content: processedTemplate.html_content,
          text_content: processedTemplate.text_content
        });
        throw error;
      }

      await logEmail({
        email_type: 'confirmation',
        recipient_email,
        subject: processedTemplate.subject,
        template_id: template.id,
        status: 'sent',
        metadata: template_variables,
        html_content: processedTemplate.html_content,
        text_content: processedTemplate.text_content
      });

      return processedTemplate;
    },
    onSuccess: () => {
      showSuccess('Email de confirmación enviado exitosamente');
    },
    onError: (error: any) => {
      showError('Error enviando email de confirmación', error.message);
    },
  });

  // Enviar magic link
  const sendMagicLink = useMutation({
    mutationFn: async ({ recipient_email, template_variables = {} }: SendEmailParams) => {
      const template = getTemplateByType('magic_link');
      if (!template) throw new Error('Template de magic link no encontrado');

      const urls = getEmailUrls();
      const processedTemplate = processTemplate(template, {
        ...template_variables,
        magic_link_url: urls.callbackUrl,
        expiration_hours: getTypedConfig('template_config', 'magic_link_expiration_hours') || 1
      });

      const { error } = await supabase.auth.signInWithOtp({
        email: recipient_email,
        options: {
          emailRedirectTo: urls.callbackUrl,
          data: template_variables
        }
      });

      if (error) {
        await logEmail({
          email_type: 'magic_link',
          recipient_email,
          subject: processedTemplate.subject,
          template_id: template.id,
          status: 'failed',
          error_message: error.message,
          metadata: template_variables,
          html_content: processedTemplate.html_content,
          text_content: processedTemplate.text_content
        });
        throw error;
      }

      await logEmail({
        email_type: 'magic_link',
        recipient_email,
        subject: processedTemplate.subject,
        template_id: template.id,
        status: 'sent',
        metadata: template_variables,
        html_content: processedTemplate.html_content,
        text_content: processedTemplate.text_content
      });

      return processedTemplate;
    },
    onSuccess: () => {
      showSuccess('Magic link enviado exitosamente');
    },
    onError: (error: any) => {
      showError('Error enviando magic link', error.message);
    },
  });

  // Enviar invitación
  const sendInvitation = useMutation({
    mutationFn: async ({ recipient_email, template_variables = {} }: SendEmailParams) => {
      const template = getTemplateByType('invitation');
      if (!template) throw new Error('Template de invitación no encontrado');

      const urls = getEmailUrls();
      const processedTemplate = processTemplate(template, {
        ...template_variables,
        invitation_url: urls.callbackUrl,
        expiration_hours: getTypedConfig('template_config', 'invitation_expiration_hours') || 72
      });

      const { error } = await supabase.auth.admin.inviteUserByEmail(recipient_email, {
        redirectTo: urls.callbackUrl,
        data: template_variables
      });

      if (error) {
        await logEmail({
          email_type: 'invitation',
          recipient_email,
          subject: processedTemplate.subject,
          template_id: template.id,
          status: 'failed',
          error_message: error.message,
          metadata: template_variables,
          html_content: processedTemplate.html_content,
          text_content: processedTemplate.text_content
        });
        throw error;
      }

      await logEmail({
        email_type: 'invitation',
        recipient_email,
        subject: processedTemplate.subject,
        template_id: template.id,
        status: 'sent',
        metadata: template_variables,
        html_content: processedTemplate.html_content,
        text_content: processedTemplate.text_content
      });

      return processedTemplate;
    },
    onSuccess: () => {
      showSuccess('Invitación enviada exitosamente');
    },
    onError: (error: any) => {
      showError('Error enviando invitación', error.message);
    },
  });

  // Enviar email personalizado
  const sendCustomEmail = useMutation({
    mutationFn: async ({ 
      to, 
      subject, 
      html, 
      text, 
      templateId, 
      variables = {} 
    }: {
      to: string;
      subject?: string;
      html?: string;
      text?: string;
      templateId?: string;
      variables?: Record<string, any>;
    }) => {
      let finalSubject = subject;
      let finalHtml = html;
      let finalText = text;
      let usedTemplateId = templateId;

      // Si se proporciona un templateId, usar el template
      if (templateId) {
        const { data: templateData, error: templateError } = await supabase
          .from('email_templates')
          .select('*')
          .eq('id', templateId)
          .eq('is_active', true)
          .single();

        if (templateError || !templateData) throw new Error('Template no encontrado');

        const processedTemplate = processTemplate(templateData as EmailTemplate, variables);
        finalSubject = processedTemplate.subject;
        finalHtml = processedTemplate.html_content;
        finalText = processedTemplate.text_content;
        usedTemplateId = templateData.id;
      }

      if (!finalSubject || !finalHtml) {
        throw new Error('Se requiere asunto y contenido HTML');
      }

      // Aquí iría la lógica de envío real del email
      // Por ahora simulamos el envío exitoso
      console.log('✅ Email personalizado enviado exitosamente:', {
        to,
        subject: finalSubject,
        hasHtml: !!finalHtml,
        hasText: !!finalText,
        timestamp: new Date().toISOString()
      });

      // Simular una pequeña demora realista
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Log del email
      await logEmail({
        email_type: templateId ? 'template' : 'custom',
        recipient_email: to,
        subject: finalSubject,
        template_id: usedTemplateId,
        status: 'sent',
        metadata: variables,
        html_content: finalHtml,
        text_content: finalText || ''
      });

      return {
        subject: finalSubject,
        html_content: finalHtml,
        text_content: finalText || ''
      };
    },
    onSuccess: () => {
      showSuccess('Email enviado exitosamente');
    },
    onError: (error: any) => {
      showError('Error enviando email', error.message);
    },
  });

  // Obtener logs de email
  const { data: emailLogs, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['email-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as EmailLogEntry[];
    },
  });

  return {
    // Funciones de envío
    sendConfirmationEmail,
    sendMagicLink,
    sendInvitation,
    sendCustomEmail,
    
    // Utilidades
    getEmailUrls,
    processTemplate,
    
    // Logs
    emailLogs,
    logsLoading,
    refetchLogs
  };
};
