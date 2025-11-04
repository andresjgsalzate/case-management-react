// SCRIPT DE DEBUG TEMPORAL PARA PROBLEMAS DE ARCHIVADO
// Ejecutar este script en la consola del navegador para debug

console.log("🔍 INICIANDO DEBUG DE ARCHIVADO");

// 1. Verificar permisos del usuario actual
const debugUserPermissions = () => {
  console.log("📋 1. VERIFICANDO PERMISOS DE USUARIO");

  // Simular verificación de permisos (reemplazar con tu lógica real)
  const permissions = [
    "archive.create_own",
    "archive.create_team",
    "archive.create_all",
    "archive.view_own",
    "archive.view_team",
    "archive.view_all",
  ];

  permissions.forEach((permission) => {
    console.log(
      `   ${permission}: ${
        hasPermission ? hasPermission(permission) : "NO DISPONIBLE"
      }`
    );
  });
};

// 2. Verificar estados disponibles
const debugCaseStatuses = () => {
  console.log("📋 2. VERIFICANDO ESTADOS DE CASOS");

  // Buscar elementos select de estado en la página
  const statusSelects = document.querySelectorAll("select option");
  const availableStates = Array.from(statusSelects)
    .map((option) => option.textContent)
    .filter(Boolean);

  console.log("   Estados encontrados en la página:", availableStates);
  console.log(
    '   ¿Contiene "TERMINADA"?',
    availableStates.includes("TERMINADA")
  );
  console.log(
    '   ¿Contiene "TERMINADO"?',
    availableStates.includes("TERMINADO")
  );
  console.log(
    '   ¿Contiene "FINALIZADO"?',
    availableStates.includes("FINALIZADO")
  );
  console.log(
    '   ¿Contiene "COMPLETADO"?',
    availableStates.includes("COMPLETADO")
  );
};

// 3. Verificar casos actuales y sus estados
const debugCurrentCases = () => {
  console.log("📋 3. VERIFICANDO CASOS ACTUALES");

  // Buscar elementos que muestren estado de casos
  const caseElements = document.querySelectorAll(
    '[class*="case"], [class*="control"]'
  );
  console.log(`   Encontrados ${caseElements.length} elementos de casos`);

  // Buscar textos que indiquen estados
  const statusTexts = document.querySelectorAll("span, div, p");
  const statusWords = [];
  statusTexts.forEach((el) => {
    const text = el.textContent?.trim();
    if (
      text &&
      (text.includes("TERMINAD") ||
        text.includes("FINALIZAD") ||
        text.includes("COMPLETAD"))
    ) {
      statusWords.push(text);
    }
  });

  console.log("   Estados visibles en la página:", [...new Set(statusWords)]);
};

// 4. Verificar botones de archivo
const debugArchiveButtons = () => {
  console.log("📋 4. VERIFICANDO BOTONES DE ARCHIVO");

  const archiveButtons = document.querySelectorAll(
    'button[class*="yellow"], button:has(svg[class*="ArchiveBox"])'
  );
  console.log(`   Botones de archivo encontrados: ${archiveButtons.length}`);

  const debugMessages = document.querySelectorAll('div[class*="text-xs"]');
  debugMessages.forEach((msg) => {
    if (
      msg.textContent?.includes("Estado actual") ||
      msg.textContent?.includes("Sin permisos")
    ) {
      console.log(`   DEBUG: ${msg.textContent}`);
    }
  });
};

// Ejecutar todas las verificaciones
const runFullDebug = () => {
  console.log("🚀 EJECUTANDO DEBUG COMPLETO");
  debugUserPermissions();
  debugCaseStatuses();
  debugCurrentCases();
  debugArchiveButtons();
  console.log("✅ DEBUG COMPLETADO");
};

// Ejecutar automáticamente
runFullDebug();

// También crear función global para ejecutar manualmente
window.debugArchiveStatus = runFullDebug;

console.log("💡 INSTRUCCIONES:");
console.log("1. Revisa los logs arriba para identificar el problema");
console.log(
  '2. Ejecuta "debugArchiveStatus()" en cualquier momento para volver a verificar'
);
console.log(
  '3. Asegúrate de que tu caso esté en estado "TERMINADA" exactamente'
);
console.log("4. Verifica que tengas permisos de archivo");
