-- =====================================================
-- Arreglo de Política RLS para Eliminar Tiempo Manual
-- =====================================================
-- Fecha: 2025-08-01
-- Descripción: Permite a los analistas eliminar sus propias entradas de tiempo manual

-- Eliminar política general existente si existe
DROP POLICY IF EXISTS "Allow manual_time_entries access based on permissions" ON public.manual_time_entries;

-- Crear políticas específicas por operación

-- Política para SELECT
CREATE POLICY "manual_time_entries_select_policy" ON public.manual_time_entries
    FOR SELECT
    TO authenticated
    USING (
        -- Administradores pueden ver todas las entradas
        public.has_permission(auth.uid(), 'admin.access') OR
        public.has_permission(auth.uid(), 'cases.read.all') OR
        public.has_permission(auth.uid(), 'case_control.view_all') OR
        -- Usuarios con permisos específicos pueden ver sus propias entradas o las que crearon
        (
            (
                public.has_permission(auth.uid(), 'case_control.add_manual_time') OR 
                public.has_permission(auth.uid(), 'case_control.edit_time') OR
                public.has_permission(auth.uid(), 'case_control.view_own')
            ) AND 
            (user_id = auth.uid() OR created_by = auth.uid())
        )
    );

-- Política para INSERT
CREATE POLICY "manual_time_entries_insert_policy" ON public.manual_time_entries
    FOR INSERT
    TO authenticated
    WITH CHECK (
        -- Solo usuarios con permisos pueden insertar
        public.has_permission(auth.uid(), 'case_control.add_manual_time') AND
        -- El usuario debe ser el creador
        created_by = auth.uid()
    );

-- Política para UPDATE
CREATE POLICY "manual_time_entries_update_policy" ON public.manual_time_entries
    FOR UPDATE
    TO authenticated
    USING (
        -- Administradores pueden actualizar todas las entradas
        public.has_permission(auth.uid(), 'admin.access') OR
        -- Usuarios con permisos específicos pueden actualizar sus propias entradas
        (
            public.has_permission(auth.uid(), 'case_control.edit_time') AND
            (user_id = auth.uid() OR created_by = auth.uid())
        )
    )
    WITH CHECK (
        -- Administradores pueden actualizar todas las entradas
        public.has_permission(auth.uid(), 'admin.access') OR
        -- Usuarios con permisos específicos pueden actualizar sus propias entradas
        (
            public.has_permission(auth.uid(), 'case_control.edit_time') AND
            (user_id = auth.uid() OR created_by = auth.uid())
        )
    );

-- Política para DELETE - Esta es la clave para el problema reportado
CREATE POLICY "manual_time_entries_delete_policy" ON public.manual_time_entries
    FOR DELETE
    TO authenticated
    USING (
        -- Administradores pueden eliminar todas las entradas
        public.has_permission(auth.uid(), 'admin.access') OR
        -- Usuarios con permiso específico de eliminar tiempo pueden eliminar sus propias entradas
        (
            public.has_permission(auth.uid(), 'case_control.delete_time') AND
            (user_id = auth.uid() OR created_by = auth.uid())
        )
    );

-- =====================================================
-- COMENTARIOS PARA DOCUMENTACIÓN
-- =====================================================

COMMENT ON POLICY "manual_time_entries_select_policy" ON public.manual_time_entries IS 
'Permite ver entradas de tiempo manual según permisos y propiedad';

COMMENT ON POLICY "manual_time_entries_insert_policy" ON public.manual_time_entries IS 
'Permite insertar entradas de tiempo manual solo a usuarios con permisos apropiados';

COMMENT ON POLICY "manual_time_entries_update_policy" ON public.manual_time_entries IS 
'Permite actualizar entradas de tiempo manual según permisos y propiedad';

COMMENT ON POLICY "manual_time_entries_delete_policy" ON public.manual_time_entries IS 
'Permite eliminar entradas de tiempo manual según permisos y propiedad - incluye analistas';
