import { supabase } from '../lib/supabase';

// Servicio de Storage usando Supabase
export class StorageService {
  private static readonly BUCKET_NAME = 'document-attachments'; // Bucket correcto según documentación
  
  /**
   * Verifica si el bucket existe (simplificado)
   */
  private static async ensureBucketExists(): Promise<boolean> {
    try {
      // Verificación simple del bucket
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      console.log('🔍 [StorageService] Buckets encontrados:', buckets?.length || 0);
      console.log('🗂️ [StorageService] Lista de buckets:', buckets?.map(b => ({ id: b.id, name: b.name, public: b.public })));
      
      if (error) {
        console.error('Error al verificar buckets:', error);
        return false;
      }
      
      // Los buckets de Supabase tienen tanto 'id' como 'name', usar 'id' que es más confiable
      const bucketExists = buckets?.some(bucket => bucket.id === this.BUCKET_NAME || bucket.name === this.BUCKET_NAME);
      
      if (!bucketExists) {
        console.warn(`⚠️ Bucket '${this.BUCKET_NAME}' no existe. Verifique configuración de Supabase.`);
        console.log('📋 [StorageService] Buckets disponibles:', buckets?.map(b => ({ id: b.id, name: b.name })));
        return false;
      }
      
      console.log('✅ [StorageService] Bucket encontrado:', buckets?.find(b => b.id === this.BUCKET_NAME || b.name === this.BUCKET_NAME));
      
      return true;
    } catch (error) {
      console.error('Error al verificar bucket:', error);
      return false;
    }
  }
  
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
      console.log('📁 [StorageService] Iniciando subida de archivo');
      console.log('📋 [StorageService] Archivo:', { name: file.name, size: file.size, type: file.type });
      console.log('📋 [StorageService] DocumentId:', documentId);
      console.log('📋 [StorageService] Options:', options);

      // Verificar que el bucket existe
      console.log('🔍 [StorageService] Verificando bucket');
      const bucketExists = await this.ensureBucketExists();
      if (!bucketExists) {
        console.error('❌ [StorageService] Bucket no disponible');
        return {
          success: false,
          error: `Bucket '${this.BUCKET_NAME}' no está disponible. Verifique configuración de storage.`
        };
      }
      console.log('✅ [StorageService] Bucket verificado');
      
      // Validar que documentId sea válido
      if (!documentId || documentId.trim() === '') {
        console.error('❌ [StorageService] DocumentId inválido:', documentId);
        return {
          success: false,
          error: 'ID de documento requerido para subir archivos'
        };
      }
      
      // Generar nombre único para el archivo
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${documentId}/${fileName}`;
      console.log('📝 [StorageService] Ruta del archivo:', filePath);
      
      // Subir archivo a Supabase Storage
      console.log('📡 [StorageService] Subiendo archivo a Storage');
      const { error: uploadError } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (uploadError) {
        console.error('❌ [StorageService] Error al subir archivo:', uploadError);
        return {
          success: false,
          error: `Error al subir archivo: ${uploadError.message}`
        };
      }
      console.log('✅ [StorageService] Archivo subido al Storage');
      
      // Obtener URL pública del archivo
      console.log('📡 [StorageService] Obteniendo URL pública');
      const { data: publicUrlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);
      
      if (!publicUrlData?.publicUrl) {
        console.error('❌ [StorageService] Error al obtener URL pública');
        return {
          success: false,
          error: 'Error al obtener URL pública del archivo'
        };
      }
      console.log('✅ [StorageService] URL pública obtenida:', publicUrlData.publicUrl);
      
      // Obtener información del usuario actual
      console.log('👤 [StorageService] Obteniendo usuario actual');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('❌ [StorageService] Error al obtener usuario:', userError);
        return {
          success: false,
          error: 'Usuario no autenticado'
        };
      }
      console.log('✅ [StorageService] Usuario obtenido:', user.id);
      
      // Determinar tipo de archivo
      const fileType = this.getFileType(file.type);
      console.log('🔍 [StorageService] Tipo de archivo determinado:', fileType);
      
      // Usar la función SQL para guardar el adjunto
      console.log('📡 [StorageService] Guardando referencia en BD con función SQL');
      const { data: attachmentId, error: attachmentError } = await supabase.rpc('save_document_attachment_final', {
        p_document_id: documentId,
        p_file_name: file.name,
        p_file_path: filePath,
        p_file_size: file.size,
        p_mime_type: file.type
      });
      
      if (attachmentError) {
        console.error('❌ [StorageService] Error al guardar en base de datos:', attachmentError);
        
        // Intentar eliminar el archivo subido si falla la inserción en BD
        console.log('🗑️ [StorageService] Intentando limpiar archivo subido');
        await supabase.storage.from(this.BUCKET_NAME).remove([filePath]);
        
        return {
          success: false,
          error: `Error al guardar referencia: ${attachmentError.message}`
        };
      }
      
      console.log('✅ [StorageService] Adjunto guardado con ID:', attachmentId);

      const result = {
        success: true,
        data: {
          url: publicUrlData.publicUrl,
          id: attachmentId,
          publicUrl: publicUrlData.publicUrl
        }
      };

      console.log('🎉 [StorageService] Proceso completado exitosamente:', result);
      return result;
      
    } catch (error) {
      console.error('💥 [StorageService] Error inesperado al subir archivo:', error);
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
