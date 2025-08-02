/**
 * =================================================================
 * BLOQUE: IMAGEN
 * =================================================================
 * Descripción: Bloque de imagen con subida y configuración
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState, useRef, useCallback } from 'react';
import { ContentBlock } from '@/types/documentation';
import { 
  PhotoIcon,
  LinkIcon,
  TrashIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

interface ImageBlockProps {
  block: ContentBlock;
  isActive: boolean;
  readOnly: boolean;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onDelete: () => void;
  onAddAfter: (type: ContentBlock['type']) => void;
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
  block,
  isActive,
  readOnly,
  onUpdate
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const imageUrl = block.metadata?.imageUrl;
  const imageAlt = block.metadata?.imageAlt || '';

  // Actualizar metadatos de imagen
  const updateImageData = (url: string, alt: string = '') => {
    onUpdate({
      content: alt || 'Imagen',
      metadata: {
        ...block.metadata,
        imageUrl: url,
        imageAlt: alt
      }
    });
  };

  // Simular subida de archivo (aquí deberías integrar con tu servicio de almacenamiento)
  const uploadFile = async (file: File): Promise<string> => {
    // Simular delay de subida
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // En un caso real, aquí subirías el archivo a tu servicio (Supabase Storage, AWS S3, etc.)
    // Por ahora, creamos una URL temporal para demostración
    return URL.createObjectURL(file);
  };

  // Manejar selección de archivo
  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      updateImageData(url, file.name);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  // Manejar drop de archivo
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  // Manejar drag over
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  // Manejar drag leave
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Abrir selector de archivo
  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  // Manejar cambio de archivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Manejar URL de imagen
  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      updateImageData(urlInput.trim(), 'Imagen desde URL');
      setUrlInput('');
      setShowUrlInput(false);
    }
  };

  // Manejar cambio de texto alternativo
  const handleAltChange = (newAlt: string) => {
    updateImageData(imageUrl || '', newAlt);
  };

  // Eliminar imagen
  const removeImage = () => {
    onUpdate({
      content: '',
      metadata: {
        ...block.metadata,
        imageUrl: undefined,
        imageAlt: undefined
      }
    });
  };

  // Si no hay imagen, mostrar placeholder para subir
  if (!imageUrl) {
    return (
      <div className={`block-image ${isActive ? 'active' : ''} ${readOnly ? 'readonly' : ''}`}>
        {!readOnly ? (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver 
                ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Subiendo imagen...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <PhotoIcon className="h-12 w-12 text-gray-400" />
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Arrastra una imagen aquí o
                  </p>
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      onClick={openFileDialog}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                      <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
                      Subir archivo
                    </button>
                    <span className="text-gray-400">o</span>
                    <button
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                    >
                      <LinkIcon className="h-4 w-4 mr-1" />
                      Usar URL
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Input de URL */}
            {showUrlInput && (
              <div className="mt-4 flex items-center space-x-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUrlSubmit();
                    }
                  }}
                />
                <button
                  onClick={handleUrlSubmit}
                  className="px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                >
                  Añadir
                </button>
              </div>
            )}

            {/* Input de archivo oculto */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <PhotoIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="mt-2 text-sm text-gray-500">Imagen no disponible</p>
          </div>
        )}
      </div>
    );
  }

  // Si hay imagen, mostrarla
  return (
    <div className={`block-image ${isActive ? 'active' : ''} ${readOnly ? 'readonly' : ''} group`}>
      <div className="relative inline-block max-w-full">
        <img
          src={imageUrl}
          alt={imageAlt}
          className="max-w-full h-auto rounded-lg shadow-sm"
          onError={() => {
            console.error('Error loading image:', imageUrl);
            removeImage();
          }}
        />

        {/* Controles de imagen */}
        {!readOnly && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center space-x-1 bg-black bg-opacity-50 rounded-lg p-1">
              <button
                onClick={removeImage}
                className="p-1 text-white hover:text-red-300 transition-colors"
                title="Eliminar imagen"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input de texto alternativo */}
      {!readOnly && (
        <div className="mt-2">
          <input
            type="text"
            value={imageAlt}
            onChange={(e) => handleAltChange(e.target.value)}
            placeholder="Descripción de la imagen (texto alternativo)"
            className="w-full text-sm text-gray-600 dark:text-gray-400 bg-transparent border-none outline-none placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      )}

      {/* Mostrar texto alternativo en modo readonly */}
      {readOnly && imageAlt && (
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
          {imageAlt}
        </div>
      )}
    </div>
  );
};
