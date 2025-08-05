/**
 * =================================================================
 * COMPONENTE: BOTÓN DE EXPORTACIÓN PDF
 * =================================================================
 * Descripción: Botón para exportar documentos a PDF usando @react-pdf/renderer
 * Versión: 2.0
 * Fecha: 5 de Agosto, 2025
 * =================================================================
 */

import React, { useState } from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { downloadPDF, createFallbackPDF } from '../services/pdfExportService';
import { BlockNoteDocument, PDFExportOptions } from '../../types/blocknotePdf';

interface PDFExportButtonProps {
  document: BlockNoteDocument;
  options?: PDFExportOptions;
  filename?: string;
  title?: string;
  onExportStart?: () => void;
  onExportSuccess?: () => void;
  onExportError?: (error: Error) => void;
  className?: string;
  children?: React.ReactNode;
}

export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  document,
  options = {},
  filename,
  title = 'Exportar PDF',
  onExportStart,
  onExportSuccess,
  onExportError,
  className = '',
  children
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!document) {
      console.error('❌ [PDFExportButton] No document provided for PDF export');
      alert('Error: No hay documento para exportar');
      return;
    }

    // Validación básica del documento
    if (!document.title || !document.content) {
      console.error('❌ [PDFExportButton] Document missing required fields:', document);
      alert('Error: El documento no tiene el formato válido para exportar');
      return;
    }

    try {
      setIsExporting(true);
      onExportStart?.();

      console.log('🚀 [PDFExportButton] Starting PDF export', { 
        title: document.title,
        contentBlocks: document.content?.length || 0,
        filename 
      });

      const exportOptions: PDFExportOptions = {
        fileName: filename || `${document.title.replace(/[^\w\s]/gi, '_')}.pdf`,
        ...options
      };

      await downloadPDF(document, exportOptions);

      onExportSuccess?.();
      console.log('✅ [PDFExportButton] PDF export completed successfully');
    } catch (error) {
      console.error('❌ [PDFExportButton] Error during PDF export:', error);
      
      // Log adicional para debugging
      console.error('📋 [PDFExportButton] Document details:', {
        hasTitle: !!document.title,
        hasContent: !!document.content,
        contentLength: document.content?.length,
        documentKeys: Object.keys(document || {})
      });

      onExportError?.(error as Error);
      
      // Mensaje de error más informativo con opción de PDF simplificado
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      const tryFallback = confirm(
        `❌ Error al exportar PDF: ${errorMessage}\n\n¿Desea intentar crear un PDF simplificado con solo el título y contenido básico?`
      );
      
      if (tryFallback) {
        try {
          console.log('🆘 [PDFExportButton] Intentando PDF de emergencia...');
          const fallbackContent = document.content?.map(block => 
            Array.isArray(block.content) ? 
              block.content.map(c => c.text).join(' ') : 
              String(block.content || '')
          ).join('\n') || 'Sin contenido disponible';
          
          await createFallbackPDF(document.title || 'Documento', fallbackContent);
        } catch (fallbackError) {
          console.error('❌ [PDFExportButton] Error en PDF de emergencia:', fallbackError);
          alert('❌ No se pudo crear ningún tipo de PDF. Revise la consola para más detalles.');
        }
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || !document}
      className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={isExporting ? 'Generando PDF...' : title}
    >
      <DocumentArrowDownIcon className={`h-4 w-4 mr-2 ${isExporting ? 'animate-spin' : ''}`} />
      {isExporting ? 'Generando...' : (children || 'Exportar PDF')}
    </button>
  );
};
