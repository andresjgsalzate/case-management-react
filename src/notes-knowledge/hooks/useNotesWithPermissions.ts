import { useState, useEffect, useCallback } from 'react';
import { useUserProfile } from '@/user-management/hooks/useUserProfile';
import { useNotesPermissions } from './useNotesPermissions';
import { supabase } from '@/shared/lib/supabase';
import { Note, CreateNoteData, UpdateNoteData, NoteFilters } from '@/types';

// Cache para throttling de errores
const errorLogCache = new Map<string, number>();

export const useNotesWithPermissions = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasPermissionError, setHasPermissionError] = useState<boolean>(false);
  const { data: userProfile } = useUserProfile();
  const notesPermissions = useNotesPermissions();

  // Cargar notas con filtros y permisos
  const fetchNotes = useCallback(async (filters?: NoteFilters) => {
    try {
      setLoading(true);
      setError(null);

      // Verificar permisos de acceso al módulo
      if (!notesPermissions.hasAnyNotesPermission) {
        const errorMsg = 'No tiene permisos para acceder a las notas';
        setHasPermissionError(true);
        // Log solo una vez cada 5 segundos para evitar spam
        const now = Date.now();
        const errorKey = 'notes-permission-error';
        const lastLog = errorLogCache.get(errorKey) || 0;
        if (now - lastLog > 5000) {
          errorLogCache.set(errorKey, now);
          console.warn('🔒 [useNotesWithPermissions] Sin permisos de acceso al módulo de notas');
        }
        throw new Error(errorMsg);
      }

      // Determinar el scope más alto de lectura
      const readScope = notesPermissions.getHighestReadScope();
      if (!readScope) {
        throw new Error('No tiene permisos de lectura para notas');
      }

      let query = supabase
        .from('notes')
        .select(`
          *,
          case:cases(id, numero_caso, descripcion),
          created_by_user:user_profiles!notes_created_by_fkey(id, full_name, email),
          assigned_to_user:user_profiles!notes_assigned_to_fkey(id, full_name, email),
          archived_by_user:user_profiles!notes_archived_by_fkey(id, full_name, email)
        `)
        .order('is_important', { ascending: false })
        .order('updated_at', { ascending: false });

      // Aplicar filtros de scope de permisos
      if (readScope === 'own' && userProfile?.id) {
        query = query.eq('created_by', userProfile.id);
      } else if (readScope === 'team' && userProfile?.id) {
        // TODO: Implementar lógica de equipo cuando esté disponible
        // Por ahora, mostrar propias + asignadas
        query = query.or(`created_by.eq.${userProfile.id},assigned_to.eq.${userProfile.id}`);
      }
      // Si readScope === 'all', no aplicar filtro adicional

      // Aplicar filtros del usuario
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      if (filters?.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      if (filters?.createdBy) {
        query = query.eq('created_by', filters.createdBy);
      }

      if (filters?.assignedTo) {
        query = query.eq('assigned_to', filters.assignedTo);
      }

      if (filters?.caseId) {
        query = query.eq('case_id', filters.caseId);
      }

      if (filters?.isImportant !== undefined) {
        query = query.eq('is_important', filters.isImportant);
      }

      if (filters?.isArchived !== undefined) {
        query = query.eq('is_archived', filters.isArchived);
      } else {
        // Por defecto, no mostrar archivadas
        query = query.eq('is_archived', false);
      }

      if (filters?.hasReminder !== undefined) {
        if (filters.hasReminder) {
          query = query.not('reminder_date', 'is', null);
        } else {
          query = query.is('reminder_date', null);
        }
      }

      if (filters?.dateFrom) {
        query = query.gte('created_at', filters.dateFrom);
      }

      if (filters?.dateTo) {
        query = query.lte('created_at', filters.dateTo);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      // Mapear datos
      const formattedNotes: Note[] = data.map((note: any) => ({
        id: note.id,
        title: note.title,
        content: note.content,
        tags: note.tags || [],
        caseId: note.case_id,
        createdBy: note.created_by,
        assignedTo: note.assigned_to,
        isImportant: note.is_important,
        isArchived: note.is_archived,
        archivedAt: note.archived_at,
        archivedBy: note.archived_by,
        reminderDate: note.reminder_date,
        isReminderSent: note.is_reminder_sent,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
        case: note.case ? {
          id: note.case.id,
          numeroCaso: note.case.numero_caso,
          descripcion: note.case.descripcion
        } : undefined,
        createdByUser: note.created_by_user ? {
          id: note.created_by_user.id,
          fullName: note.created_by_user.full_name,
          email: note.created_by_user.email
        } : undefined,
        assignedToUser: note.assigned_to_user ? {
          id: note.assigned_to_user.id,
          fullName: note.assigned_to_user.full_name,
          email: note.assigned_to_user.email
        } : undefined,
        archivedByUser: note.archived_by_user ? {
          id: note.archived_by_user.id,
          fullName: note.archived_by_user.full_name,
          email: note.archived_by_user.email
        } : undefined
      }));

      setNotes(formattedNotes);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido';
      
      // Solo log de errores una vez cada 3 segundos para evitar spam
      const now = Date.now();
      const errorKey = `notes-fetch-error-${errorMsg.slice(0, 20)}`;
      const lastLog = errorLogCache.get(errorKey) || 0;
      if (now - lastLog > 3000) {
        errorLogCache.set(errorKey, now);
        console.error('❌ [useNotesWithPermissions] Error al cargar notas:', errorMsg);
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [userProfile, notesPermissions]);

  // Crear nueva nota
  const createNote = async (noteData: CreateNoteData): Promise<Note | null> => {
    try {
      setError(null);

      // Verificar permisos de creación
      if (!notesPermissions.canCreateOwnNotes && !notesPermissions.canCreateTeamNotes && !notesPermissions.canCreateAllNotes) {
        throw new Error('No tiene permisos para crear notas');
      }

      const { data, error: createError } = await supabase
        .from('notes')
        .insert([{
          title: noteData.title,
          content: noteData.content,
          tags: noteData.tags || [],
          case_id: noteData.caseId || null,
          assigned_to: noteData.assignedTo || null,
          is_important: noteData.isImportant || false,
          reminder_date: noteData.reminderDate || null,
          created_by: userProfile?.id
        }])
        .select(`
          *,
          case:cases(id, numero_caso, descripcion),
          created_by_user:user_profiles!notes_created_by_fkey(id, full_name, email),
          assigned_to_user:user_profiles!notes_assigned_to_fkey(id, full_name, email)
        `)
        .single();

      if (createError) {
        throw createError;
      }

      const newNote: Note = {
        id: data.id,
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        caseId: data.case_id,
        createdBy: data.created_by,
        assignedTo: data.assigned_to,
        isImportant: data.is_important,
        isArchived: data.is_archived,
        archivedAt: data.archived_at,
        archivedBy: data.archived_by,
        reminderDate: data.reminder_date,
        isReminderSent: data.is_reminder_sent,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        case: data.case ? {
          id: data.case.id,
          numeroCaso: data.case.numero_caso,
          descripcion: data.case.descripcion
        } : undefined,
        createdByUser: data.created_by_user ? {
          id: data.created_by_user.id,
          fullName: data.created_by_user.full_name,
          email: data.created_by_user.email
        } : undefined,
        assignedToUser: data.assigned_to_user ? {
          id: data.assigned_to_user.id,
          fullName: data.assigned_to_user.full_name,
          email: data.assigned_to_user.email
        } : undefined
      };

      // Actualizar estado local
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al crear nota';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Actualizar nota
  const updateNote = async (noteId: string, noteData: UpdateNoteData): Promise<Note | null> => {
    try {
      setError(null);

      // Encontrar la nota actual para verificar permisos
      const currentNote = notes.find(n => n.id === noteId);
      if (!currentNote) {
        throw new Error('Nota no encontrada');
      }

      // Verificar permisos de actualización
      const canUpdate = notesPermissions.canPerformActionOnNote(
        currentNote.createdBy, 
        userProfile?.id || '', 
        'update'
      );

      if (!canUpdate) {
        throw new Error('No tiene permisos para actualizar esta nota');
      }

      const { data, error: updateError } = await supabase
        .from('notes')
        .update({
          title: noteData.title,
          content: noteData.content,
          tags: noteData.tags,
          case_id: noteData.caseId,
          assigned_to: noteData.assignedTo,
          is_important: noteData.isImportant,
          reminder_date: noteData.reminderDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .select(`
          *,
          case:cases(id, numero_caso, descripcion),
          created_by_user:user_profiles!notes_created_by_fkey(id, full_name, email),
          assigned_to_user:user_profiles!notes_assigned_to_fkey(id, full_name, email)
        `)
        .single();

      if (updateError) {
        throw updateError;
      }

      const updatedNote: Note = {
        id: data.id,
        title: data.title,
        content: data.content,
        tags: data.tags || [],
        caseId: data.case_id,
        createdBy: data.created_by,
        assignedTo: data.assigned_to,
        isImportant: data.is_important,
        isArchived: data.is_archived,
        archivedAt: data.archived_at,
        archivedBy: data.archived_by,
        reminderDate: data.reminder_date,
        isReminderSent: data.is_reminder_sent,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        case: data.case ? {
          id: data.case.id,
          numeroCaso: data.case.numero_caso,
          descripcion: data.case.descripcion
        } : undefined,
        createdByUser: data.created_by_user ? {
          id: data.created_by_user.id,
          fullName: data.created_by_user.full_name,
          email: data.created_by_user.email
        } : undefined,
        assignedToUser: data.assigned_to_user ? {
          id: data.assigned_to_user.id,
          fullName: data.assigned_to_user.full_name,
          email: data.assigned_to_user.email
        } : undefined
      };

      // Actualizar estado local
      setNotes(prev => prev.map(note => note.id === noteId ? updatedNote : note));
      return updatedNote;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al actualizar nota';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Eliminar nota
  const deleteNote = async (noteId: string): Promise<void> => {
    try {
      setError(null);

      // Encontrar la nota actual para verificar permisos
      const currentNote = notes.find(n => n.id === noteId);
      if (!currentNote) {
        throw new Error('Nota no encontrada');
      }

      // Verificar permisos de eliminación
      const canDelete = notesPermissions.canPerformActionOnNote(
        currentNote.createdBy, 
        userProfile?.id || '', 
        'delete'
      );

      if (!canDelete) {
        throw new Error('No tiene permisos para eliminar esta nota');
      }

      const { error: deleteError } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (deleteError) {
        throw deleteError;
      }

      // Actualizar estado local
      setNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al eliminar nota';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Archivar/desarchivar nota
  const toggleArchiveNote = async (noteId: string): Promise<void> => {
    try {
      setError(null);

      // Encontrar la nota actual para verificar permisos
      const currentNote = notes.find(n => n.id === noteId);
      if (!currentNote) {
        throw new Error('Nota no encontrada');
      }

      // Verificar permisos de archivo
      const canArchive = notesPermissions.canPerformActionOnNote(
        currentNote.createdBy, 
        userProfile?.id || '', 
        'archive'
      );

      if (!canArchive) {
        throw new Error('No tiene permisos para archivar/desarchivar esta nota');
      }

      const newArchivedState = !currentNote.isArchived;
      const { data, error: archiveError } = await supabase
        .from('notes')
        .update({
          is_archived: newArchivedState,
          archived_at: newArchivedState ? new Date().toISOString() : null,
          archived_by: newArchivedState ? userProfile?.id : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId)
        .select('*')
        .single();

      if (archiveError) {
        throw archiveError;
      }

      // Actualizar estado local
      setNotes(prev => prev.map(note => 
        note.id === noteId 
          ? { 
              ...note, 
              isArchived: data.is_archived,
              archivedAt: data.archived_at,
              archivedBy: data.archived_by,
              updatedAt: data.updated_at
            } 
          : note
      ));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al archivar nota';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  // Cargar notas al montar el componente (solo si tiene permisos)
  useEffect(() => {
    if (userProfile?.id && notesPermissions.hasAnyNotesPermission && !hasPermissionError) {
      // Cargar con filtros por defecto (sin archivadas)
      fetchNotes({ isArchived: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userProfile?.id, notesPermissions.hasAnyNotesPermission]);

  return {
    notes,
    loading,
    error,
    fetchNotes,
    createNote,
    updateNote,
    deleteNote,
    toggleArchiveNote,
    // Permisos para uso en componentes
    permissions: notesPermissions,
    // Estado de acceso
    hasAccess: notesPermissions.hasAnyNotesPermission,
    hasPermissionError
  };
};
