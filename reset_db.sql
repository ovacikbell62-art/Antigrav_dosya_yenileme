-- OTAK PLATFORMU - TAM VERİTABANI SIFIRLAMA VE KURULUM SCRİPTİ
-- Bu scripti Supabase SQL editöründe çalıştırdığınızda TÜM VERİLER SİLİNİR ve tablolar sıfırdan oluşturulur.

-- 1. ÖNCEKİ TABLOLARI TEMİZLE (DROP)
DROP TABLE IF EXISTS public.reports;
DROP TABLE IF EXISTS public.landmarks;
DROP TABLE IF EXISTS public.announcements;
DROP TABLE IF EXISTS public.roads;

-- 2. ROADS (YOLLAR) TABLOSUNU OLUŞTUR
CREATE TABLE public.roads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL, -- 'OPEN', 'CLOSED', 'WORK'
    coordinates JSONB NOT NULL, -- Harita koordinatları
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Roads)
ALTER TABLE public.roads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Roads read public" ON public.roads FOR SELECT USING (true);
CREATE POLICY "Roads write all" ON public.roads FOR ALL USING (true) WITH CHECK (true);


-- 3. ANNOUNCEMENTS (DUYURULAR) TABLOSUNU OLUŞTUR
CREATE TABLE public.announcements (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    date TIMESTAMPTZ DEFAULT NOW(),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Announcements)
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Announcements read public" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Announcements write all" ON public.announcements FOR ALL USING (true) WITH CHECK (true);


-- 4. LANDMARKS (ÖNEMLİ YERLER) TABLOSUNU OLUŞTUR
CREATE TABLE public.landmarks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- 'HOSPITAL', 'COURT', 'SCHOOL', 'MILITARY', 'OTHER'
    name TEXT NOT NULL,
    coordinates JSONB NOT NULL, -- { lat: ..., lng: ... }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Landmarks)
ALTER TABLE public.landmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Landmarks read public" ON public.landmarks FOR SELECT USING (true);
CREATE POLICY "Landmarks write all" ON public.landmarks FOR ALL USING (true) WITH CHECK (true);


-- 5. REPORTS (VATANDAŞ BİLDİRİMLERİ) TABLOSUNU OLUŞTUR
CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'NEW',  -- 'NEW', 'READ', 'ARCHIVED'
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Reports)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
-- Herkes bildirim gönderebilir (Insert)
CREATE POLICY "Reports insert public" ON public.reports FOR INSERT WITH CHECK (true);
-- Herkes bildirimleri okuyabilir/yönetebilir (Admin paneli için kolaylık)
CREATE POLICY "Reports read/write public" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Reports update public" ON public.reports FOR UPDATE USING (true);
CREATE POLICY "Reports delete public" ON public.reports FOR DELETE USING (true);
