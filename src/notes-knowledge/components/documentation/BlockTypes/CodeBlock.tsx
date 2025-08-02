/**
 * =================================================================
 * BLOQUE: CÓDIGO
 * =================================================================
 * Descripción: Bloque de código con resaltado de sintaxis
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { ContentBlock } from '@/types/documentation';
import { ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';

interface CodeBlockProps {
  block: ContentBlock;
  isActive: boolean;
  readOnly: boolean;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onDelete: () => void;
  onAddAfter: (type: ContentBlock['type']) => void;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  block,
  isActive,
  readOnly,
  onUpdate,
  onDelete,
  onAddAfter
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const language = block.metadata?.language || 'text';

  // Entrar en modo edición
  const enterEditMode = () => {
    if (readOnly) return;
    setIsEditing(true);
  };

  // Salir del modo edición
  const exitEditMode = () => {
    setIsEditing(false);
  };

  // Manejar cambios de contenido
  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ content: e.target.value });
    adjustTextareaHeight();
  };

  // Manejar cambios de lenguaje
  const handleLanguageChange = (newLanguage: string) => {
    onUpdate({ 
      metadata: { 
        ...block.metadata, 
        language: newLanguage 
      } 
    });
  };

  // Ajustar altura del textarea
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Manejar teclas especiales
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Tab: insertar espacios en lugar de cambiar de elemento
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const value = textarea.value;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      
      onUpdate({ content: newValue });
      
      // Restaurar posición del cursor
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 0);
    }
    
    // Escape: salir del modo edición
    if (e.key === 'Escape') {
      exitEditMode();
    }
    
    // Ctrl/Cmd + Enter: crear nuevo párrafo después
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      onAddAfter('paragraph');
      exitEditMode();
    }
    
    // Backspace en contenido vacío: eliminar bloque
    if (e.key === 'Backspace' && block.content === '' && e.currentTarget.selectionStart === 0) {
      e.preventDefault();
      onDelete();
    }
  };

  // Copiar código al portapapeles
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(block.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  // Enfocar cuando entre en modo edición
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
      adjustTextareaHeight();
    }
  }, [isEditing]);

  // Ajustar altura en cambios de contenido
  useEffect(() => {
    adjustTextareaHeight();
  }, [block.content]);

  // Entrar en modo edición cuando el bloque esté activo
  useEffect(() => {
    if (isActive && !readOnly && !isEditing) {
      enterEditMode();
    }
  }, [isActive, readOnly, isEditing]);

  // Lenguajes de programación comunes
  const languages = [
    { value: 'text', label: 'Texto plano' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'sql', label: 'SQL' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'bash', label: 'Bash' },
    { value: 'powershell', label: 'PowerShell' },
    { value: 'yaml', label: 'YAML' },
    { value: 'markdown', label: 'Markdown' }
  ];

  // Encabezado del bloque de código
  const CodeHeader = () => (
    <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2">
        {/* Selector de lenguaje */}
        {(!readOnly || isEditing) ? (
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="text-sm bg-transparent border-none outline-none text-gray-600 dark:text-gray-400"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {languages.find(l => l.value === language)?.label || language}
          </span>
        )}
      </div>
      
      {/* Botón de copiar */}
      <button
        onClick={copyToClipboard}
        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        title="Copiar código"
      >
        {copied ? (
          <CheckIcon className="h-4 w-4 text-green-500" />
        ) : (
          <ClipboardIcon className="h-4 w-4" />
        )}
      </button>
    </div>
  );

  // Si está en modo edición, mostrar textarea
  if (isEditing && !readOnly) {
    return (
      <div className="block-code editing border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <CodeHeader />
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={block.content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            onBlur={exitEditMode}
            placeholder="Escribe tu código aquí..."
            className="w-full p-4 border-none outline-none bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm resize-none overflow-hidden min-h-[100px]"
            style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
          />
        </div>
      </div>
    );
  }

  // Modo de visualización
  return (
    <div 
      className={`block-code ${isActive ? 'active' : ''} ${readOnly ? 'readonly' : 'cursor-text'} border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${!readOnly ? 'hover:border-gray-400 dark:hover:border-gray-500 transition-colors' : ''}`}
      onClick={enterEditMode}
    >
      <CodeHeader />
      <div className="p-4 bg-gray-50 dark:bg-gray-900">
        <pre className={`text-sm text-gray-900 dark:text-gray-100 font-mono overflow-x-auto ${
          block.content 
            ? '' 
            : 'text-gray-400 dark:text-gray-500'
        }`}>
          <code style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}>
            {block.content || 'Escribe tu código aquí...'}
          </code>
        </pre>
      </div>
    </div>
  );
};
