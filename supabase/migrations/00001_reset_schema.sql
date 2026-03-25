-- ======================
-- RESET: Drop all tables and functions
-- ======================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

DROP TABLE IF EXISTS public.asset_tags CASCADE;
DROP TABLE IF EXISTS public.assets CASCADE;
DROP TABLE IF EXISTS public.platforms CASCADE;
DROP TABLE IF EXISTS public.tags CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP POLICY IF EXISTS "Users can view own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own platforms" ON public.platforms;
DROP POLICY IF EXISTS "Users can create own platforms" ON public.platforms;
DROP POLICY IF EXISTS "Users can update own platforms" ON public.platforms;
DROP POLICY IF EXISTS "Users can delete own platforms" ON public.platforms;

DROP POLICY IF EXISTS "Users can view own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can create own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can update own assets" ON public.assets;
DROP POLICY IF EXISTS "Users can delete own assets" ON public.assets;

DROP POLICY IF EXISTS "Users can view default and own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can create own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can update own tags" ON public.tags;
DROP POLICY IF EXISTS "Users can delete own tags" ON public.tags;

DROP POLICY IF EXISTS "Users can view own asset tags" ON public.asset_tags;
DROP POLICY IF EXISTS "Users can create own asset tags" ON public.asset_tags;
DROP POLICY IF EXISTS "Users can delete own asset tags" ON public.asset_tags;

DROP POLICY IF EXISTS "Public read access for asset previews" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own asset previews" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own asset previews" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own asset previews" ON storage.objects;

DELETE FROM storage.buckets WHERE id = 'asset-previews';

NOTIFY pgrst, 'reload schema';
