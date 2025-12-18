import { NextResponse } from 'next/server';
import { query } from '@/lib/db-pooler';

export const runtime = 'nodejs';

/**
 * Example endpoint demonstrating raw SQL queries using the pooler
 * 
 * This shows how to use DATABASE_URL (pooler) for raw SQL queries.
 * Prisma uses DIRECT_URL (direct connection) - see other API routes.
 */
export async function GET() {
  try {
    // Example 1: Simple query
    const users = await query<{ id: string; name: string; email: string }>(
      'SELECT id, name, email FROM users LIMIT 10'
    );

    // Example 2: Parameterized query
    const trees = await query<{ id: string; name: string; member_count: number }>(
      `SELECT 
        ft.id, 
        ft.name,
        COUNT(p.id) as member_count
      FROM family_trees ft
      LEFT JOIN persons p ON p."familyTreeId" = ft.id
      GROUP BY ft.id, ft.name
      LIMIT 10`
    );

    // Example 3: Aggregation
    const stats = await query<{ total_users: number; total_trees: number; total_persons: number }>(
      `SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM family_trees) as total_trees,
        (SELECT COUNT(*) FROM persons) as total_persons`
    );

    return NextResponse.json({
      success: true,
      data: {
        users,
        trees,
        stats: stats[0] || null,
      },
      note: 'These queries use the pooler (DATABASE_URL, port 6543). Prisma uses DIRECT_URL (port 5432).',
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: {
        code: error.code,
        tip: 'Make sure DATABASE_URL is set to the pooler connection string',
      },
    }, { status: 500 });
  }
}

