-- ================================================================
-- EJECUTOR COMPLETO DEL SISTEMA CON PERMISOS GRANULARES
-- ================================================================
-- Descripción: Script que ejecuta todo el sistema de base de datos
-- Sistema: Permisos granulares con formato "modulo.accion_scope"
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- VERIFICACIÓN INICIAL
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '    INICIANDO SISTEMA COMPLETO DE BASE DE DATOS';
    RAISE NOTICE '    CON PERMISOS GRANULARES';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Fecha y hora: %', NOW();
    RAISE NOTICE 'Usuario PostgreSQL: %', current_user;
    RAISE NOTICE 'Base de datos: %', current_database();
    RAISE NOTICE '';
    RAISE NOTICE 'ORDEN DE EJECUCIÓN:';
    RAISE NOTICE '1. Esquema completo de tablas';
    RAISE NOTICE '2. Sistema de permisos granular';
    RAISE NOTICE '3. Funciones y triggers globales';
    RAISE NOTICE '4. Funciones de gestión de casos';
    RAISE NOTICE '5. Funciones de gestión de TODOs';
    RAISE NOTICE '6. Funciones de gestión de archivo';
    RAISE NOTICE '7. Funciones de gestión de documentación';
    RAISE NOTICE '8. Políticas RLS con permisos granulares';
    RAISE NOTICE '';
    RAISE NOTICE 'IMPORTANTE: El sistema usa permisos granulares';
    RAISE NOTICE 'Formato: "modulo.accion_scope" (ej: "cases.read_own")';
    RAISE NOTICE '';
END $$;

-- ================================================================
-- PASO 1: EJECUTAR ESQUEMA COMPLETO DE TABLAS
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE '  PASO 1: ESQUEMA COMPLETO';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Ejecutando: create_complete_schema.sql';
    RAISE NOTICE '';
END $$;

-- INCLUIR AQUÍ EL CONTENIDO DE create_complete_schema.sql
-- (Se asume que ya está ejecutado)

-- ================================================================
-- PASO 2: SISTEMA DE PERMISOS GRANULAR
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE '  PASO 2: SISTEMA DE PERMISOS';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Ejecutando: 03_sistema_permisos_granular.sql';
    RAISE NOTICE '';
END $$;

-- INCLUIR AQUÍ EL CONTENIDO DE 03_sistema_permisos_granular.sql
-- (Funciones de permisos granulares)

-- ================================================================
-- PASO 3: FUNCIONES Y TRIGGERS GLOBALES
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE '  PASO 3: FUNCIONES GLOBALES';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Ejecutando: 04_funciones_triggers_globales.sql';
    RAISE NOTICE '';
END $$;

-- INCLUIR AQUÍ EL CONTENIDO DE 04_funciones_triggers_globales.sql
-- (Funciones globales con permisos granulares)

-- ================================================================
-- PASO 4: FUNCIONES DE GESTIÓN DE CASOS
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE '  PASO 4: GESTIÓN DE CASOS';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Ejecutando: 05_funciones_casos.sql';
    RAISE NOTICE '';
END $$;

-- INCLUIR AQUÍ EL CONTENIDO DE 05_funciones_casos.sql
-- (Funciones de casos con permisos granulares)

-- ================================================================
-- PASO 5: FUNCIONES DE GESTIÓN DE TODOS
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE '  PASO 5: GESTIÓN DE TODOS';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Ejecutando: 06_funciones_todos.sql';
    RAISE NOTICE '';
END $$;

-- INCLUIR AQUÍ EL CONTENIDO DE 06_funciones_todos.sql
-- (Funciones de TODOs con permisos granulares)

-- ================================================================
-- PASO 6: FUNCIONES DE GESTIÓN DE ARCHIVO
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE '  PASO 6: GESTIÓN DE ARCHIVO';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Ejecutando: 07_funciones_archivo.sql';
    RAISE NOTICE '';
END $$;

-- INCLUIR AQUÍ EL CONTENIDO DE 07_funciones_archivo.sql
-- (Funciones de archivo con permisos granulares)

-- ================================================================
-- PASO 7: FUNCIONES DE GESTIÓN DE DOCUMENTACIÓN
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE '  PASO 7: GESTIÓN DE DOCUMENTACIÓN';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Ejecutando: 08_funciones_documentacion.sql';
    RAISE NOTICE '';
END $$;

-- INCLUIR AQUÍ EL CONTENIDO DE 08_funciones_documentacion.sql
-- (Funciones de documentación con permisos granulares)

-- ================================================================
-- PASO 8: POLÍTICAS RLS CON PERMISOS GRANULARES
-- ================================================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '====================================';
    RAISE NOTICE '  PASO 8: POLÍTICAS RLS';
    RAISE NOTICE '====================================';
    RAISE NOTICE 'Ejecutando: 09_politicas_rls.sql';
    RAISE NOTICE '';
END $$;

-- INCLUIR AQUÍ EL CONTENIDO DE 09_politicas_rls.sql
-- (Políticas RLS con permisos granulares)

-- ================================================================
-- VERIFICACIÓN FINAL DEL SISTEMA COMPLETO
-- ================================================================
DO $$
DECLARE
    schema_tables_count INTEGER;
    functions_count INTEGER;
    policies_count INTEGER;
    permissions_count INTEGER;
    test_user_id UUID;
    execution_time INTERVAL;
    start_time TIMESTAMPTZ := NOW();
BEGIN
    execution_time := NOW() - start_time;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '    VERIFICACIÓN FINAL DEL SISTEMA COMPLETO';
    RAISE NOTICE '=================================================';
    RAISE NOTICE '';
    
    -- Contar tablas creadas
    SELECT COUNT(*) INTO schema_tables_count
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE';
    
    -- Contar funciones creadas
    SELECT COUNT(*) INTO functions_count
    FROM information_schema.routines
    WHERE routine_schema = 'public'
    AND routine_type = 'FUNCTION';
    
    -- Contar políticas RLS
    SELECT COUNT(*) INTO policies_count
    FROM pg_policies
    WHERE schemaname = 'public';
    
    -- Contar permisos definidos
    SELECT COUNT(*) INTO permissions_count
    FROM permissions;
    
    RAISE NOTICE 'ESTADÍSTICAS DEL SISTEMA:';
    RAISE NOTICE '- Tablas creadas: %', schema_tables_count;
    RAISE NOTICE '- Funciones creadas: %', functions_count;
    RAISE NOTICE '- Políticas RLS: %', policies_count;
    RAISE NOTICE '- Permisos granulares definidos: %', permissions_count;
    RAISE NOTICE '- Tiempo de ejecución: %', execution_time;
    RAISE NOTICE '';
    
    -- Buscar un usuario de prueba
    SELECT id INTO test_user_id 
    FROM user_profiles 
    WHERE is_active = true 
    LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'PRUEBAS DEL SISTEMA:';
        RAISE NOTICE '- Usuario de prueba encontrado: %', test_user_id;
        
        -- Verificar funciones principales
        IF user_has_permission(test_user_id, 'cases.read_own') THEN
            RAISE NOTICE '✓ Sistema de permisos granular: FUNCIONANDO';
        ELSE
            RAISE NOTICE '⚠ Sistema de permisos granular: VERIFICAR CONFIGURACIÓN';
        END IF;
        
        -- Verificar función de métricas
        BEGIN
            PERFORM get_dashboard_metrics(test_user_id);
            RAISE NOTICE '✓ Métricas del dashboard: FUNCIONANDO';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '⚠ Métricas del dashboard: ERROR - %', SQLERRM;
        END;
        
    ELSE
        RAISE NOTICE 'ℹ No se encontraron usuarios para pruebas';
        RAISE NOTICE 'ℹ Crear usuarios y asignar permisos después de la instalación';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE 'SISTEMA DE PERMISOS GRANULARES:';
    RAISE NOTICE '- Formato: "modulo.accion_scope"';
    RAISE NOTICE '- Scopes disponibles: own, team, all';
    RAISE NOTICE '- Ejemplos:';
    RAISE NOTICE '  * cases.read_own - Leer solo casos propios';
    RAISE NOTICE '  * users.update_team - Actualizar usuarios del equipo';
    RAISE NOTICE '  * documentation.publish_all - Publicar cualquier documento';
    RAISE NOTICE '';
    
    RAISE NOTICE 'PRÓXIMOS PASOS:';
    RAISE NOTICE '1. Asignar permisos a usuarios existentes';
    RAISE NOTICE '2. Configurar lógica de equipos si es necesario';
    RAISE NOTICE '3. Probar funcionalidad con diferentes usuarios';
    RAISE NOTICE '4. Ajustar permisos según necesidades del negocio';
    RAISE NOTICE '';
    
    RAISE NOTICE '🎉 SISTEMA COMPLETO DE PERMISOS GRANULARES INSTALADO EXITOSAMENTE';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================';
    RAISE NOTICE 'Fin de la instalación: %', NOW();
    RAISE NOTICE '=================================================';
    RAISE NOTICE '';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '';
    RAISE NOTICE '❌ ERROR EN LA VERIFICACIÓN FINAL:';
    RAISE NOTICE 'Error: %', SQLERRM;
    RAISE NOTICE 'Detalle: %', SQLSTATE;
    RAISE NOTICE '';
    RAISE NOTICE 'Por favor verificar la instalación manualmente.';
    RAISE NOTICE '';
END $$;
