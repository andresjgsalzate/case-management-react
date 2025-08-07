import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar que las variables de entorno estén configuradas correctamente
if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your_supabase_url_here' || 
    supabaseAnonKey === 'your_supabase_anon_key_here' ||
    !supabaseUrl.startsWith('https://')) {
  console.error('❌ Variables de entorno de Supabase no configuradas correctamente');
  console.error('Por favor configura VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env');
  console.error('Ejemplo:');
  console.error('VITE_SUPABASE_URL=https://zckfwedteqvjytembgpu.supabase.co');
  console.error('VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui');
  throw new Error('Missing or invalid Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para la base de datos
export interface Database {
  public: {
    Tables: {
      cases: {
        Row: {
          id: string;
          numero_caso: string;
          descripcion: string;
          fecha: string;
          origen_id: string | null;
          aplicacion_id: string | null;
          historial_caso: number;
          conocimiento_modulo: number;
          manipulacion_datos: number;
          claridad_descripcion: number;
          causa_fallo: number;
          puntuacion: number;
          clasificacion: string;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          numero_caso: string;
          descripcion: string;
          fecha: string;
          origen_id?: string | null;
          aplicacion_id?: string | null;
          historial_caso: number;
          conocimiento_modulo: number;
          manipulacion_datos: number;
          claridad_descripcion: number;
          causa_fallo: number;
          puntuacion: number;
          clasificacion: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          numero_caso?: string;
          descripcion?: string;
          fecha?: string;
          origen_id?: string | null;
          aplicacion_id?: string | null;
          historial_caso?: number;
          conocimiento_modulo?: number;
          manipulacion_datos?: number;
          claridad_descripcion?: number;
          causa_fallo?: number;
          puntuacion?: number;
          clasificacion?: string;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
      origenes: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          descripcion?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      aplicaciones: {
        Row: {
          id: string;
          nombre: string;
          descripcion: string | null;
          activo: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          nombre: string;
          descripcion?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          nombre?: string;
          descripcion?: string | null;
          activo?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
