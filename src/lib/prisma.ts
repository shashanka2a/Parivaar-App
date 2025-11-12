import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// Prisma Middleware - runs before queries
// Note: $use is not available in Edge runtime, so we conditionally apply it
if (typeof prisma.$use === 'function') {
  prisma.$use(async (params, next) => {
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
  prisma.$use(async (params, next) => {
    // Add timestamps automatically
    if (params.action === 'create' || params.action === 'update') {
      // Timestamps are handled by Prisma schema, but you can add custom logic here
    }
    
    return next(params);
  });

  // Error handling middleware
  prisma.$use(async (params, next) => {
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

