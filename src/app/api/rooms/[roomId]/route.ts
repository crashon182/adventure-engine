import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { roomId: string } }) {
    try {
        const room = await prisma.room.findUnique({
            where: { id: params.roomId },
            include: {
                bgImage: true,
                hotspots: true,
                exits: true,
                entries: true,
                sprites: { include: { asset: true } }
            }
        });
        if (!room) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(room);
    } catch (error) {
        console.error('API_ROOM_GET_ERROR:', error);
        return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { roomId: string } }) {
    try {
        const data = await request.json();
        const room = await prisma.room.update({
            where: { id: params.roomId },
            data: {
                name: data.name,
                bgImageId: data.bgImageId || null,
                x: data.x !== undefined ? data.x : undefined,
                y: data.y !== undefined ? data.y : undefined,
            }
        });
        return NextResponse.json(room);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
