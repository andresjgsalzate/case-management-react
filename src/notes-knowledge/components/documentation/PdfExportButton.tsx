/**
 * =================================================================
 * COMPONENTE: BOTÓN DE EXPORTACIÓN A PDF PARA DOCUMENTACIÓN
 * =================================================================
 * Descripción: Botón específico para exportar documentos de BlockNote a PDF
 * Versión: 2.0 - Implementación completa con @react-pdf/renderer
 * Fecha: 5 de Agosto, 2025
 * =================================================================
 */

import React from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { PDFExportButton } from '../../../shared';
import { convertToBlockNoteDocument } from '../../../shared/utils/documentConverter';

interface PdfExportButtonProps {
  documentData: any; // Datos del documento desde la base de datos (formato flexible)
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  onExportSuccess?: () => void;
  onExportError?: (error: Error) => void;
}

export const PdfExportButton: React.FC<PdfExportButtonProps> = ({
  documentData,
  className = "",
  variant = 'outline',
  size = 'md',
  showText = true,
  onExportSuccess,
  onExportError
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white border-gray-600';
      case 'outline':
      default:
        return 'bg-white hover:bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 dark:border-gray-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-6 py-3 text-base';
      case 'md':
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'lg':
        return 'h-6 w-6';
      case 'md':
      default:
        return 'h-5 w-5';
    }
  };

  const handleExportSuccess = () => {
    console.log('PDF exportado exitosamente desde PdfExportButton');
    onExportSuccess?.();
  };

  const handleExportError = (error: Error) => {
    console.error('Error en exportación PDF desde PdfExportButton:', error);
    onExportError?.(error);
  };

  if (!documentData) {
    console.warn('PdfExportButton: No se proporcionaron datos del documento');
    return null;
  }

  const convertedDocument = convertToBlockNoteDocument(documentData);

  return (
    <PDFExportButton
      document={convertedDocument}
      filename={`${convertedDocument.title.replace(/[^\w\s]/gi, '_')}.pdf`}
      onExportSuccess={handleExportSuccess}
      onExportError={handleExportError}
      options={{
        includeMetadata: true,
        includeHeader: true,
        includeFooter: true,
        pageFormat: 'A4'
      }}
      className={`
        inline-flex items-center gap-2 border rounded-md font-medium transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${className}
      `}
    >
      <DocumentArrowDownIcon className={getIconSize()} />
      {showText && <span>PDF</span>}
    </PDFExportButton>
  );
};

export default PdfExportButton;
