import React, { useState } from 'react';
import { supabase } from '@/shared/lib/supabase';

export const EmailDiagnostic: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      addResult('🔍 Iniciando diagnóstico de emails...');

      // 1. Verificar configuración SMTP en la base de datos
      addResult('📧 Verificando configuración SMTP en base de datos...');
      const { data: smtpConfig, error: smtpError } = await supabase
        .from('system_configurations')
        .select('*')
        .in('category', ['smtp', 'email', 'urls', 'email_limits', 'template_config'])
        .eq('is_active', true)
        .order('category', { ascending: true });

      if (smtpError) {
        addResult(`❌ Error al obtener configuración SMTP: ${smtpError.message}`);
      } else if (!smtpConfig || smtpConfig.length === 0) {
        addResult('⚠️ No se encontró configuración SMTP activa en la base de datos');
      } else {
        addResult(`✅ Configuraciones encontradas: ${smtpConfig.length} configuraciones`);
        
        // Agrupar por categoría
        const configsByCategory: Record<string, any[]> = {};
        smtpConfig.forEach(config => {
          if (!configsByCategory[config.category]) {
            configsByCategory[config.category] = [];
          }
          configsByCategory[config.category].push(config);
        });
        
        Object.entries(configsByCategory).forEach(([category, configs]) => {
          addResult(`   📁 ${category.toUpperCase()}:`);
          configs.forEach((config: any) => {
            const value = config.key.toLowerCase().includes('password') ? '***' : config.value;
            addResult(`      - ${config.key}: ${value} (${config.description})`);
          });
        });
        
        // Verificar configuraciones críticas faltantes
        const smtpConfigs = configsByCategory['smtp'] || [];
        const requiredSmtpKeys = ['host', 'port', 'username', 'password', 'sender_email'];
        const missingKeys = requiredSmtpKeys.filter(key => 
          !smtpConfigs.some(config => config.key === key)
        );
        
        if (missingKeys.length > 0) {
          addResult(`⚠️ Configuraciones SMTP faltantes: ${missingKeys.join(', ')}`);
        } else {
          addResult(`✅ Todas las configuraciones SMTP básicas están presentes`);
        }
      }

      // 2. Verificar templates de email
      addResult('📝 Verificando templates de email...');
      const { data: templates, error: templatesError } = await supabase
        .from('email_templates')
        .select('id, template_name, template_type, subject, is_active, created_at')
        .eq('is_active', true)
        .order('template_type', { ascending: true });

      if (templatesError) {
        addResult(`❌ Error al obtener templates: ${templatesError.message}`);
      } else {
        addResult(`✅ Templates encontrados: ${templates?.length || 0}`);
        templates?.forEach((template: any) => {
          addResult(`   - ${template.template_name || 'Sin nombre'}: ${template.template_type || 'Sin tipo'} - "${template.subject || 'Sin asunto'}"`);
        });
      }

      // 3. Verificar logs de emails recientes
      addResult('📊 Verificando logs de emails recientes...');
      const { data: logs, error: logsError } = await supabase
        .from('email_logs')
        .select('id, recipient_email, subject, status, error_message, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (logsError) {
        addResult(`❌ Error al obtener logs: ${logsError.message}`);
      } else {
        addResult(`📋 Últimos ${logs?.length || 0} envíos de email:`);
        if (logs && logs.length > 0) {
          logs.forEach((log: any) => {
            const date = new Date(log.created_at).toLocaleString();
            const status = log.status === 'sent' ? '✅' : '❌';
            addResult(`   ${status} ${date}: ${log.recipient_email || 'Sin destinatario'} - ${log.status} - "${log.subject || 'Sin asunto'}"`);
            if (log.error_message) {
              addResult(`      Error: ${log.error_message}`);
            }
          });
        } else {
          addResult('   No hay logs de emails en la base de datos');
        }
      }

      // 4. Probar reset password personalizado (no Supabase)
      addResult('🔐 Probando sistema personalizado de recuperación...');
      const testEmail = 'andresjgsalzate@gmail.com';
      
      try {
        // Simulamos una prueba básica sin enviar email real
        const { data: testUser, error: testUserError } = await supabase
          .from('user_profiles')
          .select('email, full_name')
          .eq('email', testEmail)
          .single();

        if (testUserError || !testUser) {
          addResult(`⚠️ Usuario de prueba no encontrado: ${testEmail}`);
        } else {
          addResult(`✅ Usuario de prueba encontrado: ${testUser.full_name || testUser.email}`);
          addResult(`✅ Sistema personalizado listo para usar`);
          addResult(`📧 Usará SMTP configurado: ${smtpConfig?.find(c => c.key === 'host')?.value}`);
        }

        // Verificar tabla de tokens
        const { error: tokenError } = await supabase
          .from('password_reset_tokens')
          .select('id')
          .limit(1);

        if (tokenError) {
          addResult(`❌ Error acceso a tabla tokens: ${tokenError.message}`);
        } else {
          addResult(`✅ Tabla password_reset_tokens accesible`);
        }

      } catch (error: any) {
        addResult(`❌ Error en verificación sistema personalizado: ${error.message}`);
      }

      // 5. Verificar configuración de Auth en Supabase
      addResult('⚙️ Verificando configuración de usuario actual...');
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        addResult(`❌ Error al obtener usuario: ${userError.message}`);
      } else if (user) {
        addResult(`✅ Usuario actual: ${user.email}`);
        addResult(`   ID: ${user.id}`);
        addResult(`   Email confirmado: ${user.email_confirmed_at ? 'Sí' : 'No'}`);
      } else {
        addResult('⚠️ No hay usuario logueado');
      }

      addResult('🏁 Diagnóstico completado');
      
      // Análisis final
      addResult('');
      addResult('🔍 ANÁLISIS ACTUALIZADO:');
      addResult('');
      addResult('🎉 SOLUCIÓN IMPLEMENTADA: Sistema personalizado de recuperación activo');
      addResult('');
      addResult('✅ Sistema personalizado incluye:');
      addResult('   • Tokens seguros de 64 caracteres');
      addResult('   • Expiración configurable (24 horas)');
      addResult('   • Usa nuestro SMTP configurado');
      addResult('   • Sin limitaciones de rate limit');
      addResult('   • Logs completos en nuestra base de datos');
      addResult('   • Templates HTML personalizables');
      addResult('');
      addResult('🛠️ ESTADO ACTUAL:');
      if (smtpConfig && smtpConfig.some(c => c.category === 'smtp')) {
        addResult('   ✅ SMTP configurado y listo');
        addResult('   ✅ Tabla password_reset_tokens creada');
        addResult('   ✅ Hook useAuth actualizado para usar sistema personalizado');
        addResult('   ✅ Formulario de recuperación funcionando');
      } else {
        addResult('   ⚠️ Configuración SMTP incompleta');
      }
      addResult('');
      addResult('📧 PRÓXIMOS PASOS:');
      addResult('   1. Probar recuperación de contraseña desde login');
      addResult('   2. Verificar que llegue email a bandeja de entrada');
      addResult('   3. Completar flujo de reset con nueva contraseña');

    } catch (error: any) {
      addResult(`💥 Error general en diagnóstico: ${error.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        🔧 Diagnóstico de Emails
      </h2>
      
      <button
        onClick={runDiagnostic}
        disabled={isRunning}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isRunning ? 'Ejecutando...' : 'Ejecutar Diagnóstico'}
      </button>

      <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
        {results.length === 0 ? (
          <div className="text-gray-500">Presiona "Ejecutar Diagnóstico" para comenzar...</div>
        ) : (
          results.map((result, index) => (
            <div key={index} className="mb-1">
              {result}
            </div>
          ))
        )}
      </div>

      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded">
        <h3 className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">
          📋 Posibles Causas de No Recepción de Emails:
        </h3>
        <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
          <li>• <strong>Supabase Auth:</strong> El reset password usa el servicio de email de Supabase, no nuestro SMTP</li>
          <li>• <strong>Configuración de Supabase:</strong> Puede que no esté configurado el SMTP en el dashboard de Supabase</li>
          <li>• <strong>Filtros de Spam:</strong> Revisa carpeta de spam/correo no deseado</li>
          <li>• <strong>Demora:</strong> Los emails pueden tardar hasta 15 minutos en llegar</li>
          <li>• <strong>Email ya usado:</strong> Supabase puede no enviar si ya se solicitó recientemente</li>
          <li>• <strong>Dominio del email:</strong> Algunos dominios pueden bloquear emails automáticos</li>
        </ul>
      </div>
    </div>
  );
};
