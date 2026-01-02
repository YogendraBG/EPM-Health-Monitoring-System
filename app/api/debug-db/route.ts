
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET() {
    const dbUrl = process.env.DATABASE_URL || '';

    // Safely analyze the string structure
    const analyzeString = (str: string) => {
        if (!str) return "MISSING";
        const hasQuotes = str.startsWith('"') || str.startsWith("'");
        const hasSpaces = str.trim() !== str;
        const parts = str.split('@');
        const middle = parts.length > 1 ? parts[0].split(':') : [];
        const passwordPart = middle.length > 2 ? middle[2] : "N/A";

        return {
            length: str.length,
            startsWithQuote: hasQuotes,
            endsWithQuote: str.endsWith('"') || str.endsWith("'"),
            hasWhitespace: hasSpaces,
            atSymbolCount: str.split('@').length - 1,
            passwordStart: passwordPart !== "N/A" ? passwordPart.substring(0, 1) : "N/A",
            passwordEnd: passwordPart !== "N/A" ? passwordPart.slice(-1) : "N/A"
        };
    };

    const results: any = {
        diagnostics: {
            DATABASE_URL: analyzeString(dbUrl),
            DIRECT_URL: analyzeString(process.env.DIRECT_URL || '')
        },
        tests: []
    };

    // Test 1: Standard Pooler
    try {
        const prisma = new PrismaClient();
        await prisma.$connect();
        results.tests.push({ name: 'Standard Pooler', status: 'SUCCESS' });
        await prisma.$disconnect();
    } catch (err: any) {
        results.tests.push({ name: 'Standard Pooler', status: 'FAILED', error: err.message });
    }

    // Test 2: Try without pgbouncer=true (some newer Supabase projects don't need it)
    if (dbUrl.includes('pgbouncer=true')) {
        try {
            const cleanUrl = dbUrl.replace('?pgbouncer=true', '').replace('&pgbouncer=true', '');
            const prismaNoBounce = new PrismaClient({ datasources: { db: { url: cleanUrl } } });
            await prismaNoBounce.$connect();
            results.tests.push({ name: 'No Pgbouncer Param', status: 'SUCCESS' });
            await prismaNoBounce.$disconnect();
        } catch (err: any) {
            results.tests.push({ name: 'No Pgbouncer Param', status: 'FAILED', error: err.message });
        }
    }

    return NextResponse.json(results);
}
