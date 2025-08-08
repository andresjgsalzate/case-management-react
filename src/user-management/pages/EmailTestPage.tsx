import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { useSystemConfigurations, useSendEmail } from '@/shared/hooks/useSendEmail';
import { supabase } from '@/shared/lib/supabase';
import { testEmailSystem } from '@/utils/testEmailSystem';

interface TestResult {
  test: string;
  success: boolean;
  data?: any;
  error?: string;
  details?: any;
}

export const EmailTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testEmail, setTestEmail] = useState('andresjgsalzate@gmail.com');
  
  const { configurations, isLoading: configsLoading } = useSystemConfigurations();
  const { sendMagicLink, sendCustomEmail } = useSendEmail();

  const runSystemTests = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Ejecutando pruebas del sistema de email...');
      const results = await testEmailSystem();
      setTestResults(results);
    } catch (error) {
      console.error('❌ Error ejecutando pruebas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testMagicLink = async () => {
    if (!testEmail) return;
    
    try {
      console.log('🔗 Enviando magic link de prueba...');
      await sendMagicLink.mutateAsync({
        email_type: 'magic_link',
        recipient_email: testEmail,
        template_variables: {
          user_name: 'Usuario de Prueba',
          test_mode: true
        }
      });
    } catch (error) {
      console.error('❌ Error enviando magic link:', error);
    }
  };

  const testCustomEmail = async () => {
    if (!testEmail) return;

    try {
      console.log('📧 Enviando email personalizado de prueba...');
      await sendCustomEmail.mutateAsync({
        to: testEmail,
        subject: 'Prueba del Sistema de Email - Case Management',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">¡Prueba Exitosa!</h2>
            <p>Este email fue enviado como prueba del sistema de emails de Case Management.</p>
            <p><strong>Configuración SMTP:</strong> Hostinger</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
            <hr>
            <p style="font-size: 12px; color: #666;">
              Sistema de Gestión de Casos v2.10.0
            </p>
          </div>
        `,
        text: `
¡Prueba Exitosa!

Este email fue enviado como prueba del sistema de emails de Case Management.

Configuración SMTP: Hostinger
Fecha: ${new Date().toLocaleString()}

Sistema de Gestión de Casos v2.10.0
        `,
        variables: {
          test_mode: true,
          sent_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('❌ Error enviando email personalizado:', error);
    }
  };

  const checkSmtpPassword = async () => {
    try {
      console.log('🔑 Verificando contraseña SMTP...');
      const { data, error } = await supabase
        .rpc('get_decrypted_credential', { p_key: 'smtp_password' });

      if (error) throw error;
      
      console.log('✅ Contraseña SMTP:', data ? 'Configurada correctamente' : 'No encontrada');
      alert(`Contraseña SMTP: ${data ? 'Configurada correctamente' : 'No encontrada'}`);
    } catch (error: any) {
      console.error('❌ Error verificando contraseña:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const getStatusIcon = (success: boolean) => success ? '✅' : '❌';
  const getStatusColor = (success: boolean) => success ? 'text-green-600' : 'text-red-600';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🧪 Pruebas del Sistema de Email
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Panel de diagnóstico y pruebas para el sistema de emails SMTP
          </p>
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button
            onClick={runSystemTests}
            loading={isLoading}
            variant="primary"
            className="w-full"
          >
            🔍 Ejecutar Diagnóstico
          </Button>
          
          <Button
            onClick={checkSmtpPassword}
            variant="secondary"
            className="w-full"
          >
            🔑 Verificar SMTP
          </Button>
          
          <Button
            onClick={testMagicLink}
            loading={sendMagicLink.isPending}
            variant="outline"
            className="w-full"
          >
            🔗 Probar Magic Link
          </Button>
          
          <Button
            onClick={testCustomEmail}
            loading={sendCustomEmail.isPending}
            variant="outline"
            className="w-full"
          >
            📧 Probar Email Custom
          </Button>
        </div>

        {/* Campo de email de prueba */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">📮 Email de Prueba</h3>
          <div className="flex gap-4">
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="Email para pruebas"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500 self-center">
              Para envío de emails de prueba
            </span>
          </div>
        </div>

        {/* Configuraciones actuales */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">⚙️ Configuraciones SMTP Actuales</h3>
          {configsLoading ? (
            <p>Cargando configuraciones...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {configurations
                ?.filter(config => config.category === 'smtp')
                .map(config => (
                  <div key={config.key} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                    <div className="font-medium text-sm text-gray-700 dark:text-gray-300">
                      {config.key}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {config.key === 'password' ? '••••••••' : config.value}
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* Resultados de pruebas */}
        {testResults.length > 0 && (
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">📊 Resultados del Diagnóstico</h3>
            
            {/* Resumen */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Resumen:</span>
                <div className="flex gap-4">
                  <span className="text-green-600">
                    ✅ {testResults.filter(r => r.success).length} exitosas
                  </span>
                  <span className="text-red-600">
                    ❌ {testResults.filter(r => !r.success).length} fallidas
                  </span>
                </div>
              </div>
            </div>

            {/* Detalles de cada prueba */}
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className={`font-medium ${getStatusColor(result.success)}`}>
                      {getStatusIcon(result.success)} {result.test}
                    </h4>
                  </div>
                  
                  {result.error && (
                    <div className="text-red-600 text-sm mb-2">
                      Error: {result.error}
                    </div>
                  )}
                  
                  {result.details && (
                    <details className="text-sm text-gray-600 dark:text-gray-400">
                      <summary className="cursor-pointer font-medium mb-2">
                        Ver detalles
                      </summary>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instrucciones */}
        <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">📋 Instrucciones</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>1. Ejecutar Diagnóstico:</strong> Verifica todas las configuraciones del sistema</p>
            <p><strong>2. Verificar SMTP:</strong> Confirma que la contraseña SMTP esté configurada</p>
            <p><strong>3. Probar Magic Link:</strong> Envía un enlace mágico usando Supabase Auth</p>
            <p><strong>4. Probar Email Custom:</strong> Envía un email personalizado (simulado)</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Sistema de Gestión de Casos v2.10.0 | Diagnóstico de Emails SMTP</p>
        </div>
      </div>
    </div>
  );
};
