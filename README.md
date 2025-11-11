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
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout with metadata
│   │   ├── page.tsx      # Home page
│   │   ├── onboarding/   # Onboarding flow
│   │   ├── trees/        # Family trees manager
│   │   ├── dashboard/    # Main dashboard
│   │   ├── explore/      # Explore family members
│   │   └── settings/      # Settings page
│   ├── components/      # React components
│   │   ├── ui/          # UI components (shadcn/ui)
│   │   └── ...          # Feature components
│   ├── lib/             # Utilities and context
│   │   └── state-context.tsx  # Global state management
│   └── styles/          # Global styles
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

## License

Private - All rights reserved
