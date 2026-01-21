-- Add camera_position column to roads table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roads' AND column_name = 'camera_position') THEN
        ALTER TABLE roads ADD COLUMN camera_position TEXT DEFAULT 'CENTER';
    END IF;
END $$;
