-- ================================================================
-- POLÍTICAS RLS PARA DISPOSICIONES DE SCRIPTS
-- ================================================================
-- Descripción: Políticas de Row Level Security para disposiciones_scripts
-- Sistema: Basado en has_permission(auth.uid(), "disposiciones.accion_scope")
-- Fecha: 6 de Agosto, 2025
-- ================================================================

-- VERIFICACIÓN INICIAL
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '  POLÍTICAS RLS DISPOSICIONES SCRIPTS';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Fecha: %', NOW();
    RAISE NOTICE '';
END $$;

-- ================================================================
-- ELIMINAR POLÍTICAS EXISTENTES
-- ================================================================
DROP POLICY IF EXISTS "disposiciones_scripts_select_granular" ON disposiciones_scripts;
DROP POLICY IF EXISTS "disposiciones_scripts_insert_granular" ON disposiciones_scripts;
DROP POLICY IF EXISTS "disposiciones_scripts_update_granular" ON disposiciones_scripts;
DROP POLICY IF EXISTS "disposiciones_scripts_delete_granular" ON disposiciones_scripts;

-- ================================================================
-- POLÍTICAS RLS PARA DISPOSICIONES_SCRIPTS
-- ================================================================

-- POLÍTICA SELECT: Ver disposiciones según permisos
CREATE POLICY "disposiciones_scripts_select_granular" ON disposiciones_scripts
    FOR SELECT
    USING (
        -- Verificar que el usuario esté autenticado
        auth.uid() IS NOT NULL
        AND (
            -- Scope "all": Ver todas las disposiciones
            has_permission(auth.uid(), 'disposiciones.read_all')
            
            -- Scope "team": Ver disposiciones del equipo (por ahora mismo que "all")
            OR has_permission(auth.uid(), 'disposiciones.read_team')
            
            -- Scope "own": Ver solo disposiciones propias
            OR (has_permission(auth.uid(), 'disposiciones.read_own') 
                AND user_profile_id = auth.uid())
        )
    );

-- POLÍTICA INSERT: Crear disposiciones según permisos
CREATE POLICY "disposiciones_scripts_insert_granular" ON disposiciones_scripts
    FOR INSERT
    WITH CHECK (
        -- Verificar que el usuario esté autenticado
        auth.uid() IS NOT NULL
        AND (
            -- Scope "all": Crear cualquier disposición
            has_permission(auth.uid(), 'disposiciones.create_all')
            
            -- Scope "team": Crear disposiciones para el equipo
            OR has_permission(auth.uid(), 'disposiciones.create_team')
            
            -- Scope "own": Crear solo disposiciones propias
            OR (has_permission(auth.uid(), 'disposiciones.create_own')
                AND user_profile_id = auth.uid())
        )
        -- Verificar que el user_profile_id coincida con el usuario autenticado
        AND user_profile_id = auth.uid()
    );

-- POLÍTICA UPDATE: Actualizar disposiciones según permisos
CREATE POLICY "disposiciones_scripts_update_granular" ON disposiciones_scripts
    FOR UPDATE
    USING (
        -- Verificar que el usuario esté autenticado
        auth.uid() IS NOT NULL
        AND (
            -- Scope "all": Actualizar cualquier disposición
            has_permission(auth.uid(), 'disposiciones.update_all')
            
            -- Scope "team": Actualizar disposiciones del equipo
            OR has_permission(auth.uid(), 'disposiciones.update_team')
            
            -- Scope "own": Actualizar solo disposiciones propias
            OR (has_permission(auth.uid(), 'disposiciones.update_own')
                AND user_profile_id = auth.uid())
        )
    )
    WITH CHECK (
        -- Verificar que el usuario esté autenticado
        auth.uid() IS NOT NULL
        AND (
            -- Scope "all": Actualizar cualquier disposición
            has_permission(auth.uid(), 'disposiciones.update_all')
            
            -- Scope "team": Actualizar disposiciones del equipo
            OR has_permission(auth.uid(), 'disposiciones.update_team')
            
            -- Scope "own": Actualizar solo disposiciones propias
            OR (has_permission(auth.uid(), 'disposiciones.update_own')
                AND user_profile_id = auth.uid())
        )
    );

-- POLÍTICA DELETE: Eliminar disposiciones según permisos
CREATE POLICY "disposiciones_scripts_delete_granular" ON disposiciones_scripts
    FOR DELETE
    USING (
        -- Verificar que el usuario esté autenticado
        auth.uid() IS NOT NULL
        AND (
            -- Scope "all": Eliminar cualquier disposición
            has_permission(auth.uid(), 'disposiciones.delete_all')
            
            -- Scope "team": Eliminar disposiciones del equipo
            OR has_permission(auth.uid(), 'disposiciones.delete_team')
            
            -- Scope "own": Eliminar solo disposiciones propias
            OR (has_permission(auth.uid(), 'disposiciones.delete_own')
                AND user_profile_id = auth.uid())
        )
    );

-- ================================================================
-- VERIFICACIÓN FINAL
-- ================================================================
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Contar políticas para disposiciones_scripts
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename = 'disposiciones_scripts'
    AND policyname LIKE '%_granular';
    
    RAISE NOTICE 'VERIFICACIÓN - POLÍTICAS DISPOSICIONES_SCRIPTS:';
    RAISE NOTICE '- Políticas creadas: %', policy_count;
    
    -- Verificar RLS habilitado
    IF EXISTS (
        SELECT 1 FROM pg_class c 
        JOIN pg_namespace n ON c.relnamespace = n.oid 
        WHERE n.nspname = 'public' 
        AND c.relname = 'disposiciones_scripts' 
        AND c.relrowsecurity = true
    ) THEN
        RAISE NOTICE '- RLS habilitado: ✓';
    ELSE
        RAISE NOTICE '- RLS habilitado: ✗';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '🔒 POLÍTICAS RLS DISPOSICIONES_SCRIPTS COMPLETADAS';
    RAISE NOTICE '';
    RAISE NOTICE 'Políticas implementadas:';
    RAISE NOTICE '- SELECT: disposiciones_scripts_select_granular';
    RAISE NOTICE '- INSERT: disposiciones_scripts_insert_granular';
    RAISE NOTICE '- UPDATE: disposiciones_scripts_update_granular';
    RAISE NOTICE '- DELETE: disposiciones_scripts_delete_granular';
    RAISE NOTICE '';
    RAISE NOTICE 'Permisos utilizados:';
    RAISE NOTICE '- disposiciones.read_[own|team|all]';
    RAISE NOTICE '- disposiciones.create_[own|team|all]';
    RAISE NOTICE '- disposiciones.update_[own|team|all]';
    RAISE NOTICE '- disposiciones.delete_[own|team|all]';
    RAISE NOTICE '';
END $$;
