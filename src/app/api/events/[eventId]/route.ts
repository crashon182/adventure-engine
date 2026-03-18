import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { eventId: string } }) {
    try {
        const data = await request.json();

        // Update main event fields
        await prisma.event.update({
            where: { id: params.eventId },
            data: {
                name: data.name,
                action: data.action,
                targetId: data.targetId,
                secondaryTargetId: data.secondaryTargetId
            }
        });

        // Update conditions (naive replace pattern for simplicity)
        await prisma.eventCondition.deleteMany({ where: { eventId: params.eventId } });
        if (data.conditions && data.conditions.length > 0) {
            await prisma.eventCondition.createMany({
                data: data.conditions.map((c: any) => ({
                    eventId: params.eventId,
                    type: c.type,
                    targetId: c.targetId,
                    value: c.value
                }))
            });
        }

        // Update results
        await prisma.eventResult.deleteMany({ where: { eventId: params.eventId } });
        if (data.results && data.results.length > 0) {
            await prisma.eventResult.createMany({
                data: data.results.map((r: any) => ({
                    eventId: params.eventId,
                    type: r.type,
                    targetId: r.targetId,
                    value: r.value
                }))
            });
        }

        const updated = await prisma.event.findUnique({
            where: { id: params.eventId },
            include: { conditions: true, results: true }
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { eventId: string } }) {
    try {
        await prisma.event.delete({ where: { id: params.eventId } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
