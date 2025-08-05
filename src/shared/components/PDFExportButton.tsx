import React from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/outline';

interface PDFExportButtonProps {
  content?: any;
  document?: any; // Agregar document como prop opcional
  filename?: string;
  title?: string;
  onExport?: () => void;
  className?: string;
  children?: React.ReactNode;
}

// Componente temporal de exportación PDF
export const PDFExportButton: React.FC<PDFExportButtonProps> = ({
  content,
  document,
  filename = 'document.pdf',
  title = 'Exportar PDF',
  onExport,
  className = '',
  children
}) => {
  const handleExport = () => {
    console.log('PDFExportButton: Exporting to PDF', { content, document, filename });
    
    // Implementación temporal - solo muestra alerta
    alert(`Función de exportación PDF en desarrollo.\nArchivo: ${filename}`);
    
    if (onExport) {
      onExport();
    }
  };

  return (
    <button
      onClick={handleExport}
      className={`inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${className}`}
      title={title}
    >
      <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
      {children || 'Exportar PDF'}
    </button>
  );
};
