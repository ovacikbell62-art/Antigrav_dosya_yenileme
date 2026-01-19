-- ID kolonunun varsayılan değerini düzelt
ALTER TABLE public.roads 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Eğer tablo önceden oluşturulmuşsa ve veri varsa, null ID'li satırları temizle veya güncelle (opsiyonel)
-- DELETE FROM public.roads WHERE id IS NULL; 
-- Bu adım riskli olabilir, o yüzden şimdilik sadece şema düzeltmesi yapıyoruz.

-- Policies (Tekrar emin olmak için)
DROP POLICY IF EXISTS "Herkese açık okuma izni" ON public.roads;
DROP POLICY IF EXISTS "Anonim yazma/güncelleme izni" ON public.roads;

CREATE POLICY "Herkese açık okuma izni" ON public.roads FOR SELECT USING (true);
CREATE POLICY "Anonim yazma/güncelleme izni" ON public.roads FOR ALL USING (true) WITH CHECK (true);
