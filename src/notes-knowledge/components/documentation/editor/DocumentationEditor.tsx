/**
 * =================================================================
 * COMPONENTE: EDITOR DE DOCUMENTACIÓN BÁSICO
 * =================================================================
 * Descripción: Editor básico simplificado para compatibilidad
 * Versión: 2.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { BlockNoteDocumentEditor, convertFromLegacyToBlockNote } from './BlockNoteDocumentEditor';
import type { SolutionDocument } from '../../../types';
import { Save, X, FileText } from 'lucide-react';

interface DocumentationEditorProps {
  document?: SolutionDocument;
  caseId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export const DocumentationEditor: React.FC<DocumentationEditorProps> = ({
  document,
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(document?.title || 'Nuevo Documento');
  const [blockNoteContent, setBlockNoteContent] = useState(() => 
    document?.content ? convertFromLegacyToBlockNote(document.content) : []
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    // Implementación básica - en producción usar el EnhancedDocumentationEditor
    console.log('Guardando documento:', { title, content: blockNoteContent });
    setIsLoading(true);
    // Simular guardado
    setTimeout(() => {
      setIsLoading(false);
      onSave?.();
    }, 1000);
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header básico */}
      <div className="flex-none bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Editor Básico
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={isLoading}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            )}
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-auto p-6">
        <div className="w-full max-w-4xl mx-auto space-y-6">
          
          {/* Título básico */}
          <div>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Título del documento"
              className="w-full px-4 py-2 text-lg font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Editor */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
            <BlockNoteDocumentEditor
              value={blockNoteContent}
              onChange={setBlockNoteContent}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
