import React, { useState } from 'react';
import { 
  PlusIcon, 
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { Button } from './Button';
import { NoteCard } from './NoteCard';
import { NoteForm } from './NoteForm';
import { ConfirmationModal } from './ConfirmationModal';
import { useNotification } from './NotificationSystem';
import { useNotesByCase, useCreateNote, useUpdateNote, useDeleteNote, useArchiveNote } from '@/hooks/useNotes';
import { useNotesPermissions } from '@/hooks/useNotesPermissions';
import { useAuth } from '@/hooks/useAuth';
import { Note, NoteFormData } from '@/types';

interface CaseNotesProps {
  caseId: string;
  caseNumber?: string;
  caseDescription?: string;
  showHeader?: boolean;
}

export const CaseNotes: React.FC<CaseNotesProps> = ({
  caseId,
  showHeader = true
}) => {
  const { user } = useAuth();
  const { canCreateNotes, canAssociateCases } = useNotesPermissions();
  const { showSuccess, showError } = useNotification();

  // Estado
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    note: Note | null;
  }>({
    isOpen: false,
    note: null
  });

  // Hooks
  const { data: notes, isLoading } = useNotesByCase(caseId);
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const archiveNote = useArchiveNote();

  // Verificar permisos
  if (!canAssociateCases) {
    return null;
  }

  // Handlers
  const handleCreateNote = () => {
    setSelectedNote(null);
    setIsEdit(false);
    setIsFormOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setSelectedNote(note);
    setIsEdit(true);
    setIsFormOpen(true);
  };

  const handleDeleteNote = (note: Note) => {
    setDeleteModal({
      isOpen: true,
      note
    });
  };

  const handleArchiveNote = async (note: Note) => {
    try {
      await archiveNote.mutateAsync({
        noteId: note.id,
        archive: !note.isArchived
      });
      showSuccess(`Nota ${note.isArchived ? 'desarchivada' : 'archivada'} exitosamente`);
    } catch (error) {
      showError('Error al archivar nota', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleFormSubmit = async (data: NoteFormData) => {
    try {
      const noteData = {
        ...data,
        caseId // Asociar automáticamente al caso
      };

      if (isEdit && selectedNote) {
        await updateNote.mutateAsync({
          id: selectedNote.id,
          ...noteData
        });
        showSuccess('Nota actualizada exitosamente');
      } else {
        await createNote.mutateAsync(noteData);
        showSuccess('Nota creada exitosamente');
      }
      setIsFormOpen(false);
    } catch (error) {
      showError('Error al guardar nota', error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const confirmDelete = async () => {
    if (deleteModal.note) {
      try {
        await deleteNote.mutateAsync(deleteModal.note.id);
        showSuccess('Nota eliminada exitosamente');
        setDeleteModal({ isOpen: false, note: null });
      } catch (error) {
        showError('Error al eliminar nota', error instanceof Error ? error.message : 'Error desconocido');
      }
    }
  };

  const notesCount = notes?.filter(note => !note.isArchived).length || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {showHeader && (
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                <span className="font-medium">
                  Notas del Caso ({notesCount})
                </span>
                {isExpanded ? (
                  <ChevronUpIcon className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 ml-2" />
                )}
              </button>
            </div>
            {isExpanded && canCreateNotes && (
              <Button
                size="sm"
                onClick={handleCreateNote}
                className="flex items-center"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Nueva Nota
              </Button>
            )}
          </div>
        </div>
      )}

      {(isExpanded || !showHeader) && (
        <div className="p-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            </div>
          ) : notes && notes.length > 0 ? (
            <div className="space-y-4">
              {notes
                .filter(note => !note.isArchived)
                .map(note => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onEdit={handleEditNote}
                    onDelete={handleDeleteNote}
                    onArchive={handleArchiveNote}
                    onUnarchive={handleArchiveNote}
                    currentUserId={user?.id || ''}
                  />
                ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
                No hay notas asociadas
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Agrega notas para documentar información importante sobre este caso.
              </p>
              {canCreateNotes && (
                <div className="mt-6">
                  <Button onClick={handleCreateNote} className="flex items-center">
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Agregar Nota
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Note Form Modal */}
      <NoteForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedNote ? {
          ...selectedNote,
          caseId
        } : { caseId }}
        isEdit={isEdit}
        loading={createNote.isPending || updateNote.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        title="Confirmar eliminación"
        message={`¿Estás seguro de que quieres eliminar la nota "${deleteModal.note?.title}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onClose={() => setDeleteModal({ isOpen: false, note: null })}
        type="danger"
      />
    </div>
  );
};
