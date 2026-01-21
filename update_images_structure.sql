-- Comprehensive Database Update Script

-- 1. Ensure 'images' column exists
-- If it doesn't exist, this will add it.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roads' AND column_name = 'images') THEN
        ALTER TABLE roads ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
    END IF;
END $$;

-- 2. Migrate existing data (if any) from old string format to new object format
DO $$
DECLARE
    r RECORD;
    old_images JSONB;
    new_images JSONB;
    img_url TEXT;
    i INT;
    elem JSONB;
BEGIN
    -- Only try to migrate if there are rows with data
    FOR r IN SELECT id, images FROM roads WHERE images IS NOT NULL AND jsonb_typeof(images) = 'array' LOOP
        old_images := r.images;
        new_images := '[]'::jsonb;

        IF jsonb_array_length(old_images) > 0 THEN
            FOR i IN 0 .. jsonb_array_length(old_images) - 1 LOOP
                elem := old_images->i;
                -- If element is string (old format), convert it
                IF jsonb_typeof(elem) = 'string' THEN
                    img_url := elem#>>'{}';
                    new_images := new_images || jsonb_build_object(
                        'url', img_url,
                        'addedBy', 'Gecmis Kayit',
                        'date', to_char(now(), 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
                    );
                ELSE
                    -- Keep existing object
                    new_images := new_images || elem;
                END IF;
            END LOOP;

            -- Update if changed
            IF new_images IS DISTINCT FROM old_images THEN
                UPDATE roads SET images = new_images WHERE id = r.id;
            END IF;
        END IF;
    END LOOP;
END $$;
