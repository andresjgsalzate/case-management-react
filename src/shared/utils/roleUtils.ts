/**
 * Utilidades para el manejo de roles
 */

/**
 * Mapea el nombre técnico del rol al nombre de visualización
 * Usa la descripción del rol si está disponible, sino el nombre con mapeo especial para "Admin"
 */
export function mapRoleToDisplayName(roleName: string | undefined, roleDescription?: string | null): string {
  if (!roleName) return 'Usuario';
  
  // Si tenemos descripción del rol, usarla
  if (roleDescription) {
    return roleDescription;
  }
  
  // Mapeo especial solo para "Admin" (sin importar capitalización)
  if (roleName.toLowerCase() === 'admin') {
    return 'Administrador';
  }
  
  // Para cualquier otro rol, usar el nombre tal como viene de la BD
  return roleName;
}
