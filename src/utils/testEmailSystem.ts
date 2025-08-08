import { supabase } from '@/shared/lib/supabase';

/**
 * Script de prueba para verificar el sistema de emails SMTP
 * Ejecutar desde la consola del navegador para verificar configuraciones
 */

interface TestResult {
  test: string;
  success: boolean;
  data?: any;
  error?: string;
  details?: any;
}

export async function testEmailSystem(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log('🧪 Iniciando pruebas del sistema de email...');

  // 1. Verificar configuraciones SMTP básicas
  try {
    console.log('\n📧 1. Verificando configuraciones SMTP...');
    
    const { data: smtpConfigs, error } = await supabase
      .from('system_configurations')
      .select('key, value, description')
      .eq('category', 'smtp')
      .eq('is_active', true)
      .order('key');

    if (error) throw error;

    const configMap = smtpConfigs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {} as Record<string, string>);

    const requiredKeys = ['host', 'port', 'username', 'sender_email', 'sender_name', 'use_ssl'];
    const missingKeys = requiredKeys.filter(key => !configMap[key]);

    results.push({
      test: 'Configuraciones SMTP básicas',
      success: missingKeys.length === 0,
      data: configMap,
      error: missingKeys.length > 0 ? `Configuraciones faltantes: ${missingKeys.join(', ')}` : undefined,
      details: {
        found: Object.keys(configMap),
        missing: missingKeys,
        total: smtpConfigs.length
      }
    });

    console.log('✅ Configuraciones SMTP encontradas:', Object.keys(configMap));
    if (missingKeys.length > 0) {
      console.warn('⚠️ Configuraciones faltantes:', missingKeys);
    }

  } catch (error: any) {
    console.error('❌ Error verificando configuraciones SMTP:', error);
    results.push({
      test: 'Configuraciones SMTP básicas',
      success: false,
      error: error.message
    });
  }

  // 2. Verificar contraseña SMTP segura
  try {
    console.log('\n🔑 2. Verificando credencial SMTP segura...');
    
    const { data: password, error } = await supabase
      .rpc('get_decrypted_credential', { p_key: 'smtp_password' });

    if (error) throw error;

    const hasPassword = !!password && password !== 'CHANGE_THIS_PASSWORD';

    results.push({
      test: 'Credencial SMTP segura',
      success: hasPassword,
      data: hasPassword ? '****** (oculta por seguridad)' : 'No configurada',
      error: !hasPassword ? 'Contraseña SMTP no configurada o es placeholder' : undefined,
      details: {
        passwordExists: !!password,
        isPlaceholder: password === 'CHANGE_THIS_PASSWORD',
        length: password?.length || 0
      }
    });

    console.log('✅ Contraseña SMTP:', hasPassword ? 'Configurada correctamente' : 'No configurada');

  } catch (error: any) {
    console.error('❌ Error verificando contraseña SMTP:', error);
    results.push({
      test: 'Credencial SMTP segura',
      success: false,
      error: error.message
    });
  }

  // 3. Verificar tabla de credenciales seguras
  try {
    console.log('\n🔐 3. Verificando tabla de credenciales seguras...');
    
    // Intentar con ambos nombres de tabla posibles
    let credentials = null;
    let tableName = '';
    
    // Intentar con smtp_credentials primero (tabla correcta)
    try {
      const { data, error } = await supabase
        .from('smtp_credentials')
        .select('credential_key, description, is_active, created_at')
        .eq('is_active', true);
      
      if (!error && data) {
        credentials = data;
        tableName = 'smtp_credentials';
      }
    } catch (err) {
      // Fallback a secure_credentials si existe
      try {
        const { data, error } = await supabase
          .from('secure_credentials')
          .select('credential_key, description, is_active, created_at')
          .eq('is_active', true);
        
        if (!error && data) {
          credentials = data;
          tableName = 'secure_credentials';
        }
      } catch (err2) {
        console.log('   ❌ No se encontró ninguna tabla de credenciales');
      }
    }

    if (credentials && credentials.length > 0) {
      const smtpCredential = credentials.find(c => c.credential_key === 'smtp_password');
      
      results.push({
        test: 'Tabla credenciales seguras',
        success: !!smtpCredential,
        data: credentials,
        error: !smtpCredential ? 'Credencial smtp_password no encontrada' : undefined,
        details: {
          tableName: tableName,
          totalCredentials: credentials.length,
          smtpCredentialExists: !!smtpCredential,
          smtpCredentialDate: smtpCredential?.created_at
        }
      });

      console.log(`   ✅ Credenciales encontradas en tabla: ${tableName} (${credentials.length})`);
    } else {
      results.push({
        test: 'Tabla credenciales seguras',
        success: false,
        error: 'No se encontró tabla de credenciales o está vacía',
        details: {
          tableName: 'No encontrada',
          totalCredentials: 0,
          smtpCredentialExists: false
        }
      });
      console.log('   ❌ No se encontró tabla de credenciales');
    }

  } catch (error: any) {
    console.error('❌ Error verificando credenciales seguras:', error);
    results.push({
      test: 'Tabla credenciales seguras',
      success: false,
      error: error.message
    });
  }

  // 4. Verificar configuraciones de URL
  try {
    console.log('\n🌐 4. Verificando configuraciones de URL...');
    
    const { data: urlConfigs, error } = await supabase
      .from('system_configurations')
      .select('key, value')
      .eq('category', 'urls')
      .eq('is_active', true);

    if (error) throw error;

    const urlMap = urlConfigs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {} as Record<string, string>);

    const requiredUrls = ['base_url_development', 'base_url_production', 'callback_path', 'reset_password_path'];
    const missingUrls = requiredUrls.filter(key => !urlMap[key]);

    results.push({
      test: 'Configuraciones de URL',
      success: missingUrls.length === 0,
      data: urlMap,
      error: missingUrls.length > 0 ? `URLs faltantes: ${missingUrls.join(', ')}` : undefined,
      details: {
        found: Object.keys(urlMap),
        missing: missingUrls,
        currentEnv: import.meta.env.DEV ? 'development' : 'production'
      }
    });

    console.log('✅ URLs configuradas:', Object.keys(urlMap));

  } catch (error: any) {
    console.error('❌ Error verificando URLs:', error);
    results.push({
      test: 'Configuraciones de URL',
      success: false,
      error: error.message
    });
  }

  // 5. Verificar límites de email
  try {
    console.log('\n📊 5. Verificando límites de email...');
    
    const { data: limitConfigs, error } = await supabase
      .from('system_configurations')
      .select('key, value')
      .eq('category', 'email_limits')
      .eq('is_active', true);

    if (error) throw error;

    const limitMap = limitConfigs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {} as Record<string, string>);

    results.push({
      test: 'Límites de email',
      success: Object.keys(limitMap).length > 0,
      data: limitMap,
      details: {
        totalLimits: limitConfigs.length,
        limits: limitMap
      }
    });

    console.log('✅ Límites de email configurados:', Object.keys(limitMap));

  } catch (error: any) {
    console.error('❌ Error verificando límites:', error);
    results.push({
      test: 'Límites de email',
      success: false,
      error: error.message
    });
  }

  // 6. Verificar templates de email
  try {
    console.log('\n📝 6. Verificando templates de email...');
    
    const { data: templates, error } = await supabase
      .from('email_templates')
      .select('template_type, template_name, is_active, is_default')
      .eq('is_active', true);

    if (error) throw error;

    const templateTypes = templates.map(t => t.template_type);
    const requiredTypes = ['confirmation', 'magic_link', 'invitation', 'password_recovery'];
    const missingTypes = requiredTypes.filter(type => !templateTypes.includes(type));

    results.push({
      test: 'Templates de email',
      success: missingTypes.length === 0,
      data: templates,
      error: missingTypes.length > 0 ? `Templates faltantes: ${missingTypes.join(', ')}` : undefined,
      details: {
        totalTemplates: templates.length,
        types: templateTypes,
        missing: missingTypes
      }
    });

    console.log('✅ Templates encontrados:', templateTypes);

  } catch (error: any) {
    console.error('❌ Error verificando templates:', error);
    results.push({
      test: 'Templates de email',
      success: false,
      error: error.message
    });
  }

  // 7. Verificar logs de email recientes
  try {
    console.log('\n📋 7. Verificando logs de email...');
    
    const { data: logs, error } = await supabase
      .from('email_logs')
      .select('email_type, status, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    const recentLogs = logs.length;
    const successfulEmails = logs.filter(log => log.status === 'sent').length;
    const failedEmails = logs.filter(log => log.status === 'failed').length;

    results.push({
      test: 'Logs de email',
      success: true, // Los logs pueden estar vacíos inicialmente
      data: logs.slice(0, 5), // Solo mostrar los 5 más recientes
      details: {
        totalLogs: recentLogs,
        successful: successfulEmails,
        failed: failedEmails,
        hasActivity: recentLogs > 0
      }
    });

    console.log('✅ Logs de email encontrados:', recentLogs);

  } catch (error: any) {
    console.error('❌ Error verificando logs:', error);
    results.push({
      test: 'Logs de email',
      success: false,
      error: error.message
    });
  }

  // Resumen final
  const totalTests = results.length;
  const passedTests = results.filter(r => r.success).length;
  const failedTests = totalTests - passedTests;

  console.log('\n📊 RESUMEN DE PRUEBAS:');
  console.log(`✅ Exitosas: ${passedTests}/${totalTests}`);
  console.log(`❌ Fallidas: ${failedTests}/${totalTests}`);
  
  if (failedTests === 0) {
    console.log('🎉 ¡Sistema de email completamente configurado!');
  } else {
    console.log('⚠️ Algunas configuraciones necesitan atención.');
  }

  return results;
}

// Función helper para ejecutar desde consola
export function runEmailSystemTest() {
  testEmailSystem().then(results => {
    console.table(results.map(r => ({
      Test: r.test,
      Success: r.success ? '✅' : '❌',
      Error: r.error || '-'
    })));
  });
}

// Hacer disponible globalmente para pruebas
if (typeof window !== 'undefined') {
  (window as any).testEmailSystem = testEmailSystem;
  (window as any).runEmailSystemTest = runEmailSystemTest;
}
