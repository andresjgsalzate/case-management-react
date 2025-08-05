/**
 * =================================================================
 * SERVICIO: TIPOS DE DOCUMENTOS PARAMETRIZABLES
 * =================================================================
 * Descripción: Servicio para gestionar tipos de documentos desde BD
 * Versión: 1.0
 * Fecha: 4 de Agosto, 2025
 * =================================================================
 */

import { supabase } from '@/shared/lib/supabase';

// ===== INTERFACES =====

export interface DocumentType {
  id: string;
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color: string;
  is_active: boolean;
  display_order: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateDocumentTypeRequest {
  code: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  display_order?: number;
}

export interface UpdateDocumentTypeRequest {
  code?: string;
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  is_active?: boolean;
  display_order?: number;
}

// ===== SERVICIO =====

export class DocumentTypesService {
  
  /**
   * Obtener todos los tipos de documentos activos
   */
  static async getActiveDocumentTypes(): Promise<DocumentType[]> {
    try {
      const { data, error } = await supabase.rpc('get_active_document_types');

      if (error) {
        console.error('Error getting active document types:', error);
        throw new Error(`Error al obtener tipos de documentos: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting active document types:', error);
      throw error;
    }
  }

  /**
   * Obtener todos los tipos de documentos (incluyendo inactivos) - Solo para administradores
   */
  static async getAllDocumentTypes(): Promise<DocumentType[]> {
    try {
      const { data, error } = await supabase
        .from('solution_document_types')
        .select('*')
        .order('display_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('Error getting all document types:', error);
        throw new Error(`Error al obtener todos los tipos de documentos: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error getting all document types:', error);
      throw error;
    }
  }

  /**
   * Obtener un tipo de documento por ID
   */
  static async getDocumentTypeById(id: string): Promise<DocumentType | null> {
    try {
      const { data, error } = await supabase
        .from('solution_document_types')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No encontrado
        }
        console.error('Error getting document type by ID:', error);
        throw new Error(`Error al obtener tipo de documento: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting document type by ID:', error);
      throw error;
    }
  }

  /**
   * Obtener un tipo de documento por código
   */
  static async getDocumentTypeByCode(code: string): Promise<DocumentType | null> {
    try {
      const { data, error } = await supabase
        .from('solution_document_types')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No encontrado
        }
        console.error('Error getting document type by code:', error);
        throw new Error(`Error al obtener tipo de documento: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error getting document type by code:', error);
      throw error;
    }
  }

  /**
   * Crear un nuevo tipo de documento
   */
  static async createDocumentType(documentType: CreateDocumentTypeRequest): Promise<DocumentType> {
    try {
      const { data, error } = await supabase
        .from('solution_document_types')
        .insert([{
          ...documentType,
          color: documentType.color || '#6B7280',
          display_order: documentType.display_order || 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating document type:', error);
        throw new Error(`Error al crear tipo de documento: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating document type:', error);
      throw error;
    }
  }

  /**
   * Actualizar un tipo de documento existente
   */
  static async updateDocumentType(id: string, updates: UpdateDocumentTypeRequest): Promise<DocumentType> {
    try {
      const { data, error } = await supabase
        .from('solution_document_types')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating document type:', error);
        throw new Error(`Error al actualizar tipo de documento: ${error.message}`);
      }

      if (!data || data.length === 0) {
        throw new Error('No se encontró el tipo de documento para actualizar o no tienes permisos para modificarlo');
      }

      if (data.length > 1) {
        throw new Error('Se encontraron múltiples tipos de documento con el mismo ID');
      }

      return data[0];
    } catch (error) {
      console.error('Error updating document type:', error);
      throw error;
    }
  }

  /**
   * Eliminar un tipo de documento (soft delete - marcarlo como inactivo)
   */
  static async deactivateDocumentType(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('solution_document_types')
        .update({ is_active: false })
        .eq('id', id);

      if (error) {
        console.error('Error deactivating document type:', error);
        throw new Error(`Error al desactivar tipo de documento: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deactivating document type:', error);
      throw error;
    }
  }

  /**
   * Reactivar un tipo de documento
   */
  static async activateDocumentType(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('solution_document_types')
        .update({ is_active: true })
        .eq('id', id);

      if (error) {
        console.error('Error activating document type:', error);
        throw new Error(`Error al activar tipo de documento: ${error.message}`);
      }
    } catch (error) {
      console.error('Error activating document type:', error);
      throw error;
    }
  }

  /**
   * Eliminar permanentemente un tipo de documento
   * Solo se permite si no hay documentos asociados
   */
  static async deleteDocumentType(id: string): Promise<void> {
    try {
      // Verificar si hay documentos asociados
      const { data: documentCount, error: countError } = await supabase
        .from('solution_documents')
        .select('id', { count: 'exact', head: true })
        .eq('document_type_id', id);

      if (countError) {
        console.error('Error checking document count:', countError);
        throw new Error(`Error al verificar documentos asociados: ${countError.message}`);
      }

      if (documentCount && documentCount.length > 0) {
        throw new Error('No se puede eliminar el tipo de documento porque hay documentos asociados');
      }

      // Eliminar el tipo de documento
      const { error } = await supabase
        .from('solution_document_types')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting document type:', error);
        throw new Error(`Error al eliminar tipo de documento: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting document type:', error);
      throw error;
    }
  }

  /**
   * Actualizar orden de visualización de tipos
   */
  static async updateDisplayOrder(typeOrders: Array<{ id: string; display_order: number }>): Promise<void> {
    try {
      const updates = typeOrders.map(({ id, display_order }) => 
        supabase
          .from('solution_document_types')
          .update({ display_order })
          .eq('id', id)
      );

      await Promise.all(updates);
    } catch (error) {
      console.error('Error updating display order:', error);
      throw new Error('Error al actualizar orden de tipos de documentos');
    }
  }

  /**
   * Verificar si un código de tipo ya existe
   */
  static async isCodeAvailable(code: string, excludeId?: string): Promise<boolean> {
    try {
      let query = supabase
        .from('solution_document_types')
        .select('id')
        .eq('code', code);

      if (excludeId) {
        query = query.neq('id', excludeId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error checking code availability:', error);
        throw new Error(`Error al verificar disponibilidad del código: ${error.message}`);
      }

      return !data || data.length === 0;
    } catch (error) {
      console.error('Error checking code availability:', error);
      throw error;
    }
  }
}
