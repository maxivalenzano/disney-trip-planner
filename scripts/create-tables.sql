-- Crear tablas para la aplicación Disney Trip Planner

-- Tabla de viajes
CREATE TABLE IF NOT EXISTS trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    flight_info TEXT,
    hotel_name TEXT,
    hotel_reservation TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de parques
CREATE TABLE IF NOT EXISTS parks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT DEFAULT 'from-blue-400 to-purple-500',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de atracciones
CREATE TABLE IF NOT EXISTS attractions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    park_id UUID REFERENCES parks(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('ride', 'show', 'restaurant', 'shop')) DEFAULT 'ride',
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de películas
CREATE TABLE IF NOT EXISTS movies (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    year INTEGER,
    watched BOOLEAN DEFAULT FALSE,
    disney_plus_link TEXT,
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tareas
CREATE TABLE IF NOT EXISTS tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de notas
CREATE TABLE IF NOT EXISTS notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    color TEXT DEFAULT 'bg-purple-100 border-purple-300',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de etiquetas (tags)
CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    type TEXT CHECK (type IN ('park', 'attraction', 'general')) DEFAULT 'general',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

-- Insertar datos de ejemplo
INSERT INTO parks (name, icon, color) VALUES 
('Magic Kingdom', '🏰', 'from-blue-400 to-purple-500'),
('EPCOT', '🌍', 'from-green-400 to-blue-500'),
('Hollywood Studios', '🎬', 'from-red-400 to-pink-500'),
('Animal Kingdom', '🦁', 'from-green-500 to-yellow-500');

INSERT INTO attractions (park_id, name, type, priority, notes) VALUES 
((SELECT id FROM parks WHERE name = 'Magic Kingdom'), 'Space Mountain', 'ride', 'high', '¡Imprescindible! FastPass recomendado'),
((SELECT id FROM parks WHERE name = 'Magic Kingdom'), 'Pirates of the Caribbean', 'ride', 'high', 'Clásico de Disney'),
((SELECT id FROM parks WHERE name = 'EPCOT'), 'Spaceship Earth', 'ride', 'medium', 'Icónico de EPCOT'),
((SELECT id FROM parks WHERE name = 'EPCOT'), 'Frozen Ever After', 'ride', 'high', 'Muy popular, llegar temprano');

INSERT INTO movies (title, year, watched, notes, rating) VALUES 
('Encanto', 2021, true, '¡Increíble! Las canciones son pegadizas', 5),
('Frozen', 2013, false, 'Preparación para Frozen Ever After en EPCOT', null),
('Pirates of the Caribbean', 2003, true, 'Clásico para preparar la atracción', 4);

INSERT INTO tasks (title, description, due_date, completed, priority) VALUES 
('Reservar FastPass+', 'Reservar FastPass para las atracciones principales 30 días antes', '2024-05-15', true, 'high'),
('Comprar souvenirs online', 'Revisar la tienda online de Disney para comprar souvenirs con anticipación', '2024-06-01', false, 'medium'),
('Descargar app My Disney Experience', 'Descargar y configurar la aplicación oficial de Disney World', '2024-05-20', false, 'high');

INSERT INTO notes (title, content, color) VALUES 
('Ideas para fotos', '- Foto frente al castillo al atardecer
- Selfie con Mickey en Main Street
- Foto romántica en el puente de Fantasyland', 'bg-pink-100 border-pink-300'),
('Restaurantes que queremos probar', '- Be Our Guest (Magic Kingdom)
- Monsieur Paul (EPCOT)
- California Grill (Contemporary Resort)', 'bg-yellow-100 border-yellow-300');
