
-- Add images column to roads table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roads' AND column_name = 'images') THEN
        ALTER TABLE public.roads ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;
