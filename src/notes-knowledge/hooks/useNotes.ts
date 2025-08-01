import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/shared/lib/supabase';
import { Note, CreateNoteData, UpdateNoteData, NoteFilters, NoteStats, NoteSearchResult } from '@/types';

// Hook para obtener todas las notas con filtros
export const useNotes = (filters?: NoteFilters) => {
  return useQuery({
    queryKey: ['notes', filters],
    queryFn: async (): Promise<Note[]> => {
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

      // Aplicar filtros
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

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching notes:', error);
        throw error;
      }

      // Mapear datos
      return data.map((note: any) => ({
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
    },
  });
};

// Hook para obtener una nota específica
export const useNote = (noteId: string) => {
  return useQuery({
    queryKey: ['notes', noteId],
    queryFn: async (): Promise<Note> => {
      const { data, error } = await supabase
        .from('notes')
        .select(`
          *,
          case:cases(id, numero_caso, descripcion),
          created_by_user:user_profiles!notes_created_by_fkey(id, full_name, email),
          assigned_to_user:user_profiles!notes_assigned_to_fkey(id, full_name, email),
          archived_by_user:user_profiles!notes_archived_by_fkey(id, full_name, email)
        `)
        .eq('id', noteId)
        .single();

      if (error) {
        console.error('Error fetching note:', error);
        throw error;
      }

      return {
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
        } : undefined,
        archivedByUser: data.archived_by_user ? {
          id: data.archived_by_user.id,
          fullName: data.archived_by_user.full_name,
          email: data.archived_by_user.email
        } : undefined
      };
    },
    enabled: !!noteId,
  });
};

// Hook para crear una nueva nota
export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteData: CreateNoteData): Promise<Note> => {
      const { data, error } = await supabase
        .from('notes')
        .insert({
          title: noteData.title,
          content: noteData.content,
          tags: noteData.tags || [],
          case_id: noteData.caseId,
          assigned_to: noteData.assignedTo,
          is_important: noteData.isImportant || false,
          reminder_date: noteData.reminderDate,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select(`
          *,
          case:cases(id, numero_caso, descripcion),
          created_by_user:user_profiles!notes_created_by_fkey(id, full_name, email),
          assigned_to_user:user_profiles!notes_assigned_to_fkey(id, full_name, email)
        `)
        .single();

      if (error) {
        console.error('Error creating note:', error);
        throw error;
      }

      return {
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes-stats'] });
    },
    onError: (error: any) => {
      console.error('Error creating note:', error);
    },
  });
};

// Hook para actualizar una nota
export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: UpdateNoteData): Promise<Note> => {
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: updateData.title,
          content: updateData.content,
          tags: updateData.tags,
          case_id: updateData.caseId,
          assigned_to: updateData.assignedTo,
          is_important: updateData.isImportant,
          reminder_date: updateData.reminderDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          case:cases(id, numero_caso, descripcion),
          created_by_user:user_profiles!notes_created_by_fkey(id, full_name, email),
          assigned_to_user:user_profiles!notes_assigned_to_fkey(id, full_name, email)
        `)
        .single();

      if (error) {
        console.error('Error updating note:', error);
        throw error;
      }

      return {
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
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes', id] });
      queryClient.invalidateQueries({ queryKey: ['notes-stats'] });
    },
    onError: (error: any) => {
      console.error('Error updating note:', error);
    },
  });
};

// Hook para eliminar una nota
export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string): Promise<void> => {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) {
        console.error('Error deleting note:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes-stats'] });
    },
    onError: (error: any) => {
      console.error('Error deleting note:', error);
    },
  });
};

// Hook para archivar/desarchivar una nota
export const useArchiveNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, archive }: { noteId: string; archive: boolean }): Promise<void> => {
      const currentUser = (await supabase.auth.getUser()).data.user;
      
      const { error } = await supabase
        .from('notes')
        .update({
          is_archived: archive,
          archived_at: archive ? new Date().toISOString() : null,
          archived_by: archive ? currentUser?.id : null,
          updated_at: new Date().toISOString()
        })
        .eq('id', noteId);

      if (error) {
        console.error('Error archiving note:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['notes-stats'] });
    },
    onError: (error: any) => {
      console.error('Error archiving note:', error);
    },
  });
};

// Hook para buscar notas usando la función personalizada
export const useSearchNotes = (searchTerm: string) => {
  return useQuery({
    queryKey: ['notes-search', searchTerm],
    queryFn: async (): Promise<NoteSearchResult[]> => {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .rpc('search_notes', {
          search_term: searchTerm,
          user_id: currentUser.id,
          limit_count: 50
        });

      if (error) {
        console.error('Error searching notes:', error);
        throw error;
      }

      return data || [];
    },
    enabled: !!searchTerm && searchTerm.length > 2,
  });
};

// Hook para obtener estadísticas de notas
export const useNotesStats = () => {
  return useQuery({
    queryKey: ['notes-stats'],
    queryFn: async (): Promise<NoteStats> => {
      const currentUser = (await supabase.auth.getUser()).data.user;
      if (!currentUser) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .rpc('get_notes_stats', {
          user_id: currentUser.id
        });

      if (error) {
        console.error('Error fetching notes stats:', error);
        throw error;
      }

      return {
        totalNotes: data.total_notes || 0,
        myNotes: data.my_notes || 0,
        assignedNotes: data.assigned_notes || 0,
        importantNotes: data.important_notes || 0,
        withReminders: data.with_reminders || 0,
        archivedNotes: data.archived_notes || 0
      };
    },
  });
};

// Hook para obtener notas asociadas a un caso específico
export const useNotesByCase = (caseId: string) => {
  return useNotes({ caseId });
};

// Hook para obtener todas las etiquetas únicas
export const useNoteTags = () => {
  return useQuery({
    queryKey: ['note-tags'],
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase
        .from('notes')
        .select('tags')
        .eq('is_archived', false);

      if (error) {
        console.error('Error fetching note tags:', error);
        throw error;
      }

      // Extraer todas las etiquetas únicas
      const allTags = data
        .flatMap(note => note.tags || [])
        .filter((tag, index, array) => array.indexOf(tag) === index)
        .sort();

      return allTags;
    },
  });
};
