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
  documentId?: string; // Agregar documentId para archivos
}

export const BlockNoteContentViewer: React.FC<BlockNoteContentViewerProps> = ({
  content,
  className = "",
  documentId
}) => {
  // Convertir contenido y validar que existe
  const convertedContent = React.useMemo(() => {
    return convertFromLegacyToBlockNote(content);
  }, [content]);

  return (
    <div className={`blocknote-viewer ${className}`}>
      <BlockNoteDocumentEditor
        value={convertedContent}
        onChange={() => {}} // No-op para modo solo lectura
        readOnly={true}
        className="w-full"
        documentId={documentId}
      />
    </div>
  );
};

export default BlockNoteContentViewer;
