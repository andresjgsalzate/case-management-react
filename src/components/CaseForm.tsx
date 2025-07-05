import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { caseFormSchema, CaseFormSchema } from '@/lib/validations';
import { useOrigenes, useAplicaciones } from '@/hooks/useOrigenesAplicaciones';
import {
  HISTORIAL_CASO_OPTIONS,
  CONOCIMIENTO_MODULO_OPTIONS,
  MANIPULACION_DATOS_OPTIONS,
  CLARIDAD_DESCRIPCION_OPTIONS,
  CAUSA_FALLO_OPTIONS,
} from '@/types';

interface CaseFormProps {
  onSubmit: (data: CaseFormSchema) => void;
  defaultValues?: Partial<CaseFormSchema>;
  isLoading?: boolean;
  submitText?: string;
}

export const CaseForm: React.FC<CaseFormProps> = ({
  onSubmit,
  defaultValues,
  isLoading = false,
  submitText = 'Registrar Caso',
}) => {
  const { data: origenes = [], isLoading: origenesLoading } = useOrigenes();
  const { data: aplicaciones = [], isLoading: aplicacionesLoading } = useAplicaciones();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CaseFormSchema>({
    resolver: zodResolver(caseFormSchema),
    defaultValues,
  });

  const handleFormSubmit = (data: CaseFormSchema) => {
    onSubmit(data);
    if (!defaultValues) {
      reset();
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Número del caso
          </label>
          <input
            {...register('numeroCaso')}
            type="text"
            className="form-input"
            placeholder="Ingrese el número del caso"
          />
          {errors.numeroCaso && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.numeroCaso.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha
          </label>
          <input
            {...register('fecha')}
            type="date"
            className="form-input"
          />
          {errors.fecha && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.fecha.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Descripción del problema
        </label>
        <textarea
          {...register('descripcion')}
          rows={3}
          className="form-input"
          placeholder="Describa el problema detalladamente"
        />
        {errors.descripcion && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.descripcion.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Historial del caso
          </label>
          <select
            {...register('historialCaso', { valueAsNumber: true })}
            className="form-input"
          >
            <option value="">Seleccione una opción</option>
            {HISTORIAL_CASO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.historialCaso && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.historialCaso.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Conocimiento del módulo
          </label>
          <select
            {...register('conocimientoModulo', { valueAsNumber: true })}
            className="form-input"
          >
            <option value="">Seleccione una opción</option>
            {CONOCIMIENTO_MODULO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.conocimientoModulo && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.conocimientoModulo.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Manipulación de datos
          </label>
          <select
            {...register('manipulacionDatos', { valueAsNumber: true })}
            className="form-input"
          >
            <option value="">Seleccione una opción</option>
            {MANIPULACION_DATOS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.manipulacionDatos && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.manipulacionDatos.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Claridad de la descripción
          </label>
          <select
            {...register('claridadDescripcion', { valueAsNumber: true })}
            className="form-input"
          >
            <option value="">Seleccione una opción</option>
            {CLARIDAD_DESCRIPCION_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.claridadDescripcion && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.claridadDescripcion.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Causa del fallo
          </label>
          <select
            {...register('causaFallo', { valueAsNumber: true })}
            className="form-input"
          >
            <option value="">Seleccione una opción</option>
            {CAUSA_FALLO_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.causaFallo && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.causaFallo.message}
            </p>
          )}
        </div>
      </div>

      {/* Campos de Origen y Aplicación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Origen
          </label>
          <select
            {...register('origenId')}
            className="form-input"
            disabled={origenesLoading}
          >
            <option value="">Seleccione un origen (opcional)</option>
            {origenes.map((origen) => (
              <option key={origen.id} value={origen.id}>
                {origen.nombre}
              </option>
            ))}
          </select>
          {errors.origenId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.origenId.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Aplicación
          </label>
          <select
            {...register('aplicacionId')}
            className="form-input"
            disabled={aplicacionesLoading}
          >
            <option value="">Seleccione una aplicación (opcional)</option>
            {aplicaciones.map((aplicacion) => (
              <option key={aplicacion.id} value={aplicacion.id}>
                {aplicacion.nombre}
              </option>
            ))}
          </select>
          {errors.aplicacionId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.aplicacionId.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Procesando...' : submitText}
        </button>
      </div>
    </form>
  );
};
