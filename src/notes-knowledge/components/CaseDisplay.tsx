import React from 'react';
import { useCaseInfo } from '../hooks/useCaseInfo';

interface CaseDisplayProps {
  caseId: string;
  isArchived?: boolean;
  showDescription?: boolean;
}

export const CaseDisplay: React.FC<CaseDisplayProps> = ({ 
  caseId, 
  isArchived = false,
  showDescription = true
}) => {
  const { caseInfo, loading } = useCaseInfo(caseId, isArchived);

  if (loading) {
    return <span className="text-gray-500">Cargando caso...</span>;
  }

  if (!caseInfo) {
    return <span className="text-gray-500">Caso no encontrado</span>;
  }

  const caseNumber = isArchived ? caseInfo.case_number : caseInfo.numero_caso;
  const description = isArchived ? caseInfo.description : caseInfo.descripcion;

  return (
    <span>
      <strong>{caseNumber}</strong>
      {showDescription && description && (
        <>
          {' - '}
          <span className="text-sm">
            {description.length > 80 ? `${description.substring(0, 80)}...` : description}
          </span>
        </>
      )}
      {isArchived && (
        <span className="ml-2 px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 rounded text-xs">
          Archivado
        </span>
      )}
    </span>
  );
};
