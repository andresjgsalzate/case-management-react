/**
 * =================================================================
 * COMPONENTE: EDITOR DE DOCUMENTACIÓN MEJORADO V3
 * =================================================================
 * Descripción: Editor completo con etiquetas, validación de casos y metadatos
 * Versión: 3.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { YooptaContentValue } from '@yoopta/editor';
import { YooptaDocumentEditor, createEmptyYooptaContent } from './YooptaDocumentEditor';
import { TagSelector } from '../TagSelector';
import { CaseValidator } from '../CaseValidator';
import { useDocumentation } from '../../../hooks/useDocumentation';
import type { 
  SolutionDocument, 
  SolutionType, 
  CaseReferenceType,
  CreateSolutionDocumentRequest,
  UpdateSolutionDocumentRequest 
} from '../../../types';
import { Save, X, FileText, Trash2 } from 'lucide-react';
import { SOLUTION_TYPES, DIFFICULTY_LEVELS } from '../../../types';

interface EnhancedDocumentationEditorProps {
  document?: SolutionDocument;
  caseId?: string;
  onSave?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
}

export const EnhancedDocumentationEditor: React.FC<EnhancedDocumentationEditorProps> = ({
  document,
  caseId,
  onSave,
  onCancel,
  onDelete,
  showDeleteButton = !!document
}) => {
  const { createDocument, updateDocument } = useDocumentation();

  // ===== ESTADOS DEL FORMULARIO =====
  const [formData, setFormData] = useState({
    title: document?.title || 'Nuevo Documento de Solución',
    solution_type: (document?.solution_type || 'solution') as SolutionType,
    difficulty_level: document?.difficulty_level || 1,
    complexity_notes: document?.complexity_notes || '',
    prerequisites: document?.prerequisites || '',
    estimated_solution_time: document?.estimated_solution_time || undefined,
    is_template: document?.is_template || false,
    is_published: document?.is_published || false,
    case_id: document?.case_id || caseId,
    archived_case_id: document?.archived_case_id,
    case_reference_type: (document?.case_reference_type || 'active') as CaseReferenceType,
    selected_tag_ids: document?.tags?.map(tag => tag.id) || [],
  });

  const [yooptaContent, setYooptaContent] = useState<YooptaContentValue>(() => 
    document?.content || createEmptyYooptaContent()
  );

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  // ===== HANDLERS =====
  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCaseChange = (referenceType: CaseReferenceType, caseId?: string, archivedCaseId?: string) => {
    setFormData(prev => ({
      ...prev,
      case_reference_type: referenceType,
      case_id: caseId,
      archived_case_id: archivedCaseId,
    }));
  };

  const handleTagsChange = (tagIds: string[]) => {
    setFormData(prev => ({ ...prev, selected_tag_ids: tagIds }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('El título es requerido');
      return;
    }

    setIsLoading(true);
    setError(undefined);

    try {
      const documentData: CreateSolutionDocumentRequest | UpdateSolutionDocumentRequest = {
        title: formData.title.trim(),
        content: yooptaContent,
        solution_type: formData.solution_type,
        difficulty_level: formData.difficulty_level,
        complexity_notes: formData.complexity_notes || undefined,
        prerequisites: formData.prerequisites || undefined,
        estimated_solution_time: formData.estimated_solution_time,
        is_template: formData.is_template,
        is_published: formData.is_published,
        case_id: formData.case_id,
        archived_case_id: formData.archived_case_id,
        case_reference_type: formData.case_reference_type,
        tag_ids: formData.selected_tag_ids,
      };

      if (document) {
        await updateDocument(document.id, documentData as UpdateSolutionDocumentRequest);
      } else {
        await createDocument(documentData as CreateSolutionDocumentRequest);
      }
      
      onSave?.();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al guardar documento');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex-none bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {document ? 'Editar Documento' : 'Nuevo Documento'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {showDeleteButton && onDelete && (
              <Button 
                variant="outline" 
                onClick={onDelete} 
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </Button>
            )}
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
            <Button 
              onClick={handleSave}
              disabled={isLoading || !formData.title.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mt-3 p-3 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-md">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-auto p-6">
        <div className="w-full max-w-none mx-auto space-y-6">
          
          {/* Información básica */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Información del Documento</h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Título del Documento *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="Ingresa el título del documento"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Tipo de solución y dificultad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Documento
                  </label>
                  <select
                    value={formData.solution_type}
                    onChange={(e) => updateFormData('solution_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {SOLUTION_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.description}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nivel de Dificultad
                  </label>
                  <select
                    value={formData.difficulty_level}
                    onChange={(e) => updateFormData('difficulty_level', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    {DIFFICULTY_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {'⭐'.repeat(level.value)} {level.label} - {level.description}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tiempo estimado y notas de complejidad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tiempo Estimado (minutos)
                  </label>
                  <input
                    type="number"
                    value={formData.estimated_solution_time || ''}
                    onChange={(e) => updateFormData('estimated_solution_time', e.target.value ? parseInt(e.target.value) : undefined)}
                    placeholder="Ej: 30"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notas de Complejidad
                  </label>
                  <input
                    type="text"
                    value={formData.complexity_notes}
                    onChange={(e) => updateFormData('complexity_notes', e.target.value)}
                    placeholder="Notas adicionales sobre la dificultad"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Prerrequisitos */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prerrequisitos
                </label>
                <textarea
                  value={formData.prerequisites}
                  onChange={(e) => updateFormData('prerequisites', e.target.value)}
                  placeholder="Describe los prerrequisitos necesarios para aplicar esta solución"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Opciones */}
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_template}
                    onChange={(e) => updateFormData('is_template', e.target.checked)}
                    className="mr-2"
                  />
                  Es una plantilla
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => updateFormData('is_published', e.target.checked)}
                    className="mr-2"
                  />
                  Publicar documento
                </label>
              </div>
            </div>
          </div>

          {/* Validador de casos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Caso Relacionado</h3>
            </div>
            <div className="p-6">
              <CaseValidator
                selectedCaseId={formData.case_id}
                selectedArchivedCaseId={formData.archived_case_id}
                caseReferenceType={formData.case_reference_type}
                onCaseChange={handleCaseChange}
              />
            </div>
          </div>

          {/* Selector de etiquetas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Etiquetas</h3>
            </div>
            <div className="p-6">
              <TagSelector
                selectedTagIds={formData.selected_tag_ids}
                onTagsChange={handleTagsChange}
              />
            </div>
          </div>

          {/* Editor principal */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Contenido del Documento</h3>
            </div>
            <div className="p-0">
              <YooptaDocumentEditor
                value={yooptaContent}
                onChange={setYooptaContent}
                placeholder="Comienza a escribir tu documento aquí..."
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
