import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
    try {
        const connections = await prisma.roomConnection.findMany({
            where: { projectId: params.projectId }
        });
        return NextResponse.json(connections);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch connections' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
    try {
        const data = await request.json();
        const connection = await prisma.roomConnection.create({
            data: {
                projectId: params.projectId,
                fromRoomId: data.fromRoomId,
                toRoomId: data.toRoomId,
                direction: data.direction,
                locked: data.locked || false,
                requiredItemId: data.requiredItemId,
                scriptEvent: data.scriptEvent,
            }
        });
        return NextResponse.json(connection);
    } catch (error) {
        console.error('API_CONNECTION_POST_ERROR:', error);
        return NextResponse.json({ error: 'Failed to create connection' }, { status: 500 });
    }
}
