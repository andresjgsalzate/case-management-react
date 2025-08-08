import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Modal } from '@/shared/components/ui/Modal';
import { useEmailTemplatesConfig } from '@/shared/hooks/useEmailAuth';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';
import { CogIcon, EnvelopeIcon, EyeIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

interface EmailTemplateConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailTemplateConfig: React.FC<EmailTemplateConfigProps> = ({
  isOpen,
  onClose
}) => {
  const [accessToken, setAccessToken] = useState('');
  const [projectRef, setProjectRef] = useState('');
  const [showCurrentConfig, setShowCurrentConfig] = useState(false);
  const { showSuccess, showError } = useNotification();

  const {
    currentConfig,
    isLoading,
    configureTemplates,
    refetch
  } = useEmailTemplatesConfig(accessToken, projectRef);

  const handleConfigureTemplates = async () => {
    if (!accessToken.trim() || !projectRef.trim()) {
      showError('Debes proporcionar el Access Token y Project Reference');
      return;
    }

    try {
      await configureTemplates.mutateAsync();
      showSuccess('Plantillas de email configuradas exitosamente');
    } catch (error) {
      showError('Error configurando plantillas', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleViewCurrentConfig = async () => {
    if (!accessToken.trim() || !projectRef.trim()) {
      showError('Debes proporcionar el Access Token y Project Reference');
      return;
    }

    try {
      await refetch();
      setShowCurrentConfig(true);
    } catch (error) {
      showError('Error obteniendo configuración', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuración de Plantillas de Email" size="lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/20 mb-4">
            <CogIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Configura las plantillas de email personalizadas para todos los flujos de autenticación.
          </p>
        </div>

        {/* Configuración de credenciales */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-3">
            🔑 Credenciales de administrador
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Access Token
              </label>
              <Input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="Tu access token de Supabase"
                helperText="Obtén el token desde: https://supabase.com/dashboard/account/tokens"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Reference
              </label>
              <Input
                type="text"
                value={projectRef}
                onChange={(e) => setProjectRef(e.target.value)}
                placeholder="tu-project-ref"
                helperText="Referencia de tu proyecto de Supabase (ej: abc123xyz)"
              />
            </div>
          </div>
        </div>

        {/* Información de las plantillas */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-3">
            📧 Plantillas que se configurarán:
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { name: 'Confirmar registro', desc: 'Email de confirmación para nuevos usuarios' },
              { name: 'Enlace mágico', desc: 'Login sin contraseña' },
              { name: 'Recuperar contraseña', desc: 'Restablecimiento de contraseña' },
              { name: 'Invitar usuario', desc: 'Invitaciones de equipo' },
              { name: 'Cambiar email', desc: 'Confirmación de cambio de email' }
            ].map((template, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-md p-3 border border-blue-200 dark:border-blue-700">
                <div className="flex items-start space-x-2">
                  <EnvelopeIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{template.name}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{template.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Características de las plantillas */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">
            ✨ Características incluidas:
          </h3>
          
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li>• 🎨 Diseño responsive y profesional</li>
            <li>• 🌙 Soporte para modo oscuro</li>
            <li>• 🏢 Branding personalizado del sistema</li>
            <li>• 🔒 Enlaces seguros con expiración</li>
            <li>• 📱 Optimizado para móviles</li>
            <li>• 🌐 Textos en español</li>
            <li>• 💡 Instrucciones claras para usuarios</li>
          </ul>
        </div>

        {/* Acciones */}
        <div className="space-y-3">
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleViewCurrentConfig}
              disabled={!accessToken || !projectRef || isLoading}
              className="flex-1"
            >
              <EyeIcon className="h-4 w-4 mr-2" />
              {isLoading ? 'Cargando...' : 'Ver configuración actual'}
            </Button>
            
            <Button
              onClick={handleConfigureTemplates}
              disabled={!accessToken || !projectRef || configureTemplates.isPending}
              className="flex-1"
            >
              <CodeBracketIcon className="h-4 w-4 mr-2" />
              {configureTemplates.isPending ? 'Configurando...' : 'Aplicar plantillas'}
            </Button>
          </div>

          <Button
            variant="secondary"
            onClick={onClose}
            className="w-full"
          >
            Cerrar
          </Button>
        </div>

        {/* Configuración actual */}
        {showCurrentConfig && currentConfig && (
          <div className="border-t dark:border-gray-700 pt-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Configuración actual:
            </h3>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 max-h-60 overflow-y-auto">
              <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(currentConfig, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Advertencias */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
            ⚠️ Importante:
          </h3>
          <ul className="text-xs text-red-700 dark:text-red-300 space-y-1">
            <li>• Esto sobrescribirá las plantillas existentes en Supabase</li>
            <li>• Guarda una copia de seguridad antes de aplicar cambios</li>
            <li>• Solo usuarios con permisos de administrador pueden hacer esto</li>
            <li>• Los cambios se aplicarán inmediatamente a todos los usuarios</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};
