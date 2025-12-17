# Parivaar - Family Tree Builder

A modern, production-ready Next.js application for building and managing family trees.

## Features

- 🌳 Interactive family tree visualization
- 👥 Add and manage family members
- 📊 Explore and search family members
- 🎨 Multiple theme options
- 📱 Responsive design
- 🔗 Share family trees
- 💾 Local storage persistence

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI + shadcn/ui
- **Animations**: Framer Motion
- **State Management**: React Context API
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── docs/                 # Documentation files
│   ├── PRISMA_SETUP.md   # Prisma database setup
│   ├── SUPABASE_SETUP.md # Supabase integration
│   ├── AUTH_TESTING.md   # Authentication testing
│   └── ...              # Other documentation
├── scripts/              # Utility scripts
│   ├── push-schema.js   # Push Prisma schema
│   └── push-schema.sh   # Bash version
├── tests/                # Test scripts
│   ├── test-connection.js # Connection tests
│   ├── test-auth.sh      # Auth flow tests
│   └── test-flow.sh      # Routing tests
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout with metadata
│   │   ├── page.tsx      # Home page
│   │   ├── onboarding/   # Onboarding flow
│   │   ├── trees/        # Family trees manager
│   │   ├── dashboard/    # Main dashboard
│   │   ├── explore/      # Explore family members
│   │   ├── settings/     # Settings page
│   │   └── api/          # API routes
│   │       ├── auth/     # Authentication endpoints
│   │       └── test-*    # Test endpoints
│   ├── components/       # React components
│   │   ├── ui/          # UI components (shadcn/ui)
│   │   └── ...          # Feature components
│   ├── lib/             # Utilities and context
│   │   ├── prisma.ts    # Prisma client
│   │   ├── supabase.ts  # Supabase client
│   │   ├── middleware-utils.ts # Middleware helpers
│   │   └── state-context.tsx # Global state
│   ├── middleware.ts    # Next.js middleware
│   └── styles/          # Global styles
├── prisma/              # Prisma schema
│   └── schema.prisma    # Database schema
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── tsconfig.json        # TypeScript configuration
```

## Key Features

### Routing
- All routes converted from React Router to Next.js App Router
- Dynamic routes for shared trees: `/shared/[shareId]` and `/[familySlug]`

### State Management
- Global state managed via React Context API
- LocalStorage persistence for user data and family trees

### SEO & Metadata
- Comprehensive metadata in `app/layout.tsx`
- Open Graph and Twitter Card support
- Optimized font loading with `next/font`

### Performance
- Client components marked with `'use client'`
- Server components where possible
- Optimized bundle size

## Development Notes

- All client-side components use `'use client'` directive
- Navigation uses Next.js `useRouter` from `next/navigation`
- Animations use Framer Motion (replaced from `motion/react`)
- All imports use path aliases (`@/components`, `@/lib`)

## Documentation

- **[Setup Guides](./docs/)** - Database and Supabase setup
- **[Testing Guides](./docs/)** - How to test the application
- **[Architecture](./docs/)** - Application flow and routing

## Scripts

- **[Database Scripts](./scripts/)** - Prisma schema management
- **[Test Scripts](./tests/)** - Automated testing utilities

## License

Private - All rights reserved
