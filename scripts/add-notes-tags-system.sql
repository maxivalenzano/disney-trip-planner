-- Agregar sistema de tags para notas en el nuevo sistema refactorizado

-- Crear tablas de relación para notas con parques y atracciones
CREATE TABLE IF NOT EXISTS note_park_tags (
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    park_id UUID REFERENCES parks(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, park_id)
);

CREATE TABLE IF NOT EXISTS note_attraction_tags (
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    attraction_id UUID REFERENCES attractions(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, attraction_id)
);

-- Crear función para obtener tags de una nota
CREATE OR REPLACE FUNCTION get_note_tags(note_id_param UUID)
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
    JOIN note_park_tags npt ON p.id = npt.park_id
    WHERE npt.note_id = note_id_param
    
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
    JOIN note_attraction_tags nat ON a.id = nat.attraction_id
    WHERE nat.note_id = note_id_param;
END;
$$ LANGUAGE plpgsql;
