import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    return NextResponse.json({
        session: session,
        role: (session as any)?.user?.role || (session as any)?.role || "no role found"
    });
}
