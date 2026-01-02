
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const environments = await prisma.environment.findMany({
            orderBy: { createdAt: 'asc' },
        });
        return NextResponse.json(environments);
    } catch (error) {
        console.error("Failed to fetch environments:", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { name, token } = await req.json();

        if (!name) {
            return new NextResponse('Missing name', { status: 400 });
        }

        const count = await prisma.environment.count();

        const environment = await prisma.environment.create({
            data: {
                name,
                token,
                order: count,
            },
        });

        return NextResponse.json(environment);
    } catch (error) {
        console.error("Failed to create environment:", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { id, name, token } = await req.json();

        if (!id) {
            return new NextResponse('Missing ID', { status: 400 });
        }

        const environment = await prisma.environment.update({
            where: { id },
            data: {
                name,
                token
            },
        });

        return NextResponse.json(environment);
    } catch (error) {
        console.error("Failed to update environment:", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return new NextResponse('Missing ID', { status: 400 });

        await prisma.environment.delete({ where: { id } });
        return new NextResponse('Deleted', { status: 200 });
    } catch (error) {
        return new NextResponse('Error', { status: 500 });
    }
}
