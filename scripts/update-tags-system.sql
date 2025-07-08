-- Actualizar el sistema de tags para manejar jerarquía parque -> atracción

-- Primero, vamos a limpiar y recrear las tablas de tags
DROP TABLE IF EXISTS movie_tags CASCADE;
DROP TABLE IF EXISTS task_tags CASCADE;
DROP TABLE IF EXISTS note_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- Crear tabla de tags con jerarquía
CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('park', 'attraction')) NOT NULL,
    parent_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_tags_parent_id ON tags(parent_id);
CREATE INDEX IF NOT EXISTS idx_tags_type ON tags(type);

-- Tabla de relaciones película-etiqueta
CREATE TABLE IF NOT EXISTS movie_tags (
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, tag_id)
);

-- Tabla de relaciones tarea-etiqueta
CREATE TABLE IF NOT EXISTS task_tags (
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

-- Tabla de relaciones nota-etiqueta
CREATE TABLE IF NOT EXISTS note_tags (
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, tag_id)
);

-- Migrar datos existentes de parques a tags
INSERT INTO tags (id, name, type, parent_id, icon, color)
SELECT id, name, 'park', NULL, icon, color
FROM parks;

-- Migrar datos existentes de atracciones a tags como sub-tags
INSERT INTO tags (id, name, type, parent_id, icon, color)
SELECT 
    a.id, 
    a.name, 
    'attraction', 
    a.park_id,
    CASE 
        WHEN a.type = 'ride' THEN '���'
        WHEN a.type = 'show' THEN '🎭'
        WHEN a.type = 'restaurant' THEN '🍽️'
        WHEN a.type = 'shop' THEN '🛍️'
        ELSE '🎯'
    END,
    CASE 
        WHEN a.priority = 'high' THEN 'text-red-600 bg-red-50'
        WHEN a.priority = 'medium' THEN 'text-yellow-600 bg-yellow-50'
        ELSE 'text-green-600 bg-green-50'
    END
FROM attractions a;

-- Crear función para obtener tags con jerarquía
CREATE OR REPLACE FUNCTION get_tags_hierarchy()
RETURNS TABLE (
    id UUID,
    name TEXT,
    type TEXT,
    parent_id UUID,
    parent_name TEXT,
    icon TEXT,
    color TEXT,
    full_path TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.name,
        t.type,
        t.parent_id,
        p.name as parent_name,
        t.icon,
        t.color,
        CASE 
            WHEN t.parent_id IS NULL THEN t.name
            ELSE CONCAT(p.name, ' → ', t.name)
        END as full_path
    FROM tags t
    LEFT JOIN tags p ON t.parent_id = p.id
    ORDER BY 
        COALESCE(p.name, t.name),
        CASE WHEN t.parent_id IS NULL THEN 0 ELSE 1 END,
        t.name;
END;
$$ LANGUAGE plpgsql;
