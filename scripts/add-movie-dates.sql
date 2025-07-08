-- Agregar campo de fecha a las películas para mostrarlas en el calendario

ALTER TABLE movies 
ADD COLUMN IF NOT EXISTS watch_date DATE;

-- Agregar índice para mejor performance en consultas por fecha
CREATE INDEX IF NOT EXISTS idx_movies_watch_date ON movies(watch_date);

-- Actualizar algunas películas de ejemplo con fechas
UPDATE movies 
SET watch_date = '2024-05-20' 
WHERE title = 'Encanto';

UPDATE movies 
SET watch_date = '2024-05-25' 
WHERE title = 'Frozen';
