# ====================================================================
# SCRIPT DE LIMPIEZA DE ARCHIVOS SQL OBSOLETOS
# ====================================================================
# Descripción: Elimina archivos SQL duplicados y obsoletos,
# manteniendo solo el script final unificado
# Fecha: 6 de Agosto, 2025
# ====================================================================

# Archivos a MANTENER (esenciales)
$keep_files = @(
    "SISTEMA_COMPLETO_FINAL.sql",
    "01_datos_esenciales_roles_permisos.sql",
    "02_datos_esenciales_casos.sql", 
    "09_politicas_rls_granular_v2.sql"
)

# Obtener todos los archivos SQL
$sql_files = Get-ChildItem -Path "sql-scripts" -Filter "*.sql" | Where-Object { $_.Name -notin $keep_files }

Write-Host "🧹 LIMPIEZA DE ARCHIVOS SQL OBSOLETOS" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

Write-Host "`n📋 Archivos que se mantendrán:" -ForegroundColor Green
foreach ($file in $keep_files) {
    if (Test-Path "sql-scripts\$file") {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (no existe)" -ForegroundColor Red
    }
}

Write-Host "`n🗑️ Archivos que se eliminarán:" -ForegroundColor Yellow
foreach ($file in $sql_files) {
    Write-Host "  📄 $($file.Name)" -ForegroundColor Yellow
}

$confirmation = Read-Host "`n¿Confirmar eliminación de $($sql_files.Count) archivos? (s/n)"

if ($confirmation -eq 's' -or $confirmation -eq 'S') {
    $deleted_count = 0
    foreach ($file in $sql_files) {
        try {
            Remove-Item $file.FullName -Force
            Write-Host "  ✅ Eliminado: $($file.Name)" -ForegroundColor Green
            $deleted_count++
        } catch {
            Write-Host "  ❌ Error eliminando: $($file.Name)" -ForegroundColor Red
        }
    }
    
    Write-Host "`n🎉 Limpieza completada!" -ForegroundColor Cyan
    Write-Host "📊 Estadísticas:" -ForegroundColor White
    Write-Host "  - Archivos eliminados: $deleted_count" -ForegroundColor Green
    Write-Host "  - Archivos mantenidos: $($keep_files.Count)" -ForegroundColor Green
    Write-Host "  - Espacio liberado: Aproximadamente $($deleted_count * 15)KB" -ForegroundColor Green
    
    Write-Host "`n📝 Archivo principal:" -ForegroundColor White
    Write-Host "  👉 sql-scripts\SISTEMA_COMPLETO_FINAL.sql" -ForegroundColor Cyan
    Write-Host "     (Contiene todas las funciones esenciales unificadas)" -ForegroundColor Gray
} else {
    Write-Host "`n❌ Operación cancelada" -ForegroundColor Red
}

Write-Host "`n🔧 Para usar el sistema:" -ForegroundColor White
Write-Host "  1. Ejecuta: sql-scripts\SISTEMA_COMPLETO_FINAL.sql" -ForegroundColor Gray
Write-Host "  2. Esto instalará todas las funciones necesarias" -ForegroundColor Gray
Write-Host "  3. El sistema de búsqueda ya estará funcionando" -ForegroundColor Gray
