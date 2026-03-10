import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { roomId: string } }) {
    try {
        const events = await prisma.event.findMany({
            where: { roomId: params.roomId },
            include: {
                conditions: true,
                results: true
            }
        });
        return NextResponse.json(events);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
    try {
        const room = await prisma.room.findUnique({
            where: { id: params.roomId },
            select: { projectId: true }
        });

        if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });

        const event = await prisma.event.create({
            data: {
                projectId: room.projectId,
                roomId: params.roomId,
                name: 'New Room Event',
                action: 'LOOK',
                targetId: null,
            }
        });
        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
