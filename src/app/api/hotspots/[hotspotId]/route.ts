import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { hotspotId: string } }) {
    try {
        const data = await request.json();
        const hotspot = await prisma.hotspot.update({
            where: { id: params.hotspotId },
            data: {
                name: data.name,
                x: data.x,
                y: data.y,
                width: data.width,
                height: data.height,
                action: data.action,
                objectId: data.objectId,
                description: data.description,
                visible: data.visible !== undefined ? data.visible : undefined
            }
        });
        return NextResponse.json(hotspot);
    } catch (error) {
        console.error('Update hotspot error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { hotspotId: string } }) {
    try {
        await prisma.hotspot.delete({
            where: { id: params.hotspotId }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
