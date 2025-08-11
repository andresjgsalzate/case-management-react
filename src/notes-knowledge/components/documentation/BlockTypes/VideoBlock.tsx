/**
 * =================================================================
 * BLOQUE: VIDEO
 * =================================================================
 * Descripción: Bloque de video con preview y controles
 * Versión: 1.0
 * Fecha: 11 de Agosto, 2025
 * =================================================================
 */

import React, { useState, useRef } from 'react';
import { ContentBlock } from '@/types/documentation';
import { 
  VideoCameraIcon,
  TrashIcon,
  PlayIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface VideoBlockProps {
  block: ContentBlock;
  isActive: boolean;
  readOnly: boolean;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onDelete: () => void;
  onAddAfter: (type: ContentBlock['type']) => void;
}

export const VideoBlock: React.FC<VideoBlockProps> = ({
  block,
  isActive,
  readOnly,
  onUpdate,
  onDelete
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const fileName = block.metadata?.fileName || '';
  const fileUrl = block.metadata?.fileUrl || '';
  const caption = block.metadata?.caption || '';
  const showPreview = block.metadata?.showPreview !== false;
  const previewWidth = block.metadata?.previewWidth || 500;

  // Manejar selección de video
  const handleVideoSelect = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please select a valid video file');
      return;
    }

    const url = URL.createObjectURL(file);
    onUpdate({
      content: file.name,
      metadata: {
        ...block.metadata,
        fileName: file.name,
        fileUrl: url,
        fileType: file.type,
        showPreview: true,
        previewWidth: 500
      }
    });
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
    const videoFile = files.find(file => file.type.startsWith('video/'));
    if (videoFile) {
      handleVideoSelect(videoFile);
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

  // Toggle preview
  const togglePreview = () => {
    onUpdate({
      metadata: {
        ...block.metadata,
        showPreview: !showPreview
      }
    });
  };

  // Cambiar ancho del preview
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = parseInt(e.target.value);
    if (width >= 200 && width <= 800) {
      onUpdate({
        metadata: {
          ...block.metadata,
          previewWidth: width
        }
      });
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
          {fileName && (
            <button
              onClick={togglePreview}
              className="p-1 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
              title={showPreview ? 'Hide preview' : 'Show preview'}
            >
              {showPreview ? <EyeSlashIcon className="w-3 h-3" /> : <EyeIcon className="w-3 h-3" />}
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 bg-gray-500 text-white rounded-full hover:bg-gray-600 transition-colors"
            title="Edit settings"
          >
            <VideoCameraIcon className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <TrashIcon className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Configuración */}
      {isEditing && !readOnly && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-2">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Preview Width:</label>
            <input
              type="range"
              min="200"
              max="800"
              value={previewWidth}
              onChange={handleWidthChange}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400 w-12">{previewWidth}px</span>
          </div>
        </div>
      )}

      {/* Área de video */}
      {!fileName ? (
        // Estado vacío - zona de carga
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !readOnly && fileInputRef.current?.click()}
          className={`
            flex flex-col items-center justify-center py-12 cursor-pointer
            ${readOnly ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
          `}
        >
          <VideoCameraIcon className="w-16 h-16 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {readOnly ? 'No video attached' : 'Click to upload or drag and drop a video here'}
          </p>
          {!readOnly && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Supports MP4, WebM, AVI, MOV
            </p>
          )}
        </div>
      ) : (
        // Estado con video
        <div className="space-y-3">
          {showPreview ? (
            <div className="flex justify-center">
              <video
                ref={videoRef}
                controls
                style={{ maxWidth: `${previewWidth}px`, width: '100%' }}
                className="rounded-lg shadow-lg"
              >
                <source src={fileUrl} />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div 
              className="flex items-center justify-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={togglePreview}
            >
              <PlayIcon className="w-12 h-12 text-gray-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {fileName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Click to show preview
                </p>
              </div>
            </div>
          )}

          {/* Caption */}
          {!readOnly ? (
            <input
              type="text"
              placeholder="Add a caption..."
              value={caption}
              onChange={handleCaptionChange}
              className="w-full text-sm px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          ) : caption ? (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center italic">
              {caption}
            </p>
          ) : null}
        </div>
      )}

      {/* Input oculto para selección de videos */}
      {!readOnly && (
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleVideoSelect(file);
          }}
        />
      )}
    </div>
  );
};

export default VideoBlock;
