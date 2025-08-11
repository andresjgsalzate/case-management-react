/**
 * =================================================================
 * BLOQUE: AUDIO
 * =================================================================
 * Descripción: Bloque de audio con controles de reproducción
 * Versión: 1.0
 * Fecha: 11 de Agosto, 2025
 * =================================================================
 */

import React, { useState, useRef } from 'react';
import { ContentBlock } from '@/types/documentation';
import { 
  MusicalNoteIcon,
  TrashIcon,
  PlayIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

interface AudioBlockProps {
  block: ContentBlock;
  isActive: boolean;
  readOnly: boolean;
  onUpdate: (updates: Partial<ContentBlock>) => void;
  onDelete: () => void;
  onAddAfter: (type: ContentBlock['type']) => void;
}

export const AudioBlock: React.FC<AudioBlockProps> = ({
  block,
  isActive,
  readOnly,
  onUpdate,
  onDelete
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const fileName = block.metadata?.fileName || '';
  const fileUrl = block.metadata?.fileUrl || '';
  const caption = block.metadata?.caption || '';
  const showPreview = block.metadata?.showPreview !== false;

  // Manejar selección de audio
  const handleAudioSelect = (file: File) => {
    if (!file.type.startsWith('audio/')) {
      alert('Please select a valid audio file');
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
        showPreview: true
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
    const audioFile = files.find(file => file.type.startsWith('audio/'));
    if (audioFile) {
      handleAudioSelect(audioFile);
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

  return (
    <div className={`
      relative group border-2 border-dashed rounded-lg p-4 transition-all duration-200
      ${isDragOver ? 'border-purple-400 bg-purple-50 dark:bg-purple-900/20' : 'border-gray-300 dark:border-gray-600'}
      ${isActive ? 'ring-2 ring-purple-500 ring-opacity-50' : ''}
    `}>
      {/* Controles de bloque */}
      {isActive && !readOnly && (
        <div className="absolute -top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {fileName && (
            <button
              onClick={togglePreview}
              className="p-1 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
              title={showPreview ? 'Hide preview' : 'Show preview'}
            >
              {showPreview ? <EyeSlashIcon className="w-3 h-3" /> : <EyeIcon className="w-3 h-3" />}
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <TrashIcon className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Área de audio */}
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
          <MusicalNoteIcon className="w-16 h-16 text-gray-400 mb-3" />
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            {readOnly ? 'No audio attached' : 'Click to upload or drag and drop an audio file here'}
          </p>
          {!readOnly && (
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
              Supports MP3, WAV, OGG, AAC
            </p>
          )}
        </div>
      ) : (
        // Estado con audio
        <div className="space-y-4">
          {showPreview ? (
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
              <MusicalNoteIcon className="w-8 h-8 text-purple-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {fileName}
                </p>
                <audio
                  ref={audioRef}
                  controls
                  className="w-full"
                  style={{ height: '40px' }}
                >
                  <source src={fileUrl} />
                  Your browser does not support the audio tag.
                </audio>
              </div>
            </div>
          ) : (
            <div 
              className="flex items-center justify-center py-6 bg-purple-100 dark:bg-purple-800 rounded-lg cursor-pointer hover:bg-purple-200 dark:hover:bg-purple-700 transition-colors"
              onClick={togglePreview}
            >
              <PlayIcon className="w-8 h-8 text-purple-600 dark:text-purple-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                  {fileName}
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400">
                  Click to show audio player
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

      {/* Input oculto para selección de audio */}
      {!readOnly && (
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleAudioSelect(file);
          }}
        />
      )}
    </div>
  );
};

export default AudioBlock;
