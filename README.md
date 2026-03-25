# AssetVault

A modern web application for organizing and managing your digital assets from multiple marketplaces (Unity Asset Store, Unreal Marketplace, etc.) in one centralized hub.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue?logo=typescript)

---

## Features

- 📦 **Multi-platform support** — track assets from Unity Asset Store, Unreal Marketplace, and more
- 🔑 **Secure authentication** — email-based signup and login via Supabase
- 🏷️ **Smart tagging** — organize assets with custom or system-default tags
- 🌍 **Multi-language** — available in English, Turkish, Spanish, and German
- 🖼️ **Preview uploads** — attach preview images (JPEG, PNG, WebP, GIF) to your assets
- ⚡ **Real-time database** — powered by Postgres via Supabase
- 🎨 **Responsive design** — works seamlessly on desktop and mobile

---

## Tech Stack

| Layer      | Technology                                      |
|------------|------------------------------------------------|
| **Frontend** | Next.js 15 (App Router), React 19, Tailwind CSS v4 |
| **Language** | TypeScript                                      |
| **Auth & DB** | Supabase (PostgreSQL, Auth, File Storage)     |
| **i18n**     | next-intl (EN, TR, ES, DE)                     |
| **Validation** | Zod                                           |
| **UI Icons** | Lucide React                                    |

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/assetvault.git
cd assetvault
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Initialize the database

1. Go to your Supabase SQL editor
2. Run the migration from `supabase/migrations/00001_initial_schema.sql`
3. If you see schema cache errors, run:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Create production build
npm run lint     # Run ESLint
npm start        # Start production server
```

---

## Project Structure

```
src/
├── app/                      # Next.js App Router
│   ├── [locale]/            # Locale-prefixed routes (active)
│   │   ├── (auth)/         # Login, signup, password reset
│   │   └── (dashboard)/    # Main application
│   └── (auth)/ & (dashboard)/  # Legacy routes (deprecated)
├── actions/                 # Server Actions (mutations)
├── components/              # React components
├── lib/
│   ├── supabase/           # Supabase clients (server, client, admin)
│   └── rate-limit.ts       # Rate limiting for auth endpoints
├── types/
│   └── database.ts         # Hand-maintained TypeScript types
├── messages/               # i18n translation files
├── middleware.ts           # Auth guards, locale detection, rate limiting
└── i18n.ts                # i18n configuration
```

---

## Key Concepts

### Authentication Flow

- Supabase handles email/password login and signup
- Password reset is supported via email
- Middleware (`middleware.ts`) protects routes and redirects unauthenticated users to `/[locale]/login`
- A `profiles` table auto-syncs with `auth.users` via a PostgreSQL trigger

### Data Management

All mutations use **Server Actions** (`'use server'`). Pattern:
1. Authenticate the user
2. Ensure the user profile exists
3. Validate input with Zod
4. Execute Supabase queries or RPCs
5. Return `ActionResponse<T>` with success/error status
6. Revalidate affected routes

### Internationalization

Translation files live in `src/messages/{locale}.json`. When adding UI strings, update all four locale files (`en`, `tr`, `es`, `de`).

### Rate Limiting

In-memory rate limiting (5 req/min per IP) protects authentication endpoints. Note: this resets on server restart and only works on a single instance.

---

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

---

## License

This project is licensed under the [MIT License](LICENSE).
