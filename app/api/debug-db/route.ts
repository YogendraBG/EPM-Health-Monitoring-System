
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    const results: any = {
        env: {
            DATABASE_URL_SET: !!process.env.DATABASE_URL,
            DIRECT_URL_SET: !!process.env.DIRECT_URL,
            NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
            NODE_ENV: process.env.NODE_ENV,
        },
        prisma: {
            url_part: process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1] : 'NONE'
        },
        connectionTest: 'Pending'
    };

    try {
        const count = await prisma.environment.count();
        results.connectionTest = 'SUCCESS';
        results.count = count;
    } catch (err: any) {
        results.connectionTest = 'FAILED';
        results.error = err.message;
        results.errorStack = err.stack;
    }

    return NextResponse.json(results);
}
