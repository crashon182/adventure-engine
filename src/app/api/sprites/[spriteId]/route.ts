import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(request: Request, { params }: { params: { spriteId: string } }) {
    try {
        const data = await request.json();

        // Build update object only with provided fields
        const updateData: any = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.assetId !== undefined) updateData.assetId = data.assetId;
        if (data.x !== undefined) updateData.x = data.x;
        if (data.y !== undefined) updateData.y = data.y;
        if (data.width !== undefined) updateData.width = data.width;
        if (data.height !== undefined) updateData.height = data.height;
        if (data.objectId !== undefined) updateData.objectId = data.objectId;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.zIndex !== undefined) updateData.zIndex = data.zIndex;
        if (data.visible !== undefined) updateData.visible = data.visible;

        const sprite = await prisma.sprite.update({
            where: { id: params.spriteId },
            data: updateData,
            include: { asset: true }
        });
        return NextResponse.json(sprite);
    } catch (error) {
        console.error('Update sprite error:', error);
        return NextResponse.json({ error: 'Failed to update sprite' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { spriteId: string } }) {
    try {
        await prisma.sprite.delete({
            where: { id: params.spriteId }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete sprite' }, { status: 500 });
    }
}
