// Hook temporal vacío para compatibilidad
export const useRoles = () => {
  return {
    data: [
      { id: '1', name: 'admin', isActive: true },
      { id: '2', name: 'user', isActive: true }
    ],
    isLoading: false,
    error: null
  };
};
