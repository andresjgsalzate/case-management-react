/**
 * =======================  useEffect(() => {
    if (id) {
      getDocument(id);
    }
  }, [id, getDocument]);==============================
 * PÁGINA: EDITAR DOCUMENTO DE SOLUCIÓN
 * =================================================================
 * Descripción: Página para editar un documento específico
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { Button } from '@/shared/components/ui/Button';
import { EnhancedDocumentationEditor } from '../components/documentation/editor/EnhancedDocumentationEditor';
import { BlockNoteContentViewer } from '../components/documentation/BlockNoteContentViewer';
import { PdfExportButton } from '../components/documentation/PdfExportButton';
import { UserDisplay } from '../components/UserDisplay';
import { CaseDisplay } from '../components/CaseDisplay';
import { useDocumentation } from '../hooks/useDocumentation';
import { Trash2 } from 'lucide-react';
import { ConfirmationModal } from '@/shared/components/ui/ConfirmationModal';

export const DocumentEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isViewMode = location.pathname.includes('/view');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const { getDocument, deleteDocument, isLoading, error, currentDocument } = useDocumentation();

  useEffect(() => {
    if (id) {
      getDocument(id);
    }
  }, [id, getDocument]);

  const document = currentDocument;

  const handleSave = () => {
    navigate('/documentation');
  };

  const handleCancel = () => {
    navigate('/documentation');
  };

  const handleDelete = async () => {
    if (!document) return;
    
    try {
      await deleteDocument(document.id);
      // Navegar con state para indicar que se eliminó un documento
      navigate('/documentation', { 
        replace: true,
        state: { documentDeleted: true, deletedId: document.id }
      });
    } catch (error) {
      console.error('Error al eliminar documento:', error);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando documento...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error || !document) {
    return (
      <PageWrapper>
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Documento no encontrado
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            El documento que buscas no existe o no tienes permisos para verlo.
          </p>
          <button 
            onClick={() => navigate('/documentation')}
            className="text-primary-600 hover:text-primary-500"
          >
            Volver a documentación
          </button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <>
      {isViewMode ? (
        <PageWrapper>
          <div className="w-full max-w-none mx-auto px-4">
            {/* Header para modo vista */}
            <div className="mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {document.title}
                  </h1>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                    <span>Dificultad: {'⭐'.repeat(document.difficulty_level || 1)}</span>
                    <span>{document.view_count || 0} vistas</span>
                    {document.is_published && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                        Publicado
                      </span>
                    )}
                    {document.is_template && (
                      <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs">
                        Plantilla
                      </span>
                    )}
                  </div>
                  
                  {/* Metadatos adicionales */}
                  <div className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-4">
                      <span><strong>Tipo:</strong> {document.solution_type}</span>
                      {document.estimated_solution_time && (
                        <span><strong>Tiempo estimado:</strong> {document.estimated_solution_time} minutos</span>
                      )}
                    </div>
                    
                    {/* Información del caso */}
                    {(document.case_id || document.archived_case_id) && (
                      <div>
                        <strong>Caso relacionado:</strong>{' '}
                        <CaseDisplay 
                          caseId={(document.case_id || document.archived_case_id)!}
                          isArchived={document.case_reference_type === 'archived'}
                          showDescription={true}
                        />
                      </div>
                    )}
                    
                    {/* Fechas y autor */}
                    <div className="flex items-center gap-4">
                      <span>
                        <strong>Creado por:</strong>{' '}
                        <UserDisplay userId={document.created_by} showEmail={true} />
                      </span>
                      <span><strong>Fecha:</strong> {new Date(document.created_at).toLocaleDateString('es-ES')}</span>
                      {document.updated_by && document.updated_by !== document.created_by && (
                        <span>
                          <strong>Actualizado por:</strong>{' '}
                          <UserDisplay userId={document.updated_by} showEmail={true} />
                        </span>
                      )}
                      <span><strong>Actualizado:</strong> {new Date(document.updated_at).toLocaleDateString('es-ES')}</span>
                    </div>
                    
                    {/* Prerrequisitos */}
                    {document.prerequisites && (
                      <div>
                        <strong>Prerrequisitos:</strong> {document.prerequisites}
                      </div>
                    )}
                    
                    {/* Notas de complejidad */}
                    {document.complexity_notes && (
                      <div>
                        <strong>Notas de complejidad:</strong> {document.complexity_notes}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <PdfExportButton
                    documentData={{
                      id: document.id,
                      title: document.title,
                      content: document.content as any,
                      created_at: document.created_at,
                      updated_at: document.updated_at,
                      created_by: document.created_by,
                      created_by_profile: document.created_by_profile,
                      case_id: document.case_id,
                      archived_case_id: document.archived_case_id,
                      case_reference_type: document.case_reference_type,
                      case_info: document.case_info,
                      caseNumber: document.caseNumber, // ✅ AGREGAR NÚMERO DE CASO
                      category: document.solution_type,
                      tags: document.tags?.map(tag => tag.name) || [],
                      difficulty_level: document.difficulty_level,
                      estimated_solution_time: document.estimated_solution_time,
                      solution_type: document.solution_type
                    }}
                    variant="outline"
                    size="md"
                  />
                  <Button
                    variant="outline"
                    onClick={() => navigate(`/documentation/${id}/edit`)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => navigate('/documentation')}
                  >
                    Volver
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Contenido del documento en modo vista */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              {/* Etiquetas del documento */}
              {document.tags && document.tags.length > 0 && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Etiquetas:</h3>
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag) => (
                      <span
                        key={tag.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: tag.color ? `${tag.color}15` : '#e5e7eb',
                          color: tag.color || '#374151',
                          border: `1px solid ${tag.color || '#d1d5db'}`,
                        }}
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Contenido renderizado */}
              <div id="document-content" className="p-6" data-pdf-content>
                <div id="document-pdf-content" className="pdf-export-wrapper">
                  <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                    {document.title}
                  </h1>
                  
                  <div className="document-metadata mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border-l-4 border-blue-500">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Tipo:</strong> {document.solution_type}</div>
                      <div><strong>Dificultad:</strong> {'⭐'.repeat(document.difficulty_level || 1)}</div>
                      <div><strong>Creado:</strong> {new Date(document.created_at).toLocaleDateString('es-ES')}</div>
                      <div><strong>Vistas:</strong> {document.view_count || 0}</div>
                    </div>
                    {document.tags && document.tags.length > 0 && (
                      <div className="mt-3">
                        <strong>Etiquetas:</strong> {document.tags.map(tag => tag.name).join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="document-main-content">
                    {document.content ? (
                      <BlockNoteContentViewer 
                        content={document.content}
                        documentId={document.id}
                        className="max-w-none"
                      />
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 italic">
                        Este documento no tiene contenido.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </PageWrapper>
      ) : (
        <div className="h-screen">
          <EnhancedDocumentationEditor
            document={document}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el documento "${document.title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </>
  );
};
