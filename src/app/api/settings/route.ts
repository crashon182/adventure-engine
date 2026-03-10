import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        let settings = await prisma.globalSettings.findUnique({
            where: { id: 'default' },
        });

        if (!settings) {
            settings = await prisma.globalSettings.create({
                data: {
                    id: 'default',
                    maintenanceMode: false,
                    maintenanceMessage: '¡Estamos creando un nuevo y mágico motor de aventuras! Regresa muy pronto.',
                },
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Error fetching settings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { maintenanceMode, maintenanceMessage } = body;

        const settings = await prisma.globalSettings.upsert({
            where: { id: 'default' },
            update: {
                maintenanceMode,
                maintenanceMessage,
            },
            create: {
                id: 'default',
                maintenanceMode: !!maintenanceMode,
                maintenanceMessage: maintenanceMessage || '¡Estamos creando un nuevo y mágico motor de aventuras! Regresa muy pronto.',
            },
        });

        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Error updating settings' }, { status: 500 });
    }
}
