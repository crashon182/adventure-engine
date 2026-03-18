import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: Request, { params }: { params: { projectId: string, filename: string } }) {
    try {
        const filepath = join(process.cwd(), 'public', 'uploads', params.projectId, params.filename);
        const buffer = await readFile(filepath);

        // Guess content type from filename
        const ext = params.filename.split('.').pop()?.toLowerCase() || '';
        let contentType = 'application/octet-stream';

        if (['jpg', 'jpeg'].includes(ext)) contentType = 'image/jpeg';
        else if (ext === 'png') contentType = 'image/png';
        else if (ext === 'gif') contentType = 'image/gif';
        else if (ext === 'webp') contentType = 'image/webp';
        else if (ext === 'svg') contentType = 'image/svg+xml';
        else if (ext === 'mp3') contentType = 'audio/mpeg';
        else if (ext === 'wav') contentType = 'audio/wav';
        else if (ext === 'ogg') contentType = 'audio/ogg';

        return new Response(buffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
}
