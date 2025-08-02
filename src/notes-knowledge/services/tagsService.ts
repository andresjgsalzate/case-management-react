/**
 * =================================================================
 * SERVICIO: ETIQUETAS DE DOCUMENTACIÓN
 * =================================================================
 * Descripción: Servicio para manejar etiquetas reutilizables
 * Versión: 1.0
 * Fecha: 1 de Agosto, 2025
 * =================================================================
 */

import { supabase } from '@/shared/lib/supabase';
import type {
  SolutionTag,
  CreateSolutionTagRequest,
  UpdateSolutionTagRequest,
  TagCategory,
} from '../types';

export class SolutionTagsService {
  
  // ===== OBTENER TODAS LAS ETIQUETAS =====
  static async getAllTags(activeOnly: boolean = true): Promise<SolutionTag[]> {
    const query = supabase
      .from('solution_tags')
      .select('*')
      .order('usage_count', { ascending: false })
      .order('name');

    if (activeOnly) {
      query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error al obtener etiquetas: ${error.message}`);
    }

    return data || [];
  }

  // ===== OBTENER ETIQUETAS POR CATEGORÍA =====
  static async getTagsByCategory(category: TagCategory): Promise<SolutionTag[]> {
    const { data, error } = await supabase
      .from('solution_tags')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('usage_count', { ascending: false })
      .order('name');

    if (error) {
      throw new Error(`Error al obtener etiquetas por categoría: ${error.message}`);
    }

    return data || [];
  }

  // ===== CREAR NUEVA ETIQUETA =====
  static async createTag(tagData: CreateSolutionTagRequest): Promise<SolutionTag> {
    const { data: userData } = await supabase.auth.getUser();
    
    if (!userData.user) {
      throw new Error('Usuario no autenticado');
    }

    const { data, error } = await supabase
      .from('solution_tags')
      .insert({
        ...tagData,
        created_by: userData.user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new Error('Ya existe una etiqueta con ese nombre');
      }
      throw new Error(`Error al crear etiqueta: ${error.message}`);
    }

    return data;
  }

  // ===== ACTUALIZAR ETIQUETA =====
  static async updateTag(id: string, tagData: UpdateSolutionTagRequest): Promise<SolutionTag> {
    const { data, error } = await supabase
      .from('solution_tags')
      .update({
        ...tagData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('Ya existe una etiqueta con ese nombre');
      }
      throw new Error(`Error al actualizar etiqueta: ${error.message}`);
    }

    return data;
  }

  // ===== ELIMINAR ETIQUETA (SOFT DELETE) =====
  static async deleteTag(id: string): Promise<void> {
    // Verificar si la etiqueta está en uso
    const { data: usage, error: usageError } = await supabase
      .from('solution_document_tags')
      .select('id')
      .eq('tag_id', id)
      .limit(1);

    if (usageError) {
      throw new Error(`Error al verificar uso de etiqueta: ${usageError.message}`);
    }

    if (usage && usage.length > 0) {
      // Si está en uso, hacer soft delete
      const { error } = await supabase
        .from('solution_tags')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        throw new Error(`Error al desactivar etiqueta: ${error.message}`);
      }
    } else {
      // Si no está en uso, eliminar completamente
      const { error } = await supabase
        .from('solution_tags')
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Error al eliminar etiqueta: ${error.message}`);
      }
    }
  }

  // ===== BUSCAR ETIQUETAS =====
  static async searchTags(searchTerm: string, category?: TagCategory): Promise<SolutionTag[]> {
    let query = supabase
      .from('solution_tags')
      .select('*')
      .eq('is_active', true)
      .ilike('name', `%${searchTerm}%`);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query
      .order('usage_count', { ascending: false })
      .order('name')
      .limit(20);

    if (error) {
      throw new Error(`Error al buscar etiquetas: ${error.message}`);
    }

    return data || [];
  }

  // ===== OBTENER ETIQUETAS MÁS USADAS =====
  static async getMostUsedTags(limit: number = 10): Promise<SolutionTag[]> {
    const { data, error } = await supabase
      .from('solution_tags')
      .select('*')
      .eq('is_active', true)
      .gt('usage_count', 0)
      .order('usage_count', { ascending: false })
      .order('name')
      .limit(limit);

    if (error) {
      throw new Error(`Error al obtener etiquetas más usadas: ${error.message}`);
    }

    return data || [];
  }

  // ===== ASOCIAR ETIQUETAS A DOCUMENTO =====
  static async addTagsToDocument(documentId: string, tagIds: string[]): Promise<void> {
    if (tagIds.length === 0) return;

    // Primero, eliminar asociaciones existentes
    await this.removeAllTagsFromDocument(documentId);

    // Luego, agregar las nuevas asociaciones
    const associations = tagIds.map(tagId => ({
      document_id: documentId,
      tag_id: tagId,
    }));

    const { error } = await supabase
      .from('solution_document_tags')
      .insert(associations);

    if (error) {
      throw new Error(`Error al asociar etiquetas: ${error.message}`);
    }
  }

  // ===== REMOVER TODAS LAS ETIQUETAS DE UN DOCUMENTO =====
  static async removeAllTagsFromDocument(documentId: string): Promise<void> {
    const { error } = await supabase
      .from('solution_document_tags')
      .delete()
      .eq('document_id', documentId);

    if (error) {
      throw new Error(`Error al remover etiquetas del documento: ${error.message}`);
    }
  }

  // ===== OBTENER ETIQUETAS DE UN DOCUMENTO =====
  static async getDocumentTags(documentId: string): Promise<SolutionTag[]> {
    const { data, error } = await supabase
      .from('solution_document_tags')
      .select(`
        solution_tags (*)
      `)
      .eq('document_id', documentId);

    if (error) {
      throw new Error(`Error al obtener etiquetas del documento: ${error.message}`);
    }

    return (data || []).map((item: any) => item.solution_tags as SolutionTag).filter(Boolean);
  }

  // ===== OBTENER DOCUMENTOS POR ETIQUETA =====
  static async getDocumentsByTag(tagId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('solution_document_tags')
      .select('document_id')
      .eq('tag_id', tagId);

    if (error) {
      throw new Error(`Error al obtener documentos por etiqueta: ${error.message}`);
    }

    return (data || []).map((item: any) => item.document_id);
  }

  // ===== OBTENER ESTADÍSTICAS DE ETIQUETAS =====
  static async getTagsStatistics(): Promise<{
    total_tags: number;
    active_tags: number;
    tags_by_category: Record<TagCategory, number>;
    most_used_tags: Array<{ tag: SolutionTag; usage_count: number }>;
  }> {
    const { data: tags, error } = await supabase
      .from('solution_tags')
      .select('*');

    if (error) {
      throw new Error(`Error al obtener estadísticas de etiquetas: ${error.message}`);
    }

    const total_tags = tags?.length || 0;
    const active_tags = tags?.filter((tag: any) => tag.is_active).length || 0;
    
    const tags_by_category = tags?.reduce((acc: any, tag: any) => {
      acc[tag.category] = (acc[tag.category] || 0) + 1;
      return acc;
    }, {} as Record<TagCategory, number>) || {};

    const most_used_tags = tags
      ?.filter((tag: any) => tag.is_active && tag.usage_count > 0)
      .sort((a: any, b: any) => b.usage_count - a.usage_count)
      .slice(0, 10)
      .map((tag: any) => ({ tag, usage_count: tag.usage_count })) || [];

    return {
      total_tags,
      active_tags,
      tags_by_category,
      most_used_tags,
    };
  }
}
