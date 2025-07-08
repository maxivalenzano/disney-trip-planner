-- Crear tabla para almacenar fotos de películas

CREATE TABLE IF NOT EXISTS movie_photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    photo_path TEXT NOT NULL, -- Para poder eliminar del storage
    caption TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índice para mejor performance
CREATE INDEX IF NOT EXISTS idx_movie_photos_movie_id ON movie_photos(movie_id);
CREATE INDEX IF NOT EXISTS idx_movie_photos_uploaded_at ON movie_photos(uploaded_at DESC);

-- Configurar políticas de seguridad para Supabase Storage (RLS)
-- Estas políticas permiten a cualquier usuario autenticado subir y ver fotos
-- En producción, deberías ajustar según tus necesidades de seguridad

-- Política para ver fotos
CREATE POLICY "Anyone can view movie photos" ON movie_photos
    FOR SELECT USING (true);

-- Política para insertar fotos
CREATE POLICY "Anyone can upload movie photos" ON movie_photos
    FOR INSERT WITH CHECK (true);

-- Política para eliminar fotos
CREATE POLICY "Anyone can delete movie photos" ON movie_photos
    FOR DELETE USING (true);

-- Habilitar RLS
ALTER TABLE movie_photos ENABLE ROW LEVEL SECURITY;
