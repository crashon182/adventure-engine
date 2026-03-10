import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
    try {
        const data = await request.json();
        const hotspot = await prisma.hotspot.create({
            data: {
                roomId: params.roomId,
                name: data.name || 'New Hotspot',
                x: data.x || 100,
                y: data.y || 100,
                width: data.width || 100,
                height: data.height || 100,
                action: data.action || null,
                objectId: data.objectId || null,
                description: data.description || null,
            }
        });
        return NextResponse.json(hotspot);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
