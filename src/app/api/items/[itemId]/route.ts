import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { itemId: string } }) {
    try {
        const data = await request.json();
        const item = await prisma.item.update({
            where: { id: params.itemId },
            data: {
                name: data.name,
                description: data.description,
                iconId: data.iconId || null,
            }
        });
        return NextResponse.json(item);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { itemId: string } }) {
    try {
        await prisma.item.delete({ where: { id: params.itemId } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
