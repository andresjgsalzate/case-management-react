import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';
import { disposicionScriptsSchema } from '@/lib/validations';
import { DisposicionScriptsFormData, Case } from '@/types';
import { useCases } from '@/hooks/useCases';
import { useAplicaciones } from '@/hooks/useOrigenesAplicaciones';

interface DisposicionScriptsFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DisposicionScriptsFormData) => void;
  initialData?: DisposicionScriptsFormData;
  isEdit?: boolean;
  loading?: boolean;
}

export const DisposicionScriptsForm: React.FC<DisposicionScriptsFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEdit = false,
  loading = false
}) => {
  const { data: cases = [], isLoading: casesLoading } = useCases();
  const { data: aplicaciones = [], isLoading: aplicacionesLoading } = useAplicaciones();
  
  const [caseSearch, setCaseSearch] = useState('');
  const [showCaseDropdown, setShowCaseDropdown] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<DisposicionScriptsFormData>({
    resolver: zodResolver(disposicionScriptsSchema),
    defaultValues: {
      fecha: new Date().toISOString().split('T')[0],
      caseId: '',
      nombreScript: '',
      numeroRevisionSvn: '',
      aplicacionId: '',
      observaciones: '',
    },
  });

  const watchedCaseId = watch('caseId');

  // Efecto para cargar datos iniciales
  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        fecha: initialData.fecha,
        caseId: initialData.caseId,
        nombreScript: initialData.nombreScript,
        numeroRevisionSvn: initialData.numeroRevisionSvn || '',
        aplicacionId: initialData.aplicacionId,
        observaciones: initialData.observaciones || '',
      });

      // Encontrar y seleccionar el caso
      if (initialData.caseId && cases.length > 0) {
        const foundCase = cases.find(c => c.id === initialData.caseId);
        if (foundCase) {
          setSelectedCase(foundCase);
          setCaseSearch(foundCase.numeroCaso);
        }
      }
    } else if (isOpen && !initialData) {
      // Limpiar formulario para nueva disposición
      reset({
        fecha: new Date().toISOString().split('T')[0],
        caseId: '',
        nombreScript: '',
        numeroRevisionSvn: '',
        aplicacionId: '',
        observaciones: '',
      });
      setSelectedCase(null);
      setCaseSearch('');
    }
  }, [isOpen, initialData, cases, reset]);

  // Efecto para actualizar caso seleccionado cuando cambia caseId
  useEffect(() => {
    if (watchedCaseId && cases.length > 0) {
      const foundCase = cases.find(c => c.id === watchedCaseId);
      if (foundCase && (!selectedCase || selectedCase.id !== foundCase.id)) {
        setSelectedCase(foundCase);
        setCaseSearch(foundCase.numeroCaso);
        
        // Auto-seleccionar la aplicación del caso si existe y no estamos en modo edición con datos iniciales
        if (foundCase.aplicacionId && !isEdit) {
          setValue('aplicacionId', foundCase.aplicacionId);
        }
      }
    }
  }, [watchedCaseId, cases, selectedCase, setValue, isEdit]);

  // Filtrar casos por búsqueda
  const filteredCases = cases.filter(caso => 
    caso.numeroCaso.toLowerCase().includes(caseSearch.toLowerCase()) ||
    caso.descripcion.toLowerCase().includes(caseSearch.toLowerCase())
  );

  // Manejar selección de caso
  const handleCaseSelect = (caso: Case) => {
    setSelectedCase(caso);
    setCaseSearch(caso.numeroCaso);
    setValue('caseId', caso.id);
    
    // Auto-seleccionar la aplicación del caso si existe
    if (caso.aplicacionId) {
      setValue('aplicacionId', caso.aplicacionId);
    }
    
    setShowCaseDropdown(false);
  };

  // Manejar cambio en búsqueda de casos
  const handleCaseSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCaseSearch(value);
    
    if (!value) {
      setSelectedCase(null);
      setValue('caseId', '');
    }
    
    setShowCaseDropdown(value.length > 0);
  };

  // Limpiar selección de caso
  const clearCaseSelection = () => {
    setSelectedCase(null);
    setCaseSearch('');
    setValue('caseId', '');
  };

  const handleFormSubmit = (data: DisposicionScriptsFormData) => {
    onSubmit(data);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Editar Disposición de Scripts' : 'Nueva Disposición de Scripts'}
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        
        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Fecha *
          </label>
          <input
            {...register('fecha')}
            type="date"
            className="form-input"
            disabled={loading}
          />
          {errors.fecha && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.fecha.message}
            </p>
          )}
        </div>

        {/* Búsqueda de casos */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Caso *
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={caseSearch}
              onChange={handleCaseSearchChange}
              onFocus={() => setShowCaseDropdown(caseSearch.length > 0)}
              onBlur={() => setTimeout(() => setShowCaseDropdown(false), 200)}
              placeholder="Buscar caso por número o descripción..."
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              disabled={loading || casesLoading}
            />
            {selectedCase && (
              <button
                type="button"
                onClick={clearCaseSelection}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Dropdown de casos */}
          {showCaseDropdown && filteredCases.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {filteredCases.map((caso) => (
                <button
                  key={caso.id}
                  type="button"
                  onClick={() => handleCaseSelect(caso)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 transition-colors"
                >
                  <div className="font-medium text-gray-900 dark:text-white">
                    #{caso.numeroCaso}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                    {caso.descripcion}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    App: {caso.aplicacion?.nombre || 'N/A'} | {caso.clasificacion}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Caso seleccionado */}
          {selectedCase && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
              <div className="text-sm">
                <span className="font-medium text-blue-900 dark:text-blue-100">
                  Caso seleccionado:
                </span>
                <div className="mt-1 text-blue-800 dark:text-blue-200">
                  <div className="font-medium">#{selectedCase.numeroCaso}</div>
                  <div className="text-sm">{selectedCase.descripcion}</div>
                  <div className="text-xs mt-1">
                    Aplicación: {selectedCase.aplicacion?.nombre || 'N/A'} | 
                    Complejidad: {selectedCase.clasificacion}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Campo oculto para el ID del caso */}
          <input
            {...register('caseId')}
            type="hidden"
          />
          {errors.caseId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.caseId.message}
            </p>
          )}
        </div>

        {/* Nombre del Script */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nombre del Script *
          </label>
          <Input
            {...register('nombreScript')}
            placeholder="Nombre del script a desplegar"
            disabled={loading}
          />
          {errors.nombreScript && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.nombreScript.message}
            </p>
          )}
        </div>

        {/* Número de Revisión SVN */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Número de Revisión SVN
          </label>
          <Input
            {...register('numeroRevisionSvn')}
            placeholder="Número de revisión (opcional)"
            disabled={loading}
          />
          {errors.numeroRevisionSvn && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.numeroRevisionSvn.message}
            </p>
          )}
        </div>

        {/* Aplicación */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Aplicación *
            {selectedCase && selectedCase.aplicacionId && (
              <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                (Seleccionada automáticamente del caso)
              </span>
            )}
          </label>
          <select
            {...register('aplicacionId')}
            className="form-input"
            disabled={loading || aplicacionesLoading || (!!selectedCase && !!selectedCase.aplicacionId)}
          >
            <option value="">Seleccionar aplicación...</option>
            {aplicaciones.filter(app => app.activo).map((aplicacion) => (
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

        {/* Observaciones */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Observaciones
          </label>
          <textarea
            {...register('observaciones')}
            rows={3}
            className="form-input"
            placeholder="Observaciones adicionales (opcional)"
            disabled={loading}
          />
          {errors.observaciones && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.observaciones.message}
            </p>
          )}
        </div>

        {/* Advertencia */}
        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>Importante:</strong> Solo se pueden crear disposiciones para casos que ya estén registrados en el sistema.
            La aplicación seleccionada debe coincidir con el entorno donde se desplegará el script.
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={!selectedCase}
          >
            {isEdit ? 'Actualizar' : 'Crear'} Disposición
          </Button>
        </div>
      </form>
    </Modal>
  );
};
