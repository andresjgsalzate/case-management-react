import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Modal } from '@/shared/components/ui/Modal';
import { useSystemConfigurations } from '@/shared/hooks/useSendEmail';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';
import { 
  CogIcon, 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  InformationCircleIcon 
} from '@heroicons/react/24/outline';

interface ConfigEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: {
    category: string;
    key: string;
    value: string;
    data_type: string;
    description?: string;
  } | null;
}

const ConfigEditModal: React.FC<ConfigEditModalProps> = ({ isOpen, onClose, config }) => {
  const [value, setValue] = useState(config?.value || '');
  const { updateConfig } = useSystemConfigurations();
  const { showSuccess, showError } = useNotification();

  const handleSave = async () => {
    if (!config) return;

    try {
      await updateConfig.mutateAsync({
        category: config.category,
        key: config.key,
        value
      });
      showSuccess('Configuración actualizada exitosamente');
      onClose();
    } catch (error: any) {
      showError('Error actualizando configuración', error.message);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Configuración">
      <div className="space-y-4">
        {config && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                {config.category}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Clave
              </label>
              <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded">
                {config.key}
              </p>
            </div>

            {config.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {config.description}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Valor ({config.data_type})
              </label>
              {config.data_type === 'boolean' ? (
                <select
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="true">true</option>
                  <option value="false">false</option>
                </select>
              ) : config.data_type === 'number' ? (
                <Input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Ingrese un número"
                />
              ) : (
                <Input
                  type="text"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder="Ingrese el valor"
                />
              )}
            </div>
          </>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={updateConfig.isPending}
          >
            {updateConfig.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export const SystemConfigurationsManager: React.FC = () => {
  const { configurations, isLoading, refetch } = useSystemConfigurations();
  const [editingConfig, setEditingConfig] = useState<any>(null);
  const [filter, setFilter] = useState('');

  // Agrupar configuraciones por categoría
  const groupedConfigs = configurations?.reduce((acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  }, {} as Record<string, any[]>) || {};

  // Filtrar configuraciones
  const filteredGroups = Object.entries(groupedConfigs).reduce((acc, [category, configs]) => {
    const filteredConfigs = configs.filter(config => 
      config.key.toLowerCase().includes(filter.toLowerCase()) ||
      config.description?.toLowerCase().includes(filter.toLowerCase()) ||
      config.value.toLowerCase().includes(filter.toLowerCase())
    );
    
    if (filteredConfigs.length > 0) {
      acc[category] = filteredConfigs;
    }
    
    return acc;
  }, {} as Record<string, any[]>);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'smtp': return '📧';
      case 'urls': return '🔗';
      case 'email_limits': return '⏱️';
      case 'template_config': return '📝';
      default: return '⚙️';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'smtp': return 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800';
      case 'urls': return 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800';
      case 'email_limits': return 'bg-yellow-50 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800';
      case 'template_config': return 'bg-purple-50 dark:bg-purple-900/50 border-purple-200 dark:border-purple-800';
      default: return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando configuraciones...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Configuraciones del Sistema
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Gestiona las configuraciones parametrizables del sistema de emails
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm">
          <CogIcon className="w-4 h-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Filtro */}
      <div className="max-w-md">
        <Input
          type="text"
          placeholder="Buscar configuraciones..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Configuraciones agrupadas */}
      <div className="space-y-6">
        {Object.entries(filteredGroups).map(([category, configs]) => (
          <div key={category} className={`border rounded-lg p-4 ${getCategoryColor(category)}`}>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="text-xl mr-2">{getCategoryIcon(category)}</span>
              {category.replace('_', ' ').toUpperCase()}
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                ({configs.length} configuración{configs.length !== 1 ? 'es' : ''})
              </span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {configs.map((config) => (
                <div
                  key={`${config.category}-${config.key}`}
                  className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900 dark:text-white text-sm">
                        {config.key}
                      </h5>
                      {config.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {config.description}
                        </p>
                      )}
                    </div>
                    {config.is_editable && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingConfig(config)}
                        className="ml-2"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {config.data_type}
                      </span>
                      {!config.is_editable && (
                        <span className="text-xs text-red-500 dark:text-red-400 flex items-center">
                          <InformationCircleIcon className="w-3 h-3 mr-1" />
                          Solo lectura
                        </span>
                      )}
                    </div>
                    <div className="mt-1 p-2 bg-gray-50 dark:bg-gray-600 rounded text-sm text-gray-900 dark:text-white break-all">
                      {config.data_type === 'boolean' ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          config.value === 'true' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {config.value === 'true' ? (
                            <CheckIcon className="w-3 h-3 mr-1" />
                          ) : (
                            <XMarkIcon className="w-3 h-3 mr-1" />
                          )}
                          {config.value}
                        </span>
                      ) : (
                        config.value
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(filteredGroups).length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No se encontraron configuraciones que coincidan con el filtro.
          </p>
        </div>
      )}

      {/* Modal de edición */}
      <ConfigEditModal
        isOpen={!!editingConfig}
        onClose={() => setEditingConfig(null)}
        config={editingConfig}
      />
    </div>
  );
};
