import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { roomId: string } }) {
    try {
        const sprites = await prisma.sprite.findMany({
            where: { roomId: params.roomId },
            include: { asset: true }
        });
        return NextResponse.json(sprites);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sprites' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { roomId: string } }) {
    try {
        const data = await request.json();
        const sprite = await prisma.sprite.create({
            data: {
                roomId: params.roomId,
                assetId: data.assetId,
                name: data.name || 'New Sprite',
                x: data.x || 0,
                y: data.y || 0,
                width: data.width || 100,
                height: data.height || 100,
                objectId: data.objectId || null,
                description: data.description || null,
                zIndex: data.zIndex || 0,
            },
            include: { asset: true }
        });
        return NextResponse.json(sprite);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create sprite' }, { status: 500 });
    }
}
