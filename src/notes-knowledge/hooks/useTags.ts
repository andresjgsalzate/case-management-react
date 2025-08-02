/**
 * =================================================================
 * HOOK: ADMINISTRACIÓN DE ETIQUETAS
 * =================================================================
 * Descripción: Hook específico para operaciones CRUD de etiquetas
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SolutionTagsService } from '../services/tagsService';
import type { SolutionTag, TagCategory } from '../types';

interface CreateTagData {
  name: string;
  description?: string;
  color: string;
  category: TagCategory;
}

interface UpdateTagData {
  name?: string;
  description?: string;
  color?: string;
  category?: TagCategory;
}

export const useTags = () => {
  const queryClient = useQueryClient();

  // Obtener todas las etiquetas
  const {
    data: tags = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['tags'],
    queryFn: () => SolutionTagsService.getAllTags(),
  });

  // Crear etiqueta
  const createTag = useMutation({
    mutationFn: (tagData: CreateTagData) => SolutionTagsService.createTag(tagData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  // Actualizar etiqueta
  const updateTag = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTagData }) =>
      SolutionTagsService.updateTag(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  // Eliminar etiqueta
  const deleteTag = useMutation({
    mutationFn: (id: string) => SolutionTagsService.deleteTag(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
  });

  return {
    tags,
    isLoading,
    error,
    refetch,
    createTag,
    updateTag,
    deleteTag,
  };
};
