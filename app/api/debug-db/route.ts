
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    const results: any = {
        urls: {
            DATABASE_URL: process.env.DATABASE_URL ? "SET (Starts: " + process.env.DATABASE_URL.substring(0, 5) + "... Ends: " + process.env.DATABASE_URL.slice(-5) + ")" : "MISSING",
            DIRECT_URL: process.env.DIRECT_URL ? "SET (Starts: " + process.env.DIRECT_URL.substring(0, 5) + "... Ends: " + process.env.DIRECT_URL.slice(-5) + ")" : "MISSING",
        },
        tests: []
    };

    // Test 1: Main Prisma Instance (Pooler)
    try {
        const prisma = new PrismaClient();
        const start = Date.now();
        await prisma.$connect();
        const count = await prisma.environment.count();
        results.tests.push({ name: 'Main Client (Pooler)', status: 'SUCCESS', count, time: Date.now() - start });
        await prisma.$disconnect();
    } catch (err: any) {
        results.tests.push({ name: 'Main Client (Pooler)', status: 'FAILED', error: err.message });
    }

    // Test 2: Direct Client
    if (process.env.DIRECT_URL) {
        try {
            const directPrisma = new PrismaClient({
                datasources: { db: { url: process.env.DIRECT_URL } }
            });
            const start = Date.now();
            await directPrisma.$connect();
            const count = await directPrisma.environment.count();
            results.tests.push({ name: 'Direct Client', status: 'SUCCESS', count, time: Date.now() - start });
            await directPrisma.$disconnect();
        } catch (err: any) {
            results.tests.push({ name: 'Direct Client', status: 'FAILED', error: err.message });
        }
    }

    return NextResponse.json(results);
}
