-- ======================
-- 1. TABLES
-- ======================

-- Profiles (mirrors auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Platforms (user marketplace accounts)
CREATE TABLE public.platforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  platform_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, platform_name, account_name)
);

-- Assets (digital assets)
CREATE TABLE public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform_id UUID REFERENCES public.platforms(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  purchase_url TEXT,
  notes TEXT,
  preview_image_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tags (custom and default)
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name)
);

-- Asset Tags (many-to-many)
CREATE TABLE public.asset_tags (
  asset_id UUID NOT NULL REFERENCES public.assets(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (asset_id, tag_id)
);

-- ======================
-- 2. INDEXES
-- ======================

CREATE INDEX idx_platforms_user_id ON public.platforms(user_id);
CREATE INDEX idx_assets_user_id ON public.assets(user_id);
CREATE INDEX idx_assets_platform_id ON public.assets(platform_id);
CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_asset_tags_tag_id ON public.asset_tags(tag_id);

-- ======================
-- 3. ENABLE RLS
-- ======================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_tags ENABLE ROW LEVEL SECURITY;

-- ======================
-- 4. GRANTS (Give authenticated users access)
-- ======================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON public.tags TO anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platforms TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assets TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.asset_tags TO authenticated;

-- ======================
-- 5. RLS POLICIES - PROFILES
-- ======================

CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ======================
-- 6. RLS POLICIES - PLATFORMS
-- ======================

CREATE POLICY "Users can view own platforms"
  ON public.platforms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own platforms"
  ON public.platforms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own platforms"
  ON public.platforms FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own platforms"
  ON public.platforms FOR DELETE
  USING (auth.uid() = user_id);

-- ======================
-- 7. RLS POLICIES - ASSETS
-- ======================

CREATE POLICY "Users can view own assets"
  ON public.assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assets"
  ON public.assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets"
  ON public.assets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON public.assets FOR DELETE
  USING (auth.uid() = user_id);

-- ======================
-- 8. RLS POLICIES - TAGS
-- ======================

CREATE POLICY "Users can view default and own tags"
  ON public.tags FOR SELECT
  USING (is_default = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users can create own tags"
  ON public.tags FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_default = FALSE);

CREATE POLICY "Users can update own tags"
  ON public.tags FOR UPDATE
  USING (auth.uid() = user_id AND is_default = FALSE)
  WITH CHECK (auth.uid() = user_id AND is_default = FALSE);

CREATE POLICY "Users can delete own tags"
  ON public.tags FOR DELETE
  USING (auth.uid() = user_id AND is_default = FALSE);

-- ======================
-- 9. RLS POLICIES - ASSET TAGS
-- ======================

CREATE POLICY "Users can view own asset tags"
  ON public.asset_tags FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.assets
      WHERE assets.id = asset_tags.asset_id
        AND assets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create own asset tags"
  ON public.asset_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assets
      WHERE assets.id = asset_tags.asset_id
        AND assets.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own asset tags"
  ON public.asset_tags FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.assets
      WHERE assets.id = asset_tags.asset_id
        AND assets.user_id = auth.uid()
    )
  );

-- ======================
-- 10. STORAGE
-- ======================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'asset-previews',
  'asset-previews',
  TRUE,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read access for asset previews" ON storage.objects;
CREATE POLICY "Public read access for asset previews"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'asset-previews');

DROP POLICY IF EXISTS "Users can upload own asset previews" ON storage.objects;
CREATE POLICY "Users can upload own asset previews"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'asset-previews'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "Users can update own asset previews" ON storage.objects;
CREATE POLICY "Users can update own asset previews"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'asset-previews'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

DROP POLICY IF EXISTS "Users can delete own asset previews" ON storage.objects;
CREATE POLICY "Users can delete own asset previews"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'asset-previews'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::TEXT
  );

-- ======================
-- 11. TRIGGER FOR AUTO PROFILE CREATION
-- ======================

CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ======================
-- 12. BOOTSTRAP FUNCTION (bypasses RLS)
-- ======================

CREATE OR REPLACE FUNCTION public.ensure_user_profile(p_user_id UUID, p_email TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (p_user_id, p_email)
  ON CONFLICT (id) DO NOTHING;
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ======================
-- 13. SEED DEFAULT TAGS
-- ======================

INSERT INTO public.tags (user_id, name, is_default)
VALUES
  (NULL, '3D Model', TRUE),
  (NULL, '2D', TRUE),
  (NULL, 'Audio', TRUE),
  (NULL, 'UI', TRUE),
  (NULL, 'Texture', TRUE)
ON CONFLICT (user_id, name) DO NOTHING;

-- ======================
-- 14. RPC FUNCTIONS FOR TRANSACTIONAL OPERATIONS
-- ======================

-- Create asset with tags in single transaction
CREATE OR REPLACE FUNCTION public.create_asset_with_tags(
  p_title TEXT,
  p_platform_id UUID,
  p_purchase_url TEXT,
  p_notes TEXT,
  p_preview_image_path TEXT,
  p_tag_ids UUID[]
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  platform_id UUID,
  title TEXT,
  purchase_url TEXT,
  notes TEXT,
  preview_image_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_asset_id UUID;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  INSERT INTO public.assets (user_id, platform_id, title, purchase_url, notes, preview_image_path)
  VALUES (v_user_id, p_platform_id, p_title, p_purchase_url, p_notes, p_preview_image_path)
  RETURNING assets.id INTO v_asset_id;

  IF p_tag_ids IS NOT NULL AND array_length(p_tag_ids, 1) > 0 THEN
    INSERT INTO public.asset_tags (asset_id, tag_id)
    SELECT v_asset_id, tag_id FROM UNNEST(p_tag_ids) AS tag_id;
  END IF;

  RETURN QUERY
  SELECT assets.id, assets.user_id, assets.platform_id, assets.title, assets.purchase_url,
         assets.notes, assets.preview_image_path, assets.created_at, assets.updated_at
  FROM public.assets
  WHERE assets.id = v_asset_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update asset with tags in single transaction
CREATE OR REPLACE FUNCTION public.update_asset_with_tags(
  p_asset_id UUID,
  p_title TEXT,
  p_platform_id UUID,
  p_purchase_url TEXT,
  p_notes TEXT,
  p_preview_image_path TEXT,
  p_tag_ids UUID[]
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  platform_id UUID,
  title TEXT,
  purchase_url TEXT,
  notes TEXT,
  preview_image_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  UPDATE public.assets
  SET
    title = COALESCE(p_title, title),
    platform_id = COALESCE(p_platform_id, platform_id),
    purchase_url = COALESCE(p_purchase_url, purchase_url),
    notes = COALESCE(p_notes, notes),
    preview_image_path = COALESCE(p_preview_image_path, preview_image_path),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = p_asset_id AND user_id = v_user_id;

  IF p_tag_ids IS NOT NULL THEN
    DELETE FROM public.asset_tags WHERE asset_id = p_asset_id;
    IF array_length(p_tag_ids, 1) > 0 THEN
      INSERT INTO public.asset_tags (asset_id, tag_id)
      SELECT p_asset_id, tag_id FROM UNNEST(p_tag_ids) AS tag_id;
    END IF;
  END IF;

  RETURN QUERY
  SELECT assets.id, assets.user_id, assets.platform_id, assets.title, assets.purchase_url,
         assets.notes, assets.preview_image_path, assets.created_at, assets.updated_at
  FROM public.assets
  WHERE assets.id = p_asset_id AND assets.user_id = v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

NOTIFY pgrst, 'reload schema';
