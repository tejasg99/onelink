-- =============================================================================
-- OneLink Database RLS Policies
-- =============================================================================
-- This script enables Row Level Security on all tables and creates appropriate
-- policies for secure data access.
--
-- Run this in Supabase SQL Editor after running Prisma migrations.
-- =============================================================================

-- =============================================================================
-- HELPER FUNCTION: Get current user ID
-- =============================================================================
-- Created this in the public schema since the auth schema can't be accessed directly
-- This function will be used by RLS policies to check user ownership

CREATE OR REPLACE FUNCTION public.current_user_id() 
RETURNS TEXT 
LANGUAGE SQL 
STABLE
AS $$
  SELECT COALESCE(
    nullif(current_setting('request.jwt.claims', true), '')::json->>'sub',
    nullif(current_setting('app.current_user_id', true), '')
  )
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.current_user_id() TO anon, authenticated, service_role;

-- =============================================================================
-- USERS TABLE
-- =============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (for idempotency)
DROP POLICY IF EXISTS "Service role has full access to users" ON users;
DROP POLICY IF EXISTS "Users can read own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can delete own account" ON users;
DROP POLICY IF EXISTS "Anyone can read public user profiles" ON users;

-- Service role has full access
CREATE POLICY "Service role has full access to users"
ON users FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON users FOR SELECT
TO authenticated
USING (id = public.current_user_id());

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
TO authenticated
USING (id = public.current_user_id())
WITH CHECK (id = public.current_user_id());

-- Users can delete their own account
CREATE POLICY "Users can delete own account"
ON users FOR DELETE
TO authenticated
USING (id = public.current_user_id());

-- Public profiles (for username lookup)
CREATE POLICY "Anyone can read public user profiles"
ON users FOR SELECT
TO anon, authenticated
USING (username IS NOT NULL);

-- =============================================================================
-- ACCOUNTS TABLE (OAuth providers)
-- =============================================================================

ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role has full access to accounts" ON accounts;
DROP POLICY IF EXISTS "Users can read own accounts" ON accounts;
DROP POLICY IF EXISTS "Users can delete own accounts" ON accounts;

-- Service role has full access
CREATE POLICY "Service role has full access to accounts"
ON accounts FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can read their own OAuth accounts
CREATE POLICY "Users can read own accounts"
ON accounts FOR SELECT
TO authenticated
USING ("userId" = public.current_user_id());

-- Users can delete their own OAuth accounts
CREATE POLICY "Users can delete own accounts"
ON accounts FOR DELETE
TO authenticated
USING ("userId" = public.current_user_id());

-- =============================================================================
-- SESSIONS TABLE
-- =============================================================================

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role has full access to sessions" ON sessions;
DROP POLICY IF EXISTS "Users can read own sessions" ON sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON sessions;

-- Service role has full access
CREATE POLICY "Service role has full access to sessions"
ON sessions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can read their own sessions
CREATE POLICY "Users can read own sessions"
ON sessions FOR SELECT
TO authenticated
USING ("userId" = public.current_user_id());

-- Users can delete their own sessions (logout)
CREATE POLICY "Users can delete own sessions"
ON sessions FOR DELETE
TO authenticated
USING ("userId" = public.current_user_id());

-- =============================================================================
-- VERIFICATION TOKENS TABLE
-- =============================================================================

ALTER TABLE verification_tokens ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role has full access to verification_tokens" ON verification_tokens;

-- Service role has full access (managed by NextAuth)
CREATE POLICY "Service role has full access to verification_tokens"
ON verification_tokens FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- =============================================================================
-- ONELINKS TABLE
-- =============================================================================

ALTER TABLE onelinks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role has full access to onelinks" ON onelinks;
DROP POLICY IF EXISTS "Users can create own onelinks" ON onelinks;
DROP POLICY IF EXISTS "Users can read own onelinks" ON onelinks;
DROP POLICY IF EXISTS "Anyone can read public onelinks" ON onelinks;
DROP POLICY IF EXISTS "Anyone can read unlisted onelinks by slug" ON onelinks;
DROP POLICY IF EXISTS "Users can update own onelinks" ON onelinks;
DROP POLICY IF EXISTS "Users can delete own onelinks" ON onelinks;

-- Service role has full access
CREATE POLICY "Service role has full access to onelinks"
ON onelinks FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can create their own links
CREATE POLICY "Users can create own onelinks"
ON onelinks FOR INSERT
TO authenticated
WITH CHECK ("userId" = public.current_user_id());

-- Users can read their own links (regardless of visibility)
CREATE POLICY "Users can read own onelinks"
ON onelinks FOR SELECT
TO authenticated
USING ("userId" = public.current_user_id());

-- Anyone can read public, non-expired links
CREATE POLICY "Anyone can read public onelinks"
ON onelinks FOR SELECT
TO anon, authenticated
USING (
  visibility = 'PUBLIC' 
  AND (
    "expiresAt" IS NULL 
    OR "expiresAt" > NOW()
  )
);

-- Anyone can read unlisted links (they have the link URL)
CREATE POLICY "Anyone can read unlisted onelinks by slug"
ON onelinks FOR SELECT
TO anon, authenticated
USING (
  visibility = 'UNLISTED'
  AND (
    "expiresAt" IS NULL 
    OR "expiresAt" > NOW()
  )
);

-- Users can update their own links
CREATE POLICY "Users can update own onelinks"
ON onelinks FOR UPDATE
TO authenticated
USING ("userId" = public.current_user_id())
WITH CHECK ("userId" = public.current_user_id());

-- Users can delete their own links
CREATE POLICY "Users can delete own onelinks"
ON onelinks FOR DELETE
TO authenticated
USING ("userId" = public.current_user_id());

-- =============================================================================
-- TEXT_CONTENTS TABLE
-- =============================================================================

ALTER TABLE text_contents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role has full access to text_contents" ON text_contents;
DROP POLICY IF EXISTS "Users can create text_contents for own onelinks" ON text_contents;
DROP POLICY IF EXISTS "Users can read own text_contents" ON text_contents;
DROP POLICY IF EXISTS "Anyone can read text_contents for accessible onelinks" ON text_contents;
DROP POLICY IF EXISTS "Users can update own text_contents" ON text_contents;
DROP POLICY IF EXISTS "Users can delete own text_contents" ON text_contents;

-- Service role has full access
CREATE POLICY "Service role has full access to text_contents"
ON text_contents FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can create text content for their own links
CREATE POLICY "Users can create text_contents for own onelinks"
ON text_contents FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = text_contents."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
);

-- Users can read text content for their own links
CREATE POLICY "Users can read own text_contents"
ON text_contents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = text_contents."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
);

-- Anyone can read text content for accessible links
CREATE POLICY "Anyone can read text_contents for accessible onelinks"
ON text_contents FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = text_contents."onelinkId"
    AND (
      "expiresAt" IS NULL 
      OR "expiresAt" > NOW()
    )
  )
);

-- Users can update text content for their own links
CREATE POLICY "Users can update own text_contents"
ON text_contents FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = text_contents."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = text_contents."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
);

-- Users can delete text content for their own links
CREATE POLICY "Users can delete own text_contents"
ON text_contents FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = text_contents."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
);

-- =============================================================================
-- CODE_CONTENTS TABLE
-- =============================================================================

ALTER TABLE code_contents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role has full access to code_contents" ON code_contents;
DROP POLICY IF EXISTS "Users can create code_contents for own onelinks" ON code_contents;
DROP POLICY IF EXISTS "Users can read own code_contents" ON code_contents;
DROP POLICY IF EXISTS "Anyone can read code_contents for accessible onelinks" ON code_contents;
DROP POLICY IF EXISTS "Users can update own code_contents" ON code_contents;
DROP POLICY IF EXISTS "Users can delete own code_contents" ON code_contents;

-- Service role has full access
CREATE POLICY "Service role has full access to code_contents"
ON code_contents FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can create code content for their own links
CREATE POLICY "Users can create code_contents for own onelinks"
ON code_contents FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = code_contents."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
);

-- Users can read code content for their own links
CREATE POLICY "Users can read own code_contents"
ON code_contents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = code_contents."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
);

-- Anyone can read code content for accessible links
CREATE POLICY "Anyone can read code_contents for accessible onelinks"
ON code_contents FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = code_contents."onelinkId"
    AND (
      "expiresAt" IS NULL 
      OR "expiresAt" > NOW()
    )
  )
);

-- Users can update code content for their own links
CREATE POLICY "Users can update own code_contents"
ON code_contents FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = code_contents."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = code_contents."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
);

-- Users can delete code content for their own links
CREATE POLICY "Users can delete own code_contents"
ON code_contents FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = code_contents."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
);

-- =============================================================================
-- FILE_CONTENTS TABLE
-- =============================================================================

ALTER TABLE file_contents ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role has full access to file_contents" ON file_contents;
DROP POLICY IF EXISTS "Users can create file_contents for own onelinks" ON file_contents;
DROP POLICY IF EXISTS "Users can read own file_contents" ON file_contents;
DROP POLICY IF EXISTS "Anyone can read file_contents for accessible onelinks" ON file_contents;
DROP POLICY IF EXISTS "Users can update own file_contents" ON file_contents;
DROP POLICY IF EXISTS "Users can delete own file_contents" ON file_contents;

-- Service role has full access
CREATE POLICY "Service role has full access to file_contents"
ON file_contents FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can create file content for their own links
CREATE POLICY "Users can create file_contents for own onelinks"
ON file_contents FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = file_contents."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
);

-- Users can read file content for their own links
CREATE POLICY "Users can read own file_contents"
ON file_contents FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = file_contents."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
);

-- Anyone can read file content metadata for accessible links
CREATE POLICY "Anyone can read file_contents for accessible onelinks"
ON file_contents FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = file_contents."onelinkId"
    AND (
      "expiresAt" IS NULL 
      OR "expiresAt" > NOW()
    )
  )
);

-- Users can update file content for their own links
CREATE POLICY "Users can update own file_contents"
ON file_contents FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = file_contents."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = file_contents."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
);

-- Users can delete file content for their own links
CREATE POLICY "Users can delete own file_contents"
ON file_contents FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = file_contents."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
);

-- =============================================================================
-- BIO_LINKS TABLE
-- =============================================================================

ALTER TABLE bio_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Service role has full access to bio_links" ON bio_links;
DROP POLICY IF EXISTS "Users can create bio_links for own onelinks" ON bio_links;
DROP POLICY IF EXISTS "Users can read own bio_links" ON bio_links;
DROP POLICY IF EXISTS "Anyone can read bio_links for accessible onelinks" ON bio_links;
DROP POLICY IF EXISTS "Users can update own bio_links" ON bio_links;
DROP POLICY IF EXISTS "Users can delete own bio_links" ON bio_links;

-- Service role has full access
CREATE POLICY "Service role has full access to bio_links"
ON bio_links FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Users can create bio links for their own onelinks
CREATE POLICY "Users can create bio_links for own onelinks"
ON bio_links FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = bio_links."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
);

-- Users can read bio links for their own onelinks
CREATE POLICY "Users can read own bio_links"
ON bio_links FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = bio_links."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
);

-- Anyone can read bio links for accessible onelinks
CREATE POLICY "Anyone can read bio_links for accessible onelinks"
ON bio_links FOR SELECT
TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = bio_links."onelinkId"
    AND (
      "expiresAt" IS NULL 
      OR "expiresAt" > NOW()
    )
  )
);

-- Users can update bio links for their own onelinks
CREATE POLICY "Users can update own bio_links"
ON bio_links FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = bio_links."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = bio_links."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
);

-- Users can delete bio links for their own onelinks
CREATE POLICY "Users can delete own bio_links"
ON bio_links FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM onelinks 
    WHERE onelinks.id = bio_links."onelinkId" 
    AND onelinks."userId" = public.current_user_id()
  )
);

-- =============================================================================
-- GRANT NECESSARY PERMISSIONS
-- =============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant sequence permissions (for auto-increment/serial columns)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    table_record RECORD;
    rls_enabled BOOLEAN;
BEGIN
    RAISE NOTICE '=== RLS Status ===';
    FOR table_record IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename IN ('users', 'accounts', 'sessions', 'verification_tokens', 
                          'onelinks', 'text_contents', 'code_contents', 
                          'file_contents', 'bio_links')
        ORDER BY tablename
    LOOP
        SELECT relrowsecurity INTO rls_enabled
        FROM pg_class
        WHERE relname = table_record.tablename;
        
        RAISE NOTICE 'Table: %, RLS Enabled: %', table_record.tablename, rls_enabled;
    END LOOP;
END $$;

-- Show policy count
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;