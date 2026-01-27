# Row Level Security (RLS) Documentation

## Overview

OneLink uses Row Level Security (RLS) at the PostgreSQL level to provide defense-in-depth security. This ensures that even if application-level security is bypassed, the database will still enforce access controls.

## Architecture

### Roles

| Role | Description | RLS Behavior |
|------|-------------|--------------|
| `service_role` | Server-side operations (Prisma) | Bypasses RLS |
| `authenticated` | Logged-in users via Supabase | Subject to RLS |
| `anon` | Anonymous users | Subject to RLS |

### Policy Structure

Each table has policies for:
- **Service role**: Full access (USING true)
- **Authenticated users**: Access to own data
- **Anonymous users**: Access to public data

## Tables & Policies

### users
- Service role: Full access
- Users: Read/update/delete own profile
- Anonymous: Read public profiles (with username)

### accounts
- Service role: Full access
- Users: Read/delete own OAuth accounts
- Anonymous: No access

### sessions
- Service role: Full access
- Users: Read/delete own sessions
- Anonymous: No access

### onelinks
- Service role: Full access
- Users: CRUD own links
- Anyone: Read public/unlisted non-expired links

### Content Tables (text_contents, code_contents, file_contents, bio_links)
- Service role: Full access
- Users: CRUD content for own onelinks
- Anyone: Read content for accessible onelinks

## Commands

```bash
# Set up RLS policies
npm run db:setup-rls

# Check RLS status
curl http://localhost:3000/api/admin/rls-status

# Reset policies (development only)
psql $DATABASE_URL -f prisma/drop-rls-policies.sql
```
## Testing RLS
```sql
-- Test as Anonymous User
SET ROLE anon;

-- Should only see public, non-expired links
SELECT * FROM onelinks;

-- Reset role
RESET ROLE;

-- Test as Authenticated User
SET ROLE authenticated;
SET app.current_user_id = 'user-id-here';

-- Should see own links
SELECT * FROM onelinks;

RESET ROLE;
RESET app.current_user_id;
```

## Verification
```bash
# Check RLS status (development)
curl http://localhost:3000/api/admin/rls-status

# Check RLS status (production)
curl -H "Authorization: Bearer YOUR_ADMIN_SECRET" \
  https://your-domain.com/api/admin/rls-status
```
