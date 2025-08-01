import React, { useState } from 'react';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon,
  DocumentTextIcon,
  ClockIcon,
  ArchiveBoxIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { PageWrapper } from '@/shared/components/layout/PageWrapper';
import { Button } from '@/shared/components/ui/Button';
import { Input } from '@/shared/components/ui/Input';
import { Select } from '@/shared/components/ui/Select';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { NoteCard } from '@/notes-knowledge/components/NoteCard';
import { NoteForm } from '@/notes-knowledge/components/NoteForm';
import { NotesSearchComponent } from '@/notes-knowledge/components/NotesQuickSearch';
import { ConfirmationModal } from '@/shared/components/ui/ConfirmationModal';
import { useNotification } from '@/shared/components/notifications/NotificationSystem';
import { useNotes, useCreateNote, useUpdateNote, useDeleteNote, useArchiveNote, useNotesStats, useNoteTags } from '@/notes-knowledge/hooks/useNotes';
import { useNotesPermissions } from '@/notes-knowledge/hooks/useNotesPermissions';
import { useCases } from '@/case-management/hooks/useCases';
import { useUsers } from '@/user-management/hooks/useUsers';
import { useAuth } from '@/shared/hooks/useAuth';
import { Note, NoteFormData, NoteFilters } from '@/types';

export const NotesPage: React.FC = () => {
  const { user } = useAuth();
  const { 
    canCreateNotes, 
    canAccessNotesModule, 
    canViewAllNotes
  } = useNotesPermissions();
  const { showSuccess, showError } = useNotification();

  // Estado para filtros
  const [filters, setFilters] = useState<NoteFilters>({
    isArchived: false
  });
  
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

  // Estado para interfaz
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'my' | 'assigned' | 'important' | 'archived'>('all');

  // Hooks para datos
  const { data: notes, isLoading: notesLoading } = useNotes(filters);
  const { data: stats } = useNotesStats();
  const { data: tags } = useNoteTags();
  const { data: cases } = useCases();
  const { data: users } = useUsers();

  // Mutaciones
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const archiveNote = useArchiveNote();

  // Verificar permisos
  if (!canAccessNotesModule) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            Acceso denegado
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            No tienes permisos para acceder al módulo de notas.
          </p>
        </div>
      </PageWrapper>
    );
  }

  // Filtrar notas según el modo de vista
  const filteredNotes = notes?.filter(note => {
    switch (viewMode) {
      case 'my':
        return note.createdBy === user?.id;
      case 'assigned':
        return note.assignedTo === user?.id;
      case 'important':
        return note.isImportant;
      case 'archived':
        return note.isArchived;
      default:
        return true;
    }
  }) || [];

  // Handlers para CRUD
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
      if (isEdit && selectedNote) {
        await updateNote.mutateAsync({
          id: selectedNote.id,
          ...data
        });
        showSuccess('Nota actualizada exitosamente');
      } else {
        await createNote.mutateAsync(data);
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

  // Actualizar filtros
  const updateFilters = (newFilters: Partial<NoteFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  // Cambiar modo de vista
  const handleViewModeChange = (mode: typeof viewMode) => {
    setViewMode(mode);
    if (mode === 'archived') {
      updateFilters({ isArchived: true });
    } else {
      updateFilters({ isArchived: false });
    }
  };

  if (notesLoading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notas
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona tus notas y recordatorios
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filtros
          </Button>
          {canCreateNotes && (
            <Button
              onClick={handleCreateNote}
              className="flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nueva Nota
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <DocumentTextIcon className="h-6 w-6 text-blue-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.totalNotes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <DocumentTextIcon className="h-6 w-6 text-green-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Mis Notas</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.myNotes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <DocumentTextIcon className="h-6 w-6 text-purple-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Asignadas</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.assignedNotes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Importantes</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.importantNotes}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <ClockIcon className="h-6 w-6 text-yellow-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Recordatorios</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.withReminders}</p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <ArchiveBoxIcon className="h-6 w-6 text-gray-500" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Archivadas</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{stats.archivedNotes}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Mode Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleViewModeChange('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'all' 
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Todas las notas
        </button>
        <button
          onClick={() => handleViewModeChange('my')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'my' 
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Mis notas
        </button>
        <button
          onClick={() => handleViewModeChange('assigned')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'assigned' 
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Asignadas a mí
        </button>
        <button
          onClick={() => handleViewModeChange('important')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'important' 
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Importantes
        </button>
        <button
          onClick={() => handleViewModeChange('archived')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            viewMode === 'archived' 
              ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
          }`}
        >
          Archivadas
        </button>
      </div>

      {/* Quick Search */}
      <div className="mb-6">
        <NotesSearchComponent 
          onNoteSelect={(noteId) => {
            // Scroll to note or open it
            const noteElement = document.getElementById(`note-${noteId}`);
            if (noteElement) {
              noteElement.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="max-w-md"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Buscar
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Buscar notas..."
                  value={filters.search || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
                    updateFilters({ search: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            <Select
              label="Etiqueta"
              value={filters.tags?.[0] || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                updateFilters({ tags: e.target.value ? [e.target.value] : [] })
              }
            >
              <option value="">Todas las etiquetas</option>
              {tags?.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </Select>

            <Select
              label="Caso asociado"
              value={filters.caseId || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                updateFilters({ caseId: e.target.value || undefined })
              }
            >
              <option value="">Todos los casos</option>
              {cases?.map(case_ => (
                <option key={case_.id} value={case_.id}>
                  {case_.numeroCaso} - {case_.descripcion}
                </option>
              ))}
            </Select>

            {canViewAllNotes && (
              <Select
                label="Creado por"
                value={filters.createdBy || ''}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                  updateFilters({ createdBy: e.target.value || undefined })
                }
              >
                <option value="">Todos los usuarios</option>
                {users?.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.fullName || user.email}
                  </option>
                ))}
              </Select>
            )}
          </div>
        </div>
      )}

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map(note => (
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

      {/* Empty State */}
      {filteredNotes.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-300">
            No hay notas
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {filters.search || filters.tags?.length || filters.caseId || filters.createdBy
              ? 'No se encontraron notas que coincidan con los filtros.'
              : 'Comienza creando tu primera nota.'}
          </p>
          {canCreateNotes && !filters.search && !filters.tags?.length && !filters.caseId && !filters.createdBy && (
            <div className="mt-6">
              <Button onClick={handleCreateNote} className="flex items-center">
                <PlusIcon className="h-5 w-5 mr-2" />
                Nueva Nota
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Note Form Modal */}
      <NoteForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedNote || undefined}
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
    </PageWrapper>
  );
};
