import React, { useState } from 'react';
import { PlusIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { Button } from './Button';
import { NoteCard } from './NoteCard';
import { NoteForm } from './NoteForm';
import { LoadingSpinner } from './LoadingSpinner';
import { useNotification } from './NotificationSystem';
import { useNotesByCase, useCreateNote, useUpdateNote, useDeleteNote, useArchiveNote } from '@/hooks/useNotes';
import { useNotesPermissions } from '@/hooks/useNotesPermissions';
import { useAuth } from '@/hooks/useAuth';
import { Note, NoteFormData } from '@/types';
import { ConfirmationModal } from './ConfirmationModal';

interface CaseNotesProps {
  caseId: string;
  caseNumber: string;
  caseDescription: string;
}

export const CaseNotes: React.FC<CaseNotesProps> = ({
  caseId,
  caseNumber,
  caseDescription
}) => {
  const { user } = useAuth();
  const { canCreateNotes, canAssociateCases } = useNotesPermissions();
  const { showSuccess, showError } = useNotification();

  // Estado para modales
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

  // Hooks para datos
  const { data: notes, isLoading } = useNotesByCase(caseId);

  // Mutaciones
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
        caseId // Asociar automáticamente con el caso
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ChatBubbleLeftRightIcon className="h-6 w-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Notas del Caso
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({notes?.length || 0})
          </span>
        </div>
        {canCreateNotes && (
          <Button
            onClick={handleCreateNote}
            size="sm"
            className="flex items-center"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Agregar Nota
          </Button>
        )}
      </div>

      {/* Case Info */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          <span className="font-medium">Caso:</span> {caseNumber} - {caseDescription}
        </p>
      </div>

      {/* Notes List */}
      {notes && notes.length > 0 ? (
        <div className="space-y-4">
          {notes.map(note => (
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
          <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-300 mb-2">
            No hay notas para este caso
          </h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Agrega una nota para documentar información relevante sobre este caso.
          </p>
          {canCreateNotes && (
            <Button
              onClick={handleCreateNote}
              size="sm"
              className="flex items-center mx-auto"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Crear Primera Nota
            </Button>
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
          caseId // Mantener la asociación con el caso
        } : {
          caseId // Pre-seleccionar el caso actual
        }}
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
