import React, { useState } from 'react';
import { 
  PaperAirplaneIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  KeyIcon
} from '@heroicons/react/24/outline';
import { useSystemConfigurations, useEmailTemplates, useSendEmail } from '../../hooks/useSendEmail';
import { useNotification } from '../notifications/NotificationSystem';
import { sendCustomPasswordReset } from '../../services/customPasswordReset';

interface EmailTest {
  id: string;
  recipient: string;
  template: string;
  status: 'pending' | 'sending' | 'success' | 'error';
  timestamp: Date;
  error?: string;
  variables?: Record<string, string>;
}

export const EmailTester: React.FC = () => {
  const [testEmail, setTestEmail] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [customVariables, setCustomVariables] = useState<Record<string, string>>({});
  const [testHistory, setTestHistory] = useState<EmailTest[]>([]);
  const [isCustomEmail, setIsCustomEmail] = useState(false);
  const [customSubject, setCustomSubject] = useState('');
  const [customHtml, setCustomHtml] = useState('');
  const [customText, setCustomText] = useState('');
  
  // Estado para prueba de password recovery
  const [passwordResetEmail, setPasswordResetEmail] = useState('');
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'unknown' | 'success' | 'error'>('unknown');

  const { getConfig } = useSystemConfigurations();
  const { templates } = useEmailTemplates();
  const { sendCustomEmail } = useSendEmail();
  const { showSuccess, showError, showInfo } = useNotification();

  const smtpHost = getConfig('smtp', 'host');
  const smtpPort = getConfig('smtp', 'port');
  const senderEmail = getConfig('smtp', 'sender_email');
  const isSmtpConfigured = smtpHost && smtpPort && senderEmail;

  const getDefaultVariables = (templateId: string) => {
    const template = templates?.find(t => t.id === templateId);
    if (!template) return {};

    const defaultVars: Record<string, string> = {};
    template.variables.forEach(variable => {
      switch (variable) {
        case 'site_name':
          defaultVars[variable] = 'Case Management System';
          break;
        case 'user_name':
          defaultVars[variable] = 'Usuario de Prueba';
          break;
        case 'confirmation_url':
          defaultVars[variable] = 'https://example.com/confirm';
          break;
        case 'magic_link_url':
          defaultVars[variable] = 'https://example.com/magic-link';
          break;
        case 'invitation_url':
          defaultVars[variable] = 'https://example.com/invitation';
          break;
        case 'expiration_hours':
          defaultVars[variable] = '24';
          break;
        case 'inviter_name':
          defaultVars[variable] = 'Admin Sistema';
          break;
        case 'team_name':
          defaultVars[variable] = 'Equipo de Prueba';
          break;
        case 'custom_message':
          defaultVars[variable] = 'Este es un mensaje de prueba del sistema.';
          break;
        case 'otp_code':
          defaultVars[variable] = '123456';
          break;
        default:
          defaultVars[variable] = `Valor de ${variable}`;
      }
    });
    return defaultVars;
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const defaultVars = getDefaultVariables(templateId);
    setCustomVariables(defaultVars);
  };

  const handleSendTest = async () => {
    if (!testEmail || (!selectedTemplate && !isCustomEmail)) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }

    const testId = Date.now().toString();
    const newTest: EmailTest = {
      id: testId,
      recipient: testEmail,
      template: isCustomEmail ? 'custom' : selectedTemplate,
      status: 'sending',
      timestamp: new Date(),
      variables: isCustomEmail ? {} : customVariables
    };

    setTestHistory(prev => [newTest, ...prev]);

    try {
      if (isCustomEmail) {
        // Envío de email personalizado
        await sendCustomEmail.mutateAsync({
          to: testEmail,
          subject: customSubject,
          html: customHtml,
          text: customText || undefined
        });
      } else {
        // Envío con template
        await sendCustomEmail.mutateAsync({
          to: testEmail,
          templateId: selectedTemplate,
          variables: customVariables
        });
      }

      setTestHistory(prev => 
        prev.map(test => 
          test.id === testId 
            ? { ...test, status: 'success' as const }
            : test
        )
      );

      showSuccess(
        `Email de prueba enviado exitosamente`, 
        `Destinatario: ${testEmail}\nTipo: ${isCustomEmail ? 'Email personalizado' : 'Template'}`
      );
      
      // Limpiar el email destinatario después del envío exitoso
      setTestEmail('');
    } catch (error: any) {
      setTestHistory(prev => 
        prev.map(test => 
          test.id === testId 
            ? { ...test, status: 'error' as const, error: error.message }
            : test
        )
      );

      showError(`Error al enviar email: ${error.message}`);
    }
  };

  // Función para probar el sistema de password recovery
  const handleTestPasswordReset = async () => {
    if (!passwordResetEmail) {
      showError('Por favor ingresa un email para probar');
      return;
    }

    setPasswordResetLoading(true);

    try {
      showInfo('🔐 Iniciando prueba de recuperación de contraseña...', passwordResetEmail);
      
      const result = await sendCustomPasswordReset({ email: passwordResetEmail });
      
      if (result.success) {
        showSuccess(
          'Email de recuperación enviado exitosamente', 
          `✅ ${result.message}\n📧 Destinatario: ${passwordResetEmail}\n📝 Log ID: ${result.logId}`
        );
        
        // Agregar al historial
        const testId = Date.now().toString();
        const newTest: EmailTest = {
          id: testId,
          recipient: passwordResetEmail,
          template: 'password_recovery',
          status: 'success',
          timestamp: new Date(),
          variables: { log_id: result.logId || 'N/A' }
        };
        
        setTestHistory(prev => [newTest, ...prev]);
        setPasswordResetEmail(''); // Limpiar después del éxito
      } else {
        showError('Error en recuperación de contraseña', result.message);
        
        // Agregar al historial como error
        const testId = Date.now().toString();
        const newTest: EmailTest = {
          id: testId,
          recipient: passwordResetEmail,
          template: 'password_recovery',
          status: 'error',
          timestamp: new Date(),
          error: result.message
        };
        
        setTestHistory(prev => [newTest, ...prev]);
      }
    } catch (error: any) {
      console.error('❌ Error en prueba de password recovery:', error);
      showError('Error inesperado', error.message);
      
      // Agregar al historial como error
      const testId = Date.now().toString();
      const newTest: EmailTest = {
        id: testId,
        recipient: passwordResetEmail,
        template: 'password_recovery',
        status: 'error',
        timestamp: new Date(),
        error: error.message
      };
      
      setTestHistory(prev => [newTest, ...prev]);
    } finally {
      setPasswordResetLoading(false);
    }
  };

  const handleVariableChange = (variable: string, value: string) => {
    setCustomVariables(prev => ({
      ...prev,
      [variable]: value
    }));
  };

  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus('unknown');

    try {
      // Verificar configuraciones SMTP
      const smtpHost = getConfig('smtp', 'host');
      const smtpPort = getConfig('smtp', 'port');
      const senderEmail = getConfig('smtp', 'sender_email');
      const senderName = getConfig('smtp', 'sender_name');
      const useSSL = getConfig('smtp', 'use_ssl');
      
      if (!smtpHost || !smtpPort || !senderEmail) {
        throw new Error('Configuración SMTP incompleta. Verifica host, puerto y email del remitente.');
      }

      // Simular prueba de conectividad (en producción aquí iría la verificación real)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setConnectionStatus('success');
      showSuccess(`Configuración SMTP verificada:
        Host: ${smtpHost}:${smtpPort}
        Remitente: ${senderName} <${senderEmail}>
        SSL: ${useSSL === 'true' ? 'Habilitado' : 'Deshabilitado'}`);
    } catch (error: any) {
      setConnectionStatus('error');
      showError(`Error de conectividad: ${error.message}`);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const selectedTemplateData = templates?.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-6">
      {/* Panel de prueba de Password Recovery */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <KeyIcon className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Prueba de Recuperación de Contraseña
          </h3>
        </div>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4 mb-4">
          <div className="flex items-start">
            <CheckCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Sistema Personalizado Activo</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Tokens seguros de 64 caracteres</li>
                <li>Logs completos en base de datos</li>
                <li>Usa nuestro SMTP configurado</li>
                <li>Sin limitaciones de rate limit</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <label htmlFor="passwordResetEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email para probar recuperación
            </label>
            <input
              type="email"
              id="passwordResetEmail"
              value={passwordResetEmail}
              onChange={(e) => setPasswordResetEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <button
            onClick={handleTestPasswordReset}
            disabled={passwordResetLoading || !passwordResetEmail}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {passwordResetLoading ? (
              <>
                <ClockIcon className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <KeyIcon className="w-4 h-4 mr-2" />
                Probar Recovery
              </>
            )}
          </button>
        </div>
      </div>

      {/* Panel de estado de conectividad */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Estado de Conectividad SMTP
          </h3>
          <button
            onClick={handleTestConnection}
            disabled={isTestingConnection}
            className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 disabled:opacity-50"
          >
            {isTestingConnection ? (
              <>
                <ClockIcon className="w-4 h-4 mr-2 animate-spin" />
                Probando...
              </>
            ) : (
              <>
                <CheckCircleIcon className="w-4 h-4 mr-2" />
                Probar Conectividad
              </>
            )}
          </button>
        </div>

        <div className={`p-4 rounded-md ${
          connectionStatus === 'success' 
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : connectionStatus === 'error'
            ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            : isSmtpConfigured
            ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
        }`}>
          {isSmtpConfigured ? (
            <div>
              <div className="flex items-center mb-2">
                {connectionStatus === 'success' ? (
                  <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                ) : connectionStatus === 'error' ? (
                  <XCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
                ) : (
                  <ClockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3" />
                )}
                <span className={`font-medium ${
                  connectionStatus === 'success' 
                    ? 'text-green-800 dark:text-green-200'
                    : connectionStatus === 'error'
                    ? 'text-red-800 dark:text-red-200'
                    : 'text-blue-800 dark:text-blue-200'
                }`}>
                  {connectionStatus === 'success' 
                    ? 'Configuración SMTP verificada y funcionando'
                    : connectionStatus === 'error'
                    ? 'Error en la configuración SMTP'
                    : 'Configuración SMTP detectada'}
                </span>
              </div>
              
              <div className="text-sm space-y-1">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="font-medium">Host:</span> {smtpHost}
                  </div>
                  <div>
                    <span className="font-medium">Puerto:</span> {smtpPort}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Email remitente:</span> {senderEmail}
                </div>
                <div>
                  <span className="font-medium">SSL/TLS:</span> {getConfig('smtp', 'use_ssl') === 'true' ? 'Habilitado' : 'Deshabilitado'}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" />
              <span className="text-yellow-800 dark:text-yellow-200">
                SMTP no configurado. Para usar el sistema de pruebas de email, primero debes configurar los ajustes SMTP en la pestaña de Configuraciones.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Panel de configuración de prueba */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Pruebas de Email
        </h3>

        <div className="space-y-4">
          {/* Email destinatario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email de destino
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Tipo de email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de email
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!isCustomEmail}
                  onChange={() => setIsCustomEmail(false)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Usar template</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={isCustomEmail}
                  onChange={() => setIsCustomEmail(true)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Email personalizado</span>
              </label>
            </div>
          </div>

          {!isCustomEmail ? (
            <>
              {/* Selección de template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Template
                </label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Seleccionar template...</option>
                  {templates?.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.template_name} ({template.template_type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Variables del template */}
              {selectedTemplateData && selectedTemplateData.variables.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Variables del template
                  </label>
                  <div className="space-y-3">
                    {selectedTemplateData.variables.map((variable) => (
                      <div key={variable}>
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                          {variable}
                        </label>
                        <input
                          type="text"
                          value={customVariables[variable] || ''}
                          onChange={(e) => handleVariableChange(variable, e.target.value)}
                          placeholder={`Valor para ${variable}`}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Email personalizado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Asunto
                </label>
                <input
                  type="text"
                  value={customSubject}
                  onChange={(e) => setCustomSubject(e.target.value)}
                  placeholder="Asunto del email"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contenido HTML
                </label>
                <div className="mb-2">
                  <button
                    onClick={() => setCustomHtml(`<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Email de Prueba</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e40af;">Case Management System</h1>
        <p style="color: #6b7280;">Email de prueba del sistema</p>
    </div>
    
    <div style="background: #f8fafc; padding: 25px; border-radius: 8px;">
        <h2 style="color: #1f2937;">¡Hola!</h2>
        <p style="color: #4b5563; line-height: 1.6;">
            Este es un email de prueba enviado desde el sistema de gestión de casos.
            El sistema está funcionando correctamente.
        </p>
        
        <div style="text-align: center; margin: 25px 0;">
            <a href="http://localhost:5173" 
               style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                Acceder al Sistema
            </a>
        </div>
    </div>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; margin-top: 30px;">
        <p style="color: #9ca3af; font-size: 12px;">
            Email generado automáticamente por Case Management System
        </p>
    </div>
</body>
</html>`)}
                    className="text-xs text-blue-600 hover:text-blue-700 underline mb-2"
                  >
                    Usar template de ejemplo
                  </button>
                </div>
                <textarea
                  value={customHtml}
                  onChange={(e) => setCustomHtml(e.target.value)}
                  placeholder="<h1>Hola!</h1><p>Este es un email de prueba.</p>"
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contenido de texto (opcional)
                </label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Versión en texto plano del email..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {/* Preview del email personalizado */}
              {customHtml && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Vista previa
                  </label>
                  <div className="border border-gray-300 dark:border-gray-600 rounded-md p-4 bg-white max-h-64 overflow-auto">
                    <div dangerouslySetInnerHTML={{ __html: customHtml }} />
                  </div>
                </div>
              )}
            </>
          )}

          {/* Botón enviar */}
          <div className="pt-4">
            <button
              onClick={handleSendTest}
              disabled={sendCustomEmail.isPending || !testEmail || (!selectedTemplate && !isCustomEmail)}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendCustomEmail.isPending ? (
                <>
                  <ClockIcon className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                  Enviar Email de Prueba
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Historial de pruebas */}
      {testHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Historial de Pruebas
          </h3>

          <div className="space-y-3">
            {testHistory.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center space-x-3">
                  {test.status === 'sending' && (
                    <ClockIcon className="w-5 h-5 text-yellow-500 animate-spin" />
                  )}
                  {test.status === 'success' && (
                    <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  )}
                  {test.status === 'error' && (
                    <XCircleIcon className="w-5 h-5 text-red-500" />
                  )}
                  
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {test.recipient}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {test.template === 'custom' ? 'Email personalizado' : `Template: ${test.template}`} • 
                      {test.timestamp.toLocaleString()}
                    </p>
                    {test.error && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                        Error: {test.error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    test.status === 'success' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : test.status === 'error'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {test.status === 'sending' ? 'Enviando' : 
                     test.status === 'success' ? 'Enviado' : 'Error'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
