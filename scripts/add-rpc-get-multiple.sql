-- ========================================
-- FUNCIÓN RPC OPTIMIZADA PARA MÚLTIPLES IDs
-- ========================================
-- Función optimizada para obtener tags de múltiples películas en una sola llamada
CREATE OR REPLACE FUNCTION get_multiple_movie_tags(movie_ids_param UUID []) RETURNS TABLE (
        movie_id UUID,
        id UUID,
        name TEXT,
        type TEXT,
        parent_id UUID,
        parent_name TEXT,
        icon TEXT,
        color TEXT,
        full_path TEXT
    ) AS $$ BEGIN RETURN QUERY -- Parks tags para todas las películas
SELECT mpt.movie_id,
    p.id,
    p.name AS name,
    'park'::TEXT AS type,
    NULL::UUID AS parent_id,
    NULL::TEXT AS parent_name,
    p.icon,
    p.color,
    p.name AS full_path
FROM parks p
    JOIN movie_park_tags mpt ON p.id = mpt.park_id
WHERE mpt.movie_id = ANY(movie_ids_param)
UNION ALL
-- Lands tags para todas las películas
SELECT mlt.movie_id,
    l.id,
    l.name AS name,
    'land'::TEXT AS type,
    l.park_id AS parent_id,
    p.name AS parent_name,
    l.icon,
    l.color,
    CONCAT(p.name, ' → ', l.name) AS full_path
FROM lands l
    JOIN parks p ON l.park_id = p.id
    JOIN movie_land_tags mlt ON l.id = mlt.land_id
WHERE mlt.movie_id = ANY(movie_ids_param)
UNION ALL
-- Attractions tags para todas las películas
SELECT mat.movie_id,
    a.id,
    a.name AS name,
    'attraction'::TEXT AS type,
    a.land_id AS parent_id,
    l.name AS parent_name,
    CASE
        WHEN a.type = 'ride' THEN '🎢'
        WHEN a.type = 'show' THEN '🎭'
        WHEN a.type = 'restaurant' THEN '🍽️'
        WHEN a.type = 'shop' THEN '🛍️'
        ELSE '🎯'
    END AS icon,
    CASE
        WHEN a.priority = 'high' THEN 'text-red-600 bg-red-50'
        WHEN a.priority = 'medium' THEN 'text-yellow-600 bg-yellow-50'
        ELSE 'text-green-600 bg-green-50'
    END AS color,
    CONCAT(pk.name, ' → ', l.name, ' → ', a.name) AS full_path
FROM attractions a
    JOIN lands l ON a.land_id = l.id
    JOIN parks pk ON l.park_id = pk.id
    JOIN movie_attraction_tags mat ON a.id = mat.attraction_id
WHERE mat.movie_id = ANY(movie_ids_param)
ORDER BY 1,
    4,
    3;
END;
$$ LANGUAGE plpgsql;
-- Función similar para tasks
CREATE OR REPLACE FUNCTION get_multiple_task_tags(task_ids_param UUID []) RETURNS TABLE (
        task_id UUID,
        id UUID,
        name TEXT,
        type TEXT,
        parent_id UUID,
        parent_name TEXT,
        icon TEXT,
        color TEXT,
        full_path TEXT
    ) AS $$ BEGIN RETURN QUERY
SELECT tpt.task_id,
    p.id,
    p.name AS name,
    'park'::TEXT AS type,
    NULL::UUID AS parent_id,
    NULL::TEXT AS parent_name,
    p.icon,
    p.color,
    p.name AS full_path
FROM parks p
    JOIN task_park_tags tpt ON p.id = tpt.park_id
WHERE tpt.task_id = ANY(task_ids_param)
UNION ALL
SELECT tlt.task_id,
    l.id,
    l.name AS name,
    'land'::TEXT AS type,
    l.park_id AS parent_id,
    p.name AS parent_name,
    l.icon,
    l.color,
    CONCAT(p.name, ' → ', l.name) AS full_path
FROM lands l
    JOIN parks p ON l.park_id = p.id
    JOIN task_land_tags tlt ON l.id = tlt.land_id
WHERE tlt.task_id = ANY(task_ids_param)
UNION ALL
SELECT tat.task_id,
    a.id,
    a.name AS name,
    'attraction'::TEXT AS type,
    a.land_id AS parent_id,
    l.name AS parent_name,
    CASE
        WHEN a.type = 'ride' THEN '🎢'
        WHEN a.type = 'show' THEN '🎭'
        WHEN a.type = 'restaurant' THEN '🍽️'
        WHEN a.type = 'shop' THEN '🛍️'
        ELSE '🎯'
    END AS icon,
    CASE
        WHEN a.priority = 'high' THEN 'text-red-600 bg-red-50'
        WHEN a.priority = 'medium' THEN 'text-yellow-600 bg-yellow-50'
        ELSE 'text-green-600 bg-green-50'
    END AS color,
    CONCAT(pk.name, ' → ', l.name, ' → ', a.name) AS full_path
FROM attractions a
    JOIN lands l ON a.land_id = l.id
    JOIN parks pk ON l.park_id = pk.id
    JOIN task_attraction_tags tat ON a.id = tat.attraction_id
WHERE tat.task_id = ANY(task_ids_param)
ORDER BY 1,
    4,
    3;
END;
$$ LANGUAGE plpgsql;
-- Función similar para notes
CREATE OR REPLACE FUNCTION get_multiple_note_tags(note_ids_param UUID []) RETURNS TABLE (
        note_id UUID,
        id UUID,
        name TEXT,
        type TEXT,
        parent_id UUID,
        parent_name TEXT,
        icon TEXT,
        color TEXT,
        full_path TEXT
    ) AS $$ BEGIN RETURN QUERY
SELECT npt.note_id,
    p.id,
    p.name AS name,
    'park'::TEXT AS type,
    NULL::UUID AS parent_id,
    NULL::TEXT AS parent_name,
    p.icon,
    p.color,
    p.name AS full_path
FROM parks p
    JOIN note_park_tags npt ON p.id = npt.park_id
WHERE npt.note_id = ANY(note_ids_param)
UNION ALL
SELECT nlt.note_id,
    l.id,
    l.name AS name,
    'land'::TEXT AS type,
    l.park_id AS parent_id,
    p.name AS parent_name,
    l.icon,
    l.color,
    CONCAT(p.name, ' → ', l.name) AS full_path
FROM lands l
    JOIN parks p ON l.park_id = p.id
    JOIN note_land_tags nlt ON l.id = nlt.land_id
WHERE nlt.note_id = ANY(note_ids_param)
UNION ALL
SELECT nat.note_id,
    a.id,
    a.name AS name,
    'attraction'::TEXT AS type,
    a.land_id AS parent_id,
    l.name AS parent_name,
    CASE
        WHEN a.type = 'ride' THEN '🎢'
        WHEN a.type = 'show' THEN '🎭'
        WHEN a.type = 'restaurant' THEN '🍽️'
        WHEN a.type = 'shop' THEN '🛍️'
        ELSE '🎯'
    END AS icon,
    CASE
        WHEN a.priority = 'high' THEN 'text-red-600 bg-red-50'
        WHEN a.priority = 'medium' THEN 'text-yellow-600 bg-yellow-50'
        ELSE 'text-green-600 bg-green-50'
    END AS color,
    CONCAT(pk.name, ' → ', l.name, ' → ', a.name) AS full_path
FROM attractions a
    JOIN lands l ON a.land_id = l.id
    JOIN parks pk ON l.park_id = pk.id
    JOIN note_attraction_tags nat ON a.id = nat.attraction_id
WHERE nat.note_id = ANY(note_ids_param)
ORDER BY 1,
    4,
    3;
END;
$$ LANGUAGE plpgsql;
