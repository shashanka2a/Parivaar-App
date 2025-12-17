import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Validate DATABASE_URL before creating Prisma client
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set! Please check your .env.local file.');
  console.error('   Expected: DATABASE_URL="postgresql://postgres:PASSWORD@db.frxpbnoornbecjutllfv.supabase.co:5432/postgres"');
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Prisma Middleware - runs before queries
// Note: $use is not available in Edge runtime, so we conditionally apply it
if ('$use' in prisma && typeof (prisma as any).$use === 'function') {
  (prisma as any).$use(async (params: any, next: any) => {
    const before = Date.now();
    
    // Logging middleware
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Prisma Query] ${params.model}.${params.action}`, {
        args: params.args,
      });
    }
    
    // Soft delete middleware (if needed in future)
    if (params.action === 'delete') {
      // Convert delete to update for soft deletes
      // params.action = 'update';
      // params.args['data'] = { deletedAt: new Date() };
    }
    
    // Query result modification
    const result = await next(params);
    
    const after = Date.now();
    
    // Performance logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Prisma Query] ${params.model}.${params.action} took ${after - before}ms`);
    }
    
    return result;
  });

  // Additional middleware for specific operations
  (prisma as any).$use(async (params: any, next: any) => {
    // Add timestamps automatically
    if (params.action === 'create' || params.action === 'update') {
      // Timestamps are handled by Prisma schema, but you can add custom logic here
    }
    
    return next(params);
  });

  // Error handling middleware
  (prisma as any).$use(async (params: any, next: any) => {
    try {
      return await next(params);
    } catch (error) {
      // Log errors
      console.error(`[Prisma Error] ${params.model}.${params.action}:`, error);
      
      // You can transform errors here if needed
      throw error;
    }
  });
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

