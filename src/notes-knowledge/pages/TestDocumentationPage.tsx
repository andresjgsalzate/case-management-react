/**
 * =================================================================
 * PÁGINA DE PRUEBAS PARA VALIDACIÓN DE CASOS
 * =================================================================
 * Descripción: Página para probar la funcionalidad de validación
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState } from 'react';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { CaseValidator } from '../components/documentation/CaseValidator';
import { TagSelector } from '../components/documentation/TagSelector';
import { EnhancedDocumentationEditor } from '../components/documentation/editor/EnhancedDocumentationEditor';
import { Button } from '@/shared/components/ui/Button';
import type { CaseReferenceType } from '../types';

export const TestDocumentationPage: React.FC = () => {
  const [showBasicTest, setShowBasicTest] = useState(true);
  const [showFullEditor, setShowFullEditor] = useState(false);
  const [caseId, setCaseId] = useState<string>();
  const [archivedCaseId, setArchivedCaseId] = useState<string>();
  const [caseReferenceType, setCaseReferenceType] = useState<CaseReferenceType>('active');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleCaseChange = (
    referenceType: CaseReferenceType,
    newCaseId?: string, 
    newArchivedCaseId?: string
  ) => {
    setCaseReferenceType(referenceType);
    setCaseId(newCaseId);
    setArchivedCaseId(newArchivedCaseId);
  };

  if (showFullEditor) {
    return (
      <div className="h-screen">
        <EnhancedDocumentationEditor
          onSave={() => {
            setShowFullEditor(false);
          }}
          onCancel={() => setShowFullEditor(false)}
        />
      </div>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            🧪 Pruebas de Documentación
          </h1>
          
          <div className="flex gap-4">
            <Button 
              onClick={() => setShowBasicTest(!showBasicTest)}
              variant={showBasicTest ? "primary" : "outline"}
            >
              {showBasicTest ? 'Ocultar' : 'Mostrar'} Componentes Básicos
            </Button>
            
            <Button 
              onClick={() => setShowFullEditor(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              🚀 Probar Editor Completo
            </Button>
          </div>
        </div>

        {showBasicTest && (
          <>
            {/* Test de validación de casos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                🔍 Validador de Casos
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    🎯 ¿Cómo funciona el autocompletado?
                  </h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    <li>• Escribe al menos 2 caracteres para activar las sugerencias</li>
                    <li>• Busca por número de caso o descripción</li>
                    <li>• Las sugerencias aparecen automáticamente</li>
                    <li>• Haz clic en una sugerencia para seleccionarla</li>
                    <li>• Presiona Escape para cerrar las sugerencias</li>
                  </ul>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  💡 <strong>Sugerencia:</strong> Prueba escribiendo parte de un número de caso o descripción existente.
                </p>
                
                <CaseValidator
                  selectedCaseId={caseId}
                  selectedArchivedCaseId={archivedCaseId}
                  caseReferenceType={caseReferenceType}
                  onCaseChange={handleCaseChange}
                />
                
                {/* Estado actual */}
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                    📊 Estado actual de la selección:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Tipo:</span>
                      <div className="text-gray-600 dark:text-gray-400 font-mono">
                        {caseReferenceType}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Caso Activo:</span>
                      <div className="text-gray-600 dark:text-gray-400 font-mono">
                        {caseId || 'No seleccionado'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Caso Archivado:</span>
                      <div className="text-gray-600 dark:text-gray-400 font-mono">
                        {archivedCaseId || 'No seleccionado'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Test de selector de etiquetas */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                🏷️ Selector de Etiquetas
              </h2>
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Selecciona etiquetas existentes o crea nuevas:
                </p>
                
                <TagSelector
                  selectedTagIds={selectedTags}
                  onTagsChange={setSelectedTags}
                />
                
                {/* Etiquetas seleccionadas */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Etiquetas seleccionadas:</h3>
                  <pre className="text-sm text-gray-600 dark:text-gray-300">
                    {JSON.stringify(selectedTags, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </PageWrapper>
  );
};
