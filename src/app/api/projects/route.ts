import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    try {
        const session = (await getServerSession(authOptions)) as any;

        // Si no hay sesión, no devolvemos proyectos (o podríamos devolver públicos)
        if (!session) {
            return NextResponse.json([]);
        }

        // Si es ADMIN ve todos, si es USER solo los suyos
        const where = session.role === 'ADMIN' ? {} : { userId: session.id };

        const projects = await prisma.project.findMany({
            where,
            orderBy: { updatedAt: 'desc' }
        });
        return NextResponse.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = (await getServerSession(authOptions)) as any;

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, description } = body;

        const project = await prisma.project.create({
            data: {
                name,
                description,
                userId: session.id
            }
        });

        return NextResponse.json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
    }
}
