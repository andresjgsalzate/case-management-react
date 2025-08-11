/**
 * =================================================================
 * PROVIDER: ESTILOS GLOBALES BLOCKNOTE
 * =================================================================
 * Descripción: Provider para asegurar estilos globales de BlockNote
 * Versión: 1.0
 * Fecha: 11 de Agosto, 2025
 * =================================================================
 */

import React, { useEffect } from 'react';

interface BlockNoteStylesProviderProps {
  children: React.ReactNode;
}

export const BlockNoteStylesProvider: React.FC<BlockNoteStylesProviderProps> = ({ children }) => {
  useEffect(() => {
    // Asegurar que los estilos de dropdown están aplicados globalmente
    const style = document.createElement('style');
    style.textContent = `
      /* Estilos globales para dropdowns de BlockNote */
      .bn-editor .bn-dropdown-menu {
        z-index: 10000 !important;
        position: absolute !important;
        background: white !important;
        border: 1px solid #e5e7eb !important;
        border-radius: 6px !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        max-height: 200px !important;
        overflow-y: auto !important;
        min-width: 120px !important;
      }
      
      .bn-editor[data-color-scheme="dark"] .bn-dropdown-menu {
        background: #374151 !important;
        border-color: #4b5563 !important;
        color: white !important;
      }
      
      .bn-editor .bn-dropdown-item {
        padding: 8px 12px !important;
        cursor: pointer !important;
        font-size: 14px !important;
        transition: background-color 0.15s ease !important;
      }
      
      .bn-editor .bn-dropdown-item:hover {
        background-color: #f3f4f6 !important;
      }
      
      .bn-editor[data-color-scheme="dark"] .bn-dropdown-item:hover {
        background-color: #4b5563 !important;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return <>{children}</>;
};

export default BlockNoteStylesProvider;
