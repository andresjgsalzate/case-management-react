# 🚀 Script de Instalación Automática - Sistema de Gestión de Casos

Write-Host "🚀 Iniciando instalación del Sistema de Gestión de Casos..." -ForegroundColor Green

# Verificar si Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js no está instalado. Por favor instálalo desde https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Verificar si npm está disponible
try {
    $npmVersion = npm --version
    Write-Host "✅ npm encontrado: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm no está disponible" -ForegroundColor Red
    exit 1
}

Write-Host "`n📦 Instalando dependencias..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}

# Crear archivo .env si no existe
if (-not (Test-Path ".env")) {
    Write-Host "`n📄 Creando archivo .env..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Archivo .env creado. ¡Recuerda configurar tus variables de Supabase!" -ForegroundColor Green
    Write-Host "   - VITE_SUPABASE_URL=tu_supabase_url" -ForegroundColor Cyan
    Write-Host "   - VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key" -ForegroundColor Cyan
} else {
    Write-Host "✅ Archivo .env ya existe" -ForegroundColor Green
}

Write-Host "`n🎉 ¡Instalación completada!" -ForegroundColor Green
Write-Host "`n📋 Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Configura tus variables de Supabase en el archivo .env" -ForegroundColor White
Write-Host "2. Ejecuta las migraciones SQL en tu proyecto de Supabase" -ForegroundColor White
Write-Host "3. Ejecuta 'npm run dev' para iniciar el servidor de desarrollo" -ForegroundColor White

Write-Host "`n🔗 Enlaces útiles:" -ForegroundColor Yellow
Write-Host "   Supabase: https://supabase.com" -ForegroundColor Cyan
Write-Host "   Documentación: Ver README.md" -ForegroundColor Cyan

Write-Host "`n¿Quieres iniciar el servidor de desarrollo ahora? (s/n): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq "s" -or $response -eq "S" -or $response -eq "si" -or $response -eq "Si") {
    Write-Host "`n🚀 Iniciando servidor de desarrollo..." -ForegroundColor Green
    npm run dev
}
