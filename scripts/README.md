# Scripts

This directory contains utility scripts for database and development tasks.

## Available Scripts

### Database Scripts

#### `push-schema.js`
Push Prisma schema to Supabase database.

**Usage:**
```bash
node scripts/push-schema.js [DATABASE_PASSWORD]
```

Or run without password (will prompt):
```bash
node scripts/push-schema.js
```

**What it does:**
- Generates Prisma client
- Pushes schema to database
- Creates all tables and relationships

#### `push-schema.sh`
Bash version of the schema push script.

**Usage:**
```bash
./scripts/push-schema.sh [DATABASE_PASSWORD]
```

## NPM Scripts

You can also use npm scripts defined in `package.json`:

```bash
npm run db:generate    # Generate Prisma client
npm run db:push        # Push schema to database
npm run db:studio      # Open Prisma Studio
npm run db:push:supabase # Push schema with password prompt
```

## Prerequisites

- Node.js installed
- `.env` file with `DATABASE_URL` configured
- Supabase database accessible

## See Also

- [Prisma Setup Documentation](../docs/PRISMA_SETUP.md)
- [Supabase Setup Documentation](../docs/SUPABASE_SETUP.md)

