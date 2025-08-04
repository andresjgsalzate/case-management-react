/**
 * =================================================================
 * COMPONENTE: BLOCKNOTE CONTENT VIEWER - VISOR DE CONTENIDO
 * =================================================================
 * Descripción: Componente para mostrar contenido de BlockNote en modo solo lectura
 * Versión: 1.0
 * Fecha: 4 de Agosto, 2025
 * =================================================================
 */

import React from 'react';
import { BlockNoteDocumentEditor, convertFromLegacyToBlockNote } from './editor/BlockNoteDocumentEditor';

interface BlockNoteContentViewerProps {
  content: any;
  className?: string;
}

export const BlockNoteContentViewer: React.FC<BlockNoteContentViewerProps> = ({
  content,
  className = ""
}) => {
  return (
    <div className={`blocknote-viewer ${className}`}>
      <BlockNoteDocumentEditor
        value={convertFromLegacyToBlockNote(content)}
        onChange={() => {}} // No-op para modo solo lectura
        readOnly={true}
        className="w-full"
      />
    </div>
  );
};

export default BlockNoteContentViewer;
