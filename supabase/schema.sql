-- ==============================================================================
-- ClassHub — Skema Database Supabase PostgreSQL
-- Tabel: class_store (Pusat Penyimpanan Realtime Cloud Portal Kelas XI PPLG)
-- ==============================================================================

-- 1. Buat tabel utama jika belum ada
CREATE TABLE IF NOT EXISTS public.class_store (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Komentar dokumentasi
COMMENT ON TABLE public.class_store IS 'Data store sinkronisasi realtime untuk ClassHub XI PPLG';

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.class_store ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Keamanan RLS untuk akses Anon (Siswa & Pengurus Kelas)
-- Siswa membaca data terkini
DROP POLICY IF EXISTS "Allow public read access on class_store" ON public.class_store;
CREATE POLICY "Allow public read access on class_store"
ON public.class_store
FOR SELECT
TO anon, authenticated
USING (true);

-- Siswa mencentang tugas & Admin memperbarui jadwal/kas
DROP POLICY IF EXISTS "Allow public insert access on class_store" ON public.class_store;
CREATE POLICY "Allow public insert access on class_store"
ON public.class_store
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access on class_store" ON public.class_store;
CREATE POLICY "Allow public update access on class_store"
ON public.class_store
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. Aktifkan Realtime WebSocket untuk sinkronisasi instan
ALTER TABLE public.class_store REPLICA IDENTITY FULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'class_store'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.class_store;
    END IF;
END $$;
