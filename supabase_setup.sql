-- Tablo zaten varsa hata vermez, yoksa oluşturur
CREATE TABLE IF NOT EXISTS public.roads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL, -- 'OPEN', 'CLOSED', 'WORK'
    coordinates JSONB NOT NULL, -- Harita koordinatları (geoJSON veya array)
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) özelliğini aç
ALTER TABLE public.roads ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle (tekrar çalıştırıldığında hata vermemesi için)
DROP POLICY IF EXISTS "Herkese açık okuma izni" ON public.roads;
DROP POLICY IF EXISTS "Anonim yazma/güncelleme izni" ON public.roads;

-- Okuma izni: Herkes (public) okuyabilir
CREATE POLICY "Herkese açık okuma izni" 
ON public.roads FOR SELECT 
USING (true);

-- Yazma izinleri: Geliştirme aşamasında herkese açık (daha sonra 'authenticated' olarak değiştirilecek)
CREATE POLICY "Anonim yazma/güncelleme izni"
ON public.roads FOR ALL
USING (true)
WITH CHECK (true);
