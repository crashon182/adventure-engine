import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
    try {
        const events = await prisma.event.findMany({
            where: { projectId: params.projectId },
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

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
    try {
        const event = await prisma.event.create({
            data: {
                projectId: params.projectId,
                name: 'New Event Rule',
                action: 'LOOK',
                targetId: null,
            }
        });
        return NextResponse.json(event);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
