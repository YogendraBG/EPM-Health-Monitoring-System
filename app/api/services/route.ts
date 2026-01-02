
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { name, url, token, environmentId } = await req.json();

        if (!name || !url || !environmentId) {
            return new NextResponse('Missing required fields', { status: 400 });
        }

        const service = await prisma.service.create({
            data: {
                name,
                url,
                token,
                environmentId
            },
        });

        return NextResponse.json(service);
    } catch (error) {
        console.error("Failed to create service:", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return new NextResponse('Missing ID', { status: 400 });

        await prisma.service.delete({ where: { id } });
        return new NextResponse('Deleted', { status: 200 });
    } catch (error) {
        return new NextResponse('Error', { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const { id, name, url, token } = await req.json();

        if (!id) {
            return new NextResponse('Missing ID', { status: 400 });
        }

        const service = await prisma.service.update({
            where: { id },
            data: {
                name,
                url,
                token
            },
        });

        return NextResponse.json(service);
    } catch (error) {
        console.error("Failed to update service:", error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
