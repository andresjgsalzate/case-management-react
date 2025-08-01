import React from 'react';
import { 
  PencilIcon, 
  TrashIcon, 
  ArchiveBoxIcon, 
  ArchiveBoxXMarkIcon,
  ClockIcon,
  TagIcon,
  UserIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { ExclamationTriangleIcon as ExclamationTriangleSolid } from '@heroicons/react/24/solid';
import { Note } from '@/types';
import { useNotesPermissions } from '@/notes-knowledge/hooks/useNotesPermissions';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (note: Note) => void;
  onArchive: (note: Note) => void;
  onUnarchive: (note: Note) => void;
  currentUserId: string;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
  currentUserId
}) => {
  const { 
    canEditNotes, 
    canEditAllNotes, 
    canDeleteNotes, 
    canDeleteAllNotes,
    canArchiveNotes 
  } = useNotesPermissions();

  const canEdit = canEditAllNotes || (canEditNotes && note.createdBy === currentUserId);
  const canDelete = canDeleteAllNotes || (canDeleteNotes && note.createdBy === currentUserId);
  const canArchive = canArchiveNotes;

  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: es 
    });
  };

  const formatReminderDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isReminderActive = (reminderDate: string) => {
    return new Date(reminderDate) <= new Date();
  };

  return (
    <div 
      id={`note-${note.id}`}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border ${
        note.isImportant ? 'border-red-200 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'
      } hover:shadow-md transition-shadow`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {note.title}
              </h3>
              {note.isImportant && (
                <ExclamationTriangleSolid className="h-5 w-5 text-red-500" />
              )}
            </div>
            
            {/* Metadata */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <UserIcon className="h-4 w-4" />
                <span>{note.createdByUser?.fullName || note.createdByUser?.email}</span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                <span>{formatDate(note.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => onEdit(note)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Editar nota"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
            )}
            
            {canArchive && (
              <button
                onClick={() => note.isArchived ? onUnarchive(note) : onArchive(note)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title={note.isArchived ? 'Desarchivar nota' : 'Archivar nota'}
              >
                {note.isArchived ? (
                  <ArchiveBoxXMarkIcon className="h-4 w-4" />
                ) : (
                  <ArchiveBoxIcon className="h-4 w-4" />
                )}
              </button>
            )}
            
            {canDelete && (
              <button
                onClick={() => onDelete(note)}
                className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                title="Eliminar nota"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-4">
          {note.content}
        </p>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {note.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              >
                <TagIcon className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Associated Case */}
        {note.case && (
          <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <DocumentTextIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Caso: <span className="font-medium">{note.case.numeroCaso}</span> - {note.case.descripcion}
            </span>
          </div>
        )}

        {/* Assigned User */}
        {note.assignedToUser && note.assignedToUser.id !== note.createdBy && (
          <div className="flex items-center gap-2 mb-4">
            <UserIcon className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Asignado a: <span className="font-medium">{note.assignedToUser.fullName || note.assignedToUser.email}</span>
            </span>
          </div>
        )}

        {/* Reminder */}
        {note.reminderDate && (
          <div className={`flex items-center gap-2 p-2 rounded ${
            isReminderActive(note.reminderDate) 
              ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200' 
              : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            <ClockIcon className="h-4 w-4" />
            <span className="text-sm">
              Recordatorio: {formatReminderDate(note.reminderDate)}
              {isReminderActive(note.reminderDate) && (
                <span className="ml-2 font-medium">¡Activo!</span>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Footer - Archived info */}
      {note.isArchived && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-b-lg border-t border-gray-200 dark:border-gray-600">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <ArchiveBoxIcon className="h-4 w-4" />
            <span>
              Archivado {formatDate(note.archivedAt!)}
              {note.archivedByUser && (
                <span> por {note.archivedByUser.fullName || note.archivedByUser.email}</span>
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
