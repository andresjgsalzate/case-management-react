/**
 * =================================================================
 * PÁGINA: PRUEBA SELECTOR DE LENGUAJE
 * =================================================================
 * Descripción: Página específica para probar el selector de lenguaje
 * Versión: 1.0
 * Fecha: 11 de Agosto, 2025
 * =================================================================
 */

import React, { useState } from 'react';
import { PartialBlock } from "@blocknote/core";
import { BlockNoteDocumentEditor } from '../components/documentation/editor/BlockNoteDocumentEditor';
import { BlockNoteStylesProvider } from '../components/documentation/editor/BlockNoteStylesProvider';

const initialContent: PartialBlock[] = [
  {
    type: "heading",
    props: { level: 1 },
    content: "🔧 Test del Selector de Lenguaje",
  },
  {
    type: "paragraph",
    content: "Esta página está diseñada para probar el selector de lenguaje en bloques de código. Sigue estos pasos:",
  },
  {
    type: "paragraph",
    content: "1. Crea un bloque de código usando '/' + 'code' o el botón +",
  },
  {
    type: "paragraph",
    content: "2. Haz click en el dropdown de lenguaje (debería mostrar 'javascript' por defecto)",
  },
  {
    type: "paragraph",
    content: "3. Verifica que se despliega correctamente y puedes ver las opciones",
  },
  {
    type: "codeBlock",
    props: {
      language: "typescript",
    },
    content: "// Este es un bloque de código TypeScript\ninterface User {\n  id: string;\n  name: string;\n  email: string;\n}\n\nconst user: User = {\n  id: '1',\n  name: 'Test User',\n  email: 'test@example.com'\n};",
  },
  {
    type: "paragraph",
    content: "⬆️ Intenta cambiar el lenguaje del bloque de código de arriba. El dropdown debería ser visible.",
  },
  {
    type: "codeBlock",
    props: {
      language: "python",
    },
    content: "# Código Python de ejemplo\ndef factorial(n):\n    if n <= 1:\n        return 1\n    else:\n        return n * factorial(n-1)\n\nprint(factorial(5))",
  },
  {
    type: "paragraph",
    content: "⬆️ Este bloque está en Python. Prueba cambiar a SQL, Java u otros lenguajes.",
  },
  {
    type: "codeBlock",
    props: {
      language: "sql",
    },
    content: "-- Consulta SQL de ejemplo\nSELECT \n    usuarios.nombre,\n    COUNT(casos.id) as total_casos\nFROM usuarios \nLEFT JOIN casos ON usuarios.id = casos.usuario_id\nWHERE usuarios.activo = true\nGROUP BY usuarios.id, usuarios.nombre\nORDER BY total_casos DESC;",
  },
];

export const TestLanguageSelectorPage: React.FC = () => {
  const [content, setContent] = useState<PartialBlock[]>(initialContent);

  const handleChange = (newContent: PartialBlock[]) => {
    setContent(newContent);
  };

  return (
    <BlockNoteStylesProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                🧪 Prueba del Selector de Lenguaje
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Esta página permite probar específicamente el dropdown del selector de lenguaje en los bloques de código.
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              <BlockNoteDocumentEditor
                value={content}
                onChange={handleChange}
                readOnly={false}
                className="min-h-96"
                documentId="test-language-selector"
              />
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                💡 Instrucciones de Prueba:
              </h3>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Haz click en el dropdown de lenguaje de cualquier bloque de código</li>
                <li>• Verifica que las opciones son visibles (no transparentes u ocultas)</li>
                <li>• Prueba cambiar entre diferentes lenguajes</li>
                <li>• Verifica que el syntax highlighting cambia correctamente</li>
                <li>• Prueba en modo oscuro y claro</li>
              </ul>
            </div>

            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                ✅ Lenguajes Disponibles:
              </h3>
              <div className="grid grid-cols-3 gap-2 text-sm text-green-800 dark:text-green-200">
                <div>• TypeScript</div>
                <div>• JavaScript</div>
                <div>• Python</div>
                <div>• Java</div>
                <div>• SQL</div>
                <div>• HTML</div>
                <div>• CSS</div>
                <div>• JSON</div>
                <div>• Markdown</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BlockNoteStylesProvider>
  );
};

export default TestLanguageSelectorPage;
