/**
 * Ejemplo de uso del nuevo exportador PDF con @react-pdf/renderer
 */

import React from 'react';
import { PDFExportButton } from '../../shared';
import type { BlockNoteDocument } from '../../types/blocknotePdf';

// Documento de ejemplo con la estructura real de BlockNote
const exampleDocument: BlockNoteDocument = {
  id: 'example-doc-1',
  title: '📄 Documento de Prueba PDF',
  content: [
    {
      id: 'heading-1',
      type: 'heading',
      props: { level: 1 },
      content: [{ text: '🎯 Título Principal', type: 'text', styles: {} }],
      children: []
    },
    {
      id: 'paragraph-1',
      type: 'paragraph',
      props: {},
      content: [
        { text: 'Este es un párrafo de ejemplo con ', type: 'text', styles: {} },
        { text: 'texto en negrita', type: 'text', styles: { bold: true } },
        { text: ' y ', type: 'text', styles: {} },
        { text: 'texto en cursiva', type: 'text', styles: { italic: true } },
        { text: '. Los emojis se mantienen tal como están 🎉', type: 'text', styles: {} }
      ],
      children: []
    },
    {
      id: 'heading-2',
      type: 'heading',
      props: { level: 2 },
      content: [{ text: '🔧 Características del Exportador', type: 'text', styles: {} }],
      children: []
    },
    {
      id: 'bullet-list-1',
      type: 'bulletListItem',
      props: {},
      content: [{ text: '✅ Mantiene emojis originales', type: 'text', styles: {} }],
      children: []
    },
    {
      id: 'bullet-list-2',
      type: 'bulletListItem',
      props: {},
      content: [{ text: '🔥 Formato de texto preservado', type: 'text', styles: {} }],
      children: []
    },
    {
      id: 'code-block-1',
      type: 'codeBlock',
      props: { language: 'javascript' },
      content: [{ text: 'console.log("¡Hola mundo desde PDF! �");', type: 'text', styles: {} }],
      children: []
    },
    {
      id: 'quote-1',
      type: 'quote',
      props: {},
      content: [{ text: '💬 "Esta es una cita con emojis que se mantienen" - Usuario 👤', type: 'text', styles: {} }],
      children: []
    },
    {
      id: 'checkbox-1',
      type: 'checkListItem',
      props: { checked: true },
      content: [{ text: 'Tarea completada ✓', type: 'text', styles: {} }],
      children: []
    },
    {
      id: 'checkbox-2',
      type: 'checkListItem',
      props: { checked: false },
      content: [{ text: 'Tarea pendiente ⏳', type: 'text', styles: {} }],
      children: []
    }
  ],
  created_by: '👨‍💻 Usuario de Prueba',
  created_at: '2025-01-04T10:00:00Z',
  updated_at: '2025-01-04T10:00:00Z',
  category: '📚 Documentación',
  tags: ['ejemplo', 'pdf', 'prueba'],
  difficulty_level: 2,
  solution_type: 'tutorial'
};

export const PDFExportExample: React.FC = () => {
  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
        Nuevo Exportador PDF - React-PDF
      </h2>
      
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-300">
          Este es un ejemplo del nuevo sistema de exportación PDF que usa @react-pdf/renderer 
          para generar PDFs directamente desde componentes React. <strong>Los emojis se preservan</strong> 
          tal como están en el documento original.
        </p>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded">
          <h3 className="font-semibold mb-2">Características:</h3>
          <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
            <li>✅ Exportación directa desde React a PDF</li>
            <li>✅ Soporte completo para todos los tipos de bloques BlockNote</li>
            <li>✅ Estilos profesionales y tipografía mejorada</li>
            <li>✅ Metadatos del documento incluidos</li>
            <li>✅ Header y footer personalizados</li>
            <li>✅ Manejo de imágenes y tablas</li>
            <li>✅ Texto con formato (negrita, cursiva, código, etc.)</li>
            <li>🆕 <strong>Preservación de emojis originales</strong></li>
            <li>🆕 <strong>Checkboxes con estado visual correcto</strong></li>
            <li>🆕 <strong>Imágenes con proporción preservada</strong></li>
            <li>🆕 <strong>Espaciado mejorado en títulos</strong></li>
          </ul>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded border border-green-200 dark:border-green-800">
          <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2">
            ✅ Mejoras Aplicadas
          </h4>
          <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <p><strong>✓ Emojis:</strong> Se mantienen tal como están (📄 → 📄)</p>
            <p><strong>✓ Checkboxes:</strong> Estado visual correcto (☑️ para marcados, ☐ para vacíos)</p>
            <p><strong>✓ Imágenes:</strong> Proporción preservada (máximo 80% ancho, altura limitada)</p>
            <p><strong>✓ Títulos:</strong> Espaciado mejorado entre título y contenido</p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <PDFExportButton
            document={exampleDocument}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            📄 Descargar PDF de Ejemplo
          </PDFExportButton>
          
          <PDFExportButton
            document={exampleDocument}
            fileName="mi_documento_personalizado.pdf"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium"
          >
            📥 Nombre Personalizado
          </PDFExportButton>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
            💡 Cómo usar en tu código:
          </h4>
          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-x-auto">
{`import { PDFExportButton } from '@/shared';

<PDFExportButton
  document={documentData}
  fileName="mi_documento.pdf"
  className="btn btn-primary"
>
  Descargar PDF
</PDFExportButton>`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default PDFExportExample;
