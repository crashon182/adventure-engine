import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const settings = await prisma.globalSettings.findUnique({
            where: { id: 'default' },
        });

        return NextResponse.json({
            maintenanceMode: settings?.maintenanceMode || false,
            maintenanceMessage: settings?.maintenanceMessage || '',
        });
    } catch (error) {
        return NextResponse.json({ maintenanceMode: false }, { status: 500 });
    }
}
