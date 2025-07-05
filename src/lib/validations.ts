import { z } from 'zod';

// Schema para validación del formulario de casos
export const caseFormSchema = z.object({
  numeroCaso: z
    .string()
    .min(1, 'El número de caso es requerido')
    .max(50, 'El número de caso no puede exceder 50 caracteres'),
  descripcion: z
    .string()
    .min(1, 'La descripción es requerida')
    .max(500, 'La descripción no puede exceder 500 caracteres'),
  fecha: z
    .string()
    .min(1, 'La fecha es requerida')
    .refine((date: string) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Fin del día actual
      return selectedDate <= today;
    }, 'La fecha no puede ser futura'),
  origenId: z
    .string()
    .optional()
    .nullable(),
  aplicacionId: z
    .string()
    .optional()
    .nullable(),
  historialCaso: z
    .number()
    .min(1, 'Debe seleccionar una opción')
    .max(3, 'Valor inválido'),
  conocimientoModulo: z
    .number()
    .min(1, 'Debe seleccionar una opción')
    .max(3, 'Valor inválido'),
  manipulacionDatos: z
    .number()
    .min(1, 'Debe seleccionar una opción')
    .max(3, 'Valor inválido'),
  claridadDescripcion: z
    .number()
    .min(1, 'Debe seleccionar una opción')
    .max(3, 'Valor inválido'),
  causaFallo: z
    .number()
    .min(1, 'Debe seleccionar una opción')
    .max(3, 'Valor inválido'),
});

export type CaseFormSchema = z.infer<typeof caseFormSchema>;

// Schema para filtros
export const caseFiltersSchema = z.object({
  fecha: z.string().optional(),
  clasificacion: z.enum(['Baja Complejidad', 'Media Complejidad', 'Alta Complejidad']).optional(),
  origenId: z.string().optional(),
  aplicacionId: z.string().optional(),
  busqueda: z.string().optional(),
});

export type CaseFiltersSchema = z.infer<typeof caseFiltersSchema>;
