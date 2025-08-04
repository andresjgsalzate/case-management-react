/**
 * =================================================================
 * COMPONENTE: SELECTOR DE PLANTILLAS
 * =================================================================
 * Descripción: Componente para mostrar y seleccionar plantillas
 * disponibles como base para nuevos documentos
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState, useEffect } from 'react';
import { Modal } from '@/shared/components/ui/Modal';
import { Button } from '@/shared/components/ui/Button';
import { useDocumentation } from '../hooks/useDocumentation';
import { useNotesPermissions } from '../hooks/useNotesPermissions';
import { SolutionDocument } from '../types';
import { FileText, Clock, Star, Eye, X, Calendar } from 'lucide-react';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: SolutionDocument) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [templates, setTemplates] = useState<SolutionDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<SolutionDocument | null>(null);
  const { getAvailableTemplates } = useDocumentation();
  const { canViewNotes } = useNotesPermissions();

  // Cargar templates al abrir el modal
  useEffect(() => {
    if (isOpen && canViewNotes) {
      loadTemplates();
    }
  }, [isOpen, canViewNotes]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const availableTemplates = await getAvailableTemplates();
      setTemplates(availableTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
      // Aquí podrías mostrar una notificación de error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (template: SolutionDocument) => {
    setSelectedTemplate(template);
  };

  const handleConfirmSelection = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      onClose();
      setSelectedTemplate(null);
    }
  };

  const handleCancel = () => {
    onClose();
    setSelectedTemplate(null);
  };

  if (!canViewNotes) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Seleccionar Plantilla"
      size="xl"
    >
      <div className="space-y-6">
        {/* Descripción */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Selecciona una plantilla como base para tu nuevo documento. Las plantillas incluyen
          estructura predefinida y contenido de ejemplo.
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-sm text-gray-500">Cargando plantillas...</span>
          </div>
        )}

        {/* Templates List */}
        {!isLoading && (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {templates.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">
                  No hay plantillas disponibles
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                  Crea un documento y márcalo como plantilla para que aparezca aquí
                </p>
              </div>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Título */}
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                        {template.title}
                      </h3>

                      {/* Categoría y tipo */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 text-xs rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                          {template.solution_type}
                        </span>
                        {template.tags && template.tags.length > 0 && (
                          <span className="px-2 py-1 text-xs rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
                            {template.tags[0].name}
                          </span>
                        )}
                      </div>

                      {/* Metadatos */}
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        {/* Dificultad */}
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4" />
                          <span>{'★'.repeat(template.difficulty_level || 1)}</span>
                        </div>

                        {/* Tiempo estimado */}
                        {template.estimated_solution_time && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>~{template.estimated_solution_time} min</span>
                          </div>
                        )}

                        {/* Vistas */}
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{template.view_count || 0}</span>
                        </div>

                        {/* Fecha de creación */}
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(template.created_at).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>

                      {/* Autor */}
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        Por: {template.created_by}
                      </div>

                      {/* Prerrequisitos si existen */}
                      {template.prerequisites && (
                        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm">
                          <strong className="text-yellow-800 dark:text-yellow-200">Prerrequisitos:</strong>
                          <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                            {template.prerequisites}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Indicador de selección */}
                    {selectedTemplate?.id === template.id && (
                      <div className="ml-4 mt-1">
                        <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleCancel}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmSelection}
            disabled={!selectedTemplate}
          >
            <FileText className="h-4 w-4 mr-2" />
            Usar Plantilla
          </Button>
        </div>
      </div>
    </Modal>
  );
};
