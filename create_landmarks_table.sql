-- Önemli Yerler (Landmarks) tablosu
CREATE TABLE IF NOT EXISTS public.landmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- 'HOSPITAL', 'COURT', 'SCHOOL', 'MILITARY', 'OTHER'
    name TEXT NOT NULL,
    coordinates JSONB NOT NULL, -- { lat: ..., lng: ... }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.landmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Landmarks read public" ON public.landmarks;
DROP POLICY IF EXISTS "Landmarks write all" ON public.landmarks;

CREATE POLICY "Landmarks read public" ON public.landmarks FOR SELECT USING (true);
CREATE POLICY "Landmarks write all" ON public.landmarks FOR ALL USING (true) WITH CHECK (true);
