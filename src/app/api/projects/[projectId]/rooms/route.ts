import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
    try {
        const rooms = await prisma.room.findMany({
            where: { projectId: params.projectId },
            include: {
                bgImage: true,
                hotspots: true,
                exits: true,
                entries: true,
                sprites: { include: { asset: true } }
            }
        });
        return NextResponse.json(rooms);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
    try {
        const { name } = await request.json();
        const room = await prisma.room.create({
            data: {
                projectId: params.projectId,
                name,
            }
        });
        return NextResponse.json(room);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
    }
}
