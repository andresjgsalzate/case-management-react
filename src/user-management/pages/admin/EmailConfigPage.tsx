import React, { useState } from 'react';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { SystemConfigurationsManager } from '@/shared/components/email/SystemConfigurationsManager';
import { EmailTemplatesManager } from '@/shared/components/email/EmailTemplatesManager';
import { EmailLogsViewer } from '@/shared/components/email/EmailLogsViewer';
import { EmailTester } from '@/shared/components/email/EmailTester';
import { EmailDiagnostic } from '@/shared/components/EmailDiagnostic';
import { CogIcon, DocumentTextIcon, ClipboardDocumentListIcon, BeakerIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline';

/**
 * Página de configuración de emails para administradores
 * Permite configurar templates de email y configuraciones SMTP
 */
const EmailConfigPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'config' | 'templates' | 'logs' | 'test' | 'diagnostic'>('config');

  const tabs = [
    {
      id: 'config' as const,
      name: 'Configuraciones',
      icon: CogIcon,
      description: 'Configuraciones del sistema de emails'
    },
    {
      id: 'templates' as const,
      name: 'Templates',
      icon: DocumentTextIcon,
      description: 'Gestionar plantillas de email'
    },
    {
      id: 'test' as const,
      name: 'Pruebas',
      icon: BeakerIcon,
      description: 'Enviar emails de prueba y personalizar'
    },
    {
      id: 'diagnostic' as const,
      name: 'Diagnóstico',
      icon: WrenchScrewdriverIcon,
      description: 'Diagnosticar problemas con emails'
    },
    {
      id: 'logs' as const,
      name: 'Logs',
      icon: ClipboardDocumentListIcon,
      description: 'Historial de emails enviados'
    }
  ];

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Sistema de Emails
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Configuración completa del sistema de emails parametrizable
          </p>
        </div>

        {/* Información general */}
        <div className="bg-blue-50 dark:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
            📧 Sistema Parametrizable
          </h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm">
            Este sistema permite configurar todos los aspectos de email sin modificar código. 
            Gestiona configuraciones SMTP, templates personalizables y monitorea el envío de emails desde esta interfaz.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <SystemConfigurationsManager />
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <EmailTemplatesManager />
              </div>
            </div>
          )}

          {activeTab === 'test' && (
            <div className="space-y-6">
              <EmailTester />
            </div>
          )}

          {activeTab === 'diagnostic' && (
            <div className="space-y-6">
              <EmailDiagnostic />
            </div>
          )}

          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <EmailLogsViewer />
              </div>
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            ℹ️ Información del Sistema
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• <strong>Configuraciones:</strong> Parámetros SMTP, URLs y límites de envío</li>
            <li>• <strong>Templates:</strong> Plantillas HTML/texto con variables dinámicas</li>
            <li>• <strong>Pruebas:</strong> Envío de emails personalizados y pruebas de conectividad</li>
            <li>• <strong>Logs:</strong> Seguimiento completo de emails enviados y errores</li>
            <li>• <strong>Variables automáticas:</strong> URLs se ajustan según entorno (desarrollo/producción)</li>
            <li>• <strong>Rate limiting:</strong> Configurado para prevenir spam</li>
          </ul>
        </div>
      </div>
    </PageWrapper>
  );
};

export default EmailConfigPage;
