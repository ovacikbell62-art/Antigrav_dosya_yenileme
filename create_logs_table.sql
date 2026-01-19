-- LOGS TABLOSU OLUŞTURMA
-- Kullanıcı girişlerini ve işlemlerini takip etmek için

CREATE TABLE IF NOT EXISTS public.logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,          -- Kullanıcı adı veya ID'si (örn: 'admin')
    action TEXT NOT NULL,           -- İşlem türü: 'LOGIN', 'LOGOUT', 'UPDATE_ROAD' vb.
    details JSONB DEFAULT '{}',     -- Ek detaylar (örn: hangi yol güncellendi)
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;

-- Politikalar
-- 1. Ekleme: Herkes log ekleyebilir (Giriş yapan herkes)
CREATE POLICY "Logs insert public" ON public.logs FOR INSERT WITH CHECK (true);

-- 2. Okuma: Sadece yetkili kişiler okuyabilir (Şimdilik geliştirme için herkese açık yapıyoruz, AuthContext'te kontrol edeceğiz)
CREATE POLICY "Logs read public" ON public.logs FOR SELECT USING (true);
