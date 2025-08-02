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
    console.log('Caso cambiado:', { referenceType, newCaseId, newArchivedCaseId });
  };

  if (showFullEditor) {
    return (
      <div className="h-screen">
        <EnhancedDocumentationEditor
          onSave={() => {
            console.log('Guardado');
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
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Prueba buscando casos como: <strong>SR20</strong>, <strong>IN528951</strong>, etc.
                </p>
                
                <CaseValidator
                  selectedCaseId={caseId}
                  selectedArchivedCaseId={archivedCaseId}
                  caseReferenceType={caseReferenceType}
                  onCaseChange={handleCaseChange}
                />
                
                {/* Estado actual */}
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Estado actual:</h3>
                  <pre className="text-sm text-gray-600 dark:text-gray-300">
                    {JSON.stringify({ caseReferenceType, caseId, archivedCaseId }, null, 2)}
                  </pre>
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
