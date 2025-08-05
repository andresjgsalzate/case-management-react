import { supabase } from '../lib/supabase';

// Servicio de Storage usando Supabase
export class StorageService {
  private static readonly BUCKET_NAME = 'documents'; // Bucket que existe en las migraciones
  
  /**
   * Sube un archivo a Supabase Storage y guarda referencia en document_attachments
   */
  static async uploadFile(
    file: File, 
    documentId: string, 
    options?: { isEmbedded?: boolean }
  ): Promise<{
    success: boolean;
    data?: { url: string; id: string; publicUrl: string };
    error?: string;
  }> {
    try {
      // Validar que documentId sea válido
      if (!documentId || documentId.trim() === '') {
        console.error('documentId es inválido:', documentId);
        return {
          success: false,
          error: 'ID de documento requerido para subir archivos'
        };
      }
      
      // Generar nombre único para el archivo
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${documentId}/${fileName}`;
      
      // Subir archivo a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Error al subir archivo:', uploadError);
        return {
          success: false,
          error: `Error al subir archivo: ${uploadError.message}`
        };
      }
      
      // Obtener URL pública del archivo
      const { data: publicUrlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);
      
      if (!publicUrlData?.publicUrl) {
        console.error('Error al obtener URL pública');
        return {
          success: false,
          error: 'Error al obtener URL pública del archivo'
        };
      }
      
      // Obtener información del usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('Error al obtener usuario:', userError);
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }
      
      // Guardar referencia en la tabla document_attachments
      const { data: attachmentData, error: attachmentError } = await supabase
        .from('document_attachments')
        .insert({
          document_id: documentId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          mime_type: file.type,
          file_type: this.getFileType(file.type),
          is_embedded: options?.isEmbedded || false,
          uploaded_by: user.id
        })
        .select()
        .single();
      
      if (attachmentError) {
        console.error('Error al guardar en base de datos:', attachmentError);
        
        // Intentar eliminar el archivo subido si falla la inserción en BD
        await supabase.storage.from(this.BUCKET_NAME).remove([filePath]);
        
        return {
          success: false,
          error: `Error al guardar referencia: ${attachmentError.message}`
        };
      }
      
      return {
        success: true,
        data: {
          url: publicUrlData.publicUrl,
          id: attachmentData.id,
          publicUrl: publicUrlData.publicUrl
        }
      };
      
    } catch (error) {
      console.error('Error inesperado al subir archivo:', error);
      return {
        success: false,
        error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
    }
  }

  /**
   * Elimina un archivo del storage y de la base de datos
   */
  static async deleteFile(attachmentId: string): Promise<boolean> {
    try {
      // Obtener información del archivo
      const { data: attachment, error: getError } = await supabase
        .from('document_attachments')
        .select('file_path')
        .eq('id', attachmentId)
        .single();
      
      if (getError || !attachment) {
        console.error('❌ Error al obtener información del archivo:', getError);
        return false;
      }
      
      // Eliminar archivo del storage
      const { error: storageError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([attachment.file_path]);
      
      if (storageError) {
        console.error('❌ Error al eliminar del storage:', storageError);
      }
      
      // Eliminar registro de la base de datos
      const { error: dbError } = await supabase
        .from('document_attachments')
        .delete()
        .eq('id', attachmentId);
      
      if (dbError) {
        console.error('❌ Error al eliminar de base de datos:', dbError);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('❌ Error inesperado al eliminar archivo:', error);
      return false;
    }
  }

  /**
   * Obtiene la URL pública de un archivo
   */
  static async getFileUrl(filePath: string): Promise<string> {
    try {
      const { data } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('❌ Error al obtener URL:', error);
      return '';
    }
  }

  /**
   * Lista archivos de un documento
   */
  static async listFiles(documentId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('document_attachments')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error al listar archivos:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('❌ Error inesperado al listar archivos:', error);
      return [];
    }
  }

  /**
   * Determina el tipo de archivo basado en el MIME type
   */
  private static getFileType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.includes('document') || mimeType.includes('pdf') || mimeType.includes('word')) return 'document';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'spreadsheet';
    return 'other';
  }
}
