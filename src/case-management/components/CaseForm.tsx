import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { caseFormSchema, CaseFormSchema } from '@/shared/lib/validations';
import { useOrigenes, useAplicaciones } from '@/case-management/hooks/useOrigenesAplicaciones';
import { calcularPuntuacion, clasificarCaso } from '@/shared/utils/caseUtils';
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
    watch,
  } = useForm<CaseFormSchema>({
    resolver: zodResolver(caseFormSchema),
    defaultValues,
  });

  // Observar los valores de los criterios de calificación
  const watchedValues = watch([
    'historialCaso',
    'conocimientoModulo', 
    'manipulacionDatos',
    'claridadDescripcion',
    'causaFallo'
  ]);

  // Calcular puntuación y clasificación en tiempo real
  const [historialCaso, conocimientoModulo, manipulacionDatos, claridadDescripcion, causaFallo] = watchedValues;
  
  // Mostrar la tarjeta tan pronto como se seleccione al menos un criterio
  const hasAnyCriteria = historialCaso || conocimientoModulo || manipulacionDatos || claridadDescripcion || causaFallo;
  
  // Calcular puntuación parcial (incluye valores no definidos como 0)
  const puntuacion = calcularPuntuacion(
    historialCaso || 0, 
    conocimientoModulo || 0, 
    manipulacionDatos || 0, 
    claridadDescripcion || 0, 
    causaFallo || 0
  );
  
  const clasificacion = hasAnyCriteria ? clasificarCaso(puntuacion) : null;

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

        {/* Campo Causa del fallo con tarjeta compacta al lado */}
        <div className="lg:col-span-2">
          <div className="flex flex-col lg:flex-row lg:gap-6">
            {/* Campo Causa del fallo */}
            <div className="flex-1">
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

            {/* Tarjeta Compacta de Vista Previa de Clasificación */}
            {hasAnyCriteria && clasificacion && (
              <div className="lg:w-80 mt-4 lg:mt-0">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
                        Vista Previa
                      </h4>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {puntuacion} pts
                      </div>
                    </div>
                  </div>
                  
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mb-2 ${
                    clasificacion === 'Alta Complejidad' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      : clasificacion === 'Media Complejidad'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {clasificacion}
                  </div>
                  
                  {/* Barra de progreso visual más pequeña */}
                  <div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                      <span>Baja</span>
                      <span>Media</span>
                      <span>Alta</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full transition-all duration-300 ${
                          clasificacion === 'Alta Complejidad' 
                            ? 'bg-red-500'
                            : clasificacion === 'Media Complejidad'
                            ? 'bg-yellow-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min((puntuacion / 15) * 100, 100)}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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
