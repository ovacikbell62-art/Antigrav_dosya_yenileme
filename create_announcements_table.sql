-- Duyurular tablosunu oluştur
CREATE TABLE IF NOT EXISTS public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security) Aç
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Politikaları tanımla (Roads tablosu ile aynı mantıkta)
DROP POLICY IF EXISTS "Duyuruları herkes okuyabilir" ON public.announcements;
DROP POLICY IF EXISTS "Duyuruları herkes yönetebilir" ON public.announcements;

CREATE POLICY "Duyuruları herkes okuyabilir" 
ON public.announcements FOR SELECT 
USING (true);

-- Geliştirme aşamasında yazma izni açık (Admin auth eklendiğinde bu güncellenebilir)
CREATE POLICY "Duyuruları herkes yönetebilir"
ON public.announcements FOR ALL
USING (true)
WITH CHECK (true);
