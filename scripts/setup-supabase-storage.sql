-- Script para configurar Supabase Storage para fotos de películas
-- NOTA: Este script debe ejecutarse desde el dashboard de Supabase o mediante la API

-- Crear el bucket para fotos de películas si no existe
-- Esto debe hacerse desde el dashboard de Supabase Storage o mediante código JavaScript

/*
Para configurar manualmente en Supabase Dashboard:

1. Ve a Storage en tu dashboard de Supabase
2. Haz clic en "New bucket"
3. Nombre: movie-photos
4. Configuración:
   - Public bucket: ✅ Habilitado
   - File size limit: 10 MB
   - Allowed MIME types: image/jpeg, image/png, image/webp, image/gif

5. Crear las siguientes políticas RLS:

Política 1 - Ver fotos:
- Policy name: "Anyone can view movie photos"
- Allowed operation: SELECT
- Target roles: public
- USING expression: true

Política 2 - Subir fotos:
- Policy name: "Anyone can upload movie photos" 
- Allowed operation: INSERT
- Target roles: public
- WITH CHECK expression: true

Política 3 - Eliminar fotos:
- Policy name: "Anyone can delete movie photos"
- Allowed operation: DELETE  
- Target roles: public
- USING expression: true
*/

-- Verificar que las tablas de fotos existan
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'movie_photos') THEN
        RAISE NOTICE 'Tabla movie_photos no existe. Ejecuta primero el script add-movie-photos.sql';
    ELSE
        RAISE NOTICE 'Tabla movie_photos configurada correctamente';
    END IF;
END $$;

-- Verificar políticas RLS
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_policies WHERE tablename = 'movie_photos') THEN
        RAISE NOTICE 'Políticas RLS configuradas para movie_photos';
    ELSE
        RAISE NOTICE 'ADVERTENCIA: No se encontraron políticas RLS para movie_photos';
    END IF;
END $$;
