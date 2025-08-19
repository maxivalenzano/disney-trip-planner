-- Script SEGURO para jerarquía de 3 niveles: Parque → Land/Area → Atracción
-- Disney Trip Planner - Compatible con Supabase SQL Editor
-- IMPORTANTE: Ejecutar en Supabase SQL Editor (no psql)

-- ========================================
-- CONFIGURACIÓN DE SEGURIDAD
-- ========================================

-- Iniciar transacción para garantizar atomicidad
BEGIN;

-- Función de logging para debug
CREATE OR REPLACE FUNCTION log_migration(message TEXT) RETURNS VOID AS $$
BEGIN
    RAISE NOTICE '[%] %', CURRENT_TIMESTAMP, message;
END;
$$ LANGUAGE plpgsql;

SELECT log_migration('🚀 Iniciando migración a jerarquía de 3 niveles...');

-- ========================================
-- PASO 0: VERIFICACIONES PREVIAS Y BACKUP
-- ========================================

-- Verificar que existen las tablas necesarias
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parks') THEN
        RAISE EXCEPTION 'Tabla parks no existe. Verifica la base de datos.';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'attractions') THEN
        RAISE EXCEPTION 'Tabla attractions no existe. Verifica la base de datos.';
    END IF;
    
    PERFORM log_migration('✅ Verificaciones previas completadas');
END;
$$;

-- Crear tabla de backup de attractions ANTES de modificar
DROP TABLE IF EXISTS attractions_backup_before_migration;
CREATE TABLE attractions_backup_before_migration AS 
SELECT *, CURRENT_TIMESTAMP as backup_date FROM attractions;

SELECT log_migration('✅ Backup de attractions creado en attractions_backup_before_migration');

-- Contar registros antes de migración
DO $$
DECLARE
    park_count INTEGER;
    attraction_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO park_count FROM parks;
    SELECT COUNT(*) INTO attraction_count FROM attractions;
    
    PERFORM log_migration('📊 Estado inicial: ' || park_count || ' parques, ' || attraction_count || ' atracciones');
END;
$$;

-- ========================================
-- PASO 1: CREAR ESTRUCTURA BÁSICA
-- ========================================

SELECT log_migration('🏗️ Creando tabla lands...');

-- 1. Crear tabla de lands/areas (áreas temáticas dentro de cada parque)
CREATE TABLE IF NOT EXISTS lands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    park_id UUID REFERENCES parks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '🏰',
    color TEXT DEFAULT 'from-purple-400 to-pink-500',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(park_id, name) -- Evitar lands duplicadas en el mismo parque
);

-- 2. Agregar columna land_id a attractions temporalmente
ALTER TABLE attractions ADD COLUMN IF NOT EXISTS land_id UUID REFERENCES lands(id) ON DELETE CASCADE;

SELECT log_migration('✅ Estructura básica creada');

-- 3. Crear nuevas tablas de relación para tags que incluyan lands
CREATE TABLE IF NOT EXISTS movie_land_tags (
    movie_id UUID REFERENCES movies(id) ON DELETE CASCADE,
    land_id UUID REFERENCES lands(id) ON DELETE CASCADE,
    PRIMARY KEY (movie_id, land_id)
);

CREATE TABLE IF NOT EXISTS task_land_tags (
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    land_id UUID REFERENCES lands(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, land_id)
);

CREATE TABLE IF NOT EXISTS note_land_tags (
    note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
    land_id UUID REFERENCES lands(id) ON DELETE CASCADE,
    PRIMARY KEY (note_id, land_id)
);

SELECT log_migration('✅ Tablas de relación para tags creadas');

-- ========================================
-- PASO 2: INSERTAR LANDS PARA TODOS LOS PARQUES
-- ========================================

SELECT log_migration('🏰 Insertando lands para todos los parques...');

-- Magic Kingdom Lands
INSERT INTO lands (park_id, name, description, icon, color) VALUES 
((SELECT id FROM parks WHERE name = 'Magic Kingdom'), 'Main Street U.S.A.', 'La entrada principal al parque', '🏪', 'from-red-400 to-orange-500'),
((SELECT id FROM parks WHERE name = 'Magic Kingdom'), 'Fantasyland', 'El mundo de las princesas y cuentos de hadas', '🏰', 'from-pink-400 to-purple-500'),
((SELECT id FROM parks WHERE name = 'Magic Kingdom'), 'Tomorrowland', 'El futuro según Disney', '🚀', 'from-blue-400 to-cyan-500'),
((SELECT id FROM parks WHERE name = 'Magic Kingdom'), 'Frontierland', 'El salvaje oeste americano', '🤠', 'from-orange-400 to-red-500'),
((SELECT id FROM parks WHERE name = 'Magic Kingdom'), 'Adventureland', 'Aventuras exóticas', '🌴', 'from-green-400 to-yellow-500'),
((SELECT id FROM parks WHERE name = 'Magic Kingdom'), 'Liberty Square', 'La historia americana', '🇺🇸', 'from-blue-500 to-red-500'),
((SELECT id FROM parks WHERE name = 'Magic Kingdom'), 'Otras Áreas', 'Atracciones sin área específica', '🎡', 'from-gray-400 to-purple-500')
ON CONFLICT (park_id, name) DO NOTHING;

-- EPCOT Lands
INSERT INTO lands (park_id, name, description, icon, color) VALUES 
((SELECT id FROM parks WHERE name = 'EPCOT'), 'Future World', 'Innovación y tecnología', '🌍', 'from-blue-400 to-purple-500'),
((SELECT id FROM parks WHERE name = 'EPCOT'), 'World Showcase', 'Culturas del mundo', '🌎', 'from-green-400 to-blue-500'),
((SELECT id FROM parks WHERE name = 'EPCOT'), 'Otras Áreas', 'Atracciones sin área específica', '🎡', 'from-gray-400 to-purple-500')
ON CONFLICT (park_id, name) DO NOTHING;

-- Hollywood Studios Lands
INSERT INTO lands (park_id, name, description, icon, color) VALUES 
((SELECT id FROM parks WHERE name = 'Hollywood Studios'), 'Hollywood Boulevard', 'La entrada al mundo del cine', '🎬', 'from-red-400 to-pink-500'),
((SELECT id FROM parks WHERE name = 'Hollywood Studios'), 'Toy Story Land', 'El mundo de los juguetes', '🧸', 'from-yellow-400 to-orange-500'),
((SELECT id FROM parks WHERE name = 'Hollywood Studios'), 'Star Wars: Galaxy''s Edge', 'Una galaxia muy, muy lejana', '⭐', 'from-gray-600 to-blue-600'),
((SELECT id FROM parks WHERE name = 'Hollywood Studios'), 'Animation Courtyard', 'El arte de la animación', '🎨', 'from-purple-400 to-pink-500'),
((SELECT id FROM parks WHERE name = 'Hollywood Studios'), 'Sunset Boulevard', 'El glamour de Hollywood', '🌅', 'from-orange-400 to-red-500'),
((SELECT id FROM parks WHERE name = 'Hollywood Studios'), 'Echo Lake', 'Aventuras cinematográficas', '🎭', 'from-blue-400 to-green-500'),
((SELECT id FROM parks WHERE name = 'Hollywood Studios'), 'Otras Áreas', 'Atracciones sin área específica', '🎡', 'from-gray-400 to-purple-500')
ON CONFLICT (park_id, name) DO NOTHING;

-- Animal Kingdom Lands
INSERT INTO lands (park_id, name, description, icon, color) VALUES 
((SELECT id FROM parks WHERE name = 'Animal Kingdom'), 'Oasis', 'La entrada al reino animal', '🌿', 'from-green-400 to-yellow-500'),
((SELECT id FROM parks WHERE name = 'Animal Kingdom'), 'Discovery Island', 'El corazón del parque', '🦁', 'from-orange-400 to-red-500'),
((SELECT id FROM parks WHERE name = 'Animal Kingdom'), 'Africa', 'Safari y aventuras africanas', '🦒', 'from-yellow-500 to-orange-500'),
((SELECT id FROM parks WHERE name = 'Animal Kingdom'), 'Asia', 'Templos y expediciones asiáticas', '🐅', 'from-red-500 to-purple-500'),
((SELECT id FROM parks WHERE name = 'Animal Kingdom'), 'Pandora', 'El mundo de Avatar', '💙', 'from-blue-500 to-teal-500'),
((SELECT id FROM parks WHERE name = 'Animal Kingdom'), 'DinoLand U.S.A.', 'La era de los dinosaurios', '🦕', 'from-green-500 to-yellow-500'),
((SELECT id FROM parks WHERE name = 'Animal Kingdom'), 'Otras Áreas', 'Atracciones sin área específica', '🎡', 'from-gray-400 to-purple-500')
ON CONFLICT (park_id, name) DO NOTHING;

-- Para cualquier parque adicional que puedas tener
INSERT INTO lands (park_id, name, description, icon, color)
SELECT p.id, 'Área Principal', 'Área principal del parque', '🎢', 'from-purple-400 to-pink-500'
FROM parks p
WHERE NOT EXISTS (SELECT 1 FROM lands l WHERE l.park_id = p.id)
ON CONFLICT (park_id, name) DO NOTHING;

-- Verificar que se crearon lands para todos los parques
DO $$
DECLARE
    parks_without_lands INTEGER;
BEGIN
    SELECT COUNT(*) INTO parks_without_lands 
    FROM parks p 
    WHERE NOT EXISTS (SELECT 1 FROM lands l WHERE l.park_id = p.id);
    
    IF parks_without_lands > 0 THEN
        RAISE EXCEPTION 'Error: % parques no tienen lands asignadas', parks_without_lands;
    END IF;
    
    PERFORM log_migration('✅ Todas las lands creadas correctamente');
END;
$$;

-- ========================================
-- PASO 3: MIGRACIÓN INTELIGENTE DE ATRACCIONES EXISTENTES
-- ========================================

SELECT log_migration('🎢 Iniciando migración de atracciones existentes...');

-- Crear función para migrar atracciones basándose en patrones de nombres conocidos
CREATE OR REPLACE FUNCTION migrate_attractions_to_lands() RETURNS VOID AS $$
DECLARE
    attraction_record RECORD;
    target_land_id UUID;
    migrated_count INTEGER := 0;
BEGIN
    -- Para cada atracción que no tiene land_id asignado
    FOR attraction_record IN 
        SELECT a.*, p.name as park_name 
        FROM attractions a 
        JOIN parks p ON a.park_id = p.id 
        WHERE a.land_id IS NULL
    LOOP
        -- Determinar la land apropiada basándose en el nombre de la atracción y el parque
        
        -- Magic Kingdom
        IF attraction_record.park_name = 'Magic Kingdom' THEN
            CASE 
                WHEN attraction_record.name ILIKE '%space%' OR 
                     attraction_record.name ILIKE '%tomorrow%' OR
                     attraction_record.name ILIKE '%buzz%' OR
                     attraction_record.name ILIKE '%stitch%' THEN
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Tomorrowland' AND park_id = attraction_record.park_id;
                
                WHEN attraction_record.name ILIKE '%small world%' OR 
                     attraction_record.name ILIKE '%dumbo%' OR
                     attraction_record.name ILIKE '%beast%' OR
                     attraction_record.name ILIKE '%mermaid%' OR
                     attraction_record.name ILIKE '%philhar%' OR
                     attraction_record.name ILIKE '%princess%' OR
                     attraction_record.name ILIKE '%teacup%' OR
                     attraction_record.name ILIKE '%mad hatter%' THEN
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Fantasyland' AND park_id = attraction_record.park_id;
                
                WHEN attraction_record.name ILIKE '%pirates%' OR 
                     attraction_record.name ILIKE '%jungle%' OR
                     attraction_record.name ILIKE '%tiki%' OR
                     attraction_record.name ILIKE '%aladdin%' THEN
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Adventureland' AND park_id = attraction_record.park_id;
                
                WHEN attraction_record.name ILIKE '%thunder%' OR 
                     attraction_record.name ILIKE '%splash%' OR
                     attraction_record.name ILIKE '%tom sawyer%' OR
                     attraction_record.name ILIKE '%country%' THEN
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Frontierland' AND park_id = attraction_record.park_id;
                
                WHEN attraction_record.name ILIKE '%haunted%' OR 
                     attraction_record.name ILIKE '%liberty%' OR
                     attraction_record.name ILIKE '%riverboat%' THEN
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Liberty Square' AND park_id = attraction_record.park_id;
                
                WHEN attraction_record.name ILIKE '%main street%' OR 
                     attraction_record.name ILIKE '%railroad%' OR
                     attraction_record.name ILIKE '%confectionery%' THEN
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Main Street U.S.A.' AND park_id = attraction_record.park_id;
                
                ELSE
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Otras Áreas' AND park_id = attraction_record.park_id;
            END CASE;
        
        -- EPCOT
        ELSIF attraction_record.park_name = 'EPCOT' THEN
            CASE 
                WHEN attraction_record.name ILIKE '%spaceship%' OR 
                     attraction_record.name ILIKE '%test track%' OR
                     attraction_record.name ILIKE '%mission%' OR
                     attraction_record.name ILIKE '%nemo%' OR
                     attraction_record.name ILIKE '%imagination%' THEN
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Future World' AND park_id = attraction_record.park_id;
                
                WHEN attraction_record.name ILIKE '%frozen%' OR 
                     attraction_record.name ILIKE '%norway%' OR
                     attraction_record.name ILIKE '%mexico%' OR
                     attraction_record.name ILIKE '%china%' OR
                     attraction_record.name ILIKE '%germany%' OR
                     attraction_record.name ILIKE '%italy%' OR
                     attraction_record.name ILIKE '%america%' OR
                     attraction_record.name ILIKE '%japan%' OR
                     attraction_record.name ILIKE '%morocco%' OR
                     attraction_record.name ILIKE '%france%' OR
                     attraction_record.name ILIKE '%united kingdom%' OR
                     attraction_record.name ILIKE '%canada%' THEN
                    SELECT id INTO target_land_id FROM lands WHERE name = 'World Showcase' AND park_id = attraction_record.park_id;
                
                ELSE
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Otras Áreas' AND park_id = attraction_record.park_id;
            END CASE;
        
        -- Hollywood Studios
        ELSIF attraction_record.park_name = 'Hollywood Studios' THEN
            CASE 
                WHEN attraction_record.name ILIKE '%star wars%' OR 
                     attraction_record.name ILIKE '%millennium falcon%' OR
                     attraction_record.name ILIKE '%rise of%' OR
                     attraction_record.name ILIKE '%galaxy%' OR
                     attraction_record.name ILIKE '%oga%' THEN
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Star Wars: Galaxy''s Edge' AND park_id = attraction_record.park_id;
                
                WHEN attraction_record.name ILIKE '%toy story%' OR 
                     attraction_record.name ILIKE '%slinky%' OR
                     attraction_record.name ILIKE '%alien%' OR
                     attraction_record.name ILIKE '%woody%' OR
                     attraction_record.name ILIKE '%buzz%' THEN
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Toy Story Land' AND park_id = attraction_record.park_id;
                
                WHEN attraction_record.name ILIKE '%twilight%' OR 
                     attraction_record.name ILIKE '%tower%' OR
                     attraction_record.name ILIKE '%rock%' OR
                     attraction_record.name ILIKE '%aerosmith%' THEN
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Sunset Boulevard' AND park_id = attraction_record.park_id;
                
                WHEN attraction_record.name ILIKE '%animation%' OR 
                     attraction_record.name ILIKE '%little mermaid%' OR
                     attraction_record.name ILIKE '%disney junior%' THEN
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Animation Courtyard' AND park_id = attraction_record.park_id;
                
                WHEN attraction_record.name ILIKE '%indiana jones%' OR 
                     attraction_record.name ILIKE '%echo lake%' THEN
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Echo Lake' AND park_id = attraction_record.park_id;
                
                ELSE
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Otras Áreas' AND park_id = attraction_record.park_id;
            END CASE;
        
        -- Animal Kingdom
        ELSIF attraction_record.park_name = 'Animal Kingdom' THEN
            CASE 
                WHEN attraction_record.name ILIKE '%avatar%' OR 
                     attraction_record.name ILIKE '%pandora%' OR
                     attraction_record.name ILIKE '%flight%' OR
                     attraction_record.name ILIKE '%navi%' THEN
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Pandora' AND park_id = attraction_record.park_id;
                
                WHEN attraction_record.name ILIKE '%safari%' OR 
                     attraction_record.name ILIKE '%gorilla%' OR
                     attraction_record.name ILIKE '%africa%' THEN
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Africa' AND park_id = attraction_record.park_id;
                
                WHEN attraction_record.name ILIKE '%everest%' OR 
                     attraction_record.name ILIKE '%kali%' OR
                     attraction_record.name ILIKE '%asia%' OR
                     attraction_record.name ILIKE '%tiger%' THEN
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Asia' AND park_id = attraction_record.park_id;
                
                WHEN attraction_record.name ILIKE '%dinosaur%' OR 
                     attraction_record.name ILIKE '%dinoland%' OR
                     attraction_record.name ILIKE '%primeval%' OR
                     attraction_record.name ILIKE '%triceratop%' THEN
                    SELECT id INTO target_land_id FROM lands WHERE name = 'DinoLand U.S.A.' AND park_id = attraction_record.park_id;
                
                WHEN attraction_record.name ILIKE '%tree of life%' OR 
                     attraction_record.name ILIKE '%it''s tough%' OR
                     attraction_record.name ILIKE '%discovery%' THEN
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Discovery Island' AND park_id = attraction_record.park_id;
                
                ELSE
                    SELECT id INTO target_land_id FROM lands WHERE name = 'Otras Áreas' AND park_id = attraction_record.park_id;
            END CASE;
        
        -- Para cualquier otro parque
        ELSE
            SELECT id INTO target_land_id FROM lands WHERE name = 'Área Principal' AND park_id = attraction_record.park_id;
        END IF;
        
        -- Verificar que se encontró una land válida
        IF target_land_id IS NULL THEN
            RAISE EXCEPTION 'No se pudo encontrar land apropiada para atracción: % en parque: %', 
                attraction_record.name, attraction_record.park_name;
        END IF;
        
        -- Actualizar la atracción con el land_id apropiado
        UPDATE attractions 
        SET land_id = target_land_id 
        WHERE id = attraction_record.id;
        
        migrated_count := migrated_count + 1;
    END LOOP;
    
    PERFORM log_migration('✅ Migradas ' || migrated_count || ' atracciones');
END;
$$ LANGUAGE plpgsql;

-- Ejecutar la migración
SELECT migrate_attractions_to_lands();

-- Limpiar la función temporal
DROP FUNCTION migrate_attractions_to_lands();

-- ========================================
-- PASO 4: VERIFICAR MIGRACIÓN COMPLETA
-- ========================================

SELECT log_migration('🔍 Verificando migración completa...');

-- Verificar que todas las atracciones tengan land_id asignado
DO $$
DECLARE
    unmigrated_count INTEGER;
    total_attractions INTEGER;
    rec RECORD;
BEGIN
    SELECT COUNT(*) INTO unmigrated_count FROM attractions WHERE land_id IS NULL;
    SELECT COUNT(*) INTO total_attractions FROM attractions;
    
    IF unmigrated_count > 0 THEN
        -- Mostrar las atracciones problemáticas
        RAISE NOTICE 'Atracciones no migradas:';
        FOR rec IN 
            SELECT a.name, p.name as park_name 
            FROM attractions a 
            JOIN parks p ON a.park_id = p.id 
            WHERE a.land_id IS NULL 
        LOOP
            RAISE NOTICE '- % (en %)', rec.name, rec.park_name;
        END LOOP;
        
        RAISE EXCEPTION '❌ Error: % de % atracciones no fueron migradas. Abortando transacción.', 
            unmigrated_count, total_attractions;
    ELSE
        PERFORM log_migration('✅ Todas las ' || total_attractions || ' atracciones fueron migradas exitosamente');
    END IF;
END;
$$;

-- ========================================
-- PASO 5: ELIMINAR DEPENDENCIAS ANTIGUAS
-- ========================================

SELECT log_migration('🗑️ Eliminando dependencias antiguas...');

-- Primero eliminar la vista antigua que depende de park_id
DROP VIEW IF EXISTS unified_tags CASCADE;

-- Hacer land_id obligatorio (NOT NULL)
ALTER TABLE attractions ALTER COLUMN land_id SET NOT NULL;

-- Eliminar la columna park_id de attractions (ya no se necesita)
ALTER TABLE attractions DROP COLUMN park_id;

SELECT log_migration('✅ Vista antigua eliminada y columna park_id eliminada de attractions');

-- ========================================
-- PASO 6: ACTUALIZAR SISTEMA DE TAGS
-- ========================================

SELECT log_migration('🏷️ Actualizando sistema de tags...');

-- Recrear vista unificada para incluir lands en la jerarquía
CREATE OR REPLACE VIEW unified_tags AS
-- Parks (nivel 1)
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

-- Lands (nivel 2)
SELECT 
    l.id,
    l.name,
    'land' as type,
    l.park_id as parent_id,
    p.name as parent_name,
    l.icon,
    l.color,
    CONCAT(p.name, ' → ', l.name) as full_path,
    l.created_at
FROM lands l
JOIN parks p ON l.park_id = p.id

UNION ALL

-- Attractions (nivel 3) - Ahora SOLO usando land_id
SELECT 
    a.id,
    a.name,
    'attraction' as type,
    a.land_id as parent_id,
    l.name as parent_name,
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
    CONCAT(p.name, ' → ', l.name, ' → ', a.name) as full_path,
    a.created_at
FROM attractions a
JOIN lands l ON a.land_id = l.id
JOIN parks p ON l.park_id = p.id;

-- Recrear función para obtener tags agrupados con la nueva jerarquía
DROP FUNCTION IF EXISTS get_unified_tags_grouped();
CREATE OR REPLACE FUNCTION get_unified_tags_grouped()
RETURNS TABLE (
    park_id UUID,
    park_name TEXT,
    park_icon TEXT,
    park_color TEXT,
    land_id UUID,
    land_name TEXT,
    land_icon TEXT,
    land_color TEXT,
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
        l.id as land_id,
        l.name as land_name,
        l.icon as land_icon,
        l.color as land_color,
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
    LEFT JOIN lands l ON p.id = l.park_id
    LEFT JOIN attractions a ON l.id = a.land_id
    ORDER BY p.name, l.name, a.name;
END;
$$ LANGUAGE plpgsql;

-- Actualizar funciones para obtener tags de movies, tasks y notes
DROP FUNCTION IF EXISTS get_movie_tags(UUID);
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
        p.id, p.name, 'park'::TEXT, NULL::UUID, NULL::TEXT, p.icon, p.color, p.name
    FROM parks p
    JOIN movie_park_tags mpt ON p.id = mpt.park_id
    WHERE mpt.movie_id = movie_id_param
    
    UNION ALL
    
    -- Lands tags
    SELECT 
        l.id, l.name, 'land'::TEXT, l.park_id, p.name, l.icon, l.color, CONCAT(p.name, ' → ', l.name)
    FROM lands l
    JOIN parks p ON l.park_id = p.id
    JOIN movie_land_tags mlt ON l.id = mlt.land_id
    WHERE mlt.movie_id = movie_id_param
    
    UNION ALL
    
    -- Attractions tags
    SELECT 
        a.id, a.name, 'attraction'::TEXT, a.land_id, l.name,
        CASE WHEN a.type = 'ride' THEN '🎢' WHEN a.type = 'show' THEN '🎭' WHEN a.type = 'restaurant' THEN '🍽️' WHEN a.type = 'shop' THEN '🛍️' ELSE '🎯' END,
        CASE WHEN a.priority = 'high' THEN 'text-red-600 bg-red-50' WHEN a.priority = 'medium' THEN 'text-yellow-600 bg-yellow-50' ELSE 'text-green-600 bg-green-50' END,
        CONCAT(pk.name, ' → ', l.name, ' → ', a.name)
    FROM attractions a
    JOIN lands l ON a.land_id = l.id
    JOIN parks pk ON l.park_id = pk.id
    JOIN movie_attraction_tags mat ON a.id = mat.attraction_id
    WHERE mat.movie_id = movie_id_param;
END;
$$ LANGUAGE plpgsql;

-- Task tags (versión compacta)
DROP FUNCTION IF EXISTS get_task_tags(UUID);
CREATE OR REPLACE FUNCTION get_task_tags(task_id_param UUID)
RETURNS TABLE (id UUID, name TEXT, type TEXT, parent_id UUID, parent_name TEXT, icon TEXT, color TEXT, full_path TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, 'park'::TEXT, NULL::UUID, NULL::TEXT, p.icon, p.color, p.name FROM parks p
    JOIN task_park_tags tpt ON p.id = tpt.park_id WHERE tpt.task_id = task_id_param
    UNION ALL
    SELECT l.id, l.name, 'land'::TEXT, l.park_id, p.name, l.icon, l.color, CONCAT(p.name, ' → ', l.name) FROM lands l
    JOIN parks p ON l.park_id = p.id JOIN task_land_tags tlt ON l.id = tlt.land_id WHERE tlt.task_id = task_id_param
    UNION ALL
    SELECT a.id, a.name, 'attraction'::TEXT, a.land_id, l.name,
    CASE WHEN a.type = 'ride' THEN '🎢' WHEN a.type = 'show' THEN '🎭' WHEN a.type = 'restaurant' THEN '🍽️' WHEN a.type = 'shop' THEN '🛍️' ELSE '🎯' END,
    CASE WHEN a.priority = 'high' THEN 'text-red-600 bg-red-50' WHEN a.priority = 'medium' THEN 'text-yellow-600 bg-yellow-50' ELSE 'text-green-600 bg-green-50' END,
    CONCAT(pk.name, ' → ', l.name, ' → ', a.name) FROM attractions a
    JOIN lands l ON a.land_id = l.id JOIN parks pk ON l.park_id = pk.id JOIN task_attraction_tags tat ON a.id = tat.attraction_id WHERE tat.task_id = task_id_param;
END;
$$ LANGUAGE plpgsql;

-- Note tags (versión compacta)
DROP FUNCTION IF EXISTS get_note_tags(UUID);
CREATE OR REPLACE FUNCTION get_note_tags(note_id_param UUID)
RETURNS TABLE (id UUID, name TEXT, type TEXT, parent_id UUID, parent_name TEXT, icon TEXT, color TEXT, full_path TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT p.id, p.name, 'park'::TEXT, NULL::UUID, NULL::TEXT, p.icon, p.color, p.name FROM parks p
    JOIN note_park_tags npt ON p.id = npt.park_id WHERE npt.note_id = note_id_param
    UNION ALL
    SELECT l.id, l.name, 'land'::TEXT, l.park_id, p.name, l.icon, l.color, CONCAT(p.name, ' → ', l.name) FROM lands l
    JOIN parks p ON l.park_id = p.id JOIN note_land_tags nlt ON l.id = nlt.land_id WHERE nlt.note_id = note_id_param
    UNION ALL
    SELECT a.id, a.name, 'attraction'::TEXT, a.land_id, l.name,
    CASE WHEN a.type = 'ride' THEN '🎢' WHEN a.type = 'show' THEN '🎭' WHEN a.type = 'restaurant' THEN '🍽️' WHEN a.type = 'shop' THEN '🛍️' ELSE '🎯' END,
    CASE WHEN a.priority = 'high' THEN 'text-red-600 bg-red-50' WHEN a.priority = 'medium' THEN 'text-yellow-600 bg-yellow-50' ELSE 'text-green-600 bg-green-50' END,
    CONCAT(pk.name, ' → ', l.name, ' → ', a.name) FROM attractions a
    JOIN lands l ON a.land_id = l.id JOIN parks pk ON l.park_id = pk.id JOIN note_attraction_tags nat ON a.id = nat.attraction_id WHERE nat.note_id = note_id_param;
END;
$$ LANGUAGE plpgsql;

SELECT log_migration('✅ Sistema de tags actualizado');

-- ========================================
-- PASO 7: AGREGAR ATRACCIONES DE EJEMPLO
-- ========================================

SELECT log_migration('🎡 Agregando atracciones de ejemplo...');

-- Agregar atracciones de ejemplo para mostrar la nueva jerarquía
INSERT INTO attractions (land_id, name, type, priority, notes) VALUES 
-- Magic Kingdom - Fantasyland
((SELECT id FROM lands WHERE name = 'Fantasyland' AND park_id = (SELECT id FROM parks WHERE name = 'Magic Kingdom')), 'It''s a Small World', 'ride', 'medium', 'Clásico relajante para toda la familia'),
((SELECT id FROM lands WHERE name = 'Fantasyland' AND park_id = (SELECT id FROM parks WHERE name = 'Magic Kingdom')), 'Be Our Guest Restaurant', 'restaurant', 'high', 'Reserva obligatoria'),
((SELECT id FROM lands WHERE name = 'Fantasyland' AND park_id = (SELECT id FROM parks WHERE name = 'Magic Kingdom')), 'Mickey''s PhilharMagic', 'show', 'medium', 'Show 3D con música de Disney'),

-- Magic Kingdom - Main Street
((SELECT id FROM lands WHERE name = 'Main Street U.S.A.' AND park_id = (SELECT id FROM parks WHERE name = 'Magic Kingdom')), 'Main Street Confectionery', 'shop', 'low', 'Dulces y golosinas'),

-- EPCOT - Future World
((SELECT id FROM lands WHERE name = 'Future World' AND park_id = (SELECT id FROM parks WHERE name = 'EPCOT')), 'Test Track', 'ride', 'high', 'Diseña tu propio auto'),

-- Hollywood Studios - Star Wars
((SELECT id FROM lands WHERE name = 'Star Wars: Galaxy''s Edge' AND park_id = (SELECT id FROM parks WHERE name = 'Hollywood Studios')), 'Rise of the Resistance', 'ride', 'high', 'La atracción más popular, levantarse temprano'),
((SELECT id FROM lands WHERE name = 'Star Wars: Galaxy''s Edge' AND park_id = (SELECT id FROM parks WHERE name = 'Hollywood Studios')), 'Oga''s Cantina', 'restaurant', 'medium', 'Bar temático de Star Wars');

SELECT log_migration('✅ Atracciones de ejemplo agregadas');

-- ========================================
-- PASO 8: REPORTE FINAL Y COMMIT
-- ========================================

-- Mostrar resumen de la migración
DO $$
DECLARE
    total_parks INTEGER;
    total_lands INTEGER;
    total_attractions INTEGER;
    lands_per_park RECORD;
BEGIN
    SELECT COUNT(*) INTO total_parks FROM parks;
    SELECT COUNT(*) INTO total_lands FROM lands;
    SELECT COUNT(*) INTO total_attractions FROM attractions;
    
    PERFORM log_migration('');
    PERFORM log_migration('========================================');
    PERFORM log_migration('🎉 MIGRACIÓN COMPLETA EXITOSA');
    PERFORM log_migration('========================================');
    PERFORM log_migration('Parques: ' || total_parks);
    PERFORM log_migration('Lands/Áreas: ' || total_lands);
    PERFORM log_migration('Atracciones: ' || total_attractions);
    PERFORM log_migration('');
    PERFORM log_migration('Nueva estructura:');
    PERFORM log_migration('Parque → Land/Área → Atracción');
    PERFORM log_migration('');
    
    -- Mostrar distribución por parque
    FOR lands_per_park IN 
        SELECT p.name as park_name, COUNT(DISTINCT l.id) as land_count, COUNT(a.id) as attraction_count
        FROM parks p
        LEFT JOIN lands l ON p.id = l.park_id
        LEFT JOIN attractions a ON l.id = a.land_id
        GROUP BY p.id, p.name
        ORDER BY p.name
    LOOP
        PERFORM log_migration('📍 ' || lands_per_park.park_name || ': ' || 
                           lands_per_park.land_count || ' lands, ' || 
                           lands_per_park.attraction_count || ' atracciones');
    END LOOP;
    
    PERFORM log_migration('');
    PERFORM log_migration('✅ Se eliminó park_id de attractions');
    PERFORM log_migration('✅ Todas las atracciones usan land_id');
    PERFORM log_migration('✅ Sistema de tags actualizado');
    PERFORM log_migration('✅ Funciones SQL actualizadas');
    PERFORM log_migration('✅ Backup creado en attractions_backup_before_migration');
    PERFORM log_migration('');
    PERFORM log_migration('SIGUIENTE PASO:');
    PERFORM log_migration('Actualizar componentes React para usar la nueva jerarquía');
    PERFORM log_migration('========================================');
END;
$$;

-- Limpiar función de logging
DROP FUNCTION log_migration(TEXT);

-- Mensaje final de éxito
DO $$
BEGIN
    RAISE NOTICE '🎉 ¡MIGRACIÓN COMPLETADA EXITOSAMENTE!';
    RAISE NOTICE 'Todas las atracciones ahora usan la jerarquía Parque → Land → Atracción';
    RAISE NOTICE 'El backup está disponible en la tabla: attractions_backup_before_migration';
END;
$$;

-- CONFIRMAR TRANSACCIÓN
COMMIT;
