<div align="center">

  # OneLink

  **Secure Link & Content Sharing Platform**
  
  Share text, code, files, and links with a single URL. Built with Next.js 16, TypeScript, and modern web technologies.

  [Report Bug](https://github.com/tejasg99/onelink/issues) · [Request Feature](https://github.com/tejasg99/onelink/issues)

  ![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
  ![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=flat-square&logo=prisma)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Architecture](#️-architecture)
- [Security](#-security)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables-sample)
- [Database Schema](#-database-schema)
- [Deployment](#-deployment)
- [Contributions](#-contributions)
---

## 🎯 Overview

OneLink is a modern, secure platform for sharing content through unique, shareable links. Whether you need to share a quick text note, a code snippet with syntax highlighting, upload a file, or create a link-in-bio page - OneLink handles it all with a clean, minimalist interface.

### Why OneLink?

- **One Link, Multiple Content Types** - Share text, code, files, or link collections
- **Expiring Links** - Set automatic expiration (1 hour, 24 hours, 7 days, or never)
- **Privacy Controls** - Choose between public and unlisted visibility
- **Beautiful UI** - Clean, modern design inspired by Linear and Vercel
- **Dark Mode** - Full dark/light mode support
- **Mobile First** - Responsive design that works on all devices
- **Fast & Secure** - Built with performance and security in mind

---

## ✨ Features

### Content Types

<table>
  <tr>
    <td align="center" width="25%">
      <img src="public/txt-file.png" width="48" height="48" alt="Text" />
      <br /><strong>Text & Notes</strong>
      <br /><sub>Markdown support with live preview</sub>
    </td>
    <td align="center" width="25%">
      <img src="public/code.png" width="48" height="48" alt="Code" />
      <br /><strong>Code Snippets</strong>
      <br /><sub>Syntax highlighting for 25+ languages</sub>
    </td>
    <td align="center" width="25%">
      <img src="public/folder.png" width="48" height="48" alt="File" />
      <br /><strong>File Sharing</strong>
      <br /><sub>Upload files up to 20MB</sub>
    </td>
    <td align="center" width="25%">
      <img src="public/link.png" width="48" height="48" alt="Links" />
      <br /><strong>Link in Bio</strong>
      <br /><sub>Create beautiful profile pages</sub>
    </td>
  </tr>
</table>

### Core Features

| Feature | Description |
|---------|-------------|
| **🔐 Authentication** | Secure Google OAuth authentication via NextAuth.js |
| **📝 Text Sharing** | Share markdown-formatted text with full rendering support |
| **💻 Code Sharing** | Syntax highlighting powered by Shiki for 25+ programming languages |
| **📁 File Sharing** | Direct upload to Supabase Storage with progress tracking |
| **🔗 Link Collections** | Create link-in-bio style pages with multiple links |
| **⏱️ Expiring Links** | Set links to expire after 1 hour, 24 hours, 7 days, or never |
| **👁️ Visibility Control** | Choose between public (discoverable) and unlisted (private) links |
| **📊 View Analytics** | Track view counts for all your shared content |
| **🌐 Public Browse** | Discover public content shared by the community |
| **👤 Profile Pages** | Custom username-based profile URLs (onelink.app/username) |
| **🎨 Theming** | Full dark/light mode support with system preference detection |
| **📱 Responsive** | Mobile-first design that works beautifully on all devices |
| **🗑️ Auto Cleanup** | Automatic deletion of expired links via scheduled cron jobs |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first CSS framework |
| [shadcn/ui](https://ui.shadcn.com/) | Beautifully designed components |
| [React Hook Form](https://react-hook-form.com/) | Performant form handling |
| [Zod](https://zod.dev/) | Schema validation |
| [Shiki](https://shiki.matsu.io/) | Syntax highlighting |
| [next-themes](https://github.com/pacocoursey/next-themes) | Theme management |

### Backend
| Technology | Purpose |
|------------|---------|
| [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction) | Serverless API endpoints |
| [NextAuth.js v5](https://authjs.dev/) | Authentication |
| [Prisma](https://www.prisma.io/) | Type-safe ORM |
| [PostgreSQL](https://www.postgresql.org/) | Relational database |
| [Supabase Storage](https://supabase.com/storage) | File storage with RLS |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| [Vercel](https://vercel.com/) | Hosting & deployment |
| [Supabase](https://supabase.com/) | Database & file storage |
| [Vercel Cron](https://vercel.com/docs/cron-jobs) | Scheduled jobs |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│ Client (Browser)                                                │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                 │
│ │ Next.js     │ │ shadcn/ui   │ │ Tailwind    │                 │
│ │ App Router  │ │ Components  │ │ CSS         │                 │
│ └─────────────┘ └─────────────┘ └─────────────┘                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ Next.js Server                                                  │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐                 │
│ │ Server      │ │ API         │ │ Server      │                 │
│ │ Components  │ │ Routes      │ │ Actions     │                 │
│ └─────────────┘ └─────────────┘ └─────────────┘                 │
│                                                                 │
│ ┌─────────────┐ ┌─────────────┐                                 │
│ │ NextAuth    │ │ Prisma      │                                 │
│ │ Auth        │ │ ORM         │                                 │
│ └─────────────┘ └─────────────┘                                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│ Supabase PostgreSQL     │ │ Supabase Storage        │
│ ┌───────────────────┐   │ │ ┌───────────────────┐   │
│ │ Users, OneLinks   │   │ │ │ File Uploads      │   │
│ │ Content Tables    │   │ │ │ (RLS Enabled)     │   │
│ └───────────────────┘   │ │ └───────────────────┘   │
└─────────────────────────┘ └─────────────────────────┘
```
### Request Flow
```
  User Request
         │
         ▼
  Next.js Middleware (Auth Check)
         │
         ▼
  Server Component / API Route
         │
         ▼
  Server Action (if mutation)
         │
         ▼
  Prisma Query
         │
         ▼
  PostgreSQL Database
         │
         ▼
  Response to Client
```

## 🔒 Security
Implemented Security Measures
| Measure     | Description |
|-------------|-------------|
| Authentication	| Secure OAuth 2.0 via NextAuth.js |
| Authorization	    |  Server-side checks on all mutations |
| RLS	            |  Row Level Security on Supabase Storage |
| Signed URLs	    |  Time-limited URLs for file access |
| Input Validation	|  Zod schemas on all user inputs |
| CSRF Protection	|  Built-in Next.js CSRF protection |
| Cron Auth	        |  Bearer token authentication for cron jobs |
---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.17 or later
- npm, yarn, or pnpm
- PostgreSQL database (or Supabase account)
- Google OAuth credentials

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/onelink.git
cd onelink
```
2. **Install dependencies**
```bash
npm install
```
3. **Set up environment variables**
```bash
cp .env.example .env
```
Fill in your environment variables

4. **Set up the database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```
5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**
Navigate to http://localhost:3000

---
## 🔐 Environment Variables (Sample)

```env
# ===========================================
# Database (Supabase PostgreSQL)
# ===========================================
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# ===========================================
# Authentication (NextAuth.js)
# ===========================================
AUTH_SECRET=""
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""

# ===========================================
# Supabase
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""

# ===========================================
# Cron Jobs
# ===========================================
CRON_SECRET=""
```
### Getting Credentials
Supabase Setup
- Create a new project at supabase.com
- Go to Settings → Database for connection strings
- Go to Settings → API for API keys
- Create a storage bucket named onelink-files
- Set up RLS policies (see Supabase Storage Setup)

Google OAuth Setup
- Go to Google Cloud Console
- Create a new project or select existing
- Navigate to APIs & Services → Credentials
- Create OAuth 2.0 Client ID
- Add authorized redirect URI: http://localhost:3000/api/auth/callback/google
- For production, add: https://yourdomain.com/api/auth/callback/google 

## 📊 Database Schema
Entity Relationship Diagram
```
┌─────────────┐       ┌─────────────────┐
│    User     │       │     OneLink     │
├─────────────┤       ├─────────────────┤
│ id          │──────<│ userId          │
│ email       │       │ id              │
│ name        │       │ slug (unique)   │
│ username    │       │ title           │
│ image       │       │ type (enum)     │
│ createdAt   │       │ visibility      │
└─────────────┘       │ expiresAt       │
                      │ viewCount       │
                      │ createdAt       │
                      └────────┬────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
          ▼                    ▼                    ▼
   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
   │ TextContent │     │ CodeContent │     │ FileContent │
   ├─────────────┤     ├─────────────┤     ├─────────────┤
   │ content     │     │ content     │     │ fileName    │
   │             │     │ language    │     │ fileSize    │
   └─────────────┘     └─────────────┘     │ mimeType    │
                                           │ storageKey  │
                                           └─────────────┘
                               │
                               ▼
                       ┌─────────────┐
                       │   BioLink   │
                       ├─────────────┤
                       │ title       │
                       │ url         │
                       │ icon        │
                       │ order       │
                       └─────────────┘
```

### 🚢 Deployment
1. Push to Github
```bash
git add .
git commit -m "Initial commit"
git push origin main
```
2. Import to vercel
- Go to vercel.com
- Click "New Project"
- Import your GitHub repository

3. Configure environment variables
Add all environment variables from .env to Vercel:
- Go to Project Settings → Environment Variables
- Add each variable for Production, Preview, and Development

4. Update OAuth Redirect URI
```text
https://your-domain.vercel.app/api/auth/callback/google
```

5. Deploy
Vercel will automatically deploy on push to main branch

### Vercel Cron job
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup",
      "schedule": "0 */6 * * *"
    }
  ]
}
```
This runs every 6 hours. Adjust the schedule as needed:
- 0 * * * * - Every hour
- 0 */6 * * * - Every 6 hours
- 0 0 * * * - Daily at midnight

## 🤝 Contributions
Contributions are welcome! Please feel free to submit a Pull Request.
- Fork the repository
- Create your feature branch (git checkout -b feature/amazing-feature)
- Commit your changes (git commit -m 'Add some amazing feature')
- Push to the branch (git push origin feature/amazing-feature)
- Open a Pull Request
---


