import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import JSZip from 'jszip';

export async function GET(request: Request, { params }: { params: { projectId: string } }) {
    try {
        const project = await prisma.project.findUnique({
            where: { id: params.projectId },
            include: {
                rooms: { include: { bgImage: true, hotspots: true, exits: true, entries: true, sprites: { include: { asset: true } } } },
                items: { include: { icon: true } },
                connections: true,
                events: { include: { conditions: true, results: true } },
                assets: true,
            }
        });

        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const zip = new JSZip();

        zip.file('data.json', JSON.stringify(project, null, 2));

        const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name} - Adventure Engine</title>
    <style>body { font-family: monospace; background: black; color: white; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; }</style>
</head>
<body>
    <div id="app">Loading...<br/>(Normally the engine JS would be injected here to parse data.json)</div>
    <script>
        fetch('data.json').then(r => r.json()).then(data => {
            document.getElementById('app').innerHTML = "<h1>" + data.name + "</h1><p>Export successful! Engine script required to parse " + data.rooms.length + " rooms.</p>";
        });
    </script>
</body>
</html>`;
        zip.file('index.html', indexHtml);
        zip.folder('assets');

        const zipBuffer = await zip.generateAsync({ type: 'uint8array' });

        return new NextResponse(Buffer.from(zipBuffer), {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${project.name.replace(/\s+/g, '_')}_export.zip"`
            }
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed Export' }, { status: 500 });
    }
}
