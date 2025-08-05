import { useMemo } from 'react';
import { usePermissions } from '@/user-management/hooks/useUserProfile';

/**
 * Hook para manejar permisos específicos de Solution Feedback
 */
export const useSolutionFeedbackPermissions = () => {
  const { userProfile, isAdmin, isSupervisor, isAuditor, hasPermission } = usePermissions();

  return useMemo(() => {
    if (!userProfile?.role?.permissions) {
      return {
        canViewFeedback: false,
        canCreateFeedback: false,
        canUpdateOwnFeedback: false,
        canDeleteOwnFeedback: false,
        canModerateFeedback: false,
        canViewAllFeedback: false,
        canAccessFeedbackModule: false
      };
    }

    // Verificar permisos específicos usando los nuevos permisos de la BD
    const canViewFeedback = hasPermission('solution_feedback', 'read') || isAuditor();
    const canCreateFeedback = hasPermission('solution_feedback', 'create') && !isAuditor();
    const canUpdateOwnFeedback = hasPermission('solution_feedback', 'update') && !isAuditor();
    const canDeleteOwnFeedback = hasPermission('solution_feedback', 'delete') && !isAuditor();
    const canModerateFeedback = hasPermission('solution_feedback', 'moderate') && !isAuditor();
    const canViewAllFeedback = hasPermission('solution_feedback', 'view_all') || isAdmin() || isSupervisor() || isAuditor();

    // Acceso al módulo si tiene cualquier permiso relacionado con feedback
    const canAccessFeedbackModule = canViewFeedback || canCreateFeedback || canUpdateOwnFeedback || 
                                   canDeleteOwnFeedback || canModerateFeedback || canViewAllFeedback || isAuditor();

    return {
      canViewFeedback,
      canCreateFeedback,
      canUpdateOwnFeedback,
      canDeleteOwnFeedback,
      canModerateFeedback,
      canViewAllFeedback,
      canAccessFeedbackModule
    };
  }, [userProfile, isAdmin, isSupervisor, isAuditor, hasPermission]);
};
