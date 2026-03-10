import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
    try {
        const items = await prisma.item.findMany({
            where: { projectId: params.projectId },
            include: { icon: true }
        });
        return NextResponse.json(items);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
    try {
        const data = await request.json();
        const item = await prisma.item.create({
            data: {
                projectId: params.projectId,
                name: data.name || 'New Item',
                description: data.description || '',
                iconId: data.iconId || null,
            }
        });
        return NextResponse.json(item);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
