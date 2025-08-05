/**
 * =================================================================
 * PÁGINA PRINCIPAL DEL MÓDULO DE DOCUMENTACIÓN
 * =================================================================
 * Descripción: Dashboard principal para gestionar documentos
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { Button } from '@/shared/components/ui/Button';
import { EnhancedDocumentationEditor } from '../components/documentation/editor/EnhancedDocumentationEditor';
import { AdvancedSearchComponent } from '../components/AdvancedSearchComponent';
import { TemplateSelector } from '../components/TemplateSelector';
import { useDocumentation } from '../hooks/useDocumentation';
import { useNotesPermissions } from '../hooks/useNotesPermissions';
import { DocumentSearchFilters, SolutionDocument } from '../types';
import { Trash2, FileText } from 'lucide-react';
import { ConfirmationModal } from '@/shared/components/ui/ConfirmationModal';

export const DocumentationPage: React.FC = () => {
  const navigate = useNavigate();
  const [showEditor, setShowEditor] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  // @ts-ignore: selectedTemplate se usará cuando se implemente el paso de plantilla al editor
  const [selectedTemplate, setSelectedTemplate] = useState<SolutionDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<DocumentSearchFilters>({});
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; title: string } | null>(null);
  
  const { canCreateNotes } = useNotesPermissions();
  
  const { 
    documents, 
    pagination,
    isLoading, 
    searchDocuments,
    deleteDocument 
  } = useDocumentation();

  // Ejecutar búsqueda cuando cambien los filtros
  React.useEffect(() => {
    searchDocuments(filters, 1, 20);
  }, [filters, searchDocuments]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilters(prev => ({ ...prev, search: term }));
  };

  const handleSearchExecute = (term: string) => {
    setSearchTerm(term);
    setFilters(prev => ({ ...prev, search: term }));
  };

  const handleDocumentSelect = (documentId: string) => {
    // Por ahora, buscar el documento en la lista y resaltarlo
    const doc = documents?.find((doc: any) => doc.id === documentId);
    if (doc) {
      // Forzar actualización de filtros para mostrar este documento específicamente
      setFilters(prev => ({ ...prev, search: doc.title }));
      setSearchTerm(doc.title);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocumentToDelete(null);
      // Refrescar la lista (esto se hace automáticamente en el hook)
    } catch (error) {
      console.error('Error al eliminar documento:', error);
      // Aquí podrías mostrar una notificación de error
    }
  };

  const confirmDelete = (id: string, title: string) => {
    setDocumentToDelete({ id, title });
  };

  const handleTemplateSelect = (template: SolutionDocument) => {
    setSelectedTemplate(template);
    setShowTemplateSelector(false);
    setShowEditor(true);
  };

  const handleNewDocument = () => {
    setSelectedTemplate(null);
    setShowEditor(true);
  };

  if (showEditor) {
    return (
      <EnhancedDocumentationEditor
        onSave={() => {
          setShowEditor(false);
          setSelectedTemplate(null);
        }}
        onCancel={() => {
          setShowEditor(false);
          setSelectedTemplate(null);
        }}
      />
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header personalizado */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Base de Conocimiento
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Documentación y soluciones de casos
          </p>
        </div>
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Documentos</h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{pagination?.totalCount || 0}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Documentos Publicados</h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {documents?.filter(doc => doc.is_published).length || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Templates</h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {documents?.filter(doc => doc.is_template).length || 0}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Borradores</h3>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {documents?.filter(doc => !doc.is_published).length || 0}
            </p>
          </div>
        </div>

        {/* Controles principales */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <AdvancedSearchComponent
              value={searchTerm}
              onChange={handleSearch}
              onSearchExecute={handleSearchExecute}
              onDocumentSelect={handleDocumentSelect}
              placeholder="Buscar por palabras, frases, números, códigos, fragmentos de texto..."
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2">
            {canCreateNotes && (
              <Button 
                variant="outline"
                onClick={() => setShowTemplateSelector(true)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Plantillas
              </Button>
            )}
            {canCreateNotes && (
              <Button onClick={handleNewDocument}>
                + Nuevo Documento
              </Button>
            )}
          </div>
        </div>

        {/* Lista de documentos */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Documentos ({documents?.length || 0} de {pagination?.totalCount || 0})
            </h2>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Cargando documentos...</p>
              </div>
            ) : documents && documents.length > 0 ? (
              <div className="space-y-4">
                {documents.map((doc: any) => (
                  <div 
                    key={doc.id}
                    id={`document-card-${doc.id}`}
                    data-document-id={doc.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {doc.title}
                        </h3>
                        
                        {/* Etiquetas */}
                        {doc.tags && doc.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {doc.tags.slice(0, 3).map((tag: any) => (
                              <span 
                                key={tag.id}
                                className="px-2 py-1 text-xs rounded"
                                style={{ 
                                  backgroundColor: tag.color + '20', 
                                  color: tag.color,
                                  border: `1px solid ${tag.color}40`
                                }}
                              >
                                {tag.name}
                              </span>
                            ))}
                            {doc.tags.length > 3 && (
                              <span className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                +{doc.tags.length - 3} más
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Información principal */}
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                            {doc.solution_type}
                          </span>
                          <span>Dificultad: {'⭐'.repeat(doc.difficulty_level || 1)}</span>
                          <span>{doc.view_count || 0} vistas</span>
                          {doc.helpful_count > 0 && (
                            <span>👍 {doc.helpful_count}</span>
                          )}
                        </div>
                        
                        {/* Metadatos adicionales */}
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
                          <span>Por: {doc.created_by_profile?.full_name || doc.created_by_profile?.email || doc.created_by}</span>
                          <span>Creado: {new Date(doc.created_at).toLocaleDateString('es-ES')}</span>
                          {doc.updated_at !== doc.created_at && (
                            <span>Actualizado: {new Date(doc.updated_at).toLocaleDateString('es-ES')}</span>
                          )}
                          {doc.estimated_solution_time && (
                            <span>⏱️ ~{doc.estimated_solution_time} min</span>
                          )}
                        </div>
                        
                        {/* Estados */}
                        <div className="flex items-center gap-2 mt-2">
                          {doc.is_template && (
                            <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                              Template
                            </span>
                          )}
                          {doc.is_published ? (
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                              Publicado
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded text-xs">
                              Borrador
                            </span>
                          )}
                          {doc.is_deprecated && (
                            <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-xs">
                              Obsoleto
                            </span>
                          )}
                          {doc.case_id && (
                            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs">
                              Caso: {doc.case_id}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/documentation/${doc.id}/view`)}
                        >
                          Ver
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => navigate(`/documentation/${doc.id}/edit`)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => confirmDelete(doc.id, doc.title)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  {searchTerm ? 'No se encontraron documentos que coincidan con tu búsqueda.' : 'No hay documentos aún. Crea el primero.'}
                </p>
                {!searchTerm && (
                  <Button 
                    className="mt-4"
                    onClick={() => setShowEditor(true)}
                  >
                    Crear Primer Documento
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        onConfirm={() => documentToDelete && handleDeleteDocument(documentToDelete.id)}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el documento "${documentToDelete?.title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />

      {/* Modal selector de plantillas */}
      <TemplateSelector
        isOpen={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
        onSelectTemplate={handleTemplateSelect}
      />
    </PageWrapper>
  );
};
