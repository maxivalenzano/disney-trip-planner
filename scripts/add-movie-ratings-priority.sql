-- Add priority, IMDB score and personal ratings to movies table
-- Run this script in Supabase SQL Editor

-- Add priority column (required field with default 'medium')
ALTER TABLE movies 
ADD COLUMN IF NOT EXISTS priority TEXT NOT NULL DEFAULT 'medium' 
CHECK (priority IN ('high', 'medium', 'low'));

-- Add IMDB score column (optional, from JustWatch API)
ALTER TABLE movies 
ADD COLUMN IF NOT EXISTS imdb_score DECIMAL(3,1) 
CHECK (imdb_score >= 0 AND imdb_score <= 10);

-- Add Jacqui's personal rating (optional, 0-10 scale)
ALTER TABLE movies 
ADD COLUMN IF NOT EXISTS jacqui_rating DECIMAL(3,1) 
CHECK (jacqui_rating >= 0 AND jacqui_rating <= 10);

-- Add Maxi's personal rating (optional, 0-10 scale)
ALTER TABLE movies 
ADD COLUMN IF NOT EXISTS maxi_rating DECIMAL(3,1) 
CHECK (maxi_rating >= 0 AND maxi_rating <= 10);

-- Add comments for documentation
COMMENT ON COLUMN movies.priority IS 'Priority level for watching before Disney trip (high, medium, low)';
COMMENT ON COLUMN movies.imdb_score IS 'IMDB score from JustWatch API (0-10 scale)';
COMMENT ON COLUMN movies.jacqui_rating IS 'Jacqui personal rating after watching (0-10 scale)';
COMMENT ON COLUMN movies.maxi_rating IS 'Maxi personal rating after watching (0-10 scale)';

-- Update existing movies to have medium priority by default
UPDATE movies 
SET priority = 'medium' 
WHERE priority IS NULL;
