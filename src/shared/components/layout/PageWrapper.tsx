import React from 'react';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente wrapper global para todas las páginas
 * Asegura que el contenido use el 100% del espacio disponible
 * y mantiene consistencia visual en todo el sistema
 */
export const PageWrapper: React.FC<PageWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`page-content ${className}`}>
      {children}
    </div>
  );
};

interface ContentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper para contenido principal de las páginas
 */
export const ContentWrapper: React.FC<ContentWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`page-content ${className}`}>
      {children}
    </div>
  );
};

interface TableWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper específico para tablas que asegura el uso completo del ancho
 */
export const TableWrapper: React.FC<TableWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`table-wrapper ${className}`}>
      {children}
    </div>
  );
};

interface SearchWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper para campos de búsqueda con ancho limitado
 */
export const SearchWrapper: React.FC<SearchWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`search-container ${className}`}>
      {children}
    </div>
  );
};

interface FiltersWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Wrapper para contenedores de filtros
 */
export const FiltersWrapper: React.FC<FiltersWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`filters-container ${className}`}>
      {children}
    </div>
  );
};

/**
 * Wrapper para páginas que necesitan usar el 100% del ancho sin padding
 * Útil para dashboards, tablas grandes, etc.
 */
export const FullWidthPageWrapper: React.FC<PageWrapperProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`page-content-full ${className}`}>
      {children}
    </div>
  );
};
