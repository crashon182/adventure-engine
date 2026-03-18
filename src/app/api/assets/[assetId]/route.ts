import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function DELETE(request: Request, { params }: { params: { assetId: string } }) {
    try {
        // 1. Find the asset to get the file URL
        const asset = await prisma.asset.findUnique({
            where: { id: params.assetId }
        });

        if (!asset) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
        }

        // 2. Delete from Database first to ensure no foreign key issues
        await prisma.asset.delete({
            where: { id: params.assetId }
        });

        // 3. Delete from Disk (if it succeeds in DB)
        try {
            // URL shape: /uploads/projectId/filename
            const urlParts = asset.url.split('/');
            const filename = urlParts[urlParts.length - 1];
            const projectId = urlParts[urlParts.length - 2];

            if (filename && projectId) {
                const filepath = join(process.cwd(), 'public', 'uploads', projectId, filename);
                await unlink(filepath);
                console.log(`Deleted file from disk: ${filepath}`);
            }
        } catch (fileError) {
            console.error('Failed to delete file from disk, but DB record was removed:', fileError);
            // We do not fail the request if file deletion fails (e.g. file already deleted or absolute path issue)
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete asset error:', error);
        if (error.code === 'P2003') {
            return NextResponse.json({
                error: 'Cannot delete asset because it is used by a Room, Sprite, or Item. Please remove references first.'
            }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to delete asset' }, { status: 500 });
    }
}
