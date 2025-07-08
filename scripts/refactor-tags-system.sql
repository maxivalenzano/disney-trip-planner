-- Refactorizar el sistema de tags para eliminar duplicación y mantener consistencia automática

-- 1. Primero, vamos a limpiar las tablas de relaciones existentes
DROP TABLE IF EXISTS movie_tags CASCADE;
DROP TABLE IF EXISTS task_tags CASCADE;
DROP TABLE IF EXISTS note_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;

-- 2. Crear nuevas tablas de relación que referencien directamente a parks y attractions
CREATE TABLE IF NOT EXISTS movie_park_tags (
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    park_id UUID REFERENCES parks(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, park_id)
);

CREATE TABLE IF NOT EXISTS movie_attraction_tags (
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, attraction_id)
);

CREATE TABLE IF NOT EXISTS task_park_tags (
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    park_id UUID REFERENCES parks(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, park_id)
);

CREATE TABLE IF NOT EXISTS task_attraction_tags (
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, attraction_id)
);

-- 3. Crear vista unificada que combine parks y attractions como tags
CREATE OR REPLACE VIEW unified_tags AS
SELECT 
    p.id,
    p.name,
    'park' as type,
    NULL as parent_id,
    NULL as parent_name,
    p.icon,
    p.color,
    p.name as full_path,
    p.created_at
FROM parks p

UNION ALL

SELECT 
    a.id,
    a.name,
    'attraction' as type,
    a.park_id as parent_id,
    p.name as parent_name,
    CASE 
        WHEN a.type = 'ride' THEN '🎢'
        WHEN a.type = 'show' THEN '🎭'
        WHEN a.type = 'restaurant' THEN '🍽️'
        WHEN a.type = 'shop' THEN '🛍️'
        ELSE '🎯'
    END as icon,
    CASE 
        WHEN a.priority = 'high' THEN 'text-red-600 bg-red-50'
        WHEN a.priority = 'medium' THEN 'text-yellow-600 bg-yellow-50'
        ELSE 'text-green-600 bg-green-50'
    END as color,
    CONCAT(p.name, ' → ', a.name) as full_path,
    a.created_at
FROM attractions a
JOIN parks p ON a.park_id = p.id;

-- 4. Crear función para obtener tags agrupados por parque
CREATE OR REPLACE FUNCTION get_unified_tags_grouped()
RETURNS TABLE (
    park_id UUID,
    park_name TEXT,
    park_icon TEXT,
    park_color TEXT,
    attraction_id UUID,
    attraction_name TEXT,
    attraction_icon TEXT,
    attraction_color TEXT,
    attraction_type TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as park_id,
        p.name as park_name,
        p.icon as park_icon,
        p.color as park_color,
        a.id as attraction_id,
        a.name as attraction_name,
        CASE 
            WHEN a.type = 'ride' THEN '🎢'
            WHEN a.type = 'show' THEN '🎭'
            WHEN a.type = 'restaurant' THEN '🍽️'
            WHEN a.type = 'shop' THEN '🛍️'
            ELSE '🎯'
        END as attraction_icon,
        CASE 
            WHEN a.priority = 'high' THEN 'text-red-600 bg-red-50'
            WHEN a.priority = 'medium' THEN 'text-yellow-600 bg-yellow-50'
            ELSE 'text-green-600 bg-green-50'
        END as attraction_color,
        a.type as attraction_type
    FROM parks p
    LEFT JOIN attractions a ON p.id = a.park_id
    ORDER BY p.name, a.name;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear función para obtener tags de una película
CREATE OR REPLACE FUNCTION get_movie_tags(movie_id_param UUID)
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
    -- Parks tags
    SELECT 
        p.id,
        p.name,
        'park'::TEXT as type,
        NULL::UUID as parent_id,
        NULL::TEXT as parent_name,
        p.icon,
        p.color,
        p.name as full_path
    FROM parks p
    JOIN movie_park_tags mpt ON p.id = mpt.park_id
    WHERE mpt.movie_id = movie_id_param
    
    UNION ALL
    
    -- Attractions tags
    SELECT 
        a.id,
        a.name,
        'attraction'::TEXT as type,
        a.park_id as parent_id,
        pk.name as parent_name,
        CASE 
            WHEN a.type = 'ride' THEN '🎢'
            WHEN a.type = 'show' THEN '🎭'
            WHEN a.type = 'restaurant' THEN '🍽️'
            WHEN a.type = 'shop' THEN '🛍️'
            ELSE '🎯'
        END as icon,
        CASE 
            WHEN a.priority = 'high' THEN 'text-red-600 bg-red-50'
            WHEN a.priority = 'medium' THEN 'text-yellow-600 bg-yellow-50'
            ELSE 'text-green-600 bg-green-50'
        END as color,
        CONCAT(pk.name, ' → ', a.name) as full_path
    FROM attractions a
    JOIN parks pk ON a.park_id = pk.id
    JOIN movie_attraction_tags mat ON a.id = mat.attraction_id
    WHERE mat.movie_id = movie_id_param;
END;
$$ LANGUAGE plpgsql;

-- 6. Crear función para obtener tags de una tarea
CREATE OR REPLACE FUNCTION get_task_tags(task_id_param UUID)
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
    -- Parks tags
    SELECT 
        p.id,
        p.name,
        'park'::TEXT as type,
        NULL::UUID as parent_id,
        NULL::TEXT as parent_name,
        p.icon,
        p.color,
        p.name as full_path
    FROM parks p
    JOIN task_park_tags tpt ON p.id = tpt.park_id
    WHERE tpt.task_id = task_id_param
    
    UNION ALL
    
    -- Attractions tags
    SELECT 
        a.id,
        a.name,
        'attraction'::TEXT as type,
        a.park_id as parent_id,
        pk.name as parent_name,
        CASE 
            WHEN a.type = 'ride' THEN '🎢'
            WHEN a.type = 'show' THEN '🎭'
            WHEN a.type = 'restaurant' THEN '🍽️'
            WHEN a.type = 'shop' THEN '🛍️'
            ELSE '🎯'
        END as icon,
        CASE 
            WHEN a.priority = 'high' THEN 'text-red-600 bg-red-50'
            WHEN a.priority = 'medium' THEN 'text-yellow-600 bg-yellow-50'
            ELSE 'text-green-600 bg-green-50'
        END as color,
        CONCAT(pk.name, ' → ', a.name) as full_path
    FROM attractions a
    JOIN parks pk ON a.park_id = pk.id
    JOIN task_attraction_tags tat ON a.id = tat.attraction_id
    WHERE tat.task_id = task_id_param;
END;
$$ LANGUAGE plpgsql;
