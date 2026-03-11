import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getToken } from "next-auth/jwt";

// GET /api/admin/users - List all users
export async function GET(req: any) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || (token as any).role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// PATCH /api/admin/users - Update user role
export async function PATCH(req: any) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token || (token as any).role !== 'ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, role } = await req.json();

        if (!id || !role) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
