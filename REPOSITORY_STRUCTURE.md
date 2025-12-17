# Repository Structure

This document describes the organized structure of the Parivaar application repository.

## Directory Structure

```
Parivaar App/
├── docs/                      # 📚 Documentation
│   ├── README.md             # Documentation index
│   ├── PRISMA_SETUP.md       # Prisma database setup
│   ├── SUPABASE_SETUP.md     # Supabase integration
│   ├── VERCEL_ENV_VARS.md    # Vercel environment variables
│   ├── AUTH_TESTING.md       # Authentication testing guide
│   ├── TEST_CONNECTION.md    # Connection testing guide
│   ├── PUSH_SCHEMA.md        # Schema push instructions
│   ├── APP_FLOW_EXPLANATION.md # Complete app flow
│   └── FLOW_SUMMARY.md       # Quick flow reference
│
├── scripts/                   # 🔧 Utility Scripts
│   ├── README.md             # Scripts documentation
│   ├── push-schema.js        # Push Prisma schema (Node.js)
│   └── push-schema.sh        # Push Prisma schema (Bash)
│
├── tests/                     # 🧪 Test Scripts
│   ├── README.md             # Tests documentation
│   ├── test-connection.js    # Test Supabase/Prisma connections
│   ├── test-auth.sh          # Test authentication flow
│   └── test-flow.sh          # Test routing and middleware
│
├── src/                       # 💻 Source Code
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   └── test-*/       # Test endpoints
│   │   ├── dashboard/        # Dashboard page
│   │   ├── trees/            # Trees manager page
│   │   ├── explore/          # Explore page
│   │   ├── settings/         # Settings page
│   │   ├── onboarding/       # Onboarding page
│   │   └── ...               # Other pages
│   ├── components/           # React components
│   │   ├── ui/               # UI components (shadcn/ui)
│   │   └── ...               # Feature components
│   ├── lib/                  # Utilities and libraries
│   │   ├── prisma.ts         # Prisma client
│   │   ├── supabase.ts       # Supabase client
│   │   ├── supabase-server.ts # Server Supabase client
│   │   ├── middleware-utils.ts # Middleware helpers
│   │   └── state-context.tsx # Global state
│   ├── middleware.ts         # Next.js middleware
│   └── styles/               # Global styles
│
├── prisma/                    # 🗄️ Database
│   └── schema.prisma         # Prisma schema
│
├── .env                       # Environment variables (not in git)
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore rules
├── README.md                 # Main project README
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── next.config.ts            # Next.js configuration
└── tailwind.config.ts        # Tailwind CSS configuration
```

## Directory Descriptions

### `/docs` - Documentation
All project documentation including:
- Setup guides (Prisma, Supabase)
- Testing guides
- Architecture explanations
- Deployment instructions

**Access:** See [docs/README.md](./docs/README.md)

### `/scripts` - Utility Scripts
Development and deployment utility scripts:
- Database schema management
- Deployment helpers
- Development tools

**Access:** See [scripts/README.md](./scripts/README.md)

### `/tests` - Test Scripts
Automated testing scripts:
- Connection tests
- Authentication flow tests
- Routing tests
- Integration tests

**Access:** See [tests/README.md](./tests/README.md)

### `/src` - Source Code
Main application source code:
- Next.js App Router pages and API routes
- React components
- Utility libraries
- Middleware and routing

### `/prisma` - Database Schema
Prisma ORM schema and migrations:
- Database models
- Relationships
- Migrations

## Quick Commands

### Documentation
```bash
# View documentation index
cat docs/README.md

# View specific guide
cat docs/SUPABASE_SETUP.md
```

### Scripts
```bash
# Push Prisma schema
npm run db:push:supabase
# or
node scripts/push-schema.js

# Open Prisma Studio
npm run db:studio
```

### Tests
```bash
# Test connections
npm run test:connection

# Test authentication
npm run test:auth

# Test routing flow
npm run test:flow
```

## File Organization Principles

1. **Documentation** → `docs/` folder
   - All `.md` files except main `README.md`
   - Organized by topic
   - Easy to find and maintain

2. **Scripts** → `scripts/` folder
   - Utility scripts for development
   - Database management
   - Deployment helpers

3. **Tests** → `tests/` folder
   - All test scripts
   - Automated testing
   - Integration tests

4. **Source Code** → `src/` folder
   - Application code
   - Components
   - Libraries

5. **Configuration** → Root directory
   - `package.json`
   - `tsconfig.json`
   - `next.config.ts`
   - `.env.example`

## Benefits of This Structure

✅ **Clear Organization** - Easy to find files
✅ **Better Maintainability** - Related files grouped together
✅ **Scalability** - Easy to add new docs/tests/scripts
✅ **Professional** - Follows industry best practices
✅ **Documentation** - Each folder has its own README

## Adding New Files

### Adding Documentation
```bash
# Add new documentation
touch docs/NEW_FEATURE.md
# Update docs/README.md to include it
```

### Adding Scripts
```bash
# Add new script
touch scripts/new-script.js
chmod +x scripts/new-script.js
# Update scripts/README.md
```

### Adding Tests
```bash
# Add new test
touch tests/test-new-feature.sh
chmod +x tests/test-new-feature.sh
# Update tests/README.md
```

