/**
 * =================================================================
 * BLOQUE: ARCHIVO
 * =================================================================
 * Descripción: Bloque de archivo para mostrar documentos adjuntos
 * Versión: 1.0
 * Fecha: 11 de Agosto, 2025
 * =================================================================
 */

import React, { useState, useRef } from 'react';
import { ContentBlock } from '@/types/documentation';
import { 
  DocumentIcon,
  DocumentTextIcon,
  DocumentChartBarIcon,
  PhotoIcon,
  VideoCameraIcon,
  MusicalNoteIcon,
  TrashIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

interface FileBlockProps {
  block: ContentBlock;
  isActive: boolean;
  readOnly: boolean;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onDelete: () => void;
  onAddAfter: (type: ContentBlock['type']) => void;
}

export const FileBlock: React.FC<FileBlockProps> = ({
  block,
  isActive,
  readOnly,
  onUpdate,
  onDelete
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const fileName = block.metadata?.fileName || '';
  const fileUrl = block.metadata?.fileUrl || '';
  const fileSize = block.metadata?.fileSize || '';
  const fileType = block.metadata?.fileType || '';
  const caption = block.metadata?.caption || '';

  // Obtener icono según el tipo de archivo
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return PhotoIcon;
    if (type.startsWith('video/')) return VideoCameraIcon;
    if (type.startsWith('audio/')) return MusicalNoteIcon;
    if (type.includes('pdf')) return DocumentTextIcon;
    if (type.includes('excel') || type.includes('sheet')) return DocumentChartBarIcon;
    return DocumentIcon;
  };

  const FileIcon = getFileIcon(fileType);

  // Manejar selección de archivo
  const handleFileSelect = (file: File) => {
    const url = URL.createObjectURL(file);
    onUpdate({
      content: file.name,
      metadata: {
        ...block.metadata,
        fileName: file.name,
        fileUrl: url,
        fileSize: formatFileSize(file.size),
        fileType: file.type,
      }
    });
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Manejar drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Manejar cambio de caption
  const handleCaptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate({
      metadata: {
        ...block.metadata,
        caption: e.target.value
      }
    });
  };

  // Manejar descarga
  const handleDownload = () => {
    if (fileUrl && fileName) {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className={`
      relative group border-2 border-dashed rounded-lg p-4 transition-all duration-200
      ${isDragOver ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600'}
      ${isActive ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
    `}>
      {/* Controles de bloque */}
      {isActive && !readOnly && (
        <div className="absolute -top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onDelete}
            className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <TrashIcon className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Área de archivo */}
      {!fileName ? (
        // Estado vacío - zona de carga
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !readOnly && fileInputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center py-8 cursor-pointer
            ${readOnly ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
          `}
        >
          <DocumentIcon className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {readOnly ? 'No file attached' : 'Click to upload or drag and drop a file here'}
          </p>
          {!readOnly && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Any file type supported
            </p>
          )}
        </div>
      ) : (
        // Estado con archivo
        <div className="flex items-center space-x-3">
          <FileIcon className="w-10 h-10 text-blue-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {fileName}
            </p>
            {fileSize && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {fileSize}
              </p>
            )}
            {!readOnly && (
              <input
                type="text"
                placeholder="Add a caption..."
                value={caption}
                onChange={handleCaptionChange}
                className="mt-1 w-full text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            )}
            {readOnly && caption && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {caption}
              </p>
            )}
          </div>
          <button
            onClick={handleDownload}
            className="p-2 text-gray-500 hover:text-blue-500 transition-colors"
            title="Download file"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Input oculto para selección de archivos */}
      {!readOnly && (
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
      )}
    </div>
  );
};

export default FileBlock;
