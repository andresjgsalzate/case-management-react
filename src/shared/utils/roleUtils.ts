/**
 * Utilidades para el manejo de roles
 */

/**
 * Mapea el nombre técnico del rol al nombre de visualización
 */
export function mapRoleToDisplayName(roleName: string | undefined): string {
  const roleMap: Record<string, string> = {
    'admin': 'Administrador',
    'analista': 'Analista',
    'supervisor': 'Supervisor'
  };

  return roleMap[roleName || ''] || 'Usuario';
}
