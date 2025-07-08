import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  ArchiveBoxIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useArchive } from '../hooks/useArchive';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { PageWrapper } from '../components/PageWrapper';
import { Button } from '../components/Button';
import { ArchiveModal } from '../components/ArchiveModal';
import { useNotification } from '../components/NotificationSystem';

interface ArchivableItem {
  id: string;
  title: string;
  description?: string;
  type: 'case' | 'todo';
  totalTimeMinutes: number;
  completedAt: string;
  classification?: string;
  priority?: string;
}

export const ArchivableItemsPage: React.FC = () => {
  const { archiveCase, archiveTodo, canArchive } = useArchive();
  const { showSuccess, showError } = useNotification();
  
  const [archivableItems, setArchivableItems] = useState<ArchivableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [canArchiveItems, setCanArchiveItems] = useState(false);
  
  const [archiveModal, setArchiveModal] = useState<{
    isOpen: boolean;
    item: ArchivableItem | null;
    loading: boolean;
  }>({ isOpen: false, item: null, loading: false });

  // Verificar permisos de archivo
  useEffect(() => {
    const checkArchivePermissions = async () => {
      const canArchiveResult = await canArchive();
      setCanArchiveItems(canArchiveResult);
    };
    
    checkArchivePermissions();
  }, [canArchive]);

  // Cargar elementos archivables (simulado - en producción sería desde Supabase)
  useEffect(() => {
    const fetchArchivableItems = async () => {
      setLoading(true);
      try {
        // Aquí iría la llamada real a Supabase usando las funciones RPC
        // get_archivable_cases y get_archivable_todos
        
        // Datos simulados para demostración
        const mockItems: ArchivableItem[] = [
          {
            id: '1',
            title: 'CASO-001',
            description: 'Error en módulo de facturación',
            type: 'case',
            totalTimeMinutes: 120,
            completedAt: '2025-01-05T10:30:00Z',
            classification: 'Media Complejidad'
          },
          {
            id: '2',
            title: 'Revisar documentación API',
            description: 'Actualizar documentación de endpoints',
            type: 'todo',
            totalTimeMinutes: 90,
            completedAt: '2025-01-04T16:45:00Z',
            priority: 'Media'
          }
        ];
        
        setArchivableItems(mockItems);
      } catch (error) {
        showError('Error al cargar elementos archivables', error instanceof Error ? error.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchArchivableItems();
  }, [showError]);

  const handleArchiveRequest = (item: ArchivableItem) => {
    setArchiveModal({
      isOpen: true,
      item,
      loading: false
    });
  };

  const handleArchiveConfirm = async (data: { id: string; type: 'case' | 'todo'; reason?: string }) => {
    if (!archiveModal.item) return;
    
    setArchiveModal(prev => ({ ...prev, loading: true }));
    
    try {
      let result;
      if (data.type === 'case') {
        result = await archiveCase(data);
      } else {
        result = await archiveTodo(data);
      }

      if (result.success) {
        showSuccess(`${data.type === 'case' ? 'Caso' : 'TODO'} archivado exitosamente`);
        // Remover el elemento de la lista
        setArchivableItems(prev => prev.filter(item => item.id !== data.id));
        setArchiveModal({ isOpen: false, item: null, loading: false });
      } else {
        showError('Error al archivar', result.error || 'Error desconocido');
      }
    } catch (error) {
      showError('Error al archivar', error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setArchiveModal(prev => ({ ...prev, loading: false }));
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <PageWrapper>
        <LoadingSpinner />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Elementos Listos para Archivar
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Casos y TODOs completados que pueden ser archivados
            </p>
          </div>
        </div>

        {/* Información */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
          <div className="flex">
            <CheckCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                ¿Qué es el archivo?
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                El archivo permite mover casos y TODOs completados fuera de la vista principal, 
                conservando toda la información de tiempos y datos para futura consulta. 
                Los elementos archivados pueden ser restaurados si es necesario.
              </p>
            </div>
          </div>
        </div>

        {/* Lista de elementos */}
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {archivableItems.length === 0 ? (
              <li className="px-6 py-12 text-center">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  No hay elementos para archivar
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Todos los elementos completados ya han sido archivados.
                </p>
              </li>
            ) : (
              archivableItems.map((item) => (
                <li key={item.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                        item.type === 'case' 
                          ? 'bg-blue-100 dark:bg-blue-900' 
                          : 'bg-green-100 dark:bg-green-900'
                      }`}>
                        {item.type === 'case' ? (
                          <CheckCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        ) : (
                          <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                        )}
                      </div>
                      
                      <div className="ml-4 flex-1 min-w-0">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.title}
                          </p>
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            item.type === 'case'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {item.type === 'case' ? 'Caso' : 'TODO'}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {item.description || 'Sin descripción'}
                        </p>
                        
                        <div className="flex items-center mt-2 space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {formatTime(item.totalTimeMinutes)}
                          </div>
                          <div>
                            Completado: {formatDate(item.completedAt)}
                          </div>
                          {item.classification && (
                            <div>
                              Clasificación: {item.classification}
                            </div>
                          )}
                          {item.priority && (
                            <div>
                              Prioridad: {item.priority}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex-shrink-0">
                      {canArchiveItems && (
                        <Button
                          onClick={() => handleArchiveRequest(item)}
                          variant="secondary"
                          size="sm"
                          className="flex items-center space-x-2"
                        >
                          <ArchiveBoxIcon className="w-4 h-4" />
                          <span>Archivar</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      {/* Modal de archivo */}
      <ArchiveModal
        isOpen={archiveModal.isOpen}
        onClose={() => setArchiveModal({ isOpen: false, item: null, loading: false })}
        onConfirm={handleArchiveConfirm}
        loading={archiveModal.loading}
        item={{
          id: archiveModal.item?.id || '',
          title: archiveModal.item?.title || '',
          type: archiveModal.item?.type || 'case'
        }}
      />
    </PageWrapper>
  );
};
