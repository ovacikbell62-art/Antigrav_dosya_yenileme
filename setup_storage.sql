-- Enable the storage extension if not already enabled (usually enabled by default in Supabase)
-- CREATE EXTENSION IF NOT EXISTS "storage";

-- Create a private bucket for road images (we will expose files via public policies)
-- Note: 'public' buckets are also an option, but explicit policies give more control. 
-- For simplicity in this app, we can make it a specific public bucket or just use RLS.
-- Let's check if bucket exists, if not create it.
insert into storage.buckets (id, name, public)
values ('road_images', 'road_images', true)
on conflict (id) do nothing;

-- Policy: Allow public read access to all files in 'road_images' bucket
create policy "Road Images are publicly accessible"
  on storage.objects for select
  using ( bucket_id = 'road_images' );

-- Policy: Allow authenticated users (or anon if we are using anon key for everything) to upload
-- For this app, we are currently using anon key for most things or simple auth.
-- Allowing 'anon' to upload for now since this is an internal tool usage pattern or controlled app.
create policy "Anyone can upload road images"
  on storage.objects for insert
  with check ( bucket_id = 'road_images' );

-- Policy: Allow deletion (optional, if we want to allow users to delete photos)
create policy "Anyone can delete road images"
  on storage.objects for delete
  using ( bucket_id = 'road_images' );
