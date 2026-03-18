import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PATCH(request: Request, { params }: { params: { projectId: string, connectionId: string } }) {
    try {
        const data = await request.json();
        const connection = await prisma.roomConnection.update({
            where: {
                id: params.connectionId,
                projectId: params.projectId
            },
            data: {
                direction: data.direction,
                locked: data.locked,
                requiredItemId: data.requiredItemId,
                scriptEvent: data.scriptEvent,
            }
        });
        return NextResponse.json(connection);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { projectId: string, connectionId: string } }) {
    try {
        await prisma.roomConnection.delete({
            where: {
                id: params.connectionId,
                projectId: params.projectId
            }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
