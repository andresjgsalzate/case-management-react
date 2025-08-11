/**
 * =================================================================
 * EJEMPLO: TODAS LAS FUNCIONALIDADES BLOCKNOTE
 * =================================================================
 * Descripción: Página de ejemplo mostrando todas las características
 * avanzadas de BlockNote implementadas
 * Versión: 1.0
 * Fecha: 11 de Agosto, 2025
 * =================================================================
 */

import React from 'react';
import { BlockNoteDocumentEditor } from '../components/documentation/editor/BlockNoteDocumentEditor';
import { PartialBlock } from '@blocknote/core';

const EXAMPLE_CONTENT: PartialBlock[] = [
  {
    type: "heading",
    props: { level: 1 },
    content: "🚀 BlockNote Advanced Features Demo",
  },
  {
    type: "paragraph",
    content: "Esta página demuestra todas las funcionalidades avanzadas de BlockNote que hemos implementado:",
  },
  
  // ===== CÓDIGO CON HIGHLIGHTING =====
  {
    type: "heading",
    props: { level: 2 },
    content: "💻 Code Blocks con Syntax Highlighting",
  },
  {
    type: "paragraph",
    content: "Código TypeScript con highlighting automático:",
  },
  {
    type: "codeBlock",
    props: {
      language: "typescript",
    },
    content: `interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

const createUser = async (userData: Partial<User>): Promise<User> => {
  const newUser: User = {
    id: generateId(),
    ...userData,
    createdAt: new Date()
  };
  
  return await saveUser(newUser);
};`,
  },
  
  // ===== LISTAS AVANZADAS =====
  {
    type: "heading",
    props: { level: 2 },
    content: "📝 Advanced Lists",
  },
  {
    type: "paragraph",
    content: "Listas con diferentes estilos:",
  },
  {
    type: "bulletListItem",
    content: "Lista con viñetas - Elemento 1",
  },
  {
    type: "bulletListItem",
    content: "Lista con viñetas - Elemento 2",
  },
  {
    type: "numberedListItem",
    content: "Lista numerada - Primer elemento",
  },
  {
    type: "numberedListItem",
    content: "Lista numerada - Segundo elemento",
  },
  {
    type: "checkListItem",
    props: { checked: true },
    content: "Tarea completada ✅",
  },
  {
    type: "checkListItem",
    props: { checked: false },
    content: "Tarea pendiente",
  },
  
  // ===== TABLAS AVANZADAS =====
  {
    type: "heading",
    props: { level: 2 },
    content: "📊 Advanced Tables",
  },
  {
    type: "paragraph",
    content: "Tablas con headers, colores de celda y merge - usa el editor para crear tablas avanzadas:",
  },
  {
    type: "table",
  },
  
  // ===== MULTIMEDIA =====
  {
    type: "heading",
    props: { level: 2 },
    content: "🎬 Multimedia Support",
  },
  {
    type: "paragraph",
    content: "Soporte completo para archivos multimedia:",
  },
  
  // ===== CARACTERÍSTICAS TÉCNICAS =====
  {
    type: "heading",
    props: { level: 2 },
    content: "⚙️ Características Técnicas Implementadas",
  },
  {
    type: "bulletListItem",
    content: "Code Block con syntax highlighting usando Shiki",
  },
  {
    type: "bulletListItem",
    content: "Soporte para múltiples lenguajes: TypeScript, JavaScript, Python, Java, SQL, HTML, CSS, JSON, Markdown",
  },
  {
    type: "bulletListItem",
    content: "Themes: Light Plus y Dark Plus",
  },
  {
    type: "bulletListItem",
    content: "Tab indentation en code blocks",
  },
  {
    type: "bulletListItem",
    content: "Tables con cell background color, text color, headers y split cells",
  },
  {
    type: "bulletListItem",
    content: "File blocks para cualquier tipo de archivo",
  },
  {
    type: "bulletListItem",
    content: "Video blocks con preview y controles",
  },
  {
    type: "bulletListItem",
    content: "Audio blocks con reproductor integrado",
  },
  {
    type: "bulletListItem",
    content: "Bullet List Items",
  },
  {
    type: "bulletListItem",
    content: "Numbered List Items",
  },
  {
    type: "bulletListItem",
    content: "Check List Items",
  },
  {
    type: "bulletListItem",
    content: "Toggle List Items",
  },
  
  // ===== CONFIGURACIÓN =====
  {
    type: "heading",
    props: { level: 2 },
    content: "🔧 Configuración del Editor",
  },
  {
    type: "codeBlock",
    props: {
      language: "typescript",
    },
    content: `const editor = useCreateBlockNote({
  // Configuración avanzada de Code Blocks
  codeBlock: {
    indentLineWithTab: true,
    defaultLanguage: "typescript",
    supportedLanguages: {
      typescript: { name: "TypeScript", aliases: ["ts"] },
      javascript: { name: "JavaScript", aliases: ["js"] },
      python: { name: "Python", aliases: ["py"] },
      // ... más lenguajes
    },
    createHighlighter: () => createHighlighter({
      themes: ["light-plus", "dark-plus"],
      langs: [],
    }),
  },
  
  // Configuración avanzada de Tablas
  tables: {
    cellBackgroundColor: true,
    cellTextColor: true,
    headers: true,
    splitCells: true,
  },
  
  // Upload de archivos
  uploadFile: async (file: File) => {
    return await StorageService.uploadFile(file, documentId);
  },
});`,
  },
  
  {
    type: "paragraph",
    content: "🎉 ¡Todas las funcionalidades de BlockNote están ahora disponibles en nuestro sistema!",
  },
];

export const BlockNoteAdvancedExample: React.FC = () => {
  const [content, setContent] = React.useState<PartialBlock[]>(EXAMPLE_CONTENT);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          BlockNote Advanced Features Demo
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Ejemplo interactivo de todas las funcionalidades avanzadas implementadas
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <BlockNoteDocumentEditor
          value={content}
          onChange={setContent}
          readOnly={false}
          documentId="example-doc"
          className="min-h-screen"
        />
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
          💡 Funcionalidades Implementadas
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>✅ Code blocks con syntax highlighting (Shiki)</li>
          <li>✅ Tablas avanzadas con headers, colores y merge</li>
          <li>✅ File blocks para archivos</li>
          <li>✅ Video blocks con preview</li>
          <li>✅ Audio blocks con reproductor</li>
          <li>✅ Listas avanzadas (bullet, numbered, check, toggle)</li>
          <li>✅ Upload de archivos integrado</li>
          <li>✅ Dark mode support</li>
          <li>✅ Configuración optimizada de bundle</li>
        </ul>
      </div>
    </div>
  );
};

export default BlockNoteAdvancedExample;
