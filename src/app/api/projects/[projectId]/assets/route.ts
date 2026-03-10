import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
    try {
        const assets = await prisma.asset.findMany({
            where: { projectId: params.projectId },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(assets);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch assets' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { projectId: string } }) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;
        const name = data.get('name') as string;

        if (!file || !name) {
            return NextResponse.json({ error: 'File and name are required' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to public/uploads
        const uploadDir = join(process.cwd(), 'public', 'uploads', params.projectId);
        await mkdir(uploadDir, { recursive: true });

        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '');
        const uniqueFilename = `${Date.now()}-${safeName}`;
        const filepath = join(uploadDir, uniqueFilename);
        await writeFile(filepath, buffer);

        const fileUrl = `/uploads/${params.projectId}/${uniqueFilename}`;
        const type = file.type.startsWith('image') ? 'image' : file.type.startsWith('audio') ? 'audio' : 'other';

        const asset = await prisma.asset.create({
            data: {
                projectId: params.projectId,
                name: name,
                type: type,
                url: fileUrl,
            }
        });

        return NextResponse.json(asset);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to upload asset' }, { status: 500 });
    }
}
