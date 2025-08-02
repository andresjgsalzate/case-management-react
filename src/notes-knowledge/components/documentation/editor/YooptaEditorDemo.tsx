/**
 * =================================================================
 * COMPONENTE: DEMO DEL EDITOR VISUAL YOOPTA
 * =================================================================
 * Descripción: Demo simple para probar el editor visual
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState } from 'react';
import { YooptaContentValue } from '@yoopta/editor';
import { YooptaDocumentEditor, createEmptyYooptaContent } from './YooptaDocumentEditor';
import { Save, FileText } from 'lucide-react';

export const YooptaEditorDemo: React.FC = () => {
  const [title, setTitle] = useState('Mi Documento de Prueba');
  const [yooptaContent, setYooptaContent] = useState<YooptaContentValue>(createEmptyYooptaContent());

  const handleSave = () => {
    const documentData = {
      title,
      content: yooptaContent
    };
    console.log('Guardando documento:', documentData);
    alert('Documento guardado! (ver consola para detalles)');
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="flex-none bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              Demo Editor Visual Yoopta
            </h1>
          </div>
          
          <button 
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Demo
          </button>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 overflow-hidden p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Campo de título */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Título del Documento</h3>
            </div>
            <div className="p-6">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ingresa el título del documento"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Editor principal */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Editor Visual Tipo Notion</h3>
              <p className="text-sm text-gray-600 mt-1">
                Prueba las funciones del editor: títulos, párrafos, listas, código, citas, etc.
              </p>
            </div>
            <div className="p-4">
              <YooptaDocumentEditor
                value={yooptaContent}
                onChange={setYooptaContent}
                placeholder="🎉 ¡Comienza a escribir aquí! Prueba teclear '/' para ver el menú de bloques..."
              />
            </div>
          </div>

          {/* Instrucciones */}
          <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Instrucciones de uso:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Escribe texto normalmente para crear párrafos</li>
              <li>• Presiona <kbd className="bg-blue-100 px-1 rounded">Enter</kbd> para crear nuevo bloque</li>
              <li>• Escribe <kbd className="bg-blue-100 px-1 rounded">/</kbd> para abrir el menú de bloques</li>
              <li>• Usa <kbd className="bg-blue-100 px-1 rounded"># </kbd> para títulos (nivel 1)</li>
              <li>• Usa <kbd className="bg-blue-100 px-1 rounded">## </kbd> para títulos (nivel 2)</li>
              <li>• Usa <kbd className="bg-blue-100 px-1 rounded">- </kbd> para listas con viñetas</li>
              <li>• Usa <kbd className="bg-blue-100 px-1 rounded">1. </kbd> para listas numeradas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
